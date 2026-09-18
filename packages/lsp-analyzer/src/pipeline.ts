/**
 * Pipeline núcleo: tokenize → parse → semantics (ANL*).
 * Separado do index para o lint poder importar sem ciclo.
 */
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
