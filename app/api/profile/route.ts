import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getLocaleFromCookies, getProfileIdFromCookies } from "@/lib/profile";

export async function GET() {
  const profileId = getProfileIdFromCookies();
  if (!profileId) return NextResponse.json({ error: "missing profile cookie" }, { status: 400 });

  const locale = getLocaleFromCookies();

  const profile = await prisma.profile.upsert({
    where: { id: profileId },
    update: { locale },
    create: { id: profileId, locale },
    include: { settings: true },
  });

  return NextResponse.json(profile);
}
