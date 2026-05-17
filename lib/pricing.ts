import { prisma } from "@/lib/db";

export type Money = { cents: number; currency: string };

export function formatMoney(m: Money): string {
  const value = (m.cents / 100).toFixed(2);
  // Romanian-style currency is usually "lei"; keep simple.
  return `${value} ${m.currency === "RON" ? "lei" : m.currency}`;
}

export async function estimateIngredientCostCents(args: {
  ingredientId: string;
  qty: number;
  unit: "g" | "ml" | "piece";
  storeId?: string | null;
  currency?: string;
}): Promise<number> {
  const { ingredientId, qty, unit, storeId } = args;

  // Prefer store-specific price
  const storePrice = storeId
    ? await prisma.ingredientPrice.findFirst({
        where: { ingredientId, storeId },
      })
    : null;

  const avgPrice = await prisma.ingredientPrice.findFirst({
    where: { ingredientId, storeId: null },
  });

  const price = storePrice ?? avgPrice;
  if (!price) return 0;

  if (price.unit !== unit) {
    // MVP: if units mismatch, don't guess. Return 0 rather than lying.
    return 0;
  }

  // price is for `qty` units
  const unitCost = price.priceCents / price.qty;
  return Math.round(unitCost * qty);
}

export async function estimateMealCostCents(planMealId: string, storeId?: string | null) {
  const meal = await prisma.planMeal.findUnique({
    where: { id: planMealId },
    include: { ingredients: true },
  });
  if (!meal) return { total: 0, perServing: 0 };

  const items = await Promise.all(
    meal.ingredients.map(async (mi) => {
      if (mi.isStapleAssumed) return 0;
      return estimateIngredientCostCents({
        ingredientId: mi.ingredientId,
        qty: mi.qty,
        unit: mi.unit as any,
        storeId,
      });
    })
  );

  const total = items.reduce((a, b) => a + b, 0);
  const perServing = meal.servings > 0 ? Math.round(total / meal.servings) : total;
  return { total, perServing };
}
