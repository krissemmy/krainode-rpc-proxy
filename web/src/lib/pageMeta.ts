import { useEffect } from "react";

export const SITE_URL = "https://krainode.krissemmy.com";

// One entry per route. scripts/prerender.mjs writes these into each route's
// static HTML at build time; the hook applies them on client-side navigation.
// The "/" entry must match the title and description in index.html.
export const pageMeta = {
  "/": {
    title: "KraiNode - The Postman for blockchain RPCs",
    description:
      "Test and debug blockchain JSON-RPC calls in your browser. KraiNode helps developers explore, compare, and measure latency across multiple providers — no backend or API key storage.",
  },
  "/playground": {
    title: "JSON-RPC Playground for Blockchain RPC Endpoints | KraiNode",
    description:
      "Send raw JSON-RPC requests to Ethereum, Base, Arbitrum, and other chains from your browser. Probe endpoints, switch providers or use your own URL, and inspect responses and latency.",
  },
  "/docs": {
    title: "Docs: Send, Inspect, and Debug Blockchain JSON-RPC Requests | KraiNode",
    description:
      "KraiNode is a browser-native request workspace for blockchain developers. Learn to test an endpoint, read blocks and contract state, filter event logs, batch requests, and diagnose RPC errors.",
  },
  "/about": {
    title: "About KraiNode: Open-Source RPC Playground by Emmanuel Christopher",
    description:
      "KraiNode is an open-source JSON-RPC playground for Web3 developers, built by Emmanuel Christopher. Ping any chain, inspect responses, and debug RPC endpoints from the browser.",
  },
} as const;

export type PagePath = keyof typeof pageMeta;

export function usePageMeta(path: PagePath) {
  useEffect(() => {
    const { title, description } = pageMeta[path];
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", description);

    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = `${SITE_URL}${path}`;
  }, [path]);
}
