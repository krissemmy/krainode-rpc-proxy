import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Copy, Check, AlertCircle, Activity, History, Trash2, Loader2 } from "lucide-react";
import { ChainSelect } from "../components/ChainSelect";
import { NetworkSelect } from "../components/NetworkSelect";
import { ProviderSelect } from "../components/ProviderSelect";
import { MethodSelect, getMethodParamsForChain } from "../components/MethodSelect";
import { JsonEditor } from "../components/JsonEditor";
import { JsonViewer } from "../components/JsonViewer";
import { Presets } from "../components/Presets";
import { rpcFetch, type RpcBody } from "../lib/rpc";
import { probeEndpoint } from "../lib/probe";

interface Provider {
  name: string;
  url: string;
}

interface Network {
  name: string;
  providers: Provider[];
  defaultProvider: string;
}

interface ChainDetails {
  name: string;
  networks: Network[];
}

interface ChainsDetailsResponse {
  chains: ChainDetails[];
}

interface RecentRun {
  endpointUrl: string;
  method: string;
  timestamp: number;
  ok: boolean;
  latency: number;
}

const STORAGE_KEYS = {
  chain: "krainode:lastChain",
  network: "krainode:lastNetwork",
  provider: "krainode:lastProvider",
  customUrl: "krainode:customUrl",
  customHeaders: "krainode:customHeaders",
  recent: "krainode:recent"
} as const;

const MAX_RECENT = 25;

export function Playground() {
  const [chainDetails, setChainDetails] = useState<ChainDetails[]>([]);
  const [chainsLoading, setChainsLoading] = useState(true);
  const [chainsError, setChainsError] = useState<string | null>(null);

  const [selectedChain, setSelectedChain] = useState<string>("");
  const [selectedNetwork, setSelectedNetwork] = useState<string>("");
  const [providerName, setProviderName] = useState<string>("");
  const [customUrl, setCustomUrl] = useState<string>("");
  const [customInput, setCustomInput] = useState<string>("");
  const [customHeaders, setCustomHeaders] = useState<string>("");
  const [customHeadersInput, setCustomHeadersInput] = useState<string>("");

  const [selectedMethod, setSelectedMethod] = useState<string>("eth_blockNumber");
  const [params, setParams] = useState<any[]>([]);
  const [requestJson, setRequestJson] = useState<string>("");
  const [responseData, setResponseData] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [probeResult, setProbeResult] = useState<{ ok: boolean; label: string } | null>(null);
  const [isProbing, setIsProbing] = useState(false);

  const [recentRuns, setRecentRuns] = useState<RecentRun[]>([]);

  const copyTimeoutRef = useRef<number>();
  const initialProviderSyncRef = useRef(true);
  const previousNetworkRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedChain = window.localStorage.getItem(STORAGE_KEYS.chain);
    const storedNetwork = window.localStorage.getItem(STORAGE_KEYS.network);
    const storedProvider = window.localStorage.getItem(STORAGE_KEYS.provider);
    const storedCustom = window.localStorage.getItem(STORAGE_KEYS.customUrl);
    const storedCustomHeaders = window.localStorage.getItem(STORAGE_KEYS.customHeaders);
    const storedRecent = window.localStorage.getItem(STORAGE_KEYS.recent);

    if (storedChain) setSelectedChain(storedChain);
    if (storedNetwork) setSelectedNetwork(storedNetwork);
    if (storedProvider) setProviderName(storedProvider);
    if (storedCustom) {
      setCustomUrl(storedCustom);
      setCustomInput(storedCustom);
    }
    if (storedCustomHeaders) {
      setCustomHeaders(storedCustomHeaders);
      setCustomHeadersInput(storedCustomHeaders);
    }
    if (storedRecent) {
      try {
        const parsed = JSON.parse(storedRecent) as RecentRun[];
        if (Array.isArray(parsed)) {
          setRecentRuns(parsed.slice(0, MAX_RECENT));
        }
      } catch (err) {
        console.warn("Failed to parse stored recents", err);
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadChains = async () => {
      setChainsLoading(true);
      setChainsError(null);
      try {
        const detailsData = await fetch("/chains.json");
        if (!detailsData.ok) throw new Error(`HTTP ${detailsData.status}`);
        const body = (await detailsData.json()) as ChainsDetailsResponse;
        if (!cancelled) {
          setChainDetails(Array.isArray(body?.chains) ? body.chains : []);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load chains:", err);
          setChainsError("Failed to load available chains.");
          setChainDetails([]);
        }
      } finally {
        if (!cancelled) setChainsLoading(false);
      }
    };
    void loadChains();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (chainDetails.length === 0) {
      setSelectedChain("");
      setSelectedNetwork("");
      return;
    }
    const chainNames = chainDetails.map((chain) => chain.name);
    if (!chainNames.includes(selectedChain)) {
      setSelectedChain(chainDetails[0].name);
      return;
    }
    const chain = chainDetails.find((c) => c.name === selectedChain);
    if (!chain) return;
    if (chain.networks.length === 0) {
      setSelectedNetwork("");
      return;
    }
    const networkNames = chain.networks.map((network) => network.name);
    if (!networkNames.includes(selectedNetwork)) {
      setSelectedNetwork(chain.networks[0].name);
    }
  }, [chainDetails, selectedChain, selectedNetwork]);

  const availableNetworks = useMemo(() => {
    const chain = chainDetails.find((c) => c.name === selectedChain);
    return chain?.networks ?? [];
  }, [chainDetails, selectedChain]);

  const selectedNetworkInfo = useMemo(() => {
    return availableNetworks.find((network) => network.name === selectedNetwork);
  }, [availableNetworks, selectedNetwork]);

  useEffect(() => {
    const net = selectedNetworkInfo;
    if (!net) {
      setProviderName("");
      return;
    }
    const defaultName = net.defaultProvider || net.providers[0]?.name || "";
    if (initialProviderSyncRef.current) {
      initialProviderSyncRef.current = false;
      if (!providerName || !net.providers.some((p) => p.name === providerName)) {
        setProviderName(defaultName);
      }
      previousNetworkRef.current = net.name;
      return;
    }
    if (previousNetworkRef.current !== net.name) {
      previousNetworkRef.current = net.name;
      setProviderName(defaultName);
      setCustomUrl("");
      setCustomInput("");
      setCustomHeaders("");
      setCustomHeadersInput("");
      setProbeResult(null);
      return;
    }
    if (!net.providers.some((p) => p.name === providerName)) {
      setProviderName(defaultName);
    }
  }, [selectedNetworkInfo, providerName]);

  useEffect(() => {
    const methods = Object.keys(getMethodParamsForChain(selectedChain));
    if (methods.length === 0) return;
    if (methods.includes(selectedMethod)) {
      setParams(getMethodParamsForChain(selectedChain)[selectedMethod] || []);
    } else {
      const first = methods[0];
      setSelectedMethod(first);
      setParams(getMethodParamsForChain(selectedChain)[first] || []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChain]);

  useEffect(() => {
    const request: RpcBody = { jsonrpc: "2.0", method: selectedMethod, params, id: 1 };
    setRequestJson(JSON.stringify(request, null, 2));
  }, [selectedMethod, params]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (selectedChain) window.localStorage.setItem(STORAGE_KEYS.chain, selectedChain);
  }, [selectedChain]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (selectedNetwork) window.localStorage.setItem(STORAGE_KEYS.network, selectedNetwork);
  }, [selectedNetwork]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (providerName) window.localStorage.setItem(STORAGE_KEYS.provider, providerName);
  }, [providerName]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (customUrl) {
      window.localStorage.setItem(STORAGE_KEYS.customUrl, customUrl);
    } else {
      window.localStorage.removeItem(STORAGE_KEYS.customUrl);
    }
  }, [customUrl]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (customHeaders) {
      window.localStorage.setItem(STORAGE_KEYS.customHeaders, customHeaders);
    } else {
      window.localStorage.removeItem(STORAGE_KEYS.customHeaders);
    }
  }, [customHeaders]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (recentRuns.length > 0) {
      window.localStorage.setItem(STORAGE_KEYS.recent, JSON.stringify(recentRuns.slice(0, MAX_RECENT)));
    } else {
      window.localStorage.removeItem(STORAGE_KEYS.recent);
    }
  }, [recentRuns]);

  const methodMap = useMemo(
    () => getMethodParamsForChain(selectedChain),
    [selectedChain]
  );

  const effectiveUrl = useMemo(() => {
    if (customUrl.trim()) return customUrl.trim();
    const net = selectedNetworkInfo;
    if (!net) return "";
    const provider = net.providers.find((p) => p.name === providerName) ?? net.providers[0];
    return provider?.url ?? "";
  }, [customUrl, providerName, selectedNetworkInfo]);

  const responseResult = useMemo(() => {
    if (!responseData || typeof responseData !== "object") return undefined;
    if (Array.isArray(responseData)) {
      const first = responseData[0];
      if (first && typeof first === "object" && "result" in first) {
        return (first as Record<string, unknown>).result;
      }
      return undefined;
    }
    if ("result" in (responseData as Record<string, unknown>)) {
      return (responseData as Record<string, unknown>).result;
    }
    return undefined;
  }, [responseData]);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = window.setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const recordRecent = (ok: boolean, method: string, endpointUrl: string, latency: number) => {
    if (!endpointUrl) return;
    setRecentRuns((prev) => {
      const entry: RecentRun = { endpointUrl, method, ok, timestamp: Date.now(), latency };
      return [entry, ...prev].slice(0, MAX_RECENT);
    });
  };

  const handleSendRequest = async () => {
    if (!effectiveUrl) {
      setError("Select a chain, network, and provider or supply a custom URL.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setResponseData(null);
    const startTime = Date.now();
    try {
      const parsed = JSON.parse(requestJson) as RpcBody | RpcBody[];
      if ((typeof parsed !== "object" || parsed === null) && !Array.isArray(parsed)) {
        throw new Error("Request must be a JSON object or array.");
      }
      const headers = customUrl && customHeaders ? parseHeaders(customHeaders) : undefined;
      const rpcResult = await rpcFetch(effectiveUrl, parsed, 40000, headers);
      const latency = Date.now() - startTime;
      const methodName = Array.isArray(parsed)
        ? (parsed[0]?.method as string | undefined) ?? selectedMethod
        : ((parsed as RpcBody).method ?? selectedMethod);
      if (rpcResult.ok) {
        setResponseData(rpcResult.data);
        recordRecent(true, methodName, effectiveUrl, latency);
      } else {
        const friendly =
          rpcResult.error.kind === "network_or_cors"
            ? "Network blocked (CORS or offline)."
            : rpcResult.error.kind === "timeout"
              ? "Request timed out."
              : rpcResult.error.message;
        setError(friendly);
        recordRecent(false, methodName, effectiveUrl, latency);
      }
    } catch (err) {
      const latency = Date.now() - startTime;
      const message = err instanceof Error ? err.message : "Invalid JSON request.";
      setError(message === "Unexpected end of JSON input" ? "Invalid JSON in request body." : message);
      const methodName = Array.isArray(JSON.parse(requestJson))
        ? (JSON.parse(requestJson)[0]?.method as string | undefined) ?? selectedMethod
        : ((JSON.parse(requestJson) as RpcBody).method ?? selectedMethod);
      recordRecent(false, methodName, effectiveUrl, latency);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePresetSelect = (method: string, presetParams: any[]) => {
    setSelectedMethod(method);
    setParams(presetParams);
  };

  const applyCustomUrl = () => {
    const trimmed = customInput.trim();
    setCustomUrl(trimmed);
    if (!trimmed) {
      setProbeResult(null);
      setCustomHeaders("");
      setCustomHeadersInput("");
    }
  };

  const applyCustomHeaders = () => {
    const trimmed = customHeadersInput.trim();
    setCustomHeaders(trimmed);
  };

  const parseHeaders = (headersString: string): Record<string, string> | undefined => {
    if (!headersString.trim()) return undefined;
    try {
      const parsed = JSON.parse(headersString);
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed;
      }
    } catch (e) {
      // Invalid JSON, return undefined
    }
    return undefined;
  };

  const handleProbe = async () => {
    if (!effectiveUrl) return;
    setIsProbing(true);
    setProbeResult(null);
    try {
      const headers = customUrl && customHeaders ? parseHeaders(customHeaders) : undefined;
      const result = await probeEndpoint(effectiveUrl, 10000, headers);
      setProbeResult(result);
    } finally {
      setIsProbing(false);
    }
  };

  const clearLocalData = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEYS.chain);
      window.localStorage.removeItem(STORAGE_KEYS.network);
      window.localStorage.removeItem(STORAGE_KEYS.provider);
      window.localStorage.removeItem(STORAGE_KEYS.customUrl);
      window.localStorage.removeItem(STORAGE_KEYS.customHeaders);
      window.localStorage.removeItem(STORAGE_KEYS.recent);
    }
    setRecentRuns([]);
    setCustomUrl("");
    setCustomInput("");
    setCustomHeaders("");
    setCustomHeadersInput("");
    setProbeResult(null);
    initialProviderSyncRef.current = true;
    previousNetworkRef.current = null;
    if (chainDetails[0]) {
      setSelectedChain(chainDetails[0].name);
      const firstNetwork = chainDetails[0].networks[0]?.name ?? "";
      setSelectedNetwork(firstNetwork);
    } else {
      setSelectedChain("");
      setSelectedNetwork("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">JSON-RPC Playground</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Run JSON-RPC calls directly from your browser. Pick a chain, choose a provider, or paste any HTTP/HTTPS endpoint.
            </p>
          </div>
          <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-800 flex items-start gap-2">
            <svg className="w-5 h-5 mt-0.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5 8V6a5 5 0 1110 0v2h1a1 1 0 011 1v9a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1h1zm2-2a3 3 0 016 0v2H7V6z" clip-rule="evenodd" />
            </svg>
            <p>
              <strong>No backend storage:</strong> Headers and API keys stay in your browser only. 
              KraiNode never saves or logs your requests.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Chain</h3>
                <ChainSelect chains={chainDetails} selectedChain={selectedChain} onChainChange={setSelectedChain} />
                {chainsLoading && (
                  <p className="mt-3 text-sm text-muted-foreground">Loading chain list…</p>
                )}
                {chainsError && (
                  <p className="mt-3 text-sm text-red-500">{chainsError}</p>
                )}
              </div>

              <div className="card space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Network</h3>
                  <button
                    onClick={clearLocalData}
                    className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear local data
                  </button>
                </div>
                <NetworkSelect
                  networks={availableNetworks}
                  selectedNetwork={selectedNetwork}
                  onNetworkChange={(network) => {
                    setSelectedNetwork(network);
                    setProbeResult(null);
                  }}
                />

                {selectedNetworkInfo ? (
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Provider</div>
                      <ProviderSelect
                        providers={selectedNetworkInfo.providers}
                        selectedName={providerName}
                        onChange={(name) => {
                          setProviderName(name);
                          setCustomUrl("");
                          setCustomInput("");
                          setCustomHeaders("");
                          setCustomHeadersInput("");
                          setProbeResult(null);
                        }}
                      />
                    </div>

                    <div>
                      <label htmlFor="custom-url" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Custom URL
                      </label>
                      <div className="mt-1 flex flex-col gap-2 sm:flex-row">
                        <input
                          id="custom-url"
                          type="url"
                          placeholder="http://localhost:8545 or https://<ur-custom-rpc-endpoint.com>"
                          value={customInput}
                          onChange={(e) => setCustomInput(e.target.value)}
                          className="input flex-1"
                        />
                        <button
                          onClick={applyCustomUrl}
                          className="btn-outline text-sm"
                        >
                          Use
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Leave blank to use the selected provider. HTTP and HTTPS endpoints supported.
                      </p>
                    </div>

                    {customUrl && (
                      <div>
                        <label htmlFor="custom-headers" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Custom Headers (Optional)
                        </label>
                        <div className="mt-1 flex flex-col gap-2 sm:flex-row">
                          <textarea
                            id="custom-headers"
                            placeholder='{"x-api-key": "your-api-key", "Authorization": "Bearer token"}'
                            value={customHeadersInput}
                            onChange={(e) => setCustomHeadersInput(e.target.value)}
                            className="input flex-1 min-h-[80px] font-mono text-sm"
                            rows={3}
                          />
                          <button
                            onClick={applyCustomHeaders}
                            className="btn-outline text-sm self-start"
                          >
                            Apply
                          </button>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          JSON format. Only used when custom URL is set. Leave empty if API key is in URL.
                        </p>
                      </div>
                    )}

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <button
                        onClick={handleProbe}
                        disabled={!effectiveUrl || isProbing}
                        className="btn-outline inline-flex items-center text-sm"
                      >
                        {isProbing ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Activity className="mr-2 h-4 w-4" />
                        )}
                        Probe endpoint
                      </button>
                      {probeResult && (
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                            probeResult.ok
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                          }`}
                        >
                          {probeResult.label}
                        </span>
                      )}
                    </div>

                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Your API URL:</div>
                      <div className="font-mono text-sm text-gray-900 dark:text-gray-100 flex items-center justify-between gap-2">
                        <span className="truncate">{effectiveUrl || "Select a provider"}</span>
                        {effectiveUrl && (
                          <button
                            onClick={() => copyToClipboard(effectiveUrl, "url")}
                            className="ml-2 inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-muted-foreground hover:bg-gray-200 dark:hover:bg-gray-700"
                          >
                            {copiedField === "url" ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No networks available.</p>
                )}
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Method</h3>
                <MethodSelect
                  chain={selectedChain}
                  selectedMethod={selectedMethod}
                  onMethodChange={(method) => {
                    setSelectedMethod(method);
                    setParams(methodMap[method] || []);
                  }}
                />
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Presets</h3>
                <Presets onPresetSelect={handlePresetSelect} />
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Request</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleSendRequest}
                      disabled={isLoading || !effectiveUrl}
                      className="btn-primary flex items-center text-sm"
                    >
                      {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4 mr-2" />
                      )}
                      Send Request
                    </button>
                    <button
                      onClick={() => copyToClipboard(requestJson, "request")}
                      className="btn-outline flex items-center text-sm"
                    >
                      {copiedField === "request" ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />} Copy
                    </button>
                  </div>
                </div>
                <div className="min-h-[220px] sm:min-h-[280px]">
                  <JsonEditor value={requestJson} onChange={setRequestJson} placeholder="Enter JSON-RPC request..." />
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Response</h3>
                  {responseData && (responseData as any) && (
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(responseData, null, 2), "response")}
                      className="btn-outline flex items-center text-sm"
                    >
                      {copiedField === "response" ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />} Copy
                    </button>
                  )}
                </div>

                {error && (
                  <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                      <span className="text-red-800 dark:text-red-200 font-medium">Error</span>
                    </div>
                    <p className="text-red-700 dark:text-red-300 mt-1">{error}</p>
                  </div>
                )}

                {responseData && (responseData as any) && (
                  <div className="space-y-4">
                    {typeof responseResult !== "undefined" && responseResult !== null && (
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Result</div>
                        <div className="font-mono text-[13px] break-all">
                          {selectedMethod === "eth_blockNumber" && typeof responseResult === "string" && /^0x[0-9a-fA-F]+$/.test(responseResult) ? (
                            <span>Block Number: {parseInt(responseResult, 16).toLocaleString()}</span>
                          ) : (
                            <>
                              {String(responseResult)}
                              {typeof responseResult === "string" && /^0x[0-9a-fA-F]+$/.test(responseResult) && (
                                <span className="opacity-80"> (dec: {parseInt(responseResult, 16)})</span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="max-h-[50vh] overflow-auto">
                      <JsonViewer data={responseData} collapsed={1} showRootSummary={false} />
                    </div>
                  </div>
                )}

                {!responseData && !error && !isLoading && (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <Play className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Click "Send Request" to test your JSON-RPC call</p>
                  </div>
                )}

                {isLoading && (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <Loader2 className="w-6 h-6 mx-auto mb-3 animate-spin" />
                    <p>Waiting for response…</p>
                  </div>
                )}
              </div>

              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Recent requests
                  </h3>
                </div>
                {recentRuns.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Your last 25 requests will appear here.</p>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    <ul className="space-y-2">
                      {recentRuns.map((run, index) => (
                      <li
                        key={`${run.timestamp}-${index}`}
                        className="rounded-lg border border-border bg-gray-50/80 p-3 text-sm dark:bg-gray-900/40"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className={`font-medium ${run.ok ? "text-emerald-600 dark:text-emerald-300" : "text-red-600 dark:text-red-300"}`}>
                            {run.ok ? "OK" : "Error"}
                          </span>
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground">
                              {new Date(run.timestamp).toLocaleString([], { 
                                month: "short", 
                                day: "numeric", 
                                hour: "2-digit", 
                                minute: "2-digit",
                                second: "2-digit"
                              })}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {run.latency}ms
                            </div>
                          </div>
                        </div>
                        <div className="mt-1 font-mono text-xs text-gray-700 dark:text-gray-300 break-all" title={run.endpointUrl}>
                          {run.endpointUrl}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">{run.method}</div>
                      </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
