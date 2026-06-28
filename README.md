# devdoc

> Code answers, instantly.

A minimalist developer reference. Type a bug, an error, or a how-to — get back the smallest correct snippet that the community has actually converged on. Every answer cites the Stack Overflow / Reddit / GitHub threads it came from, so you can verify before you copy. Cached in Postgres so the second hit on the same question is instant and free.

No Stack Overflow tabs. No 14-paragraph blog posts. Just the code, sourced from what real devs say works.

---

## Stack

- **Next.js 16** (App Router, React 19, Server Components)
- **Tailwind v4** for styling
- **Anthropic Claude Haiku 4.5** + **`web_search` tool** restricted to `stackoverflow.com`, `reddit.com`, `github.com`, `dev.to`, `developer.mozilla.org`
- **Structured output** via `output_config.format` json_schema (`{ snippet, language, tags, context, sources }`)
- **Neon Postgres** (via `@vercel/postgres`) for query caching, including cited sources
- **Shiki** (`github-dark-dimmed`) for server-rendered syntax highlighting

## How it works

```
query  →  normalize  →  cache lookup  ──hit──→ serve cached + sources  ─┐
                              │                                          │
                              └──miss──→ Claude + web_search             │
                                              │                          │
                                        searches SO / Reddit / GH        │
                                              │                          │
                                        synthesizes answer + sources ──→ ┴─→ render
                                              │
                                              └──→ cache for next time
```

Two things make this different from "yet another ChatGPT wrapper":

1. **The model is grounded.** It searches the real web (restricted to dev-trusted domains) before answering, so answers reflect current community consensus rather than 2024 training data.
2. **Sources are first-class.** Every snippet ships with the 1–4 threads it was built from. The UI renders them as clickable citations directly under the code.

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

### 4. Run the migrations

Easiest: paste each file in `db/migrations/` into Neon's SQL Editor and run them in order.

Or from CLI:

```bash
psql "$POSTGRES_URL" -f db/migrations/001_snippets.sql
psql "$POSTGRES_URL" -f db/migrations/002_sources.sql
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
  migrations/
    001_snippets.sql    initial schema
    002_sources.sql     adds sources jsonb column
```

## Why cache?

The same query gets asked over and over. `read a file in python` doesn't need a fresh API call (and a fresh web search!) every time. Normalizing the query string (`trim → lowercase → collapse whitespace`) is enough to catch the long tail of trivial variations. Cache writes are fire-and-forget, so a DB hiccup never blocks the response. Cached entries include the sources, so citations survive too.

## Tradeoffs / non-goals

- Answers are AI-generated. The system prompt is tight and the model is grounded in real sources, but **verify before shipping to prod.**
- `web_search` costs more than a pure model call. `max_uses` is capped at 3 per query; the cache layer means each unique query only pays this once.
- No tag-browsing UI yet — tags are stored and indexed, but the discovery page is TODO.
- No streaming — the page blocks on the full Claude response (~3–6s with web search). Acceptable for now; a streamed UI would be the next upgrade.

---

&nbsp;

&nbsp;

&nbsp;

---

Built by [**@0xblaize**](https://github.com/0xblaize)
