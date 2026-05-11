"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Team {
  id: string;
  name: string;
  captainName: string | null;
}

interface ScoreEntry {
  hole: number;
  strokes: number;
  isKp: boolean;
}

interface TournamentInfo {
  name: string;
  holes: number;
  kpHoles: number[];
  teamSize: number;
  format: string;
}

export default function TournamentScoringPage() {
  const { slug } = useParams<{ slug: string }>();
  const [info, setInfo] = useState<TournamentInfo | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  // Team form
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [teamForm, setTeamForm] = useState({ name: "", captainName: "" });
  const [savingTeam, setSavingTeam] = useState(false);

  // Score entry
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [savingScores, setSavingScores] = useState(false);
  const [scoresSaved, setScoresSaved] = useState(false);

  const fetchData = useCallback(async () => {
    const res = await fetch(`/api/tournaments/${slug}/teams`);
    if (res.ok) {
      const data = await res.json();
      setInfo(data.tournament);
      setTeams(data.teams);
    }
    setLoading(false);
  }, [slug]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function initScores(team: Team) {
    const holes = info?.holes ?? 18;
    setScores(
      Array.from({ length: holes }, (_, i) => ({
        hole: i + 1,
        strokes: 0,
        isKp: false,
      }))
    );
    setSelectedTeam(team);
    setScoresSaved(false);
  }

  async function addTeam(e: React.FormEvent) {
    e.preventDefault();
    if (!teamForm.name.trim()) return;
    setSavingTeam(true);
    const res = await fetch(`/api/tournaments/${slug}/teams`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: teamForm.name.trim(),
        captainName: teamForm.captainName.trim() || null,
      }),
    });
    if (res.ok) {
      setTeamForm({ name: "", captainName: "" });
      setShowTeamForm(false);
      fetchData();
    }
    setSavingTeam(false);
  }

  async function saveScores() {
    if (!selectedTeam) return;
    const valid = scores.filter((s) => s.strokes > 0);
    if (valid.length === 0) return;
    setSavingScores(true);
    const res = await fetch(`/api/tournaments/${slug}/scores`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId: selectedTeam.id, scores: valid }),
    });
    if (res.ok) {
      setScoresSaved(true);
      setSelectedTeam(null);
      fetchData();
    }
    setSavingScores(false);
  }

  const holes = info?.holes ?? 18;

  return (
    <main className="min-h-screen bg-[#F8F5EE]">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/tournaments/${slug}`} className="text-sm text-gray-400 hover:text-gray-600">
            ← {info?.name ?? "Tournament"}
          </Link>
          <span className="text-gray-200">/</span>
          <h1 className="font-semibold text-[#1A3D2B]">Live Scoring</h1>
        </div>
        <button
          onClick={() => setShowTeamForm(true)}
          className="px-4 py-2 rounded-full text-sm font-semibold text-white bg-[#1A3D2B] hover:bg-[#2D6A4F] transition-colors"
        >
          + Add team
        </button>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {scoresSaved && (
          <div className="mb-6 px-5 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-medium">
            ✓ Scores saved successfully.
          </div>
        )}

        {/* Add team form */}
        {showTeamForm && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <h2 className="font-semibold text-[#1A3D2B] mb-4">Add team</h2>
            <form onSubmit={addTeam} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Team name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={teamForm.name}
                  onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2D6A4F]"
                  placeholder="Team Eagle"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Captain</label>
                <input
                  type="text"
                  value={teamForm.captainName}
                  onChange={(e) => setTeamForm({ ...teamForm, captainName: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2D6A4F]"
                  placeholder="John Smith"
                />
              </div>
              <div className="sm:col-span-2 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowTeamForm(false)}
                  className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingTeam}
                  className="px-5 py-2 rounded-full text-sm font-semibold text-white bg-[#1A3D2B] disabled:opacity-50"
                >
                  {savingTeam ? "Adding…" : "Add team"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Score entry */}
        {selectedTeam && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-[#1A3D2B]">
                Entering scores: {selectedTeam.name}
              </h2>
              <button
                onClick={() => setSelectedTeam(null)}
                className="text-sm text-gray-400 hover:text-gray-600"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
              {scores.map((score, i) => {
                const isKpHole = info?.kpHoles.includes(score.hole);
                return (
                  <div key={score.hole} className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-center" style={{ color: isKpHole ? "#C9A84C" : "#9CA3AF" }}>
                      {isKpHole ? "★" : ""} H{score.hole}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={score.strokes || ""}
                      onChange={(e) => {
                        const updated = [...scores];
                        updated[i] = { ...updated[i], strokes: parseInt(e.target.value) || 0 };
                        setScores(updated);
                      }}
                      className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm text-center focus:outline-none focus:border-[#2D6A4F]"
                      placeholder="—"
                    />
                    {isKpHole && (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...scores];
                          updated[i] = { ...updated[i], isKp: !updated[i].isKp };
                          setScores(updated);
                        }}
                        className={`text-xs py-1 rounded-lg border transition-colors ${
                          score.isKp
                            ? "bg-[#C9A84C] border-[#C9A84C] text-white"
                            : "border-gray-200 text-gray-400 hover:border-[#C9A84C]"
                        }`}
                      >
                        KP
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedTeam(null)}
                className="px-4 py-2 text-sm text-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={saveScores}
                disabled={savingScores}
                className="px-6 py-2.5 rounded-full text-sm font-semibold text-white bg-[#1A3D2B] disabled:opacity-50"
              >
                {savingScores ? "Saving…" : "Save scores"}
              </button>
            </div>
          </div>
        )}

        {/* Teams list */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-[#1A3D2B]">
              {loading ? "…" : `${teams.length} team${teams.length !== 1 ? "s" : ""}`}
            </h2>
          </div>

          {loading ? (
            <div className="px-6 py-12 text-center text-gray-400 text-sm">Loading…</div>
          ) : teams.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-gray-400 mb-3">No teams yet.</p>
              <button
                onClick={() => setShowTeamForm(true)}
                className="text-sm font-medium text-[#2D6A4F] underline"
              >
                Add your first team
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {teams.map((team) => (
                <li key={team.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-[#1A3D2B]">{team.name}</p>
                    {team.captainName && (
                      <p className="text-xs text-gray-400">Cap: {team.captainName}</p>
                    )}
                  </div>
                  <button
                    onClick={() => initScores(team)}
                    className="px-4 py-1.5 rounded-full text-xs font-semibold text-white bg-[#1A3D2B] hover:bg-[#2D6A4F] transition-colors"
                  >
                    Enter scores
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Scores update the public leaderboard in real time.{" "}
          <a href={`/t/${slug}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">
            View public page ↗
          </a>
        </p>
      </div>
    </main>
  );
}
