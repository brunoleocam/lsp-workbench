/**
 * Catálogo de funções efetivo (embutido + extra, ADR-009). Módulo sem `vscode`:
 * o loader da extensão grava aqui e completion/hover/signature/diagnóstico leem daqui.
 */
import {
  buildEffectiveFunctionCatalog as buildFromBase,
  type EffectiveCatalogBuild,
  LSP_FUNCTION_CATALOG,
  type LspFunctionEntry,
} from "./function-catalog";

let effective: LspFunctionEntry[] = LSP_FUNCTION_CATALOG;

export function effectiveFunctionCatalog(): LspFunctionEntry[] {
  return effective;
}

/** `undefined` volta ao embutido. */
export function setEffectiveFunctionCatalog(catalog: LspFunctionEntry[] | undefined): void {
  effective = catalog ?? LSP_FUNCTION_CATALOG;
}

export function effectiveFunctionsMatchingPrefix(prefix: string): LspFunctionEntry[] {
  const p = prefix.trim().toLowerCase();
  if (!p) return [];
  return effective
    .filter((e) => e.label.toLowerCase().startsWith(p))
    .sort((a, b) => a.label.localeCompare(b.label, "pt-BR", { sensitivity: "base" }));
}

/** Texto do arquivo extra → catálogo efetivo sobre o embutido. */
export function buildEffectiveFunctionCatalog(raw: string): EffectiveCatalogBuild {
  return buildFromBase(raw, LSP_FUNCTION_CATALOG);
}
