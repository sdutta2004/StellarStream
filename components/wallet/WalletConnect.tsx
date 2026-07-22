"use client";

import { useState } from "react";
import { Wallet, ChevronDown, Copy, ExternalLink, LogOut, Check, Loader2 } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { cn, shortAddress, copyToClipboard, explorerAccountUrl, explorerContractUrl } from "@/lib/utils";
import { STELLAR_CONFIG } from "@/lib/stellar/config";

export function WalletConnect() {
  const { isConnected, address, balance, rewardBalance, isConnecting, error, connect, disconnect } = useWallet();
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!address) return;
    const success = await copyToClipboard(address);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isConnected) {
    return (
      <button
        id="wallet-connect-btn"
        onClick={connect}
        disabled={isConnecting}
        className="btn-stellar"
      >
        {isConnecting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin relative z-10" />
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <Wallet className="w-4 h-4 relative z-10" />
            <span>Connect Wallet</span>
          </>
        )}
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        id="wallet-dropdown-btn"
        onClick={() => setShowDropdown(!showDropdown)}
        className={cn(
          "flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all font-sans",
          "border border-slate-200 bg-white hover:bg-slate-50 shadow-sm",
          showDropdown && "bg-slate-50 border-blue-300 ring-2 ring-blue-500/10"
        )}
      >
        {/* Avatar */}
        <div className="w-6 h-6 rounded-full bg-stellar-gradient flex-shrink-0" />

        {/* Address */}
        <span className="text-sm font-mono font-semibold text-slate-800 hidden sm:block">
          {shortAddress(address!, 4)}
        </span>

        {/* Balance */}
        {balance && (
          <span className="text-xs font-semibold text-slate-500 hidden md:block">
            {parseFloat(balance).toFixed(2)} XLM
          </span>
        )}

        <ChevronDown
          className={cn(
            "w-4 h-4 text-slate-400 transition-transform",
            showDropdown && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />

          <div
            id="wallet-dropdown"
            className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-slate-200 bg-white shadow-xl z-50 overflow-hidden animate-fade-in"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-stellar-gradient flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900">Connected</p>
                  <div className="flex items-center gap-1.5">
                    <div className="dot-active" />
                    <span className="text-xs font-semibold text-slate-500">Testnet</span>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200">
                <span className="text-xs font-mono font-medium text-slate-700 flex-1 truncate">
                  {address}
                </span>
                <button
                  onClick={handleCopy}
                  className="flex-shrink-0 p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
                  aria-label="Copy address"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Balances (XLM & STRM) */}
            <div className="px-4 py-3 border-b border-slate-100 space-y-3">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-0.5">XLM Balance</p>
                <p className="text-xl font-extrabold text-slate-900 font-mono">
                  {balance ? parseFloat(balance).toFixed(4) : "—"}{" "}
                  <span className="text-xs font-normal text-slate-500 font-sans">XLM</span>
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 mb-0.5">STRM Rewards</p>
                <p className="text-xl font-extrabold gradient-text font-mono">
                  {rewardBalance !== null ? (rewardBalance / 10_000_000).toFixed(2) : "—"}{" "}
                  <span className="text-xs font-normal text-slate-500 font-sans">STRM</span>
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="px-2 py-2 space-y-1 bg-white">
              <a
                href={address ? explorerAccountUrl(address) : explorerContractUrl(STELLAR_CONFIG.contractId)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                onClick={() => setShowDropdown(false)}
              >
                <ExternalLink className="w-4 h-4 text-slate-400" />
                View on Explorer
              </a>

              <button
                id="wallet-disconnect-btn"
                onClick={() => {
                  disconnect();
                  setShowDropdown(false);
                }}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                Disconnect
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
