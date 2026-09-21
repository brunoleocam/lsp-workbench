/**
 * Catálogo local de tabelas (JSON gerado, nunca embutido no VSIX).
 * Path configurável via `lsp.catalog.path` (PDR-009).
 */

export type LocalCatalogColumn = { name: string; type?: string };
export type LocalCatalogTable = {
  name: string;
  description?: string;
  columns: LocalCatalogColumn[];
};
export type LocalCatalog = {
  version: number;
  generatedAt?: string;
  tables: LocalCatalogTable[];
  enums?: unknown[];
};

let cached: { path: string; mtimeMs: number; catalog: LocalCatalog } | undefined;

export function parseLocalCatalogJson(raw: string): LocalCatalog | undefined {
  try {
    const data = JSON.parse(raw) as LocalCatalog;
    if (!data || !Array.isArray(data.tables)) return undefined;
    return {
      version: Number(data.version) || 1,
      generatedAt: data.generatedAt,
      tables: data.tables
        .filter((t) => t && typeof t.name === "string")
        .map((t) => ({
          name: String(t.name).toUpperCase(),
          description: t.description,
          columns: Array.isArray(t.columns)
            ? t.columns
                .filter((c) => c && typeof c.name === "string")
                .map((c) => ({ name: String(c.name), type: c.type }))
            : [],
        })),
      enums: data.enums ?? [],
    };
  } catch {
    return undefined;
  }
}

/** Carrega catálogo de um path no disco (Node fs). Retorna undefined se ausente/inválido. */
export function loadLocalCatalogFromFile(
  fsPath: string,
  readFile: (p: string) => string,
  statMtimeMs: (p: string) => number | undefined
): LocalCatalog | undefined {
  if (!fsPath) return undefined;
  const mtime = statMtimeMs(fsPath);
  if (mtime === undefined) {
    cached = undefined;
    return undefined;
  }
  if (cached && cached.path === fsPath && cached.mtimeMs === mtime) {
    return cached.catalog;
  }
  const catalog = parseLocalCatalogJson(readFile(fsPath));
  if (!catalog) {
    cached = undefined;
    return undefined;
  }
  cached = { path: fsPath, mtimeMs: mtime, catalog };
  return catalog;
}

export function tablesMatchingPrefix(
  catalog: LocalCatalog,
  prefix: string,
  limit = 40
): LocalCatalogTable[] {
  const p = prefix.toUpperCase();
  if (!p) return catalog.tables.slice(0, limit);
  return catalog.tables.filter((t) => t.name.startsWith(p)).slice(0, limit);
}

/** Colunas de uma tabela (nome case-insensitive). */
export function columnsForTable(
  catalog: LocalCatalog,
  tableName: string,
  prefix = "",
  limit = 500
): LocalCatalogColumn[] {
  const t = catalog.tables.find((x) => x.name === tableName.toUpperCase());
  if (!t) return [];
  const p = prefix.toUpperCase();
  const cols = p
    ? t.columns.filter((c) => c.name.toUpperCase().startsWith(p))
    : t.columns;
  return cols.slice(0, limit);
}

/** Export para testes — limpa cache. */
export function clearLocalCatalogCache(): void {
  cached = undefined;
}
