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
import { STELLAR_CONFIG } from "@/lib/stellar/config";
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
    <aside className="hidden lg:flex flex-col w-64 min-h-screen border-r border-slate-200 bg-white fixed left-0 top-0 z-30 shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-stellar-gradient flex items-center justify-center flex-shrink-0 shadow-glow">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-base text-slate-900 gradient-text font-sans">StellarStream</h1>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600">Streaming Protocol</p>
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
                "nav-item group relative px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-3",
                isActive
                  ? "bg-blue-50/80 border border-blue-200 text-blue-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")} />
              <span className="text-sm flex-1">{label}</span>
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
      <div className="px-4 py-5 border-t border-slate-100 space-y-3 bg-slate-50/50">
        {/* Network badge */}
        <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="dot-active" />
            <span className="text-xs text-slate-700 capitalize font-semibold">
              {STELLAR_CONFIG.network}
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold text-blue-600">
            Fee: 0.0001 XLM
          </span>
        </div>

        {/* Contract link */}
        {STELLAR_CONFIG.contractId && (
          <a
            href={explorerContractUrl(STELLAR_CONFIG.contractId)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all duration-200 group"
          >
            <div className="w-4 h-4 rounded bg-blue-100 flex items-center justify-center flex-shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 group-hover:scale-125 transition-transform" />
            </div>
            <span className="text-xs text-slate-600 font-mono flex-1 truncate group-hover:text-blue-700 font-medium">
              {shortAddress(STELLAR_CONFIG.contractId, 4)}
            </span>
            <ExternalLink className="w-3 h-3 text-slate-400 opacity-60 group-hover:opacity-100 transition-opacity" />
          </a>
        )}

        {/* STRM token label */}
        <div className="px-3 py-1.5 rounded-lg text-center">
          <span className="text-[10px] text-slate-500 font-mono font-medium">STRM Protocol Token Active</span>
        </div>
      </div>
    </aside>
  );
}
