import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getProfileIdFromCookies } from "@/lib/profile";

export async function GET(_: Request, { params }: { params: { planId: string } }) {
  const profileId = getProfileIdFromCookies();
  if (!profileId) return NextResponse.json({ error: "missing profile cookie" }, { status: 400 });

  const plan = await prisma.plan.findFirst({
    where: { id: params.planId, profileId },
    include: { meals: true, shoppingList: { include: { items: true } } },
  });

  if (!plan) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(plan);
}
