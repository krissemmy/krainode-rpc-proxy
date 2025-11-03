# KraiNode RPC Proxy

# KraiNode - JSON-RPC Playground

A Postman style JSON-RPC playground for testing blockchain RPC endpoints. No backend required - all requests are made directly from your browser to the RPC providers.

👉 Live Playground: [https://krainode.krissemmy.com/playground](https://krainode.krissemmy.com/playground)

## Features

- **Multi-chain support** - Test endpoints across 13+ blockchain networks
- **Provider selection** - Choose from curated public providers or use your own custom URLs
- **HTTP/HTTPS support** - Works with both local development nodes and production endpoints
- **Live endpoint testing** - Probe endpoints before making requests to check connectivity
- **Request/Response viewer** - JSON editor with syntax highlighting and formatted responses
- **Local persistence** - Your selections and recent requests are saved locally
- **Zero infrastructure** - Pure client-side application, deploy anywhere

## Quick Start

### Local Development

```bash
# Clone and navigate to the project
git clone https://github.com/krissemmy/krainode-rpc-proxy.git
cd krainode-rpc-proxy

# Install dependencies and start dev server
cd web
npm install
npm run dev

# Open http://localhost:8000
```

### Docker Development

```bash
# Start development environment
make docker-dev

# Visit http://localhost:8000
# Stop when done
make docker-dev-down
```

## Deployment

### Production with Docker

```bash
# Copy environment file
cp env.example .env

# Edit .env with your domain and email
# EMAIL=your-email@example.com
# APP_HOST=your-domain.com

# Start production stack
make docker-up

# View logs
make docker-logs
```

### Static Hosting (Vercel, Netlify, etc.)

The app is a static React application that can be deployed to any static hosting service:

```bash
# Build the application
cd web
npm install
npm run build

# Deploy the 'dist' folder to your hosting service
```

**Vercel deployment:**
1. Connect your GitHub repository to Vercel
2. Set build command: `cd web && npm install && npm run build`
3. Set output directory: `web/dist`
4. Deploy

**Netlify deployment:**
1. Connect your GitHub repository to Netlify
2. Set build command: `cd web && npm install && npm run build`
3. Set publish directory: `web/dist`
4. Deploy

### Custom Domain with Caddy

For production deployments with custom domains and automatic HTTPS:

1. Set up your domain DNS to point to your server
2. Configure environment variables:
   ```bash
   EMAIL=your-email@example.com
   APP_HOST=your-domain.com
   ```
3. Run `make docker-up`

Caddy will automatically obtain SSL certificates and handle HTTPS redirects.

## Configuration

### Adding New Chains/Providers

Edit `chains.yaml` to add new blockchain networks or RPC providers:

```yaml
ethereum
  mainnet:
    noderpc: "https://api.noderpc.xyz/rpc-mainnet/public"
    publicnode: "https://ethereum-rpc.publicnode.com"
```

After editing, restart the dev server or rebuild to regenerate the chains configuration.

### Environment Variables

Create a `.env` file with:

```bash
# Required for Caddy TLS certificates
EMAIL=your-email@example.com

# Your domain name (for production)
APP_HOST=your-domain.com
```

## Development

### Project Structure

```
krainode-rpc-proxy/
├── web/                    # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Main application pages
│   │   └── lib/           # Utility functions
│   ├── scripts/           # Build scripts
│   └── public/            # Static assets
├── chains.yaml            # Chain/network/provider configuration
├── Dockerfile             # Production Docker image
├── docker-compose.yml     # Production stack
├── docker-compose-dev.yml # Development stack
├── Caddyfile             # Reverse proxy configuration
└── Makefile              # Development commands
```

### Available Commands

```bash
# Development
make dev              # Start Vite dev server
make build            # Build production bundle
make clean            # Clean build artifacts

# Docker
make docker-dev       # Start development with Docker
make docker-up        # Start production stack
make docker-down      # Stop production stack
make docker-logs      # View container logs
```

### Adding New Features

1. **New RPC methods**: Add to `MethodSelect` component
2. **New chains**: Update `chains.yaml` and restart dev server
3. **UI components**: Add to `web/src/components/`
4. **Styling**: Uses Tailwind CSS, edit component classes

## Troubleshooting

### CORS Issues

Some RPC providers block browser requests due to CORS policies. The playground will show:
- **OK** - Request successful
- **Blocked (CORS/Network)** - CORS or network issue
- **Timeout** - No response within 30 seconds (RPC requests) or 4 seconds (probe requests)

**Solutions:**
- Try a different provider
- Use a CORS proxy for development
- Deploy your own RPC endpoint with proper CORS headers

### Local Development Issues

```bash
# Clear node_modules and reinstall
cd web
rm -rf node_modules package-lock.json
npm install

# Clear browser cache and localStorage
# Open dev tools > Application > Storage > Clear storage
```

### Docker Issues

```bash
# Rebuild containers
make docker-down
make docker-up

# Check logs
make docker-logs
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with `make dev`
5. Submit a pull request

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

## 🆘 Support

- GitHub Issues: [Report bugs and request features](https://github.com/krissemmy/krainode-rpc-proxy/issues)
- Documentation: [Full API documentation](http://localhost:8000/docs)

## License

MIT License - see LICENSE file for details.

---

**Made with ❤️ for the blockchain community**
