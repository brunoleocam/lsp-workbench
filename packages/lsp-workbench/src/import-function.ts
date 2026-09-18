/**
 * Quick Fix FUN009 — importar Decl+Impl (+ LSPDoc) de outro arquivo.
 */

import { findDefinirInsertAfterLine } from "./definir-insert";
import { importBlockFor, type CustomFunctionSymbol } from "./document-symbols";

/** Linha após a qual inserir o bloco importado (antes da 1ª `Funcao` de impl, se houver). */
export function findFunctionImportAfterLine(source: string): number {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  let lastDecl = -1;
  let firstImpl = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*Definir\s+Funcao\b/i.test(lines[i])) lastDecl = i;
    if (firstImpl < 0 && /^\s*Funcao\b/i.test(lines[i]) && !/^\s*Definir\s+Funcao/i.test(lines[i])) {
      firstImpl = i;
    }
  }
  if (lastDecl >= 0) return lastDecl;
  if (firstImpl > 0) return firstImpl - 1;
  return findDefinirInsertAfterLine(source, 0);
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
