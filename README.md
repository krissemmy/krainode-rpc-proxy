# KraiNode RPC Proxy

**Community JSON-RPC proxy with rate limiting and metrics.**

KraiNode RPC Proxy is a lightweight, production-ready JSON-RPC proxy that provides rate limiting, monitoring, and secure forwarding for blockchain RPC endpoints. Perfect for developers and teams who need reliable RPC access without exposing upstream URLs. This repo contains the backend code for the community and anyone to use.
👉 Live Playground: [https://krainode.krissemmy.com/playground](https://krainode.krissemmy.com/playground)
---

## ✨ Features

- 🛡️ **Server-side Proxy**: Keep upstream URLs private, expose only your KraiNode endpoints
- ⚡ **Rate Limiting**: Per-IP per-chain rate limiting with configurable limits
- 📊 **Metrics & Monitoring**: Prometheus metrics and structured JSON logging
- 🐳 **Docker Ready**: Single-container deployment with docker-compose
- 🔧 **Easy Configuration**: Environment-based configuration for chains and limits
- 📈 **Production Ready**: Health checks, structured logging, and monitoring

## 🚀 Quick Start

### Using Docker Compose (Recommended)

1. **Clone and setup**:
   ```bash
   git clone https://github.com/krissemmy/krainode-rpc-proxy.git
   cd krainode-rpc-proxy
   cp env.example .env
   ```

2. **Configure your chains** (edit `.env`):
   ```bash
   # Add your upstream RPC URLs, u can use public urls or ur private node urls
   CHAINS_JSON={"ethereum":"https://ethereum-rpc.publicnode.com","arbitrum":"https://arb-mainnet.g.alchemy.com/v2/YOUR_KEY"}
   ```

3. **Start the service**:
   ```bash
   docker compose up --build
   ```

4. **Access the API**:
   - API: http://localhost:8000
   - Health Check: http://localhost:8000/healthz
   - Metrics: http://localhost:8000/metrics
   - Documentation: http://localhost:8000/docs

## 📋 API Usage

### Basic JSON-RPC Request

```bash
curl -X POST http://localhost:8000/api/rpc/ethereum/json \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "eth_blockNumber",
    "params": []
  }'
```

### Ping a Chain

```bash
curl http://localhost:8000/api/rpc/ethereum/ping
```

### Get Available Chains

```bash
curl http://localhost:8000/api/chains
```

### Get API Information

```bash
curl http://localhost:8000/
```

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SERVICE_NAME` | `krainode` | Service name for logging |
| `LOG_LEVEL` | `INFO` | Logging level (DEBUG, INFO, WARNING, ERROR) |
| `ALLOWED_ORIGINS` | `["*"]` | CORS allowed origins |
| `RATE_LIMIT_RPS` | `5` | Rate limit (requests per second per IP per chain) |
| `CHAINS_JSON` | `{"ethereum":"https://ethereum-rpc.publicnode.com"}` | Chain configuration |
| `REQUEST_TIMEOUT_SECONDS` | `20` | Upstream request timeout |

### Adding New Chains

Edit your `.env` file to add more chains:

```bash
CHAINS_JSON={"ethereum":"https://ethereum-rpc.publicnode.com","polygon":"https://polygon-rpc.publicnode.com"}
```

Restart the service and the new chains will be available immediately.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Users        │───▶│   KraiNode      │───▶│  Upstream RPC   │
│                 │    │   (Proxy)       │    │   (Private)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Monitoring    │
                       │ (Prometheus +   │
                       │   Grafana)      │
                       └─────────────────┘
```

### Components

- **FastAPI Backend**: Handles RPC proxying, rate limiting, and metrics
- **Prometheus**: Metrics collection and storage
- **Grafana**: Metrics visualization and alerting (optional)

## 📊 API Endpoints

### RPC Proxy
- `POST /api/rpc/{chain}/json` - Proxy JSON-RPC requests
- `GET /api/rpc/{chain}/ping` - Ping chain with eth_blockNumber

### Management
- `GET /api/chains` - List available chains
- `GET /healthz` - Health check
- `GET /metrics` - Prometheus metrics
- `GET /` - API information and available endpoints

## 📈 Metrics

KraiNode exposes Prometheus metrics at `/metrics`:

- `krainode_requests_total{chain,method,status_code}` - Request counter
- `krainode_request_duration_ms{chain,method}` - Request duration histogram
- `krainode_errors_total{chain,method,error_type}` - Error counter
- `krainode_rate_limit_hits_total{chain,client_ip}` - Rate limit hits

## ⚡ Rate Limiting

Rate limiting is applied per IP address per chain:

- Default: 5 requests per second per IP per chain
- Configurable via `RATE_LIMIT_RPS` environment variable
- Returns HTTP 429 with `Retry-After` header when exceeded
- Headers include rate limit information:
  - `X-RateLimit-Limit`: Rate limit per second
  - `X-RateLimit-Remaining`: Remaining requests in current window
  - `X-RateLimit-Reset`: Time when limit resets


## 🌐 Supported Chains

Currently configured on env file to PublicNode for:

- Ethereum Mainnet  
- Base Mainnet  
- Celo Mainnet  
- Avail Mainnet  
- Blast Mainnet  
- Mantle Mainnet  
- Linea Mainnet  
- Sei EVM Mainnet  
- Scroll Mainnet  
- Arbitrum One  
- Avalanche C-Chain  
- Gnosis Mainnet  
- Unichain Mainnet 

### Running Tests

```bash
cd backend
pytest tests/ -v
```

### Code Quality

```bash
cd backend
black app/ tests/
isort app/ tests/
flake8 app/ tests/
mypy app/
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 🆘 Support

- GitHub Issues: [Report bugs and request features](https://github.com/krissemmy/krainode-rpc-proxy/issues)
- Documentation: [Full API documentation](http://localhost:8000/docs)

---

**Made with ❤️ for the blockchain community**