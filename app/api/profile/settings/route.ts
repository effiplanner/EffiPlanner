import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getLocaleFromCookies, getProfileIdFromCookies } from "@/lib/profile";
import { ProfileSettingsInputSchema } from "@/lib/validators";

export async function GET() {
  const profileId = getProfileIdFromCookies();
  if (!profileId) return NextResponse.json({ error: "missing profile cookie" }, { status: 400 });

  const locale = getLocaleFromCookies();

  await prisma.profile.upsert({
    where: { id: profileId },
    update: { locale },
    create: { id: profileId, locale },
  });

  const settings = await prisma.profileSettings.findUnique({ where: { profileId } });

  // default minimal settings
  if (!settings) {
    const created = await prisma.profileSettings.create({
      data: {
        profileId,
        budgetAmountCents: 25000,
        budgetCurrency: "RON",
        budgetPeriod: "weekly",
        householdSize: 1,
        daysToPlan: 7,
        cookTimeMaxMin: 40,
        energyLevel: "med",
      },
    });
    return NextResponse.json(created);
  }

  return NextResponse.json(settings);
}

export async function PUT(req: Request) {
  const profileId = getProfileIdFromCookies();
  if (!profileId) return NextResponse.json({ error: "missing profile cookie" }, { status: 400 });

  const locale = getLocaleFromCookies();
  await prisma.profile.upsert({
    where: { id: profileId },
    update: { locale },
    create: { id: profileId, locale },
  });

  const body = await req.json();
  const parsed = ProfileSettingsInputSchema.parse(body);

  const saved = await prisma.profileSettings.upsert({
    where: { profileId },
    update: parsed,
    create: { profileId, ...parsed },
  });

  return NextResponse.json(saved);
}
