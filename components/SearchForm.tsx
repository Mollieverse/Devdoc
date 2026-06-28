export default function SearchForm({
  initialQuery = '',
  variant = 'hero',
}: {
  initialQuery?: string;
  variant?: 'hero' | 'compact';
}) {
  const isHero = variant === 'hero';
  return (
    <form action="/" method="GET" className="w-full">
      <div
        className={
          isHero
            ? 'group relative flex items-center rounded-2xl border border-white/10 bg-[#16161a] shadow-[0_8px_32px_-12px_rgba(0,0,0,0.6)] transition focus-within:border-white/25 focus-within:bg-[#1a1a1f]'
            : 'group relative flex items-center rounded-xl border border-white/10 bg-[#16161a] transition focus-within:border-white/25'
        }
      >
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className={
            isHero
              ? 'ml-5 h-5 w-5 shrink-0 text-zinc-500'
              : 'ml-4 h-4 w-4 shrink-0 text-zinc-500'
          }
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>

        <input
          type="search"
          name="q"
          defaultValue={initialQuery}
          placeholder={
            isHero
              ? 'Ask anything — "debounce in typescript", "fix CORS in express"...'
              : 'Search again...'
          }
          autoComplete="off"
          autoFocus
          maxLength={500}
          required
          className={
            isHero
              ? 'w-full bg-transparent px-4 py-5 text-lg text-zinc-100 outline-none placeholder:text-zinc-500'
              : 'w-full bg-transparent px-3 py-3 text-base text-zinc-100 outline-none placeholder:text-zinc-500'
          }
        />

        <div className={isHero ? 'mr-2 flex items-center gap-2 pr-2' : 'mr-2 flex items-center'}>
          {isHero && (
            <span className="hidden text-xs text-zinc-500 sm:inline">
              <kbd className="kbd">↵</kbd>
            </span>
          )}
          <button
            type="submit"
            className={
              isHero
                ? 'rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-zinc-900 transition hover:bg-zinc-200'
                : 'rounded-lg bg-white px-3.5 py-1.5 text-sm font-medium text-zinc-900 transition hover:bg-zinc-200'
            }
          >
            Search
          </button>
        </div>
      </div>
    </form>
  );
}
