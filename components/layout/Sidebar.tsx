"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Zap,
  Activity,
  History,
  Radio,
  ExternalLink,
} from "lucide-react";
import { cn, shortAddress } from "@/lib/utils";
import { useWalletStore } from "@/store/wallet-store";
import { STELLAR_CONFIG, DEPLOYER_ADDRESS } from "@/lib/stellar/config";
import { explorerContractUrl } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Zap },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/campaigns", label: "Active Streams", icon: Radio },
  { href: "/activity", label: "Activity Feed", icon: Activity },
  { href: "/transactions", label: "Transactions", icon: History },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isConnected, address } = useWalletStore();

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen border-r border-white/[0.06] bg-gradient-to-b from-black/50 to-black/30 backdrop-blur-xl fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-7 border-b border-white/[0.06]">
        <div className="w-10 h-10 rounded-xl bg-stellar-gradient flex items-center justify-center flex-shrink-0 shadow-glow-stream">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="font-bold text-base text-foreground gradient-text">StellarStream</h1>
          <p className="text-xs font-mono uppercase tracking-wider" style={{ color: "hsl(270, 80%, 65%)" }}>Streaming Protocol</p>
        </div>
      </div>

      {/* Stream flow indicator bar */}
      <div className="stream-bar mx-4 mt-0" />

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "nav-item group relative px-4 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-3",
                isActive
                  ? "bg-primary/8 border border-primary/25 text-primary"
                  : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium flex-1">{label}</span>
              {isActive && (
                <div className="flex items-center gap-2">
                  <div className="dot-active w-1.5 h-1.5" />
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom info */}
      <div className="px-4 py-5 border-t border-white/[0.06] space-y-3">
        {/* Network badge */}
        <div className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] transition-colors">
          <div className="flex items-center gap-2">
            <div className="dot-active" />
            <span className="text-xs text-muted-foreground capitalize font-medium">
              {STELLAR_CONFIG.network}
            </span>
          </div>
          <span className="text-[10px] font-mono font-semibold" style={{ color: "hsl(185, 100%, 60%)" }}>
            Fee: 0.0001 XLM
          </span>
        </div>

        {/* Contract link */}
        {STELLAR_CONFIG.contractId && (
          <a
            href={explorerContractUrl(STELLAR_CONFIG.contractId)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] hover:border-primary/35 transition-all duration-200 group"
          >
            <div className="w-4 h-4 rounded bg-primary/20 flex items-center justify-center flex-shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-primary group-hover:scale-125 transition-transform" />
            </div>
            <span className="text-xs text-muted-foreground font-mono flex-1 truncate group-hover:text-primary/70 transition-colors">
              {shortAddress(STELLAR_CONFIG.contractId, 4)}
            </span>
            <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        )}

        {/* STRM token label */}
        <div className="px-3 py-2 rounded-lg text-center">
          <span className="text-[10px] text-muted-foreground font-mono">STRM Protocol Token Active</span>
        </div>
      </div>
    </aside>
  );
}
