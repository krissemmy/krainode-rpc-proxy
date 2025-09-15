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
          into error rates and latency—without exposing upstream URLs.
        </p>
      </div>

      {/* Middle: two cards side-by-side on desktop */}
      <div className="grid grid-sm-2" style={{ marginBottom: 16 }}>
        <section className="card" style={{ padding: 20 }}>
          <h2 style={{ marginTop: 0 }}>Roadmap (post-MVP)</h2>
          <ul style={{ paddingLeft: 18, margin: 0 }}>
            <li>More EVM chains and Non-EVM chains support</li>
            <li>Advanced dashboard with analytics</li>
            <li>Load balancing across multiple upstream nodes</li>
            <li>Caching layer for frequently requested data</li>
            <li>API key management</li>
            <li>AI chatbot integration for non-devs to analyze blockchain data</li>
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

      {/* Sponsor card (full width) */}
      <section className="card" style={{ padding: 20, marginBottom: 16 }}>
        <h2 style={{ marginTop: 0 }}>Support KraiNode</h2>
        <p style={{ margin: "8px 0 12px" }}>
          If KraiNode helps ur DX, u can sponsor to keep the lights on 🙏
        </p>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <iframe
            src="https://github.com/sponsors/krissemmy/card"
            title="Sponsor krissemmy"
            height="225"
            width="100%"
            loading="lazy"
            style={{ border: 0, maxWidth: 600 }}
          />
        </div>
      </section>


      {/* Founder card (full width) */}
      <section className="card" style={{ padding: 20 }}>
        <h2 className="mb-2" style={{ marginTop: 0 }}>Founder</h2>
        <div className="founder-grid">
          <div>
            <p>
              <strong>Emmanuel Christopher</strong> is a DevOps &amp; Blockchain Data Engineer who has operated
              high-availability node infrastructure and indexing systems across multiple chains, 
              built observability
              stacks (Grafana, Loki, Prometheus), and tuned Cloud latency and cost for production DeFi workloads.
            </p>
            <p className="italic mt-2">
              He created KraiNode to make JSON-RPC predictable and easy to debug — a clean proxy with a playground that mirrors production.
            </p>
          </div>
          <div className="founder-links">
            <a className="btn" href="https://github.com/krissemmy" target="_blank" rel="noreferrer">GitHub</a>
            <a className="btn-secondary" href="https://linkedin.com/in/emmanuel-christopher" target="_blank" rel="noreferrer">LinkedIn</a>
            <a className="btn-secondary" href="mailto:contact@krissemmy.com">Email</a>
          </div>
        </div>
      </section>
    </div>
  );
}
