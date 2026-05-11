import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string; playerId: string }> }
) {
  const { slug, playerId } = await params;
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const league = await prisma.league.findUnique({ where: { slug } });
  if (!league || league.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.player.deleteMany({
    where: { id: playerId, leagueId: league.id },
  });

  return NextResponse.json({ ok: true });
}
