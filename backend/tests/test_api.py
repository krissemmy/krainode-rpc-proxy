"""Smoke tests for KraiNode API endpoints."""

import pytest
import httpx
from fastapi.testclient import TestClient

from app.main import app
from app.config import reload_settings


@pytest.fixture
def client():
    """Create test client."""
    return TestClient(app)


@pytest.fixture
def settings():
    """Get test settings."""
    return reload_settings()


class TestChainsEndpoint:
    """Test /api/chains endpoint."""
    
    def test_get_chains(self, client):
        """Test getting available chains."""
        response = client.get("/api/chains")
        assert response.status_code == 200
        
        data = response.json()
        assert "chains" in data
        assert isinstance(data["chains"], list)
        assert len(data["chains"]) > 0
        
        # Check chain structure
        chain = data["chains"][0]
        assert "slug" in chain
        assert "apiUrl" in chain
        assert chain["apiUrl"].startswith("/api/rpc/")
        assert chain["apiUrl"].endswith("/json")
    
    def test_get_chains_details(self, client):
        """Test getting detailed chain information."""
        response = client.get("/api/chains/details")
        assert response.status_code == 200
        
        data = response.json()
        assert "chains" in data
        assert isinstance(data["chains"], list)
        assert len(data["chains"]) > 0
        
        # Check chain structure
        chain = data["chains"][0]
        assert "name" in chain
        assert "networks" in chain
        assert isinstance(chain["networks"], list)
        
        if chain["networks"]:
            network = chain["networks"][0]
            assert "name" in network
            assert "providers" in network
            assert "apiUrl" in network
            assert isinstance(network["providers"], list)
            
            if network["providers"]:
                provider = network["providers"][0]
                assert "name" in provider
                assert "url" in provider


class TestPingEndpoint:
    """Test /api/rpc/{chain}/ping endpoint."""
    
    def test_ping_ethereum(self, client):
        """Test pinging ethereum chain."""
        response = client.get("/api/rpc/ethereum-mainnet/ping")
        assert response.status_code == 200
        
        data = response.json()
        assert "ok" in data
        assert "durationMs" in data
        assert isinstance(data["durationMs"], int)
        
        if data["ok"]:
            assert "blockNumber" in data
            assert data["blockNumber"].startswith("0x")
        else:
            assert "error" in data
    
    # def test_ping_invalid_chain(self, client):
    #     """Test pinging invalid chain."""
    #     response = client.get("/api/rpc/invalid/ping")
    #     print(response.status_code)
    #     assert response.status_code != 200


class TestRpcProxy:
    """Test /api/rpc/{chain}/json endpoint."""
    
    def test_eth_block_number(self, client):
        """Test eth_blockNumber request."""
        payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "eth_blockNumber",
            "params": []
        }
        
        response = client.post("/api/rpc/ethereum-mainnet/json", json=payload)
        assert response.status_code == 200
        
        data = response.json()
        assert "jsonrpc" in data
        assert data["jsonrpc"] == "2.0"
        assert "id" in data
        assert data["id"] == 1
        
        if "result" in data:
            assert data["result"].startswith("0x")
        elif "error" in data:
            assert "code" in data["error"]
            assert "message" in data["error"]
        
        # Check metadata
        assert "meta" in data
        assert "durationMs" in data["meta"]
        assert isinstance(data["meta"]["durationMs"], int)
    
    def test_invalid_json_rpc(self, client):
        """Test invalid JSON-RPC request."""
        payload = {
            "jsonrpc": "1.0",  # Invalid version
            "id": 1,
            "method": "eth_blockNumber",
            "params": []
        }
        
        response = client.post("/api/rpc/ethereum-mainnet/json", json=payload)
        assert response.status_code == 400
        
        data = response.json()
        assert "error" in data
        assert data["error"]["code"] == -32600
    
    def test_invalid_chain(self, client):
        """Test request to invalid chain."""
        payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "eth_blockNumber",
            "params": []
        }
        
        response = client.post("/api/rpc/invalid/json", json=payload)
        assert response.status_code == 404


class TestHealthCheck:
    """Test health check endpoint."""
    
    def test_health_check(self, client):
        """Test health check endpoint."""
        response = client.get("/healthz")
        assert response.status_code == 200
        
        data = response.json()
        assert data["ok"] is True
        assert "service" in data
        assert data["service"] == "krainode"


class TestMetrics:
    """Test metrics endpoint."""
    
    def test_metrics_endpoint(self, client):
        """Test metrics endpoint."""
        response = client.get("/metrics")
        assert response.status_code == 200
        assert response.headers["content-type"] == "text/plain; version=0.0.4; charset=utf-8"
        
        # Check for some expected metrics
        content = response.text
        assert "krainode_requests_total" in content
        assert "krainode_request_duration_ms" in content


# class TestRateLimiting:
#     """Test rate limiting functionality."""
    
#     def test_rate_limiting(self, client, settings):
#         """Test rate limiting by making many requests."""
#         payload = {
#             "jsonrpc": "2.0",
#             "id": 1,
#             "method": "eth_blockNumber",
#             "params": []
#         }
        
#         # Make requests up to the rate limit
#         rate_limit = int(settings.rate_limit_rps)
#         success_count = 0
#         rate_limited_count = 0
        
#         for i in range(rate_limit + 2):
#             response = client.post("/api/rpc/ethereum-mainnet/json", json=payload)
            
#             if response.status_code == 200:
#                 success_count += 1
#             elif response.status_code == 429:
#                 rate_limited_count += 1
#                 # Check rate limit headers
#                 assert "Retry-After" in response.headers
#                 assert "X-RateLimit-Limit" in response.headers
#                 break
        
#         # Should have some successful requests and eventually hit rate limit
#         assert success_count > 0
#         assert rate_limited_count > 0
