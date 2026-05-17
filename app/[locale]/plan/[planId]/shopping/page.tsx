import type { Locale } from "@/lib/i18n";
import { prisma } from "@/lib/db";
import { ShoppingList } from "@/components/ShoppingList";
import { Button } from "@/components/ui/Button";

export default async function ShoppingPage({ params }: { params: { locale: Locale; planId: string } }) {
  // Ensure shopping list exists
  let list = await prisma.shoppingList.findUnique({
    where: { planId: params.planId },
    include: { items: true, plan: true },
  });

  if (!list) {
    // Create via API-side logic re-used? For MVP, do it here:
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/plans/${params.planId}/shopping-list`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      cache: "no-store",
    }).catch(() => {});
    list = await prisma.shoppingList.findUnique({
      where: { planId: params.planId },
      include: { items: true, plan: true },
    });
  }

  if (!list) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-10">
        <div className="text-sm opacity-70">Shopping list not found.</div>
      </main>
    );
  }

  return (
    <main>
      <div className="mx-auto w-full max-w-2xl px-4 py-6">
        <Button href={`/${params.locale}/plan/${params.planId}`}>{params.locale === "ro" ? "Înapoi la plan" : "Back to plan"}</Button>
      </div>
      <ShoppingList
        locale={params.locale}
        initialItems={list.items.map((i) => ({
          id: i.id,
          label: i.label,
          category: i.category,
          qty: i.qty,
          unit: i.unit,
          checked: i.checked,
          alreadyHave: i.alreadyHave,
        }))}
      />
    </main>
  );
}
