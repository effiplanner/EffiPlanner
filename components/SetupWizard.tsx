"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

const GOAL_TAGS = [
  "cheap meals",
  "quick meals",
  "high protein",
  "comfort food",
  "low effort",
  "meal prep",
  "vegetarian",
  "fasting",
  "healthy-ish",
];

export function SetupWizard({ locale }: { locale: "ro" | "en" }) {
  const [budget, setBudget] = useState("250");
  const [period, setPeriod] = useState<"weekly" | "monthly">("weekly");
  const [people, setPeople] = useState(1);
  const [days, setDays] = useState(7);
  const [locationText, setLocationText] = useState("");
  const [cookTime, setCookTime] = useState(40);
  const [energy, setEnergy] = useState<"low" | "med" | "high">("med");
  const [goalTags, setGoalTags] = useState<string[]>(["low effort"]);
  const [freeformRequest, setFreeformRequest] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currency = "RON";

  const budgetCents = useMemo(() => {
    const n = Number(budget.replace(",", "."));
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.round(n * 100));
  }, [budget]);

  function toggleTag(tag: string) {
    setGoalTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  async function saveAndGenerate() {
    setBusy(true);
    setError(null);
    try {
      const settingsRes = await fetch("/api/profile/settings", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          budgetAmountCents: budgetCents,
          budgetCurrency: currency,
          budgetPeriod: period,
          householdSize: people,
          daysToPlan: days,
          locationText,
          preferredStoreIds: [],
          restrictionsJson: {},
          dislikes: [],
          equipment: [],
          cookTimeMaxMin: cookTime,
          energyLevel: energy,
          goalTags,
          freeformRequest,
        }),
      });
      if (!settingsRes.ok) throw new Error("Failed to save settings");

      const planRes = await fetch("/api/plans", { method: "POST" });
      if (!planRes.ok) throw new Error("Failed to create plan");
      const plan = await planRes.json();

      const genRes = await fetch(`/api/plans/${plan.id}/generate`, { method: "POST" });
      if (!genRes.ok) throw new Error("Failed to generate plan");
      // Redirect to plan
      window.location.href = `/${locale}/plan/${plan.id}`;
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-16">
      <Card>
        <CardHeader>
          <h1 className="text-lg font-semibold">
            {locale === "ro" ? "Setare rapidă" : "Quick setup"}
          </h1>
          <p className="text-sm opacity-70">
            {locale === "ro"
              ? "Răspunde la minimul necesar. Poți ajusta ulterior."
              : "Answer only what’s needed. You can refine later."}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="space-y-1">
              <div className="text-xs opacity-70">
                {locale === "ro" ? "Buget" : "Budget"}
              </div>
              <Input value={budget} onChange={(e) => setBudget(e.target.value)} inputMode="decimal" />
            </label>
            <label className="space-y-1">
              <div className="text-xs opacity-70">
                {locale === "ro" ? "Perioadă" : "Period"}
              </div>
              <Select value={period} onChange={(e) => setPeriod(e.target.value as any)}>
                <option value="weekly">{locale === "ro" ? "Săptămânal" : "Weekly"}</option>
                <option value="monthly">{locale === "ro" ? "Lunar" : "Monthly"}</option>
              </Select>
            </label>
            <label className="space-y-1">
              <div className="text-xs opacity-70">{locale === "ro" ? "Persoane" : "People"}</div>
              <Input
                value={String(people)}
                onChange={(e) => setPeople(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
                inputMode="numeric"
              />
            </label>
            <label className="space-y-1">
              <div className="text-xs opacity-70">{locale === "ro" ? "Zile" : "Days"}</div>
              <Input
                value={String(days)}
                onChange={(e) => setDays(Math.max(1, Math.min(14, Number(e.target.value) || 7)))}
                inputMode="numeric"
              />
            </label>
          </div>

          <label className="space-y-1">
            <div className="text-xs opacity-70">
              {locale === "ro" ? "Locație / magazine (opțional)" : "Location / stores (optional)"}
            </div>
            <Input
              placeholder={locale === "ro" ? "ex: București, Sector 2" : "e.g. Bucharest, Sector 2"}
              value={locationText}
              onChange={(e) => setLocationText(e.target.value)}
            />
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="space-y-1">
              <div className="text-xs opacity-70">{locale === "ro" ? "Timp max (min)" : "Max time (min)"}</div>
              <Input
                value={String(cookTime)}
                onChange={(e) => setCookTime(Math.max(5, Math.min(180, Number(e.target.value) || 40)))}
                inputMode="numeric"
              />
            </label>
            <label className="space-y-1">
              <div className="text-xs opacity-70">{locale === "ro" ? "Energie" : "Energy"}</div>
              <Select value={energy} onChange={(e) => setEnergy(e.target.value as any)}>
                <option value="low">{locale === "ro" ? "Scăzută" : "Low"}</option>
                <option value="med">{locale === "ro" ? "Medie" : "Medium"}</option>
                <option value="high">{locale === "ro" ? "Ridicată" : "High"}</option>
              </Select>
            </label>
          </div>

          <div className="space-y-2">
            <div className="text-xs opacity-70">{locale === "ro" ? "Ce rezolvăm?" : "What are we solving?"}</div>
            <div className="flex flex-wrap gap-2">
              {GOAL_TAGS.map((tag) => (
                <Chip key={tag} selected={goalTags.includes(tag)} onClick={() => toggleTag(tag)} type="button">
                  {tag}
                </Chip>
              ))}
            </div>
            <div className="text-xs opacity-60">
              {locale === "ro"
                ? "Text liber e opțional — chips-urile sunt suficiente."
                : "Free text is optional — chips are enough."}
            </div>
            <Input
              placeholder={locale === "ro" ? "Orice detaliu special (opțional)..." : "Any special request (optional)..."}
              value={freeformRequest}
              onChange={(e) => setFreeformRequest(e.target.value)}
            />
          </div>

          {error ? <div className="text-sm text-red-600">{error}</div> : null}

          <Button onClick={saveAndGenerate} disabled={busy}>
            {busy ? (locale === "ro" ? "Generez..." : "Generating...") : (locale === "ro" ? "Generează planul meu" : "Generate my plan")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
