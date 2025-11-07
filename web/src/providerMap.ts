export type ProviderMeta = {
    name: string;
    website: string; // single link only
    logo?: string; // optional logo path
    spotlight?: boolean; // whether to show banner
    match?: {
      labels?: string[];
      hostIncludes?: string[];
    };
    spotlightScopes?: {
        chain: string;
        networks?: string[];
      }[];
  };
  
  export const PROVIDERS: Record<string, ProviderMeta> = {
    fastnode: {
      name: "Fastnode",
      website: "https://fastnode.io",
      // logo optional; if you add one, place at /web/public/logos/fastnode.svg
      // logo: "/logos/fastnode.svg",
      spotlight: true,
    //   spotlightScopes: [
    //     { chain: "ethereum", networks: ["mainnet"] },
    //   ],
      match: {
        labels: ["Fastnode"],
        hostIncludes: ["fastnode.io"],
      },
    },
    publicnode: {
        name: "Allnodes by Publicnode",
        website: "https://www.allnodes.com/",
        // logo optional; if you add one, place at /web/public/logos/fastnode.svg
        // logo: "/logos/fastnode.svg",
        spotlight: true,
        spotlightScopes: [
            { chain: "ethereum", networks: ["mainnet", "sepolia", "hoodi"] },
          ],
        match: {
          labels: ["Allnodes by Publicnode"],
          hostIncludes: ["publicnode.com"],
        },
    },
    tatum: {
      name: "Tatum",
      website: "https://tatum.io/nodes",
      // logo optional; if you add one, place at /web/public/logos/fastnode.svg
      logo: "/logos/tatum.png",
      spotlight: true,
      spotlightScopes: [
          { chain: "base", networks: ["mainnet", "sepolia"] },
          { chain: "celo", networks: ["mainnet", "sepolia"] },
        ],
      match: {
        labels: ["Tatum"],
        hostIncludes: ["tatum.io"],
      },
    },
    // Add more providers here as needed, without touching chains.yaml
  };