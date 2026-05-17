# effiplanner MVP (web) — “Less thinking. Better eating.”

This repository is a **guest-first** MVP build of **effiplanner**: a calm food decision assistant that generates **realistic meal plans**, **estimated costs & cost/portion**, and an interactive **shopping list** — with quick “make cheaper / faster / more protein” adjustments and ingredient substitutions.

It is intentionally **not** a recipe discovery site and **not** a diet tracker.

## TL;DR

```bash
cp .env.example .env
make setup
make dev
```

Open: http://localhost:3000

---

## What’s included (MVP)

- Landing page + guided quick setup (no blank-prompt dependency)
- Weekly plan generation (AI if configured, fallback deterministic generator if not)
- Meal cards + meal detail view
- Cost estimate (total + per portion)
- Shopping list with:
  - check to “fade” items (not delete)
  - mark “already at home”
  - category grouping
- Store selection (seeded stores) with **estimated** pricing (no live scraping)
- Simple feedback 👍/👎 per meal

## What’s intentionally excluded (avoid scope creep)

- Live supermarket pricing / scraping / ordering integrations
- Barcode scanning
- Pantry inventory (beyond “already at home” toggles)
- Leftovers engine
- Notifications & “progress dashboards”
- Accounts/subscriptions/community

---

## Tech stack

- Next.js (App Router) + TypeScript
- TailwindCSS
- PostgreSQL + Prisma
- Zod validation for API + AI structured output
- OpenAI API (optional; fallback generator included)

### OpenAI model

Default is `gpt-4.1-mini` (configurable via `OPENAI_MODEL`). See official model docs:
- GPT‑4.1 mini model page. (OpenAI) citeturn0search1
- Models overview. (OpenAI) citeturn0search2

---

## Environment variables

Create `.env` from `.env.example`.

Key vars:

- `DATABASE_URL` – Postgres connection string
- `USE_AI` – `true|false` (default false)
- `OPENAI_API_KEY` – required if `USE_AI=true`
- `OPENAI_MODEL` – optional (default `gpt-4.1-mini`)

---

## Commands

### Setup

```bash
make setup
```

- installs deps
- starts Postgres (Docker Compose)
- runs Prisma migrations
- seeds ingredients/stores/prices

### Dev server

```bash
make dev
```

### Tests

```bash
make test
```

### Lint

```bash
make lint
```

---

## App architecture (high-level)

### Guest-first identity

The app creates a `profileId` (UUID) cookie on first visit and uses it for all DB data.
This matches the MVP intent: **no forced accounts**.

### Data flow

1. User completes guided setup (budget, people, days, stores, constraints, goal tags).
2. User clicks **Generate my plan**.
3. Server generates plan:
   - If `USE_AI=true`, calls OpenAI and validates JSON output with Zod.
   - Else uses deterministic fallback generator.
4. Server calculates costs from `ingredient_prices`.
5. Shopping list aggregates all non-staple ingredients.

---

## Security & safety (mini threat model)

- Input validation: Zod on all API inputs.
- PII: minimal (guest profiles). No emails stored in MVP.
- Allergies/religious constraints are treated as **hard rules**; the model is instructed to avoid restricted items.
- No medical claims: macros/calories are “approximate only”.
- Rate limiting: simple in-memory per-profile limiter for AI endpoints (dev-safe; replace with Redis for prod).

---

## Roadmap (post-MVP)

- Accounts (optional), multi-device sync
- Better price modeling (pack sizes, store baskets)
- Pantry (true inventory) + leftovers engine
- Notifications (gentle, non-guilt)
- Subscription/billing

---

## Troubleshooting

### Prisma / DB issues
- Ensure Docker is running
- Check `DATABASE_URL` in `.env`
- Reset DB:

```bash
make db-reset
```

---

## License

MIT
