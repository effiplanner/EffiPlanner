import { prisma } from "@/lib/db";

export async function upsertIngredientByName(args: {
  name: string;
  category?: string;
  defaultUnit?: string;
}) {
  const name = args.name.trim().toLowerCase();
  return prisma.ingredient.upsert({
    where: { name },
    update: {
      category: args.category ?? undefined,
      defaultUnit: args.defaultUnit ?? undefined,
    },
    create: {
      name,
      category: args.category ?? "pantry",
      defaultUnit: args.defaultUnit ?? "g",
    },
  });
}

export const STAPLES_ASSUMED = new Set(["oil", "salt", "pepper", "basic spices"]);
