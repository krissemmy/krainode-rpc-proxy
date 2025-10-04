import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { Container } from "@/components/layout";

type NavItem = { to: string; label: string };

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const location = useLocation();

  const navItems: NavItem[] = useMemo(
    () => [
      { to: "/", label: "Home" },
      { to: "/playground", label: "Playground" },
      { to: "/team", label: "Team" }
    ],
    []
  );

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem("theme") : null;
    const isDark = saved ? saved === "dark" : window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    setDark(Boolean(isDark));
    document.documentElement.classList.toggle("dark", Boolean(isDark));
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("theme", next ? "dark" : "light");
    }
  };

  const renderLink = (item: NavItem, variant: "desktop" | "mobile") => {
    const isActive = location.pathname === item.to;
    const base =
      variant === "desktop"
        ? "inline-flex items-center rounded-xl px-3 py-1.5 text-sm font-medium transition sm:text-base"
        : "rounded-xl px-4 py-2 text-base font-medium transition";
    const color = isActive
      ? variant === "desktop"
        ? "text-foreground"
        : "bg-gray-100 text-foreground dark:bg-gray-800"
      : variant === "desktop"
        ? "text-muted-foreground hover:text-foreground"
        : "text-foreground hover:bg-gray-100 dark:hover:bg-gray-800";

    return (
      <Link
        key={item.to}
        to={item.to}
        onClick={() => setOpen(false)}
        className={`${base} ${color}`}
      >
        {item.label}
      </Link>
    );
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-gray-950/80 dark:supports-[backdrop-filter]:bg-gray-950/60">
        <Container className="flex h-14 items-center justify-between gap-3 pt-[env(safe-area-inset-top)]">
          <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <img src="/images/logo_icon.svg" alt="KraiNode" className="h-6 w-auto" />
            <span className="hidden text-sm font-medium text-foreground sm:inline">KraiNode</span>
          </Link>

          <div className="flex items-center gap-3">
            <nav className="hidden items-center gap-2 md:flex lg:gap-4">
              {navItems.map((item) => renderLink(item, "desktop"))}
            </nav>

            <div className="hidden items-center gap-2 md:flex">
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border text-muted-foreground transition hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500"
              >
                {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>

            <button
              onClick={() => setOpen(true)}
              className="inline-flex h-11 items-center gap-2 rounded-xl border px-3 text-sm font-medium text-foreground shadow-sm transition hover:border-primary-400 hover:text-primary-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500 md:hidden"
              aria-label="Open menu"
              aria-expanded={open}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Menu
            </button>
          </div>
        </Container>
      </header>

      {open && (
        <div className="fixed inset-0 z-[100] md:hidden" aria-modal="true" role="dialog">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 right-0 w-full max-w-xs border-l border-black/10 bg-white shadow-xl dark:border-white/10 dark:bg-gray-900">
            <div className="flex items-center justify-between px-4 pt-[env(safe-area-inset-top)]">
              <div className="flex items-center gap-2">
                <img src="/images/logo_icon.svg" className="h-6 w-auto" alt="KraiNode" />
                <span className="text-sm font-medium text-foreground">KraiNode</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="inline-flex h-11 items-center gap-2 rounded-xl border px-3 text-sm font-medium text-muted-foreground transition hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500"
                aria-label="Close menu"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Close
              </button>
            </div>

            <nav className="mt-6 flex flex-col gap-2 px-4 pb-6">
              {navItems.map((item) => renderLink(item, "mobile"))}
              <button
                onClick={toggleTheme}
                className="mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-medium text-muted-foreground transition hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500"
              >
                {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />} Theme
              </button>
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
