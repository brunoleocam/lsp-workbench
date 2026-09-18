/**
 * Catálogo local de tabelas (JSON gerado, nunca embutido no VSIX).
 * Path configurável via setting de catálogo na extensão.
 */

export type DemobileColumn = { name: string; type?: string };
export type DemobileTable = {
  name: string;
  description?: string;
  columns: DemobileColumn[];
};
export type DemobileCatalog = {
  version: number;
  generatedAt?: string;
  tables: DemobileTable[];
  enums?: unknown[];
};

let cached: { path: string; mtimeMs: number; catalog: DemobileCatalog } | undefined;

export function parseDemobileCatalogJson(raw: string): DemobileCatalog | undefined {
  try {
    const data = JSON.parse(raw) as DemobileCatalog;
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
export function loadDemobileCatalogFromFile(
  fsPath: string,
  readFile: (p: string) => string,
  statMtimeMs: (p: string) => number | undefined
): DemobileCatalog | undefined {
  if (!fsPath) return undefined;
  const mtime = statMtimeMs(fsPath);
  if (mtime === undefined) {
    cached = undefined;
    return undefined;
  }
  if (cached && cached.path === fsPath && cached.mtimeMs === mtime) {
    return cached.catalog;
  }
  const catalog = parseDemobileCatalogJson(readFile(fsPath));
  if (!catalog) {
    cached = undefined;
    return undefined;
  }
  cached = { path: fsPath, mtimeMs: mtime, catalog };
  return catalog;
}

export function tablesMatchingPrefix(
  catalog: DemobileCatalog,
  prefix: string,
  limit = 40
): DemobileTable[] {
  const p = prefix.toUpperCase();
  if (!p) return catalog.tables.slice(0, limit);
  return catalog.tables.filter((t) => t.name.startsWith(p)).slice(0, limit);
}

/** Export para testes — limpa cache. */
export function clearDemobileCatalogCache(): void {
  cached = undefined;
}
