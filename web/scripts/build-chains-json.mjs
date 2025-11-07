// web/scripts/build-chains-json.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../.."); // repo root
const yamlPath = path.join(root, "chains.yaml");
const outPath = path.resolve(__dirname, "../public/chains.json");

const src = fs.readFileSync(yamlPath, "utf8");
const doc = yaml.parse(src);

// Expect format: chain -> network -> providerName: url
const chains = [];
for (const [chainName, networks] of Object.entries(doc || {})) {
  const netArr = [];
  for (const [networkName, providersObj] of Object.entries(networks || {})) {
    const provEntries = Object.entries(providersObj || {})
      .filter(([_, url]) => typeof url === "string" && /^https?:\/\//.test(url));

    // 🚫 Do not sort — preserve YAML order as-authored
    // provEntries.sort(([a], [b]) => a.localeCompare(b));

    const providers = provEntries.map(([name, url]) => ({ name, url }));
    if (providers.length === 0) continue;

    netArr.push({
      name: networkName,
      providers,
      // First entry in YAML is the default
      defaultProvider: providers[0].name,
    });
  }
  if (netArr.length) chains.push({ name: chainName, networks: netArr });
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify({ chains }, null, 2), "utf8");
console.log(`Wrote ${outPath}`);
