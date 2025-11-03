import { useState } from "react";
import { CopyButton } from "./CopyButton";

export function DocsCodeTabs({
  tabs,
}: {
  tabs: { label: string; code: string }[];
}) {
  const [active, setActive] = useState(0);
  const current = tabs[active];
  return (
    <div className="my-4 rounded-xl border">
      <div className="flex items-center justify-between border-b p-2">
        <div className="flex gap-2">
          {tabs.map((t, i) => (
            <button
              key={t.label}
              onClick={() => setActive(i)}
              className={`text-xs px-2 py-1 rounded ${i === active ? "bg-white/10" : "hover:bg-white/5"}`}
              aria-current={i === active}
              type="button"
            >
              {t.label}
            </button>
          ))}
        </div>
        <CopyButton text={current.code} />
      </div>
      <pre className="p-4 overflow-x-auto text-sm"><code>{current.code}</code></pre>
    </div>
  );
}


