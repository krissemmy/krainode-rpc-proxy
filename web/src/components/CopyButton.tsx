import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        } catch {
          setCopied(false);
        }
      }}
      className="shrink-0 rounded-md border border-white/10 px-2 py-1 text-xs text-gray-400 transition-colors hover:border-white/20 hover:bg-white/5 hover:text-white"
      aria-label="Copy to clipboard"
      type="button"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
