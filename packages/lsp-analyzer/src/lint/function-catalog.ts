/**
 * Catálogo de funções LSP para Ctrl+Espaço.
 * Merge: gerado de docs/lsp + overrides curados (override vence).
 */
import { LSP_FUNCTION_CATALOG_GENERATED } from "./function-catalog.generated";
import { LSP_FUNCTION_CATALOG_OVERRIDES } from "./function-catalog.overrides";
import type { LspFunctionEntry } from "./function-catalog.types";

export type { LspFunctionEntry } from "./function-catalog.types";

export { LSP_FUNCTION_CATALOG_GENERATED, EXTRACTED_FUNCTION_LABELS } from "./function-catalog.generated";
export { LSP_FUNCTION_CATALOG_OVERRIDES, OVERRIDE_EXTRA_LABELS } from "./function-catalog.overrides";

function mergeCatalog(): LspFunctionEntry[] {
  const byLabel = new Map<string, LspFunctionEntry>();
  for (const e of LSP_FUNCTION_CATALOG_GENERATED) {
    byLabel.set(e.label.toLowerCase(), e);
  }
  for (const e of LSP_FUNCTION_CATALOG_OVERRIDES) {
    byLabel.set(e.label.toLowerCase(), e);
  }
  return [...byLabel.values()].sort((a, b) => a.label.localeCompare(b.label));
}

export const LSP_FUNCTION_CATALOG: LspFunctionEntry[] = mergeCatalog();

export function functionsMatchingPrefix(prefix: string): LspFunctionEntry[] {
  const p = prefix.trim().toLowerCase();
  if (!p) return [];
  return LSP_FUNCTION_CATALOG.filter((e) => e.label.toLowerCase().startsWith(p)).sort((a, b) => {
    const as = a.label.toLowerCase().startsWith(p) ? a.label.length : 999;
    const bs = b.label.toLowerCase().startsWith(p) ? b.label.length : 999;
    if (as !== bs) return as - bs;
    return a.label.localeCompare(b.label);
  });
}
