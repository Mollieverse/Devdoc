import { sql } from '@vercel/postgres';
import type { Snippet, Source } from './types';

export function normalize(query: string): string {
  return query.trim().toLowerCase().replace(/\s+/g, ' ');
}

type SnippetRow = Omit<Snippet, 'sources'> & { sources: Source[] | string };

export async function findCached(normalized: string): Promise<Snippet | null> {
  const { rows } = await sql<SnippetRow>`
    SELECT query_normalized, query_original, snippet, language, tags, context, sources
    FROM snippets
    WHERE query_normalized = ${normalized}
    LIMIT 1
  `;
  const row = rows[0];
  if (!row) return null;
  // jsonb columns come back already parsed, but defend against a string just in case.
  const sources: Source[] =
    typeof row.sources === 'string' ? JSON.parse(row.sources) : row.sources;
  return { ...row, sources };
}

export async function incrementHitCount(normalized: string): Promise<void> {
  await sql`
    UPDATE snippets
    SET hit_count = hit_count + 1, updated_at = NOW()
    WHERE query_normalized = ${normalized}
  `;
}

export async function insertSnippet(snippet: Snippet): Promise<void> {
  const tagsLiteral =
    '{' +
    snippet.tags.map((t) => `"${t.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`).join(',') +
    '}';
  const sourcesJson = JSON.stringify(snippet.sources);
  await sql`
    INSERT INTO snippets (query_normalized, query_original, snippet, language, tags, context, sources)
    VALUES (
      ${snippet.query_normalized},
      ${snippet.query_original},
      ${snippet.snippet},
      ${snippet.language},
      ${tagsLiteral}::text[],
      ${snippet.context},
      ${sourcesJson}::jsonb
    )
    ON CONFLICT (query_normalized) DO NOTHING
  `;
}
