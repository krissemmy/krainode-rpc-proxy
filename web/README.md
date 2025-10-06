# KraiNode Playground

A browser-only JSON-RPC playground. All requests originate from the client—no backend proxy, auth, or Supabase stack required.

## 🧱 Architecture

- `chains.yaml` at the repo root lists chains → networks → provider URLs.
- `npm run dev` and `npm run build` call `web/scripts/build-chains-json.mjs` to convert the YAML into `public/chains.json`.
- The React app loads `/chains.json`, lets you pick a provider or paste a custom URL, and sends JSON-RPC requests with `fetch`.
- Endpoint probes issue a `web3_clientVersion` request so you can spot CORS blocks or timeouts before running heavier calls.

## 🚀 Local development

```bash
cd web
npm install
npm run dev
```

The build step runs the YAML→JSON script automatically. Update `../chains.yaml` and restart (or re-run `npm run dev`) to refresh the provider list.

## 🌐 CORS & public RPCs

Many public endpoints work in the browser, but some block cross-origin requests. The probe button in the playground reports:

- **OK** – endpoint responded with a JSON-RPC payload
- **OK (no result)** – endpoint replied without a `result` field
- **Blocked (CORS/Network)** – the browser prevented the request
- **Timeout** – no response before the deadline (40s for RPC, 10s for probes)

If you see a CORS block, switch providers or host a proxy that adds the proper headers.

## 🧭 Going to production?

Ship with multiple providers so your users can fail over quickly. A few good options to include:

- PublicNode
- Alchemy
- Ankr
- BlastAPI
- Chainstack

Bundle the URLs in `chains.yaml`, deploy the static site, and you have a zero-backend JSON-RPC playground.
