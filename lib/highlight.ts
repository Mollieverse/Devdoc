import { getSingletonHighlighter, bundledLanguages, type BundledLanguage } from 'shiki';

const THEME = 'github-dark-dimmed';

const PRELOADED_LANGS: BundledLanguage[] = [
  'python', 'javascript', 'typescript', 'tsx', 'jsx', 'bash', 'shell',
  'rust', 'go', 'sql', 'yaml', 'json', 'html', 'css', 'java', 'c', 'cpp',
  'ruby', 'php', 'csharp', 'kotlin', 'swift', 'dockerfile', 'toml', 'xml',
  'markdown',
];

function resolveLang(lang: string): BundledLanguage | 'text' {
  const normalized = lang.toLowerCase().trim();
  if (normalized === 'text' || normalized === 'plaintext' || normalized === '') return 'text';
  if (normalized in bundledLanguages) return normalized as BundledLanguage;
  return 'text';
}

export async function highlight(code: string, lang: string): Promise<string> {
  const resolved = resolveLang(lang);
  const highlighter = await getSingletonHighlighter({
    themes: [THEME],
    langs: PRELOADED_LANGS,
  });

  if (resolved !== 'text' && !highlighter.getLoadedLanguages().includes(resolved)) {
    await highlighter.loadLanguage(resolved);
  }

  return highlighter.codeToHtml(code, {
    lang: resolved,
    theme: THEME,
  });
}
