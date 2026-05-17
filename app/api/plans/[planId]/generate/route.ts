import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getLocaleFromCookies, getProfileIdFromCookies } from "@/lib/profile";
import { rateLimit } from "@/lib/rateLimit";
import { generatePlanAI } from "@/lib/ai/generatePlan";
import { upsertIngredientByName, STAPLES_ASSUMED } from "@/lib/ingredients";
import { estimateMealCostCents } from "@/lib/pricing";

export async function POST(_: Request, { params }: { params: { planId: string } }) {
  const profileId = getProfileIdFromCookies();
  if (!profileId) return NextResponse.json({ error: "missing profile cookie" }, { status: 400 });

  const rpm = Number(process.env.AI_RPM_LIMIT || "10");
  const lim = rateLimit(`ai:${profileId}`, rpm);
  if (!lim.ok) return NextResponse.json({ error: "rate limited" }, { status: 429 });

  const locale = getLocaleFromCookies();

  const settings = await prisma.profileSettings.findUnique({ where: { profileId } });
  if (!settings) return NextResponse.json({ error: "missing settings" }, { status: 400 });

  const stores = settings.preferredStoreIds.length
    ? await prisma.store.findMany({ where: { id: { in: settings.preferredStoreIds } } })
    : await prisma.store.findMany({ take: 2 });

  const plan = await prisma.plan.findFirst({ where: { id: params.planId, profileId } });
  if (!plan) return NextResponse.json({ error: "plan not found" }, { status: 404 });

  // Clear existing meals to avoid duplicates
  await prisma.planMeal.deleteMany({ where: { planId: plan.id } });

  const output = await generatePlanAI({
    locale,
    days: settings.daysToPlan,
    householdSize: settings.householdSize,
    budgetAmountCents: settings.budgetAmountCents,
    budgetCurrency: settings.budgetCurrency,
    budgetPeriod: settings.budgetPeriod as any,
    cookTimeMaxMin: settings.cookTimeMaxMin,
    energyLevel: settings.energyLevel as any,
    goalTags: settings.goalTags,
    dislikes: settings.dislikes,
    restrictionsJson: (settings.restrictionsJson as any) ?? {},
    storeNames: stores.map((s) => s.name),
    freeformRequest: settings.freeformRequest,
  });

  // Persist meals + ingredients
  for (const meal of output.meals) {
    const createdMeal = await prisma.planMeal.create({
      data: {
        planId: plan.id,
        dayIndex: meal.dayIndex,
        slot: meal.slot,
        title: meal.title,
        servings: meal.servings,
        estTimeMin: meal.estTimeMin,
        tags: meal.tags,
        stepsShort: meal.stepsShort ?? "",
        storageNotes: meal.storageNotes ?? "",
        substitutionsJson: meal.substitutions ?? [],
        macrosJson: meal.macros ?? {},
      },
    });

    for (const ing of meal.ingredients) {
      const ingredient = await upsertIngredientByName({
        name: ing.name,
        category: ing.category,
        defaultUnit: ing.unit,
      });

      await prisma.mealIngredient.create({
        data: {
          planMealId: createdMeal.id,
          ingredientId: ingredient.id,
          qty: ing.qty,
          unit: ing.unit,
          isStapleAssumed: !!ing.stapleAssumed || STAPLES_ASSUMED.has(ingredient.name),
        },
      });
    }

    // Compute costs for the meal
    const primaryStoreId = settings.preferredStoreIds[0] ?? null;
    const costs = await estimateMealCostCents(createdMeal.id, primaryStoreId);
    await prisma.planMeal.update({
      where: { id: createdMeal.id },
      data: {
        estCostTotalCents: costs.total,
        estCostPerServingCents: costs.perServing,
      },
    });
  }

  // Compute total plan cost
  const meals = await prisma.planMeal.findMany({ where: { planId: plan.id } });
  const total = meals.reduce((sum, m) => sum + m.estCostTotalCents, 0);

  await prisma.plan.update({
    where: { id: plan.id },
    data: { estimatedTotalCents: total },
  });

  return NextResponse.json({ ok: true, mealCount: output.meals.length });
}
