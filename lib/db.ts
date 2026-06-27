import { sql } from '@vercel/postgres';
import type { Snippet } from './types';

export function normalize(query: string): string {
  return query.trim().toLowerCase().replace(/\s+/g, ' ');
}

export async function findCached(normalized: string): Promise<Snippet | null> {
  const { rows } = await sql<Snippet>`
    SELECT query_normalized, query_original, snippet, language, tags, context
    FROM snippets
    WHERE query_normalized = ${normalized}
    LIMIT 1
  `;
  return rows[0] ?? null;
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
  await sql`
    INSERT INTO snippets (query_normalized, query_original, snippet, language, tags, context)
    VALUES (
      ${snippet.query_normalized},
      ${snippet.query_original},
      ${snippet.snippet},
      ${snippet.language},
      ${tagsLiteral}::text[],
      ${snippet.context}
    )
    ON CONFLICT (query_normalized) DO NOTHING
  `;
}
