import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getProfileIdFromCookies } from "@/lib/profile";
import { FeedbackInputSchema } from "@/lib/validators";

export async function POST(req: Request) {
  const profileId = getProfileIdFromCookies();
  if (!profileId) return NextResponse.json({ error: "missing profile cookie" }, { status: 400 });

  const body = FeedbackInputSchema.parse(await req.json());

  const created = await prisma.feedbackEvent.create({
    data: { profileId, ...body },
  });

  return NextResponse.json(created);
}
