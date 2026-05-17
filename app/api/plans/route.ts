import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getProfileIdFromCookies } from "@/lib/profile";

export async function POST() {
  const profileId = getProfileIdFromCookies();
  if (!profileId) return NextResponse.json({ error: "missing profile cookie" }, { status: 400 });

  const settings = await prisma.profileSettings.findUnique({ where: { profileId } });
  const days = settings?.daysToPlan ?? 7;

  const plan = await prisma.plan.create({
    data: {
      profileId,
      days,
      currency: settings?.budgetCurrency ?? "RON",
      modeTags: settings?.goalTags ?? [],
      status: "draft",
    },
  });

  return NextResponse.json(plan);
}
