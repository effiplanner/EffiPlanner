import { prisma } from "@/lib/db";
import type { Locale } from "@/lib/i18n";
import { MealCard } from "@/components/MealCard";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

export default async function PlanPage({
  params,
}: {
  params: { locale: Locale; planId: string };
}) {
  const plan = await prisma.plan.findUnique({
    where: { id: params.planId },
    include: { meals: { orderBy: [{ dayIndex: "asc" }, { slot: "asc" }] } },
  });

  if (!plan) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10">
        <div className="text-sm opacity-70">Plan not found.</div>
      </main>
    );
  }

  const total = (plan.estimatedTotalCents / 100).toFixed(2);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-16">
      <div className="flex items-start justify-between gap-3 py-6">
        <div>
          <h1 className="text-xl font-semibold">
            {params.locale === "ro" ? "Planul tău" : "Your plan"}
          </h1>
          <div className="mt-1 text-sm opacity-70">
            {params.locale === "ro" ? "Cost estimat:" : "Estimated cost:"} ~{total}{" "}
            {plan.currency === "RON" ? "lei" : plan.currency}
          </div>
        </div>
        <Button href={`/${params.locale}/plan/${plan.id}/shopping`}>
          {params.locale === "ro" ? "Listă cumpărături" : "Shopping list"}
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4 text-sm opacity-80">
          {params.locale === "ro"
            ? "Hint: dacă te simți fără energie, apasă «Mai rapid» sau «Mai ieftin» pe 1–2 mese și gata."
            : "Hint: low energy? Tap “Faster” or “Cheaper” on 1–2 meals and you’re done."}
        </CardContent>
      </Card>

      <div className="space-y-4">
        {plan.meals.map((m) => (
          <MealCard
            key={m.id}
            meal={{
              id: m.id,
              dayIndex: m.dayIndex,
              slot: m.slot as any,
              title: m.title,
              servings: m.servings,
              estTimeMin: m.estTimeMin,
              estCostPerServingCents: m.estCostPerServingCents,
              tags: m.tags,
            }}
            locale={params.locale}
            currency={plan.currency}
          />
        ))}
      </div>
    </main>
  );
}
