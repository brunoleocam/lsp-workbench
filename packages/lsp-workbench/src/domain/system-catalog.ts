/**
 * Catálogos por sistema adicional (SENIOR/vazio = união completa; HCM/ERP filtram produto).
 */

import { LSP_FUNCTION_CATALOG_ERP, LSP_FUNCTION_CATALOG_HCM } from "../function-catalog";
import type { LspFunctionEntry } from "../function-catalog.types";
import { effectiveFunctionCatalog } from "../effective-function-catalog";

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
/** Entrada mesclada com o catálogo extra substitui a versão crua do produto (ADR-009). */
function preferMerged(list: LspFunctionEntry[], all: LspFunctionEntry[]): LspFunctionEntry[] {
  const merged = new Map(
    all.filter((e) => e.origin === "merged").map((e) => [e.label.toLowerCase(), e])
  );
  if (!merged.size) return list;
  return list.map((e) => merged.get(e.label.toLowerCase()) ?? e);
}

export function catalogForSystem(system: LspSystem | string): LspFunctionEntry[] {
  const sys = (system || "").toUpperCase();
  const all = effectiveFunctionCatalog();
  const platform = () => all.filter((e) => !e.system);
  if (sys === "HCM") return preferMerged(mergeUnique(platform(), LSP_FUNCTION_CATALOG_HCM), all);
  if (sys === "ERP") return preferMerged(mergeUnique(platform(), LSP_FUNCTION_CATALOG_ERP), all);
  if (sys === "ACESSO") return mergeUnique(platform(), ACESSO_STUB);
  // vazio / SENIOR / desconhecido → união completa
  return all;
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
