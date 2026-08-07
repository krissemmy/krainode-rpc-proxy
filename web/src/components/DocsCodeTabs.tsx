import { useState } from "react";
import { CopyButton } from "./CopyButton";

export function DocsCodeTabs({
  tabs,
  title = "Request",
}: {
  tabs: { label: string; code: string }[];
  title?: string;
}) {
  const [active, setActive] = useState(0);
  const current = tabs[active] ?? tabs[0];
  if (!current) return null;

  return (
    <div className="not-prose my-5 overflow-hidden rounded-xl border border-gray-800 bg-[#0b0e14] text-gray-100 shadow-sm">
      <div className="flex min-h-11 items-center justify-between gap-3 border-b border-white/10 px-3">
        <div className="flex min-w-0 items-center gap-3 overflow-x-auto">
          <span className="hidden shrink-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500 sm:inline">{title}</span>
          <div className="flex h-11 items-stretch">
            {tabs.map((tab, index) => (
              <button
                key={tab.label}
                onClick={() => setActive(index)}
                className={`relative shrink-0 px-3 text-xs font-medium transition-colors ${index === active ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
                aria-selected={index === active}
                role="tab"
                type="button"
              >
                {tab.label}
                {index === active && <span className="absolute inset-x-2 bottom-0 h-px bg-primary-400" />}
              </button>
            ))}
          </div>
        </div>
        <CopyButton text={current.code} />
      </div>
      <pre className="max-h-[420px] overflow-auto p-4 text-[13px] leading-6 sm:p-5"><code>{current.code}</code></pre>
    </div>
  );
}
