import * as fs from "node:fs";
import * as path from "node:path";
import * as vscode from "vscode";
import {
  loadLocalCatalogFromFile,
  tablesMatchingPrefix,
  columnsForTable,
  type LocalCatalog,
  type LocalCatalogColumn,
  type LocalCatalogEnum,
} from "../../domain/local-catalog";
import { loadReportAnalyzeOpts } from "../../domain/report-project-loader";

/** Overlay (cliente) depois base pública (PDR-009). */
const DEFAULT_RELATIVE_CANDIDATES = [
  path.join("docs", "banco-senior", ".generated", "catalog.json"),
  path.join("docs", "banco-senior-base", ".generated", "catalog.json"),
  path.join("docs", "banco-senior-base", "catalog.json"),
  // Demo / F5 / marketplace prints (repo público só versiona o exemplo)
  path.join("docs", "banco-senior-base", "catalog.example.json"),
];

function fileExists(p: string): boolean {
  try {
    return fs.existsSync(p);
  } catch {
    return false;
  }
}

/** Sobe pastas a partir de `start` procurando docs/banco-senior(-base)/catalog.json. */
function findCatalogWalkingUp(startDir: string, maxLevels = 8): string | undefined {
  let dir = path.resolve(startDir);
  for (let i = 0; i < maxLevels; i++) {
    for (const rel of DEFAULT_RELATIVE_CANDIDATES) {
      const abs = path.join(dir, rel);
      if (fileExists(abs)) return abs;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return undefined;
}

/**
 * Resolve path absoluto do catálogo local (PDR-009).
 * Preferência: `lsp.catalog.path`; fallback deprecado: `lsp.demobile.catalogPath`.
 */
export function resolveLocalCatalogPath(): string | undefined {
  const cfg = vscode.workspace.getConfiguration("lsp");
  const configured = (
    cfg.get<string>("catalog.path", "") ||
    cfg.get<string>("demobile.catalogPath", "") ||
    ""
  ).trim();
  const folder = vscode.workspace.workspaceFolders?.[0];

  if (configured) {
    if (path.isAbsolute(configured)) {
      return fileExists(configured) ? configured : undefined;
    }
    if (!folder) return undefined;
    const abs = path.join(folder.uri.fsPath, configured);
    return fileExists(abs) ? abs : undefined;
  }

  if (folder) {
    for (const rel of DEFAULT_RELATIVE_CANDIDATES) {
      const abs = path.join(folder.uri.fsPath, rel);
      if (fileExists(abs)) return abs;
    }
    // F5 abre só packages/lsp-workbench/fixtures — sobe até a raiz do monorepo
    const walked = findCatalogWalkingUp(folder.uri.fsPath);
    if (walked) return walked;
  }

  return undefined;
}

export function getLocalCatalog(): LocalCatalog | undefined {
  const p = resolveLocalCatalogPath();
  if (!p) return undefined;
  return loadLocalCatalogFromFile(
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

function columnDetail(base: string, type: string | undefined, key: boolean | undefined): string {
  const body = type ? `${base} · ${type}` : base;
  return key ? `Chave · ${body}` : body;
}

function enumByName(catalog: LocalCatalog, name: string | undefined): LocalCatalogEnum | undefined {
  if (!name || !catalog.enums) return undefined;
  const key = name.toUpperCase();
  return catalog.enums.find((item) => item.name.toUpperCase() === key);
}

/** Texto do painel de detalhe: tipo, máscara, tamanho, descrição, lista e nulo/obrigatório. */
function columnDocumentation(catalog: LocalCatalog, column: LocalCatalogColumn): string | undefined {
  const lines: string[] = [];
  if (column.description) lines.push(column.description, "");
  const facts: string[] = [];
  if (column.type) facts.push(`- **Tipo:** ${column.type}`);
  if (column.mask) facts.push(`- **Máscara:** ${column.mask}`);
  if (column.size) facts.push(`- **Tamanho:** ${column.size}`);
  if (column.decimals) facts.push(`- **Decimais:** ${column.decimals}`);
  if (column.nullable !== undefined) facts.push(`- **Nulo:** ${column.nullable ? "Sim" : "Não"}`);
  if (column.required !== undefined) {
    facts.push(`- **Obrigatório:** ${column.required ? "Sim" : "Não"}`);
  }
  lines.push(...facts);
  const enumeration = enumByName(catalog, column.enum);
  if (column.enum) {
    if (lines.length && lines[lines.length - 1] !== "") lines.push("");
    lines.push(`**Enumeração** ${column.enum}`);
    const values = [...(enumeration?.values ?? [])].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0) || a.key.localeCompare(b.key)
    );
    for (const value of values) {
      const order = value.order !== undefined ? ` (${value.order})` : "";
      lines.push(`- \`${value.key}\` — ${value.description ?? ""}${order}`);
    }
  }
  const text = lines.join("\n").trim();
  return text || undefined;
}

/** Itens de completion para nomes de tabela (quando há catálogo local). */
export function localTableCompletions(
  prefix: string
): { label: string; detail: string; documentation?: string }[] {
  const catalog = getLocalCatalog();
  if (!catalog) return [];
  return tablesMatchingPrefix(catalog, prefix).map((t) => ({
    label: t.name,
    detail: "Tabela (catálogo local)",
    documentation: t.description,
  }));
}

/**
 * Colunas: `E012FAM.` ou prefixo livre quando o arquivo está em seção com tabelaBase.
 */
export function localColumnCompletions(
  filePath: string,
  linePrefix: string
): { label: string; insertText: string; detail: string; documentation?: string; key?: boolean }[] {
  const catalog = getLocalCatalog();
  if (!catalog) return [];

  const dotted = linePrefix.match(
    /\b((?:E|R)\d{3}[A-Za-z0-9]+|USU_[A-Za-z][A-Za-z0-9_]*)\s*\.\s*([A-Za-z0-9_]*)$/
  );
  if (dotted) {
    const table = dotted[1];
    const colPrefix = dotted[2] || "";
    return columnsForTable(catalog, table, colPrefix).map((c) => ({
      label: c.name,
      insertText: c.name,
      key: c.key === true,
      detail: columnDetail(`${table}.${c.name}`, c.type, c.key),
      documentation: columnDocumentation(catalog, c),
    }));
  }

  const report = loadReportAnalyzeOpts(filePath);
  const tabelaBase = report?.reportContext.tabelaBase?.trim();
  if (!tabelaBase) return [];

  const word = linePrefix.match(/([A-Za-z0-9_]+)$/);
  const prefix = word?.[1] || "";
  if (prefix.length < 1) return [];

  return columnsForTable(catalog, tabelaBase, prefix).map((c) => ({
    label: `${tabelaBase}.${c.name}`,
    insertText: `${tabelaBase}.${c.name}`,
    key: c.key === true,
    detail: columnDetail("Campo (tabelaBase da seção)", c.type, c.key),
    documentation: columnDocumentation(catalog, c),
  }));
}

/** True quando o cursor está em `E012FAM.` / `E012FAM.Cod` (modo só-campos). */
export function isTableColumnCompletionContext(linePrefix: string): boolean {
  return /\b((?:E|R)\d{3}[A-Za-z0-9]+|USU_[A-Za-z][A-Za-z0-9_]*)\s*\.\s*[A-Za-z0-9_]*$/.test(
    linePrefix
  );
}
