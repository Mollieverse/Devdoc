import { findCached, incrementHitCount, insertSnippet, normalize } from './db';
import { generateSnippet } from './anthropic';
import type { Snippet, SnippetResult } from './types';

export async function getOrGenerateSnippet(query: string): Promise<SnippetResult> {
  const normalized = normalize(query);

  try {
    const cached = await findCached(normalized);
    if (cached) {
      incrementHitCount(normalized).catch((e) => console.error('hit count:', e));
      return { ...cached, cached: true };
    }
  } catch (e) {
    console.error('cache lookup failed:', e);
  }

  const result = await generateSnippet(query);
  const snippet: Snippet = {
    query_normalized: normalized,
    query_original: query,
    ...result,
  };

  insertSnippet(snippet).catch((e) => console.error('cache insert:', e));

  return { ...snippet, cached: false };
}
