"use client";

import { useTransactionStore } from "@/store/transaction-store";
import {
  FileCode,
  ArrowUpRight,
  Heart,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Clock,
  ExternalLink,
  Trash2,
  Award,
  Shield,
  Activity,
  Zap,
} from "lucide-react";
import { cn, formatXlm, explorerTxUrl } from "@/lib/utils";

const TYPE_CONFIG = {
  create_campaign: {
    icon: Zap,
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
    label: "Create Payment Stream",
  },
  donate: {
    icon: Heart,
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
    label: "Stream Funded",
  },
  withdraw: {
    icon: ArrowUpRight,
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-200",
    label: "Vested XLM Withdrawn",
  },
  refund: {
    icon: RotateCcw,
    color: "text-purple-700",
    bg: "bg-purple-50 border-purple-200",
    label: "Stream Refunded",
  },
  initialize: {
    icon: Shield,
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
    label: "Initialize Contract",
  },
};

const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    color: "text-amber-600",
    className: "badge-pending",
  },
  success: {
    icon: CheckCircle,
    color: "text-emerald-600",
    className: "badge-completed",
  },
  failed: {
    icon: AlertTriangle,
    color: "text-red-600",
    className: "badge-cancelled",
  },
};

export default function TransactionsPage() {
  const { transactions, clearAll, removeTransaction } = useTransactionStore();

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight font-sans gradient-text">Transaction History</h1>
          <p className="text-slate-500 mt-1 font-medium">
            Track your Soroban smart contract submissions and their status on the Stellar network
          </p>
        </div>

        {transactions.length > 0 && (
          <button
            onClick={clearAll}
            className="btn-ghost text-xs text-red-600 hover:bg-red-50 border-red-200 py-2 px-3.5"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
            Clear History
          </button>
        )}
      </div>

      {/* List */}
      {transactions.length === 0 ? (
        <div className="glass-card p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 mx-auto flex items-center justify-center">
            <Activity className="w-6 h-6 text-slate-400" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-slate-900">No Transactions Recorded Yet</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto font-medium">
              Transactions performed on this device will be logged here in real time.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => {
            const typeConfig = TYPE_CONFIG[tx.type] || {
              icon: FileCode,
              color: "text-slate-600",
              bg: "bg-slate-50 border-slate-200",
              label: tx.type,
            };
            const statusConfig = STATUS_CONFIG[tx.status];
            const Icon = typeConfig.icon;
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={tx.id}
                className="glass-card p-5 flex items-start gap-4 hover:translate-y-0 hover:scale-100"
              >
                {/* Type Icon */}
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0 shadow-sm",
                    typeConfig.bg
                  )}
                >
                  <Icon className={cn("w-5 h-5", typeConfig.color)} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">
                        {typeConfig.label}
                      </h3>
                      <p className="text-sm text-slate-600 font-medium mt-1">
                        {tx.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
                      <span className={cn("badge text-xs font-bold", statusConfig.className)}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {tx.status}
                      </span>
                    </div>
                  </div>

                  {/* Details row */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100 font-medium">
                    <span>
                      {tx.timestamp.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}{" "}
                      {tx.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>

                    {tx.amount !== undefined && (
                      <span className={cn("font-bold font-mono", typeConfig.color)}>
                        Amount: {formatXlm(tx.amount)}
                      </span>
                    )}

                    {tx.campaignId && (
                      <span className="font-mono">Stream #{tx.campaignId}</span>
                    )}

                    {tx.hash ? (
                      <a
                        href={explorerTxUrl(tx.hash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors font-mono font-bold ml-auto"
                      >
                        Tx: {tx.hash.slice(0, 12)}...
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <span className="italic ml-auto text-slate-400">Simulated/Pending sign</span>
                    )}
                  </div>

                  {/* Error display */}
                  {tx.error && (
                    <div className="mt-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-1.5 leading-relaxed font-medium">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                      <span>{tx.error}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
