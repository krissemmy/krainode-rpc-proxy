// Writes one static HTML file per route into dist/, so crawlers and link
// previews that do not run JavaScript get each page's real content and
// metadata. Runs after `vite build` and the SSR build (see package.json).
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// React and React Router pick their production builds from this.
process.env.NODE_ENV ??= "production";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const { render, pageMeta, SITE_URL } = await import(
  path.join(root, "node_modules/.prerender/entry-server.js")
);

const escapeHtml = (value) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Every substitution must hit, otherwise a page would ship with the wrong
// metadata without anyone noticing.
function replaceAll(html, search, replacement, label) {
  if (!html.includes(search)) throw new Error(`prerender: ${label} not found in dist/index.html`);
  return html.split(search).join(replacement);
}

const template = await readFile(path.join(dist, "index.html"), "utf8");
const home = pageMeta["/"];
const homeUrl = `${SITE_URL}/`;

// Unprerendered shell for URLs that match no route file (see vercel.json).
await writeFile(path.join(dist, "shell.html"), template);

for (const [route, meta] of Object.entries(pageMeta)) {
  const url = `${SITE_URL}${route}`;
  let html = template;
  html = replaceAll(html, '<div id="root"></div>', `<div id="root">${render(route)}</div>`, "root element");
  html = replaceAll(html, escapeHtml(home.title), escapeHtml(meta.title), "home title");
  html = replaceAll(html, escapeHtml(home.description), escapeHtml(meta.description), "home description");
  for (const attr of ['rel="canonical" href', 'property="og:url" content', 'property="twitter:url" content']) {
    html = replaceAll(html, `${attr}="${homeUrl}"`, `${attr}="${url}"`, attr);
  }

  const file = route === "/" ? "index.html" : path.join(route.slice(1), "index.html");
  await mkdir(path.dirname(path.join(dist, file)), { recursive: true });
  await writeFile(path.join(dist, file), html);
  console.log(`prerendered ${route} -> dist/${file}`);
}
