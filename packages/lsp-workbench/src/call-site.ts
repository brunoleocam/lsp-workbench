/**
 * Localiza a chamada que envolve um offset (hover e signature help).
 * Ignora parênteses dentro de string e comentário.
 */

import { maskCommentsAndStrings } from "@lsp-workbench/analyzer";

export type CallSite = {
  name: string;
  argIndex: number;
};

function lfOffset(source: string, offset: number): number {
  const head = source.slice(0, Math.max(0, offset));
  const cr = head.match(/\r/g)?.length ?? 0;
  return offset - cr;
}

function maskedSource(source: string): string {
  return maskCommentsAndStrings(source.replace(/\r\n/g, "\n"));
}

/** Identificador colado em `(` — é o nome da função, não um argumento. */
export function isDirectCallee(source: string, nameEndOffset: number): boolean {
  const masked = maskedSource(source);
  let i = lfOffset(source, nameEndOffset);
  while (i < masked.length && (masked[i] === " " || masked[i] === "\t")) i++;
  return masked[i] === "(";
}

/**
 * Chamada cujo parêntese envolve `offset`.
 * `argIndex` é o argumento sob o cursor (0 = primeiro).
 */
export function callSiteAt(source: string, offset: number): CallSite | null {
  const masked = maskedSource(source);
  const pos = Math.min(lfOffset(source, offset), masked.length);

  let depth = 0;
  let open = -1;
  for (let i = pos - 1; i >= 0; i--) {
    const ch = masked[i];
    if (ch === ")") {
      depth++;
      continue;
    }
    if (ch !== "(") continue;
    if (depth === 0) {
      open = i;
      break;
    }
    depth--;
  }
  if (open < 0) return null;

  let i = open - 1;
  while (i >= 0 && /\s/.test(masked[i] ?? "")) i--;
  const nameEnd = i + 1;
  while (i >= 0 && /[A-Za-z0-9_]/.test(masked[i] ?? "")) i--;
  const name = masked.slice(i + 1, nameEnd);
  if (!/^[A-Za-z_][\w]*$/.test(name)) return null;

  let argIndex = 0;
  depth = 0;
  for (let j = open + 1; j < pos; j++) {
    const ch = masked[j];
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    else if (ch === "," && depth === 0) argIndex++;
  }

  return { name, argIndex };
}
