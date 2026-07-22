"use client";

import { useEffect, useState } from "react";
import { Zap, TrendingDown, XCircle, Coins, AlertCircle, Loader2, Radio } from "lucide-react";

interface StreamVaultProps {
  streamId: number;
  totalVault: number;   // in stroops
  raised: number;       // vested so far, in stroops
  deadline: number;     // unix timestamp
  status: "Active" | "Successful" | "Expired" | "Withdrawn";
  isCreator?: boolean;  // true = sender, false = recipient
  onWithdraw?: (streamId: number) => Promise<void>;
  onCancel?: (streamId: number) => Promise<void>;
  isLoading?: boolean;
}

const STROOPS_PER_XLM = 10_000_000;

function formatXLM(stroops: number, decimals = 4): string {
  return (stroops / STROOPS_PER_XLM).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  });
}

export function StreamVault({
  streamId,
  totalVault,
  raised,
  deadline,
  status,
  isCreator = false,
  onWithdraw,
  onCancel,
  isLoading = false,
}: StreamVaultProps) {
  const now = Math.floor(Date.now() / 1000);
  const isLive = status === "Active" && now < deadline;

  // Live ticking vested counter
  const [vestedNow, setVestedNow] = useState(raised);

  useEffect(() => {
    if (!isLive || totalVault <= 0) return;

    const streamStartEst = deadline - (deadline - now);
    const remainingSec = Math.max(0, deadline - now);
    const totalDuration = deadline; // approximation
    const flowRatePerSec = totalVault / Math.max(totalDuration, 1);

    const interval = setInterval(() => {
      setVestedNow((prev) => Math.min(prev + flowRatePerSec, totalVault));
    }, 1000);

    return () => clearInterval(interval);
  }, [isLive, totalVault, deadline, raised]);

  const progress = Math.min(100, (vestedNow / Math.max(totalVault, 1)) * 100);
  const unvested = Math.max(0, totalVault - vestedNow);

  const remainingSec = Math.max(0, deadline - now);
  const flowRateXLM = remainingSec > 0 && isLive
    ? (totalVault / STROOPS_PER_XLM) / (deadline - (now - (now - (deadline - remainingSec))))
    : 0;

  const canWithdraw = status === "Successful" && isCreator;
  const canCancel = status === "Expired" && !isCreator;

  return (
    <div className="glass-card p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-stellar-gradient flex items-center justify-center shadow-md">
            <Radio className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 gradient-text">Stream Vault</h3>
            <p className="text-xs text-slate-500 font-medium">Stream #{streamId}</p>
          </div>
        </div>
        {isLive && (
          <span className="badge-streaming flex items-center gap-1.5">
            <span className="dot-active w-1.5 h-1.5" />
            Live
          </span>
        )}
      </div>

      {/* Animated stream bar */}
      {isLive && <div className="stream-bar" />}

      {/* Live vested counter */}
      <div className="glass-card p-5 border border-blue-200 bg-blue-50/30 space-y-4">
        <div className="text-center space-y-1">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">
            Vested XLM Available
          </p>
          <p className={`text-4xl font-extrabold font-mono ${isLive ? "stream-counter" : "text-slate-900"}`}>
            {formatXLM(vestedNow)}
          </p>
          <p className="text-sm text-slate-500 font-medium">
            of {formatXLM(totalVault)} XLM total vault
          </p>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between text-xs text-slate-500 font-medium">
            <span>{progress.toFixed(2)}% vested</span>
            <span>{formatXLM(unvested)} XLM unvested</span>
          </div>
        </div>
      </div>

      {/* Stream rate & stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-3.5 text-center space-y-1 border border-slate-200 bg-white">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Flow Rate</p>
          {isLive ? (
            <p className="text-sm font-mono font-bold stream-counter">
              {flowRateXLM.toFixed(6)}
              <span className="text-xs font-normal text-slate-500"> XLM/sec</span>
            </p>
          ) : (
            <p className="text-sm font-mono text-slate-400">—</p>
          )}
        </div>
        <div className="glass-card p-3.5 text-center space-y-1 border border-slate-200 bg-white">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">STRM Earned</p>
          <p className="text-sm font-mono font-bold text-slate-900">
            {Math.floor(vestedNow).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3 pt-1">
        {/* Withdraw vested XLM */}
        <button
          id={`stream-withdraw-${streamId}`}
          onClick={() => onWithdraw?.(streamId)}
          disabled={isLoading || (!canWithdraw && status !== "Successful")}
          className="btn-stellar w-full py-3 justify-center font-bold shadow-glow-stream"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin relative z-10" />
          ) : (
            <TrendingDown className="w-4 h-4 relative z-10" />
          )}
          <span>Withdraw Vested XLM</span>
        </button>

        {/* Cancel stream */}
        {(isCreator || status === "Expired") && (
          <button
            id={`stream-cancel-${streamId}`}
            onClick={() => onCancel?.(streamId)}
            disabled={isLoading || status === "Withdrawn"}
            className="btn-ghost w-full py-3 justify-center border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
          >
            <XCircle className="w-4 h-4 text-red-500" />
            Cancel Stream & Refund Unvested
          </button>
        )}
      </div>

      {/* Info note */}
      <div className="flex items-start gap-2 text-xs text-slate-600 p-3 rounded-xl bg-slate-50 border border-slate-200 font-medium">
        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-600" />
        <span>
          {isCreator
            ? "As stream sender, you can withdraw fully vested funds once the vault goal is reached."
            : "As stream recipient, you can claim a refund if the stream is cancelled or expired."}
          {" "}Every XLM streamed mints 1 STRM token (1:1 ratio).
        </span>
      </div>
    </div>
  );
}
