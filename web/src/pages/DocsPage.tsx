import { useEffect, useMemo, useRef, useState } from "react";
import { Container } from "@/components/layout";
import DocsSidebar, { DocSection } from "@/components/DocsSidebar";

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
      <article className="prose prose-zinc max-w-3xl dark:prose-invert space-y-12 md:space-y-16">
        <section id="intro">
          <h1>Intro to KraiNode</h1>
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

        <section id="first-request">
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

        <section id="custom-headers">
          <h1>Adding Custom Headers or RPC URL</h1>
          <br />
          <p>
            Testing private endpoints? In the Playground, switch the provider to "Custom" and paste your RPC URL.
            Add headers like <code>Authorization</code> or API keys in the headers panel. Headers are sent only with
            your current request and never stored.
          </p>
        </section>

        <section id="troubleshooting">
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

        <section id="security">
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


