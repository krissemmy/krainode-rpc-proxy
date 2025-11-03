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
        } catch {}
      }}
      className="text-xs rounded-md border px-2 py-1 hover:bg-white/5"
      aria-label="Copy to clipboard"
      type="button"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}


