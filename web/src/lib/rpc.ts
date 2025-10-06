export type RpcBody = { jsonrpc: '2.0'; id: number | string; method: string; params: any[] };

// 40 second timeout to handle complex operations like eth_call and eth_getLogs
export async function rpcFetch(url: string, body: RpcBody | RpcBody[], timeoutMs = 40000, customHeaders?: Record<string, string>) {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: 'POST',
      signal: ctrl.signal,
      headers: { 
        'content-type': 'application/json',
        ...customHeaders
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { ok: true as const, data: await res.json() };
  } catch (err: any) {
    const msg = String(err?.message || err);
    const kind = msg.includes('Failed to fetch') ? 'network_or_cors'
              : msg.includes('aborted') ? 'timeout'
              : 'error';
    return { ok: false as const, error: { kind, message: msg } };
  } finally {
    clearTimeout(to);
  }
}
