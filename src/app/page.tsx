import {
  Layers,
  Store,
  Terminal,
  ShieldCheck,
  Zap,
  Cpu,
  ArrowRight,
  CheckCircle2,
  Globe,
  Database,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const sampleStores = [
    { name: "Apex Electronics", subdomain: "apex", status: "Active", items: 42 },
    { name: "Cyber Armor Depot", subdomain: "armor", status: "Active", items: 128 },
    { name: "Retro Keyboards Lab", subdomain: "retro", status: "Active", items: 19 },
  ];

  return (
    <div className="min-h-[100dvh] bg-[#010101] text-[#EEEFF2] flex flex-col justify-between">
      {/* Top Navigation */}
      <nav className="border-b border-[#EEEFF2]/15 bg-[#010101]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#272835] border border-[#EEEFF2]/20 flex items-center justify-center text-[#EEEFF2]">
              <Layers className="w-5 h-5 text-[#EEEFF2]" />
            </div>
            <div className="flex flex-col">
              <span className="font-bebas text-2xl tracking-widest text-[#EEEFF2] leading-none">
                3NFM
              </span>
              <span className="font-mono text-[10px] text-[#EEEFF2]/60 uppercase tracking-wider">
                Multi-Tenant Engine
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 font-mono text-xs px-3 py-1.5 rounded-xl bg-[#272835] border border-[#EEEFF2]/15 text-[#EEEFF2]/80">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Cluster: localhost:3000</span>
            </div>
            <a
              href="#test-subdomains"
              className="px-4 py-2 rounded-xl bg-[#EEEFF2] text-[#010101] text-xs font-semibold hover:bg-[#EEEFF2]/90 transition-all"
            >
              Explore Tenants
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#272835] border border-[#EEEFF2]/20 text-xs font-mono text-[#EEEFF2] mb-6">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>SAAS STOREFRONT ARCHITECTURE</span>
          </div>

          <h1 className="font-bebas text-5xl sm:text-7xl lg:text-8xl tracking-wider text-[#EEEFF2] leading-none mb-6">
            HIGH PERFORMANCE STOREFRONT INFRASTRUCTURE
          </h1>

          <p className="font-sans text-base sm:text-xl text-[#EEEFF2]/75 leading-relaxed mb-8">
            Engineered with Next.js App Router, MySQL connection pooling, and automated subdomain routing for autonomous multi-tenant commerce.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="#test-subdomains"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#272835] hover:bg-[#343647] border border-[#EEEFF2]/20 text-sm font-semibold transition-all shadow-md"
            >
              <Store className="w-4 h-4 text-[#EEEFF2]" />
              <span>Launch Tenant Stores</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#architecture"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-transparent hover:bg-[#272835]/50 border border-[#EEEFF2]/15 text-sm font-medium transition-all"
            >
              <Terminal className="w-4 h-4 text-[#EEEFF2]/80" />
              <span>Inspect Stack</span>
            </a>
          </div>
        </div>

        {/* Technical Architecture Specs */}
        <section id="architecture" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          <div className="p-6 rounded-xl bg-[#090A0F] border border-[#EEEFF2]/15">
            <div className="w-10 h-10 rounded-xl bg-[#272835] border border-[#EEEFF2]/15 flex items-center justify-center mb-4 text-[#EEEFF2]">
              <Globe className="w-5 h-5 text-sky-400" />
            </div>
            <h3 className="font-bebas text-2xl tracking-wide text-[#EEEFF2] mb-2">
              Subdomain Rewriting
            </h3>
            <p className="font-sans text-sm text-[#EEEFF2]/70 leading-relaxed mb-4">
              Edge-ready Next.js middleware inspects host headers and rewrites requests dynamically to tenant storefronts with zero latency penalty.
            </p>
            <div className="font-mono text-xs text-[#EEEFF2]/50 bg-[#272835]/50 p-2.5 rounded-xl border border-[#EEEFF2]/10">
              src/middleware.ts &rarr; /[subdomain]
            </div>
          </div>

          <div className="p-6 rounded-xl bg-[#090A0F] border border-[#EEEFF2]/15">
            <div className="w-10 h-10 rounded-xl bg-[#272835] border border-[#EEEFF2]/15 flex items-center justify-center mb-4 text-[#EEEFF2]">
              <Database className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="font-bebas text-2xl tracking-wide text-[#EEEFF2] mb-2">
              MySQL Connection Pool
            </h3>
            <p className="font-sans text-sm text-[#EEEFF2]/70 leading-relaxed mb-4">
              High-throughput connection pooling with development hot-reload cache preserving active connections and preventing pool exhaustion.
            </p>
            <div className="font-mono text-xs text-[#EEEFF2]/50 bg-[#272835]/50 p-2.5 rounded-xl border border-[#EEEFF2]/10">
              src/lib/db.ts &rarr; mysql2/promise
            </div>
          </div>

          <div className="p-6 rounded-xl bg-[#090A0F] border border-[#EEEFF2]/15">
            <div className="w-10 h-10 rounded-xl bg-[#272835] border border-[#EEEFF2]/15 flex items-center justify-center mb-4 text-[#EEEFF2]">
              <Cpu className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="font-bebas text-2xl tracking-wide text-[#EEEFF2] mb-2">
              Strict Design Tokens
            </h3>
            <p className="font-sans text-sm text-[#EEEFF2]/70 leading-relaxed mb-4">
              Pure #010101 dark surface paired with #272835 deep contrast accents, 12px corner radii, and zero emojis for industrial precision.
            </p>
            <div className="font-mono text-xs text-[#EEEFF2]/50 bg-[#272835]/50 p-2.5 rounded-xl border border-[#EEEFF2]/10">
              Inter + Bebas Neue + JetBrains
            </div>
          </div>
        </section>

        {/* Live Tenant Stores Section */}
        <section id="test-subdomains" className="rounded-xl border border-[#EEEFF2]/15 bg-[#272835]/20 p-8 sm:p-10 mb-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="font-bebas text-3xl sm:text-4xl tracking-wide text-[#EEEFF2]">
                TEST TENANT STOREFRONTS
              </div>
              <p className="font-sans text-sm text-[#EEEFF2]/70 mt-1">
                Click any tenant below to test dynamic App Router routing directly.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 font-mono text-xs text-[#EEEFF2]/60 bg-[#272835] px-3 py-1.5 rounded-xl border border-[#EEEFF2]/10">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Middleware Ready</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sampleStores.map((store) => (
              <Link
                key={store.subdomain}
                href={`/${store.subdomain}`}
                className="group p-5 rounded-xl bg-[#090A0F] border border-[#EEEFF2]/15 hover:border-[#EEEFF2]/35 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs px-2 py-0.5 rounded-xl bg-[#272835] text-[#EEEFF2]/80 border border-[#EEEFF2]/10">
                      /{store.subdomain}
                    </span>
                    <span className="font-mono text-xs text-emerald-400">
                      {store.status}
                    </span>
                  </div>
                  <div className="font-sans font-semibold text-base text-[#EEEFF2] group-hover:text-white transition-colors">
                    {store.name}
                  </div>
                  <div className="font-mono text-xs text-[#EEEFF2]/50 mt-1">
                    {store.items} active catalog products
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-[#EEEFF2]/10 flex items-center justify-between text-xs font-medium text-[#EEEFF2]/80 group-hover:text-white">
                  <span>Visit Storefront</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#EEEFF2]/60 group-hover:text-[#EEEFF2]" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* Platform Footer */}
      <footer className="border-t border-[#EEEFF2]/15 py-8 bg-[#010101]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[#EEEFF2]/60" />
            <span className="font-sans text-sm text-[#EEEFF2]/70">
              3NFM Multi-Tenant SaaS Platform &copy; {new Date().getFullYear()}
            </span>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs text-[#EEEFF2]/50">
            <span>Root Domain: localhost:3000</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
