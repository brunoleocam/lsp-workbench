/**
 * Outline / document symbols (application — sem vscode).
 */

import { parseFileSymbols } from "../document-symbols";

export type OutlineKind = "function" | "variable";

export type OutlineItem = {
  name: string;
  kind: OutlineKind;
  detail: string;
  line: number;
};

export function buildOutline(source: string): OutlineItem[] {
  const sym = parseFileSymbols(source);
  const items: OutlineItem[] = [];

  for (const fn of sym.functions) {
    const line = fn.declLine >= 0 ? fn.declLine : fn.implLine;
    items.push({
      name: fn.name,
      kind: "function",
      detail: fn.signature || (fn.eligible ? "elegível" : "incompleta"),
      line: Math.max(0, line),
    });
  }

  for (const v of sym.variables) {
    if (v.scope !== "file") continue;
    items.push({
      name: v.name,
      kind: "variable",
      detail: v.tipo,
      line: v.line,
    });
  }

  return items.sort((a, b) => a.line - b.line);
}
