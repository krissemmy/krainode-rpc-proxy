import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";

export interface CodeSnippet {
  id: string;
  label: string;
  code: string;
}

interface CodeTabsProps {
  snippets: readonly CodeSnippet[] | CodeSnippet[];
}

export function CodeTabs({ snippets }: CodeTabsProps) {
  const normalizedSnippets = useMemo(() => snippets.map((snippet) => ({ ...snippet })), [snippets]);
  const [activeId, setActiveId] = useState<string>(normalizedSnippets[0]?.id ?? "");
  const [copied, setCopied] = useState(false);

  const activeSnippet = normalizedSnippets.find((snippet) => snippet.id === activeId) ?? normalizedSnippets[0];

  const handleCopy = async () => {
    if (!activeSnippet) {
      return;
    }

    try {
      await navigator.clipboard.writeText(activeSnippet.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy snippet", error);
    }
  };

  if (!activeSnippet) {
    return null;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-2 rounded-xl bg-gray-100 p-1 dark:bg-gray-800/80">
          {normalizedSnippets.map((snippet) => (
            <button
              key={snippet.id}
              type="button"
              onClick={() => setActiveId(snippet.id)}
              className={`rounded-lg px-3 py-1 text-sm font-medium transition ${
                snippet.id === activeId
                  ? "bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-white"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              {snippet.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-gray-300 hover:text-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:text-white"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" /> Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" /> Copy
            </>
          )}
        </button>
      </div>
      <pre className="relative flex-1 overflow-auto rounded-2xl bg-gray-900 p-5 text-sm text-gray-100 shadow-inner">
        <code>{activeSnippet.code}</code>
      </pre>
    </div>
  );
}
