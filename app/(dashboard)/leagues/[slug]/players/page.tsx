"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Player {
  id: string;
  name: string;
  email: string | null;
  handicap: string;
  yearJoined: number | null;
}

export default function PlayersPage() {
  const { slug } = useParams<{ slug: string }>();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [leagueName, setLeagueName] = useState("");

  // Add player form state
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", handicap: "0", yearJoined: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchPlayers = useCallback(async () => {
    const res = await fetch(`/api/leagues/${slug}/players`);
    if (res.ok) {
      const data = await res.json();
      setPlayers(data.players);
      setLeagueName(data.leagueName);
    }
    setLoading(false);
  }, [slug]);

  useEffect(() => { fetchPlayers(); }, [fetchPlayers]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    setError("");
    const res = await fetch(`/api/leagues/${slug}/players`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name.trim(),
        email: form.email.trim() || null,
        handicap: parseFloat(form.handicap) || 0,
        yearJoined: form.yearJoined ? parseInt(form.yearJoined) : null,
      }),
    });
    if (res.ok) {
      setForm({ name: "", email: "", handicap: "0", yearJoined: "" });
      setShowForm(false);
      fetchPlayers();
    } else {
      const data = await res.json();
      setError(data.error ?? "Failed to add player.");
    }
    setSaving(false);
  }

  async function handleDelete(playerId: string, playerName: string) {
    if (!confirm(`Remove ${playerName} from this league?`)) return;
    await fetch(`/api/leagues/${slug}/players/${playerId}`, { method: "DELETE" });
    fetchPlayers();
  }

  return (
    <main className="min-h-screen bg-[#F8F5EE]">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/leagues/${slug}`} className="text-sm text-gray-400 hover:text-gray-600">
            ← {leagueName || "League"}
          </Link>
          <span className="text-gray-200">/</span>
          <h1 className="font-semibold text-[#1A3D2B]">Players</h1>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 rounded-full text-sm font-semibold text-white bg-[#1A3D2B] hover:bg-[#2D6A4F] transition-colors"
        >
          + Add player
        </button>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Add player form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <h2 className="font-semibold text-[#1A3D2B] mb-5">Add player</h2>
            <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Full name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2D6A4F]"
                  placeholder="John Smith"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2D6A4F]"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Handicap</label>
                <input
                  type="number"
                  step="0.1"
                  min="-10"
                  max="54"
                  value={form.handicap}
                  onChange={(e) => setForm({ ...form, handicap: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2D6A4F]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Year joined</label>
                <input
                  type="number"
                  min="1990"
                  max={new Date().getFullYear()}
                  value={form.yearJoined}
                  onChange={(e) => setForm({ ...form, yearJoined: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2D6A4F]"
                  placeholder={String(new Date().getFullYear())}
                />
              </div>
              {error && (
                <p className="sm:col-span-2 text-sm text-red-500">{error}</p>
              )}
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
                  {saving ? "Adding…" : "Add player"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Players list */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-semibold text-[#1A3D2B]">
              {loading ? "…" : `${players.length} player${players.length !== 1 ? "s" : ""}`}
            </h2>
          </div>

          {loading ? (
            <div className="px-6 py-12 text-center text-gray-400 text-sm">Loading…</div>
          ) : players.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-400 text-sm mb-4">No players yet.</p>
              <button
                onClick={() => setShowForm(true)}
                className="text-sm font-medium text-[#2D6A4F] underline"
              >
                Add your first player
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {players.map((player) => (
                <li key={player.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-[#1A3D2B]">{player.name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      {player.email && (
                        <span className="text-xs text-gray-400">{player.email}</span>
                      )}
                      {player.yearJoined && (
                        <span className="text-xs text-gray-300">Since {player.yearJoined}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-500">
                      HCP {Number(player.handicap).toFixed(1)}
                    </span>
                    <button
                      onClick={() => handleDelete(player.id, player.name)}
                      className="text-xs text-gray-300 hover:text-red-400 transition-colors"
                      aria-label="Remove player"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
