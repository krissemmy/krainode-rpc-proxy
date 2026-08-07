import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Container } from "@/components/layout";
import DocsSidebar, { DocSection } from "@/components/DocsSidebar";
import { DocsCodeTabs } from "@/components/DocsCodeTabs";
import { Callout } from "@/components/Callout";

const BLOCK_NUMBER_REQUEST = `{
  "jsonrpc": "2.0",
  "method": "eth_blockNumber",
  "params": [],
  "id": 1
}`;

const BLOCK_NUMBER_RESPONSE = `{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0x142f2a0"
}`;

const sections: DocSection[] = [
  { id: "overview", title: "What KraiNode does", group: "Start here" },
  { id: "quickstart", title: "Send your first request", group: "Start here" },
  { id: "request-anatomy", title: "Request anatomy", group: "Start here" },
  { id: "endpoints", title: "Endpoints and headers", group: "Workflows" },
  { id: "blocks", title: "Read blocks", group: "Workflows" },
  { id: "contracts", title: "Read contract state", group: "Workflows" },
  { id: "logs", title: "Filter event logs", group: "Workflows" },
  { id: "batch", title: "Batch requests", group: "Workflows" },
  { id: "errors", title: "Diagnose errors", group: "Reference" },
  { id: "privacy", title: "Privacy and limits", group: "Reference" },
];

function playgroundHref(method: string, body: string) {
  const search = new URLSearchParams({ method, body });
  return `/playground?${search.toString()}`;
}

function TryInPlayground({ method, body }: { method: string; body: string }) {
  return (
    <Link
      to={playgroundHref(method, body)}
      className="not-prose mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400"
    >
      Load this request in the playground
      <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </Link>
  );
}

export default function DocsPage() {
  const [activeId, setActiveId] = useState(sections[0].id);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sectionIds = useMemo(() => sections.map((section) => section.id), []);

  useEffect(() => {
    const headings = sectionIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));

    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-112px 0px -68% 0px", threshold: [0, 0.25, 1] }
    );

    headings.forEach((heading) => observerRef.current?.observe(heading));
    return () => observerRef.current?.disconnect();
  }, [sectionIds]);

  const scrollToId = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-white text-foreground dark:bg-gray-950">
      <div className="border-b border-border bg-gray-50/70 dark:bg-gray-950">
        <Container className="py-10 sm:py-14 lg:py-16">
          <div className="max-w-4xl">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-600 dark:text-primary-400">
              KraiNode documentation
            </div>
            <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.08]">
              Inspect blockchain RPCs without setting up a project.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              KraiNode is a browser-native request workspace for blockchain developers. Choose a network,
              test an endpoint, edit raw JSON-RPC, and inspect the response in one place.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                to={playgroundHref("eth_blockNumber", BLOCK_NUMBER_REQUEST)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary-600 px-5 text-sm font-semibold text-white hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
              >
                Send a demo request
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a
                href="https://github.com/krissemmy/krainode-rpc-proxy"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border px-5 text-sm font-semibold hover:border-gray-400 dark:hover:border-gray-600"
              >
                View source
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-5 text-sm text-muted-foreground">
              {["No account", "No KraiNode proxy", "Runs in your browser"].map((item) => (
                <span key={item} className="inline-flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </Container>
      </div>

      <Container className="grid grid-cols-1 gap-8 py-8 md:grid-cols-[220px_minmax(0,1fr)] md:gap-10 lg:grid-cols-[240px_minmax(0,760px)] lg:gap-14 lg:py-12">
        <aside className="md:sticky md:top-20 md:self-start">
          <DocsSidebar sections={sections} activeId={activeId} onNavigate={scrollToId} />
        </aside>

        <article className="docs-content min-w-0 pb-24">
          <section id="overview" className="scroll-mt-28">
            <p className="docs-kicker">Overview</p>
            <h2>One workspace for raw blockchain requests</h2>
            <p>
              General-purpose API clients can send JSON-RPC, but they do not understand chain selection, block
              tags, RPC providers, or the response shapes developers inspect every day. KraiNode keeps the raw
              protocol visible while removing repetitive endpoint setup.
            </p>
            <div className="not-prose mt-6 overflow-hidden rounded-xl border border-border">
              <div className="grid sm:grid-cols-2">
                <div className="p-5 sm:p-6">
                  <h3 className="text-sm font-semibold text-foreground">Use KraiNode to</h3>
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
                    <li>Probe an endpoint before sending a heavier request.</li>
                    <li>Switch between bundled providers or use your own HTTP endpoint.</li>
                    <li>Edit single or batch JSON-RPC payloads and inspect structured responses.</li>
                    <li>Keep recent request metadata locally on this device.</li>
                  </ul>
                </div>
                <div className="border-t border-border bg-gray-50/70 p-5 dark:bg-gray-900/40 sm:border-l sm:border-t-0 sm:p-6">
                  <h3 className="text-sm font-semibold text-foreground">Deliberately out of scope</h3>
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
                    <li>Cloud accounts, team workspaces, and synced collections.</li>
                    <li>A server-side proxy for endpoints that block browser requests.</li>
                    <li>Wallet custody, private-key management, or transaction signing.</li>
                    <li>Background monitors and scheduled requests.</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section id="quickstart" className="scroll-mt-28">
            <p className="docs-kicker">Quickstart</p>
            <h2>Send your first request</h2>
            <p>
              Start with <code>eth_blockNumber</code>. It takes no parameters, works on standard EVM endpoints,
              and confirms that the endpoint can receive browser requests.
            </p>
            <ol className="not-prose mt-6 divide-y divide-border border-y border-border">
              {[
                ["Choose a route", "Open the playground, then select a chain, network, and provider."],
                ["Check connectivity", "Use Probe endpoint. A successful probe confirms reachability and CORS support."],
                ["Send the payload", "Load the example below and select Send request."],
                ["Read the result", "The hexadecimal result is the latest block number; KraiNode also shows its decimal value."],
              ].map(([title, description], index) => (
                <li key={title} className="grid gap-2 py-4 sm:grid-cols-[32px_160px_1fr] sm:items-start">
                  <span className="font-mono text-xs font-semibold text-primary-600">{String(index + 1).padStart(2, "0")}</span>
                  <strong className="text-sm text-foreground">{title}</strong>
                  <span className="text-sm leading-6 text-muted-foreground">{description}</span>
                </li>
              ))}
            </ol>
            <DocsCodeTabs
              title="First request"
              tabs={[
                { label: "JSON-RPC", code: BLOCK_NUMBER_REQUEST },
                {
                  label: "cURL",
                  code: `curl -X POST "YOUR_RPC_URL" \\\n+  -H "Content-Type: application/json" \\\n+  --data '${BLOCK_NUMBER_REQUEST.replace(/\n/g, " ").replace(/\s+/g, " ")}'`,
                },
                {
                  label: "JavaScript",
                  code: `const response = await fetch("YOUR_RPC_URL", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(${BLOCK_NUMBER_REQUEST})
});

console.log(await response.json());`,
                },
              ]}
            />
            <div className="not-prose mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-gray-50 p-4 dark:bg-gray-900/50">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Example response</div>
                <pre className="mt-3 overflow-x-auto text-xs leading-6"><code>{BLOCK_NUMBER_RESPONSE}</code></pre>
              </div>
              <div className="rounded-lg border border-border p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">What to check</div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  The response <code className="text-foreground">id</code> should match the request. A successful call has
                  a <code className="text-foreground">result</code>; a rejected call has an <code className="text-foreground">error</code> object.
                </p>
              </div>
            </div>
            <TryInPlayground method="eth_blockNumber" body={BLOCK_NUMBER_REQUEST} />
          </section>

          <section id="request-anatomy" className="scroll-mt-28">
            <p className="docs-kicker">Core concept</p>
            <h2>Understand the request before changing it</h2>
            <div className="not-prose mt-6 overflow-hidden rounded-xl border border-border">
              <div className="grid grid-cols-[112px_1fr] border-b border-border bg-gray-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground dark:bg-gray-900/50 sm:grid-cols-[140px_120px_1fr]">
                <span>Field</span><span className="hidden sm:block">Typical value</span><span>Purpose</span>
              </div>
              {[
                ["jsonrpc", '"2.0"', "Protocol version. Keep this at 2.0."],
                ["method", '"eth_getBalance"', "The node operation you want to run."],
                ["params", "[]", "Ordered inputs required by the method."],
                ["id", "1", "Correlates a response with its request, especially in a batch."],
              ].map(([field, value, purpose]) => (
                <div key={field} className="grid grid-cols-[112px_1fr] border-b border-border px-4 py-4 text-sm last:border-b-0 sm:grid-cols-[140px_120px_1fr]">
                  <code>{field}</code><code className="hidden text-muted-foreground sm:block">{value}</code><span className="leading-6 text-muted-foreground">{purpose}</span>
                </div>
              ))}
            </div>
            <Callout type="note" title="Method support comes from the node">
              KraiNode can send a valid payload even when the selected provider does not expose that method. Archive,
              trace, debug, and provider-specific methods vary by endpoint.
            </Callout>
          </section>

          <section id="endpoints" className="scroll-mt-28">
            <p className="docs-kicker">Endpoints</p>
            <h2>Use a bundled provider or bring your own</h2>
            <p>
              A bundled provider is the fastest route for public reads. For a private or paid endpoint, enter its URL,
              select <strong>Use</strong>, and add headers as a JSON object if the provider requires them.
            </p>
            <DocsCodeTabs
              title="Custom header examples"
              tabs={[
                { label: "API key", code: `{\n  "x-api-key": "YOUR_API_KEY"\n}` },
                { label: "Bearer token", code: `{\n  "Authorization": "Bearer YOUR_TOKEN"\n}` },
              ]}
            />
            <Callout type="warning" title="Browser access is controlled by the endpoint">
              KraiNode cannot bypass CORS. If a provider rejects browser origins, choose another endpoint or call it from
              infrastructure you control. A public proxy would weaken KraiNode's no-backend privacy boundary.
            </Callout>
          </section>

          <section id="blocks" className="scroll-mt-28">
            <p className="docs-kicker">Recipe</p>
            <h2>Read blocks by tag, number, or hash</h2>
            <p>
              Use <code>eth_getBlockByNumber</code> with a tag such as <code>latest</code>, <code>safe</code>, or
              <code>finalized</code>, or provide a hexadecimal block number. A block hash uses a different method.
            </p>
            <DocsCodeTabs
              title="Block lookup"
              tabs={[
                { label: "Latest", code: `{\n  "jsonrpc": "2.0",\n  "method": "eth_getBlockByNumber",\n  "params": ["latest", false],\n  "id": 1\n}` },
                { label: "Full transactions", code: `{\n  "jsonrpc": "2.0",\n  "method": "eth_getBlockByNumber",\n  "params": ["latest", true],\n  "id": 1\n}` },
                { label: "By hash", code: `{\n  "jsonrpc": "2.0",\n  "method": "eth_getBlockByHash",\n  "params": ["0xBLOCK_HASH", false],\n  "id": 1\n}` },
              ]}
            />
            <Callout type="tip" title="Keep responses manageable">
              Set the second parameter to <code>false</code> when transaction hashes are enough. Setting it to
              <code>true</code> returns every full transaction object in the block.
            </Callout>
          </section>

          <section id="contracts" className="scroll-mt-28">
            <p className="docs-kicker">Recipe</p>
            <h2>Read contract state without signing</h2>
            <p>
              <code>eth_call</code> executes a message against node state without creating a transaction. The
              <code>data</code> value contains the encoded function selector and arguments.
            </p>
            <DocsCodeTabs
              title="ERC-20 balanceOf"
              tabs={[{
                label: "JSON-RPC",
                code: `{\n  "jsonrpc": "2.0",\n  "method": "eth_call",\n  "params": [\n    {\n      "to": "0x6b175474e89094c44da98b954eedeac495271d0f",\n      "data": "0x70a082310000000000000000000000006e0d01a76c3cf4288372a29124a26d4353ee51be"\n    },\n    "latest"\n  ],\n  "id": 1\n}`,
              }]}
            />
            <Callout type="note">
              KraiNode exposes raw JSON-RPC. Use viem, ethers, or another ABI library when you need to encode function
              arguments or decode return data into application types.
            </Callout>
          </section>

          <section id="logs" className="scroll-mt-28">
            <p className="docs-kicker">Recipe</p>
            <h2>Filter event logs without overloading the endpoint</h2>
            <p>
              Begin with a narrow block window, then add a contract address and topics. The first topic is normally the
              hash of the event signature; later topics match indexed arguments.
            </p>
            <DocsCodeTabs
              title="ERC-20 Transfer logs"
              tabs={[{
                label: "JSON-RPC",
                code: `{\n  "jsonrpc": "2.0",\n  "method": "eth_getLogs",\n  "params": [{\n    "fromBlock": "0x142f000",\n    "toBlock": "0x142f100",\n    "address": "0x6b175474e89094c44da98b954eedeac495271d0f",\n    "topics": [\n      "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"\n    ]\n  }],\n  "id": 1\n}`,
              }]}
            />
            <Callout type="warning" title="Wide ranges are provider-dependent">
              Public endpoints often cap the number of blocks or returned logs. Reduce the window and page forward when
              you see a timeout, rate-limit response, or “too many results” error.
            </Callout>
          </section>

          <section id="batch" className="scroll-mt-28">
            <p className="docs-kicker">Recipe</p>
            <h2>Send independent reads in one HTTP request</h2>
            <p>
              A JSON-RPC batch is an array of request objects. Give every item a distinct <code>id</code>; response order
              is not guaranteed, so match results by that identifier.
            </p>
            <DocsCodeTabs
              title="Batch request"
              tabs={[{
                label: "JSON-RPC",
                code: `[\n  {\n    "jsonrpc": "2.0",\n    "method": "eth_chainId",\n    "params": [],\n    "id": 1\n  },\n  {\n    "jsonrpc": "2.0",\n    "method": "eth_blockNumber",\n    "params": [],\n    "id": 2\n  }\n]`,
              }]}
            />
            <Callout type="note">
              Batch support and maximum batch size vary by provider. A batch reduces HTTP overhead, but it is not an
              atomic transaction and one item can fail while another succeeds.
            </Callout>
          </section>

          <section id="errors" className="scroll-mt-28">
            <p className="docs-kicker">Troubleshooting</p>
            <h2>Separate transport failures from RPC failures</h2>
            <div className="not-prose mt-6 overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-[620px] border-collapse text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-muted-foreground dark:bg-gray-900/50">
                  <tr><th className="px-4 py-3">Signal</th><th className="px-4 py-3">Likely cause</th><th className="px-4 py-3">Next check</th></tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    ["Failed to fetch / CORS", "The browser could not read the response.", "Probe the endpoint; try another provider or inspect its allowed origins."],
                    ["HTTP 401 or 403", "Credentials are absent, invalid, or unauthorized.", "Check the custom URL and header name without sharing the secret."],
                    ["HTTP 429 / -32005", "A request or usage limit was reached.", "Wait for the provider's retry window or reduce request frequency."],
                    ["-32601", "The endpoint does not expose that method.", "Check its supported namespaces and plan level."],
                    ["-32602", "Parameter order, type, or shape is invalid.", "Compare params with the method reference for that chain."],
                    ["Timeout", "The query is expensive or the endpoint is unhealthy.", "Narrow log ranges, request less data, or switch endpoints."],
                  ].map(([signal, cause, next]) => (
                    <tr key={signal} className="align-top">
                      <td className="px-4 py-4 font-mono text-xs font-semibold text-foreground">{signal}</td>
                      <td className="px-4 py-4 leading-6 text-muted-foreground">{cause}</td>
                      <td className="px-4 py-4 leading-6 text-muted-foreground">{next}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="privacy" className="scroll-mt-28">
            <p className="docs-kicker">Privacy and limits</p>
            <h2>Know where each piece of data goes</h2>
            <p>
              Requests travel directly from your browser to the selected RPC endpoint. KraiNode has no application
              backend that receives, stores, or relays them.
            </p>
            <div className="not-prose mt-6 divide-y divide-border border-y border-border">
              {[
                ["Request bodies and responses", "Held in the current page only."],
                ["Custom URL and headers", "Held in memory for the current tab. They are not added to local history."],
                ["Chain, network, and provider", "Saved in browser storage so the workspace can reopen where you left it."],
                ["Recent request metadata", "Saved locally with method, status, latency, time, and sanitized endpoint origin."],
              ].map(([label, detail]) => (
                <div key={label} className="grid gap-1 py-4 sm:grid-cols-[210px_1fr]">
                  <strong className="text-sm text-foreground">{label}</strong>
                  <span className="text-sm leading-6 text-muted-foreground">{detail}</span>
                </div>
              ))}
            </div>
            <Callout type="warning" title="Never paste a private key or seed phrase">
              KraiNode does not need wallet secrets. For write operations, sign with a wallet or trusted local signer and
              submit only the signed transaction bytes. Treat any endpoint token as a secret too.
            </Callout>
          </section>

          <div className="not-prose mt-16 flex flex-col justify-between gap-4 border-t border-border pt-8 sm:flex-row sm:items-center">
            <div>
              <div className="text-sm font-semibold text-foreground">Ready to make a call?</div>
              <p className="mt-1 text-sm text-muted-foreground">The demo opens with a safe, read-only request.</p>
            </div>
            <Link
              to={playgroundHref("eth_blockNumber", BLOCK_NUMBER_REQUEST)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 text-sm font-semibold text-white hover:bg-primary-500"
            >
              Open the playground <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </article>
      </Container>
    </div>
  );
}
