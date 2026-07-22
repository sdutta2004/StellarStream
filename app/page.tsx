import Link from "next/link";
import { Zap, Shield, TrendingUp, Cpu, ArrowRight, Star, Coins, Radio, Timer } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "StellarStream | Real-Time XLM Payment & Salary Streaming Protocol",
  description: "Stream XLM salaries per second, vest funds on-chain, and earn STRM tokens. The next-generation real-time payment streaming protocol on Stellar Soroban.",
};

const BENEFITS = [
  {
    icon: Radio,
    title: "Real-Time Vesting Vaults",
    description:
      "Payment streams calculate vested XLM every second, on-chain. The recipient's balance ticks up in real time — trustless and fully automated by Soroban smart contracts.",
    color: "text-primary",
    bg: "bg-primary/10 border-primary/20",
  },
  {
    icon: Zap,
    title: "Per-Second Settlements",
    description:
      "Stellar confirms streams in seconds. XLM flows continuously at the defined rate — no batches, no delays. Average fee under 0.001 XLM per transaction.",
    color: "text-primary",
    bg: "bg-primary/10 border-primary/20",
  },
  {
    icon: Coins,
    title: "STRM Reward Tokens",
    description:
      "Every 1 XLM streamed mints 1 STRM protocol token (1:1 ratio) via cross-contract call. Build verifiable on-chain streaming history for senders and recipients.",
    color: "text-secondary",
    bg: "bg-secondary/10 border-secondary/20",
  },
  {
    icon: Cpu,
    title: "Cancelable & Non-Custodial",
    description:
      "Senders can cancel any stream at any time — unvested funds return instantly. No platform fees, no intermediaries. Fully self-sovereign payment streaming.",
    color: "text-secondary",
    bg: "bg-secondary/10 border-secondary/20",
  },
];

const STATS = [
  { label: "Active Payment Streams", value: "12", suffix: "" },
  { label: "Total XLM Vaulted", value: "120,000", suffix: " XLM" },
  { label: "Avg. Transaction Fee", value: "< 0.0001", suffix: " XLM" },
  { label: "STRM Mint Rate", value: "1:1", suffix: "" },
];

export default function HomePage() {
  return (
    <div className="space-y-24 pb-20">
      {/* ── Hero section — Electric Cyan / Deep Violet ─────────────────── */}
      <section className="relative flex flex-col items-center text-center pt-12 pb-16 gap-8 overflow-hidden">
        {/* Glow effects */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[450px] rounded-full bg-primary/8 blur-[120px] pointer-events-none" />
        <div className="absolute top-40 left-1/4 w-[450px] h-[350px] rounded-full bg-secondary/8 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[250px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

        {/* Live indicator badge */}
        <div
          id="hero-badge"
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-sm font-semibold text-primary animate-fade-in backdrop-blur-sm"
          style={{ boxShadow: "0 0 20px hsl(185 100% 50% / 0.12)" }}
        >
          <div className="dot-active" />
          Real-Time XLM Streaming on Stellar Soroban
        </div>

        {/* Headline */}
        <div className="space-y-6 animate-fade-in max-w-5xl">
          <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[1.05] font-sans">
            Stream Salaries{" "}
            <br />
            <span className="gradient-text font-black">Per Second, On-Chain</span>
          </h1>
          <p className="text-base md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            StellarStream is the next-generation protocol for real-time XLM payment streaming
            and salary vesting on Stellar. Set a flow rate, lock the vault, and watch XLM vest
            every second — trustless, instant, and non-custodial.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in pt-6">
          <Link
            href="/campaigns"
            id="explore-streams-btn"
            className="btn-stellar px-8 py-4 text-base font-bold"
            style={{ boxShadow: "0 0 30px hsl(185 100% 50% / 0.35)" }}
          >
            <Radio className="w-5 h-5 relative z-10" />
            <span>View Active Streams</span>
          </Link>
          <Link
            href="/dashboard"
            id="wallet-dashboard-btn"
            className="btn-ghost px-8 py-4 text-base font-semibold"
          >
            Access Dashboard
            <ArrowRight className="w-4 h-4" style={{ color: "hsl(270, 100%, 65%)" }} />
          </Link>
        </div>

        {/* Network indicator */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground animate-fade-in pt-4">
          <div className="dot-active" />
          Live on Stellar Soroban Testnet
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
        {STATS.map(({ label, value, suffix }, i) => (
          <div
            key={label}
            className="glass-card p-6 md:p-8 text-center animate-fade-in hover:border-primary/40 transition-all duration-300"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <p className="text-3xl md:text-4xl font-black gradient-text">
              {value}
              {suffix}
            </p>
            <p className="text-xs md:text-sm text-muted-foreground mt-2 font-medium tracking-wide uppercase">
              {label}
            </p>
          </div>
        ))}
      </section>

      {/* ── Benefits ─────────────────────────────────────────────────────── */}
      <section className="space-y-12 max-w-6xl mx-auto">
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            The Future of Decentralized Payroll
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg">
            Built for engineers, DAOs, and enterprises who want real-time, verifiable, on-chain payment streams.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {BENEFITS.map(({ icon: Icon, title, description, color, bg }, i) => (
            <div
              key={title}
              className="glass-card p-6 md:p-8 flex gap-6 animate-fade-in hover:border-primary/40 hover:bg-primary/[0.02] transition-all duration-300 group"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div
                className={`w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center flex-shrink-0 border ${bg} group-hover:scale-110 transition-transform duration-300`}
              >
                <Icon className={`w-6 h-6 md:w-7 md:h-7 ${color}`} />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <section className="space-y-12 max-w-6xl mx-auto">
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            How StellarStream Works
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">
            Launch a payment stream in 3 steps — no intermediaries required
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {[
            {
              step: "01",
              title: "Connect Wallet & Set Rate",
              desc: "Link your Freighter wallet. Define the recipient address, total XLM vault, and stream duration to calculate the per-second flow rate automatically.",
            },
            {
              step: "02",
              title: "Lock Vault & Launch Stream",
              desc: "XLM is locked into the Soroban smart contract vault. The stream begins immediately, vesting funds per second to the recipient's address.",
            },
            {
              step: "03",
              title: "Withdraw Vested & Earn STRM",
              desc: "Recipients withdraw vested XLM anytime. Both parties earn STRM protocol tokens at 1:1 ratio — verifiable on-chain streaming credentials.",
            },
          ].map(({ step, title, desc }, i) => (
            <div
              key={step}
              className="glass-card p-6 md:p-8 space-y-4 animate-fade-in hover:border-primary/40 transition-all duration-300"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-stellar-gradient flex items-center justify-center shadow-glow-stream">
                <span className="font-black text-white text-sm md:text-base">{step}</span>
              </div>
              <h3 className="font-bold text-lg">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────────────── */}
      <section className="glass-card max-w-5xl mx-auto p-10 md:p-14 lg:p-16 text-center space-y-8 relative overflow-hidden group">
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none group-hover:opacity-[0.06] transition-opacity duration-300"
          style={{ background: "linear-gradient(135deg, hsl(185,100%,40%) 0%, hsl(270,100%,55%) 100%)" }}
        />
        <div className="absolute inset-x-0 top-0 h-px stream-bar" />
        <h2 className="text-4xl md:text-5xl font-bold relative tracking-tight">
          Ready to{" "}
          <span className="gradient-text">Launch a Stream?</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto relative text-base md:text-lg">
          Join the trustless payment streaming protocol on Stellar. Stream salaries, vest tokens,
          and build transparent payment rails — one second at a time.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative">
          <Link
            href="/campaigns"
            id="cta-launch-stream-btn"
            className="btn-stellar px-8 py-3.5 text-base font-bold"
            style={{ boxShadow: "0 0 25px hsl(185 100% 50% / 0.3)" }}
          >
            <Zap className="w-5 h-5 relative z-10" />
            <span>Launch a Payment Stream</span>
          </Link>
          <Link
            href="/activity"
            id="cta-activity-feed-btn"
            className="btn-ghost px-8 py-3.5 text-base"
          >
            Monitor Live Streams
          </Link>
        </div>
      </section>
    </div>
  );
}
