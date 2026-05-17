export function systemPrompt(locale: "ro" | "en") {
  const base =
    locale === "ro"
      ? `Ești un asistent de decizii alimentare pentru oameni obosiți.
Nu ești aplicație de dietă. Nu ești site de rețete. Nu moralizezi.
Scop: plan realist + ingrediente simple + cost aproximativ + porții + timp.
Output-ul trebuie să fie JSON valid conform schemei cerute.`
      : `You are a food decision assistant for tired humans.
You are NOT a diet app and NOT a recipe discovery site. No moralizing.
Goal: realistic plan + simple ingredients + approximate costs + portions + time.
Your output MUST be valid JSON according to the requested schema.`;

  const safety =
    locale === "ro"
      ? `Reguli:
- Respectă strict alergiile/intoleranțele/restricțiile religioase.
- Nutriția/macros sunt aproximative (nu medical).
- Evită “guilt” sau limbaj de rușinare.
- Optimizează pentru “good enough” cu minimum hassle (nu 7 magazine pentru 3 lei).`
      : `Rules:
- Strictly respect allergies/intolerances/religious restrictions.
- Nutrition/macros are approximate (not medical).
- Avoid guilt/shaming language.
- Optimize for good-enough with minimal hassle (no 7 stores to save $1).`;

  return `${base}

${safety}`;
}

export function userPrompt(args: {
  locale: "ro" | "en";
  days: number;
  householdSize: number;
  budgetAmountCents: number;
  budgetCurrency: string;
  budgetPeriod: "weekly" | "monthly";
  cookTimeMaxMin: number;
  energyLevel: "low" | "med" | "high";
  goalTags: string[];
  dislikes: string[];
  restrictionsJson: Record<string, any>;
  storeNames: string[];
  freeformRequest?: string;
}) {
  const budget = (args.budgetAmountCents / 100).toFixed(2);
  const base = {
    days: args.days,
    householdSize: args.householdSize,
    budget: `${budget} ${args.budgetCurrency} / ${args.budgetPeriod}`,
    cookTimeMaxMin: args.cookTimeMaxMin,
    energyLevel: args.energyLevel,
    goalTags: args.goalTags,
    dislikes: args.dislikes,
    restrictions: args.restrictionsJson,
    preferredStores: args.storeNames,
    freeformRequest: args.freeformRequest ?? "",
    staplesAssumedAtHome: ["oil", "salt", "pepper", "basic spices"],
  };

  const instruction =
    args.locale === "ro"
      ? `Generează un plan de mese sub formă de "cards" (mic dejun/prânz/cină, dar poți lăsa 1 slot gol dacă e realist).
Fiecare card trebuie să includă: titlu, porții, timp, tag-uri, ingrediente (cantități) și pași scurți.
Păstrează ingredientele simple și repetabile.`
      : `Generate a meal plan as "cards" (breakfast/lunch/dinner, but you may leave 1 slot empty if realistic).
Each card must include: title, servings, time, tags, ingredients (with quantities) and short steps.
Keep ingredients simple and repeatable.`;

  return `${instruction}

CONTEXT_JSON:
${JSON.stringify(base, null, 2)}`;
}
