"use client";

import { EventFeed } from "@/components/activity/EventFeed";

export default function ActivityPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight gradient-text">Stream Activity Feed</h1>
        <p className="text-slate-500 mt-1 font-medium">
          Monitor real-time stream events — vault deposits, vested withdrawals, cancellations, and STRM token mints from the StellarStream contract on Stellar Testnet
        </p>
      </div>

      <div className="glass-card p-6">
        <EventFeed showHeader={true} />
      </div>
    </div>
  );
}
