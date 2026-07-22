"use client";

import { useState } from "react";
import { Zap, Clock, Coins, FileText, User, AlertCircle, Loader2 } from "lucide-react";

interface StreamFormProps {
  onSubmit?: (data: {
    recipient: string;
    title: string;
    description: string;
    totalXLM: number;
    durationSeconds: number;
  }) => Promise<void>;
  isLoading?: boolean;
}

type DurationUnit = "seconds" | "days";

export function StreamForm({ onSubmit, isLoading = false }: StreamFormProps) {
  const [recipient, setRecipient] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [totalXLM, setTotalXLM] = useState("");
  const [duration, setDuration] = useState("");
  const [durationUnit, setDurationUnit] = useState<DurationUnit>("days");
  const [error, setError] = useState("");

  const durationSeconds =
    durationUnit === "days"
      ? parseFloat(duration || "0") * 86400
      : parseFloat(duration || "0");

  const flowRateXLMPerSec =
    durationSeconds > 0 && parseFloat(totalXLM) > 0
      ? parseFloat(totalXLM) / durationSeconds
      : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!recipient || !title || !totalXLM || !duration) {
      setError("All fields are required.");
      return;
    }
    if (isNaN(parseFloat(totalXLM)) || parseFloat(totalXLM) <= 0) {
      setError("Total deposit must be a positive number.");
      return;
    }
    if (isNaN(parseFloat(duration)) || parseFloat(duration) <= 0) {
      setError("Duration must be a positive number.");
      return;
    }

    try {
      await onSubmit?.({
        recipient,
        title,
        description,
        totalXLM: parseFloat(totalXLM),
        durationSeconds,
      });
    } catch (err: any) {
      setError(err?.message || "Failed to create payment stream.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-stellar-gradient flex items-center justify-center flex-shrink-0 shadow-glow-stream">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-lg gradient-text">Create Payment Stream</h2>
          <p className="text-xs text-muted-foreground">Launch a real-time XLM vesting stream on-chain</p>
        </div>
      </div>

      {/* Stream Title */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground/80">
          <FileText className="w-3.5 h-3.5 text-primary" />
          Stream Title
        </label>
        <input
          id="stream-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Monthly Salary — Jan 2026"
          maxLength={100}
          className="input-stellar"
          disabled={isLoading}
        />
      </div>

      {/* Recipient Address */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground/80">
          <User className="w-3.5 h-3.5 text-primary" />
          Recipient Address (Employee / Stream Recipient)
        </label>
        <input
          id="stream-recipient"
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="G... Stellar address"
          className="input-stellar font-mono"
          disabled={isLoading}
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground/80">
          <FileText className="w-3.5 h-3.5 text-muted-foreground" />
          Description
          <span className="text-muted-foreground text-xs font-normal">(optional)</span>
        </label>
        <textarea
          id="stream-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Stream purpose, payment terms, contract reference..."
          rows={3}
          maxLength={500}
          className="input-stellar resize-none"
          disabled={isLoading}
        />
      </div>

      {/* Total XLM Deposit */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground/80">
          <Coins className="w-3.5 h-3.5 text-primary" />
          Total XLM Deposit (Stream Vault)
        </label>
        <div className="relative">
          <input
            id="stream-total-xlm"
            type="number"
            min="0.0000001"
            step="0.0000001"
            value={totalXLM}
            onChange={(e) => setTotalXLM(e.target.value)}
            placeholder="0.00"
            className="input-stellar pr-16"
            disabled={isLoading}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-mono font-semibold text-primary">
            XLM
          </span>
        </div>
      </div>

      {/* Duration */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground/80">
          <Clock className="w-3.5 h-3.5 text-primary" />
          Stream Duration
        </label>
        <div className="flex gap-2">
          <input
            id="stream-duration"
            type="number"
            min="1"
            step="1"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="e.g. 30"
            className="input-stellar flex-1"
            disabled={isLoading}
          />
          <div className="flex rounded-lg border border-white/10 overflow-hidden flex-shrink-0">
            <button
              type="button"
              onClick={() => setDurationUnit("days")}
              className={`px-4 py-2 text-sm font-medium transition-all ${
                durationUnit === "days"
                  ? "bg-primary text-background"
                  : "bg-white/[0.04] text-muted-foreground hover:text-foreground"
              }`}
              disabled={isLoading}
            >
              Days
            </button>
            <button
              type="button"
              onClick={() => setDurationUnit("seconds")}
              className={`px-4 py-2 text-sm font-medium transition-all ${
                durationUnit === "seconds"
                  ? "bg-primary text-background"
                  : "bg-white/[0.04] text-muted-foreground hover:text-foreground"
              }`}
              disabled={isLoading}
            >
              Secs
            </button>
          </div>
        </div>
      </div>

      {/* Live flow rate preview */}
      {flowRateXLMPerSec > 0 && (
        <div className="glass-card p-4 space-y-3 border border-primary/20">
          <div className="stream-bar" />
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Stream Preview</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Flow Rate</p>
              <p className="font-mono font-bold stream-counter">
                {flowRateXLMPerSec.toFixed(7)} XLM/sec
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="font-mono font-semibold text-foreground">
                {durationUnit === "days"
                  ? `${duration} days`
                  : `${(durationSeconds / 86400).toFixed(2)} days`}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Vault</p>
              <p className="font-mono font-bold text-primary">{parseFloat(totalXLM).toFixed(4)} XLM</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">STRM Minted</p>
              <p className="font-mono font-semibold text-foreground">
                {(parseFloat(totalXLM) * 10_000_000).toLocaleString()} STRM
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        id="stream-create-btn"
        type="submit"
        disabled={isLoading}
        className="btn-stellar w-full py-3.5 justify-center text-base font-bold shadow-glow-stream"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin relative z-10" />
            <span>Launching Stream…</span>
          </>
        ) : (
          <>
            <Zap className="w-5 h-5 relative z-10" />
            <span>Launch Payment Stream</span>
          </>
        )}
      </button>
    </form>
  );
}
