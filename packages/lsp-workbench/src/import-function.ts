/**
 * Quick Fix FUN009 — importar Decl+Impl (+ LSPDoc) de outro arquivo.
 */

import { findDefinirFuncaoInsertAfterLine } from "./definir-insert";
import { importBlockFor, type CustomFunctionSymbol } from "./document-symbols";

/** Linha após a qual inserir o bloco importado (fim do bloco Definir, incl. Funcao). */
export function findFunctionImportAfterLine(source: string): number {
  return findDefinirFuncaoInsertAfterLine(source);
}

export function applyImportCustomFunction(
  source: string,
  fn: CustomFunctionSymbol
): string {
  const block = importBlockFor(fn).trimEnd() + "\n\n";
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const after = findFunctionImportAfterLine(source);
  lines.splice(after + 1, 0, ...block.replace(/\r\n/g, "\n").split("\n"));
  return lines.join("\n");
}
