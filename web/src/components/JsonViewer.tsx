import { useState } from "react";

export type JsonViewerProps = {
  data: any;
  /** Collapse depth for nested nodes (root shows fields immediately):
   *  - number: 1 => root shown (no summary), nested collapsed (default)
   *  - true: collapse everything
   *  - false: expand everything
   */
  collapsed?: number | boolean;
  /** Set true to show a summary row for the root object. Default: false. */
  showRootSummary?: boolean;
};

export function JsonViewer({
  data,
  collapsed = 1,
  showRootSummary = false,
}: JsonViewerProps) {
  const depthLimit =
    typeof collapsed === "number" ? collapsed : collapsed === true ? 0 : Infinity;

  if (!isObjectOrArray(data)) return <Primitive value={data} />;

  const entries = Array.isArray(data)
    ? (data as any[]).map((v, i) => [i, v])
    : Object.entries(data);

  if (showRootSummary) {
    return <JsonNode data={data} depth={0} depthLimit={depthLimit} labelOverride="" />;
  }

  // Root: show fields directly (no "{N properties}" line)
  return (
    <div className="json-viewer font-mono text-sm json-wrap">
      <div className="space-y-1">
        {entries.map(([k, v]) => (
          <div key={String(k)} className="whitespace-pre-wrap">
            <KeyLabel k={k} />
            <span>: </span>
            {isObjectOrArray(v) ? (
              <JsonNode data={v} depth={1} depthLimit={depthLimit} />
            ) : (
              <Primitive value={v} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- internals ---------- */

function JsonNode({
  data,
  depth,
  depthLimit,
  labelOverride,
}: {
  data: any;
  depth: number;
  depthLimit: number;
  labelOverride?: string;
}) {
  if (!isObjectOrArray(data)) return <Primitive value={data} />;

  const isArray = Array.isArray(data);
  const entries = isArray ? data.map((v: any, i: number) => [i, v]) : Object.entries(data);

  const initiallyOpen = depth < depthLimit; // depth=1 closed when depthLimit=1
  const [open, setOpen] = useState(initiallyOpen);

  const label =
    labelOverride ??
    (isArray
      ? `[${entries.length} ${entries.length === 1 ? "item" : "items"}]`
      : `{${entries.length} ${entries.length === 1 ? "property" : "properties"}}`);

  return (
    <details open={open} onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}>
      <summary className="cursor-pointer select-none opacity-80 hover:opacity-100">
        {label}
      </summary>
      <div className="pl-4 space-y-1">
        {entries.map(([k, v]: any) => (
          <div key={String(k)} className="whitespace-pre-wrap">
            {!isArray && (
              <>
                <KeyLabel k={k} />
                <span>: </span>
              </>
            )}
            {isObjectOrArray(v) ? (
              <JsonNode data={v} depth={depth + 1} depthLimit={depthLimit} />
            ) : (
              <Primitive value={v} />
            )}
          </div>
        ))}
      </div>
    </details>
  );
}

function Primitive({ value }: { value: any }) {
  if (value === null) return <span className="json-null">null</span>;
  switch (typeof value) {
    case "boolean":
      return <span className="json-boolean">{String(value)}</span>;
    case "number":
      return <span className="json-number">{value}</span>;
    case "string":
      return <span className="json-string json-wrap">"{value}"</span>;
    default:
      return <span className="json-null">null</span>;
  }
}

function KeyLabel({ k }: { k: string | number }) {
  return <span className="json-key">"{String(k)}"</span>;
}

function isObjectOrArray(v: any) {
  return v && (Array.isArray(v) || typeof v === "object");
}
