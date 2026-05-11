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
  while (await prisma.league.findUnique({ where: { slug } })) {
    n++;
    slug = `${base}-${n}`;
  }
  return slug;
}

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const leagues = await prisma.league.findMany({
    where: { ownerId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(leagues);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, tagline, template, playerCount, scoringFormat, holes, features } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "League name is required." }, { status: 400 });
  }

  const slug = await uniqueSlug(slugify(name.trim()));

  const league = await prisma.league.create({
    data: {
      ownerId: session.user.id,
      name: name.trim(),
      slug,
      tagline: tagline?.trim() || null,
      template: template ?? "classic-green",
      tier: "starter",
      playerCount: playerCount ?? null,
      scoringFormat: scoringFormat ?? null,
      holes: holes ?? 18,
      features: features ?? [],
    },
  });

  return NextResponse.json({ ok: true, slug: league.slug, id: league.id }, { status: 201 });
}
