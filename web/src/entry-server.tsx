import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import App from "./App";

export { pageMeta, SITE_URL } from "./lib/pageMeta";

// Build-time only: scripts/prerender.mjs calls this once per route.
export function render(path: string) {
  return renderToString(
    <StaticRouter location={path}>
      <App />
    </StaticRouter>,
  );
}
