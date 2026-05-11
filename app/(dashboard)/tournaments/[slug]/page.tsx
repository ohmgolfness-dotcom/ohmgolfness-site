import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTemplate } from "@/lib/templates";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function TournamentAdminPage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();
  if (!session) redirect("/login");

  const tournament = await prisma.tournament.findUnique({
    where: { slug },
    include: {
      teams: {
        orderBy: { name: "asc" },
        include: { scores: true },
      },
    },
  });

  if (!tournament || tournament.ownerId !== session.user.id) notFound();

  const tmpl = getTemplate(tournament.template);

  const statusColor: Record<string, string> = {
    draft: "bg-gray-100 text-gray-500",
    active: "bg-green-100 text-green-700",
    completed: "bg-blue-100 text-blue-600",
  };

  // Leaderboard: total strokes per team
  const leaderboard = tournament.teams
    .map((team) => ({
      id: team.id,
      name: team.name,
      captainName: team.captainName,
      strokes: team.scores.reduce((sum, s) => sum + s.strokes, 0),
      holesPlayed: new Set(team.scores.map((s) => s.hole)).size,
    }))
    .sort((a, b) => a.strokes - b.strokes);

  return (
    <main className="min-h-screen bg-[#F8F5EE]">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600">
            ← Dashboard
          </Link>
          <span className="text-gray-200">/</span>
          <h1 className="font-semibold text-[#1A3D2B]">{tournament.name}</h1>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColor[tournament.status]}`}>
            {tournament.status}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`/t/${tournament.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#2D6A4F] font-medium hover:underline"
          >
            Public page ↗
          </a>
          <Link
            href={`/tournaments/${tournament.slug}/scoring`}
            className="px-4 py-2 rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: tmpl.primary }}
          >
            Live scoring →
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Teams", value: tournament.teams.length, icon: "👥" },
            { label: "Format", value: tournament.format.replace("_", " "), icon: "🏌️" },
            { label: "Holes", value: tournament.holes, icon: "⛳" },
            { label: "Team size", value: `${tournament.teamSize}p`, icon: "🤝" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100">
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-[#1A3D2B] capitalize">{stat.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Leaderboard */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
              <h2 className="font-semibold text-[#1A3D2B]">Leaderboard</h2>
              <Link
                href={`/tournaments/${tournament.slug}/scoring`}
                className="text-sm font-medium px-4 py-1.5 rounded-full text-white"
                style={{ backgroundColor: tmpl.primary }}
              >
                Enter scores
              </Link>
            </div>

            {leaderboard.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-sm text-gray-400 mb-3">No teams yet.</p>
                <Link
                  href={`/tournaments/${tournament.slug}/scoring`}
                  className="text-sm font-medium underline"
                  style={{ color: tmpl.primary }}
                >
                  Add teams and start scoring
                </Link>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 w-8">#</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400">Team</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-400">Holes</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-400">Strokes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {leaderboard.map((team, i) => (
                    <tr key={team.id}>
                      <td className="px-6 py-3 text-sm font-bold text-gray-300">{i + 1}</td>
                      <td className="px-6 py-3">
                        <p className="text-sm font-medium text-[#1A3D2B]">{team.name}</p>
                        {team.captainName && (
                          <p className="text-xs text-gray-400">Cap: {team.captainName}</p>
                        )}
                      </td>
                      <td className="px-6 py-3 text-sm text-right text-gray-400">{team.holesPlayed}</td>
                      <td className="px-6 py-3 text-sm font-semibold text-right" style={{ color: tmpl.primary }}>
                        {team.strokes || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Info panel */}
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="font-semibold text-[#1A3D2B] mb-4">Tournament info</h2>
              <div className="flex flex-col gap-3 text-sm">
                {tournament.playedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Date</span>
                    <span className="font-medium text-[#1A3D2B]">
                      {new Date(tournament.playedAt).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                    </span>
                  </div>
                )}
                {tournament.entryFee !== null && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Entry fee</span>
                    <span className="font-medium text-[#1A3D2B]">${Number(tournament.entryFee).toFixed(2)}</span>
                  </div>
                )}
                {tournament.payout1st !== null && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">1st place</span>
                    <span className="font-medium text-[#1A3D2B]">${Number(tournament.payout1st).toFixed(2)}</span>
                  </div>
                )}
                {tournament.payout2nd !== null && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">2nd place</span>
                    <span className="font-medium text-[#1A3D2B]">${Number(tournament.payout2nd).toFixed(2)}</span>
                  </div>
                )}
                {tournament.payout3rd !== null && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">3rd place</span>
                    <span className="font-medium text-[#1A3D2B]">${Number(tournament.payout3rd).toFixed(2)}</span>
                  </div>
                )}
                {tournament.charityName && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Charity</span>
                    <span className="font-medium text-[#1A3D2B] text-right max-w-[150px]">{tournament.charityName}</span>
                  </div>
                )}
                {tournament.kpHoles.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">KP holes</span>
                    <span className="font-medium text-[#1A3D2B]">{tournament.kpHoles.join(", ")}</span>
                  </div>
                )}
                {tournament.hasLongestDrive && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Longest drive</span>
                    <span className="font-medium text-green-600">✓</span>
                  </div>
                )}
                {tournament.hasMulligans && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Mulligans</span>
                    <span className="font-medium text-green-600">✓</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="font-semibold text-[#1A3D2B] mb-3">Quick actions</h2>
              <div className="flex flex-col gap-2">
                <Link
                  href={`/tournaments/${tournament.slug}/scoring`}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white"
                  style={{ backgroundColor: tmpl.primary }}
                >
                  <span>📊</span> Live scoring
                </Link>
                <a
                  href={`/t/${tournament.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium border border-gray-200 text-[#1A3D2B] hover:bg-gray-50 transition-colors"
                >
                  <span>🌐</span> Public leaderboard
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
