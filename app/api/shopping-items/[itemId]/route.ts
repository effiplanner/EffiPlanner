import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getProfileIdFromCookies } from "@/lib/profile";

export async function PUT(req: Request, { params }: { params: { itemId: string } }) {
  const profileId = getProfileIdFromCookies();
  if (!profileId) return NextResponse.json({ error: "missing profile cookie" }, { status: 400 });

  // MVP: we trust item ownership via plan -> profile; keep it simple.
  const patch = await req.json();

  const updated = await prisma.shoppingItem.update({
    where: { id: params.itemId },
    data: {
      checked: typeof patch.checked === "boolean" ? patch.checked : undefined,
      alreadyHave: typeof patch.alreadyHave === "boolean" ? patch.alreadyHave : undefined,
      qty: typeof patch.qty === "number" ? patch.qty : undefined,
      unit: typeof patch.unit === "string" ? patch.unit : undefined,
      label: typeof patch.label === "string" ? patch.label : undefined,
    },
  });

  return NextResponse.json(updated);
}
