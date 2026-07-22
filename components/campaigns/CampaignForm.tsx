"use client";

import { useState } from "react";
import { X, Zap, Calendar, Target, FileText, Loader2, AlertCircle } from "lucide-react";
import { useCreateCampaign } from "@/hooks/useCampaigns";
import { useWalletStore } from "@/store/wallet-store";
import { cn } from "@/lib/utils";
import type { CreateCampaignParams } from "@/types";

interface StreamFormModalProps {
  onClose: () => void;
}

export function CampaignForm({ onClose }: StreamFormModalProps) {
  const { isConnected } = useWalletStore();
  const { mutate: createCampaign, isPending, error } = useCreateCampaign();

  const [form, setForm] = useState<CreateCampaignParams>({
    title: "",
    description: "",
    goal: 100,
    durationDays: 30,
  });

  const [formErrors, setFormErrors] = useState<Partial<CreateCampaignParams>>({});

  const validate = () => {
    const errors: Partial<CreateCampaignParams> = {};
    if (!form.title.trim()) errors.title = "Title is required" as unknown as string;
    if (form.title.length > 100) errors.title = "Max 100 characters" as unknown as string;
    if (!form.description.trim()) errors.description = "Description is required" as unknown as string;
    if (form.description.length > 500) errors.description = "Max 500 characters" as unknown as string;
    if (form.goal < 1) errors.goal = 1;
    if (form.durationDays < 1 || form.durationDays > 365) errors.durationDays = 30;
    return errors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validate();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    createCampaign(form, {
      onSuccess: () => onClose(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        id="create-stream-modal"
        className="relative w-full max-w-lg glass-card bg-white shadow-2xl animate-fade-in"
        style={{ transform: "none" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-stellar-gradient flex items-center justify-center shadow-md">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900">Launch Payment Stream</h2>
              <p className="text-xs text-slate-500 font-medium">Create a new real-time XLM salary vesting vault</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* STRM Token Info Banner */}
        <div className="mx-6 mt-4 p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center gap-2.5 text-xs text-blue-800 font-medium">
          <Zap className="w-4 h-4 flex-shrink-0 text-blue-600" />
          <span>Stream participants receive <strong>1 STRM Token</strong> per 1 XLM streamed via cross-contract mint.</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Title */}
          <div className="space-y-1.5">
            <label htmlFor="campaign-title" className="text-sm font-semibold text-slate-700">
              Stream Title *
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="campaign-title"
                type="text"
                placeholder="e.g. Monthly Developer Salary — Q1 2026"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={cn(
                  "input-stellar pl-10",
                  formErrors.title && "border-red-300 ring-2 ring-red-500/10"
                )}
                maxLength={100}
              />
            </div>
            {formErrors.title && (
              <p className="text-xs text-red-600 font-medium">{String(formErrors.title)}</p>
            )}
            <p className="text-xs text-slate-400 text-right font-mono">
              {form.title.length}/100
            </p>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor="campaign-desc" className="text-sm font-semibold text-slate-700">
              Stream Purpose & Terms *
            </label>
            <textarea
              id="campaign-desc"
              placeholder="Describe stream purpose, recipient expectations, and vesting terms..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className={cn(
                "input-stellar resize-none",
                formErrors.description && "border-red-300 ring-2 ring-red-500/10"
              )}
              maxLength={500}
            />
            {formErrors.description && (
              <p className="text-xs text-red-600 font-medium">{String(formErrors.description)}</p>
            )}
            <p className="text-xs text-slate-400 text-right font-mono">
              {form.description.length}/500
            </p>
          </div>

          {/* Escrow Goal + Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="campaign-goal" className="text-sm font-semibold text-slate-700">
                <div className="flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-blue-600" />
                  Total Vault (XLM) *
                </div>
              </label>
              <input
                id="campaign-goal"
                type="number"
                min="1"
                step="1"
                value={form.goal}
                onChange={(e) =>
                  setForm({ ...form, goal: parseFloat(e.target.value) || 0 })
                }
                className={cn(
                  "input-stellar",
                  formErrors.goal && "border-red-300 ring-2 ring-red-500/10"
                )}
              />
              <p className="text-xs text-slate-500 font-medium">
                ≈ ${(form.goal * 0.12).toFixed(0)} USD
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="campaign-duration" className="text-sm font-semibold text-slate-700">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-purple-600" />
                  Duration (Days) *
                </div>
              </label>
              <input
                id="campaign-duration"
                type="number"
                min="1"
                max="365"
                value={form.durationDays}
                onChange={(e) =>
                  setForm({
                    ...form,
                    durationDays: parseInt(e.target.value) || 30,
                  })
                }
                className={cn(
                  "input-stellar",
                  formErrors.durationDays && "border-red-300 ring-2 ring-red-500/10"
                )}
              />
              <p className="text-xs text-slate-500 font-medium">
                Ends{" "}
                {new Date(
                  Date.now() + form.durationDays * 86400 * 1000
                ).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-medium">{String(error)}</p>
            </div>
          )}

          {/* Wallet warning */}
          {!isConnected && (
            <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800 font-medium">
                Please connect your wallet to launch a stream
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost flex-1"
            >
              Cancel
            </button>
            <button
              id="submit-gig-btn"
              type="submit"
              disabled={isPending || !isConnected}
              className="btn-stellar flex-1"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin relative z-10" />
                  <span>Launching…</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 relative z-10" />
                  <span>Launch Stream</span>
                </>
              )}
            </button>
          </div>

          {isConnected && (
            <p className="text-xs text-slate-400 text-center font-medium">
              This will submit a Soroban smart contract transaction on Stellar Testnet
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
