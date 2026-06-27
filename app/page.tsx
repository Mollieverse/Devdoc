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
];

export default async function Home({ searchParams }: PageProps<'/'>) {
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

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-5">
          <a href="/" className="flex items-baseline gap-2">
            <span className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              devdoc
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              quick reference for developers
            </span>
          </a>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-10">
        <SearchForm initialQuery={query} />

        {!query && <EmptyState />}

        {query && errorMessage && <ErrorState message={errorMessage} query={query} />}

        {query && result && highlightedHtml && (
          <ResultCard result={result} highlightedHtml={highlightedHtml} />
        )}
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto w-full max-w-3xl px-6 py-4 text-xs text-zinc-500 dark:text-zinc-400">
          answers are AI-generated. verify before shipping to prod.
        </div>
      </footer>
    </div>
  );
}

function EmptyState() {
  return (
    <section className="flex flex-col gap-6 rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Search for code, fast.
        </h1>
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Type a question, an error, or a how-to. Get back the smallest correct code
          snippet — no fluff, no fences, no narration.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          try
        </span>
        <ul className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <li key={ex}>
              <a
                href={`/?q=${encodeURIComponent(ex)}`}
                className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-700 transition hover:border-zinc-300 hover:bg-white dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-700"
              >
                {ex}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ErrorState({ message, query }: { message: string; query: string }) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-950/30">
      <h2 className="text-sm font-semibold text-red-900 dark:text-red-200">
        Couldn&apos;t generate a snippet for &ldquo;{query}&rdquo;
      </h2>
      <p className="text-sm text-red-800 dark:text-red-300">{message}</p>
      <p className="text-xs text-red-700 dark:text-red-400">
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
          <span className="inline-flex items-center rounded-md bg-zinc-200 px-2 py-0.5 font-mono text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            {result.language}
          </span>
          {result.cached && (
            <span
              className="inline-flex items-center rounded-md border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-300"
              title="Served from cache — no API call"
            >
              cached
            </span>
          )}
        </div>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          for &ldquo;{result.query_original}&rdquo;
        </span>
      </header>

      <div className="group relative overflow-hidden rounded-xl border border-zinc-800 bg-[#22272e]">
        <div
          className="shiki-host overflow-x-auto p-5 text-sm leading-6"
          dangerouslySetInnerHTML={{ __html: highlightedHtml }}
        />
        <CopyButton text={result.snippet} />
      </div>

      <p className="text-sm leading-6 text-zinc-700 dark:text-zinc-300">{result.context}</p>

      {result.tags.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {result.tags.map((tag) => (
            <li
              key={tag}
              className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 font-mono text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
            >
              {tag}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
