import type { ReactNode } from "react";

export function Callout({
  type = "note",
  title,
  children,
}: {
  type?: "tip" | "note" | "warning";
  title?: string;
  children: ReactNode;
}) {
  const styles = {
    tip: "border-emerald-500/30 bg-emerald-500/5",
    note: "border-blue-500/30 bg-blue-500/5",
    warning: "border-amber-500/30 bg-amber-500/5",
  }[type];

  return (
    <div className={`my-4 rounded-xl border p-4 ${styles}`}>
      {title && <div className="font-medium mb-1">{title}</div>}
      <div className="text-sm leading-6">{children}</div>
    </div>
  );
}


