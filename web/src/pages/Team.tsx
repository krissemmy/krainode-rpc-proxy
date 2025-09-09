export default function Team() {
  return (
    <div className="container" style={{ padding: "32px 0" }}>
      {/* Top header */}
      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <img src="/images/logo_icon.svg" alt="KraiNode" style={{ height: 32, opacity: 0.9 }} />
          <h1 style={{ margin: 0 }}>About KraiNode</h1>
        </div>
        <p style={{ marginTop: 8 }}>
          KraiNode is a developer-first JSON-RPC proxy and playground. It standardizes calls across public
          nodes, forwards server-side with strict timeouts and retries, and gives teams real-time visibility
          into error rates and latency without exposing upstream URLs.
        </p>
      </div>

      {/* Middle: two cards side-by-side on desktop */}
      <div className="grid grid-sm-2" style={{ marginBottom: 16 }}>
        <section className="card" style={{ padding: 20 }}>
          <h2 style={{ marginTop: 0 }}>Roadmap (post-MVP)</h2>
          <ul style={{ paddingLeft: 18, margin: 0 }}>
            <li>Testnets support and more EVM chains</li>
            <li>Non-EVM chains support</li>
          </ul>
        </section>

        <section className="card" style={{ padding: 20 }}>
          <h2 style={{ marginTop: 0 }}>Custom nodes for teams</h2>
          <p style={{ marginBottom: 12 }}>
            Need a dedicated, high-throughput node with guaranteed quotas? We provision custom endpoints
            and higher rate limits.
          </p>
          <a className="btn" href="mailto:contact@krissemmy.com">Contact: contact@krissemmy.com</a>
        </section>
      </div>

      {/* Founder card (full width) */}
      <section className="card" style={{ padding: 20 }}>
        <h2 className="mb-2" style={{ marginTop: 0 }}>Founder</h2>
        <div className="founder-grid">
          <div>
            <p style={{ marginTop: 0 }}>
              <strong>Hey, I’m Emmanuel Christopher.</strong> I’m a DevOps & blockchain data engineer who’s run
              multi-chain node infra (Ethereum, Arbitrum, Base and more), built custom indexing systems, and shipped
              monitoring that teams trust.
            </p>

            <ul style={{ paddingLeft: 18, margin: "12px 0" }}>
              <li>Cut RPC p95 latency from ~2s to &lt;250ms across regions by fixing routing, timeouts, retries and network paths.</li>
              <li>Built end-to-end observability: Prometheus metrics, Grafana dashboards, Loki logs, alerting, SLIs/SLOs.</li>
              <li>Reduced AWS spend by ~48% with right-sizing, Savings Plans and egress control.</li>
              <li>Delivered API gateways that handle high RPS with safe retries, circuit breakers and clear error surfaces.</li>
            </ul>

            <p className="italic" style={{ margin: "12px 0" }}>
              Why now: public RPCs are inconsistent, status pages look green while calls fail, and teams waste hours
              debugging timeouts. KraiNode gives one predictable endpoint, real latency numbers, safe retries and privacy
              for upstream URLs.
            </p>

            <p style={{ marginBottom: 0 }}>
              I’m building <strong>KraiNode</strong> so JSON-RPC feels boring in a good way: predictable, fast, and easy to debug,
              with a playground that mirrors production.
            </p>
          </div>
          <div className="founder-links">
            <a className="btn" href="https://github.com/krissemmy" target="_blank" rel="noreferrer">GitHub</a>
            <a className="btn-secondary" href="https://linkedin.com/in/emmanuel-christopher" target="_blank" rel="noreferrer">LinkedIn</a>
            <a className="btn-secondary" href="https://twitter.com/chris__emma" target="_blank" rel="noreferrer">X (Twitter)</a>
            <a className="btn-secondary" href="mailto:contact@krissemmy.com">Email</a>
          </div>
        </div>
      </section>
    </div>
  );
}
