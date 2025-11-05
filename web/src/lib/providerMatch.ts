import { PROVIDERS, type ProviderMeta } from "../providerMap";

export type RpcItem = { label: string; url: string };

function hostnameOf(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function matchesMeta(meta: ProviderMeta, rpc: RpcItem): boolean {
  const host = hostnameOf(rpc.url) ?? "";
  const label = (rpc.label ?? "").toLowerCase();
  const byLabel = meta.match?.labels?.some((l) => l.toLowerCase() === label);
  const byHost = meta.match?.hostIncludes?.some((substr) =>
    host.includes(substr.toLowerCase())
  );
  return Boolean(byLabel || byHost);
}

function isWithinScope(
  meta: ProviderMeta,
  chainId: string,
  networkId: string
): boolean {
  if (!meta.spotlightScopes || meta.spotlightScopes.length === 0) return true;
  const normalizedChain = chainId.trim().toLowerCase();
  const normalizedNetwork = networkId.trim().toLowerCase();
  if (!normalizedChain || !normalizedNetwork) return false;

  return meta.spotlightScopes.some((scope) => {
    if (scope.chain.trim().toLowerCase() !== normalizedChain) return false;
    const networks = scope.networks ?? [];
    if (networks.length === 0) return true;
    return networks.some((net) => net.trim().toLowerCase() === normalizedNetwork);
  });
}

/**
 * Return the first spotlight provider that matches ANY RPC in the selected network.
 * NOTE: Depends only on presence in the list (not which RPC is selected) and optional
 * spotlightScopes restrictions on the provider metadata.
 */
export function findNetworkSpotlight(
  chainId: string,
  networkId: string,
  allRpcsInNetwork: RpcItem[]
): ProviderMeta | null {
  const metas = Object.values(PROVIDERS).filter(
    (m) => m.spotlight && isWithinScope(m, chainId, networkId)
  );
  for (const rpc of allRpcsInNetwork ?? []) {
    const hit = metas.find((m) => matchesMeta(m, rpc));
    if (hit) return hit;
  }
  return null;
}