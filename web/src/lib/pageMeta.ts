import { useEffect } from "react";

const SITE_URL = "https://krainode.krissemmy.com";

// Every route is served from the same index.html, so each page sets its own
// title, description, and canonical URL for search engines that render JS.
export function usePageMeta(title: string, description: string, path: string) {
  useEffect(() => {
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", description);

    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = `${SITE_URL}${path}`;
  }, [title, description, path]);
}
