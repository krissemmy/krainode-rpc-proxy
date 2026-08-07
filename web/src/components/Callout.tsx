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
    tip: "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/20",
    note: "border-primary-500 bg-primary-50/70 dark:bg-primary-950/20",
    warning: "border-amber-500 bg-amber-50/70 dark:bg-amber-950/20",
  }[type];

  return (
    <div className={`not-prose my-5 border-l-2 px-4 py-3.5 ${styles}`}>
      {title && <div className="mb-1 text-sm font-semibold text-foreground">{title}</div>}
      <div className="text-sm leading-6 text-muted-foreground">{children}</div>
    </div>
  );
}

