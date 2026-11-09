/**
 * Dicionário e cursores (PDR-012 etapa 6b, REQ-060..064): DEM002, DEM003, SQL012..SQL015, SEM007.
 * O SELECT só é lido quando o `.SQL` recebe literais (`"…"` ou `"…" + "…"`); SQL por variável
 * desliga a checagem de campos do cursor.
 */
import { tokenize } from "../lexer";
import type { Token } from "../types";
import { maskCommentsAndStrings } from "./comment-mask";
import {
  ATRIBUIR_CAMPO_CURSOR_MESSAGE,
  campoForaDoSelectMessage,
  campoNaoEncontradoMessage,
  campoNaoEncontradoNaTabelaMessage,
  campoRepetidoMessage,
  cursorSemSqlMessage,
  parametroSqlNaoDeclaradoMessage,
} from "./compiler-messages";
import { collectDeclarations } from "./declared-types";
import type { DiagnosticHit } from "./diagnostics";

export type DictionaryCheckOptions = {
  /** `TABELA` → `CAMPO`s, tudo em maiúsculas, do catálogo de banco. */
  tableColumns?: ReadonlyMap<string, ReadonlySet<string>>;
};

/** Membros de cursor que não são campo (lista do compilador, via `cursor-senior-lsp`). */
const CURSOR_MEMBERS = new Set([
  "sql",
  "abrircursor",
  "fecharcursor",
  "achou",
  "naoachou",
  "proximo",
  "usaabrangencia",
  "usatraducao",
  "executar",
  "alterar",
  "inserir",
  "excluir",
  "comecar",
  "gravar",
  "regravar",
]);

const FROM_KEYWORDS = new Set(["INNER", "LEFT", "RIGHT", "FULL", "CROSS", "OUTER", "JOIN", "ON", "AS", "WHERE"]);

/** Trecho literal do SQL: `start` = deslocamento no texto juntado. */
type SqlPiece = { token: Token; start: number };

type SqlText = { text: string; pieces: SqlPiece[] };

type CursorState = {
  name: string;
  hasSql: boolean;
  /** União das colunas de todos os SELECT; `undefined` = algum SQL não pôde ser lido. */
  columns: Set<string> | undefined;
};

function isVal(t: Token | undefined, v: string): boolean {
  return !!t && t.kind === "punct" && t.value === v;
}

function isName(t: Token | undefined): t is Token {
  return !!t && (t.kind === "ident" || t.kind === "keyword");
}

function adjacent(a: Token, b: Token | undefined): boolean {
  return !!b && b.line === a.line && b.column === a.column + a.value.length;
}

/** `=` (não `==`), `+=`, `-=`, `*=`, `/=`, `++`, `--` a partir de `t`. */
function isAssignmentAt(toks: Token[], i: number): boolean {
  const t = toks[i];
  const n = toks[i + 1];
  if (isVal(t, "=")) return !(isVal(n, "=") && adjacent(t, n));
  if (!t || t.kind !== "punct" || !n || n.kind !== "punct" || !adjacent(t, n)) return false;
  const op = t.value + n.value;
  return op === "+=" || op === "-=" || op === "*=" || op === "/=" || op === "++" || op === "--";
}

/** Miolo da string sem as aspas, com `\` virando espaço (deslocamentos preservados). */
function stringBody(token: Token): string {
  const raw = token.value;
  const end = raw.length > 1 && raw.endsWith('"') ? raw.length - 1 : raw.length;
  return raw.slice(1, end).replace(/\\/g, " ");
}

/** Literais `"…" [+ "…"]*` entre `start` e o `;`; `undefined` se houver qualquer outra coisa. */
function readSqlLiterals(toks: Token[], start: number): SqlText | undefined {
  const pieces: SqlPiece[] = [];
  let text = "";
  let i = start;
  for (;;) {
    const t = toks[i];
    if (!t || t.kind !== "string") return undefined;
    if (text) text += " ";
    pieces.push({ token: t, start: text.length });
    text += stringBody(t);
    i++;
    if (isVal(toks[i], ";")) return { text, pieces };
    if (!isVal(toks[i], "+")) return undefined;
    i++;
  }
}

/** Linha e coluna de um deslocamento do texto juntado. */
function sqlPosition(sql: SqlText, offset: number): { line: number; col: number } {
  let piece = sql.pieces[0];
  for (const p of sql.pieces) if (p.start <= offset) piece = p;
  const raw = piece.token.value;
  let line = piece.token.line;
  let col = piece.token.column;
  const target = offset - piece.start + 1;
  for (let k = 0; k < target && k < raw.length; k++) {
    if (raw[k] === "\n") {
      line++;
      col = 0;
    } else {
      col++;
    }
  }
  return { line, col };
}

/** Troca o conteúdo de `'…'` por espaços. */
function blankQuoted(sql: string): string {
  return sql.replace(/'[^']*'/g, (m) => " ".repeat(m.length));
}

/** Troca o conteúdo de parênteses (subconsultas, argumentos) por espaços, mantendo `(` e `)` externos. */
function blankParens(sql: string): string {
  let out = "";
  let depth = 0;
  for (const ch of sql) {
    if (ch === "(") {
      out += depth === 0 ? "(" : " ";
      depth++;
    } else if (ch === ")") {
      depth = Math.max(0, depth - 1);
      out += depth === 0 ? ")" : " ";
    } else {
      out += depth > 0 ? (ch === "\n" ? "\n" : " ") : ch;
    }
  }
  return out;
}

type SelectColumn = {
  /** Nome pelo qual o cursor expõe a coluna; `undefined` = expressão sem apelido. */
  name?: string;
  nameOffset: number;
  star: boolean;
  /** `TABELA.COLUNA` ou `COLUNA` simples (sem apelido de expressão). */
  ref?: { qualifier?: string; column: string; offset: number };
};

type SelectInfo = {
  columns: SelectColumn[];
  /** apelido ou nome → tabela (maiúsculas) */
  tables: Map<string, string>;
  /** FROM com algo que não é nome de tabela (subconsulta). */
  opaqueSource: boolean;
};

function parseSelect(sql: string): SelectInfo | undefined {
  const plain = blankParens(blankQuoted(sql));
  const head = /^\s*select\s+(?:distinct\s+)?/i.exec(plain);
  if (!head) return undefined;
  const colsStart = head[0].length;
  const from = /\sfrom\s/i.exec(plain.slice(colsStart));
  if (!from) return undefined;
  const colsText = plain.slice(colsStart, colsStart + from.index);
  const sourceStart = colsStart + from.index + from[0].length;
  const tail = /\s(?:where|order|group|union|having)\s/i.exec(plain.slice(sourceStart));
  const source = plain.slice(sourceStart, tail ? sourceStart + tail.index : plain.length);

  const tables = new Map<string, string>();
  let opaqueSource = false;
  for (const segment of source.split(/,|\bjoin\b/i)) {
    const words = segment
      .replace(/\bon\b[\s\S]*$/i, "")
      .trim()
      .split(/\s+/)
      .filter((w) => w && !FROM_KEYWORDS.has(w.toUpperCase()));
    if (!words.length) continue;
    if (!/^[A-Za-z_]\w*$/.test(words[0])) {
      opaqueSource = true;
      continue;
    }
    const table = words[0].toUpperCase();
    tables.set(table, table);
    if (words[1] && /^[A-Za-z_]\w*$/.test(words[1])) tables.set(words[1].toUpperCase(), table);
  }

  const columns: SelectColumn[] = [];
  let offset = colsStart;
  for (const part of colsText.split(",")) {
    const lead = part.length - part.trimStart().length;
    const body = part.trim();
    const bodyOffset = offset + lead;
    offset += part.length + 1;
    if (!body) continue;
    if (body === "*" || body.endsWith(".*")) {
      columns.push({ nameOffset: bodyOffset, star: true });
      continue;
    }
    const alias = /(?:\s+as)?\s+([A-Za-z_]\w*)$/i.exec(body);
    const expr = alias ? body.slice(0, alias.index).trim() : body;
    const simple = /^(?:([A-Za-z_]\w*)\.)?([A-Za-z_]\w*)$/.exec(expr);
    const ref = simple
      ? {
          qualifier: simple[1]?.toUpperCase(),
          column: simple[2].toUpperCase(),
          offset: bodyOffset + (simple[1] ? simple[1].length + 1 : 0),
        }
      : undefined;
    if (alias && expr) {
      const aliasOffset = bodyOffset + alias.index + alias[0].length - alias[1].length;
      columns.push({ name: alias[1].toUpperCase(), nameOffset: aliasOffset, star: false, ref });
    } else if (ref) {
      columns.push({ name: ref.column, nameOffset: ref.offset, star: false, ref });
    } else {
      columns.push({ nameOffset: bodyOffset, star: false });
    }
  }
  return { columns, tables, opaqueSource };
}

export function collectDictionaryHits(source: string, opts: DictionaryCheckOptions = {}): DiagnosticHit[] {
  const text = source.replace(/\r\n/g, "\n");
  const decl = collectDeclarations(maskCommentsAndStrings(text));
  const toks = tokenize(text);
  const hits: DiagnosticHit[] = [];
  const tableColumns = opts.tableColumns;

  const push = (
    id: string,
    message: string,
    severity: "error" | "warning",
    line: number,
    startCol: number,
    endCol: number
  ): void => {
    hits.push({ id, message, line, severity, startCol, endCol });
  };

  const usedNames = new Set<string>();
  for (const t of toks) if (t.kind === "ident") usedNames.add(t.value.toLowerCase());

  const cursors = new Map<string, CursorState>();
  const fieldUses: { cursor: string; member: Token }[] = [];

  const checkSql = (cursor: CursorState, sql: SqlText): void => {
    const quoted = blankQuoted(sql.text);
    for (const m of quoted.matchAll(/(^|[^:\w]):([A-Za-z_]\w*)/g)) {
      if (usedNames.has(m[2].toLowerCase())) continue;
      const start = (m.index ?? 0) + m[1].length;
      const pos = sqlPosition(sql, start);
      push("SQL015", parametroSqlNaoDeclaradoMessage(m[2]), "warning", pos.line, pos.col, pos.col + m[2].length + 1);
    }

    const select = parseSelect(sql.text);
    if (!select) {
      cursor.columns = undefined;
      return;
    }
    const distinctTables = new Set(select.tables.values());
    const seen = new Set<string>();
    let readable = true;
    const names: string[] = [];
    for (const col of select.columns) {
      if (col.star || !col.name) {
        readable = false;
      } else {
        if (seen.has(col.name)) {
          const pos = sqlPosition(sql, col.nameOffset);
          push("SQL013", campoRepetidoMessage(col.name, cursor.name), "warning", pos.line, pos.col, pos.col + col.name.length);
        }
        seen.add(col.name);
        names.push(col.name);
      }
      if (!tableColumns || !col.ref) continue;
      const table = col.ref.qualifier
        ? select.tables.get(col.ref.qualifier)
        : !select.opaqueSource && distinctTables.size === 1
          ? [...distinctTables][0]
          : undefined;
      const known = table ? tableColumns.get(table) : undefined;
      if (table && known && !known.has(col.ref.column)) {
        const pos = sqlPosition(sql, col.ref.offset);
        push(
          "DEM003",
          campoNaoEncontradoNaTabelaMessage(col.ref.column, table, cursor.name),
          "warning",
          pos.line,
          pos.col,
          pos.col + col.ref.column.length
        );
      }
    }
    if (!readable) cursor.columns = undefined;
    else if (cursor.columns) for (const n of names) cursor.columns.add(n);
  };

  let depth = 0;
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i];
    if (isVal(t, "(")) depth++;
    else if (isVal(t, ")")) depth = Math.max(0, depth - 1);
    else if (isVal(t, "{") || isVal(t, "}")) depth = 0;
    if (t.kind !== "ident" || !isVal(toks[i + 1], ".") || !isName(toks[i + 2]) || isVal(toks[i - 1], ".")) continue;

    const key = t.value.toLowerCase();
    const member = toks[i + 2];
    const after = toks[i + 3];

    if (decl.cursors.has(key)) {
      let cursor = cursors.get(key);
      if (!cursor) {
        cursor = { name: t.value, hasSql: false, columns: new Set() };
        cursors.set(key, cursor);
      }
      const m = member.value.toLowerCase();
      if (m === "sql") {
        const firstSql = !cursor.hasSql;
        cursor.hasSql = true;
        if (firstSql) cursor.columns = new Set();
        const sql = readSqlLiterals(toks, i + 3);
        if (sql) checkSql(cursor, sql);
        else cursor.columns = undefined;
      } else if (m === "abrircursor") {
        if (!cursor.hasSql) {
          push("SQL014", cursorSemSqlMessage(t.value), "error", member.line, member.column, member.column + member.value.length);
        }
      } else if (!isVal(after, "(") && !CURSOR_MEMBERS.has(m)) {
        fieldUses.push({ cursor: key, member });
        if (depth === 0 && isAssignmentAt(toks, i + 3)) {
          const endCol = member.line === t.line ? member.column + member.value.length : t.column + t.value.length;
          push("SEM007", ATRIBUIR_CAMPO_CURSOR_MESSAGE, "error", t.line, t.column, endCol);
        }
      }
      i += 2;
      continue;
    }

    if (!tableColumns || decl.types.has(key) || decl.functions.has(key)) continue;
    if (isVal(after, "(") || isVal(after, ".")) continue;
    const known = tableColumns.get(t.value.toUpperCase());
    if (known && !known.has(member.value.toUpperCase())) {
      push("DEM002", campoNaoEncontradoMessage(member.value), "error", member.line, member.column, member.column + member.value.length);
    }
    i += 2;
  }

  for (const use of fieldUses) {
    const cursor = cursors.get(use.cursor);
    if (!cursor?.hasSql || !cursor.columns) continue;
    if (cursor.columns.has(use.member.value.toUpperCase())) continue;
    const m = use.member;
    push("SQL012", campoForaDoSelectMessage(m.value, cursor.name), "error", m.line, m.column, m.column + m.value.length);
  }

  return hits;
}
