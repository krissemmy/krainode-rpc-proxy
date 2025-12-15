# KraiNode - JSON-RPC Playground

Postman-style JSON-RPC playground for testing blockchain RPC endpoints. It is 100% client-side and talks directly to the providers you choose.

👉 Live playground: [https://krainode.krissemmy.com/playground](https://krainode.krissemmy.com/playground)
👉 Docs page (local): http://localhost:3000/docs

## Highlights
- Multi-chain: curated endpoints across public/test networks
- Provider choice: use bundled endpoints or your own URL
- Probe first: connectivity check before firing a request
- JSON viewer/editor with pretty responses and error states
- Local persistence: recent requests + selections stay in-browser
- Zero backend: build once, host anywhere static

## Quick start (local)
```bash
git clone https://github.com/krissemmy/krainode-rpc-proxy.git
cd krainode-rpc-proxy/web
npm install
npm run dev   # Vite on http://localhost:3000
```

What happens under the hood:
- `chains.yaml` in the repo root is transformed into `web/public/chains.json` by `predev`/`prebuild` (no manual step needed).
- The order you keep in `chains.yaml` is preserved; the first provider for a network becomes the default.

To preview a production build locally:
```bash
npm run build
npm run preview
```

## Docker workflows
- Dev (hot reload on :8000): `make docker-dev`
- Stop dev stack: `make docker-down`
- Prod stack (Caddy + static app): `cp env.example .env && make docker-up`
  - `EMAIL` and `APP_HOST` drive Caddy TLS; see `env.example`.
  - Logs: `make docker-logs`

## Deploying the static app
1) Build: `cd web && npm install && npm run build` (outputs to `web/dist`)
2) Host the `dist` folder on any static host.

Vercel (monorepo):
- Project root: `web`
- Build command: `npm install && npm run build`
- Output directory: `dist`
- SPA fallback: keep the provided `vercel.json` rewrite.

Netlify:
- Base directory: `web`
- Build command: `npm install && npm run build`
- Publish directory: `dist`

## Configuration
- Chains/providers: edit `chains.yaml`; restart dev or rebuild to regenerate `web/public/chains.json`.
- Analytics (optional): set in `web/.env.local`
  ```
  VITE_PUBLIC_POSTHOG_KEY=
  VITE_PUBLIC_POSTHOG_HOST=
  ```

## Project layout
```
krainode-rpc-proxy/
├── chains.yaml            # Source of truth for networks/providers
├── web/                   # Vite + React frontend
│   ├── src/               # Components, pages, lib, data
│   ├── public/            # Static assets + generated chains.json
│   ├── scripts/           # build-chains-json.mjs
│   └── package.json       # App scripts/deps
├── Dockerfile             # Multi-stage build -> static bundle
├── docker-compose*.yml    # Dev/prod stacks (Caddy for TLS)
└── Makefile               # Helpful commands
```

## Make targets
- `make dev`         Start Vite dev server (local)
- `make build`       Build production bundle
- `make clean`       Remove `web/dist` and `web/node_modules`
- `make docker-dev`  Dockerized dev server on :8000
- `make docker-up`   Prod stack (Caddy + app)
- `make docker-logs` Tail container logs

## Supported chains (from `chains.yaml`)
- arbitrum (one, nova, sepolia)
- avail (mainnet, testnet-turing)
- avalanche-c-chain (mainnet, fuji)
- base (mainnet, sepolia)
- berachain (mainnet, bepolia)
- blast (mainnet, sepolia)
- celo (mainnet, sepolia)
- ethereum (mainnet, sepolia, hoodi)
- gnosis (mainnet, chiado)
- hyperevm (mainnet, testnet)
- linea (mainnet, sepolia)
- mantle (mainnet, sepolia)
- monad (mainnet, testnet)
- optimism (mainnet, sepolia)
- plasma (mainnet, testnet)
- sei-evm (mainnet, testnet)
- scroll (mainnet, sepolia)
- tempo (testnet)
- unichain (mainnet, sepolia)

## Troubleshooting
- CORS/network errors: try another provider or your own endpoint.
- Chains not updating: ensure you restarted after editing `chains.yaml` (the pre-scripts regenerate `chains.json` on dev/build).
- Docker dev port in use: adjust `docker-compose-dev.yml` port mapping if 8000 is occupied.

## Contributing
1. Fork and branch
2. `npm run dev` (or `make dev`) to iterate
3. Keep chains/providers in `chains.yaml`
4. Open a PR when ready

## License
MIT License - see `LICENSE`.
