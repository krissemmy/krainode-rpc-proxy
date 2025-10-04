import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink, Layers, ShieldCheck, Zap } from "lucide-react";
import { CodeTabs } from "@/components/CodeTabs";
import { Container, Section } from "@/components/layout";

interface ChainNetwork {
  name: string;
  providers: { name: string; url: string }[];
  defaultProvider: string;
}

interface ChainDetail {
  name: string;
  networks: ChainNetwork[];
}

const PROOF_POINTS = [
  {
    title: "Browser-native RPC",
    description: "Send JSON-RPC calls directly from the browser—no auth, no proxy, just fetch.",
    icon: ShieldCheck,
  },
  {
    title: "Provider picker",
    description: "Choose a preloaded endpoint per network or paste your own custom URL on the fly.",
    icon: Layers,
  },
  {
    title: "Live probes",
    description: "Validate CORS and connectivity instantly before you ship a request.",
    icon: Zap,
  },
] as const;

const HERO_SNIPPETS = [
  {
    id: "js",
    label: "JavaScript",
    code: `const response = await fetch("https://ethereum-rpc.publicnode.com", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    jsonrpc: "2.0",
    method: "eth_blockNumber",
    params: [],
    id: 1
  })
});

const { result } = await response.json();
console.log(result);`,
  },
  {
    id: "python",
    label: "Python",
    code: `import requests

payload = {
    "jsonrpc": "2.0",
    "method": "eth_blockNumber",
    "params": [],
    "id": 1,
}

response = requests.post(
    "https://ethereum-rpc.publicnode.com",
    json=payload,
)

print(response.json()["result"])`,
  },
  {
    id: "curl",
    label: "cURL",
    code: `curl \
  -X POST https://ethereum-rpc.publicnode.com \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_blockNumber",
    "params": [],
    "id": 1
  }'`,
  },
] as const;

export function Home() {
  const [chains, setChains] = useState<ChainDetail[]>([]);
  const [isLoadingChains, setIsLoadingChains] = useState(true);
  const [chainError, setChainError] = useState<string | null>(null);

  useEffect(() => {
    const loadChains = async () => {
      try {
        const response = await fetch("/chains.json");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const details = (await response.json()) as { chains: ChainDetail[] };
        setChains(Array.isArray(details?.chains) ? details.chains : []);
      } catch (error) {
        console.error("Failed to load chains", error);
        setChainError("Unable to load networks right now.");
      } finally {
        setIsLoadingChains(false);
      }
    };

    void loadChains();
  }, []);

  const networkBadges = useMemo(() => {
    return chains.flatMap((chain) =>
      chain.networks.map((network) => ({
        id: `${chain.name}-${network.name}`,
        chain: chain.name,
        network: network.name,
      }))
    );
  }, [chains]);

  return (
    <div className="bg-background text-foreground">
      {/* Hero */}
      <Section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-primary-50 via-white to-white dark:from-gray-900 dark:via-gray-950 dark:to-gray-950">
        <Container className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div>
            <span className="inline-flex items-center rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
              Postman for Multichain RPCs
            </span>
            <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              Test JSON-RPC endpoints without leaving the browser
            </h1>
            <p className="mt-3 text-base text-muted-foreground sm:mt-4 sm:text-lg">
              Choose from curated public providers or bring your own endpoint. The playground talks to your nodes directly—no proxy, no API keys.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/playground"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-primary-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 sm:px-6 sm:text-base"
              >
                Open Playground
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <a
                href="https://github.com/krissemmy/krainode-rpc-proxy"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center justify-center rounded-xl border px-4 text-sm font-semibold transition hover:border-primary-400 hover:text-primary-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 sm:px-6 sm:text-base"
              >
                View GitHub
                <ExternalLink className="ml-2 h-5 w-5" />
              </a>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-white/80 p-4 shadow-lg backdrop-blur dark:bg-gray-900/80 sm:p-6">
            <div className="overflow-x-auto">
              <CodeTabs snippets={HERO_SNIPPETS} />
            </div>
          </div>
        </Container>
      </Section>

      {/* Multichain strip */}
      <Section>
        <Container>
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-semibold sm:text-3xl">Run across every chain</h2>
            </div>
            <Link
              to="/playground"
              className="inline-flex items-center text-sm font-semibold text-primary-600 transition hover:text-primary-500 sm:text-base"
            >
              Explore in Playground
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 rounded-3xl border border-border bg-gray-50/60 p-6 dark:bg-gray-900/60">
            {isLoadingChains ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 sm:gap-4">
                {Array.from({ length: 12 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-14 animate-pulse rounded-xl bg-white/70 dark:bg-gray-800/60"
                  />
                ))}
              </div>
            ) : chainError ? (
              <div className="rounded-2xl bg-white/80 px-4 py-6 text-center text-sm text-red-600 shadow-inner dark:bg-gray-900/80 dark:text-red-400">
                {chainError}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 sm:gap-4">
                {networkBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className="truncate rounded-xl border border-border bg-white px-3 py-2 text-xs font-medium text-muted-foreground transition hover:border-primary-300 hover:text-primary-600 dark:bg-gray-950 sm:text-sm"
                  >
                    {badge.chain} • {badge.network}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Container>
      </Section>

      {/* Proof points */}
      <Section className="bg-gray-50 dark:bg-gray-900">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold sm:text-4xl">Built for developers exploring Web3</h2>
            <p className="mt-3 text-base text-muted-foreground sm:text-lg">
              Learn, test, and debug blockchain RPCs with a simple playground. Switch providers, run methods, and probe endpoints without setup.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {PROOF_POINTS.map(({ title, description, icon: Icon }) => (
              <div
                key={title}
                className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-1 hover:shadow-lg sm:p-6"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-200">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-3 text-sm text-muted-foreground sm:text-base">{description}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Final CTA */}
      <Section>
        <Container>
          <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 px-6 py-12 text-center shadow-xl sm:px-8">
            <div className="absolute -left-10 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-primary-500/20 blur-3xl" aria-hidden="true" />
            <div className="absolute -right-10 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-primary-400/30 blur-3xl" aria-hidden="true" />
            <div className="relative z-10 space-y-4">
              <h2 className="text-3xl font-semibold text-white sm:text-4xl">One playground for all your endpoints</h2>
              <p className="text-base text-gray-300 sm:text-lg">
                Explore, test, and debug blockchain RPCs in a single lightweight playground........built for onboarding and experimentation.
              </p>
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  to="/playground"
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-primary-500 px-6 text-sm font-semibold text-white shadow transition hover:bg-primary-400 sm:text-base"
                >
                  Open Playground
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
