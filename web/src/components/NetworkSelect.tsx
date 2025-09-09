import { ChevronDown } from 'lucide-react'

interface Network {
  name: string
  apiUrl: string
}

interface NetworkSelectProps {
  networks: Network[]
  selectedNetwork: string
  onNetworkChange: (network: string) => void
}

export function NetworkSelect({ networks, selectedNetwork, onNetworkChange }: NetworkSelectProps) {
  return (
    <div className="relative">
      <select
        value={selectedNetwork}
        onChange={(e) => onNetworkChange(e.target.value)}
        className="select w-full appearance-none pr-10"
        disabled={networks.length === 0}
      >
        {networks.length === 0 ? (
          <option value="">No networks available</option>
        ) : (
          networks.map((network) => (
            <option key={network.name} value={network.name}>
              {network.name.charAt(0).toUpperCase() + network.name.slice(1)}
            </option>
          ))
        )}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
    </div>
  )
}
