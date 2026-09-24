/**
 * Catálogo local de tabelas (JSON gerado, nunca embutido no VSIX).
 * Path configurável via `lsp.catalog.path` (PDR-009).
 */

export type LocalCatalogColumn = { name: string; type?: string; key?: boolean };
export type LocalCatalogTable = {
  name: string;
  description?: string;
  /** Nomes dos campos da chave primária, na ordem do banco. */
  primaryKey?: string[];
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
          primaryKey: parsePrimaryKey(t.primaryKey),
          columns: Array.isArray(t.columns)
            ? t.columns
                .filter((c) => c && typeof c.name === "string")
                .map((c) => ({
                  name: String(c.name),
                  type: c.type,
                  key: c.key === true ? true : undefined,
                }))
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
  const matched = p ? catalog.tables.filter((t) => t.name.startsWith(p)) : catalog.tables;
  return matched.slice(0, limit);
}

function parsePrimaryKey(raw: unknown): string[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const names = raw.filter((x) => typeof x === "string" && x.trim()).map((x) => String(x).trim());
  return names.length ? names : undefined;
}

/**
 * Mantém a ordem do catálogo (FLDORD do banco) e só marca os campos da chave.
 */
export function markCatalogColumns(table: LocalCatalogTable): LocalCatalogColumn[] {
  const pkSet = new Set((table.primaryKey ?? []).map((n) => n.toUpperCase()));
  const seen = new Set<string>();
  const columns: LocalCatalogColumn[] = [];
  for (const c of table.columns) {
    const up = c.name.toUpperCase();
    if (seen.has(up)) continue;
    seen.add(up);
    const key = c.key === true || pkSet.has(up);
    columns.push({ ...c, key: key ? true : undefined });
  }
  return columns;
}

/** Colunas de uma tabela (nome case-insensitive), na ordem do banco. */
export function columnsForTable(
  catalog: LocalCatalog,
  tableName: string,
  prefix = "",
  limit = 500
): LocalCatalogColumn[] {
  const t = catalog.tables.find((x) => x.name === tableName.toUpperCase());
  if (!t) return [];
  const ordered = markCatalogColumns(t);
  const p = prefix.toUpperCase();
  const cols = p ? ordered.filter((c) => c.name.toUpperCase().startsWith(p)) : ordered;
  return cols.slice(0, limit);
}

/** Export para testes — limpa cache. */
export function clearLocalCatalogCache(): void {
  cached = undefined;
}
