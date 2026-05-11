"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const TEMPLATES = [
  { id: "classic-green", name: "Classic Green", primary: "#1A3D2B", secondary: "#C9A84C" },
  { id: "dark-mode", name: "Dark Mode", primary: "#0D0D0D", secondary: "#52B788" },
  { id: "desert-sand", name: "Desert Sand", primary: "#8B6914", secondary: "#E8D5A0" },
  { id: "ocean-blue", name: "Ocean Blue", primary: "#1A3D5C", secondary: "#52B8C4" },
];

const FORMATS = [
  { id: "scramble", label: "Scramble", desc: "Team picks best shot each hole" },
  { id: "shamble", label: "Shamble", desc: "Best drive, then play individual" },
  { id: "best_ball", label: "Best Ball", desc: "Lowest score on team counts" },
  { id: "stroke", label: "Stroke Play", desc: "Individual total strokes" },
  { id: "stableford", label: "Stableford", desc: "Points based on score vs par" },
];

interface FormData {
  // Step 1 — Details
  name: string;
  tagline: string;
  template: string;
  // Step 2 — Format
  format: string;
  teamSize: number;
  holes: number;
  handicapEnabled: boolean;
  playedAt: string;
  // Step 3 — Extras
  entryFee: string;
  payout1st: string;
  payout2nd: string;
  payout3rd: string;
  charityName: string;
  charityAmount: string;
  kpHoles: string;
  hasLongestDrive: boolean;
  hasMulligans: boolean;
  // Step 4 — Plan (handled in UI, not submitted)
}

const EMPTY: FormData = {
  name: "", tagline: "", template: "classic-green",
  format: "scramble", teamSize: 4, holes: 18, handicapEnabled: false,
  playedAt: new Date().toISOString().split("T")[0],
  entryFee: "", payout1st: "", payout2nd: "", payout3rd: "",
  charityName: "", charityAmount: "", kpHoles: "", hasLongestDrive: false, hasMulligans: false,
};

export default function CreateTournamentPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [createdSlug, setCreatedSlug] = useState("");

  const set = (patch: Partial<FormData>) => setForm((f) => ({ ...f, ...patch }));

  async function createTournament() {
    setSaving(true);
    setError("");

    const kpArray = form.kpHoles
      .split(",")
      .map((s) => parseInt(s.trim()))
      .filter((n) => !isNaN(n) && n > 0);

    const res = await fetch("/api/tournaments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name.trim(),
        tagline: form.tagline.trim() || null,
        template: form.template,
        format: form.format,
        teamSize: form.teamSize,
        holes: form.holes,
        handicapEnabled: form.handicapEnabled,
        playedAt: form.playedAt || null,
        entryFee: form.entryFee ? parseFloat(form.entryFee) : null,
        payout1st: form.payout1st ? parseFloat(form.payout1st) : null,
        payout2nd: form.payout2nd ? parseFloat(form.payout2nd) : null,
        payout3rd: form.payout3rd ? parseFloat(form.payout3rd) : null,
        charityName: form.charityName.trim() || null,
        charityAmount: form.charityAmount ? parseFloat(form.charityAmount) : null,
        kpHoles: kpArray,
        hasLongestDrive: form.hasLongestDrive,
        hasMulligans: form.hasMulligans,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      setSaving(false);
      return;
    }
    setCreatedSlug(data.slug);
    setStep(5);
    setSaving(false);
  }

  const tmpl = TEMPLATES.find((t) => t.id === form.template) ?? TEMPLATES[0];

  return (
    <main className="min-h-screen bg-[#F8F5EE]">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3">
        <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600">← Dashboard</Link>
        <span className="text-gray-200">/</span>
        <h1 className="font-semibold text-[#1A3D2B]">New Tournament</h1>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Step indicator */}
        {step < 5 && (
          <div className="flex items-center gap-2 mb-8">
            {["Details", "Format", "Extras", "Launch"].map((label, i) => {
              const n = i + 1;
              const active = step === n;
              const done = step > n;
              return (
                <div key={label} className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    done ? "bg-[#2D6A4F] text-white" : active ? "bg-[#C9A84C] text-[#1A3D2B]" : "bg-gray-100 text-gray-400"
                  }`}>
                    {done ? "✓" : n}
                  </div>
                  <span className={`text-sm ${active ? "font-semibold text-[#1A3D2B]" : "text-gray-400"}`}>{label}</span>
                  {i < 3 && <span className="text-gray-200 mx-1">—</span>}
                </div>
              );
            })}
          </div>
        )}

        {/* Step 1 — Details */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8">
            <h2 className="font-display text-2xl font-bold text-[#1A3D2B] mb-1">Tournament details</h2>
            <p className="text-sm text-gray-400 mb-6">Name your event and choose a theme.</p>

            <div className="flex flex-col gap-5">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Tournament name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => set({ name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2D6A4F]"
                  placeholder="Founders Cup 2026"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Tagline</label>
                <input
                  type="text"
                  value={form.tagline}
                  onChange={(e) => set({ tagline: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2D6A4F]"
                  placeholder="The championship that started it all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-3">Theme</label>
                <div className="grid grid-cols-2 gap-3">
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => set({ template: t.id })}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                        form.template === t.id ? "border-[#C9A84C] bg-amber-50" : "border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex-shrink-0"
                        style={{ background: `linear-gradient(135deg, ${t.primary}, ${t.secondary})` }}
                      />
                      <span className="text-sm font-medium text-[#1A3D2B]">{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => { if (!form.name.trim()) return; setStep(2); }}
                disabled={!form.name.trim()}
                className="px-6 py-3 rounded-full text-sm font-semibold text-[#1A3D2B] disabled:opacity-40 transition-opacity"
                style={{ backgroundColor: "#C9A84C" }}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — Format */}
        {step === 2 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8">
            <h2 className="font-display text-2xl font-bold text-[#1A3D2B] mb-1">Format & structure</h2>
            <p className="text-sm text-gray-400 mb-6">How will the tournament be played?</p>

            <div className="flex flex-col gap-6">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-3">Format</label>
                <div className="flex flex-col gap-2">
                  {FORMATS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => set({ format: f.id })}
                      className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                        form.format === f.id ? "border-[#2D6A4F] bg-[#F0FAF4]" : "border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0 ${
                        form.format === f.id ? "border-[#2D6A4F] bg-[#2D6A4F]" : "border-gray-300"
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-[#1A3D2B]">{f.label}</p>
                        <p className="text-xs text-gray-400">{f.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Team size</label>
                  <select
                    value={form.teamSize}
                    onChange={(e) => set({ teamSize: parseInt(e.target.value) })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2D6A4F]"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>{n} player{n !== 1 ? "s" : ""}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Holes</label>
                  <div className="flex rounded-xl border border-gray-200 overflow-hidden">
                    {[9, 18].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => set({ holes: n })}
                        className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                          form.holes === n ? "bg-[#1A3D2B] text-white" : "text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                <input
                  type="date"
                  value={form.playedAt}
                  onChange={(e) => set({ playedAt: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2D6A4F]"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    form.handicapEnabled ? "bg-[#2D6A4F] border-[#2D6A4F]" : "border-gray-300"
                  }`}
                  onClick={() => set({ handicapEnabled: !form.handicapEnabled })}
                >
                  {form.handicapEnabled && <span className="text-white text-xs">✓</span>}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1A3D2B]">Enable handicaps</p>
                  <p className="text-xs text-gray-400">Apply handicap adjustments to scores</p>
                </div>
              </label>
            </div>

            <div className="mt-8 flex justify-between">
              <button onClick={() => setStep(1)} className="px-5 py-2.5 text-sm text-gray-500 hover:text-gray-700">
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-6 py-3 rounded-full text-sm font-semibold text-[#1A3D2B]"
                style={{ backgroundColor: "#C9A84C" }}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Extras */}
        {step === 3 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8">
            <h2 className="font-display text-2xl font-bold text-[#1A3D2B] mb-1">Prizes & extras</h2>
            <p className="text-sm text-gray-400 mb-6">All optional — add what applies to your event.</p>

            <div className="flex flex-col gap-6">
              {/* Entry fee + payouts */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Entry & payouts</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: "entryFee", label: "Entry fee ($)" },
                    { key: "payout1st", label: "1st place ($)" },
                    { key: "payout2nd", label: "2nd place ($)" },
                    { key: "payout3rd", label: "3rd place ($)" },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form[key as keyof FormData] as string}
                        onChange={(e) => set({ [key]: e.target.value } as Partial<FormData>)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2D6A4F]"
                        placeholder="0"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Charity */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Charity</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Charity name</label>
                    <input
                      type="text"
                      value={form.charityName}
                      onChange={(e) => set({ charityName: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2D6A4F]"
                      placeholder="Local food bank"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Goal ($)</label>
                    <input
                      type="number"
                      min="0"
                      value={form.charityAmount}
                      onChange={(e) => set({ charityAmount: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2D6A4F]"
                      placeholder="500"
                    />
                  </div>
                </div>
              </div>

              {/* Special holes */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Special holes</p>
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      KP holes (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={form.kpHoles}
                      onChange={(e) => set({ kpHoles: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2D6A4F]"
                      placeholder="3, 7, 12"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    {[
                      { key: "hasLongestDrive", label: "Longest drive contest" },
                      { key: "hasMulligans", label: "Mulligans available" },
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-3 cursor-pointer">
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            form[key as keyof FormData] ? "bg-[#2D6A4F] border-[#2D6A4F]" : "border-gray-300"
                          }`}
                          onClick={() => set({ [key]: !form[key as keyof FormData] } as Partial<FormData>)}
                        >
                          {form[key as keyof FormData] && <span className="text-white text-xs">✓</span>}
                        </div>
                        <span className="text-sm text-[#1A3D2B]">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button onClick={() => setStep(2)} className="px-5 py-2.5 text-sm text-gray-500 hover:text-gray-700">
                ← Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="px-6 py-3 rounded-full text-sm font-semibold text-[#1A3D2B]"
                style={{ backgroundColor: "#C9A84C" }}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 4 — Launch */}
        {step === 4 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8">
            <h2 className="font-display text-2xl font-bold text-[#1A3D2B] mb-1">Ready to launch</h2>
            <p className="text-sm text-gray-400 mb-6">Review your tournament and create it.</p>

            <div className="rounded-xl border border-gray-100 overflow-hidden mb-6">
              <div
                className="px-5 py-4 text-white"
                style={{ backgroundColor: tmpl.primary }}
              >
                <p className="font-semibold">{form.name}</p>
                {form.tagline && <p className="text-xs opacity-70 mt-0.5">{form.tagline}</p>}
              </div>
              <div className="px-5 py-4 grid grid-cols-2 gap-y-3 text-sm">
                <div>
                  <p className="text-xs text-gray-400">Format</p>
                  <p className="font-medium text-[#1A3D2B] capitalize">{form.format.replace("_", " ")}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Team size</p>
                  <p className="font-medium text-[#1A3D2B]">{form.teamSize} players</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Holes</p>
                  <p className="font-medium text-[#1A3D2B]">{form.holes}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Handicaps</p>
                  <p className="font-medium text-[#1A3D2B]">{form.handicapEnabled ? "Enabled" : "Disabled"}</p>
                </div>
                {form.entryFee && (
                  <div>
                    <p className="text-xs text-gray-400">Entry fee</p>
                    <p className="font-medium text-[#1A3D2B]">${form.entryFee}</p>
                  </div>
                )}
                {form.playedAt && (
                  <div>
                    <p className="text-xs text-gray-400">Date</p>
                    <p className="font-medium text-[#1A3D2B]">
                      {new Date(form.playedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

            <div className="flex justify-between">
              <button onClick={() => setStep(3)} className="px-5 py-2.5 text-sm text-gray-500 hover:text-gray-700">
                ← Back
              </button>
              <button
                onClick={createTournament}
                disabled={saving}
                className="px-6 py-3 rounded-full text-sm font-semibold text-white disabled:opacity-50 transition-opacity"
                style={{ backgroundColor: "#1A3D2B" }}
              >
                {saving ? "Creating…" : "Create tournament →"}
              </button>
            </div>
          </div>
        )}

        {/* Step 5 — Confirmation */}
        {step === 5 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-5"
              style={{ backgroundColor: "#E9F5EE" }}
            >
              🏆
            </div>
            <h2 className="font-display text-2xl font-bold text-[#1A3D2B] mb-2">
              Tournament created!
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              {form.name} is live. Share the link or start managing it now.
            </p>

            <div
              className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-500 mb-8 max-w-xs mx-auto"
            >
              <span className="flex-1 truncate">ohmgolfness.com/t/{createdSlug}</span>
              <button
                onClick={() => navigator.clipboard.writeText(`https://ohmgolfness.com/t/${createdSlug}`)}
                className="text-xs text-[#2D6A4F] font-medium hover:underline flex-shrink-0"
              >
                Copy
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={`/tournaments/${createdSlug}`}
                className="px-6 py-3 rounded-full text-sm font-semibold text-white"
                style={{ backgroundColor: "#1A3D2B" }}
              >
                Go to tournament →
              </Link>
              <Link
                href="/dashboard"
                className="px-6 py-3 rounded-full text-sm font-semibold text-[#1A3D2B] border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Back to dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
