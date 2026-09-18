/**
 * API pública do analyzer (Opção 2 — PDR-005).
 * Lexer → parser/AST → semantic mínimo. Zero dependência de vscode.
 */

export type {
  AnalyzeOptions,
  AnalyzeResult,
  AstNode,
  Diagnostic,
  FormatOptions,
  Token,
} from "./types";

export { tokenize } from "./lexer";
export { parse } from "./parser";
export { format } from "./format";
export { collectSemantics } from "./semantic";

import { tokenize } from "./lexer";
import { parse } from "./parser";
import { collectSemantics } from "./semantic";
import type { AnalyzeOptions, AnalyzeResult } from "./types";

export function analyze(source: string, opts?: AnalyzeOptions): AnalyzeResult {
  const tokens = tokenize(source);
  const ast = parse(tokens);
  const ignore = new Set((opts?.ignoreIds ?? []).map((x) => x.toUpperCase()));
  const diagnostics = collectSemantics(tokens, ast).filter(
    (d) => !ignore.has(d.id.toUpperCase())
  );
  return { diagnostics, tokens, ast };
}

export const ANALYZER_VERSION = "0.2.0";
