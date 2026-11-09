/**
 * FUN010..FUN014 — checagem genérica de chamada (PDR-012 etapa 4, REQ-040..043).
 * Ordem de resolução do compilador: função do arquivo/escopo → comando embutido → catálogo.
 */
import { maskCommentsAndStrings } from "./comment-mask";
import {
  type ArgumentMessageParts,
  faltaDeclaracaoMessage,
  faltamParametrosMessage,
  incompativeisMessage,
  muitosParametrosMessage,
  naoPodeSerCampoCursorMessage,
  naoPodeSerConstanteMessage,
  naoPodeSerExpressaoMessage,
} from "./compiler-messages";
import {
  baseType,
  collectDeclarations,
  type Declarations,
  typeLabel,
  type ValueType,
} from "./declared-types";
import type { DiagnosticHit } from "./diagnostics";
import type { LspFunctionEntry, LspFunctionParam } from "./function-catalog.types";

/** Comandos tratados pelo próprio compilador: [mín, máx] de argumentos. */
export const BUILTIN_COMMAND_ARITY: ReadonlyMap<string, readonly [number, number]> = new Map([
  ["mensagem", [1, 99]],
  ["execsql", [1, 1]],
  ["execsqlex", [2, 99]],
  ["cancel", [0, 1]],
  ["cancelar", [0, 1]],
  ["regra", [1, 1]],
  ["abrir", [2, 3]],
  ["fechar", [1, 1]],
  ["ler", [2, 3]],
  ["lernl", [2, 2]],
  ["gravar", [2, 2]],
  ["gravarnl", [2, 2]],
  ["gravarnleol", [2, 2]],
  ["iniciartransacao", [0, 0]],
  ["finalizartransacao", [0, 0]],
  ["desfazertransacao", [0, 0]],
  ["execprog", [1, 99]],
  ["habilitacampo", [1, 99]],
  ["desabilitacampo", [1, 99]],
  ["habilitatodos", [0, 0]],
  ["desabilitatodos", [0, 0]],
  ["vaparacampo", [1, 2]],
  ["vaparapagina", [1, 1]],
  ["habilitabotao", [1, 99]],
  ["desabilitabotao", [1, 99]],
  ["chamafuncao", [1, 99]],
  ["atualizacampos", [0, 0]],
  ["escondecampo", [1, 99]],
  ["formatar", [1, 99]],
  ["retorna", [0, 1]],
]);

/** Constantes aceitas como argumento (`Mensagem(Erro, …)`, `Abrir(…, Ler)`). */
export const ARGUMENT_CONSTANTS: ReadonlySet<string> = new Set([
  "erro", "retorna", "refaz", "ler", "gravar", "lergravar", "lernl", "gravarnl", "anexar",
  "lergravarnl", "gravarnleol", "binario", "texto", "verdadeiro", "falso", "nulo", "sim", "nao",
  "alterar", "inserir", "excluir", "true", "false",
]);

/** Palavras que antecedem `(` sem ser chamada. */
const NOT_A_CALL: ReadonlySet<string> = new Set([
  "se", "senao", "enquanto", "para", "definir", "funcao", "inicio", "fim", "pare", "continue",
  "vapara", "e", "ou", "alfa", "numero", "data", "cursor", "lista", "tabela", "end",
  "fimse", "fimenquanto", "valret", "valstr", "advertencia",
]);

/** Inexistentes com regra própria e sugestão (FUN005, RUL012): sem FUN010 duplicado. */
const COVERED_BY_SPECIFIC_RULE: ReadonlySet<string> = new Set(["arredondar", "chr"]);

type Span = { start: number; end: number };

type ArgKind =
  | "alfa-literal"
  | "numero-literal"
  | "char-literal"
  | "constant"
  | "variable"
  | "field"
  | "expression";

type Arg = Span & { kind: ArgKind; type?: ValueType; base?: string };

export type CallCheckOptions = {
  catalog: readonly LspFunctionEntry[];
  /** Funções de outros arquivos do escopo (FUN009 cuida delas). */
  scopedExternal?: ReadonlyMap<string, unknown>;
};

const catalogIndexCache = new WeakMap<readonly LspFunctionEntry[], Map<string, LspFunctionEntry>>();
const extraLoadedCache = new WeakMap<readonly LspFunctionEntry[], boolean>();

function catalogIndex(catalog: readonly LspFunctionEntry[]): Map<string, LspFunctionEntry> {
  let index = catalogIndexCache.get(catalog);
  if (!index) {
    index = new Map(catalog.map((e) => [e.label.toLowerCase(), e]));
    catalogIndexCache.set(catalog, index);
  }
  return index;
}

/** D3: com catálogo extra carregado, FUN010 é erro; sem ele, aviso. */
export function catalogHasExtra(catalog: readonly LspFunctionEntry[]): boolean {
  let loaded = extraLoadedCache.get(catalog);
  if (loaded === undefined) {
    loaded = catalog.some((e) => e.origin === "extra" || e.origin === "merged");
    extraLoadedCache.set(catalog, loaded);
  }
  return loaded;
}

function isCompilerSignature(entry: LspFunctionEntry): boolean {
  return entry.origin === "extra" || entry.origin === "merged";
}

/** Variantes conhecidas; `undefined` = sem assinatura (doc sem tabela de parâmetros). */
function signatureVariants(entry: LspFunctionEntry): LspFunctionParam[][] | undefined {
  if (entry.variants?.length) return entry.variants;
  if (entry.params?.length) return [entry.params];
  return isCompilerSignature(entry) ? [[]] : undefined;
}

/** Só `Definir`: sem declaração o Senior assume Numero implícito, e o prefixo `va` não garante Alfa. */
function variableType(name: string, decl: Declarations): ValueType | undefined {
  return decl.types.get(name.toLowerCase());
}

function trimSpan(text: string, span: Span): Span {
  let { start, end } = span;
  while (start < end && /\s/.test(text[start])) start++;
  while (end > start && /\s/.test(text[end - 1])) end--;
  return { start, end };
}

/** Argumentos de `(` em `open` até o `)` correspondente; `undefined` se não fecha no comando. */
function readArgs(masked: string, open: number): Span[] | undefined {
  const spans: Span[] = [];
  let depth = 0;
  let start = open + 1;
  for (let i = open; i < masked.length; i++) {
    const ch = masked[i];
    if (ch === "(" || ch === "[") depth++;
    else if (ch === ")" || ch === "]") {
      depth--;
      if (depth === 0) {
        spans.push(trimSpan(masked, { start, end: i }));
        const only = spans[0];
        return spans.length === 1 && only.start === only.end ? [] : spans;
      }
    } else if (ch === "," && depth === 1) {
      spans.push(trimSpan(masked, { start, end: i }));
      start = i + 1;
    } else if (ch === ";" || ch === "{" || ch === "}") {
      return undefined;
    }
  }
  return undefined;
}

function splitTopLevelPlus(masked: string, span: Span): Span[] | undefined {
  const parts: Span[] = [];
  let depth = 0;
  let start = span.start;
  for (let i = span.start; i < span.end; i++) {
    const ch = masked[i];
    if (ch === "(" || ch === "[") depth++;
    else if (ch === ")" || ch === "]") depth--;
    else if (ch === "+" && depth === 0) {
      parts.push(trimSpan(masked, { start, end: i }));
      start = i + 1;
    }
  }
  if (!parts.length) return undefined;
  parts.push(trimSpan(masked, { start, end: span.end }));
  return parts;
}

function classifySimple(
  masked: string,
  source: string,
  span: Span,
  decl: Declarations
): Arg | undefined {
  const m = masked.slice(span.start, span.end);
  const o = source.slice(span.start, span.end);
  if (/^"\s*"$/.test(m)) return { ...span, kind: "alfa-literal", type: "Alfa" };
  if (/^[-+]?\d+(?:\.\d+)?$/.test(m)) return { ...span, kind: "numero-literal", type: "Numero" };
  if (/^'.?'$/.test(o)) return { ...span, kind: "char-literal" };
  if (/^[A-Za-z_]\w*$/.test(m)) {
    if (ARGUMENT_CONSTANTS.has(m.toLowerCase())) return { ...span, kind: "constant" };
    return { ...span, kind: "variable", type: variableType(m, decl) };
  }
  const indexed = /^([A-Za-z_]\w*)\s*\[[^\]]*\]$/.exec(m);
  if (indexed) return { ...span, kind: "variable", type: variableType(indexed[1], decl) };
  const field = /^([A-Za-z_]\w*)\s*\.\s*[A-Za-z_]\w*$/.exec(m);
  if (field) return { ...span, kind: "field", base: field[1] };
  return undefined;
}

function classifyArg(masked: string, source: string, span: Span, decl: Declarations): Arg {
  const simple = classifySimple(masked, source, span, decl);
  if (simple) return simple;
  const parts = splitTopLevelPlus(masked, span)?.map((p) => classifySimple(masked, source, p, decl));
  const first = parts?.[0]?.type;
  const type = first && parts?.every((p) => p?.type === first) ? first : undefined;
  return { ...span, kind: "expression", type };
}

type Located = { line: number; col: number };

function locator(source: string): (offset: number) => Located {
  const starts = [0];
  for (let i = 0; i < source.length; i++) if (source[i] === "\n") starts.push(i + 1);
  return (offset) => {
    let lo = 0;
    let hi = starts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (starts[mid] <= offset) lo = mid;
      else hi = mid - 1;
    }
    return { line: lo, col: offset - starts[lo] };
  };
}

export function collectCallHits(source: string, opts: CallCheckOptions): DiagnosticHit[] {
  const text = source.replace(/\r\n/g, "\n");
  const masked = maskCommentsAndStrings(text);
  const locate = locator(text);
  const decl = collectDeclarations(masked);
  const index = catalogIndex(opts.catalog);
  const fun010Severity = catalogHasExtra(opts.catalog) ? "error" : "warning";
  const hits: DiagnosticHit[] = [];

  const hitAt = (id: string, message: string, span: Span, severity: DiagnosticHit["severity"]) => {
    const start = locate(span.start);
    const end = locate(span.end);
    const lineEnd = text.indexOf("\n", span.start);
    const endCol = end.line === start.line ? end.col : start.col + (lineEnd - span.start);
    hits.push({ id, message, line: start.line, severity, startCol: start.col, endCol });
  };

  for (const m of masked.matchAll(/\b([A-Za-z_]\w*)\s*\(/g)) {
    const name = m[1];
    const key = name.toLowerCase();
    const nameStart = m.index ?? 0;
    const nameSpan = { start: nameStart, end: nameStart + name.length };
    const range = BUILTIN_COMMAND_ARITY.get(key);
    if (NOT_A_CALL.has(key) || (!range && ARGUMENT_CONSTANTS.has(key))) continue;
    const before = masked.slice(Math.max(0, nameStart - 40), nameStart);
    if (/\.\s*$/.test(before) || /\bfuncao\s+$/i.test(before)) continue;
    if (decl.functions.has(key) || opts.scopedExternal?.has(key)) continue;

    const spans = readArgs(masked, nameStart + m[0].length - 1);
    if (!spans) continue;

    if (range) {
      if (spans.length < range[0]) hitAt("FUN011", faltamParametrosMessage(name), nameSpan, "error");
      else if (spans.length > range[1]) hitAt("FUN011", muitosParametrosMessage(name), nameSpan, "error");
      continue;
    }

    const entry = index.get(key);
    if (!entry) {
      if (COVERED_BY_SPECIFIC_RULE.has(key)) continue;
      hitAt("FUN010", faltaDeclaracaoMessage(name), nameSpan, fun010Severity);
      continue;
    }
    const variants = signatureVariants(entry);
    if (!variants) continue;
    // Nº e tipo só com assinatura do compilador: a doc pública diverge nos dois
    // (ex.: `IntParaAlfa` documentada com `Alfa` no 1º). O `End` da doc vale para FUN013/FUN014.
    const fromCompiler = isCompilerSignature(entry);
    const params = variants.find((v) => v.length === spans.length);
    if (!params) {
      if (!fromCompiler) continue;
      const few = spans.length < variants[0].length;
      const message = few ? faltamParametrosMessage(name) : muitosParametrosMessage(name);
      hitAt("FUN011", message, nameSpan, "error");
      continue;
    }

    spans.forEach((span, i) => {
      const param = params[i];
      const arg = classifyArg(masked, text, span, decl);
      const paramType = baseType(param.tipo);
      const parts: ArgumentMessageParts = {
        value: text.slice(span.start, span.end).replace(/\s+/g, " ").slice(0, 40),
        valueType: typeLabel(arg.type),
        param: param.name,
        paramType: typeLabel(paramType),
      };
      if (param.out) {
        if (arg.kind === "expression") {
          hitAt("FUN013", naoPodeSerExpressaoMessage(parts), span, "error");
          return;
        }
        if (arg.kind.endsWith("-literal") || arg.kind === "constant") {
          hitAt("FUN013", naoPodeSerConstanteMessage(parts), span, "error");
          return;
        }
        if (arg.kind === "field" && arg.base && decl.cursors.has(arg.base.toLowerCase())) {
          hitAt("FUN014", naoPodeSerCampoCursorMessage(parts), span, "error");
          return;
        }
      }
      if (fromCompiler && arg.type && paramType && arg.type !== paramType) {
        hitAt("FUN012", incompativeisMessage(parts), span, "error");
      }
    });
  }
  return hits;
}
