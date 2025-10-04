type Provider = { name: string; url: string };

interface Props {
  providers: Provider[];
  selectedName: string;
  onChange: (name: string) => void;
}

export function ProviderSelect({ providers, selectedName, onChange }: Props) {
  return (
    <div className="relative">
      <select
        className="select w-full appearance-none pr-10"
        value={selectedName}
        onChange={e => onChange(e.target.value)}
      >
        {providers.map(p => (
          <option key={p.name} value={p.name}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
  );
}
