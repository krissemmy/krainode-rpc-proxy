import { ChevronDown } from 'lucide-react'

interface ChainDetails {
  name: string
  networks: Array<{
    name: string
    apiUrl: string
  }>
}

interface ChainSelectProps {
  chains: ChainDetails[]
  selectedChain: string
  onChainChange: (chain: string) => void
}

export function ChainSelect({ chains, selectedChain, onChainChange }: ChainSelectProps) {
  return (
    <div className="relative">
      <select
        value={selectedChain}
        onChange={(e) => onChainChange(e.target.value)}
        className="select w-full appearance-none pr-10"
      >
        {chains.map((chain) => (
          <option key={chain.name} value={chain.name}>
            {chain.name.charAt(0).toUpperCase() + chain.name.slice(1)}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
    </div>
  )
}
