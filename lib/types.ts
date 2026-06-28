export interface Source {
  url: string;
  title: string;
}

export interface Snippet {
  query_normalized: string;
  query_original: string;
  snippet: string;
  language: string;
  tags: string[];
  context: string;
  sources: Source[];
}

export interface SnippetResult extends Snippet {
  cached: boolean;
}
