/**
 * Projeto de relatório multi-arquivo (PDR-008 / ADR-007).
 * Resolução pura — I/O injetado pelo caller.
 */

export type ReportEventKind =
  | "pre-selecao"
  | "selecao"
  | "inicializacao"
  | "finalizacao"
  | "funcoes-globais"
  | "imprimir-pagina"
  | "antes-imprimir"
  | "depois-imprimir"
  | "outro";

export type ReportContext = {
  eventKind: ReportEventKind;
  /** Nomes de pastas em Secoes/ (ex. Detalhe_1). */
  sectionNames: string[];
  /** Tabela base da seção atual (se Detalhe). */
  tabelaBase?: string;
  detalhePrincipal?: string;
};

const DEFINICAO_FILES: Record<string, ReportEventKind> = {
  "pre-selecao.lsp": "pre-selecao",
  "selecao.lsp": "selecao",
  "inicializacao.lsp": "inicializacao",
  "finalizacao.lsp": "finalizacao",
  "funcoes-globais.lsp": "funcoes-globais",
  "imprimir-pagina.lsp": "imprimir-pagina",
};

/** Normaliza path para comparação (/, lower). */
export function normalizeFsPath(p: string): string {
  return p.replace(/\\/g, "/");
}

/**
 * Infere o tipo de evento a partir do caminho relativo ao root do relatório
 * (ex. `Definicao/Pre-Selecao.lsp`, `Secoes/Detalhe_1/antes-imprimir.lsp`).
 */
export function eventKindFromRelPath(relPath: string): ReportEventKind {
  const n = normalizeFsPath(relPath).replace(/^\/+/, "");
  const parts = n.split("/");
  const file = (parts[parts.length - 1] || "").toLowerCase();

  if (parts.length >= 2 && parts[0].toLowerCase() === "definicao") {
    return DEFINICAO_FILES[file] ?? "outro";
  }
  if (parts.length >= 3 && parts[0].toLowerCase() === "secoes") {
    if (file === "antes-imprimir.lsp") return "antes-imprimir";
    if (file === "depois-imprimir.lsp") return "depois-imprimir";
  }
  return "outro";
}

/** Nome da seção a partir de `Secoes/<Nome>/arquivo.lsp`. */
export function sectionNameFromRelPath(relPath: string): string | undefined {
  const n = normalizeFsPath(relPath).replace(/^\/+/, "");
  const parts = n.split("/");
  if (parts.length >= 3 && parts[0].toLowerCase() === "secoes") {
    return parts[1];
  }
  return undefined;
}

/**
 * Layout mínimo de projeto de relatório (PDR-010): `relatorio.json` +
 * `Definicao/` ou `Secoes/`. Não usa nomenclatura Senior (RDCG, RFEX, …).
 */
export function isReportProjectLayout(
  rootDir: string,
  exists: (absPath: string) => boolean
): boolean {
  const root = normalizeFsPath(rootDir).replace(/\/+$/, "");
  const hasMeta =
    exists(`${root}/relatorio.json`) || exists(`${root}\\relatorio.json`);
  if (!hasMeta) return false;
  const hasDefinicao =
    exists(`${root}/Definicao`) ||
    exists(`${root}\\Definicao`) ||
    exists(`${root}/definicao`) ||
    exists(`${root}\\definicao`);
  const hasSecoes =
    exists(`${root}/Secoes`) ||
    exists(`${root}\\Secoes`) ||
    exists(`${root}/secoes`) ||
    exists(`${root}\\secoes`);
  return hasDefinicao || hasSecoes;
}

/**
 * Sobe diretórios a partir de `filePath` até achar um projeto válido
 * (`relatorio.json` + Definicao|Secoes).
 * `exists(absPath)` deve retornar true se o path existir (arquivo ou pasta).
 */
export function findReportRoot(
  filePath: string,
  exists: (absPath: string) => boolean
): string | undefined {
  let dir = normalizeFsPath(filePath);
  // se for arquivo, sobe para pasta
  if (!dir.endsWith("/") && dir.includes(".")) {
    const idx = dir.lastIndexOf("/");
    dir = idx >= 0 ? dir.slice(0, idx) : dir;
  }
  for (let i = 0; i < 12; i++) {
    if (isReportProjectLayout(dir, exists)) {
      return dir;
    }
    const parent = dir.lastIndexOf("/");
    if (parent <= 0) break;
    dir = dir.slice(0, parent);
  }
  return undefined;
}

/** Path sob um root (pasta) ou igual a um arquivo listado. */
export function pathUnderRoots(fileAbs: string, rootsAbs: string[]): boolean {
  const file = normalizeFsPath(fileAbs);
  for (const raw of rootsAbs) {
    const root = normalizeFsPath(raw).replace(/\/+$/, "");
    if (!root) continue;
    if (file === root || file.startsWith(root + "/")) return true;
  }
  return false;
}

export function parseEntradaNomes(raw: string): string[] {
  try {
    const data = JSON.parse(raw) as { parametros?: { nome?: string }[] };
    if (!Array.isArray(data.parametros)) return [];
    return data.parametros
      .map((p) => (p && typeof p.nome === "string" ? p.nome : ""))
      .filter(Boolean);
  } catch {
    return [];
  }
}

export type RelatorioMeta = {
  detalhePrincipal?: string;
  codigo?: string;
  /** Paths relativos ao root do relatório (pastas ou arquivos). */
  contextoExtra?: string[];
};

export function parseRelatorioMeta(raw: string): RelatorioMeta {
  try {
    const data = JSON.parse(raw) as {
      detalhePrincipal?: string;
      codigo?: string;
      contextoExtra?: unknown;
    };
    const extras: string[] = [];
    if (Array.isArray(data.contextoExtra)) {
      for (const item of data.contextoExtra) {
        if (typeof item === "string" && item.trim()) extras.push(item.trim());
      }
    }
    return {
      detalhePrincipal:
        typeof data.detalhePrincipal === "string" ? data.detalhePrincipal : undefined,
      codigo: typeof data.codigo === "string" ? data.codigo : undefined,
      contextoExtra: extras.length ? extras : undefined,
    };
  } catch {
    return {};
  }
}

export function parseSecaoTabelaBase(raw: string): string | undefined {
  try {
    const data = JSON.parse(raw) as { tabelaBase?: string };
    return typeof data.tabelaBase === "string" ? data.tabelaBase : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Monta contexto a partir de paths já lidos (sem fs).
 */
export function buildReportContext(args: {
  relPath: string;
  sectionNames: string[];
  tabelaBase?: string;
  detalhePrincipal?: string;
}): ReportContext {
  return {
    eventKind: eventKindFromRelPath(args.relPath),
    sectionNames: args.sectionNames,
    tabelaBase: args.tabelaBase,
    detalhePrincipal: args.detalhePrincipal,
  };
}

/** APIs que só podem aparecer na Pré-Seleção. */
export const GER_PRESELECAO_ONLY =
  /\b(InsClauSQLWhere|InsClauSQLOrderBy|InsClauSQLGroupBy|InsClauSQLFrom|InsClauSQLField|InsClauSQLCampoDireto|InsSQLWhereSimples|SubstituiFrom|DeleteFieldSQL|DetPrimConector)\s*\(/i;

/** APIs que não devem aparecer na Pré-Seleção. */
export const GER_FORBIDDEN_IN_PRESELECAO = /\b(ListaSecao|AlteraControle)\s*\(/i;

const LISTA_SECAO_CALL = /\bListaSecao\s*\(\s*"([^"]+)"\s*\)/gi;
const INS_SQL_SECTION = /\b(?:InsClauSQL\w+|InsSQLWhereSimples)\s*\(\s*"([^"]+)"/gi;
