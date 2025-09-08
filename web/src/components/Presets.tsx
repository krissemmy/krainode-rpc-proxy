interface PresetsProps {
  onPresetSelect: (method: string, params: any[]) => void
}

const PRESETS = [
  {
    name: 'Latest Block Number',
    method: 'eth_blockNumber',
    params: [],
    description: 'Get the latest block number'
  },
  {
    name: 'Chain ID',
    method: 'eth_chainId',
    params: [],
    description: 'Get the chain ID'
  },
  {
    name: 'Network Version',
    method: 'net_version',
    params: [],
    description: 'Get the network version'
  },
  {
    name: 'Get Balance (Vitalik)',
    method: 'eth_getBalance',
    params: ['0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', 'latest'],
    description: 'Get balance for Vitalik\'s address'
  },
  {
    name: 'Get Block (Latest)',
    method: 'eth_getBlockByNumber',
    params: ['latest', false],
    description: 'Get latest block header'
  },
  {
    name: 'Get Block (Full)',
    method: 'eth_getBlockByNumber',
    params: ['latest', true],
    description: 'Get latest block with transactions'
  },
  {
    name: 'Call Contract',
    method: 'eth_call',
    params: [
      {
        to: '0xA0b86a33E6441b8c4C8C0C4C0C4C0C4C0C4C0C4C',
        data: '0x70a08231000000000000000000000000d8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
      },
      'latest'
    ],
    description: 'Call a contract method'
  },
  {
    name: 'Gas Price',
    method: 'eth_gasPrice',
    params: [],
    description: 'Get current gas price'
  },
  {
    name: 'Transaction Count',
    method: 'eth_getTransactionCount',
    params: ['0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', 'latest'],
    description: 'Get transaction count for address'
  }
]

export function Presets({ onPresetSelect }: PresetsProps) {
  return (
    <div className="space-y-2">
      {PRESETS.map((preset, index) => (
        <button
          key={index}
          onClick={() => onPresetSelect(preset.method, preset.params)}
          className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
        >
          <div className="font-medium text-sm text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400">
            {preset.name}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {preset.description}
          </div>
          <div className="text-xs font-mono text-gray-600 dark:text-gray-300 mt-1">
            {preset.method}
          </div>
        </button>
      ))}
    </div>
  )
}
