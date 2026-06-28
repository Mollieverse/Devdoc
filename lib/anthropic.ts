import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// Stack Overflow and Reddit are *intentionally omitted* — both sites block
// Anthropic's web crawler, so including them makes the whole request fail.
// See: https://support.anthropic.com/en/articles/8896518
const ALLOWED_DOMAINS = [
  'github.com',
  'dev.to',
  'developer.mozilla.org',
  'news.ycombinator.com',
  'freecodecamp.org',
];

const SYSTEM_PROMPT = `You are DevDoc, a developer quick-reference engine.

Your job: given a developer's question — a programming task, an error message, a setup step, or a "how do I X in language Y" — search the public web for what real developers actually say works, then return the smallest correct code snippet that answers it.

ALWAYS use the web_search tool first. Prefer GitHub issues/discussions, MDN, dev.to articles, Hacker News threads, and freeCodeCamp tutorials. Read what the community has converged on. Then synthesize the best answer from those sources.

Return a JSON object:
- snippet: the raw code or command. No markdown fences. No leading/trailing whitespace. No commentary inside the code.
- language: lowercase shiki identifier (e.g. "python", "javascript", "typescript", "bash", "rust", "go", "sql", "yaml", "json", "html", "css", "java", "c", "cpp", "ruby", "php"). Use "text" only if truly unspecified.
- tags: 2-5 short kebab-case tags identifying the topic (e.g. ["python", "file-io", "stdlib"]).
- context: one short sentence (max 25 words), in plain text, summarizing what the community consensus is or any important caveat from the discussions you read.
- sources: 1-4 of the most useful URLs you actually used. Each is { url, title }. URLs must be real, from the search results, and from the allowed domains.

For error queries: return the corrected code.
For setup queries: return the command(s).
For "how do I X" queries: return the canonical idiomatic answer.

If your search returns nothing useful, still produce a best-effort answer but return an empty sources array.`;

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    snippet: { type: 'string' },
    language: { type: 'string' },
    tags: {
      type: 'array',
      items: { type: 'string' },
    },
    context: { type: 'string' },
    sources: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          url: { type: 'string' },
          title: { type: 'string' },
        },
        required: ['url', 'title'],
        additionalProperties: false,
      },
    },
  },
  required: ['snippet', 'language', 'tags', 'context', 'sources'],
  additionalProperties: false,
} as const;

export interface Source {
  url: string;
  title: string;
}

export interface ClaudeResult {
  snippet: string;
  language: string;
  tags: string[];
  context: string;
  sources: Source[];
}

export async function generateSnippet(query: string): Promise<ClaudeResult> {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    tools: [
      {
        type: 'web_search_20260209',
        name: 'web_search',
        allowed_callers: ['direct'],
        allowed_domains: ALLOWED_DOMAINS,
        max_uses: 2,
      },
    ],
    output_config: {
      format: { type: 'json_schema', schema: RESPONSE_SCHEMA },
    },
    messages: [{ role: 'user', content: query }],
  });

  // The final structured response sits in the LAST text block — earlier text
  // blocks may contain Claude's narration between web_search tool calls.
  const textBlock = [...response.content].reverse().find((b) => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('Claude returned no text content');
  }
  try {
    return JSON.parse(textBlock.text) as ClaudeResult;
  } catch {
    const preview = textBlock.text.slice(0, 120).replace(/\s+/g, ' ');
    throw new Error(`Claude returned non-JSON content (got: "${preview}...")`);
  }
}
