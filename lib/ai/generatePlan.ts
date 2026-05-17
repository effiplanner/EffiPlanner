import OpenAI from "openai";
import { PlanOutputSchema, type PlanOutput } from "@/lib/validators";
import { systemPrompt, userPrompt } from "@/lib/ai/prompts";

function hasAiEnabled() {
  return process.env.USE_AI === "true" && !!process.env.OPENAI_API_KEY;
}

export async function generatePlanAI(args: {
  locale: "ro" | "en";
  days: number;
  householdSize: number;
  budgetAmountCents: number;
  budgetCurrency: string;
  budgetPeriod: "weekly" | "monthly";
  cookTimeMaxMin: number;
  energyLevel: "low" | "med" | "high";
  goalTags: string[];
  dislikes: string[];
  restrictionsJson: Record<string, any>;
  storeNames: string[];
  freeformRequest?: string;
}): Promise<PlanOutput> {
  if (!hasAiEnabled()) return fallbackPlan(args);

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

  const sys = systemPrompt(args.locale);
  const usr = userPrompt(args);

  const resp = await client.responses.create({
    model,
    input: [
      { role: "system", content: sys },
      { role: "user", content: usr },
    ],
    // Ask for strict JSON output
    text: { format: { type: "json_object" } },
  });

  const text = resp.output_text;
  const parsed = JSON.parse(text);
  return PlanOutputSchema.parse(parsed);
}

/**
 * Deterministic fallback generator for MVP/dev usage without AI.
 * Keeps things simple and repetitive (cognitive load reduction).
 */
export function fallbackPlan(args: {
  locale: "ro" | "en";
  days: number;
  householdSize: number;
  cookTimeMaxMin: number;
  energyLevel: "low" | "med" | "high";
  goalTags: string[];
}): PlanOutput {
  const ro = args.locale === "ro";
  const meals = [];
  const baseMeals = [
    {
      title: ro ? "Pui cu ciuperci și orez" : "Chicken & mushrooms with rice",
      tags: ["high protein", "simple"],
      estTimeMin: Math.min(args.cookTimeMaxMin, 35),
      ingredients: [
        { name: "chicken breast", qty: 500, unit: "g" as const },
        { name: "mushrooms", qty: 300, unit: "g" as const },
        { name: "rice", qty: 250, unit: "g" as const },
        { name: "cooking cream", qty: 150, unit: "ml" as const },
        { name: "onion", qty: 150, unit: "g" as const },
        { name: "oil", qty: 10, unit: "ml" as const, stapleAssumed: true },
        { name: "salt", qty: 1, unit: "g" as const, stapleAssumed: true },
        { name: "pepper", qty: 1, unit: "g" as const, stapleAssumed: true },
      ],
      stepsShort: ro
        ? "Sotează ceapa + puiul. Adaugă ciupercile. Fierbe orezul separat. La final, adaugă smântână și condimente."
        : "Sauté onion + chicken. Add mushrooms. Cook rice separately. Finish with cream and seasoning.",
      storageNotes: ro ? "Ține 2-3 zile la frigider." : "Keeps 2–3 days in the fridge.",
      substitutions: ro ? ["Fără ciuperci? Pune mazăre sau doar mai multă ceapă."] : ["No mushrooms? Use peas or extra onion."]
    },
    {
      title: ro ? "Paste cu ton și roșii" : "Tuna pasta with tomatoes",
      tags: ["quick", "budget"],
      estTimeMin: Math.min(args.cookTimeMaxMin, 20),
      ingredients: [
        { name: "pasta", qty: 250, unit: "g" as const },
        { name: "tuna (canned)", qty: 1, unit: "piece" as const },
        { name: "tomatoes", qty: 300, unit: "g" as const },
        { name: "garlic", qty: 10, unit: "g" as const },
        { name: "oil", qty: 10, unit: "ml" as const, stapleAssumed: true },
        { name: "salt", qty: 1, unit: "g" as const, stapleAssumed: true },
      ],
      stepsShort: ro
        ? "Fierbe pastele. Călește usturoiul, adaugă roșii + ton. Amestecă."
        : "Boil pasta. Sauté garlic, add tomatoes + tuna. Combine.",
      storageNotes: ro ? "Ține 1-2 zile." : "Keeps 1–2 days.",
      substitutions: ro ? ["Nu ai roșii? Folosește conserve sau iaurt pentru un sos simplu."] : ["No tomatoes? Use canned or yogurt for a simple sauce."]
    },
    {
      title: ro ? "Omletă + iaurt" : "Omelet + yogurt",
      tags: ["low effort"],
      estTimeMin: Math.min(args.cookTimeMaxMin, 10),
      ingredients: [
        { name: "eggs", qty: 4, unit: "piece" as const },
        { name: "yogurt", qty: 200, unit: "g" as const },
        { name: "onion", qty: 80, unit: "g" as const },
        { name: "oil", qty: 5, unit: "ml" as const, stapleAssumed: true },
        { name: "salt", qty: 1, unit: "g" as const, stapleAssumed: true },
      ],
      stepsShort: ro ? "Bate ouăle, gătește rapid cu ceapă. Servește cu iaurt." : "Beat eggs, cook quickly with onion. Serve with yogurt.",
      storageNotes: ro ? "Cel mai bine fresh." : "Best fresh.",
      substitutions: ro ? ["Poți înlocui ceapa cu roșii."] : ["Swap onion for tomatoes."]
    }
  ];

  const slots = ["breakfast", "lunch", "dinner"] as const;
  for (let d = 0; d < Math.min(args.days, 7); d++) {
    for (const slot of slots) {
      const pick = slot === "breakfast" ? baseMeals[2] : baseMeals[(d + (slot === "lunch" ? 0 : 1)) % 2];
      meals.push({
        dayIndex: d,
        slot,
        title: pick.title,
        servings: Math.max(1, args.householdSize),
        estTimeMin: pick.estTimeMin,
        tags: [...pick.tags, ...args.goalTags].slice(0, 6),
        stepsShort: pick.stepsShort,
        storageNotes: pick.storageNotes,
        substitutions: Array.isArray(pick.substitutions) ? pick.substitutions : [],
        macros: { approximate: true },
        ingredients: pick.ingredients.map((i) => ({
          name: i.name,
          qty: i.qty,
          unit: i.unit,
          category: undefined,
          stapleAssumed: (i as any).stapleAssumed ?? false,
        })),
      });
    }
  }

  return { meals, notes: ro ? "Plan simplu și repetabil (fallback fără AI)." : "Simple repeatable plan (AI disabled fallback)." };
}
