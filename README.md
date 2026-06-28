# devdoc

> Code answers, instantly.

A minimalist developer reference. Type a bug, an error, or a how-to — get back the smallest correct snippet, syntax-highlighted and copy-pasteable. Every query is cached in Postgres, so the second hit on the same question is instant and free.

No Stack Overflow tabs. No 14-paragraph blog posts. Just the code.

---

## Stack

- **Next.js 16** (App Router, React 19, Server Components)
- **Tailwind v4** for styling
- **Anthropic Claude Haiku 4.5** with `output_config.format` json_schema for structured responses
- **Neon Postgres** (via `@vercel/postgres`) for query caching
- **Shiki** (`github-dark-dimmed`) for server-rendered syntax highlighting

## How it works

```
query  →  normalize  →  cache lookup  →  hit?  →  serve cached  ─┐
                              │                                   │
                              └─→ miss?  →  Claude  →  cache  ──→ ┴─→ render
```

The model is constrained to a strict JSON schema (`{ snippet, language, tags, context }`), so the response is always renderable — no fences to strip, no markdown to parse.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Get a Neon connection string

Sign up at [neon.tech](https://neon.tech), create a project, then go to **Connection Details → Pooled connection** and copy the URL. The host must contain `-pooler`.

### 3. Configure env vars

```bash
cp .env.example .env.local
```

Fill in:

```
ANTHROPIC_API_KEY=sk-ant-...
POSTGRES_URL=postgresql://user:pwd@ep-xxx-pooler.region.aws.neon.tech/devdoc?sslmode=require
```

### 4. Run the migration

Easiest: paste `db/migrations/001_snippets.sql` into Neon's SQL Editor and run it.

Or from CLI:

```bash
psql "$POSTGRES_URL" -f db/migrations/001_snippets.sql
```

### 5. Start the app

```bash
npm run dev
```

Open <http://localhost:3000>.

## Project layout

```
app/
  layout.tsx        root layout + fonts
  page.tsx          landing view + result view (server component)
  globals.css       tailwind + design tokens + shiki overrides
components/
  SearchForm.tsx    hero + compact search input
  CopyButton.tsx    client-side clipboard button
lib/
  anthropic.ts      Claude call with json_schema constrained output
  db.ts             Neon Postgres queries
  search.ts         orchestrator: normalize → cache → generate → cache
  highlight.ts      shiki singleton + lazy language loading
  types.ts          shared types
db/
  migrations/001_snippets.sql
```

## Why cache?

The same query gets asked over and over. `read a file in python` doesn't need a fresh API call every time. Normalizing the query string (`trim → lowercase → collapse whitespace`) is enough to catch the long tail of trivial variations. Cache writes are fire-and-forget, so a DB hiccup never blocks the response.

## Tradeoffs / non-goals

- Answers are AI-generated. The system prompt is tight, but **verify before shipping to prod.**
- No tag-browsing UI yet — tags are stored and indexed, but the discovery page is TODO.
- No streaming — the page blocks on the full Claude response (~1–2s). Acceptable for now; a streamed UI would be the next upgrade.

---

&nbsp;

&nbsp;

&nbsp;

---

Built by [**@0xblaize**](https://github.com/0xblaize)
