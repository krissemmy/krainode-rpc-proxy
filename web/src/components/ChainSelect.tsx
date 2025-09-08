import { ChevronDown } from 'lucide-react'

interface Chain {
  slug: string
  apiUrl: string
}

interface ChainSelectProps {
  chains: Chain[]
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
          <option key={chain.slug} value={chain.slug}>
            {chain.slug.charAt(0).toUpperCase() + chain.slug.slice(1)}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
    </div>
  )
}
