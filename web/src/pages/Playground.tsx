import { useState, useEffect, useMemo } from "react";
import { Play, Copy, Check, AlertCircle } from "lucide-react";
import { ChainSelect } from "../components/ChainSelect";
import { NetworkSelect } from "../components/NetworkSelect";
import { MethodSelect, getMethodParamsForChain } from "../components/MethodSelect";
import { JsonEditor } from "../components/JsonEditor";
import { JsonViewer } from "../components/JsonViewer";
import { Presets } from "../components/Presets";
import { apiRequest } from "../lib/api";

interface Network {
  name: string;
  apiUrl: string;
}

interface ChainDetails {
  name: string;
  networks: Network[];
}

interface RpcRequest {
  jsonrpc: string;
  method: string;
  params: any[];
  id: number;
}

interface RpcResponse {
  jsonrpc: string;
  id: number;
  result?: any;
  error?: {
    code: number;
    message: string;
  };
  meta?: {
    durationMs: number;
  };
}

export function Playground() {
  const [chainDetails, setChainDetails] = useState<ChainDetails[]>([]);
  const [selectedChain, setSelectedChain] = useState<string>("ethereum");
  const [selectedNetwork, setSelectedNetwork] = useState<string>("mainnet");
  const [selectedMethod, setSelectedMethod] = useState<string>("eth_blockNumber");
  const [params, setParams] = useState<any[]>([]);
  const [requestJson, setRequestJson] = useState<string>("");
  const [response, setResponse] = useState<RpcResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadChains = async () => {
      try {
        // Load detailed chain information
        const detailsData = await apiRequest("/api/chains/details");
        
        setChainDetails(detailsData.chains);
        
        if (detailsData.chains.length > 0) {
          const firstChain = detailsData.chains[0];
          setSelectedChain(firstChain.name);
          if (firstChain.networks.length > 0) {
            setSelectedNetwork(firstChain.networks[0].name);
          }
        }
      } catch (err) {
        console.error("Failed to load chains:", err);
        setError("Failed to load available chains");
      }
    };
    loadChains();
  }, []);

  // Get available networks for the selected chain
  const availableNetworks = useMemo(() => {
    const chainDetail = chainDetails.find((c: ChainDetails) => c.name === selectedChain);
    return chainDetail?.networks || [];
  }, [chainDetails, selectedChain]);

  // Reset network selection when chain changes
  useEffect(() => {
    if (availableNetworks.length > 0) {
      const networkExists = availableNetworks.some((n: Network) => n.name === selectedNetwork);
      if (!networkExists) {
        setSelectedNetwork(availableNetworks[0].name);
      }
    }
  }, [selectedChain, availableNetworks, selectedNetwork]);

  // Auto-select network when chain changes (especially for chains with single network)
  useEffect(() => {
    if (availableNetworks.length === 1) {
      setSelectedNetwork(availableNetworks[0].name);
    }
  }, [availableNetworks]);

  const methodMap = useMemo(
    () => getMethodParamsForChain(selectedChain),
    [selectedChain]
  );

  useEffect(() => {
    const methods = Object.keys(methodMap);
    if (methods.length === 0) return;
  
    if (methods.includes(selectedMethod)) {
      // keep current method, just swap its example params for this chain
      setParams(methodMap[selectedMethod] || []);
    } else {
      // pick the first method for this chain
      const first = methods[0];
      setSelectedMethod(first);
      setParams(methodMap[first] || []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChain, methodMap]);

  useEffect(() => {
    const request: RpcRequest = { jsonrpc: "2.0", method: selectedMethod, params, id: 1 };
    setRequestJson(JSON.stringify(request, null, 2));
  }, [selectedMethod, params]);

  const handleMethodChange = (method: string) => {
    setSelectedMethod(method);
    setParams(getMethodParamsForChain(selectedChain)[method] || []);
  };

  const handlePresetSelect = (method: string, presetParams: any[]) => {
    setSelectedMethod(method);
    setParams(presetParams);
  };

  const handleNetworkChange = (network: string) => {
    setSelectedNetwork(network);
  };


  const handleSendRequest = async () => {
    if (!selectedChain || !selectedNetwork) { setError("Please select a chain and network"); return; }
    setIsLoading(true); setError(null); setResponse(null);
    try {
      const requestBody = JSON.parse(requestJson);
      const data = await apiRequest(`/api/rpc/${selectedChain}/${selectedNetwork}/json`, {
        method: "POST",
        body: JSON.stringify(requestBody),
      });
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally { setIsLoading(false); }
  };

  const handlePing = async () => {
    if (!selectedChain || !selectedNetwork) { setError("Please select a chain and network"); return; }
    setIsLoading(true); setError(null); setResponse(null);
    try {
      const data = await apiRequest(`/api/rpc/${selectedChain}/${selectedNetwork}/ping`);
      setResponse({ jsonrpc: "2.0", id: 1, result: data.ok ? `Block: ${data.blockNumber}` : `Error: ${data.error}`, meta: { durationMs: data.durationMs } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ping failed");
    } finally { setIsLoading(false); }
  };

  const copyToClipboard = async (text: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch (err) { console.error("Failed to copy:", err); }
  };

  const selectedNetworkInfo = availableNetworks.find((n: Network) => n.name === selectedNetwork);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">JSON-RPC Playground</h1>
            <p className="text-gray-600 dark:text-gray-300">Test JSON-RPC methods against your KraiNode proxy endpoints</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left */}
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Chain</h3>
                <ChainSelect chains={chainDetails} selectedChain={selectedChain} onChainChange={setSelectedChain} />
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Network</h3>
                <NetworkSelect 
                  networks={availableNetworks} 
                  selectedNetwork={selectedNetwork} 
                  onNetworkChange={handleNetworkChange} 
                />
                {selectedNetworkInfo && (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Your API URL:</div>
                    <div className="font-mono text-sm text-gray-900 dark:text-gray-100 flex items-center justify-between">
                      <span className="truncate">{selectedNetworkInfo.apiUrl}</span>
                      <button onClick={() => copyToClipboard(selectedNetworkInfo.apiUrl)} className="ml-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" title="Copy URL">
                        {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-500" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Method</h3>
                <MethodSelect
                  chain={selectedChain}
                  selectedMethod={selectedMethod}
                  onMethodChange={handleMethodChange}
                />
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Presets</h3>
                <Presets onPresetSelect={handlePresetSelect} />
              </div>
            </div>

            {/* Right */}
            <div className="lg:col-span-2 space-y-6">
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Request</h3>
                  <div className="flex items-center space-x-2">
                    <button onClick={handleSendRequest} disabled={isLoading || !selectedChain || !selectedNetwork} className="btn-primary flex items-center text-sm">
                      {isLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : (<><Play className="w-4 h-4 mr-2" />Send Request</>)}
                    </button>
                    <button onClick={handlePing} disabled={isLoading || !selectedChain || !selectedNetwork} className="btn-outline flex items-center text-sm">
                      {isLoading ? <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" /> : (<><Play className="w-4 h-4 mr-2" />Ping</>)}
                    </button>
                    <button onClick={() => copyToClipboard(requestJson)} className="btn-outline flex items-center text-sm">
                      {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />} Copy
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
                  {response && (
                    <button onClick={() => copyToClipboard(JSON.stringify(response, null, 2))} className="btn-outline flex items-center text-sm">
                      {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />} Copy
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

                {response && (
                  <div className="space-y-4">
                    {typeof response.result !== "undefined" && (
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Result</div>
                        <div className="font-mono text-[13px] break-all">
                          {String(response.result)}
                          {typeof response.result === "string" && /^0x[0-9a-fA-F]+$/.test(response.result) && (
                            <span className="opacity-80"> (dec: {parseInt(response.result, 16)})</span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="max-h-[50vh] overflow-auto">
                      <JsonViewer data={response} collapsed={1} showRootSummary={false} />
                    </div>

                    {response.meta && (
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Duration: <span className="font-mono">{response.meta.durationMs}ms</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {!response && !error && !isLoading && (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <Play className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Click "Send Request" to test your JSON-RPC call</p>
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
