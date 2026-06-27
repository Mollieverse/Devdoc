export interface Snippet {
  query_normalized: string;
  query_original: string;
  snippet: string;
  language: string;
  tags: string[];
  context: string;
}

export interface SnippetResult extends Snippet {
  cached: boolean;
}
