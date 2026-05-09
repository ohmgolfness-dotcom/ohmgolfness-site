"use client";

import { useState } from "react";

const FEATURES = [
  "Handicap Tracking",
  "Payouts & Earnings",
  "Skins",
  "KPs",
  "Birdies",
  "Tournaments",
  "Player Profiles",
  "Custom Bonuses",
];

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  leagueName: string;
  playerCount: string;
  course: string;
  frequency: string;
  scoringFormat: string;
  features: string[];
  migration: string;
  notes: string;
}

const empty: FormData = {
  fullName: "",
  email: "",
  phone: "",
  leagueName: "",
  playerCount: "",
  course: "",
  frequency: "",
  scoringFormat: "",
  features: [],
  migration: "",
  notes: "",
};

const inputCls =
  "w-full px-4 py-3 rounded-xl border border-[#2D6A4F]/30 bg-[#F8F5EE] text-[#1A3D2B] placeholder-[#1A3D2B]/40 focus:outline-none focus:border-[#2D6A4F] focus:ring-1 focus:ring-[#2D6A4F] transition-all text-sm font-sans";

const labelCls = "block text-sm font-medium text-[#1A3D2B] mb-1.5";

const selectCls =
  "w-full px-4 py-3 rounded-xl border border-[#2D6A4F]/30 bg-[#F8F5EE] text-[#1A3D2B] focus:outline-none focus:border-[#2D6A4F] focus:ring-1 focus:ring-[#2D6A4F] transition-all text-sm font-sans appearance-none cursor-pointer";

interface Props {
  onSuccess?: () => void;
}

export default function IntakeForm({ onSuccess }: Props) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(empty);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  function set(field: keyof FormData, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function toggleFeature(feat: string) {
    setForm((f) => ({
      ...f,
      features: f.features.includes(feat)
        ? f.features.filter((x) => x !== feat)
        : [...f.features, feat],
    }));
  }

  function step1Valid() {
    return form.fullName.trim() && form.email.trim() && form.course.trim();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Submission failed");
      setDone(true);
      onSuccess?.();
    } catch {
      setError("Something went wrong. Please try again or email us directly.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center gap-6">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
          style={{ backgroundColor: "#52B788" }}
        >
          ✓
        </div>
        <div>
          <h3
            className="font-display text-2xl font-bold mb-2"
            style={{ color: "#1A3D2B" }}
          >
            You&apos;re on the list!
          </h3>
          <p className="text-gray-600 max-w-sm mx-auto">
            We received your request and will be in touch within 24 hours.
            Check your inbox for a confirmation email.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Progress indicator */}
      <div className="flex items-center gap-3 mb-8">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all"
              style={{
                backgroundColor: step >= s ? "#C9A84C" : "#E9E4D9",
                color: step >= s ? "#1A3D2B" : "#999",
              }}
            >
              {s}
            </div>
            {s < 2 && (
              <div
                className="h-px w-12 transition-all"
                style={{ backgroundColor: step > s ? "#C9A84C" : "#E9E4D9" }}
              />
            )}
          </div>
        ))}
        <span className="text-sm text-gray-500 ml-2">
          Step {step} of 2 —{" "}
          {step === 1 ? "About your league" : "Preferences & features"}
        </span>
      </div>

      {/* ── Step 1 ── */}
      {step === 1 && (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>
                Full Name <span style={{ color: "#C9A84C" }}>*</span>
              </label>
              <input
                type="text"
                required
                value={form.fullName}
                onChange={(e) => set("fullName", e.target.value)}
                placeholder="John Smith"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>
                Email Address <span style={{ color: "#C9A84C" }}>*</span>
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="john@example.com"
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>Phone Number</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="(555) 000-0000"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>League Name</label>
              <input
                type="text"
                value={form.leagueName}
                onChange={(e) => set("leagueName", e.target.value)}
                placeholder="Don't have one yet? No problem!"
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>Number of Players</label>
              <div className="relative">
                <select
                  value={form.playerCount}
                  onChange={(e) => set("playerCount", e.target.value)}
                  className={selectCls}
                >
                  <option value="">Select range…</option>
                  <option>Under 10</option>
                  <option>10–16</option>
                  <option>17–32</option>
                  <option>32+</option>
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#2D6A4F] text-xs">▼</span>
              </div>
            </div>
            <div>
              <label className={labelCls}>
                Where do you play? <span style={{ color: "#C9A84C" }}>*</span>
              </label>
              <input
                type="text"
                required
                value={form.course}
                onChange={(e) => set("course", e.target.value)}
                placeholder="Augusta National, Augusta GA"
                className={inputCls}
              />
            </div>
          </div>

          <button
            type="button"
            disabled={!step1Valid()}
            onClick={() => setStep(2)}
            className="w-full py-3.5 rounded-full font-semibold text-sm transition-all duration-200 hover:scale-[1.01] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 mt-2"
            style={{ backgroundColor: "#C9A84C", color: "#1A3D2B" }}
          >
            Continue →
          </button>
        </div>
      )}

      {/* ── Step 2 ── */}
      {step === 2 && (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>How often do you play?</label>
              <div className="relative">
                <select
                  value={form.frequency}
                  onChange={(e) => set("frequency", e.target.value)}
                  className={selectCls}
                >
                  <option value="">Select…</option>
                  <option>Weekly</option>
                  <option>Biweekly</option>
                  <option>Monthly</option>
                  <option>Other</option>
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#2D6A4F] text-xs">▼</span>
              </div>
            </div>
            <div>
              <label className={labelCls}>Scoring Format</label>
              <div className="relative">
                <select
                  value={form.scoringFormat}
                  onChange={(e) => set("scoringFormat", e.target.value)}
                  className={selectCls}
                >
                  <option value="">Select…</option>
                  <option>Stroke Play</option>
                  <option>Match Play</option>
                  <option>Stableford</option>
                  <option>Mixed</option>
                  <option>Not sure yet</option>
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#2D6A4F] text-xs">▼</span>
              </div>
            </div>
          </div>

          <div>
            <label className={labelCls}>Features you want</label>
            <div className="grid grid-cols-2 gap-2">
              {FEATURES.map((feat) => {
                const checked = form.features.includes(feat);
                return (
                  <label
                    key={feat}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all border text-sm"
                    style={{
                      backgroundColor: checked ? "#E9F5EE" : "#F8F5EE",
                      borderColor: checked ? "#2D6A4F" : "#E9E4D9",
                      color: "#1A3D2B",
                    }}
                  >
                    <span
                      className="flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center text-[10px] font-bold transition-all"
                      style={{
                        backgroundColor: checked ? "#2D6A4F" : "white",
                        borderColor: checked ? "#2D6A4F" : "#ccc",
                        color: "white",
                      }}
                    >
                      {checked && "✓"}
                    </span>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={checked}
                      onChange={() => toggleFeature(feat)}
                    />
                    {feat}
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className={labelCls}>Starting fresh or migrating?</label>
            <div className="flex gap-4">
              {["Starting fresh", "Migrating from another system"].map((opt) => (
                <label
                  key={opt}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl cursor-pointer border flex-1 text-sm transition-all"
                  style={{
                    backgroundColor:
                      form.migration === opt ? "#E9F5EE" : "#F8F5EE",
                    borderColor:
                      form.migration === opt ? "#2D6A4F" : "#E9E4D9",
                    color: "#1A3D2B",
                  }}
                >
                  <span
                    className="flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all"
                    style={{
                      borderColor:
                        form.migration === opt ? "#2D6A4F" : "#ccc",
                    }}
                  >
                    {form.migration === opt && (
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: "#2D6A4F" }}
                      />
                    )}
                  </span>
                  <input
                    type="radio"
                    className="sr-only"
                    name="migration"
                    value={opt}
                    checked={form.migration === opt}
                    onChange={() => set("migration", opt)}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className={labelCls}>Anything else?</label>
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Tell us anything that would help us get you set up…"
              rows={3}
              className={inputCls + " resize-none"}
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm text-center">{error}</p>
          )}

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-6 py-3.5 rounded-full font-semibold text-sm border transition-all duration-200 hover:bg-gray-50"
              style={{ borderColor: "#2D6A4F", color: "#2D6A4F" }}
            >
              ← Back
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3.5 rounded-full font-semibold text-sm transition-all duration-200 hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#C9A84C", color: "#1A3D2B" }}
            >
              {submitting ? "Sending…" : "Submit Request"}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
