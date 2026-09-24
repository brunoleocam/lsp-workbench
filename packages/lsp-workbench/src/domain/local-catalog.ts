/**
 * Catálogo local de tabelas (JSON gerado, nunca embutido no VSIX).
 * Path configurável via `lsp.catalog.path` (PDR-009).
 */

export type LocalCatalogEnumValue = {
  key: string;
  description?: string;
  order?: number;
};
export type LocalCatalogEnum = {
  name: string;
  values: LocalCatalogEnumValue[];
};
export type LocalCatalogColumn = {
  name: string;
  type?: string;
  mask?: string;
  size?: string;
  decimals?: string;
  description?: string;
  /** Nome da lista (LSTNAM), ex.: LTipPro. */
  enum?: string;
  nullable?: boolean;
  required?: boolean;
  key?: boolean;
};
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
  enums?: LocalCatalogEnum[];
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
                .map((c) => parseColumn(c))
            : [],
        })),
      enums: parseEnums(data.enums),
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

function optionalText(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  const text = raw.trim();
  return text ? text : undefined;
}

function optionalBool(raw: unknown): boolean | undefined {
  return raw === true || raw === false ? raw : undefined;
}

function parseColumn(raw: LocalCatalogColumn): LocalCatalogColumn {
  const column: LocalCatalogColumn = { name: String(raw.name) };
  const type = optionalText(raw.type);
  const mask = optionalText(raw.mask);
  const size = optionalText(raw.size);
  const decimals = optionalText(raw.decimals);
  const description = optionalText(raw.description);
  const enumeration = optionalText(raw.enum);
  if (type) column.type = type;
  if (mask) column.mask = mask;
  if (size) column.size = size;
  if (decimals) column.decimals = decimals;
  if (description) column.description = description;
  if (enumeration) column.enum = enumeration;
  const nullable = optionalBool(raw.nullable);
  const required = optionalBool(raw.required);
  if (nullable !== undefined) column.nullable = nullable;
  if (required !== undefined) column.required = required;
  if (raw.key === true) column.key = true;
  return column;
}

function parseEnums(raw: unknown): LocalCatalogEnum[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const enums: LocalCatalogEnum[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const rec = item as { name?: unknown; values?: unknown };
    const name = optionalText(rec.name);
    if (!name || !Array.isArray(rec.values)) continue;
    const values: LocalCatalogEnumValue[] = [];
    for (const value of rec.values) {
      if (!value || typeof value !== "object") continue;
      const row = value as { key?: unknown; description?: unknown; order?: unknown };
      const key = optionalText(row.key);
      if (!key) continue;
      const description = optionalText(row.description);
      const order = typeof row.order === "number" && Number.isFinite(row.order) ? row.order : undefined;
      values.push({
        key,
        ...(description ? { description } : {}),
        ...(order !== undefined ? { order } : {}),
      });
    }
    enums.push({ name, values });
  }
  return enums.length ? enums : undefined;
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
