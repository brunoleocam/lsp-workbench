/**
 * Semantic tokens a partir de símbolos do documento (application — sem vscode).
 */

import {
  maskCommentsAndStrings,
  matchDefinirWebService,
  parseFileSymbols,
} from "../document-symbols";

export type TokenType =
  | "function"
  | "variable"
  | "method"
  | "property"
  | "keyword"
  | "type"
  | "macro";

export type SemanticToken = {
  line: number;
  startChar: number;
  length: number;
  type: TokenType;
};

const MEMBER_RE =
  /\b(\w+)\.(AbrirCursor|FecharCursor|Proximo|Achou|NaoAchou|UsaAbrangencia|AdicionarCampo|Adicionar|SQL)\b/gi;
const LIST_ACCESS_RE = /\b((?:vl|a)\w+)\.(\w+)\b/gi;
const CURSOR_ACCESS_RE = /\b(Cur_\w+)\.(\w+)\b/gi;
const WS_CHAIN_RE = /\b([A-Za-z_]\w*(?:\.[A-Za-z_]\w*){1,})\b/g;
const LIST_METHODS = new Set(
  [
    "definirCampos",
    "efetivarCampos",
    "adicionarCampo",
    "adicionar",
    "inserir",
    "editar",
    "gravar",
    "cancelar",
    "excluir",
    "primeiro",
    "ultimo",
    "anterior",
    "proximo",
    "setarChave",
    "vaiParaChave",
    "chave",
    "quantidade",
    "posicionar",
    "ordenar",
    "limpar",
  ].map((s) => s.toLowerCase())
);
const CURSOR_METHODS = new Set(
  ["abrirCursor", "fecharCursor", "proximo", "usaAbrangencia"].map((s) =>
    s.toLowerCase()
  )
);
const TYPE_RE = /\b(Alfa|Numero|Data|Lista|Cursor|Tabela|Funcao)\b/gi;
const END_RE = /\bEnd\b/g;
/** Senao antes de Se — evita capturar só o prefixo. */
const FLOW_RE = /\b(Senao|Enquanto|Continue|Para|Pare|Se)\b/gi;
const CALL_RE = /\b([A-Za-z_]\w*)\s*(?=\()/g;
const CONTROL_KW = new Set([
  "se",
  "senao",
  "enquanto",
  "para",
  "funcao",
  "definir",
  "cancel",
  "pare",
  "continue",
  "mensagem",
  "retorna",
  "inicio",
  "fim",
  "fimse",
  "fimenquanto",
]);

function pushToken(
  tokens: SemanticToken[],
  line: number,
  startChar: number,
  length: number,
  type: TokenType
): void {
  if (line < 0 || startChar < 0 || length <= 0) return;
  tokens.push({ line, startChar, length, type });
}

/** Todas as ocorrências de `name` na linha (case-insensitive). */
function findAllNameIndexes(line: string, name: string): number[] {
  const lower = line.toLowerCase();
  const needle = name.toLowerCase();
  const out: number[] = [];
  let from = 0;
  while (from <= lower.length - needle.length) {
    const idx = lower.indexOf(needle, from);
    if (idx < 0) break;
    const before = idx === 0 ? "" : lower[idx - 1];
    const after = lower[idx + needle.length] ?? "";
    const wordBefore = /[a-z0-9_]/i.test(before);
    const wordAfter = /[a-z0-9_]/i.test(after);
    if (!wordBefore && !wordAfter) out.push(idx);
    from = idx + needle.length;
  }
  return out;
}

function collectWebServiceNames(source: string): Set<string> {
  const names = new Set<string>();
  for (const line of source.replace(/\r\n/g, "\n").split("\n")) {
    const ws = matchDefinirWebService(line);
    if (ws) names.add(ws.name.toLowerCase());
  }
  for (const v of parseFileSymbols(source).variables) {
    if (/^webservice$/i.test(v.tipo)) names.add(v.name.toLowerCase());
  }
  // Inferir porta na própria regra: NomePorta.Grid.CriarLinha / NomePorta.Executar
  const inferRe =
    /\b([A-Za-z_]\w+)\.(?:\w+\.)?(CriarLinha|QtdLinhas|LinhaAtual|ModoExecucao|Executar|LimparParamsEntrada|AtivaLimpezaParamEnt|DesatLimpezaParamEnt)\b/gi;
  let im: RegExpExecArray | null;
  while ((im = inferRe.exec(source))) {
    const root = im[1];
    if (/^Cur_/i.test(root)) continue;
    if (/^(vl|a)\w+$/i.test(root) && !/^ws/i.test(root)) continue;
    names.add(root.toLowerCase());
  }
  return names;
}

function isWebServiceRoot(name: string, wsNames: Set<string>): boolean {
  if (wsNames.has(name.toLowerCase())) return true;
  if (/^ws/i.test(name)) return true;
  if (/^Cur_/i.test(name)) return false;
  // Nome da porta na regra editada (PascalCase), ex. PedidoAssitencia.Retorno.NumPed
  return /^[A-Z][A-Za-z0-9_]*$/.test(name);
}

/** Tokeniza cadeia ws.Tabela.Campo — root=variable, meios=type, fim=property. */
function pushWebServiceChain(
  tokens: SemanticToken[],
  line: number,
  start: number,
  chain: string
): void {
  const parts = chain.split(".");
  let offset = start;
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const type: TokenType =
      i === 0 ? "variable" : i === parts.length - 1 ? "property" : "type";
    pushToken(tokens, line, offset, part.length, type);
    offset += part.length + 1;
  }
}

export function buildSemanticTokens(source: string): SemanticToken[] {
  const normalized = source.replace(/\r\n/g, "\n");
  const scanLines = maskCommentsAndStrings(normalized).split("\n");
  const rawLines = normalized.split("\n");
  const tokens: SemanticToken[] = [];
  const sym = parseFileSymbols(source);
  const wsNames = collectWebServiceNames(source);

  const userFnNames = new Set(
    sym.functions
      .filter((fn) => fn.hasDecl || fn.hasImpl)
      .map((fn) => fn.name.toLowerCase())
  );

  for (const fn of sym.functions) {
    if (!fn.hasDecl && !fn.hasImpl) continue;
    for (const lineIdx of [fn.declLine, fn.implLine]) {
      if (lineIdx < 0 || lineIdx >= scanLines.length) continue;
      for (const idx of findAllNameIndexes(scanLines[lineIdx], fn.name)) {
        pushToken(tokens, lineIdx, idx, fn.name.length, "function");
      }
    }
  }

  for (const v of sym.variables) {
    if (v.line < 0 || v.line >= scanLines.length) continue;
    const idx = scanLines[v.line].toLowerCase().indexOf(v.name.toLowerCase());
    if (idx < 0) continue;
    pushToken(tokens, v.line, idx, v.name.length, "variable");
    if (/^webservice$/i.test(v.tipo)) {
      const raw = rawLines[v.line] ?? "";
      const ws = matchDefinirWebService(raw);
      if (ws) {
        const pathIdx = raw.indexOf(ws.typePath);
        if (pathIdx >= 0) {
          pushToken(tokens, v.line, pathIdx, ws.typePath.length, "type");
        }
      }
    }
  }

  for (let li = 0; li < scanLines.length; li++) {
    const scan = scanLines[li];

    TYPE_RE.lastIndex = 0;
    let tm: RegExpExecArray | null;
    while ((tm = TYPE_RE.exec(scan))) {
      pushToken(tokens, li, tm.index, tm[1].length, "type");
    }

    END_RE.lastIndex = 0;
    let em: RegExpExecArray | null;
    while ((em = END_RE.exec(scan))) {
      pushToken(tokens, li, em.index, em[0].length, "keyword");
    }

    FLOW_RE.lastIndex = 0;
    let fm: RegExpExecArray | null;
    while ((fm = FLOW_RE.exec(scan))) {
      pushToken(tokens, li, fm.index, fm[1].length, "macro");
    }

    MEMBER_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = MEMBER_RE.exec(scan))) {
      const owner = m[1];
      const member = m[2];
      const start = m.index + m[1].length + 1;
      // Cur_*.membro já é coberto por CURSOR_ACCESS_RE
      if (/^Cur_/i.test(owner)) continue;
      pushToken(
        tokens,
        li,
        start,
        member.length,
        /^(SQL|Achou|NaoAchou)$/i.test(member) ? "property" : "method"
      );
    }

    CURSOR_ACCESS_RE.lastIndex = 0;
    let cmCur: RegExpExecArray | null;
    while ((cmCur = CURSOR_ACCESS_RE.exec(scan))) {
      const cursorName = cmCur[1];
      const member = cmCur[2];
      pushToken(tokens, li, cmCur.index, cursorName.length, "variable");
      const memStart = cmCur.index + cursorName.length + 1;
      pushToken(
        tokens,
        li,
        memStart,
        member.length,
        CURSOR_METHODS.has(member.toLowerCase()) ? "method" : "property"
      );
    }

    LIST_ACCESS_RE.lastIndex = 0;
    let lm: RegExpExecArray | null;
    while ((lm = LIST_ACCESS_RE.exec(scan))) {
      const listName = lm[1];
      const member = lm[2];
      pushToken(tokens, li, lm.index, listName.length, "variable");
      const memStart = lm.index + listName.length + 1;
      pushToken(
        tokens,
        li,
        memStart,
        member.length,
        LIST_METHODS.has(member.toLowerCase()) ? "method" : "property"
      );
    }

    WS_CHAIN_RE.lastIndex = 0;
    let wm: RegExpExecArray | null;
    while ((wm = WS_CHAIN_RE.exec(scan))) {
      const chain = wm[1];
      const root = chain.split(".")[0] ?? "";
      if (!isWebServiceRoot(root, wsNames)) continue;
      pushWebServiceChain(tokens, li, wm.index, chain);
    }

    CALL_RE.lastIndex = 0;
    let cm: RegExpExecArray | null;
    while ((cm = CALL_RE.exec(scan))) {
      const name = cm[1];
      const key = name.toLowerCase();
      if (CONTROL_KW.has(key)) continue;
      if (!userFnNames.has(key)) continue;
      pushToken(tokens, li, cm.index, name.length, "function");
    }
  }

  return tokens;
}

/** Legend order for VS Code DocumentSemanticTokensProvider. */
export const SEMANTIC_TOKEN_LEGEND: TokenType[] = [
  "function",
  "variable",
  "method",
  "property",
  "keyword",
  "type",
  "macro",
];

export function encodeSemanticTokens(tokens: SemanticToken[]): number[] {
  const sorted = [...tokens].sort(
    (a, b) => a.line - b.line || a.startChar - b.startChar
  );
  const data: number[] = [];
  let prevLine = 0;
  let prevChar = 0;
  for (const t of sorted) {
    const typeIdx = SEMANTIC_TOKEN_LEGEND.indexOf(t.type);
    if (typeIdx < 0) continue;
    const deltaLine = t.line - prevLine;
    const deltaChar = deltaLine === 0 ? t.startChar - prevChar : t.startChar;
    data.push(deltaLine, deltaChar, t.length, typeIdx, 0);
    prevLine = t.line;
    prevChar = t.startChar;
  }
  return data;
}
