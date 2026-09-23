/**
 * Helpers de escopo agregado + diagnóstico cross-file (PDR-003).
 */

import {
  type CustomFunctionSymbol,
  type FileSymbols,
  parseFileSymbols,
} from "./document-symbols";
import { LSP_FUNCTION_CATALOG } from "./function-catalog";
import { maskCommentsAndStrings } from "./comment-mask";

export type ScopedFunction = CustomFunctionSymbol & {
  uri: string;
  fileName: string;
};

const builtinNames = new Set(LSP_FUNCTION_CATALOG.map((e) => e.label.toLowerCase()));

const CALL_SKIP = new Set(
  [
    "se",
    "senao",
    "enquanto",
    "para",
    "definir",
    "funcao",
    "mensagem",
    "cancel",
    "abrir",
    "fechar",
    "ler",
    "gravar",
    "lernl",
    "gravarnl",
    "inserir",
    "regra",
    "vapara",
    "valret",
    "valstr",
    "erro",
    "advertencia",
    "retorna",
  ].map((s) => s.toLowerCase())
);

export function eligibleFromSymbols(
  symbols: FileSymbols,
  uri: string,
  fileName: string
): ScopedFunction[] {
  return symbols.functions
    .filter((f) => f.eligible)
    .map((f) => ({ ...f, uri, fileName }));
}

export function indexSource(source: string, uri: string, fileName: string): {
  symbols: FileSymbols;
  eligible: ScopedFunction[];
} {
  const symbols = parseFileSymbols(source);
  return { symbols, eligible: eligibleFromSymbols(symbols, uri, fileName) };
}

/** Chamadas `nome(` que não são builtin/keyword (ignora comentarios/strings). */
export function findCustomCalls(
  source: string
): { name: string; line: number; startCol: number; endCol: number }[] {
  const lines = maskCommentsAndStrings(source.replace(/\r\n/g, "\n")).split("\n");
  const out: { name: string; line: number; startCol: number; endCol: number }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*Definir\s+Funcao\b/i.test(line)) continue;
    if (/^\s*Funcao\b/i.test(line)) continue;

    for (const m of line.matchAll(/\b([A-Za-z_][\w]*)\s*\(/g)) {
      const name = m[1];
      const low = name.toLowerCase();
      if (CALL_SKIP.has(low) || builtinNames.has(low)) continue;
      const idx = m.index ?? 0;
      if (idx > 0 && line[idx - 1] === ".") continue;
      out.push({
        name,
        line: i,
        startCol: idx,
        endCol: idx + name.length,
      });
    }
  }
  return out;
}

export function localEligibleNames(symbols: FileSymbols): Set<string> {
  return new Set(
    symbols.functions.filter((f) => f.eligible).map((f) => f.name.toLowerCase())
  );
}

export function mergeEligible(
  local: ScopedFunction[],
  peers: ScopedFunction[],
  currentUri: string
): ScopedFunction[] {
  const map = new Map<string, ScopedFunction>();
  for (const f of [...local, ...peers]) {
    const key = f.name.toLowerCase();
    // Preferir definição local
    if (f.uri === currentUri || !map.has(key)) {
      if (f.uri === currentUri) map.set(key, f);
      else if (!map.has(key)) map.set(key, f);
    }
  }
  // Re-aplicar: local always wins
  for (const f of local) map.set(f.name.toLowerCase(), f);
  return [...map.values()];
}
