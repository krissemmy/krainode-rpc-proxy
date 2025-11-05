import { useEffect, useRef, useState } from "react";
import type { ProviderMeta } from "../providerMap";

type ProviderSpotlightProps = {
  chainId: string;
  networkId: string;
  meta: ProviderMeta;
};

/**
 * Slim, layout-flow banner with optional logo, 🔥 emoji, "Sponsored" chip,
 * and a bold marquee animation.
 *
 * Dismiss is in-memory ONLY (no storage), hidden for 2h or until reload.
 */
export default function ProviderSpotlight({ chainId, networkId, meta }: ProviderSpotlightProps) {
  const DISMISS_MS = 2 * 60 * 60 * 1000; // 2 hours
  const [dismissed, setDismissed] = useState(false);
  const dismissTimer = useRef<number | null>(null);

  useEffect(() => {
    if (dismissTimer.current) window.clearTimeout(dismissTimer.current);
    setDismissed(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, networkId, meta?.name]);

  useEffect(() => {
    return () => {
      if (dismissTimer.current) window.clearTimeout(dismissTimer.current);
    };
  }, []);

  if (!meta.website || dismissed) return null;

  const onDismiss = () => {
    setDismissed(true);
    if (dismissTimer.current) window.clearTimeout(dismissTimer.current);
    dismissTimer.current = window.setTimeout(() => setDismissed(false), DISMISS_MS);
  };

  const marqueeItems = Array.from({ length: 3 });

  return (
    <div className="relative z-10" data-testid="provider-spotlight">
      <style>{`
        @keyframes ps-marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
      <div className="w-full border-y border-orange-400/60 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-orange-900/25 px-4 py-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4">
            {meta.logo ? (
              <img
                src={meta.logo}
                alt={`${meta.name} logo`}
                className="h-9 w-9 rounded-md object-contain ring-2 ring-white/60"
              />
            ) : (
              <div className="h-9 w-9 rounded-md bg-black/15 flex items-center justify-center text-base font-semibold">
                {meta.name[0]?.toUpperCase()}
              </div>
            )}

            <div className="relative flex-1 overflow-hidden">
              <div className="flex min-w-max items-center gap-10 will-change-transform animate-[ps-marquee_14s_linear_infinite]">
                {marqueeItems.map((_, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm font-medium">
                    <span aria-hidden className="text-xl leading-none">🔥🔥</span>
                    <span className="text-[10px] uppercase tracking-[0.15em] px-2 py-0.5 rounded-full bg-black/10 border border-black/15 text-black">
                      Sponsored
                    </span>
                    <span className="text-sm text-black">
                      <span className="font-semibold text-black">{meta.name}</span> is live for {`${chainId.charAt(0).toUpperCase() + chainId.slice(1)}`} {`${networkId.charAt(0).toUpperCase() + networkId.slice(1)}`}......low-latency, high-uptime RPCs built for production workloads.{" "}
                      </span>
                    <span aria-hidden className="text-xl leading-none"></span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={meta.website}
                target="_blank"
                rel="noreferrer"
                className="text-xs md:text-sm px-3 py-1 rounded-xl bg-white/90 text-orange-700 font-semibold shadow hover:bg-white transition"
                aria-label={`Visit ${meta.name} website`}
              >
                Visit
              </a>
              <button
                aria-label="Dismiss provider spotlight"
                onClick={onDismiss}
                className="p-1 rounded-md hover:bg-black/10 text-black/70"
                title="Hide for 2h or until reload"
              >
                ✕
              </button>
            </div>
          </div>

          <p className="font-semibold text-black/70">
            Providers interested in sponsoring a network? Email{" "}
            <a
              href="mailto:contact@krissemmy.com"
              className="font-semibold underline decoration-black/40 underline-offset-2 hover:text-black"
            >
              contact@krissemmy.com
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}