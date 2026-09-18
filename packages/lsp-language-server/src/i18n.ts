/**
 * i18n — carrega package.nls*.json (en padrão; pt-BR se locale bater).
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";

const packageRoot = join(__dirname, "..");

let cache: Record<string, string> | undefined;

function readJson(path: string): Record<string, string> {
  return JSON.parse(readFileSync(path, "utf8")) as Record<string, string>;
}

function detectLocale(explicit?: string): string | undefined {
  if (explicit) return explicit.toLowerCase().replace("_", "-");
  const raw = process.env.VSCODE_NLS_CONFIG;
  if (!raw) return undefined;
  try {
    const locale = (JSON.parse(raw) as { locale?: string }).locale;
    return locale?.toLowerCase().replace("_", "-");
  } catch {
    return undefined;
  }
}

/** Locale tipicamente `pt-br`, `pt`, `en`. */
export function loadNls(locale?: string): Record<string, string> {
  if (cache) return cache;
  const loc = detectLocale(locale);

  const enPath = join(packageRoot, "package.nls.json");
  const base = existsSync(enPath) ? readJson(enPath) : {};

  let overlay: Record<string, string> = {};
  if (loc?.startsWith("pt")) {
    const ptPath = join(packageRoot, "package.nls.pt-br.json");
    if (existsSync(ptPath)) overlay = readJson(ptPath);
  }

  cache = { ...base, ...overlay };
  return cache;
}

export function t(key: string, locale?: string): string {
  const map = loadNls(locale);
  return map[key] ?? key;
}

/** Reset cache (testes). */
export function resetNlsCache(): void {
  cache = undefined;
}
