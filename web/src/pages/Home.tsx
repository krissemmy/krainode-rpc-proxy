import { Link } from 'react-router-dom'
import { ArrowRight, Shield, Zap, ExternalLink } from 'lucide-react'

export function Home() {

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                  Proxy, test, and monitor{' '}
                  <span className="text-primary-600 dark:text-primary-400">JSON-RPC</span>{' '}
                  in minutes
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                  Built for developers and teams. KraiNode provides a clean API, a fast playground, and
                  per-request observability—without exposing upstream node URLs.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/playground"
                  className="btn-primary inline-flex items-center justify-center px-8 py-3 text-lg font-medium"
                >
                  Open Playground
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                {/* <a
                  href="/metrics"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline inline-flex items-center justify-center px-8 py-3 text-lg font-medium"
                >
                  View Metrics
                  <ExternalLink className="ml-2 w-5 h-5" />
                </a> */}
              </div>
            </div>
            
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-lg">
                <img
                  src="/images/hero_dark.svg"
                  alt="Network diagram showing JSON-RPC proxy architecture"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Everything you need for JSON-RPC
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              KraiNode provides a complete solution for managing JSON-RPC endpoints 
              with enterprise-grade features and developer-friendly tools.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Feature 1: Proxy */}
            <div className="card text-center group hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Own API URL
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Standardize calls across public nodes. KraiNode forwards JSON-RPC server-side with timeouts and retries.
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 font-mono text-sm">
                <div className="text-primary-600 dark:text-primary-400">Your API</div>
                <div className="text-gray-900 dark:text-gray-100">
                  /api/rpc/CHAIN_NAME/json
                </div>
              </div>
            </div>

            {/* Feature 2: Playground */}
            <div className="card text-center group hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                One-click JSON-RPC Playground
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Test any JSON-RPC method with our interactive playground. 
                One-click presets (block number, chain ID, balances), pretty JSON, cURL export, and latency.
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 font-mono text-sm">
                <div className="text-primary-600 dark:text-primary-400">Test Methods</div>
                <div className="text-gray-900 dark:text-gray-100">
                  eth_blockNumber, eth_getBalance, eth_call...etc
                </div>
              </div>
            </div>

            {/* Feature 3: Metrics */}
            {/* <div className="card text-center group hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Metrics & Logs
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Prometheus-ready metrics and structured JSON logs. 
                Monitor performance, errors, and usage patterns.
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 font-mono text-sm">
                <div className="text-primary-600 dark:text-primary-400">Metrics</div>
                <div className="text-gray-900 dark:text-gray-100">
                  /metrics endpoint ready
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 dark:bg-primary-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to get started?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Deploy KraiNode in minutes and start proxying JSON-RPC requests 
              with enterprise-grade reliability.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/playground"
                className="btn bg-white text-primary-600 hover:bg-gray-50 inline-flex items-center justify-center px-8 py-3 text-lg font-medium"
              >
                Try Playground
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <a
                href="https://github.com/krissemmy/krainode-rpc-proxy"
                target="_blank"
                rel="noopener noreferrer"
                className="btn border-2 border-white text-white hover:bg-white hover:text-primary-600 inline-flex items-center justify-center px-8 py-3 text-lg font-medium"
              >
                View on GitHub
                <ExternalLink className="ml-2 w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
