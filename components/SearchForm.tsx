export default function SearchForm({ initialQuery = '' }: { initialQuery?: string }) {
  return (
    <form action="/" method="GET" className="w-full">
      <div className="relative">
        <input
          type="search"
          name="q"
          defaultValue={initialQuery}
          placeholder="read a file in python, async http in rust, fix CORS error..."
          autoComplete="off"
          autoFocus
          maxLength={500}
          required
          className="w-full rounded-xl border border-black/10 bg-white px-5 py-4 pr-24 text-base text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:shadow-md dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-600"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Search
        </button>
      </div>
    </form>
  );
}
