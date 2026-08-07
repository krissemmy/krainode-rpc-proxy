import type { HTMLAttributes } from "react";

export type DocSection = { id: string; title: string; group: string };

type Props = HTMLAttributes<HTMLDivElement> & {
  sections: DocSection[];
  activeId?: string;
  onNavigate?: (id: string) => void;
};

export default function DocsSidebar({ sections, activeId, onNavigate, className, ...rest }: Props) {
  const groups = sections.reduce<Array<{ name: string; sections: DocSection[] }>>((result, section) => {
    const current = result[result.length - 1];
    if (!current || current.name !== section.group) result.push({ name: section.group, sections: [section] });
    else current.sections.push(section);
    return result;
  }, []);

  return (
    <div className={className} {...rest}>
      <div className="sticky top-14 z-20 -mx-4 border-b border-border bg-white/95 px-4 py-3 backdrop-blur dark:bg-gray-950/95 md:hidden">
        <label htmlFor="docs-section" className="sr-only">Jump to a documentation section</label>
        <select
          id="docs-section"
          value={activeId}
          onChange={(event) => onNavigate?.(event.target.value)}
          className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-900"
        >
          {groups.map((group) => (
            <optgroup key={group.name} label={group.name}>
              {group.sections.map((section) => <option key={section.id} value={section.id}>{section.title}</option>)}
            </optgroup>
          ))}
        </select>
      </div>

      <nav className="hidden md:block" aria-label="Documentation sections">
        <div className="mb-6 border-b border-border pb-5">
          <div className="text-sm font-semibold text-foreground">Documentation</div>
          <div className="mt-1 text-xs leading-5 text-muted-foreground">Guides for browser-native JSON-RPC work.</div>
        </div>
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.name}>
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{group.name}</div>
              <ul className="mt-2 space-y-0.5 border-l border-border">
                {group.sections.map((section) => {
                  const isActive = section.id === activeId;
                  return (
                    <li key={section.id}>
                      <button
                        type="button"
                        onClick={() => onNavigate?.(section.id)}
                        aria-current={isActive ? "location" : undefined}
                        className={`-ml-px w-full border-l px-3 py-1.5 text-left text-sm leading-5 transition-colors ${
                          isActive
                            ? "border-primary-600 font-medium text-primary-700 dark:text-primary-400"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {section.title}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
}
