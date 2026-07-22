"use client";

import { useEffect } from "react";
import {
  Wallet,
  Copy,
  ExternalLink,
  RefreshCw,
  Check,
  Network,
  Loader2,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Coins,
} from "lucide-react";
import { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import {
  copyToClipboard,
  explorerAccountUrl,
  shortAddress,
  formatXlm,
} from "@/lib/utils";
import { STELLAR_CONFIG } from "@/lib/stellar/config";
import { useTransactionStore } from "@/store/transaction-store";
import { explorerTxUrl } from "@/lib/utils";
import { cn } from "@/lib/utils";

// ── Helper: format STRM tokens (stroops → STRM) ────────────────────────────────
function formatStrm(stroops: number | null): string {
  if (stroops === null) return "—";
  return (stroops / 10_000_000).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function DashboardPage() {
  const {
    isConnected,
    address,
    balance,
    rewardBalance,
    network,
    isConnecting,
    error,
    connect,
    disconnect,
    refreshBalance,
  } = useWallet();

  const { getRecentTransactions } = useTransactionStore();
  const recentTxs = getRecentTransactions(5);

  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleCopy = async () => {
    if (!address) return;
    const ok = await copyToClipboard(address);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRefreshBalance = async () => {
    setIsRefreshing(true);
    await refreshBalance();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 gradient-text">Wallet Dashboard</h1>
        <p className="text-slate-500 mt-1 font-medium">
          Manage your Stellar wallet connection and view account details
        </p>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm text-red-800">
              Connection Error
            </p>
            <p className="text-sm text-red-700 font-medium mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {!isConnected ? (
        /* ── Not connected ── */
        <div className="glass-card p-12 flex flex-col items-center gap-6 text-center">
          <div className="w-20 h-20 rounded-2xl bg-stellar-gradient flex items-center justify-center shadow-lg">
            <Wallet className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900">Connect Your Wallet</h2>
            <p className="text-slate-600 max-w-sm font-medium">
              Connect a Stellar wallet to view your XLM balance, launch payment streams,
              and earn STRM protocol tokens on Stellar Testnet.
            </p>
          </div>
          <button
            id="dashboard-connect-btn"
            onClick={connect}
            disabled={isConnecting}
            className="btn-stellar px-8 py-3.5 text-base font-bold shadow-glow-stream"
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin relative z-10" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <Wallet className="w-5 h-5 relative z-10" />
                <span>Connect Wallet</span>
              </>
            )}
          </button>
          <p className="text-xs text-slate-400 font-medium">
            Supports Freighter, XBULL, Albedo, and more
          </p>
        </div>
      ) : (
        /* ── Connected ── */
        <div className="space-y-6">
          {/* Main wallet card */}
          <div className="glass-card p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-stellar-gradient flex items-center justify-center shadow-md">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-extrabold text-base text-slate-900">Connected Wallet</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="dot-active" />
                    <span className="text-xs text-slate-500 font-semibold capitalize">
                      {network || "testnet"}
                    </span>
                  </div>
                </div>
              </div>
              <button
                id="dashboard-disconnect-btn"
                onClick={disconnect}
                className="text-xs font-bold text-red-600 hover:text-red-700 transition-colors px-3 py-1.5 rounded-xl hover:bg-red-50 border border-red-200"
              >
                Disconnect
              </button>
            </div>

            {/* Address */}
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
                Stellar Address
              </p>
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200">
                <span
                  id="wallet-address-display"
                  className="font-mono text-sm text-slate-800 font-semibold flex-1 break-all"
                >
                  {address}
                </span>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    id="copy-address-btn"
                    onClick={handleCopy}
                    className="p-2 rounded-lg hover:bg-slate-200/60 text-slate-500 hover:text-slate-900 transition-colors"
                    aria-label="Copy address"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <a
                    id="explorer-link"
                    href={explorerAccountUrl(address!)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:bg-slate-200/60 text-slate-500 hover:text-slate-900 transition-colors"
                    aria-label="View on explorer"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Balance grid: XLM + STRM Reward + Network Info */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* XLM Balance */}
            <div className="glass-card p-6 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-slate-500">
                  XLM Balance
                </p>
                <button
                  id="refresh-balance-btn"
                  onClick={handleRefreshBalance}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                  aria-label="Refresh balance"
                >
                  <RefreshCw
                    className={cn(
                      "w-4 h-4",
                      isRefreshing && "animate-spin text-blue-600"
                    )}
                  />
                </button>
              </div>
              <p className="text-4xl font-extrabold gradient-text font-mono">
                {balance ? parseFloat(balance).toFixed(4) : "—"}
              </p>
              <p className="text-xs font-bold text-slate-400">XLM Native Asset</p>
            </div>

            {/* STRM Protocol Token Balance */}
            <div className="glass-card p-6 space-y-3 relative overflow-hidden bg-blue-50/40 border-blue-200">
              <div className="flex items-center justify-between relative">
                <p className="text-sm font-bold text-slate-500">
                  STRM Rewards
                </p>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 border border-blue-200">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                  <span className="text-[10px] text-blue-700 font-extrabold">Protocol Token</span>
                </div>
              </div>
              <p className="text-4xl font-extrabold relative gradient-text font-mono">
                {formatStrm(rewardBalance)}
              </p>
              <p className="text-xs text-slate-600 relative leading-relaxed font-medium">
                STRM — earned via payment streams.<br />
                <span className="text-blue-700 font-bold">1 STRM = 1 XLM streamed</span>
              </p>
            </div>

            {/* Network Info */}
            <div className="glass-card p-6 space-y-3">
              <p className="text-sm font-bold text-slate-500">
                Network Info
              </p>
              <div className="space-y-2.5">
                {[
                  { label: "Network", value: "Stellar Testnet" },
                  { label: "Contract", value: shortAddress(STELLAR_CONFIG.contractId || "Not deployed", 6) },
                  { label: "RPC", value: "soroban-testnet.stellar.org" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">{label}</span>
                    <span className="font-mono font-bold text-slate-800 text-xs">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent transactions */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="font-extrabold text-lg text-slate-900">Recent Transactions</h3>

            {recentTxs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500 text-sm font-medium">
                  No transactions recorded yet. Launch a payment stream or fund a vault to
                  get started.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentTxs.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-2.5 h-2.5 rounded-full",
                          tx.status === "success"
                            ? "bg-emerald-500"
                            : tx.status === "pending"
                            ? "bg-amber-500 animate-pulse"
                            : "bg-red-500"
                        )}
                      />
                      <div>
                        <p className="text-sm font-bold text-slate-900">{tx.description}</p>
                        <p className="text-xs text-slate-500 font-medium">
                          {tx.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-xs font-bold px-2 py-0.5 rounded-md",
                          tx.status === "success"
                            ? "text-emerald-700 bg-emerald-50"
                            : tx.status === "pending"
                            ? "text-amber-700 bg-amber-50"
                            : "text-red-700 bg-red-50"
                        )}
                      >
                        {tx.status}
                      </span>
                      {tx.hash && (
                        <a
                          href={explorerTxUrl(tx.hash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
