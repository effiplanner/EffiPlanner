import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { getDict, type Locale } from "@/lib/i18n";

export default function HomePage({ params }: { params: { locale: Locale } }) {
  const locale = params.locale;
  const dict = getDict(locale);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 pb-16">
      <section className="py-10">
        <h1 className="text-3xl font-semibold tracking-tight">{dict.tagline}</h1>
        <p className="mt-2 max-w-2xl text-sm opacity-70">{dict.subtitle}</p>

        <div className="mt-6 flex gap-3">
          <Button href={`/${locale}/setup`}>{dict.start}</Button>
        </div>
      </section>

      <Card>
        <CardContent className="p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <div className="text-sm font-semibold">{locale === "ro" ? "Ghidat, nu prompt" : "Guided, not prompt-only"}</div>
              <div className="mt-1 text-sm opacity-70">
                {locale === "ro"
                  ? "Chips, toggles, preferințe memorate. Text liber doar dacă vrei."
                  : "Chips, toggles, remembered prefs. Free text only if you want."}
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold">{locale === "ro" ? "Costuri reale-ish" : "Real-ish costs"}</div>
              <div className="mt-1 text-sm opacity-70">
                {locale === "ro"
                  ? "Estimări pe porție și pe plan. Enough to decide, not obsess."
                  : "Estimates per serving and per plan. Enough to decide, not obsess."}
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold">{locale === "ro" ? "Mai puțin haos" : "Less chaos"}</div>
              <div className="mt-1 text-sm opacity-70">
                {locale === "ro"
                  ? "Plan repetabil + listă de cumpărături care nu te enervează."
                  : "Repeatable plan + shopping list that doesn’t fight you."}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
