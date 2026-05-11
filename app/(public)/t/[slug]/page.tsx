import { prisma } from "@/lib/prisma";
import { getTemplate } from "@/lib/templates";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const t = await prisma.tournament.findUnique({ where: { slug } });
  if (!t) return { title: "Tournament not found" };
  return {
    title: t.name,
    description: t.tagline ?? `${t.name} — powered by OHMGolfness`,
  };
}

export default async function PublicTournamentPage({ params }: Props) {
  const { slug } = await params;

  const tournament = await prisma.tournament.findUnique({
    where: { slug },
    include: {
      teams: {
        include: { scores: true },
        orderBy: { name: "asc" },
      },
    },
  });

  if (!tournament) notFound();

  const tmpl = getTemplate(tournament.template);

  // Build leaderboard
  const leaderboard = tournament.teams
    .map((team) => ({
      id: team.id,
      name: team.name,
      captainName: team.captainName,
      strokes: team.scores.reduce((sum, s) => sum + s.strokes, 0),
      holesPlayed: new Set(team.scores.map((s) => s.hole)).size,
      kpCount: team.scores.filter((s) => s.isKp).length,
    }))
    .filter((t) => t.holesPlayed > 0)
    .sort((a, b) => a.strokes - b.strokes);

  const statusLabel: Record<string, string> = {
    draft: "Coming soon",
    active: "Live",
    completed: "Final results",
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: tmpl.bg, color: tmpl.text }}>
      {/* Header */}
      <header className="px-6 py-8 text-white" style={{ backgroundColor: tmpl.primary }}>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div
              className="px-3 py-1 rounded-full text-xs font-semibold"
              style={{ backgroundColor: tmpl.secondary, color: tmpl.primary }}
            >
              {statusLabel[tournament.status] ?? tournament.status}
            </div>
            {tournament.playedAt && (
              <p className="text-sm opacity-60">
                {new Date(tournament.playedAt).toLocaleDateString("en-US", {
                  month: "long", day: "numeric", year: "numeric",
                })}
              </p>
            )}
          </div>
          <h1 className="font-display text-3xl font-bold mb-2">{tournament.name}</h1>
          {tournament.tagline && (
            <p className="text-sm opacity-70">{tournament.tagline}</p>
          )}
          <div className="flex flex-wrap gap-4 mt-4 text-xs opacity-50">
            <span className="capitalize">{tournament.format.replace("_", " ")}</span>
            <span>{tournament.teamSize}-player teams</span>
            <span>{tournament.holes} holes</span>
            {tournament.teams.length > 0 && <span>{tournament.teams.length} teams</span>}
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Prizes */}
        {(tournament.payout1st || tournament.payout2nd || tournament.payout3rd || tournament.charityName) && (
          <div
            className="rounded-2xl p-6 mb-8 border"
            style={{ backgroundColor: "white", borderColor: `${tmpl.primary}15` }}
          >
            <h2 className="font-display text-lg font-bold mb-4" style={{ color: tmpl.text }}>
              Prizes
            </h2>
            <div className="flex flex-wrap gap-6">
              {tournament.payout1st && (
                <div className="text-center">
                  <div className="text-2xl mb-1">🥇</div>
                  <p className="text-lg font-bold" style={{ color: tmpl.primary }}>
                    ${Number(tournament.payout1st).toFixed(0)}
                  </p>
                  <p className="text-xs opacity-50">1st place</p>
                </div>
              )}
              {tournament.payout2nd && (
                <div className="text-center">
                  <div className="text-2xl mb-1">🥈</div>
                  <p className="text-lg font-bold" style={{ color: tmpl.primary }}>
                    ${Number(tournament.payout2nd).toFixed(0)}
                  </p>
                  <p className="text-xs opacity-50">2nd place</p>
                </div>
              )}
              {tournament.payout3rd && (
                <div className="text-center">
                  <div className="text-2xl mb-1">🥉</div>
                  <p className="text-lg font-bold" style={{ color: tmpl.primary }}>
                    ${Number(tournament.payout3rd).toFixed(0)}
                  </p>
                  <p className="text-xs opacity-50">3rd place</p>
                </div>
              )}
              {tournament.charityName && (
                <div className="text-center">
                  <div className="text-2xl mb-1">❤️</div>
                  <p className="text-sm font-semibold" style={{ color: tmpl.primary }}>
                    {tournament.charityName}
                  </p>
                  {tournament.charityAmount && (
                    <p className="text-xs opacity-50">
                      Goal: ${Number(tournament.charityAmount).toFixed(0)}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <h2 className="font-display text-xl font-bold mb-4" style={{ color: tmpl.text }}>
          Leaderboard
        </h2>

        {leaderboard.length === 0 ? (
          <div
            className="rounded-2xl p-10 text-center border"
            style={{ borderColor: `${tmpl.primary}15`, backgroundColor: "white" }}
          >
            <p className="text-sm opacity-40">
              {tournament.status === "draft"
                ? "Scoring hasn't started yet."
                : "No scores posted yet."}
            </p>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden border" style={{ borderColor: `${tmpl.primary}15` }}>
            <table className="w-full bg-white">
              <thead>
                <tr style={{ backgroundColor: `${tmpl.primary}08` }}>
                  <th className="px-5 py-3 text-left text-xs font-semibold opacity-40 w-8">#</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold opacity-40">Team</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold opacity-40">Thru</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold opacity-40">Score</th>
                  {tournament.kpHoles.length > 0 && (
                    <th className="px-5 py-3 text-right text-xs font-semibold opacity-40">KP</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: `${tmpl.primary}10` }}>
                {leaderboard.map((team, i) => (
                  <tr key={team.id} className={i === 0 ? "font-semibold" : ""}>
                    <td className="px-5 py-4 text-sm font-bold opacity-30">{i + 1}</td>
                    <td className="px-5 py-4">
                      <p className="text-sm" style={{ color: tmpl.text }}>{team.name}</p>
                      {team.captainName && (
                        <p className="text-xs opacity-40">Cap: {team.captainName}</p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm text-right opacity-40">
                      {team.holesPlayed === tournament.holes ? "F" : team.holesPlayed}
                    </td>
                    <td className="px-5 py-4 text-sm font-bold text-right" style={{ color: tmpl.primary }}>
                      {team.strokes}
                    </td>
                    {tournament.kpHoles.length > 0 && (
                      <td className="px-5 py-4 text-sm text-right opacity-50">
                        {team.kpCount > 0 ? `★ ${team.kpCount}` : "—"}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 pt-8 border-t text-center" style={{ borderColor: `${tmpl.primary}15` }}>
          <p className="text-xs opacity-30">
            Powered by{" "}
            <a href="/" className="underline hover:opacity-60">OHMGolfness</a>
          </p>
        </div>
      </div>
    </main>
  );
}
