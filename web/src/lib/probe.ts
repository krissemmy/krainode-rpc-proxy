export async function probeEndpoint(url: string, timeoutMs = 10000, customHeaders?: Record<string, string>) {
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
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'web3_clientVersion', params: [] })
    });
    if (!res.ok) return { ok: false as const, label: `HTTP ${res.status}` };
    const j = await res.json().catch(() => null);
    return { ok: true as const, label: j?.result ? 'OK' : 'OK (no result)' };
  } catch (e: any) {
    return { ok: false as const, label: e?.name === 'AbortError' ? 'Timeout' : 'Blocked (CORS/Network)' };
  } finally {
    clearTimeout(to);
  }
}
