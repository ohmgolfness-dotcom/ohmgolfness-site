import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tournament = await prisma.tournament.findUnique({ where: { slug } });
  if (!tournament || tournament.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const { teamId, scores } = body;

  if (!teamId || !Array.isArray(scores) || scores.length === 0) {
    return NextResponse.json({ error: "teamId and scores are required." }, { status: 400 });
  }

  // Verify team belongs to this tournament
  const team = await prisma.tournamentTeam.findFirst({
    where: { id: teamId, tournamentId: tournament.id },
  });
  if (!team) return NextResponse.json({ error: "Team not found." }, { status: 404 });

  // Upsert: delete existing scores for these holes, then insert
  const holes = scores.map((s: { hole: number }) => s.hole);
  await prisma.tournamentScore.deleteMany({
    where: { teamId, tournamentId: tournament.id, hole: { in: holes } },
  });

  await prisma.tournamentScore.createMany({
    data: scores.map((s: { hole: number; strokes: number; isKp?: boolean }) => ({
      tournamentId: tournament.id,
      teamId,
      hole: s.hole,
      strokes: s.strokes,
      isKp: s.isKp ?? false,
    })),
  });

  return NextResponse.json({ ok: true });
}
