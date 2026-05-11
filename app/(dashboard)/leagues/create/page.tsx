"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { templates } from "@/lib/templates";

// ─── Types ────────────────────────────────────────────────────────────────────

interface WizardData {
  name: string;
  tagline: string;
  template: string;
  playerCount: string;
  scoringFormat: string;
  holes: number;
  features: string[];
  plan: string;
}

const empty: WizardData = {
  name: "",
  tagline: "",
  template: "classic-green",
  playerCount: "up-to-16",
  scoringFormat: "Stroke Play",
  holes: 18,
  features: [],
  plan: "starter",
};

const ALL_FEATURES = [
  { id: "handicaps",      label: "Handicaps",        starterLocked: true },
  { id: "payouts",        label: "Payouts & Earnings",starterLocked: true },
  { id: "skins",          label: "Skins",             starterLocked: false },
  { id: "kps",            label: "KPs",               starterLocked: true },
  { id: "birdies",        label: "Birdies",           starterLocked: true },
  { id: "live-leaderboard",label: "Live Leaderboard", starterLocked: true },
  { id: "player-profiles",label: "Player Profiles",   starterLocked: true },
  { id: "custom-domain",  label: "Custom Domain",     starterLocked: true },
];

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: "$0",
    period: "forever",
    features: ["Up to 16 players", "Scorecards & standings", "Skins only"],
    cta: "Start for Free",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$39",
    period: "/mo",
    features: ["Up to 32 players", "All features", "Live leaderboard", "Payouts & KPs"],
    cta: "Choose Pro",
    featured: true,
  },
  {
    id: "club",
    name: "Club",
    price: "$89",
    period: "/mo",
    features: ["Unlimited players", "Multiple leagues", "White-label", "Priority support"],
    cta: "Choose Club",
  },
];

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputCls =
  "w-full px-4 py-3 rounded-xl border border-[#2D6A4F]/30 bg-white text-[#1A3D2B] placeholder-[#1A3D2B]/40 focus:outline-none focus:border-[#2D6A4F] focus:ring-1 focus:ring-[#2D6A4F] transition-all text-sm";
const labelCls = "block text-sm font-medium text-[#1A3D2B] mb-1.5";

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ step, total }: { step: number; total: number }) {
  const steps = ["Identity", "Settings", "Plan", "Done"];
  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((label, i) => {
        const s = i + 1;
        const done = s < step;
        const active = s === step;
        return (
          <div key={s} className="flex items-center gap-2 flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                style={{
                  backgroundColor: done ? "#52B788" : active ? "#C9A84C" : "#E9E4D9",
                  color: done || active ? "#1A3D2B" : "#aaa",
                }}
              >
                {done ? "✓" : s}
              </div>
              <span className="text-[10px] text-gray-400 hidden sm:block">{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div
                className="flex-1 h-px transition-all"
                style={{ backgroundColor: done ? "#52B788" : "#E9E4D9" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Wizard ───────────────────────────────────────────────────────────────────

export default function CreateLeaguePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>(empty);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [createdSlug, setCreatedSlug] = useState("");

  function set<K extends keyof WizardData>(k: K, v: WizardData[K]) {
    setData((d) => ({ ...d, [k]: v }));
  }

  function toggleFeature(id: string) {
    set("features", data.features.includes(id)
      ? data.features.filter((f) => f !== id)
      : [...data.features, id]);
  }

  async function createLeague(plan: string) {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/leagues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, plan }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Failed to create league.");
      }
      const { slug } = await res.json();
      setCreatedSlug(slug);
      setStep(4);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePlanSelect(planId: string) {
    set("plan", planId);
    if (planId === "starter") {
      await createLeague("starter");
    } else {
      // Pro/Club → Stripe checkout
      setSubmitting(true);
      try {
        const res = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: planId, leagueData: data }),
        });
        const { url } = await res.json();
        if (url) window.location.href = url;
      } catch {
        setError("Could not start checkout. Please try again.");
      } finally {
        setSubmitting(false);
      }
    }
  }

  // ── Step 1: Identity ────────────────────────────────────────────────────────
  const step1 = (
    <div className="flex flex-col gap-5">
      <div>
        <label className={labelCls}>League Name <span style={{ color: "#C9A84C" }}>*</span></label>
        <input
          type="text"
          required
          value={data.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="Saturday Scramble League"
          className={inputCls}
        />
      </div>

      <div>
        <label className={labelCls}>Tagline <span className="text-gray-400 font-normal">(optional)</span></label>
        <input
          type="text"
          value={data.tagline}
          onChange={(e) => set("tagline", e.target.value)}
          placeholder="Where birdies are made and excuses are born"
          className={inputCls}
        />
      </div>

      <div>
        <label className={labelCls}>Template</label>
        <div className="grid grid-cols-2 gap-3">
          {templates.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => set("template", t.id)}
              className="relative rounded-xl border-2 p-4 text-left transition-all"
              style={{
                borderColor: data.template === t.id ? t.secondary : "#E9E4D9",
                backgroundColor: t.bg,
              }}
            >
              {data.template === t.id && (
                <span
                  className="absolute top-2 right-2 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center"
                  style={{ backgroundColor: t.secondary, color: t.primary }}
                >✓</span>
              )}
              <div className="flex gap-2 mb-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: t.primary }} />
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: t.secondary }} />
              </div>
              <p className="font-semibold text-sm" style={{ color: t.text }}>{t.name}</p>
              <p className="text-xs mt-0.5 text-gray-500">{t.vibe}</p>
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        disabled={!data.name.trim()}
        onClick={() => setStep(2)}
        className="w-full py-3.5 rounded-full font-semibold text-sm mt-2 transition-all hover:scale-[1.01] disabled:opacity-40"
        style={{ backgroundColor: "#C9A84C", color: "#1A3D2B" }}
      >
        Continue →
      </button>
    </div>
  );

  // ── Step 2: Settings ────────────────────────────────────────────────────────
  const step2 = (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={labelCls}>Number of Players</label>
          <div className="relative">
            <select
              value={data.playerCount}
              onChange={(e) => set("playerCount", e.target.value)}
              className={inputCls + " appearance-none cursor-pointer"}
            >
              <option value="up-to-16">Up to 16</option>
              <option value="up-to-32">Up to 32</option>
              <option value="unlimited">Unlimited</option>
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#2D6A4F] text-xs">▼</span>
          </div>
        </div>
        <div>
          <label className={labelCls}>Scoring Format</label>
          <div className="relative">
            <select
              value={data.scoringFormat}
              onChange={(e) => set("scoringFormat", e.target.value)}
              className={inputCls + " appearance-none cursor-pointer"}
            >
              <option>Stroke Play</option>
              <option>Stableford</option>
              <option>Match Play</option>
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#2D6A4F] text-xs">▼</span>
          </div>
        </div>
      </div>

      <div>
        <label className={labelCls}>Holes per Round</label>
        <div className="flex gap-3">
          {[9, 18].map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => set("holes", h)}
              className="flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-all"
              style={{
                borderColor: data.holes === h ? "#2D6A4F" : "#E9E4D9",
                backgroundColor: data.holes === h ? "#E9F5EE" : "white",
                color: data.holes === h ? "#1A3D2B" : "#888",
              }}
            >
              {h} Holes
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={labelCls}>Features</label>
        <p className="text-xs text-gray-400 mb-3">Starter plan includes Skins only. Upgrade to unlock everything.</p>
        <div className="grid grid-cols-2 gap-2">
          {ALL_FEATURES.map((f) => {
            const locked = f.starterLocked;
            const checked = data.features.includes(f.id);
            return (
              <button
                key={f.id}
                type="button"
                disabled={locked}
                onClick={() => !locked && toggleFeature(f.id)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-sm text-left transition-all"
                style={{
                  backgroundColor: locked ? "#F5F5F5" : checked ? "#E9F5EE" : "white",
                  borderColor: locked ? "#E9E4D9" : checked ? "#2D6A4F" : "#E9E4D9",
                  color: locked ? "#bbb" : "#1A3D2B",
                  cursor: locked ? "not-allowed" : "pointer",
                }}
              >
                <span
                  className="flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center text-[10px] font-bold"
                  style={{
                    backgroundColor: locked ? "#eee" : checked ? "#2D6A4F" : "white",
                    borderColor: locked ? "#ddd" : checked ? "#2D6A4F" : "#ccc",
                    color: "white",
                  }}
                >
                  {locked ? "🔒" : checked ? "✓" : ""}
                </span>
                {f.label}
                {locked && <span className="ml-auto text-[10px] text-gray-300">Pro+</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3 mt-2">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="px-6 py-3.5 rounded-full text-sm font-semibold border transition-all"
          style={{ borderColor: "#2D6A4F", color: "#2D6A4F" }}
        >← Back</button>
        <button
          type="button"
          onClick={() => setStep(3)}
          className="flex-1 py-3.5 rounded-full text-sm font-semibold transition-all hover:scale-[1.01]"
          style={{ backgroundColor: "#C9A84C", color: "#1A3D2B" }}
        >Continue →</button>
      </div>
    </div>
  );

  // ── Step 3: Plan Selection ───────────────────────────────────────────────────
  const step3 = (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-gray-500">Choose a plan to activate your league. You can upgrade anytime.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className="rounded-2xl p-6 flex flex-col gap-4 border-2 relative"
            style={{
              borderColor: plan.featured ? "#C9A84C" : "#E9E4D9",
              backgroundColor: plan.featured ? "#1A3D2B" : "white",
            }}
          >
            {plan.featured && (
              <div
                className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide"
                style={{ backgroundColor: "#C9A84C", color: "#1A3D2B" }}
              >Most Popular</div>
            )}
            <div>
              <p className="font-display font-bold text-lg" style={{ color: plan.featured ? "#C9A84C" : "#1A3D2B" }}>
                {plan.name}
              </p>
              <div className="flex items-baseline gap-0.5 mt-1">
                <span className="text-lg font-light" style={{ color: plan.featured ? "white" : "#1A3D2B" }}>$</span>
                <span className="text-3xl font-bold font-display" style={{ color: plan.featured ? "white" : "#1A3D2B" }}>
                  {plan.price.replace("$", "")}
                </span>
                <span className="text-xs ml-1" style={{ color: plan.featured ? "rgba(255,255,255,0.5)" : "#aaa" }}>
                  {plan.period}
                </span>
              </div>
            </div>
            <ul className="flex flex-col gap-2 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-xs" style={{ color: plan.featured ? "rgba(255,255,255,0.8)" : "#555" }}>
                  <span style={{ color: plan.featured ? "#52B788" : "#2D6A4F" }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <button
              type="button"
              disabled={submitting}
              onClick={() => handlePlanSelect(plan.id)}
              className="w-full py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-[1.01] disabled:opacity-60"
              style={
                plan.featured
                  ? { backgroundColor: "#C9A84C", color: "#1A3D2B" }
                  : { border: "1.5px solid #2D6A4F", color: "#2D6A4F" }
              }
            >
              {submitting && data.plan === plan.id ? "Creating…" : plan.cta}
            </button>
          </div>
        ))}
      </div>

      {error && <p className="text-red-600 text-sm text-center">{error}</p>}

      <button
        type="button"
        onClick={() => setStep(2)}
        className="text-sm text-gray-400 hover:text-gray-600 transition-colors text-center"
      >
        ← Back
      </button>
    </div>
  );

  // ── Step 4: Confirmation ────────────────────────────────────────────────────
  const step4 = (
    <div className="flex flex-col items-center text-center gap-6 py-6">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
        style={{ backgroundColor: "#52B788" }}
      >⛳</div>
      <div>
        <h3 className="font-display text-2xl font-bold mb-2" style={{ color: "#1A3D2B" }}>
          Your league is live!
        </h3>
        <p className="text-gray-500 text-sm">
          Share this link with your players:
        </p>
        <div
          className="mt-3 px-5 py-3 rounded-xl font-mono text-sm inline-block"
          style={{ backgroundColor: "#F8F5EE", color: "#1A3D2B" }}
        >
          ohmgolfness.com/l/{createdSlug}
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
        <Link
          href={`/leagues/${createdSlug}`}
          className="flex-1 py-3 rounded-full text-sm font-semibold text-center transition-all hover:scale-[1.01]"
          style={{ backgroundColor: "#C9A84C", color: "#1A3D2B" }}
        >
          Go to League Dashboard →
        </Link>
        <Link
          href="/dashboard"
          className="flex-1 py-3 rounded-full text-sm font-semibold text-center border transition-all"
          style={{ borderColor: "#2D6A4F", color: "#2D6A4F" }}
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#F8F5EE] py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/dashboard" className="flex items-baseline gap-0.5">
            <span className="font-display font-black text-xl" style={{ color: "#C9A84C" }}>OHM</span>
            <span className="font-display font-bold text-xl" style={{ color: "#1A3D2B" }}>Golfness</span>
          </Link>
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            Cancel
          </Link>
        </div>

        <div className="bg-white rounded-3xl px-8 py-10 shadow-sm border border-gray-100">
          {step < 4 && (
            <>
              <ProgressBar step={step} total={4} />
              <h1 className="font-display text-2xl font-bold mb-6" style={{ color: "#1A3D2B" }}>
                {step === 1 && "Name your league"}
                {step === 2 && "Configure settings"}
                {step === 3 && "Choose your plan"}
              </h1>
            </>
          )}

          {step === 1 && step1}
          {step === 2 && step2}
          {step === 3 && step3}
          {step === 4 && step4}
        </div>
      </div>
    </main>
  );
}
