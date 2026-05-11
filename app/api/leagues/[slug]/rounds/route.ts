import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getLeague(slug: string, userId: string) {
  const league = await prisma.league.findUnique({ where: { slug } });
  if (!league || league.ownerId !== userId) return null;
  return league;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const league = await getLeague(slug, session.user.id);
  if (!league) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const rounds = await prisma.round.findMany({
    where: { leagueId: league.id },
    orderBy: { playedAt: "desc" },
    include: {
      scores: {
        include: { player: { select: { name: true } } },
      },
    },
  });

  const formatted = rounds.map((r) => ({
    id: r.id,
    courseName: r.courseName,
    playedAt: r.playedAt,
    holes: r.holes,
    scores: r.scores.map((s) => ({
      playerId: s.playerId,
      playerName: s.player.name,
      hole: s.hole,
      strokes: s.strokes,
      isKp: s.isKp,
      isSkin: s.isSkin,
      isBirdie: s.isBirdie,
    })),
  }));

  return NextResponse.json({
    leagueName: league.name,
    leagueHoles: league.holes,
    rounds: formatted,
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const league = await getLeague(slug, session.user.id);
  if (!league) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { courseName, playedAt, holes } = body;

  if (!courseName?.trim()) {
    return NextResponse.json({ error: "Course name is required." }, { status: 400 });
  }

  const round = await prisma.round.create({
    data: {
      leagueId: league.id,
      courseName: courseName.trim(),
      playedAt: new Date(playedAt),
      holes: holes ?? league.holes,
    },
  });

  return NextResponse.json(round, { status: 201 });
}
