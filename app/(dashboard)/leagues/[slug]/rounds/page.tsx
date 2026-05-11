"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Score {
  playerId: string;
  playerName: string;
  hole: number;
  strokes: number;
  isKp: boolean;
  isSkin: boolean;
  isBirdie: boolean;
}

interface Round {
  id: string;
  courseName: string;
  playedAt: string;
  holes: number;
  scores: Score[];
}

export default function RoundsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [rounds, setRounds] = useState<Round[]>([]);
  const [loading, setLoading] = useState(true);
  const [leagueName, setLeagueName] = useState("");
  const [leagueHoles, setLeagueHoles] = useState(18);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ courseName: "", playedAt: new Date().toISOString().split("T")[0] });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchRounds = useCallback(async () => {
    const res = await fetch(`/api/leagues/${slug}/rounds`);
    if (res.ok) {
      const data = await res.json();
      setRounds(data.rounds);
      setLeagueName(data.leagueName);
      setLeagueHoles(data.leagueHoles);
    }
    setLoading(false);
  }, [slug]);

  useEffect(() => { fetchRounds(); }, [fetchRounds]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.courseName.trim()) return;
    setSaving(true);
    setError("");
    const res = await fetch(`/api/leagues/${slug}/rounds`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseName: form.courseName.trim(),
        playedAt: form.playedAt,
        holes: leagueHoles,
      }),
    });
    if (res.ok) {
      setForm({ courseName: "", playedAt: new Date().toISOString().split("T")[0] });
      setShowForm(false);
      fetchRounds();
    } else {
      const data = await res.json();
      setError(data.error ?? "Failed to create round.");
    }
    setSaving(false);
  }

  async function handleDelete(roundId: string, courseName: string) {
    if (!confirm(`Delete round at ${courseName}? This will also delete all scores.`)) return;
    await fetch(`/api/leagues/${slug}/rounds/${roundId}`, { method: "DELETE" });
    fetchRounds();
  }

  return (
    <main className="min-h-screen bg-[#F8F5EE]">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/leagues/${slug}`} className="text-sm text-gray-400 hover:text-gray-600">
            ← {leagueName || "League"}
          </Link>
          <span className="text-gray-200">/</span>
          <h1 className="font-semibold text-[#1A3D2B]">Rounds</h1>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 rounded-full text-sm font-semibold text-white bg-[#1A3D2B] hover:bg-[#2D6A4F] transition-colors"
        >
          + Log round
        </button>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <h2 className="font-semibold text-[#1A3D2B] mb-5">Log a round</h2>
            <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Course name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.courseName}
                  onChange={(e) => setForm({ ...form, courseName: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2D6A4F]"
                  placeholder="Pebble Beach Golf Links"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Date played</label>
                <input
                  type="date"
                  value={form.playedAt}
                  onChange={(e) => setForm({ ...form, playedAt: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2D6A4F]"
                  required
                />
              </div>
              <div className="flex items-end">
                <p className="text-xs text-gray-400 pb-3">{leagueHoles} holes (from league settings)</p>
              </div>
              {error && <p className="sm:col-span-2 text-sm text-red-500">{error}</p>}
              <div className="sm:col-span-2 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setError(""); }}
                  className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-full text-sm font-semibold text-white bg-[#1A3D2B] hover:bg-[#2D6A4F] disabled:opacity-50 transition-colors"
                >
                  {saving ? "Saving…" : "Save round"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-[#1A3D2B]">
              {loading ? "…" : `${rounds.length} round${rounds.length !== 1 ? "s" : ""}`}
            </h2>
          </div>

          {loading ? (
            <div className="px-6 py-12 text-center text-gray-400 text-sm">Loading…</div>
          ) : rounds.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-400 text-sm mb-4">No rounds logged yet.</p>
              <button
                onClick={() => setShowForm(true)}
                className="text-sm font-medium text-[#2D6A4F] underline"
              >
                Log your first round
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {rounds.map((round) => {
                const uniquePlayers = new Set(round.scores.map((s) => s.playerId)).size;
                return (
                  <li key={round.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-[#1A3D2B]">{round.courseName}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs text-gray-400">
                            {new Date(round.playedAt).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          <span className="text-xs text-gray-300">·</span>
                          <span className="text-xs text-gray-400">{round.holes} holes</span>
                          {uniquePlayers > 0 && (
                            <>
                              <span className="text-xs text-gray-300">·</span>
                              <span className="text-xs text-gray-400">{uniquePlayers} player{uniquePlayers !== 1 ? "s" : ""}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(round.id, round.courseName)}
                        className="text-xs text-gray-300 hover:text-red-400 transition-colors ml-4"
                        aria-label="Delete round"
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
