import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Moon, Sun } from "lucide-react";

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const loc = useLocation();

  // Lock background scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Init theme from storage or system
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const next = saved
      ? saved === "dark"
      : window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const link = (to: string, label: string) => (
    <Link
      to={to}
      onClick={() => setOpen(false)}
      className={`px-2 py-1 rounded-md ${
        loc.pathname === to
          ? "text-white"
          : "text-gray-300 hover:text-white"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <>
      {/* Header (lower z so drawer covers it) */}
      <header className="sticky top-0 z-40 bg-gray-950/80 backdrop-blur border-b border-white/10">
        <div className="container h-14 flex items-center justify-between pt-[env(safe-area-inset-top)]">
          <Link to="/" className="flex items-center gap-2">
            <img src="/images/logo_icon.svg" className="h-6" alt="" />
            <span className="font-semibold text-white">KraiNode</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-4 text-sm">
            {link("/", "Home")}
            {link("/playground", "Playground")}
            {link("/team", "Team")}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-lg text-gray-300 hover:text-white"
            >
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </nav>

          {/* Mobile Menu button (big, obvious) */}
          <button
            onClick={() => setOpen(true)}
            className="md:hidden inline-flex items-center gap-2 px-3 py-2 rounded-xl
                       min-h-[44px] min-w-[44px]
                       bg-primary-600 text-white shadow ring-1 ring-primary-400/50
                       hover:bg-primary-500 active:scale-[.98]
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
                       focus-visible:ring-offset-gray-950 dark:focus-visible:ring-offset-gray-900"
            aria-label="Open menu"
            aria-expanded={open}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="font-medium">Menu</span>
          </button>
        </div>
      </header>

      {/* Mobile drawer rendered OUTSIDE the header so it fully covers it */}
      {open && (
        <div className="fixed inset-0 z-[100] md:hidden" aria-modal="true" role="dialog">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="absolute right-0 top-0 h-full w-72 bg-white dark:bg-gray-900 border-l border-black/10 dark:border-white/10 shadow-xl">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src="/images/logo_icon.svg" className="h-6" alt="" />
                <span className="font-semibold text-gray-900 dark:text-white">KraiNode</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl
                           min-h-[44px] min-w-[44px]
                           text-gray-700 hover:bg-black/5
                           dark:text-gray-300 dark:hover:bg-white/10"
                aria-label="Close menu"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span className="font-medium">Close</span>
              </button>
            </div>

            <nav className="px-2 pb-4 flex flex-col">
              <Link to="/" onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10">
                Home
              </Link>
              <Link to="/playground" onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10">
                Playground
              </Link>
              <Link to="/team" onClick={() => setOpen(false)} className="px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10">
                Team
              </Link>

              <button
                onClick={toggleTheme}
                className="mt-2 self-start px-3 py-2 rounded-lg text-gray-700 hover:bg-black/5 dark:text-gray-300 dark:hover:bg-white/10"
              >
                {dark ? <Sun className="w-5 h-5 inline mr-2" /> : <Moon className="w-5 h-5 inline mr-2" />} Theme
              </button>
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
