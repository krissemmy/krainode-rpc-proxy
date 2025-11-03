import { useEffect, useMemo, useRef, useState } from "react";
import { Container } from "@/components/layout";
import DocsSidebar, { DocSection } from "@/components/DocsSidebar";
import { DocsCodeTabs } from "@/components/DocsCodeTabs";
import { Callout } from "@/components/Callout";

const EXAMPLE_JSON = `{
  "jsonrpc": "2.0",
  "method": "eth_blockNumber",
  "params": [],
  "id": 1
}`;

export default function DocsPage() {
  const sections: DocSection[] = useMemo(
    () => [
      { id: "intro", title: "Intro to KraiNode" },
      { id: "first-request", title: "Making Your First Request" },
      { id: "blocks", title: "Blocks: by tag, number, or hash" },
      { id: "logs", title: "eth_getLogs patterns" },
      { id: "eth-call", title: "eth_call (read contract state)" },
      { id: "custom-headers", title: "Adding Custom Headers or RPC URL" },
      { id: "troubleshooting", title: "Troubleshooting Common Errors" },
      { id: "security", title: "Security Note" },
    ],
    []
  );

  const [activeId, setActiveId] = useState<string>(sections[0].id);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const headings = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (a.target as HTMLElement).offsetTop - (b.target as HTMLElement).offsetTop);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-120px 0px -60% 0px", threshold: [0, 0.25, 0.5, 1] }
    );

    headings.forEach((h) => observerRef.current?.observe(h));
    return () => observerRef.current?.disconnect();
  }, [sections]);

  const copyExample = async () => {
    try {
      await navigator.clipboard.writeText(EXAMPLE_JSON);
    } catch {}
  };

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Container className="grid grid-cols-1 gap-8 md:grid-cols-[220px_1fr] lg:grid-cols-[260px_1fr]">
      {/* Sidebar */}
      <aside className="md:sticky md:top-20 md:self-start">
        <DocsSidebar sections={sections} activeId={activeId} onNavigate={scrollToId} />
      </aside>

      {/* Content */}
      <article className="prose prose-zinc max-w-3xl dark:prose-invert space-y-12 md:space-y-16 pb-40 md:pb-56">
        <section id="intro" className="scroll-mt-28">
          <h1>Intro to KraiNode</h1>
          <Callout type="note" title="Security & Privacy">
            KraiNode is browser-only. Your requests and API keys are sent directly from your device to the RPC provider. 
            We do not run a backend and we do not store keys or request bodies.
          </Callout>
          <br />
          <p>
            KraiNode is a browser-based JSON-RPC playground for blockchain developers. Point it at any
            EVM-compatible RPC endpoint and interact with methods directly from your browser. No backend involved requests go straight from your device to the RPC provider.
          </p>
          <p>
            KraiNode is like Postman but for blockchain RPCs
          </p>
          <br />
          <ul>
            <li>- Send JSON-RPC requests with a friendly UI.</li>
            <li>- Switch networks/providers quickly.</li>
            <li>- Inspect structured JSON responses.</li>
          </ul>
        </section>


        <section id="first-request" className="scroll-mt-28">
          <h1>Making Your First Request</h1>
          <br />
          <ol>
            <li>Open the <a href="/playground">Playground</a>.</li>
            <li>Select a network and provider.</li>
            <li>Paste the example and press Send.</li>
          </ol>
          <div className="not-prose mt-4 overflow-hidden rounded-lg border bg-gray-50 dark:border-white/10 dark:bg-gray-900">
            <div className="flex items-center justify-between border-b px-3 py-2 text-xs text-muted-foreground dark:border-white/10">
              <span>Request JSON</span>
              <button
                onClick={copyExample}
                className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-gray-100 dark:border-white/10 dark:hover:bg-gray-800"
              >
                Copy
              </button>
            </div>
            <pre className="max-h-80 overflow-auto p-3 text-xs leading-relaxed"><code>{EXAMPLE_JSON}</code></pre>
          </div>
        </section>

        <section id="blocks" className="scroll-mt-28">
          <h1>Blocks: by tag, number, or hash</h1>
          <p className="mb-2">There are two different RPCs:</p>
          <ul className="list-disc pl-6">
            <li><code>eth_getBlockByNumber</code>: use a block <em>tag</em> (e.g. <code>"latest"</code>) or a hex block number.</li>
            <li><code>eth_getBlockByHash</code>: when you already have the block hash.</li>
          </ul>

          <p className="mt-4">1) <strong>Latest block</strong> (by tag):</p>
          <DocsCodeTabs
            tabs={[
              {
                label: "JSON",
                code: "{\n  \"jsonrpc\": \"2.0\",\n  \"method\": \"eth_getBlockByNumber\",\n  \"params\": [\"latest\", false],\n  \"id\": 1\n}"
              },
              {
                label: "JSON (full)",
                code: "{\n  \"jsonrpc\": \"2.0\",\n  \"method\": \"eth_getBlockByNumber\",\n  \"params\": [\"latest\", true],\n  \"id\": 1\n}"
              }
            ]}
          />

          <p>2) <strong>Specific block number</strong> (hex):</p>
          <DocsCodeTabs
            tabs={[
              {
                label: "JSON",
                code: "{\n  \"jsonrpc\": \"2.0\",\n  \"method\": \"eth_getBlockByNumber\",\n  \"params\": [\"0xA3C1B2\", true],\n  \"id\": 1\n}"
              }
            ]}
          />

          <p>3) <strong>By block hash</strong> (different method):</p>
          <DocsCodeTabs
            tabs={[
              {
                label: "JSON",
                code: "{\n  \"jsonrpc\": \"2.0\",\n  \"method\": \"eth_getBlockByHash\",\n  \"params\": [\"0xHASH...\", false],\n  \"id\": 1\n}"
              }
            ]}
          />

          <Callout type="note">
            <code>eth_getBlockByNumber</code> does not accept a hash. Use <code>eth_getBlockByHash</code> when you have the hash.
          </Callout>
        </section>

        <section id="logs" className="scroll-mt-28">
          <h1>eth_getLogs patterns</h1>
          <p className="mb-2">Three common ways to query logs:</p>
          <ol className="list-decimal pl-6">
            <li><strong>By block range</strong>: narrow ranges to avoid timeouts/rate limits.</li>
            <li><strong>By contract address</strong>: filter to a single contract.</li>
            <li><strong>By topics</strong>: filter by event signature and indexed args.</li>
          </ol>

          <p className="mt-2">1) Block range (replace value of fromBlock):</p>
          <DocsCodeTabs
            tabs={[
              {
                label: "JSON",
                code: "{\n  \"jsonrpc\": \"2.0\",\n  \"method\": \"eth_getLogs\",\n  \"params\": [{ \"fromBlock\": \"0xABCDEF\", \"toBlock\": \"latest\" }],\n  \"id\": 1\n}"
              }
            ]}
          />

          <p>2) By address:</p>
          <DocsCodeTabs
            tabs={[
              {
                label: "JSON",
                code: "{\n  \"jsonrpc\": \"2.0\",\n  \"method\": \"eth_getLogs\",\n  \"params\": [{ \"address\": \"0xContractAddress\" , \"fromBlock\": \"0x0\", \"toBlock\": \"latest\" }],\n  \"id\": 1\n}"
              }
            ]}
          />

          <p>3) By topics (e.g., Transfer event hash):</p>
          <DocsCodeTabs
            tabs={[
              {
                label: "JSON",
                code: "{\n  \"jsonrpc\": \"2.0\",\n  \"method\": \"eth_getLogs\",\n  \"params\": [{ \"fromBlock\": \"0x0\", \"toBlock\": \"latest\", \"topics\": [\"0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef\"] }],\n  \"id\": 1\n}"
              }
            ]}
          />

          <Callout type="warning" title="Performance">
            Large ranges can timeout on public endpoints. Use smaller windows, pagination, or a provider with log index services.
          </Callout>
        </section>

        <section id="eth-call" className="scroll-mt-28">
          <h1>eth_call (read contract state)</h1>
          <p>Example: call <code>balanceOf(address)</code> on an ERC-20 (encoded data shown):</p>
          <DocsCodeTabs
            tabs={[
              {
                label: "JSON",
                code: "{\n  \"jsonrpc\": \"2.0\",\n  \"method\": \"eth_call\",\n  \"params\": [{ \"to\": \"0xTokenAddress\", \"data\": \"0x70a08231000000000000000000000000YourAddress...\" }, \"latest\"],\n  \"id\": 1\n}"
              }
            ]}
          />
          <Callout type="note">
            Use a tool like <em>ethers</em> or <em>viem</em> to encode function selectors & arguments. KraiNode focuses on raw JSON-RPC.
          </Callout>
        </section>

        <section id="custom-headers" className="scroll-mt-28">
          <h1>Adding Custom Headers or RPC URL</h1>
          <br />
          <p>
            Testing private endpoints? In the Playground, switch the provider to "Custom" and paste your RPC URL.
            Add headers like <code>Authorization</code> or API keys in the headers panel. Headers are sent only with
            your current request and never stored.
          </p>
        </section>

        <section id="troubleshooting" className="scroll-mt-28">
          <h1>Troubleshooting Common Errors</h1>
          <br />
          <ul>
            <li>
              <strong>CORS blocked</strong>: The RPC must allow browser origins. If not, use a proxy or a provider that
              supports browser access.
            </li>
            <li>
              <strong>Timeouts</strong>: Endpoint may be rate-limited or slow. Try fewer concurrent calls or another
              region/provider.
            </li>
            <li>
              <strong>Invalid params</strong>: Check method name, parameter order, and types against the provider docs.
            </li>
          </ul>
        </section>

        <section id="security" className="scroll-mt-28">
          <h1>Security Note</h1>
          <br />
          <p>
            KraiNode is fully client-side. We do not store your API keys, requests, or responses. Keys in headers are
            kept in-memory in your browser session only.
          </p>
        </section>
      </article>
    </Container>
  );
}


