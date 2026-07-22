"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Zap } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useTransactionStore } from "@/store/transaction-store";
import { WalletConnect } from "@/components/wallet/WalletConnect";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/campaigns", label: "Active Streams" },
  { href: "/activity", label: "Activity" },
  { href: "/transactions", label: "Transactions" },
];

export function Navbar() {
  const pathname = usePathname();
  const { getPendingTransactions } = useTransactionStore();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const pending = getPendingTransactions();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md lg:pl-64">
      <div className="flex items-center justify-between h-16 px-4 md:px-6 max-w-screen-2xl mx-auto">
        {/* Mobile logo */}
        <Link href="/" className="flex items-center gap-2.5 lg:hidden">
          <div className="w-8 h-8 rounded-xl bg-stellar-gradient flex items-center justify-center shadow-glow">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-base gradient-text font-sans">StellarStream</span>
        </Link>

        {/* Desktop: page breadcrumb */}
        <div className="hidden lg:flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-slate-500">
          <span className="gradient-text font-bold">StellarStream</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-bold">
            {NAV_ITEMS.find(
              (item) =>
                item.href === pathname ||
                (item.href !== "/" && pathname.startsWith(item.href))
            )?.label || "Home"}
          </span>
          <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] bg-blue-50 border border-blue-200 text-blue-700 normal-case font-mono font-bold">
            Soroban Testnet
          </span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Pending transactions indicator */}
          {pending.length > 0 && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200">
              <div className="dot-pending" />
              <span className="text-xs text-amber-700 font-medium">
                {pending.length} pending
              </span>
            </div>
          )}

          {/* Wallet connect button */}
          <WalletConnect />

          {/* Mobile menu toggle */}
          <button
            className="lg:hidden btn-ghost p-2"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5 text-slate-700" />
          </button>
        </div>
      </div>

      {/* Mobile nav dropdown */}
      {showMobileMenu && (
        <div className="lg:hidden border-t border-slate-200 bg-white shadow-lg">
          <nav className="flex flex-col px-4 py-3 gap-1">
            {NAV_ITEMS.map(({ href, label }) => {
              const isActive =
                href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setShowMobileMenu(false)}
                  className={cn(
                    "px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors",
                    isActive
                      ? "text-blue-700 bg-blue-50 border border-blue-200"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
