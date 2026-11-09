import { readFileSync } from "node:fs";
import {
  buildEffectiveFunctionCatalog,
  LSP_FUNCTION_CATALOG,
  type LspFunctionEntry,
} from "@lsp-workbench/analyzer";

/** Catálogo extra (ADR-009) lido no processo do server/worker; falha = só o embutido. */
export function loadFunctionCatalog(path: string | undefined): {
  catalog: LspFunctionEntry[] | undefined;
  message: string | undefined;
} {
  if (!path) return { catalog: undefined, message: undefined };
  let raw: string;
  try {
    raw = readFileSync(path, "utf8");
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    return { catalog: undefined, message: `catálogo de funções ${path} ilegível: ${reason}` };
  }
  const built = buildEffectiveFunctionCatalog(raw, LSP_FUNCTION_CATALOG);
  if (built.error) {
    return { catalog: undefined, message: `catálogo de funções ${path} ignorado: ${built.error}` };
  }
  return {
    catalog: built.catalog,
    message: `catálogo de funções ${path}: ${built.extraCount} funções`,
  };
}
