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

  const players = await prisma.player.findMany({
    where: { leagueId: league.id },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ leagueName: league.name, players });
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
  const { name, email, handicap, yearJoined } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Player name is required." }, { status: 400 });
  }

  const player = await prisma.player.create({
    data: {
      leagueId: league.id,
      name: name.trim(),
      email: email ?? null,
      handicap: handicap ?? 0,
      yearJoined: yearJoined ?? null,
    },
  });

  return NextResponse.json(player, { status: 201 });
}
