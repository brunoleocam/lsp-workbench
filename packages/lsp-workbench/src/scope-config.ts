/**
 * Configuração de escopo de símbolos (PDR-003 + PDR-010).
 * Puro / testável — paths como string (use `/` ou path.normalize).
 */

export type SymbolScopeMode = "project" | "file" | "mixed";

export type LspContextConfig = {
  name: string;
  rootDir: string;
  filePattern: string;
  includeSubdirectories?: boolean;
  system?: string;
  files?: string[];
  diagnostics?: { ignoreIds?: string[] };
};

export type ScopeSettings = {
  scope: SymbolScopeMode;
  contexts: LspContextConfig[];
  fallbackSystem: string;
};

/** Overlay de projeto de relatório (PDR-010) — vence `lsp.contexts`. */
export type ReportScopeOverlay = {
  rootAbs: string;
  name: string;
  /** Roots absolutos: pasta do relatório + `contextoExtra` resolvidos. */
  includeRootsAbs: string[];
  system?: string;
};

export function normalizePath(p: string): string {
  return p.replace(/\\/g, "/").replace(/\/+$/, "");
}

/** Arquivo sob alguma pasta root, ou igual a um path de arquivo listado. */
export function pathUnderRoots(fileAbs: string, rootsAbs: string[]): boolean {
  const file = normalizePath(fileAbs);
  for (const raw of rootsAbs) {
    const root = normalizePath(raw);
    if (!root) continue;
    if (file === root || file.startsWith(root + "/")) return true;
  }
  return false;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Glob simples: * ** ? e {a,b}; ou `re:…` sobre o nome do arquivo. */
export function matchFilePattern(
  filePath: string,
  pattern: string,
  rootDirAbs: string,
  includeSubdirectories: boolean
): boolean {
  const file = normalizePath(filePath);
  const root = normalizePath(rootDirAbs);
  if (file !== root && !file.startsWith(root + "/")) return false;

  const rel = file === root ? "" : file.slice(root.length + 1);
  const base = rel.includes("/") ? rel.slice(rel.lastIndexOf("/") + 1) : rel;

  if (!includeSubdirectories && rel.includes("/")) return false;

  if (pattern.startsWith("re:")) {
    try {
      return new RegExp(pattern.slice(3)).test(base);
    } catch {
      return false;
    }
  }

  // Expand {lsp,lspt}
  const alts = pattern.match(/^(.+)\{([^}]+)\}(.*)$/);
  if (alts) {
    return alts[2].split(",").some((a) =>
      matchFilePattern(filePath, alts[1] + a.trim() + alts[3], rootDirAbs, includeSubdirectories)
    );
  }

  let rx = "^";
  for (let i = 0; i < pattern.length; i++) {
    const c = pattern[i];
    if (c === "*" && pattern[i + 1] === "*") {
      rx += ".*";
      i++;
      if (pattern[i + 1] === "/") i++;
    } else if (c === "*") {
      rx += "[^/]*";
    } else if (c === "?") {
      rx += "[^/]";
    } else {
      rx += escapeRegex(c);
    }
  }
  rx += "$";
  try {
    return new RegExp(rx, "i").test(rel) || new RegExp(rx, "i").test(base);
  } catch {
    return false;
  }
}

function fileInAllowlist(
  fileAbs: string,
  workspaceRootAbs: string,
  files: string[]
): boolean {
  const file = normalizePath(fileAbs);
  return files.some((f) => {
    const abs = normalizePath(workspaceRootAbs + "/" + f);
    return file === abs || file.endsWith("/" + normalizePath(f));
  });
}

/**
 * Arquivo pertence ao contexto se casa com `filePattern` em `rootDir`
 * **ou** está em `files` (allowlist adicional — união, não substituição).
 */
export function contextContainsFile(
  fileAbs: string,
  workspaceRootAbs: string,
  ctx: LspContextConfig
): boolean {
  const root = normalizePath(
    workspaceRootAbs.replace(/\\/g, "/") + "/" + ctx.rootDir.replace(/\\/g, "/")
  ).replace(/\/+/g, "/");
  const includeSub = ctx.includeSubdirectories !== false;

  if (ctx.files?.length && fileInAllowlist(fileAbs, workspaceRootAbs, ctx.files)) {
    return true;
  }

  return matchFilePattern(fileAbs, ctx.filePattern, root, includeSub);
}

/** Primeiro contexto nomeado que contém o arquivo (D7), ou undefined. */
export function findMatchingContext(
  fileAbs: string,
  workspaceRootAbs: string,
  contexts: LspContextConfig[]
): LspContextConfig | undefined {
  return contexts.find((c) => contextContainsFile(fileAbs, workspaceRootAbs, c));
}

/** Une ignoreIds globais com os do contexto (se houver). */
export function mergeIgnoreIds(
  globalIds: string[] | undefined,
  contextIds: string[] | undefined
): string[] {
  const set = new Set<string>();
  for (const id of globalIds ?? []) {
    if (id) set.add(id);
  }
  for (const id of contextIds ?? []) {
    if (id) set.add(id);
  }
  return [...set];
}

/**
 * Resolve pares do arquivo atual no escopo.
 * - file: só ele (vence overlay de relatório)
 * - reportOverlay (PDR-010): só peers sob root ∪ contextoExtra (vence lsp.contexts)
 * - project sem contexts: todos os candidatos do workspace
 * - project/mixed com contexts: só arquivos do mesmo contexto nomeado; fora → só ele (SingleFile)
 * - mixed sem contexts: só ele
 */
export function resolvePeerFiles(opts: {
  currentFileAbs: string;
  workspaceRootAbs: string;
  candidateFilesAbs: string[];
  settings: ScopeSettings;
  reportOverlay?: ReportScopeOverlay;
}): { mode: "scoped" | "singleFile"; contextName?: string; peers: string[]; system?: string } {
  const { currentFileAbs, workspaceRootAbs, candidateFilesAbs, settings, reportOverlay } = opts;
  const current = normalizePath(currentFileAbs);

  if (settings.scope === "file") {
    return { mode: "singleFile", peers: [current], system: settings.fallbackSystem || undefined };
  }

  if (reportOverlay) {
    const roots = reportOverlay.includeRootsAbs.map(normalizePath);
    const peers = candidateFilesAbs
      .map(normalizePath)
      .filter((f) => pathUnderRoots(f, roots));
    if (!peers.includes(current)) peers.push(current);
    return {
      mode: "scoped",
      contextName: `Relatório · ${reportOverlay.name}`,
      peers,
      system: reportOverlay.system || settings.fallbackSystem || undefined,
    };
  }

  const contexts = settings.contexts ?? [];

  if (settings.scope === "mixed" && contexts.length === 0) {
    return { mode: "singleFile", peers: [current], system: settings.fallbackSystem || undefined };
  }

  if (contexts.length === 0) {
    // project: workspace inteiro
    const peers = candidateFilesAbs.map(normalizePath);
    if (!peers.includes(current)) peers.push(current);
    return { mode: "scoped", peers, system: settings.fallbackSystem || undefined };
  }

  // Isolamento por contexto nomeado
  const matched = contexts.filter((c) =>
    contextContainsFile(current, workspaceRootAbs, c)
  );

  if (matched.length === 0) {
    return { mode: "singleFile", peers: [current], system: settings.fallbackSystem || undefined };
  }

  // D7: um arquivo → um contexto (primeiro match)
  const ctx = matched[0];
  const peers = candidateFilesAbs
    .map(normalizePath)
    .filter((f) => contextContainsFile(f, workspaceRootAbs, ctx));
  if (!peers.includes(current)) peers.push(current);

  return {
    mode: "scoped",
    contextName: ctx.name,
    peers,
    system: ctx.system || settings.fallbackSystem || undefined,
  };
}

export function isLspSourcePath(filePath: string): boolean {
  const p = normalizePath(filePath).toLowerCase();
  return p.endsWith(".lsp") || p.endsWith(".lspt");
}
