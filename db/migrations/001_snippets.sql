CREATE TABLE IF NOT EXISTS snippets (
  query_normalized TEXT PRIMARY KEY,
  query_original   TEXT NOT NULL,
  snippet          TEXT NOT NULL,
  language         TEXT NOT NULL,
  tags             TEXT[] NOT NULL DEFAULT '{}',
  context          TEXT NOT NULL,
  hit_count        INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS snippets_tags_idx     ON snippets USING GIN (tags);
CREATE INDEX IF NOT EXISTS snippets_hit_count_idx ON snippets (hit_count DESC);
