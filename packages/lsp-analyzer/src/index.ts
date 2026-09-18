/**
 * API pública do analyzer (Opção 2 — PDR-005).
 * Fundação: tokenize + diagnose sintaxe mínima; semantic completo nas próximas levas.
 */

export type Diagnostic = {
  id: string;
  message: string;
  line: number;
  severity: "error" | "warning";
};

export type Token = {
  kind: string;
  value: string;
  line: number;
  column: number;
};

const KEYWORDS = new Set(
  [
    "se",
    "senao",
    "enquanto",
    "para",
    "funcao",
    "definir",
    "cancel",
    "pare",
    "continue",
    "alfa",
    "numero",
    "data",
    "lista",
    "cursor",
  ].map((k) => k.toLowerCase())
);

/** Lexer mínimo (Opção 2 foundation). */
export function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  for (let li = 0; li < lines.length; li++) {
    const line = lines[li];
    const re = /[A-Za-z_]\w*|\d+\.?\d*|"[^"]*"|[{}();,.=+\-*\/<>]|./g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(line))) {
      const value = m[0];
      if (/^\s$/.test(value)) continue;
      let kind = "punct";
      if (/^"/.test(value)) kind = "string";
      else if (/^\d/.test(value)) kind = "number";
      else if (/^[A-Za-z_]/.test(value))
        kind = KEYWORDS.has(value.toLowerCase()) ? "keyword" : "ident";
      tokens.push({ kind, value, line: li, column: m.index });
    }
  }
  return tokens;
}

/** Diagnósticos mínimos a partir do lexer (unbalanced braces). */
export function analyze(source: string): { diagnostics: Diagnostic[]; tokens: Token[] } {
  const tokens = tokenize(source);
  const diagnostics: Diagnostic[] = [];
  let depth = 0;
  for (const t of tokens) {
    if (t.value === "{") depth++;
    if (t.value === "}") {
      depth--;
      if (depth < 0) {
        diagnostics.push({
          id: "ANL001",
          message: "'}' sem '{' correspondente",
          line: t.line,
          severity: "error",
        });
        depth = 0;
      }
    }
  }
  if (depth > 0) {
    diagnostics.push({
      id: "ANL002",
      message: `'{' sem fechamento (${depth})`,
      line: tokens[tokens.length - 1]?.line ?? 0,
      severity: "error",
    });
  }
  return { diagnostics, tokens };
}

export const ANALYZER_VERSION = "0.1.0";
