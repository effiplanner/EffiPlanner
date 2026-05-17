"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

type Item = {
  id: string;
  label: string;
  category: string;
  qty: number;
  unit: string;
  checked: boolean;
  alreadyHave: boolean;
};

export function ShoppingList({
  locale,
  initialItems,
}: {
  locale: "ro" | "en";
  initialItems: Item[];
}) {
  const [items, setItems] = useState<Item[]>(initialItems);

  const grouped = useMemo(() => {
    const map = new Map<string, Item[]>();
    for (const i of items) {
      const key = i.category || "other";
      map.set(key, [...(map.get(key) ?? []), i]);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [items]);

  async function update(id: string, patch: Partial<Item>) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
    await fetch(`/api/shopping-items/${id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
    });
  }

  function catLabel(cat: string) {
    const ro = locale === "ro";
    const map: Record<string, string> = {
      meat: ro ? "Carne / proteină" : "Meat / protein",
      protein: ro ? "Proteină" : "Protein",
      dairy: ro ? "Lactate" : "Dairy",
      vegetables: ro ? "Legume" : "Vegetables",
      pantry: ro ? "Cămară" : "Pantry",
      spices: ro ? "Condimente" : "Spices",
      frozen: ro ? "Congelate" : "Frozen",
      household: ro ? "Casă" : "Household",
      other: ro ? "Altele" : "Other",
    };
    return map[cat] ?? cat;
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-16">
      <Card>
        <CardHeader>
          <h1 className="text-lg font-semibold">{locale === "ro" ? "Lista de cumpărături" : "Shopping list"}</h1>
          <p className="text-sm opacity-70">
            {locale === "ro"
              ? "Bifate = se estompează (nu dispar)."
              : "Checked items fade out (they don’t disappear)."}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {grouped.map(([cat, list]) => (
            <div key={cat} className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wide opacity-60">{catLabel(cat)}</div>
              <ul className="space-y-2">
                {list.map((i) => (
                  <li
                    key={i.id}
                    className={[
                      "flex items-center justify-between gap-3 rounded-xl border border-black/5 bg-white px-3 py-2 text-sm",
                      i.checked ? "opacity-40" : "opacity-100",
                    ].join(" ")}
                  >
                    <label className="flex flex-1 items-center gap-3">
                      <input
                        type="checkbox"
                        checked={i.checked}
                        onChange={(e) => update(i.id, { checked: e.target.checked })}
                      />
                      <span className={i.alreadyHave ? "line-through opacity-70" : ""}>
                        {i.label}{" "}
                        <span className="text-xs opacity-70">
                          • {i.qty}
                          {i.unit}
                        </span>
                      </span>
                    </label>
                    <button
                      onClick={() => update(i.id, { alreadyHave: !i.alreadyHave })}
                      className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs hover:bg-black/5"
                    >
                      {i.alreadyHave ? (locale === "ro" ? "Nu mai am" : "Need it") : (locale === "ro" ? "Am deja" : "Have it")}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
