"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import Link from "next/link";

type Meal = {
  id: string;
  dayIndex: number;
  slot: "breakfast" | "lunch" | "dinner";
  title: string;
  servings: number;
  estTimeMin: number;
  estCostPerServingCents: number;
  tags: string[];
};

function slotLabel(locale: "ro" | "en", slot: Meal["slot"]) {
  const map: any = {
    breakfast: locale === "ro" ? "Mic dejun" : "Breakfast",
    lunch: locale === "ro" ? "Prânz" : "Lunch",
    dinner: locale === "ro" ? "Cină" : "Dinner",
  };
  return map[slot] ?? slot;
}

export function MealCard({ meal, locale, currency }: { meal: Meal; locale: "ro" | "en"; currency: string }) {
  const [busy, setBusy] = useState<null | string>(null);

  async function action(action: "makeCheaper" | "makeFaster" | "moreProtein") {
    setBusy(action);
    try {
      const res = await fetch(`/api/plan-meals/${meal.id}/action`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error("Action failed");
      window.location.reload();
    } finally {
      setBusy(null);
    }
  }

  const per = (meal.estCostPerServingCents / 100).toFixed(2);

  return (
    <Card>
      <CardHeader className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs opacity-70">{slotLabel(locale, meal.slot)} • {locale === "ro" ? `Ziua ${meal.dayIndex + 1}` : `Day ${meal.dayIndex + 1}`}</div>
          <h3 className="text-base font-semibold">{meal.title}</h3>
          <div className="mt-1 flex flex-wrap gap-2 text-xs opacity-70">
            <span>{meal.servings} {locale === "ro" ? "porții" : "servings"}</span>
            <span>•</span>
            <span>~{per} {currency === "RON" ? "lei" : currency}/{locale === "ro" ? "porție" : "serving"}</span>
            <span>•</span>
            <span>~{meal.estTimeMin} {locale === "ro" ? "min" : "min"}</span>
          </div>
        </div>
        <Link
          href={`/${locale}/meal/${meal.id}`}
          className="rounded-xl border border-black/10 bg-white px-3 py-2 text-xs hover:bg-black/5"
        >
          {locale === "ro" ? "Detalii" : "Details"}
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {meal.tags.slice(0, 6).map((t) => (
            <span key={t} className="rounded-full bg-black/5 px-3 py-1 text-xs">
              {t}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => action("makeCheaper")} disabled={!!busy}>
            {busy === "makeCheaper" ? "…" : (locale === "ro" ? "Mai ieftin" : "Cheaper")}
          </Button>
          <Button onClick={() => action("makeFaster")} disabled={!!busy}>
            {busy === "makeFaster" ? "…" : (locale === "ro" ? "Mai rapid" : "Faster")}
          </Button>
          <Button onClick={() => action("moreProtein")} disabled={!!busy}>
            {busy === "moreProtein" ? "…" : (locale === "ro" ? "Mai multă proteină" : "More protein")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
