import * as path from "node:path";

export type CatalogProviderExtension = {
  id: string;
  extensionPath: string;
  packageJSON: unknown;
};

export type FunctionsCatalogDiscovery = {
  path?: string;
  /** `setting` ou `extension:<id>`. */
  source?: string;
  /** IDs de outras extensões que também declaram catálogo (não entram no merge). */
  ignored: string[];
};

function declaredCatalog(packageJSON: unknown): string | undefined {
  if (typeof packageJSON !== "object" || packageJSON === null) return undefined;
  const lw = (packageJSON as { lspWorkbench?: unknown }).lspWorkbench;
  if (typeof lw !== "object" || lw === null) return undefined;
  const value = (lw as { functionsCatalog?: unknown }).functionsCatalog;
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

/** ADR-009 §2: `lsp.functions.path`, depois extensões com `lspWorkbench.functionsCatalog` por ID. */
export function resolveFunctionsCatalogPath(input: {
  settingPath?: string;
  workspaceRoot?: string;
  extensions: readonly CatalogProviderExtension[];
  exists: (p: string) => boolean;
}): FunctionsCatalogDiscovery {
  const setting = input.settingPath?.trim();
  if (setting) {
    const resolved = path.isAbsolute(setting)
      ? setting
      : path.resolve(input.workspaceRoot ?? process.cwd(), setting);
    if (input.exists(resolved)) return { path: resolved, source: "setting", ignored: [] };
  }

  const candidates = input.extensions
    .map((e) => {
      const rel = declaredCatalog(e.packageJSON);
      return rel ? { id: e.id, file: path.resolve(e.extensionPath, rel) } : undefined;
    })
    .filter((c): c is { id: string; file: string } => !!c && input.exists(c.file))
    .sort((a, b) => a.id.localeCompare(b.id));

  const [first, ...rest] = candidates;
  if (!first) return { ignored: [] };
  return { path: first.file, source: `extension:${first.id}`, ignored: rest.map((c) => c.id) };
}
