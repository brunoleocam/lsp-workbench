/**
 * Catálogos por sistema adicional (SENIOR/vazio = união completa; HCM/ERP filtram produto).
 */

import {
  LSP_FUNCTION_CATALOG,
  LSP_FUNCTION_CATALOG_ERP,
  LSP_FUNCTION_CATALOG_HCM,
} from "../function-catalog";
import type { LspFunctionEntry } from "../function-catalog.types";

export type LspSystem = "" | "HCM" | "ACESSO" | "ERP";

const ACESSO_STUB: LspFunctionEntry[] = [];

function mergeUnique(base: LspFunctionEntry[], extra: LspFunctionEntry[]): LspFunctionEntry[] {
  const byLabel = new Map<string, LspFunctionEntry>();
  for (const e of base) byLabel.set(e.label.toLowerCase(), e);
  for (const e of extra) {
    const k = e.label.toLowerCase();
    if (!byLabel.has(k)) byLabel.set(k, e);
  }
  return [...byLabel.values()].sort((a, b) =>
    a.label.localeCompare(b.label, "pt-BR", { sensitivity: "base" })
  );
}

/**
 * - `""` / SENIOR: catálogo unificado (plataforma + HCM + ERP) — máxima cobertura.
 * - `HCM`: plataforma + funções do índice HCM (já inclusas no unificado; filtro por system tag + base).
 * - `ERP`: plataforma + funções do índice ERP.
 * - `ACESSO`: plataforma (+ stub vazio).
 */
export function catalogForSystem(system: LspSystem | string): LspFunctionEntry[] {
  const sys = (system || "").toUpperCase();
  if (sys === "HCM") {
    const platform = LSP_FUNCTION_CATALOG.filter((e) => !e.system);
    return mergeUnique(platform, LSP_FUNCTION_CATALOG_HCM);
  }
  if (sys === "ERP") {
    const platform = LSP_FUNCTION_CATALOG.filter((e) => !e.system);
    return mergeUnique(platform, LSP_FUNCTION_CATALOG_ERP);
  }
  if (sys === "ACESSO") {
    const platform = LSP_FUNCTION_CATALOG.filter((e) => !e.system);
    return mergeUnique(platform, ACESSO_STUB);
  }
  // vazio / SENIOR / desconhecido → união completa
  return LSP_FUNCTION_CATALOG;
}

export function functionsMatchingPrefixForSystem(
  prefix: string,
  system: LspSystem | string,
  limit = 80
): LspFunctionEntry[] {
  const p = prefix.toLowerCase();
  const cat = catalogForSystem(system);
  if (!p) return cat.slice(0, limit);
  return cat
    .filter((e) => e.label.toLowerCase().startsWith(p))
    .sort((a, b) => a.label.localeCompare(b.label, "pt-BR", { sensitivity: "base" }))
    .slice(0, limit);
}
