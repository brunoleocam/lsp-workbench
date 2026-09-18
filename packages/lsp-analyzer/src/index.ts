/**
 * API pública do analyzer (Opção 2 — PDR-005).
 * Lexer → parser/AST → semantic (ANL*) + lint heurístico (analyzeLsp).
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
export { analyze } from "./pipeline";

export * from "./lint/index";

export const ANALYZER_VERSION = "0.3.0";
