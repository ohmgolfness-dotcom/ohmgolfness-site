import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base;
  let n = 0;
  while (await prisma.tournament.findUnique({ where: { slug } })) {
    n++;
    slug = `${base}-${n}`;
  }
  return slug;
}

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tournaments = await prisma.tournament.findMany({
    where: { ownerId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(tournaments);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    name, tagline, template, format, teamSize, holes,
    handicapEnabled, playedAt, entryFee, payout1st, payout2nd, payout3rd,
    charityName, charityAmount, kpHoles, hasLongestDrive, hasMulligans,
  } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Tournament name is required." }, { status: 400 });
  }
  if (!format) {
    return NextResponse.json({ error: "Format is required." }, { status: 400 });
  }

  const slug = await uniqueSlug(slugify(name.trim()));

  const tournament = await prisma.tournament.create({
    data: {
      ownerId: session.user.id,
      name: name.trim(),
      slug,
      tagline: tagline ?? null,
      template: template ?? "classic-green",
      format,
      teamSize: teamSize ?? 4,
      holes: holes ?? 18,
      handicapEnabled: handicapEnabled ?? false,
      playedAt: playedAt ? new Date(playedAt) : null,
      entryFee: entryFee ?? null,
      payout1st: payout1st ?? null,
      payout2nd: payout2nd ?? null,
      payout3rd: payout3rd ?? null,
      charityName: charityName ?? null,
      charityAmount: charityAmount ?? null,
      kpHoles: kpHoles ?? [],
      hasLongestDrive: hasLongestDrive ?? false,
      hasMulligans: hasMulligans ?? false,
    },
  });

  return NextResponse.json({ ok: true, slug: tournament.slug, id: tournament.id }, { status: 201 });
}
