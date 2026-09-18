/**
 * Semantic tokens a partir de símbolos do documento (application — sem vscode).
 */

import { parseFileSymbols } from "../document-symbols";

export type TokenType =
  | "function"
  | "variable"
  | "method"
  | "property"
  | "keyword"
  | "type";

export type SemanticToken = {
  line: number;
  startChar: number;
  length: number;
  type: TokenType;
};

const MEMBER_RE = /\b(\w+)\.(AbrirCursor|FecharCursor|Proximo|Achou|NaoAchou|AdicionarCampo|Adicionar|SQL)\b/gi;

export function buildSemanticTokens(source: string): SemanticToken[] {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const tokens: SemanticToken[] = [];
  const sym = parseFileSymbols(source);

  for (const fn of sym.functions) {
    if (!fn.eligible) continue;
    const line = fn.declLine >= 0 ? fn.declLine : fn.implLine;
    if (line < 0 || line >= lines.length) continue;
    const idx = lines[line].toLowerCase().indexOf(fn.name.toLowerCase());
    if (idx < 0) continue;
    tokens.push({
      line,
      startChar: idx,
      length: fn.name.length,
      type: "function",
    });
  }

  for (const v of sym.variables) {
    if (v.line < 0 || v.line >= lines.length) continue;
    const idx = lines[v.line].toLowerCase().indexOf(v.name.toLowerCase());
    if (idx < 0) continue;
    tokens.push({
      line: v.line,
      startChar: idx,
      length: v.name.length,
      type: "variable",
    });
  }

  for (let li = 0; li < lines.length; li++) {
    const raw = lines[li];
    MEMBER_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = MEMBER_RE.exec(raw))) {
      const member = m[2];
      const start = m.index + m[1].length + 1;
      tokens.push({
        line: li,
        startChar: start,
        length: member.length,
        type: /^(SQL|Achou|NaoAchou)$/i.test(member) ? "property" : "method",
      });
    }
  }

  return tokens;
}

/** Legend order for VS Code DocumentSemanticTokensProvider. */
export const SEMANTIC_TOKEN_LEGEND: TokenType[] = [
  "function",
  "variable",
  "method",
  "property",
  "keyword",
  "type",
];

export function encodeSemanticTokens(tokens: SemanticToken[]): number[] {
  const sorted = [...tokens].sort(
    (a, b) => a.line - b.line || a.startChar - b.startChar
  );
  const data: number[] = [];
  let prevLine = 0;
  let prevChar = 0;
  for (const t of sorted) {
    const typeIdx = SEMANTIC_TOKEN_LEGEND.indexOf(t.type);
    if (typeIdx < 0) continue;
    const deltaLine = t.line - prevLine;
    const deltaChar = deltaLine === 0 ? t.startChar - prevChar : t.startChar;
    data.push(deltaLine, deltaChar, t.length, typeIdx, 0);
    prevLine = t.line;
    prevChar = t.startChar;
  }
  return data;
}
