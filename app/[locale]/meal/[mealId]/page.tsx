import type { Locale } from "@/lib/i18n";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

export default async function MealDetailPage({ params }: { params: { locale: Locale; mealId: string } }) {
  const meal = await prisma.planMeal.findUnique({
    where: { id: params.mealId },
    include: { ingredients: { include: { ingredient: true } }, plan: true },
  });

  if (!meal) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-10">
        <div className="text-sm opacity-70">Meal not found.</div>
      </main>
    );
  }

  const total = (meal.estCostTotalCents / 100).toFixed(2);
  const per = (meal.estCostPerServingCents / 100).toFixed(2);

  return (
    <main className="mx-auto w-full max-w-2xl px-4 pb-16">
      <div className="py-6">
        <Button href={`/${params.locale}/plan/${meal.planId}`}>{params.locale === "ro" ? "Înapoi" : "Back"}</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="text-xs opacity-70">
            {params.locale === "ro" ? `Ziua ${meal.dayIndex + 1}` : `Day ${meal.dayIndex + 1}`} • {meal.slot}
          </div>
          <h1 className="text-xl font-semibold">{meal.title}</h1>
          <div className="mt-1 text-sm opacity-70">
            ~{total} {meal.plan.currency === "RON" ? "lei" : meal.plan.currency} total • ~{per}{" "}
            {meal.plan.currency === "RON" ? "lei" : meal.plan.currency}/{params.locale === "ro" ? "porție" : "serving"} • ~{meal.estTimeMin} min
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h2 className="text-sm font-semibold">{params.locale === "ro" ? "Ingrediente" : "Ingredients"}</h2>
            <ul className="mt-2 space-y-2 text-sm">
              {meal.ingredients.map((i) => (
                <li key={i.id} className="flex items-center justify-between rounded-xl border border-black/5 bg-white px-3 py-2">
                  <span className="capitalize">{i.ingredient.name}</span>
                  <span className="text-xs opacity-70">
                    {i.qty}
                    {i.unit}
                    {i.isStapleAssumed ? (params.locale === "ro" ? " • (acasă)" : " • (at home)") : ""}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-semibold">{params.locale === "ro" ? "Pași (simpli)" : "Steps (simple)"}</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm opacity-80">{meal.stepsShort || "—"}</p>
          </section>

          <section>
            <h2 className="text-sm font-semibold">{params.locale === "ro" ? "Păstrare" : "Storage"}</h2>
            <p className="mt-2 text-sm opacity-80">{meal.storageNotes || "—"}</p>
          </section>

          <section>
            <h2 className="text-sm font-semibold">{params.locale === "ro" ? "Substituții" : "Substitutions"}</h2>
            <div className="mt-2 text-sm opacity-80">
              {Array.isArray(meal.substitutionsJson) && (meal.substitutionsJson as any[]).length ? (
                <ul className="list-disc pl-5">
                  {(meal.substitutionsJson as any[]).map((s, idx) => (
                    <li key={idx}>{String(s)}</li>
                  ))}
                </ul>
              ) : (
                "—"
              )}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold">{params.locale === "ro" ? "Nutriție (aprox.)" : "Nutrition (approx.)"}</h2>
            <p className="mt-2 text-sm opacity-70">
              {params.locale === "ro"
                ? "Estimări orientative (nu medical)."
                : "Rough estimates (not medical)."}
            </p>
          </section>
        </CardContent>
      </Card>
    </main>
  );
}
