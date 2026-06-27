import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const SYSTEM_PROMPT = `You are DevDoc, a developer quick-reference engine.

Given a developer's question — a programming task, an error message, a setup step, or a "how do I X in language Y" — return the smallest correct code snippet that answers it. Do NOT explain the code, do NOT add commentary, do NOT wrap in markdown fences.

Return a JSON object:
- snippet: the raw code or command. No fences. No leading/trailing whitespace.
- language: lowercase shiki identifier (e.g. "python", "javascript", "typescript", "bash", "rust", "go", "sql", "yaml", "json", "html", "css", "java", "c", "cpp", "ruby", "php"). Use "text" only if truly unspecified.
- tags: 2-5 short kebab-case tags identifying the topic (e.g. ["python", "file-io", "stdlib"]).
- context: one short sentence (max 20 words) about when or why to use this. Plain text, no markdown.

For error queries: return the corrected code.
For setup queries: return the command(s).
For "how do I X" queries: return the canonical idiomatic answer.`;

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
  },
  required: ['snippet', 'language', 'tags', 'context'],
  additionalProperties: false,
} as const;

export interface ClaudeResult {
  snippet: string;
  language: string;
  tags: string[];
  context: string;
}

export async function generateSnippet(query: string): Promise<ClaudeResult> {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    output_config: {
      format: { type: 'json_schema', schema: RESPONSE_SCHEMA },
    },
    messages: [{ role: 'user', content: query }],
  });

  const textBlock = response.content.find((b) => b.type === 'text');
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
