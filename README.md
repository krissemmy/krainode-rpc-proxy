# KraiNode RPC Proxy

**Production-ready JSON-RPC proxy with rate limiting, monitoring, and secure forwarding.**

KraiNode RPC Proxy is a complete solution that provides secure, rate-limited access to blockchain RPC endpoints. It includes a FastAPI backend with comprehensive monitoring, a React frontend with an interactive playground, and Docker-based deployment with Prometheus and Grafana monitoring.

👉 Live Playground: [https://krainode.krissemmy.com/playground](https://krainode.krissemmy.com/playground)

---

## ✨ Features

### Backend (FastAPI)
- 🛡️ **Server-side Proxy**: Keep upstream URLs private, expose only your KraiNode endpoints
- ⚡ **Rate Limiting**: Per-IP per-chain rate limiting with configurable limits
- 📊 **Metrics & Monitoring**: Prometheus metrics and structured JSON logging
- 🔧 **Easy Configuration**: Environment-based configuration for chains and limits
- 📈 **Production Ready**: Health checks, structured logging, and monitoring
- 🛡️ **Security Headers**: Comprehensive security headers via Caddy reverse proxy
- 📏 **Request Size Limits**: Protection against large request attacks

### Frontend (React + TypeScript)
- 🎮 **Interactive Playground**: Test JSON-RPC methods with a user-friendly interface
- 🔗 **Chain Selection**: Dynamically load available chains from backend
- 📝 **JSON Editor**: Syntax highlighting and validation for requests
- 🎯 **Method Presets**: Quick access to common Ethereum RPC methods
- 📱 **Responsive Design**: Mobile-friendly interface
- 🌙 **Theme Support**: Light/dark mode toggle

### Infrastructure
- 🐳 **Docker Ready**: Complete stack with docker-compose
- 📊 **Monitoring Stack**: Prometheus + Grafana for metrics visualization
- 🔒 **HTTPS Support**: Automatic SSL certificates via Caddy
- 🚀 **Production Ready**: Health checks, proper logging, and error handling

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose

### Development Setup

1. **Clone and Start development servers**:
   ```bash
   git clone https://github.com/krissemmy/krainode-rpc-proxy.git
   cd krainode-rpc-proxy
   make dev
   ```

### Available Commands

```bash
make help          # Show all available commands
make dev           # Start all service using the docker-compose-dev.yml file
make test         # Run test
make docker-down   # Stop Docker Compose
make clean         # Clean build artifacts. if running locally without docker
make status        # Check service status
```

### For production environment. Using Docker Compose (Recommended)

1. **Clone and setup**:
   ```bash
   git clone https://github.com/krissemmy/krainode-rpc-proxy.git
   cd krainode-rpc-proxy
   cp env.example .env
   ```

2. **Configure your ssl domain** (edit `.env`):
   ```bash
   # Set your domain for SSL certificates
   EMAIL=your-email@example.com
   API_HOST=your-domain.com
   
   # Generate a secure Grafana password
   GRAFANA_ADMIN_PASSWORD=your_secure_password_here
   ```

3. **Start the complete stack**:
   ```bash
   docker compose up --build
   ```

4. **Access the services**:
   - **Web UI**: http://localhost:8000 (or https://your-domain.com)
   - **Playground**: http://localhost:8000/playground
   - **API Docs**: http://localhost:8000/docs
   - **Health Check**: http://localhost:8000/healthz
   - **Metrics**: http://localhost:8000/metrics
   - **Prometheus**: http://localhost:9090
   - **Grafana**: http://localhost:3000 (admin/password from GRAFANA_ADMIN_PASSWORD)

## 📋 API Usage

### Using the Web Playground (Recommended)

1. Open http://localhost:8000/playground
2. Select a chain from the dropdown
3. Choose a method or enter a custom one
4. Fill in parameters and click "Send Request"
5. View the response with syntax highlighting

### Using cURL

#### Basic JSON-RPC Request
```bash
curl -X POST http://localhost:8000/api/rpc/ethereum-mainnet/json \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "eth_blockNumber",
    "params": []
  }'
```

#### Ping a Chain
```bash
curl http://localhost:8000/api/rpc/ethereum-mainnet/ping
```

#### Get Available Chains
```bash
curl http://localhost:8000/api/chains
```

#### Get API Information
```bash
curl http://localhost:8000/
```

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SERVICE_NAME` | `krainode` | Service name for logging |
| `LOG_LEVEL` | `INFO` | Logging level (DEBUG, INFO, WARNING, ERROR) |
| `ALLOWED_ORIGINS` | `["https://localhost:8000"]` | CORS allowed origins (security: not wildcard by default) |
| `RATE_LIMIT_RPS` | `5` | Rate limit (requests per second per IP per chain) |
| `CHAINS_JSON` | See env.example | Chain configuration (JSON string) |
| `REQUEST_TIMEOUT_SECONDS` | `20` | Upstream request timeout |
| `EMAIL` | `YOUR_EMAIL` | Email for SSL certificate registration |
| `API_HOST` | `YOUR_HOSTED_DOMAIN` | Domain for Caddy SSL certificates |
| `GRAFANA_ADMIN_PASSWORD` | `your_secure_password_here` | Grafana admin password |

### Adding New Chains

Edit your `.env` file to add more chains:

```bash
CHAINS_JSON={"ethereum-mainnet":"https://ethereum-rpc.publicnode.com","polygon-mainnet":"https://polygon-rpc.publicnode.com","arbitrum1":"https://arb-mainnet.g.alchemy.com/v2/YOUR_KEY"}
```

Restart the service and the new chains will be available immediately in both the API and the web playground.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Browser   │───▶│   Caddy         │───▶│   FastAPI       │
│   (React App)   │    │   (HTTPS/SSL)   │    │   (Backend)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │                        │
                              ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Monitoring    │    │  Upstream RPC   │
                       │ (Prometheus +   │    │   (Private)     │
                       │   Grafana)      │    │                 │
                       └─────────────────┘    └─────────────────┘
```

### Components

- **React Frontend**: Interactive playground and web interface
- **Caddy**: Reverse proxy with automatic HTTPS and security headers
- **FastAPI Backend**: Handles RPC proxying, rate limiting, and metrics
- **Prometheus**: Metrics collection and storage
- **Grafana**: Metrics visualization and dashboards

## 📊 API Endpoints

### Web Interface
- `GET /` - Home page with feature overview
- `GET /playground` - Interactive JSON-RPC testing interface
- `GET /team` - Team information page

### RPC Proxy
- `POST /api/rpc/{chain}/json` - Proxy JSON-RPC requests
- `GET /api/rpc/{chain}/ping` - Ping chain with eth_blockNumber

### Management
- `GET /api/chains` - List available chains
- `GET /healthz` - Health check
- `GET /metrics` - Prometheus metrics
- `GET /docs` - Interactive API documentation

## 📈 Metrics

KraiNode exposes Prometheus metrics at `/metrics`:

- `krainode_requests_total{chain,method,status_code}` - Request counter
- `krainode_request_duration_ms{chain,method}` - Request duration histogram
- `krainode_errors_total{chain,method,error_type}` - Error counter
- `krainode_rate_limit_hits_total{chain,client_ip}` - Rate limit hits

## ⚡ Rate Limiting

Rate limiting is applied per IP address per chain:

- **Default**: 5 requests per second per IP per chain
- **Configurable**: Via `RATE_LIMIT_RPS` environment variable
- **Response**: HTTP 429 with `Retry-After` header when exceeded
- **Headers**: Include comprehensive rate limit information:
  - `X-RateLimit-Limit`: Rate limit per second
  - `X-RateLimit-Remaining`: Remaining requests in current window
  - `X-RateLimit-Reset`: Time when limit resets
- **Security**: Prevents abuse while allowing legitimate usage


## 🌐 Supported Chains

Currently configured in `backend/chains.yml` with PublicNode endpoints:

- **Ethereum Mainnet** (`ethereum`)
- **Base Mainnet** (`base`)
- **Celo Mainnet** (`celo`)
- **Avail Mainnet** (`avail`)
- **Blast Mainnet** (`blast`)
- **Mantle Mainnet** (`mantle`)
- **Linea Mainnet** (`linea`)
- **Sei EVM Mainnet** (`sei-evm`)
- **Scroll Mainnet** (`scroll`)
- **Arbitrum One** (`arbitrum`)
- **Avalanche C-Chain** (`avalanche-c-chain`)
- **Gnosis Mainnet** (`gnosis`)
- **Unichain Mainnet** (`unichain`)

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
