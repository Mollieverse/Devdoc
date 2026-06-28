import SearchForm from '@/components/SearchForm';
import CopyButton from '@/components/CopyButton';
import { getOrGenerateSnippet } from '@/lib/search';
import { highlight } from '@/lib/highlight';
import type { SnippetResult } from '@/lib/types';

const EXAMPLES = [
  'read a file line by line in python',
  'debounce function in typescript',
  'fix CORS error in express',
  'async http request in rust',
  'create a postgres table with foreign key',
  'reverse a string in go',
];

const HOW_IT_WORKS = [
  {
    n: '01',
    title: 'Ask anything',
    body: 'A question, an error message, a setup step, or a "how do I X in Y".',
  },
  {
    n: '02',
    title: 'Get one answer',
    body: 'The smallest correct snippet. No fluff, no fences, no narration.',
  },
  {
    n: '03',
    title: 'Cached forever',
    body: 'Every query is stored. The next hit on the same question is instant and free.',
  },
];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const raw = params.q;
  const query = typeof raw === 'string' ? raw.trim() : '';

  let result: SnippetResult | null = null;
  let errorMessage: string | null = null;

  if (query) {
    try {
      result = await getOrGenerateSnippet(query);
    } catch (e) {
      console.error('snippet generation failed:', e);
      errorMessage =
        e instanceof Error ? e.message : 'Something went wrong generating a snippet.';
    }
  }

  const highlightedHtml = result ? await highlight(result.snippet, result.language) : null;

  if (query) {
    return (
      <ResultView
        query={query}
        result={result}
        highlightedHtml={highlightedHtml}
        errorMessage={errorMessage}
      />
    );
  }

  return <LandingView />;
}

function Nav() {
  return (
    <nav className="relative z-10 border-b border-white/[0.06]">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
        <a href="/" className="flex items-baseline gap-2">
          <span className="font-mono text-sm font-semibold tracking-tight text-zinc-100">
            devdoc
          </span>
          <span className="text-xs text-zinc-500">/ quick reference</span>
        </a>
        <div className="flex items-center gap-5 text-xs text-zinc-500">
          <span className="hidden sm:inline">AI-generated · cached · open source</span>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/[0.06]">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-start justify-between gap-2 px-6 py-5 text-xs text-zinc-500 sm:flex-row sm:items-center">
        <span>Answers are AI-generated. Verify before shipping to prod.</span>
        <span className="font-mono">v0.1</span>
      </div>
    </footer>
  );
}

function LandingView() {
  return (
    <div className="relative flex flex-1 flex-col">
      <div className="bg-grid bg-grid-mask pointer-events-none absolute inset-0" aria-hidden />
      <Nav />

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center px-6 pt-20 pb-24 sm:pt-28">
        <span className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-xs text-zinc-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          now in beta
        </span>

        <h1 className="max-w-3xl text-center text-5xl font-semibold leading-[1.05] tracking-tight text-zinc-50 sm:text-6xl md:text-7xl">
          Code answers,
          <br />
          <span className="text-zinc-400">instantly.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-center text-base leading-7 text-zinc-400 sm:text-lg">
          Stop digging through Stack Overflow. Type the bug, the error, or the
          how-to — get back the smallest correct snippet, in the language you want.
        </p>

        <div className="mt-12 w-full max-w-2xl">
          <SearchForm variant="hero" />
        </div>

        <div className="mt-6 flex w-full max-w-2xl flex-col items-center gap-3">
          <span className="font-mono text-xs uppercase tracking-wider text-zinc-600">
            try
          </span>
          <ul className="flex flex-wrap justify-center gap-2">
            {EXAMPLES.map((ex) => (
              <li key={ex}>
                <a
                  href={`/?q=${encodeURIComponent(ex)}`}
                  className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.02] px-3 py-1.5 text-sm text-zinc-400 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-zinc-200"
                >
                  {ex}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <section className="mt-28 grid w-full grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/5 sm:grid-cols-3">
          {HOW_IT_WORKS.map((step) => (
            <div
              key={step.n}
              className="flex flex-col gap-3 bg-[#0a0a0b] p-7"
            >
              <span className="font-mono text-xs text-zinc-600">{step.n}</span>
              <h3 className="text-base font-semibold text-zinc-100">{step.title}</h3>
              <p className="text-sm leading-6 text-zinc-500">{step.body}</p>
            </div>
          ))}
        </section>
      </main>

      <Footer />
    </div>
  );
}

function ResultView({
  query,
  result,
  highlightedHtml,
  errorMessage,
}: {
  query: string;
  result: SnippetResult | null;
  highlightedHtml: string | null;
  errorMessage: string | null;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <Nav />

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-10">
        <SearchForm initialQuery={query} variant="compact" />

        {errorMessage && <ErrorState message={errorMessage} query={query} />}

        {result && highlightedHtml && (
          <ResultCard result={result} highlightedHtml={highlightedHtml} />
        )}
      </main>

      <Footer />
    </div>
  );
}

function ErrorState({ message, query }: { message: string; query: string }) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-red-900/40 bg-red-950/20 p-6">
      <h2 className="text-sm font-semibold text-red-200">
        Couldn&apos;t generate a snippet for &ldquo;{query}&rdquo;
      </h2>
      <p className="text-sm text-red-300/90">{message}</p>
      <p className="text-xs text-red-400/80">
        Check that <code className="font-mono">ANTHROPIC_API_KEY</code> is set, then try again.
      </p>
    </section>
  );
}

function ResultCard({
  result,
  highlightedHtml,
}: {
  result: SnippetResult;
  highlightedHtml: string;
}) {
  return (
    <section className="flex flex-col gap-4">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-xs font-medium text-zinc-300">
            {result.language}
          </span>
          {result.cached && (
            <span
              className="inline-flex items-center gap-1.5 rounded-md border border-emerald-700/40 bg-emerald-950/40 px-2 py-0.5 text-xs font-medium text-emerald-300"
              title="Served from cache — no API call"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              cached
            </span>
          )}
        </div>
        <span className="truncate text-xs text-zinc-500">
          &ldquo;{result.query_original}&rdquo;
        </span>
      </header>

      <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#22272e]">
        <div
          className="shiki-host overflow-x-auto p-5"
          dangerouslySetInnerHTML={{ __html: highlightedHtml }}
        />
        <CopyButton text={result.snippet} />
      </div>

      <p className="text-sm leading-6 text-zinc-400">{result.context}</p>

      {result.sources.length > 0 && <Sources sources={result.sources} />}

      {result.tags.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {result.tags.map((tag) => (
            <li
              key={tag}
              className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-xs text-zinc-400"
            >
              {tag}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function Sources({ sources }: { sources: { url: string; title: string }[] }) {
  return (
    <section className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <span className="font-mono text-xs uppercase tracking-wider text-zinc-500">
        sources · what real devs said
      </span>
      <ul className="flex flex-col">
        {sources.map((s) => (
          <li key={s.url}>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group/src flex items-baseline gap-3 rounded-md px-2 py-1.5 transition hover:bg-white/[0.04]"
            >
              <span className="inline-flex shrink-0 items-center rounded border border-white/10 bg-white/[0.03] px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
                {hostOf(s.url)}
              </span>
              <span className="truncate text-sm text-zinc-300 group-hover/src:text-zinc-100">
                {s.title}
              </span>
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="ml-auto h-3.5 w-3.5 shrink-0 text-zinc-600 group-hover/src:text-zinc-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 17 17 7" />
                <path d="M7 7h10v10" />
              </svg>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
