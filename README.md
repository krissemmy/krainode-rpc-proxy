# KraiNode RPC Proxy

**Production-ready JSON-RPC proxy with authentication, rate limiting, monitoring, and secure forwarding.**

KraiNode RPC Proxy is a complete solution that provides secure, rate-limited access to blockchain RPC endpoints with user authentication and request logging. It includes a FastAPI backend with comprehensive monitoring, a React frontend with an interactive playground, user authentication via Supabase, and Docker-based deployment with Prometheus and Grafana monitoring.

👉 Live Playground: [https://staging.krainode.krissemmy.com/playground](https://staging.krainode.krissemmy.com/playground)

---

## ✨ Features

### Backend (FastAPI)
- 🛡️ **Server-side Proxy**: Keep upstream URLs private, expose only your KraiNode endpoints
- 🔐 **User Authentication**: Supabase-based authentication with JWT verification
- 📝 **Request Logging**: Log all RPC requests with user tracking and parameter redaction
- ⚡ **Rate Limiting**: Per-IP per-chain rate limiting with configurable limits
- 📊 **Metrics & Monitoring**: Prometheus metrics and structured JSON logging
- 🔧 **Easy Configuration**: Environment-based configuration for chains and limits
- 📈 **Production Ready**: Health checks, structured logging, and monitoring
- 🛡️ **Security Headers**: Comprehensive security headers via Caddy reverse proxy
- 📏 **Request Size Limits**: Protection against large request attacks

### Frontend (React + TypeScript)
- 🎮 **Interactive Playground**: Test JSON-RPC methods with a user-friendly interface
- 🔐 **User Authentication**: Sign up/sign in with email confirmation via Supabase
- 📊 **Request History**: View and filter your RPC request history with pagination
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
make help              # Show all available commands
make dev               # Start all service using the docker-compose-dev.yml file
make test             # Run test
make docker-down       # Stop Docker Compose
make clean             # Clean build artifacts. if running locally without docker
make status            # Check service status
make staging-deploy    # Deploy to staging environment
make prod-build        # Build production Docker image
make staging-build     # Build staging Docker image
```

### For production environment. Using Docker Compose (Recommended)

1. **Clone and setup**:
   ```bash
   git clone https://github.com/krissemmy/krainode-rpc-proxy.git
   cd krainode-rpc-proxy
   cp env.example .env
   ```

2. **Configure your environment** (edit `.env`):
   ```bash
   # Set your domain for SSL certificates
   EMAIL=your-email@example.com
   API_HOST=your-domain.com
   
   # Supabase configuration (for authentication)
   SUPABASE_PROJECT_ID=your_project_id
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Database (optional - for request logging)
   DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/krainode
   
   # Generate a secure Grafana password
   GRAFANA_ADMIN_PASSWORD=your_secure_password_here
   ```

3. **Set up Supabase** (for authentication):
   - Create a new project at [supabase.com](https://supabase.com)
   - Get your project ID and anon key from project settings
   - Run the SQL from `supabase_bootstrap.sql` in your Supabase SQL editor
   - Update the redirect URLs in Supabase Auth settings to include your domain

4. **Start the complete stack**:
   ```bash
   docker compose up --build
   ```

5. **Access the services**:
   - **Web UI**: http://localhost:8000 (or https://your-domain.com)
   - **Playground**: http://localhost:8000/playground (requires authentication)
   - **History**: http://localhost:8000/history (requires authentication)
   - **API Docs**: http://localhost:8000/docs
   - **Health Check**: http://localhost:8000/healthz
   - **Metrics**: http://localhost:8000/metrics
   - **Prometheus**: http://localhost:9090
   - **Grafana**: http://localhost:3000 (admin/password from GRAFANA_ADMIN_PASSWORD)

### For Staging Environment

The staging environment uses the same production Docker setup but with staging-specific configuration:

1. **Configure staging environment** (edit `.env`):
   ```bash
   # Staging domain
   API_HOST=staging.krainode.krissemmy.com
   
   # Supabase configuration (same as production)
   SUPABASE_PROJECT_ID=your_project_id
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Database (for request logging)
   DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/krainode
   ```

2. **Deploy to staging**:
   ```bash
   make staging-deploy
   ```

3. **Access staging services**:
   - **Web UI**: https://staging.krainode.krissemmy.com
   - **Playground**: https://staging.krainode.krissemmy.com/playground
   - **History**: https://staging.krainode.krissemmy.com/history

## 📋 API Usage

### Using the Web Playground (Recommended)

1. Open http://localhost:8000/playground
2. **Sign up/Sign in** with your email (requires email confirmation)
3. Select a chain and network from the dropdowns
4. Choose a method or enter a custom one
5. Fill in parameters and click "Send Request"
6. View the response with syntax highlighting
7. Check your **History** page to see all your requests with filtering options

### Using cURL

#### Basic JSON-RPC Request (No Authentication Required)
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

#### Authenticated Request (with JWT token)
```bash
curl -X POST http://localhost:8000/api/rpc/ethereum-mainnet/json \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
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

#### Get User Information (requires authentication)
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:8000/api/me
```

#### Get Request History (requires authentication)
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" "http://localhost:8000/api/history?chain=ethereum&network=mainnet&limit=10"
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
| `ALLOWED_ORIGINS` | `["*"]` | CORS allowed origins (JSON array or single string) |
| `RATE_LIMIT_RPS` | `5.0` | Rate limit (requests per second per IP per chain) |
| `CHAINS_CONFIG_FILE` | `chains.yaml` | Chain configuration file path |
| `REQUEST_TIMEOUT_SECONDS` | `20.0` | Upstream request timeout |
| `EMAIL` | `""` | Email for SSL certificate registration |
| `API_HOST` | `""` | Domain for Caddy SSL certificates |
| `GRAFANA_ADMIN_PASSWORD` | `your_secure_password_here` | Grafana admin password |
| `SUPABASE_PROJECT_ID` | **Required** | Supabase project ID for authentication |
| `VITE_SUPABASE_URL` | **Required** | Supabase URL for frontend |
| `VITE_SUPABASE_ANON_KEY` | **Required** | Supabase anonymous key for frontend |
| `DATABASE_URL` | `postgresql+asyncpg://postgres:password@localhost:5432/krainode` | PostgreSQL connection URL for request logging |

### Adding New Chains

Edit your `backend/chains.yaml` file to add more chains:

```yaml
ethereum-mainnet:
  - https://ethereum-rpc.publicnode.com
  - https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY

polygon-mainnet:
  - https://polygon-rpc.publicnode.com
  - https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY
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
- `GET /playground` - Interactive JSON-RPC testing interface (requires authentication)
- `GET /history` - Request history with filtering (requires authentication)
- `GET /signin` - User sign-in page
- `GET /signup` - User sign-up page
- `GET /team` - Team information page

### RPC Proxy
- `POST /api/rpc/{chain}/json` - Proxy JSON-RPC requests (optional authentication)
- `GET /api/rpc/{chain}/ping` - Ping chain with eth_blockNumber

**Note**: The `{chain}` parameter uses the combined format (e.g., `ethereum-mainnet`, `base-sepolia`)

### Authentication
- `GET /api/me` - Get current user information (requires authentication)
- `GET /api/debug/auth` - Debug authentication headers

### Request History
- `GET /api/history` - Get user's request history with filtering (requires authentication)
  - Query parameters: `chain`, `network`, `method`, `status_code`, `from_ts`, `to_ts`, `limit`, `cursor`

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

## 🔐 Authentication & User Management

KraiNode includes comprehensive user authentication and request tracking:

### Authentication Features
- **Supabase Integration**: Email/password authentication with JWT tokens
- **Email Confirmation**: Users must confirm their email before accessing protected features
- **Session Management**: Automatic token refresh and session persistence
- **Protected Routes**: Playground and History pages require authentication

### Request Logging
- **User Tracking**: All RPC requests are logged with user identification
- **Parameter Redaction**: Sensitive parameters (private keys, tokens) are automatically redacted
- **Request History**: Users can view and filter their request history
- **Database Storage**: Requests stored in PostgreSQL with proper indexing

### Security Features
- **JWT Verification**: Server-side JWT validation using Supabase JWKS
- **Parameter Sanitization**: Automatic redaction of sensitive data before logging
- **CORS Protection**: Configurable allowed origins for security
- **Rate Limiting**: Per-IP per-chain rate limiting to prevent abuse

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

Currently configured in `backend/chains.yaml` with PublicNode endpoints:

### Ethereum
- **Ethereum Mainnet** (`ethereum-mainnet`)
- **Ethereum Sepolia** (`ethereum-sepolia`)
- **Ethereum Holesky** (`ethereum-holesky`)
- **Ethereum Hoodi** (`ethereum-hoodi`)

### Layer 2s
- **Base Mainnet** (`base-mainnet`), **Base Sepolia** (`base-sepolia`)
- **Arbitrum One** (`arbitrum-one`), **Arbitrum Nova** (`arbitrum-nova`), **Arbitrum Sepolia** (`arbitrum-sepolia`)
- **Linea Mainnet** (`linea-mainnet`), **Linea Sepolia** (`linea-sepolia`)
- **Scroll Mainnet** (`scroll-mainnet`), **Scroll Sepolia** (`scroll-sepolia`)
- **Mantle Mainnet** (`mantle-mainnet`), **Mantle Sepolia** (`mantle-sepolia`)
- **Blast Mainnet** (`blast-mainnet`), **Blast Sepolia** (`blast-sepolia`)

### Other Chains
- **Celo Mainnet** (`celo-mainnet`), **Celo Alfajores** (`celo-alfajores`)
- **Avail Mainnet** (`avail-mainnet`), **Avail Testnet Turing** (`avail-testnet-turing`)
- **Sei EVM Mainnet** (`sei-evm-mainnet`), **Sei EVM Testnet** (`sei-evm-testnet`)
- **Avalanche C-Chain Mainnet** (`avalanche-c-chain-mainnet`), **Avalanche C-Chain Fuji** (`avalanche-c-chain-fuji`)
- **Gnosis Mainnet** (`gnosis-mainnet`), **Gnosis Chiado** (`gnosis-chiado`)
- **Unichain Mainnet** (`unichain-mainnet`), **Unichain Sepolia** (`unichain-sepolia`)

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
