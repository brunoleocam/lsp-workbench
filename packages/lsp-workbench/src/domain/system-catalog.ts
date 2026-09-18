/**
 * Catálogos por sistema adicional (SENIOR sempre; HCM/ACESSO/ERP stubs até extração completa).
 */

import { LSP_FUNCTION_CATALOG } from "../function-catalog";
import type { LspFunctionEntry } from "../function-catalog.types";

export type LspSystem = "" | "HCM" | "ACESSO" | "ERP";

/** Extensões stub — nomes típicos; expandir via extract futuro. */
const HCM_STUB: LspFunctionEntry[] = [
  {
    label: "RetDiaSemana",
    insertText: "RetDiaSemana(${1:vnData}, ${2:vnDia});",
    detail: "HCM · RetDiaSemana",
    documentation: "Retorna dia da semana (catálogo HCM stub).",
    kind: "function",
  },
];

const ACESSO_STUB: LspFunctionEntry[] = [];

const ERP_STUB: LspFunctionEntry[] = [
  {
    label: "BuscarTitEdi",
    insertText: "BuscarTitEdi(${1:vnEmp}, ${2:vnFil}, ${3:vnNum});",
    detail: "ERP · BuscarTitEdi",
    documentation: "Stub ERP — expandir com docs oficiais.",
    kind: "function",
  },
];

export function catalogForSystem(system: LspSystem | string): LspFunctionEntry[] {
  const base = [...LSP_FUNCTION_CATALOG];
  const extra =
    system === "HCM"
      ? HCM_STUB
      : system === "ACESSO"
        ? ACESSO_STUB
        : system === "ERP"
          ? ERP_STUB
          : [];
  const seen = new Set(base.map((e) => e.label.toLowerCase()));
  for (const e of extra) {
    if (!seen.has(e.label.toLowerCase())) {
      base.push(e);
      seen.add(e.label.toLowerCase());
    }
  }
  return base;
}

export function functionsMatchingPrefixForSystem(
  prefix: string,
  system: LspSystem | string,
  limit = 80
): LspFunctionEntry[] {
  const p = prefix.toLowerCase();
  const cat = catalogForSystem(system);
  if (!p) return cat.slice(0, limit);
  return cat.filter((e) => e.label.toLowerCase().startsWith(p)).slice(0, limit);
}
