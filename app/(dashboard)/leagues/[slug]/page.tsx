import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTemplate } from "@/lib/templates";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function LeagueDashboardPage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();
  if (!session) redirect("/login");

  const league = await prisma.league.findUnique({
    where: { slug },
    include: {
      players: { orderBy: { name: "asc" } },
      rounds: {
        orderBy: { playedAt: "desc" },
        take: 5,
        include: { scores: true },
      },
    },
  });

  if (!league || league.ownerId !== session.user.id) notFound();

  const tmpl = getTemplate(league.template);

  const totalRounds = await prisma.round.count({ where: { leagueId: league.id } });

  return (
    <main className="min-h-screen bg-[#F8F5EE]">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600">
            ← Dashboard
          </Link>
          <span className="text-gray-200">/</span>
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: tmpl.primary }}
          >
            {league.name.slice(0, 2).toUpperCase()}
          </div>
          <h1 className="font-semibold text-[#1A3D2B]">{league.name}</h1>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 capitalize">
            {league.tier}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`/l/${league.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#2D6A4F] font-medium hover:underline"
          >
            View public page ↗
          </a>
          <Link
            href="/api/auth/signout"
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            Sign out
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Players", value: league.players.length, icon: "👥" },
            { label: "Rounds", value: totalRounds, icon: "📋" },
            { label: "Holes", value: league.holes, icon: "⛳" },
            { label: "Format", value: league.scoringFormat ?? "—", icon: "🏌️" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-5 border border-gray-100">
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-[#1A3D2B]">{stat.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Players panel */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
              <h2 className="font-semibold text-[#1A3D2B]">Players</h2>
              <Link
                href={`/leagues/${league.slug}/players`}
                className="text-sm font-medium px-4 py-1.5 rounded-full text-white"
                style={{ backgroundColor: tmpl.primary }}
              >
                Manage players
              </Link>
            </div>

            {league.players.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-gray-400 mb-4 text-sm">No players yet.</p>
                <Link
                  href={`/leagues/${league.slug}/players`}
                  className="text-sm font-medium underline"
                  style={{ color: tmpl.primary }}
                >
                  Add your first player
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {league.players.map((player) => (
                  <li key={player.id} className="flex items-center justify-between px-6 py-3">
                    <div>
                      <p className="text-sm font-medium text-[#1A3D2B]">{player.name}</p>
                      {player.email && (
                        <p className="text-xs text-gray-400">{player.email}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">
                      HCP {Number(player.handicap).toFixed(1)}
                    </span>
                  </li>
                ))}
                {league.players.length > 10 && (
                  <li className="px-6 py-3 text-center">
                    <Link
                      href={`/leagues/${league.slug}/players`}
                      className="text-sm text-gray-400 hover:text-[#2D6A4F]"
                    >
                      View all {league.players.length} players →
                    </Link>
                  </li>
                )}
              </ul>
            )}
          </div>

          {/* Quick actions + recent rounds */}
          <div className="flex flex-col gap-4">
            {/* Quick actions */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="font-semibold text-[#1A3D2B] mb-4">Quick actions</h2>
              <div className="flex flex-col gap-2">
                <Link
                  href={`/leagues/${league.slug}/rounds/new`}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: tmpl.primary }}
                >
                  <span>+</span>
                  Log a round
                </Link>
                <Link
                  href={`/leagues/${league.slug}/players`}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium border border-gray-200 text-[#1A3D2B] hover:bg-gray-50 transition-colors"
                >
                  <span>👥</span>
                  Manage players
                </Link>
                <Link
                  href={`/leagues/${league.slug}/rounds`}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium border border-gray-200 text-[#1A3D2B] hover:bg-gray-50 transition-colors"
                >
                  <span>📋</span>
                  All rounds
                </Link>
              </div>
            </div>

            {/* Recent rounds */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50">
                <h2 className="font-semibold text-[#1A3D2B]">Recent rounds</h2>
              </div>
              {league.rounds.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <p className="text-xs text-gray-400">No rounds yet.</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {league.rounds.map((round) => (
                    <li key={round.id} className="px-5 py-3">
                      <Link href={`/leagues/${league.slug}/rounds`} className="block group">
                        <p className="text-sm font-medium text-[#1A3D2B] group-hover:text-[#2D6A4F]">
                          {round.courseName}
                        </p>
                        <div className="flex items-center justify-between mt-0.5">
                          <p className="text-xs text-gray-400">
                            {new Date(round.playedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                          <p className="text-xs text-gray-400">{round.scores.length} scores</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              {totalRounds > 5 && (
                <div className="px-5 py-3 border-t border-gray-50 text-center">
                  <Link
                    href={`/leagues/${league.slug}/rounds`}
                    className="text-xs text-gray-400 hover:text-[#2D6A4F]"
                  >
                    View all {totalRounds} rounds →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* League info */}
        {league.tagline && (
          <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-[#1A3D2B] mb-2">About this league</h2>
            <p className="text-sm text-gray-500">{league.tagline}</p>
            <div className="flex flex-wrap gap-4 mt-4 text-xs text-gray-400">
              {league.playerCount && <span>~{league.playerCount} players</span>}
              {league.scoringFormat && <span className="capitalize">{league.scoringFormat}</span>}
              <span>{league.holes}-hole rounds</span>
              {league.features.length > 0 && (
                <span>{league.features.join(" · ")}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
