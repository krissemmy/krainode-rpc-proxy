import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("generated Ethereum mainnet providers preserve their configured order and default", () => {
  const { chains } = JSON.parse(
    readFileSync(new URL("../public/chains.json", import.meta.url), "utf8"),
  );
  const ethereum = chains.find((chain) => chain.name === "ethereum");
  const mainnet = ethereum.networks.find((network) => network.name === "mainnet");

  assert.deepEqual(mainnet.providers.map((provider) => provider.name), [
    "publicnode", "nownodes", "noderpc",
  ]);
  assert.equal(mainnet.defaultProvider, "publicnode");
});
