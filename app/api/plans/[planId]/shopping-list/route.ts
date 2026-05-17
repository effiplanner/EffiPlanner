import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getProfileIdFromCookies } from "@/lib/profile";

function categoryOf(name: string) {
  // Basic heuristic fallback
  if (name.includes("chicken") || name.includes("meat")) return "meat";
  if (name.includes("egg") || name.includes("tuna") || name.includes("beans")) return "protein";
  if (name.includes("cream") || name.includes("yogurt")) return "dairy";
  if (name.includes("onion") || name.includes("tomato") || name.includes("mushroom") || name.includes("potato") || name.includes("garlic")) return "vegetables";
  if (name.includes("pepper") || name.includes("salt") || name.includes("spice")) return "spices";
  return "pantry";
}

export async function POST(_: Request, { params }: { params: { planId: string } }) {
  const profileId = getProfileIdFromCookies();
  if (!profileId) return NextResponse.json({ error: "missing profile cookie" }, { status: 400 });

  const plan = await prisma.plan.findFirst({
    where: { id: params.planId, profileId },
  });
  if (!plan) return NextResponse.json({ error: "plan not found" }, { status: 404 });

  // Delete old list (if any)
  await prisma.shoppingList.deleteMany({ where: { planId: plan.id } });

  const meals = await prisma.planMeal.findMany({
    where: { planId: plan.id },
    include: { ingredients: { include: { ingredient: true } } },
  });

  // Aggregate ingredients, excluding staples assumed at home
  const agg = new Map<string, { ingredientId?: string; label: string; category: string; qty: number; unit: string }>();

  for (const m of meals) {
    for (const ing of m.ingredients) {
      if (ing.isStapleAssumed) continue;
      const label = ing.ingredient.name;
      const key = `${label}|${ing.unit}`;
      const existing = agg.get(key);
      if (existing) {
        existing.qty += ing.qty;
      } else {
        agg.set(key, {
          ingredientId: ing.ingredientId,
          label,
          category: ing.ingredient.category || categoryOf(label),
          qty: ing.qty,
          unit: ing.unit,
        });
      }
    }
  }

  const list = await prisma.shoppingList.create({
    data: { planId: plan.id },
  });

  const items = Array.from(agg.values())
    .sort((a, b) => a.category.localeCompare(b.category) || a.label.localeCompare(b.label))
    .map((i, idx) => ({ ...i, sortKey: idx }));

  await prisma.shoppingItem.createMany({
    data: items.map((i) => ({
      shoppingListId: list.id,
      ingredientId: i.ingredientId,
      label: i.label,
      category: i.category,
      qty: i.qty,
      unit: i.unit,
      sortKey: i.sortKey,
    })),
  });

  return NextResponse.json({ ok: true, itemCount: items.length });
}
