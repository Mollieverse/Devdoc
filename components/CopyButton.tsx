'use client';

import { useState } from 'react';

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          // Clipboard API can fail in non-secure contexts; ignore silently.
        }
      }}
      aria-label="Copy code to clipboard"
      className="absolute right-3 top-3 rounded-md bg-zinc-800/80 px-2.5 py-1 text-xs font-medium text-zinc-100 opacity-0 backdrop-blur-sm transition group-hover:opacity-100 hover:bg-zinc-700 dark:bg-zinc-700/80 dark:hover:bg-zinc-600"
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}
