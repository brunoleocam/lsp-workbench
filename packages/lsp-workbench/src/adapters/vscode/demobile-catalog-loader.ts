import * as fs from "node:fs";
import * as path from "node:path";
import * as vscode from "vscode";
import {
  loadDemobileCatalogFromFile,
  tablesMatchingPrefix,
  type DemobileCatalog,
} from "../../domain/demobile-catalog";

const DEFAULT_REL = path.join("docs", "banco-senior", ".generated", "catalog.json");

/** Resolve path absoluto do catálogo local de tabelas (setting ou default na 1ª pasta do workspace). */
export function resolveDemobileCatalogPath(): string | undefined {
  const cfg = vscode.workspace.getConfiguration("lsp");
  const configured = (cfg.get<string>("demobile.catalogPath", "") || "").trim();
  if (configured) {
    if (path.isAbsolute(configured)) return configured;
    const folder = vscode.workspace.workspaceFolders?.[0];
    if (!folder) return undefined;
    return path.join(folder.uri.fsPath, configured);
  }
  const folder = vscode.workspace.workspaceFolders?.[0];
  if (!folder) return undefined;
  return path.join(folder.uri.fsPath, DEFAULT_REL);
}

export function getDemobileCatalog(): DemobileCatalog | undefined {
  const p = resolveDemobileCatalogPath();
  if (!p) return undefined;
  return loadDemobileCatalogFromFile(
    p,
    (fp) => fs.readFileSync(fp, "utf8"),
    (fp) => {
      try {
        return fs.statSync(fp).mtimeMs;
      } catch {
        return undefined;
      }
    }
  );
}

/** Itens de completion para nomes de tabela (quando há catálogo local). */
export function demobileTableCompletions(
  prefix: string
): { label: string; detail: string; documentation?: string }[] {
  const catalog = getDemobileCatalog();
  if (!catalog) return [];
  return tablesMatchingPrefix(catalog, prefix).map((t) => ({
    label: t.name,
    detail: "Tabela (catálogo local)",
    documentation: t.description,
  }));
}
