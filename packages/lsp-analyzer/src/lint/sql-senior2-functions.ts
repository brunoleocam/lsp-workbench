/**
 * Dialeto SQL Senior 2 — funções dentro da string do comando.
 * Fonte: documentacao.senior.com.br …/linguagem-sql-senior-2/funcoes.htm (5.10.3)
 * e docs/lsp/sql.md.
 */

export type SqlSenior2Category = "aggregate" | "scalar" | "format";

export type SqlSenior2Fn = {
  name: string;
  category: SqlSenior2Category;
  detail: string;
  /** Snippet para inserção dentro da string SQL (placeholders VS Code). */
  insertText: string;
  documentation?: string;
};

/** Catálogo para completion (não inclui o operador `||`). */
export const SQL_SENIOR2_FUNCTIONS: readonly SqlSenior2Fn[] = [
  // Agregação
  {
    name: "COUNT",
    category: "aggregate",
    detail: "SQL Senior 2 · contagem",
    insertText: "COUNT(${1:expr})",
    documentation: "Em regras Senior 2: não usar no SELECT do cursor (só WHERE / outros contextos).",
  },
  {
    name: "MAX",
    category: "aggregate",
    detail: "SQL Senior 2 · máximo",
    insertText: "MAX(${1:expr})",
  },
  {
    name: "MIN",
    category: "aggregate",
    detail: "SQL Senior 2 · mínimo",
    insertText: "MIN(${1:expr})",
  },
  {
    name: "SUM",
    category: "aggregate",
    detail: "SQL Senior 2 · soma",
    insertText: "SUM(${1:expr})",
  },
  {
    name: "AVG",
    category: "aggregate",
    detail: "SQL Senior 2 · média",
    insertText: "AVG(${1:expr})",
  },
  // Escalares
  {
    name: "LENGTH",
    category: "scalar",
    detail: "SQL Senior 2 · tamanho do texto",
    insertText: "LENGTH(${1:texto})",
  },
  {
    name: "DATALENGTH",
    category: "scalar",
    detail: "SQL Senior 2 · tamanho com espaços",
    insertText: "DATALENGTH(${1:texto})",
  },
  {
    name: "TRUNC",
    category: "scalar",
    detail: "SQL Senior 2 · corta casas decimais",
    insertText: "TRUNC(${1:n}, ${2:casas})",
  },
  {
    name: "SUBSTR",
    category: "scalar",
    detail: "SQL Senior 2 · substring (índice inicia em 0)",
    insertText: "SUBSTR(${1:texto}, ${2:0}, ${3:tam})",
    documentation: "Posição do 1º caractere = 0 (diferente de muitas APIs 1-based).",
  },
  {
    name: "UPPER",
    category: "scalar",
    detail: "SQL Senior 2 · maiúsculas",
    insertText: "UPPER(${1:texto})",
  },
  {
    name: "LOWER",
    category: "scalar",
    detail: "SQL Senior 2 · minúsculas",
    insertText: "LOWER(${1:texto})",
  },
  {
    name: "IFNULL",
    category: "scalar",
    detail: "SQL Senior 2 · se NULL usa fallback",
    insertText: "IFNULL(${1:expr}, ${2:fallback})",
  },
  {
    name: "STRTONUMBER",
    category: "scalar",
    detail: "SQL Senior 2 · texto → número",
    insertText: "STRTONUMBER(${1:texto})",
  },
  {
    name: "NUMBERTOSTR",
    category: "scalar",
    detail: "SQL Senior 2 · número → texto",
    insertText: "NUMBERTOSTR(${1:n})",
  },
  {
    name: "STRTODATE",
    category: "scalar",
    detail: "SQL Senior 2 · texto → data (preferir a TO_DATE)",
    insertText: "STRTODATE(${1:texto})",
  },
  {
    name: "DATETOSTR",
    category: "scalar",
    detail: "SQL Senior 2 · data → texto",
    insertText: "DATETOSTR(${1:data})",
  },
  {
    name: "FIRSTDAY",
    category: "scalar",
    detail: "SQL Senior 2 · 1º dia do mês",
    insertText: "FIRSTDAY(${1:data})",
  },
  {
    name: "LASTDAY",
    category: "scalar",
    detail: "SQL Senior 2 · último dia do mês",
    insertText: "LASTDAY(${1:data})",
  },
  {
    name: "DAYOF",
    category: "scalar",
    detail: "SQL Senior 2 · dia da data",
    insertText: "DAYOF(${1:data})",
  },
  {
    name: "MONTHOF",
    category: "scalar",
    detail: "SQL Senior 2 · mês da data",
    insertText: "MONTHOF(${1:data})",
  },
  {
    name: "YEAROF",
    category: "scalar",
    detail: "SQL Senior 2 · ano da data",
    insertText: "YEAROF(${1:data})",
  },
  {
    name: "TODAY",
    category: "scalar",
    detail: "SQL Senior 2 · data de hoje",
    insertText: "TODAY()",
  },
  {
    name: "ASCII",
    category: "scalar",
    detail: "SQL Senior 2 · código ASCII",
    insertText: "ASCII(${1:c})",
  },
  {
    name: "CHR",
    category: "scalar",
    detail: "SQL Senior 2 · caractere pelo código",
    insertText: "CHR(${1:n})",
  },
  {
    name: "CASE",
    category: "scalar",
    detail: "SQL Senior 2 · expressão condicional",
    insertText: "CASE WHEN ${1:cond} THEN ${2:a} ELSE ${3:b} END",
  },
  {
    name: "DAYTOHOURS",
    category: "scalar",
    detail: "SQL Senior 2 · dia → horas",
    insertText: "DAYTOHOURS(${1:n})",
  },
  {
    name: "DAYTOMINUTES",
    category: "scalar",
    detail: "SQL Senior 2 · dia → minutos",
    insertText: "DAYTOMINUTES(${1:n})",
  },
  {
    name: "DAYTOSECONDS",
    category: "scalar",
    detail: "SQL Senior 2 · dia → segundos",
    insertText: "DAYTOSECONDS(${1:n})",
  },
  {
    name: "DAYTOMILLISECONDS",
    category: "scalar",
    detail: "SQL Senior 2 · dia → ms",
    insertText: "DAYTOMILLISECONDS(${1:n})",
  },
  {
    name: "HOURTOMINUTES",
    category: "scalar",
    detail: "SQL Senior 2 · horas → minutos",
    insertText: "HOURTOMINUTES(${1:n})",
  },
  {
    name: "HOURTOSECONDS",
    category: "scalar",
    detail: "SQL Senior 2 · horas → segundos",
    insertText: "HOURTOSECONDS(${1:n})",
  },
  {
    name: "HOURTOMILLISECONDS",
    category: "scalar",
    detail: "SQL Senior 2 · horas → ms",
    insertText: "HOURTOMILLISECONDS(${1:n})",
  },
  {
    name: "MINUTETOSECONDS",
    category: "scalar",
    detail: "SQL Senior 2 · minutos → segundos",
    insertText: "MINUTETOSECONDS(${1:n})",
  },
  {
    name: "MINUTETOMILLISECONDS",
    category: "scalar",
    detail: "SQL Senior 2 · minutos → ms",
    insertText: "MINUTETOMILLISECONDS(${1:n})",
  },
  {
    name: "SECONDTOMILLISECONDS",
    category: "scalar",
    detail: "SQL Senior 2 · segundos → ms",
    insertText: "SECONDTOMILLISECONDS(${1:n})",
  },
  {
    name: "MOD",
    category: "scalar",
    detail: "SQL Senior 2 · resto da divisão",
    insertText: "MOD(${1:m}, ${2:n})",
  },
  {
    name: "ADDYEAR",
    category: "scalar",
    detail: "SQL Senior 2 · soma anos",
    insertText: "ADDYEAR(${1:data}, ${2:n})",
  },
  {
    name: "ADDMONTH",
    category: "scalar",
    detail: "SQL Senior 2 · soma meses",
    insertText: "ADDMONTH(${1:data}, ${2:n})",
  },
  {
    name: "ADDDAY",
    category: "scalar",
    detail: "SQL Senior 2 · soma dias",
    insertText: "ADDDAY(${1:data}, ${2:n})",
  },
  {
    name: "ADDHOUR",
    category: "scalar",
    detail: "SQL Senior 2 · soma horas",
    insertText: "ADDHOUR(${1:data}, ${2:n})",
  },
  {
    name: "ADDMINUTE",
    category: "scalar",
    detail: "SQL Senior 2 · soma minutos",
    insertText: "ADDMINUTE(${1:data}, ${2:n})",
  },
  {
    name: "ADDSECOND",
    category: "scalar",
    detail: "SQL Senior 2 · soma segundos",
    insertText: "ADDSECOND(${1:data}, ${2:n})",
  },
  {
    name: "ADDMILLISECOND",
    category: "scalar",
    detail: "SQL Senior 2 · soma milissegundos",
    insertText: "ADDMILLISECOND(${1:data}, ${2:n})",
  },
  {
    name: "DATETIMEDIF",
    category: "scalar",
    detail: "SQL Senior 2 · diferença em dias",
    insertText: "DATETIMEDIF(${1:data1}, ${2:data2})",
  },
  {
    name: "SIGN",
    category: "scalar",
    detail: "SQL Senior 2 · sinal (−1/0/1)",
    insertText: "SIGN(${1:n})",
  },
  {
    name: "SQRT",
    category: "scalar",
    detail: "SQL Senior 2 · raiz quadrada",
    insertText: "SQRT(${1:n})",
  },
  {
    name: "TRIM",
    category: "scalar",
    detail: "SQL Senior 2 · trim ambos os lados",
    insertText: "TRIM(${1:texto})",
  },
  {
    name: "LTRIM",
    category: "scalar",
    detail: "SQL Senior 2 · trim à esquerda",
    insertText: "LTRIM(${1:texto})",
  },
  {
    name: "RTRIM",
    category: "scalar",
    detail: "SQL Senior 2 · trim à direita",
    insertText: "RTRIM(${1:texto})",
  },
  {
    name: "REPLACE",
    category: "scalar",
    detail: "SQL Senior 2 · substitui texto",
    insertText: "REPLACE(${1:texto}, ${2:busca}, ${3:novo})",
  },
  {
    name: "ROUND",
    category: "scalar",
    detail: "SQL Senior 2 · arredonda",
    insertText: "ROUND(${1:n}, ${2:casas})",
  },
  {
    name: "POWER",
    category: "scalar",
    detail: "SQL Senior 2 · potência",
    insertText: "POWER(${1:m}, ${2:n})",
  },
  {
    name: "ALIAS",
    category: "format",
    detail: "SQL Senior 2 · título de coluna",
    insertText: "ALIAS(${1:titulo})",
  },
];

const SENIOR2_BY_LOWER = new Map(
  SQL_SENIOR2_FUNCTIONS.map((f) => [f.name.toLowerCase(), f] as const)
);

/** Funções nativas típicas → substituto Senior 2 (nome da função no dialeto). */
export type NativeSqlMapping = {
  /** Nome nativo (como aparece). */
  native: string;
  /** Nome Senior 2 sugerido (substituição simples do identificador). */
  replaceWith: string;
  /** Texto para mensagem de diagnóstico. */
  suggestion: string;
  /** true se o nativo é palavra isolada (SYSDATE), não só chamada. */
  bareOk?: boolean;
};

export const NATIVE_SQL_TO_SENIOR2: readonly NativeSqlMapping[] = [
  { native: "TO_DATE", replaceWith: "STRTODATE", suggestion: "STRTODATE" },
  { native: "TO_CHAR", replaceWith: "DATETOSTR", suggestion: "DATETOSTR ou NUMBERTOSTR" },
  {
    native: "CONVERT",
    replaceWith: "STRTODATE",
    suggestion: "STRTODATE / DATETOSTR / NUMBERTOSTR",
  },
  { native: "NVL", replaceWith: "IFNULL", suggestion: "IFNULL" },
  { native: "ISNULL", replaceWith: "IFNULL", suggestion: "IFNULL" },
  { native: "COALESCE", replaceWith: "IFNULL", suggestion: "IFNULL (encadear se >2 args)" },
  { native: "SYSDATE", replaceWith: "TODAY()", suggestion: "TODAY()", bareOk: true },
  { native: "GETDATE", replaceWith: "TODAY", suggestion: "TODAY()" },
  { native: "SUBSTRING", replaceWith: "SUBSTR", suggestion: "SUBSTR (índice inicia em 0)" },
  { native: "LEN", replaceWith: "LENGTH", suggestion: "LENGTH" },
  { native: "DECODE", replaceWith: "CASE", suggestion: "CASE WHEN … END" },
];

export type NativeSqlHit = {
  native: string;
  replaceWith: string;
  suggestion: string;
  /** Índice no texto SQL analisado. */
  index: number;
  length: number;
};

/** Localiza funções/identificadores nativos típicos no texto SQL. */
export function findNativeSqlFunctions(sql: string): NativeSqlHit[] {
  const hits: NativeSqlHit[] = [];
  const seen = new Set<string>();
  for (const m of NATIVE_SQL_TO_SENIOR2) {
    const re = m.bareOk
      ? new RegExp(String.raw`\b${m.native}\b`, "gi")
      : new RegExp(String.raw`\b${m.native}\s*\(`, "gi");
    let match: RegExpExecArray | null;
    while ((match = re.exec(sql)) !== null) {
      const key = `${m.native.toLowerCase()}@${match.index}`;
      if (seen.has(key)) continue;
      seen.add(key);
      hits.push({
        native: m.native,
        replaceWith: m.replaceWith,
        suggestion: m.suggestion,
        index: match.index,
        length: m.native.length,
      });
    }
  }
  return hits.sort((a, b) => a.index - b.index);
}

/**
 * Agregação na lista do SELECT (antes do FROM) — restrito em regras Senior 2.
 */
export function hasAggregateInSelect(sql: string): boolean {
  const s = sql.replace(/\\\s*/g, " ").replace(/\s+/g, " ");
  const m = s.match(/\bSELECT\b([\s\S]*?)\bFROM\b/i);
  if (!m) return false;
  return /\b(COUNT|SUM|MAX|MIN|AVG)\s*\(/i.test(m[1]);
}

/** Completion: filtra catálogo pelo prefixo digitado (case-insensitive). */
export function filterSenior2Completions(prefix: string): SqlSenior2Fn[] {
  const p = prefix.trim().toLowerCase();
  if (!p) return [...SQL_SENIOR2_FUNCTIONS];
  return SQL_SENIOR2_FUNCTIONS.filter((f) => f.name.toLowerCase().startsWith(p));
}

export function getSenior2Function(name: string): SqlSenior2Fn | undefined {
  return SENIOR2_BY_LOWER.get(name.toLowerCase());
}

/**
 * Linha/prefixo parece contexto de string SQL (DefinirComando, .SQL, ExecSQL, SELECT…).
 * `linePrefix` = texto até o cursor (já dentro de aspas ou não).
 */
export function isSqlStringCompletionContext(line: string, linePrefix: string): boolean {
  if (/\bSQL_DefinirComando\s*\(/i.test(line)) return true;
  if (/\.\s*SQL\b/i.test(line)) return true;
  if (/\bExecSQL(?:Ex)?\s*\(/i.test(line)) return true;
  if (/^\s*va(?:Sql|SQL|Query|Comando)\w*\s*=/i.test(line)) return true;
  const q = linePrefix.lastIndexOf('"');
  const inside = q >= 0 ? linePrefix.slice(q + 1) : linePrefix;
  if (/\b(SELECT|INSERT|UPDATE|DELETE|WHERE|FROM|AND|OR|JOIN|VALUES|SET)\b/i.test(inside)) {
    return true;
  }
  if (/\b(SELECT|INSERT|UPDATE|DELETE|WHERE|FROM)\b/i.test(line)) return true;
  return false;
}

/**
 * Substitui a 1ª ocorrência de função nativa conhecida pelo equivalente Senior 2.
 * Se `native` for informado, prioriza essa; senão a primeira do catálogo presente na linha.
 */
export function applySql010Fix(line: string, native?: string): string {
  const wanted = native?.toUpperCase();
  for (const m of NATIVE_SQL_TO_SENIOR2) {
    if (wanted && m.native.toUpperCase() !== wanted) continue;
    if (m.bareOk) {
      const re = new RegExp(String.raw`\b${m.native}\b`, "i");
      if (re.test(line)) return line.replace(re, m.replaceWith);
    } else {
      const re = new RegExp(String.raw`\b${m.native}(?=\s*\()`, "i");
      if (re.test(line)) return line.replace(re, m.replaceWith);
    }
  }
  return line;
}
