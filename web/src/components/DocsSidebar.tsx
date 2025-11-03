import type { HTMLAttributes } from "react";

export type DocSection = { id: string; title: string };

type Props = HTMLAttributes<HTMLDivElement> & {
  sections: DocSection[];
  activeId?: string;
  onNavigate?: (id: string) => void;
};

export default function DocsSidebar({ sections, activeId, onNavigate, className, ...rest }: Props) {
  return (
    <div className={className} {...rest}>
      {/* Mobile: horizontal nav */}
      <nav className="mb-2 -mx-1 flex gap-1 overflow-auto md:hidden">
        {sections.map((s) => {
          const isActive = s.id === activeId;
          return (
            <button
              key={s.id}
              onClick={() => onNavigate?.(s.id)}
              className={
                "whitespace-nowrap rounded-lg px-3 py-1.5 text-sm " +
                (isActive ? "bg-gray-200 text-foreground dark:bg-gray-800" : "text-muted-foreground hover:text-foreground")
              }
            >
              {s.title}
            </button>
          );
        })}
      </nav>

      {/* Desktop: sticky list */}
      <nav className="hidden md:block">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Tutorials</div>
        <ul className="mt-3 space-y-1.5">
          {sections.map((s) => {
            const isActive = s.id === activeId;
            return (
              <li key={s.id}>
                <button
                  onClick={() => onNavigate?.(s.id)}
                  className={
                    "w-full text-left text-sm transition " +
                    (isActive
                      ? "font-medium text-foreground"
                      : "text-muted-foreground hover:text-foreground")
                  }
                >
                  {s.title}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}


