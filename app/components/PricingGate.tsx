"use client";

import { useState } from "react";
import Link from "next/link";

interface Props {
  requiredTier: "pro" | "club";
  currentTier: string;
  featureName: string;
  leagueSlug?: string;
  children: React.ReactNode;
}

const TIER_RANK: Record<string, number> = { starter: 0, pro: 1, club: 2 };

export default function PricingGate({
  requiredTier,
  currentTier,
  featureName,
  leagueSlug,
  children,
}: Props) {
  const [loading, setLoading] = useState(false);

  const hasAccess = (TIER_RANK[currentTier] ?? 0) >= (TIER_RANK[requiredTier] ?? 99);
  if (hasAccess) return <>{children}</>;

  async function handleUpgrade() {
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier: requiredTier, leagueSlug }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      setLoading(false);
    }
  }

  return (
    <div className="relative rounded-2xl border-2 border-dashed border-[#C9A84C]/40 bg-amber-50/50 p-8 text-center">
      <div className="text-3xl mb-3">🔒</div>
      <h3 className="font-semibold text-[#1A3D2B] mb-1">{featureName}</h3>
      <p className="text-sm text-gray-400 mb-5">
        Available on the{" "}
        <span className="font-medium capitalize text-[#C9A84C]">{requiredTier}</span> plan and above.
      </p>
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="px-5 py-2.5 rounded-full text-sm font-semibold text-[#1A3D2B] disabled:opacity-50 transition-opacity"
          style={{ backgroundColor: "#C9A84C" }}
        >
          {loading ? "Redirecting…" : `Upgrade to ${requiredTier}`}
        </button>
        <Link href="/#pricing" className="text-sm text-gray-400 hover:text-gray-600 underline">
          See plans
        </Link>
      </div>
    </div>
  );
}
