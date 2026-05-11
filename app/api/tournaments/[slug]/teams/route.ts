import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getTournament(slug: string, userId: string) {
  const t = await prisma.tournament.findUnique({ where: { slug } });
  if (!t || t.ownerId !== userId) return null;
  return t;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tournament = await getTournament(slug, session.user.id);
  if (!tournament) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const teams = await prisma.tournamentTeam.findMany({
    where: { tournamentId: tournament.id },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({
    tournament: {
      name: tournament.name,
      holes: tournament.holes,
      kpHoles: tournament.kpHoles,
      teamSize: tournament.teamSize,
      format: tournament.format,
    },
    teams,
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tournament = await getTournament(slug, session.user.id);
  if (!tournament) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { name, captainName } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Team name is required." }, { status: 400 });
  }

  const team = await prisma.tournamentTeam.create({
    data: {
      tournamentId: tournament.id,
      name: name.trim(),
      captainName: captainName ?? null,
    },
  });

  return NextResponse.json(team, { status: 201 });
}
