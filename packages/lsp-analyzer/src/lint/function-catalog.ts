/**
 * Catálogo de funções LSP para Ctrl+Espaço.
 * Merge: docs/lsp → HCM → ERP → overrides (override vence; docs/lsp vence HCM/ERP no mesmo label).
 */
import { LSP_FUNCTION_CATALOG_GENERATED } from "./function-catalog.generated";
import { LSP_FUNCTION_CATALOG_HCM } from "./function-catalog.hcm.generated";
import { LSP_FUNCTION_CATALOG_ERP } from "./function-catalog.erp.generated";
import { LSP_FUNCTION_CATALOG_OVERRIDES } from "./function-catalog.overrides";
import type { LspFunctionEntry } from "./function-catalog.types";

export type { LspFunctionEntry, LspFunctionSystem } from "./function-catalog.types";

export { LSP_FUNCTION_CATALOG_GENERATED, EXTRACTED_FUNCTION_LABELS } from "./function-catalog.generated";
export { LSP_FUNCTION_CATALOG_HCM, HCM_FUNCTION_LABELS } from "./function-catalog.hcm.generated";
export { LSP_FUNCTION_CATALOG_ERP, ERP_FUNCTION_LABELS } from "./function-catalog.erp.generated";
export { LSP_FUNCTION_CATALOG_OVERRIDES, OVERRIDE_EXTRA_LABELS } from "./function-catalog.overrides";

function mergeCatalog(): LspFunctionEntry[] {
  const byLabel = new Map<string, LspFunctionEntry>();
  // Produto primeiro; plataforma e overrides sobrescrevem docs genéricas de produto.
  for (const e of LSP_FUNCTION_CATALOG_HCM) {
    byLabel.set(e.label.toLowerCase(), e);
  }
  for (const e of LSP_FUNCTION_CATALOG_ERP) {
    byLabel.set(e.label.toLowerCase(), e);
  }
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
  return LSP_FUNCTION_CATALOG.filter((e) => e.label.toLowerCase().startsWith(p)).sort((a, b) =>
    a.label.localeCompare(b.label, "pt-BR", { sensitivity: "base" })
  );
}
