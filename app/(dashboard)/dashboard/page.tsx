import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getTemplate } from "@/lib/templates";
import type { League, Tournament } from "@/app/generated/prisma/client";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const [leagues, tournaments] = await Promise.all([
    prisma.league.findMany({
      where: { ownerId: session.user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.tournament.findMany({
      where: { ownerId: session.user.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const tierBadge: Record<string, string> = {
    starter: "bg-gray-100 text-gray-600",
    pro: "bg-amber-100 text-amber-700",
    club: "bg-green-100 text-green-700",
  };

  return (
    <main className="min-h-screen bg-[#F8F5EE]">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-baseline gap-0.5">
          <span className="font-display font-black text-xl" style={{ color: "#C9A84C" }}>OHM</span>
          <span className="font-display font-bold text-xl" style={{ color: "#1A3D2B" }}>Golfness</span>
        </Link>
        <div className="flex items-center gap-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${tierBadge[session.user.tier] ?? tierBadge.starter}`}
          >
            {session.user.tier}
          </span>
          <span className="text-sm text-gray-500">{session.user.name}</span>
          <Link
            href="/api/auth/signout"
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Sign out
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Welcome */}
        <div className="mb-10">
          <h1 className="font-display text-3xl font-bold" style={{ color: "#1A3D2B" }}>
            Welcome back, {session.user.name.split(" ")[0]}
          </h1>
          <p className="text-gray-500 mt-1">Manage your leagues and tournaments.</p>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          <Link
            href="/leagues/create"
            className="flex items-center gap-4 p-6 rounded-2xl border-2 border-dashed border-[#2D6A4F]/30 hover:border-[#2D6A4F] hover:bg-white transition-all group"
          >
            <span className="w-10 h-10 rounded-full flex items-center justify-center text-xl" style={{ backgroundColor: "#E9F5EE" }}>⛳</span>
            <div>
              <p className="font-semibold text-[#1A3D2B] group-hover:text-[#2D6A4F]">New League</p>
              <p className="text-sm text-gray-400">Set up scoring, players & more</p>
            </div>
          </Link>
          <Link
            href="/tournaments/create"
            className="flex items-center gap-4 p-6 rounded-2xl border-2 border-dashed border-[#C9A84C]/40 hover:border-[#C9A84C] hover:bg-white transition-all group"
          >
            <span className="w-10 h-10 rounded-full flex items-center justify-center text-xl" style={{ backgroundColor: "#FDF6E3" }}>🏆</span>
            <div>
              <p className="font-semibold text-[#1A3D2B] group-hover:text-[#C9A84C]">New Tournament</p>
              <p className="text-sm text-gray-400">One-day event with live scoring</p>
            </div>
          </Link>
        </div>

        {/* Leagues */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold" style={{ color: "#1A3D2B" }}>Your Leagues</h2>
            <Link href="/leagues/create" className="text-sm font-medium" style={{ color: "#2D6A4F" }}>+ Add league</Link>
          </div>

          {leagues.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
              <p className="text-gray-400 mb-4">No leagues yet.</p>
              <Link
                href="/leagues/create"
                className="px-6 py-2.5 rounded-full text-sm font-semibold inline-block"
                style={{ backgroundColor: "#C9A84C", color: "#1A3D2B" }}
              >
                Create your first league
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {leagues.map((league: League) => {
                const tmpl = getTemplate(league.template);
                return (
                  <Link
                    key={league.id}
                    href={`/leagues/${league.slug}`}
                    className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-all"
                  >
                    <div
                      className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: tmpl.primary }}
                    >
                      {league.name.slice(0, 2).toUpperCase()}
                    </div>
                    <h3 className="font-semibold text-[#1A3D2B] mb-1">{league.name}</h3>
                    <p className="text-xs text-gray-400 capitalize">{league.tier} plan</p>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Tournaments */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold" style={{ color: "#1A3D2B" }}>Your Tournaments</h2>
            <Link href="/tournaments/create" className="text-sm font-medium" style={{ color: "#2D6A4F" }}>+ Add tournament</Link>
          </div>

          {tournaments.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
              <p className="text-gray-400 mb-4">No tournaments yet.</p>
              <Link
                href="/tournaments/create"
                className="px-6 py-2.5 rounded-full text-sm font-semibold inline-block"
                style={{ backgroundColor: "#C9A84C", color: "#1A3D2B" }}
              >
                Build your first tournament
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tournaments.map((t: Tournament) => {
                const statusColor: Record<string, string> = {
                  draft: "text-gray-400",
                  active: "text-green-600",
                  completed: "text-blue-500",
                };
                return (
                  <Link
                    key={t.id}
                    href={`/tournaments/${t.slug}`}
                    className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl">🏌️</span>
                      <span className={`text-xs font-semibold capitalize ${statusColor[t.status]}`}>
                        {t.status}
                      </span>
                    </div>
                    <h3 className="font-semibold text-[#1A3D2B] mb-1">{t.name}</h3>
                    <p className="text-xs text-gray-400 capitalize">{t.format.replace("_", " ")}</p>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
