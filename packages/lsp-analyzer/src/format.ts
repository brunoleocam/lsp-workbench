import type { FormatOptions } from "./types";

/**
 * Formatação simples por profundidade de chaves.
 * Ignora chaves dentro de strings e comentários (@…@ e bloco).
 */
export function format(source: string, opts?: FormatOptions): string {
  const indentSize = opts?.indentSize ?? 2;
  const pad = (n: number) => " ".repeat(Math.max(0, n) * indentSize);
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  let depth = 0;
  let inBlockComment = false;
  const out: string[] = [];

  for (const raw of lines) {
    let line = raw;
    let codeForBrace = "";
    let i = 0;
    let inString = false;

    // strip leading indent we'll recompute; keep content
    const trimmed = line.trim();

    // track comments/strings only for brace counting on this line
    while (i < line.length) {
      if (inBlockComment) {
        const end = line.indexOf("*/", i);
        if (end < 0) {
          i = line.length;
          break;
        }
        i = end + 2;
        inBlockComment = false;
        continue;
      }
      const ch = line[i];
      if (!inString && ch === "@") {
        const close = line.indexOf("@", i + 1);
        i = close < 0 ? line.length : close + 1;
        continue;
      }
      if (!inString && ch === "/" && line[i + 1] === "*") {
        inBlockComment = true;
        i += 2;
        continue;
      }
      if (ch === '"') {
        inString = !inString;
        i++;
        continue;
      }
      if (!inString && (ch === "{" || ch === "}")) {
        codeForBrace += ch;
      }
      i++;
    }

    const closes = (codeForBrace.match(/\}/g) || []).length;
    const opens = (codeForBrace.match(/\{/g) || []).length;

    // linha que começa com } reduz antes de indentar
    const leadingCloses = /^\s*\}/.test(line) ? 1 : 0;
    const indentDepth = Math.max(0, depth - leadingCloses);
    out.push(trimmed.length === 0 ? "" : pad(indentDepth) + trimmed);

    depth += opens - closes;
    if (depth < 0) depth = 0;
  }

  return out.join("\n");
}
