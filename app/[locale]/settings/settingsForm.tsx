"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

type Settings = {
  budgetAmountCents: number;
  budgetCurrency: string;
  budgetPeriod: "weekly" | "monthly";
  householdSize: number;
  daysToPlan: number;
  locationText: string;
  cookTimeMaxMin: number;
  energyLevel: "low" | "med" | "high";
  goalTags: string[];
  freeformRequest: string;
};

export function SettingsForm({ locale }: { locale: "ro" | "en" }) {
  const [s, setS] = useState<Settings | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/profile/settings");
      const json = await res.json();
      setS(json);
    })();
  }, []);

  if (!s) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 text-sm opacity-70">
        {locale === "ro" ? "Se încarcă..." : "Loading..."}
      </div>
    );
  }

  async function save() {
    setBusy(true);
    await fetch("/api/profile/settings", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(s),
    });
    setBusy(false);
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-16">
      <Card>
        <CardHeader>
          <h1 className="text-lg font-semibold">{locale === "ro" ? "Setări" : "Settings"}</h1>
          <p className="text-sm opacity-70">
            {locale === "ro"
              ? "Profilul există ca să reducă fricțiunea, nu să o crească."
              : "Settings exist to reduce friction, not add it."}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="space-y-1">
            <div className="text-xs opacity-70">{locale === "ro" ? "Buget (lei)" : "Budget"}</div>
            <Input
              value={(s.budgetAmountCents / 100).toFixed(2)}
              onChange={(e) =>
                setS({ ...s, budgetAmountCents: Math.max(0, Math.round(Number(e.target.value || 0) * 100)) })
              }
            />
          </label>

          <label className="space-y-1">
            <div className="text-xs opacity-70">{locale === "ro" ? "Perioadă" : "Period"}</div>
            <Select
              value={s.budgetPeriod}
              onChange={(e) => setS({ ...s, budgetPeriod: e.target.value as any })}
            >
              <option value="weekly">{locale === "ro" ? "Săptămânal" : "Weekly"}</option>
              <option value="monthly">{locale === "ro" ? "Lunar" : "Monthly"}</option>
            </Select>
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="space-y-1">
              <div className="text-xs opacity-70">{locale === "ro" ? "Persoane" : "People"}</div>
              <Input
                value={String(s.householdSize)}
                onChange={(e) => setS({ ...s, householdSize: Math.max(1, Number(e.target.value) || 1) })}
              />
            </label>
            <label className="space-y-1">
              <div className="text-xs opacity-70">{locale === "ro" ? "Zile" : "Days"}</div>
              <Input
                value={String(s.daysToPlan)}
                onChange={(e) => setS({ ...s, daysToPlan: Math.max(1, Number(e.target.value) || 7) })}
              />
            </label>
          </div>

          <label className="space-y-1">
            <div className="text-xs opacity-70">{locale === "ro" ? "Locație" : "Location"}</div>
            <Input value={s.locationText} onChange={(e) => setS({ ...s, locationText: e.target.value })} />
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="space-y-1">
              <div className="text-xs opacity-70">{locale === "ro" ? "Timp max (min)" : "Max time (min)"}</div>
              <Input
                value={String(s.cookTimeMaxMin)}
                onChange={(e) => setS({ ...s, cookTimeMaxMin: Math.max(5, Number(e.target.value) || 40) })}
              />
            </label>
            <label className="space-y-1">
              <div className="text-xs opacity-70">{locale === "ro" ? "Energie" : "Energy"}</div>
              <Select
                value={s.energyLevel}
                onChange={(e) => setS({ ...s, energyLevel: e.target.value as any })}
              >
                <option value="low">{locale === "ro" ? "Scăzută" : "Low"}</option>
                <option value="med">{locale === "ro" ? "Medie" : "Medium"}</option>
                <option value="high">{locale === "ro" ? "Ridicată" : "High"}</option>
              </Select>
            </label>
          </div>

          <label className="space-y-1">
            <div className="text-xs opacity-70">{locale === "ro" ? "Notă (opțional)" : "Note (optional)"}</div>
            <Input value={s.freeformRequest} onChange={(e) => setS({ ...s, freeformRequest: e.target.value })} />
          </label>

          <Button onClick={save} disabled={busy}>
            {busy ? "…" : (locale === "ro" ? "Salvează" : "Save")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
