import { prisma } from "@/lib/prisma";
import { getTemplate } from "@/lib/templates";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const league = await prisma.league.findUnique({ where: { slug } });
  if (!league) return { title: "League not found" };
  return {
    title: league.name,
    description: league.tagline ?? `${league.name} — powered by OHMGolfness`,
  };
}

export default async function PublicLeaguePage({ params }: Props) {
  const { slug } = await params;

  const league = await prisma.league.findUnique({
    where: { slug },
    include: {
      players: { orderBy: { name: "asc" } },
      rounds: {
        orderBy: { playedAt: "desc" },
        take: 10,
        include: {
          scores: {
            include: { player: { select: { id: true, name: true, handicap: true } } },
          },
        },
      },
    },
  });

  if (!league) notFound();

  const tmpl = getTemplate(league.template);

  // Build standings: total strokes per player across all rounds
  const totals: Record<string, { name: string; strokes: number; rounds: number }> = {};
  for (const round of league.rounds) {
    const playerRoundStrokes: Record<string, number> = {};
    for (const score of round.scores) {
      playerRoundStrokes[score.playerId] = (playerRoundStrokes[score.playerId] ?? 0) + score.strokes;
      if (!totals[score.playerId]) {
        totals[score.playerId] = { name: score.player.name, strokes: 0, rounds: 0 };
      }
    }
    for (const [pid, strokes] of Object.entries(playerRoundStrokes)) {
      totals[pid].strokes += strokes;
      totals[pid].rounds += 1;
    }
  }

  const standings = Object.entries(totals)
    .map(([id, t]) => ({ id, ...t, avg: t.rounds > 0 ? t.strokes / t.rounds : 0 }))
    .sort((a, b) => a.avg - b.avg);

  return (
    <main className="min-h-screen" style={{ backgroundColor: tmpl.bg, color: tmpl.text }}>
      {/* Header */}
      <header
        className="px-6 py-8 text-white"
        style={{ backgroundColor: tmpl.primary }}
      >
        <div className="max-w-4xl mx-auto">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm mb-4"
            style={{ backgroundColor: tmpl.secondary, color: tmpl.primary }}
          >
            {league.name.slice(0, 2).toUpperCase()}
          </div>
          <h1 className="font-display text-3xl font-bold mb-2">{league.name}</h1>
          {league.tagline && (
            <p className="text-sm opacity-75 max-w-md">{league.tagline}</p>
          )}
          <div className="flex flex-wrap gap-4 mt-4 text-xs opacity-60">
            <span>{league.players.length} players</span>
            <span>{league.rounds.length} rounds</span>
            {league.scoringFormat && <span className="capitalize">{league.scoringFormat}</span>}
            <span>{league.holes}-hole</span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Standings */}
          <div className="lg:col-span-2">
            <h2 className="font-display text-xl font-bold mb-4" style={{ color: tmpl.text }}>
              Standings
            </h2>
            {standings.length === 0 ? (
              <div
                className="rounded-2xl p-10 text-center border"
                style={{ borderColor: `${tmpl.primary}20`, backgroundColor: "white" }}
              >
                <p className="text-sm opacity-50">No scores recorded yet.</p>
              </div>
            ) : (
              <div className="rounded-2xl overflow-hidden border" style={{ borderColor: `${tmpl.primary}15` }}>
                <table className="w-full bg-white">
                  <thead>
                    <tr style={{ backgroundColor: `${tmpl.primary}08` }}>
                      <th className="px-4 py-3 text-left text-xs font-semibold opacity-50 w-8">#</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold opacity-50">Player</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold opacity-50">Rounds</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold opacity-50">Avg</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: `${tmpl.primary}10` }}>
                    {standings.map((p, i) => (
                      <tr key={p.id}>
                        <td className="px-4 py-3 text-sm font-bold opacity-30">{i + 1}</td>
                        <td className="px-4 py-3 text-sm font-medium" style={{ color: tmpl.text }}>
                          {p.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-right opacity-50">{p.rounds}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold" style={{ color: tmpl.primary }}>
                          {p.avg.toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent rounds */}
          <div>
            <h2 className="font-display text-xl font-bold mb-4" style={{ color: tmpl.text }}>
              Recent rounds
            </h2>
            {league.rounds.length === 0 ? (
              <p className="text-sm opacity-40">No rounds yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {league.rounds.map((round) => {
                  const uniquePlayers = new Set(round.scores.map((s) => s.playerId)).size;
                  return (
                    <div
                      key={round.id}
                      className="bg-white rounded-xl p-4 border"
                      style={{ borderColor: `${tmpl.primary}15` }}
                    >
                      <p className="text-sm font-medium" style={{ color: tmpl.text }}>
                        {round.courseName}
                      </p>
                      <p className="text-xs opacity-40 mt-0.5">
                        {new Date(round.playedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                        {uniquePlayers > 0 && ` · ${uniquePlayers} players`}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

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
