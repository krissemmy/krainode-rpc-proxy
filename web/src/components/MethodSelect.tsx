import { useEffect, useMemo } from 'react'
import { ChevronDown } from 'lucide-react'

interface MethodSelectProps {
  selectedMethod: string
  onMethodChange: (method: string) => void
  /** e.g. "ethereum" | "avail" */
  chain?: string
}

// Method parameter templates based on Ethereum JSON-RPC specification
export const METHOD_PARAMS: Record<string, any[]> = {
  'eth_blobBaseFee': [],
  'eth_blockNumber': [],
  'eth_call': [
    {
      "to": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
      "data": "0x70a08231000000000000000000000000d8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
    },
    "latest"
  ],
  'eth_callMany': [
    [
      {
        "to": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
        "data": "0x70a08231000000000000000000000000d8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
      },
      "latest"
    ]
  ],
  'eth_chainId': [],
  'eth_estimateGas': [
    {
      "to": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
      "data": "0x70a08231000000000000000000000000d8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
    },
    "latest"
  ],
  'eth_feeHistory': [
    "0x4",
    "latest",
    [25, 75]
  ],
  'eth_gasPrice': [],
  'eth_getAccount': [
    "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    "latest"
  ],
  'eth_getBalance': [
    "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    "latest"
  ],
  'eth_getBlockByHash': [
    "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    false
  ],
  'eth_getBlockByNumber': [
    "latest",
    false
  ],
  'eth_getBlockReceipts': [
    "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
  ],
  'eth_getBlockTransactionCountByHash': [
    "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
  ],
  'eth_getBlockTransactionCountByNumber': [
    "latest"
  ],
  'eth_getCode': [
    "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    "latest"
  ],
  'eth_getFilterChanges': [
    "0x1"
  ],
  'eth_getFilterLogs': [
    "0x1"
  ],
  'eth_getLogs': [
    {
      "fromBlock": "0x1",
      "toBlock": "latest",
      "address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
      "topics": ["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"]
    }
  ],
  'eth_getProof': [
    "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    ["0x0000000000000000000000000000000000000000000000000000000000000000"],
    "latest"
  ],
  'eth_getStorageAt': [
    "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    "0x0",
    "latest"
  ],
  'eth_getTransactionByBlockHashAndIndex': [
    "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    "0x0"
  ],
  'eth_getTransactionByBlockNumberAndIndex': [
    "latest",
    "0x0"
  ],
  'eth_getTransactionByHash': [
    "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
  ],
  'eth_getRawTransactionByHash': [
    "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
  ],
  'eth_getTransactionCount': [
    "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    "latest"
  ],
  'eth_getTransactionReceipt': [
    "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
  ],
  'eth_hashrate': [],
  'eth_maxPriorityFeePerGas': [],
  'eth_mining': [],
  'eth_newBlockFilter': [],
  'eth_newFilter': [
    {
      "fromBlock": "latest",
      "toBlock": "latest",
      "address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
    }
  ],
  'eth_newPendingTransactionFilter': [],
  'eth_signTransaction': [
    {
      "from": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
      "to": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
      "gas": "0x5208",
      "gasPrice": "0x4a817c800",
      "value": "0x0",
      "data": "0x"
    }
  ],
  'eth_simulateV1': [
    {
      "from": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
      "to": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
      "data": "0x70a08231000000000000000000000000d8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
    },
    "latest"
  ],
  'eth_syncing': [],
  'eth_uninstallFilter': [
    "0x1"
  ],
}

/** Minimal Substrate/Avail RPC examples */
export const AVAIL_METHOD_PARAMS: Record<string, any[]> = {
  // system
  rpc_methods: [],
  system_name: [],
  system_version: [],
  system_chain: [],
  system_properties: [],
  system_health: [],

  // chain (headers/blocks/finality)
  'chain_getFinalizedHead': [],
  'chain_getHeader': [
    // block hash (optional). If omitted, latest.
    '0x0000000000000000000000000000000000000000000000000000000000000000'
  ],
  'chain_getBlock': [
    // block hash (optional). If omitted, latest.
    '0x0000000000000000000000000000000000000000000000000000000000000000'
  ],
  'chain_getBlockHash': [
    // block number (hex) e.g. "0x1"
    '0x1'
  ],

  // state (storage/metadata/runtime)
  'state_getStorage': [
    // storage key (hex), block hash (optional)
    '0x3a636f6465', // example: ":code" key (just a placeholder)
    '0x0000000000000000000000000000000000000000000000000000000000000000'
  ],
  'state_getKeysPaged': [
    // prefix, count, startKey (nullable), at (optional)
    '0x',  // prefix
    100,   // count
    null,  // startKey
    null   // at
  ],
  'state_getMetadata': [],
  'state_getRuntimeVersion': [],

  // transaction fee info / submit
  'payment_queryInfo': [
    // SCALE-encoded extrinsic (hex), at (optional)
    '0x00'
  ],
  payment_queryFeeDetails: ["0x00"],     // same as above
  // ---- Accounts ----
  // Example SS58 (Alice dev addr). Replace with a real Avail address for best results.
  system_accountNextIndex: ["5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"],

  // ---- Avail-specific (safe) ----
  kate_blockLength: [],
}


/** Helper to select the right method map for a given chain */
export const getMethodParamsForChain = (chain?: string): Record<string, any[]> => {
  const slug = (chain ?? '').toLowerCase()
  if (slug.includes('avail')) return AVAIL_METHOD_PARAMS
  return METHOD_PARAMS // default: ethereum
}


// const METHODS = Object.keys(METHOD_PARAMS)

export function MethodSelect({ selectedMethod, onMethodChange, chain }: MethodSelectProps) {
  const params = useMemo(() => getMethodParamsForChain(chain), [chain])
  const methods = useMemo(() => Object.keys(params), [params])

  // If chain changes and current method doesn't exist, pick the first available
  useEffect(() => {
    if (methods.length === 0) return
    if (!methods.includes(selectedMethod)) {
      onMethodChange(methods[0])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chain, methods.join('|')])

  return (
    <div className="relative">
      <select
        value={selectedMethod}
        onChange={(e) => onMethodChange(e.target.value)}
        className="select w-full appearance-none pr-10"
      >
        {methods.map((method) => (
          <option key={method} value={method}>
            {method}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
    </div>
  )
}

// export function MethodSelect({ selectedMethod, onMethodChange }: MethodSelectProps) {
//   return (
//     <div className="relative">
//       <select
//         value={selectedMethod}
//         onChange={(e) => onMethodChange(e.target.value)}
//         className="select w-full appearance-none pr-10"
//       >
//         {METHODS.map((method) => (
//           <option key={method} value={method}>
//             {method}
//           </option>
//         ))}
//       </select>
//       <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
//     </div>
//   )
// }
