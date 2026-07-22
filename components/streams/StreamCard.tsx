"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Zap, Clock, TrendingUp, Radio, CheckCircle2, XCircle, Timer } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StreamCardProps {
  id: number;
  title: string;
  description: string;
  senderAddress: string;
  totalVault: number; // in stroops
  raised: number;     // vested/streamed so far, in stroops
  deadline: number;   // unix timestamp
  status: "Active" | "Successful" | "Expired" | "Withdrawn";
}

const STROOPS_PER_XLM = 10_000_000;

function formatXLM(stroops: number): string {
  return (stroops / STROOPS_PER_XLM).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}

function shortAddr(addr: string, chars = 4): string {
  if (!addr || addr.length < chars * 2 + 3) return addr;
  return `${addr.slice(0, chars)}…${addr.slice(-chars)}`;
}

function getStatusConfig(status: StreamCardProps["status"], isLive: boolean) {
  if (status === "Active" && isLive) {
    return {
      label: "Streaming Live",
      className: "badge-streaming",
      icon: Radio,
    };
  }
  if (status === "Active") {
    return {
      label: "Active",
      className: "badge-active",
      icon: Zap,
    };
  }
  if (status === "Successful" || status === "Withdrawn") {
    return {
      label: "Completed",
      className: "badge-completed",
      icon: CheckCircle2,
    };
  }
  if (status === "Expired") {
    return {
      label: "Cancelled",
      className: "badge-cancelled",
      icon: XCircle,
    };
  }
  return { label: status, className: "badge-expired", icon: Timer };
}

export function StreamCard({
  id,
  title,
  description,
  senderAddress,
  totalVault,
  raised,
  deadline,
  status,
}: StreamCardProps) {
  const now = Math.floor(Date.now() / 1000);
  const isLive = status === "Active" && now < deadline;
  const elapsed = Math.max(0, now - (deadline - (deadline - now)));

  // Live ticking vested amount
  const [vestedDisplay, setVestedDisplay] = useState(raised);

  useEffect(() => {
    if (!isLive || totalVault <= 0 || deadline <= now) return;

    const streamDuration = deadline - (now - elapsed);
    const flowRatePerSec = totalVault / Math.max(streamDuration, 1);

    const interval = setInterval(() => {
      setVestedDisplay((prev) => {
        const next = prev + flowRatePerSec;
        return Math.min(next, totalVault);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isLive, totalVault, deadline, raised]);

  const progress = Math.min(100, (vestedDisplay / Math.max(totalVault, 1)) * 100);
  const statusConfig = getStatusConfig(status, isLive);
  const StatusIcon = statusConfig.icon;

  const timeLeft = Math.max(0, deadline - Math.floor(Date.now() / 1000));
  const daysLeft = Math.floor(timeLeft / 86400);
  const hoursLeft = Math.floor((timeLeft % 86400) / 3600);

  // Flow rate display
  const totalDurationEst = deadline - (now - elapsed);
  const flowRateXLM = totalVault > 0 && totalDurationEst > 0
    ? (totalVault / STROOPS_PER_XLM) / totalDurationEst
    : 0;

  return (
    <div className="glass-card p-5 flex flex-col gap-4 group neon-border-hover">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors truncate">
            {title}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 font-mono truncate">
            Sender: {shortAddr(senderAddress)}
          </p>
        </div>
        <span className={cn(statusConfig.className, "flex-shrink-0 flex items-center gap-1")}>
          <StatusIcon className="w-3 h-3" />
          {statusConfig.label}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
        {description}
      </p>

      {/* Stream progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-500 font-medium">Vested</span>
          <span className={cn("font-mono font-bold", isLive ? "stream-counter" : "text-slate-900")}>
            {formatXLM(vestedDisplay)} <span className="text-slate-400 font-normal">/ {formatXLM(totalVault)} XLM</span>
          </span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-slate-500 font-medium">
          <span>{progress.toFixed(1)}% vested</span>
          {isLive && (
            <span className="text-blue-600 font-mono font-bold">
              {flowRateXLM.toFixed(6)} XLM/sec
            </span>
          )}
        </div>
      </div>

      {/* Stream flow animation bar */}
      {isLive && <div className="stream-bar" />}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          {isLive ? (
            <span>
              {daysLeft}d {hoursLeft}h remaining
            </span>
          ) : (
            <span className={status === "Expired" ? "text-red-500" : "text-blue-600 font-semibold"}>
              {status === "Expired" ? "Stream ended" : "Stream complete"}
            </span>
          )}
        </div>
        <Link
          href={`/campaigns/${id}`}
          id={`stream-card-view-${id}`}
          className="btn-ghost px-3 py-1.5 text-xs font-semibold hover:border-blue-300"
        >
          <TrendingUp className="w-3 h-3 text-blue-600" />
          View Stream
        </Link>
      </div>
    </div>
  );
}
