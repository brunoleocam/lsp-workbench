/**
 * Carrega contexto de projeto de relatório a partir do filesystem (extensão).
 */

import * as fs from "node:fs";
import * as path from "node:path";
import {
  buildReportContext,
  findReportRoot,
  normalizeFsPath,
  parseEntradaNomes,
  parseFileSymbols,
  parseRelatorioMeta,
  parseSecaoTabelaBase,
  sectionNameFromRelPath,
  type ReportContext,
} from "@lsp-workbench/analyzer";
import type { ReportScopeOverlay } from "../scope-config";

function existsPath(p: string): boolean {
  try {
    return fs.existsSync(p);
  } catch {
    return false;
  }
}

function readText(p: string): string | undefined {
  try {
    return fs.readFileSync(p, "utf8");
  } catch {
    return undefined;
  }
}

function listSectionDirs(secoesDir: string): string[] {
  try {
    if (!fs.existsSync(secoesDir)) return [];
    return fs
      .readdirSync(secoesDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
  } catch {
    return [];
  }
}

function existsForFinder(p: string): boolean {
  return existsPath(p.replace(/\//g, path.sep));
}

function isLspSourceFile(filePath: string): boolean {
  const lower = filePath.toLowerCase();
  return lower.endsWith(".lsp") || lower.endsWith(".lspt");
}

/** Lista `.lsp`/`.lspt` sob pasta ou inclui o próprio arquivo. */
export function listLspSourcesUnder(absPath: string, depth = 0, out: string[] = []): string[] {
  if (depth > 14 || !existsPath(absPath)) return out;
  let st: fs.Stats;
  try {
    st = fs.statSync(absPath);
  } catch {
    return out;
  }
  if (st.isFile()) {
    if (isLspSourceFile(absPath)) out.push(path.resolve(absPath));
    return out;
  }
  if (!st.isDirectory()) return out;
  let entries: string[];
  try {
    entries = fs.readdirSync(absPath);
  } catch {
    return out;
  }
  for (const name of entries) {
    if (name === "node_modules" || name === ".git") continue;
    listLspSourcesUnder(path.join(absPath, name), depth + 1, out);
  }
  return out;
}

/**
 * `Definir` de escopo de arquivo nos peers (exceto `currentFileAbs`).
 * Usado para SEM001 em projeto de relatório (Inicialização → seções, etc.).
 */
export function collectPeerFileScopeGlobals(
  includeRootsAbs: string[],
  currentFileAbs: string
): string[] {
  const current = path.resolve(currentFileAbs);
  const names = new Set<string>();
  const seenFiles = new Set<string>();

  for (const root of includeRootsAbs) {
    for (const file of listLspSourcesUnder(root)) {
      const resolved = path.resolve(file);
      if (resolved === current) continue;
      const key = resolved.toLowerCase();
      if (seenFiles.has(key)) continue;
      seenFiles.add(key);
      const text = readText(resolved);
      if (!text) continue;
      for (const v of parseFileSymbols(text).variables) {
        if (v.scope === "file" && v.name) names.add(v.name);
      }
    }
  }
  return [...names];
}

function mergeUniqueNames(...lists: readonly (readonly string[])[]): string[] {
  const out = new Set<string>();
  for (const list of lists) {
    for (const n of list) {
      if (n) out.add(n);
    }
  }
  return [...out];
}

export type LoadedReportOpts = {
  reportContext: ReportContext;
  knownGlobals: string[];
  rootDir: string;
};

/** Se o arquivo estiver sob um projeto de relatório válido, retorna opts para analyzeLsp. */
export function loadReportAnalyzeOpts(filePath: string): LoadedReportOpts | undefined {
  const root = findReportRoot(normalizeFsPath(filePath), existsForFinder);
  if (!root) return undefined;

  const rootFs = root.replace(/\//g, path.sep);
  const overlay = loadReportScopeOverlay(filePath);
  const includeRoots = overlay?.includeRootsAbs ?? [rootFs];
  const relatorioRaw = readText(path.join(rootFs, "relatorio.json"));
  const entradaRaw = readText(path.join(rootFs, "Definicao", "Entrada.json"));
  const meta = relatorioRaw ? parseRelatorioMeta(relatorioRaw) : {};
  const entradaNames = entradaRaw ? parseEntradaNomes(entradaRaw) : [];
  const peerNames = collectPeerFileScopeGlobals(includeRoots, filePath);
  const knownGlobals = mergeUniqueNames(entradaNames, peerNames);
  const sectionNames = listSectionDirs(path.join(rootFs, "Secoes"));

  const relPath = path.relative(rootFs, filePath).split(path.sep).join("/");
  const section = sectionNameFromRelPath(relPath);
  let tabelaBase: string | undefined;
  if (section) {
    const secaoRaw = readText(path.join(rootFs, "Secoes", section, "secao.json"));
    if (secaoRaw) tabelaBase = parseSecaoTabelaBase(secaoRaw);
  }

  return {
    rootDir: rootFs,
    knownGlobals,
    reportContext: buildReportContext({
      relPath,
      sectionNames,
      tabelaBase,
      detalhePrincipal: meta.detalhePrincipal,
    }),
  };
}

/**
 * Overlay de escopo de símbolos (PDR-010): root do relatório ∪ `contextoExtra`.
 */
export function loadReportScopeOverlay(filePath: string): ReportScopeOverlay | undefined {
  const root = findReportRoot(normalizeFsPath(filePath), existsForFinder);
  if (!root) return undefined;

  const rootFs = root.replace(/\//g, path.sep);
  const relatorioRaw = readText(path.join(rootFs, "relatorio.json"));
  const meta = relatorioRaw ? parseRelatorioMeta(relatorioRaw) : {};
  const name = meta.codigo?.trim() || path.basename(rootFs);

  const includeRootsAbs: string[] = [rootFs];
  for (const rel of meta.contextoExtra ?? []) {
    const abs = path.resolve(rootFs, rel);
    if (existsPath(abs) && !includeRootsAbs.some((r) => path.resolve(r) === abs)) {
      includeRootsAbs.push(abs);
    }
  }

  return {
    rootAbs: rootFs,
    name,
    includeRootsAbs,
  };
}

/** Grava um path relativo em `contextoExtra` do `relatorio.json`. */
export function appendContextoExtra(reportRootFs: string, extraRelOrAbs: string): string {
  const metaPath = path.join(reportRootFs, "relatorio.json");
  const raw = readText(metaPath);
  if (!raw) throw new Error("relatorio.json não encontrado.");

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    throw new Error("relatorio.json inválido.");
  }

  const abs = path.isAbsolute(extraRelOrAbs)
    ? path.resolve(extraRelOrAbs)
    : path.resolve(reportRootFs, extraRelOrAbs);
  const rel = path.relative(reportRootFs, abs).split(path.sep).join("/");
  if (!rel || rel === ".") {
    throw new Error("Escolha uma pasta ou arquivo fora da raiz do relatório (ex. ../FUNCOES).");
  }

  const current = Array.isArray(data.contextoExtra)
    ? (data.contextoExtra as unknown[]).filter((x): x is string => typeof x === "string")
    : [];
  if (current.some((c) => path.resolve(reportRootFs, c) === abs)) {
    return rel;
  }
  data.contextoExtra = [...current, rel];
  fs.writeFileSync(metaPath, JSON.stringify(data, null, 2) + "\n", "utf8");
  return rel;
}

/** Path absoluto do escopo a exportar: root do relatório ou arquivo/pasta aberta. */
export function sourcePathForExport(filePath: string): { abs: string; label: string; kind: "report" | "file" } {
  const overlay = loadReportScopeOverlay(filePath);
  if (overlay) {
    return { abs: overlay.rootAbs, label: `Relatório · ${overlay.name}`, kind: "report" };
  }
  return {
    abs: path.resolve(filePath),
    label: path.basename(filePath),
    kind: "file",
  };
}
