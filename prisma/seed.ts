import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type SeedIngredient = {
  name: string;
  category: string;
  unit: "g" | "ml" | "piece";
  avgPrice: { priceCents: number; qty: number; unit: "g" | "ml" | "piece" };
};

const STORES = ["Lidl", "Kaufland", "Mega Image", "Auchan"];

const INGREDIENTS: SeedIngredient[] = [
  { name: "chicken breast", category: "meat", unit: "g", avgPrice: { priceCents: 1200, qty: 1000, unit: "g" } },
  { name: "mushrooms", category: "vegetables", unit: "g", avgPrice: { priceCents: 900, qty: 500, unit: "g" } },
  { name: "cooking cream", category: "dairy", unit: "ml", avgPrice: { priceCents: 700, qty: 500, unit: "ml" } },
  { name: "rice", category: "pantry", unit: "g", avgPrice: { priceCents: 800, qty: 1000, unit: "g" } },
  { name: "pasta", category: "pantry", unit: "g", avgPrice: { priceCents: 700, qty: 1000, unit: "g" } },
  { name: "potatoes", category: "vegetables", unit: "g", avgPrice: { priceCents: 600, qty: 1000, unit: "g" } },
  { name: "eggs", category: "protein", unit: "piece", avgPrice: { priceCents: 150, qty: 1, unit: "piece" } },
  { name: "onion", category: "vegetables", unit: "g", avgPrice: { priceCents: 300, qty: 1000, unit: "g" } },
  { name: "garlic", category: "vegetables", unit: "g", avgPrice: { priceCents: 200, qty: 100, unit: "g" } },
  { name: "tomatoes", category: "vegetables", unit: "g", avgPrice: { priceCents: 700, qty: 1000, unit: "g" } },
  { name: "yogurt", category: "dairy", unit: "g", avgPrice: { priceCents: 500, qty: 400, unit: "g" } },
  { name: "beans (canned)", category: "pantry", unit: "piece", avgPrice: { priceCents: 450, qty: 1, unit: "piece" } },
  { name: "tuna (canned)", category: "protein", unit: "piece", avgPrice: { priceCents: 650, qty: 1, unit: "piece" } },
  // Staples assumed at home (no prices needed for shopping list)
  { name: "oil", category: "pantry", unit: "ml", avgPrice: { priceCents: 0, qty: 1, unit: "ml" } },
  { name: "salt", category: "spices", unit: "g", avgPrice: { priceCents: 0, qty: 1, unit: "g" } },
  { name: "pepper", category: "spices", unit: "g", avgPrice: { priceCents: 0, qty: 1, unit: "g" } },
  { name: "basic spices", category: "spices", unit: "g", avgPrice: { priceCents: 0, qty: 1, unit: "g" } },
];

async function main() {
  const stores = await Promise.all(
    STORES.map((name) =>
      prisma.store.upsert({
        where: { id: name }, // hack: we don't have unique name; create deterministic by using id=name in dev seed
        update: {},
        create: { id: name, name, country: "RO" },
      }).catch(async () => {
        // If id collides with uuid constraints in future, fallback:
        return prisma.store.create({ data: { name, country: "RO" } });
      })
    )
  );

  for (const ing of INGREDIENTS) {
    const ingredient = await prisma.ingredient.upsert({
      where: { name: ing.name },
      update: { category: ing.category, defaultUnit: ing.unit },
      create: { name: ing.name, category: ing.category, defaultUnit: ing.unit },
    });

    if (ing.avgPrice.priceCents > 0) {
      // National average price (storeId null)
      await prisma.ingredientPrice.upsert({
        where: { id: `avg:${ingredient.id}` },
        update: { priceCents: ing.avgPrice.priceCents, qty: ing.avgPrice.qty, unit: ing.avgPrice.unit },
        create: {
          id: `avg:${ingredient.id}`,
          ingredientId: ingredient.id,
          storeId: null,
          priceCents: ing.avgPrice.priceCents,
          qty: ing.avgPrice.qty,
          unit: ing.avgPrice.unit,
          currency: "RON",
        },
      });
    }
  }

  console.log("✅ Seeded stores, ingredients, and average prices.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
