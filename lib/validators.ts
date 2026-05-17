import { z } from "zod";

export const LocaleSchema = z.enum(["ro", "en"]);
export const BudgetPeriodSchema = z.enum(["weekly", "monthly"]);

export const ProfileSettingsInputSchema = z.object({
  budgetAmountCents: z.number().int().min(0),
  budgetCurrency: z.string().min(1).default("RON"),
  budgetPeriod: BudgetPeriodSchema,

  householdSize: z.number().int().min(1).max(20),
  daysToPlan: z.number().int().min(1).max(14),

  locationText: z.string().max(200),
  preferredStoreIds: z.array(z.string()).default([]),

  restrictionsJson: z.record(z.any()).default({}),
  dislikes: z.array(z.string()).default([]),
  equipment: z.array(z.string()).default([]),

  cookTimeMaxMin: z.number().int().min(5).max(180),
  energyLevel: z.enum(["low", "med", "high"]),
  goalTags: z.array(z.string()).default([]),

  freeformRequest: z.string().max(500).default(""),
});

export const GeneratePlanInputSchema = z.object({
  planId: z.string().uuid(),
});

export const MealSlotSchema = z.enum(["breakfast", "lunch", "dinner"]);

export const PlanIngredientSchema = z.object({
  name: z.string().min(1),
  qty: z.number().int().min(1),
  unit: z.enum(["g", "ml", "piece"]),
  category: z.string().optional(),
  stapleAssumed: z.boolean().optional()
});

export const PlanMealSchema = z.object({
  dayIndex: z.number().int().min(0).max(13),
  slot: MealSlotSchema,
  title: z.string().min(2).max(80),
  servings: z.number().int().min(1).max(12).default(2),
  estTimeMin: z.number().int().min(5).max(180).default(30),
  tags: z.array(z.string()).default([]),
  stepsShort: z.string().max(1200).default(""),
  storageNotes: z.string().max(500).default(""),
  substitutions: z.array(z.string()).default([]),
  macros: z.record(z.any()).default({}),
  ingredients: z.array(PlanIngredientSchema).min(2).max(30),
});

export const PlanOutputSchema = z.object({
  meals: z.array(PlanMealSchema).min(3),
  notes: z.string().max(800).default(""),
});
export type PlanOutput = z.infer<typeof PlanOutputSchema>;

export const MealActionSchema = z.object({
  action: z.enum(["makeCheaper", "makeFaster", "moreProtein"]),
});

export const SubstituteInputSchema = z.object({
  missing: z.string().min(1).max(80),
});

export const FeedbackInputSchema = z.object({
  planMealId: z.string().uuid(),
  rating: z.enum(["up", "down"]),
  reason: z.enum(["too_hard", "too_expensive", "taste", "other"]).default("other"),
  note: z.string().max(300).default(""),
});
