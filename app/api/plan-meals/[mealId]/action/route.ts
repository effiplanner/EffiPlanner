import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getLocaleFromCookies, getProfileIdFromCookies } from "@/lib/profile";
import { MealActionSchema, PlanMealSchema, PlanOutputSchema } from "@/lib/validators";
import { generatePlanAI } from "@/lib/ai/generatePlan";
import { upsertIngredientByName, STAPLES_ASSUMED } from "@/lib/ingredients";
import { estimateMealCostCents } from "@/lib/pricing";

export async function POST(req: Request, { params }: { params: { mealId: string } }) {
  const profileId = getProfileIdFromCookies();
  if (!profileId) return NextResponse.json({ error: "missing profile cookie" }, { status: 400 });

  const locale = getLocaleFromCookies();
  const body = MealActionSchema.parse(await req.json());

  const meal = await prisma.planMeal.findUnique({
    where: { id: params.mealId },
    include: { plan: true, ingredients: { include: { ingredient: true } } },
  });
  if (!meal) return NextResponse.json({ error: "meal not found" }, { status: 404 });

  // Use AI to rewrite *one meal card* by prompting with a tiny context.
  // For MVP: we reuse generatePlanAI by asking for 1 meal in notes (keeps code small).
  const settings = await prisma.profileSettings.findUnique({ where: { profileId } });
  if (!settings) return NextResponse.json({ error: "missing settings" }, { status: 400 });

  const storeNames = (await prisma.store.findMany({ take: 2 })).map((s) => s.name);

  const output = await generatePlanAI({
    locale,
    days: 1,
    householdSize: settings.householdSize,
    budgetAmountCents: settings.budgetAmountCents,
    budgetCurrency: settings.budgetCurrency,
    budgetPeriod: settings.budgetPeriod as any,
    cookTimeMaxMin: settings.cookTimeMaxMin,
    energyLevel: settings.energyLevel as any,
    goalTags: [...settings.goalTags, body.action],
    dislikes: settings.dislikes,
    restrictionsJson: (settings.restrictionsJson as any) ?? {},
    storeNames,
    freeformRequest:
      (settings.freeformRequest ? settings.freeformRequest + " | " : "") +
      `Adjust this meal to be ${body.action}. Base meal: ${meal.title}`,
  });

  const newMeal = output.meals[0];
  if (!newMeal) return NextResponse.json({ error: "no output" }, { status: 500 });

  // Replace ingredients
  await prisma.mealIngredient.deleteMany({ where: { planMealId: meal.id } });

  await prisma.planMeal.update({
    where: { id: meal.id },
    data: {
      title: newMeal.title,
      servings: newMeal.servings,
      estTimeMin: newMeal.estTimeMin,
      tags: newMeal.tags,
      stepsShort: newMeal.stepsShort ?? "",
      storageNotes: newMeal.storageNotes ?? "",
      substitutionsJson: newMeal.substitutions ?? [],
      macrosJson: newMeal.macros ?? {},
    },
  });

  for (const ing of newMeal.ingredients) {
    const ingredient = await upsertIngredientByName({
      name: ing.name,
      category: ing.category,
      defaultUnit: ing.unit,
    });

    await prisma.mealIngredient.create({
      data: {
        planMealId: meal.id,
        ingredientId: ingredient.id,
        qty: ing.qty,
        unit: ing.unit,
        isStapleAssumed: !!ing.stapleAssumed || STAPLES_ASSUMED.has(ingredient.name),
      },
    });
  }

  const primaryStoreId = settings.preferredStoreIds[0] ?? null;
  const costs = await estimateMealCostCents(meal.id, primaryStoreId);
  await prisma.planMeal.update({
    where: { id: meal.id },
    data: { estCostTotalCents: costs.total, estCostPerServingCents: costs.perServing },
  });

  // update plan total
  const meals = await prisma.planMeal.findMany({ where: { planId: meal.planId } });
  const total = meals.reduce((sum, m) => sum + m.estCostTotalCents, 0);
  await prisma.plan.update({ where: { id: meal.planId }, data: { estimatedTotalCents: total } });

  return NextResponse.json({ ok: true });
}
