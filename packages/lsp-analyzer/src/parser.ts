import type { AstNode, Token } from "./types";

type ParserState = {
  tokens: Token[];
  pos: number;
};

function at(s: ParserState): Token | undefined {
  return s.tokens[s.pos];
}

function eof(s: ParserState): boolean {
  return s.pos >= s.tokens.length;
}

function isKw(t: Token | undefined, ...names: string[]): boolean {
  if (!t || t.kind !== "keyword") return false;
  const v = t.value.toLowerCase();
  return names.some((n) => n.toLowerCase() === v);
}

function isVal(t: Token | undefined, ...vals: string[]): boolean {
  if (!t) return false;
  return vals.some((v) => t.value === v);
}

function advance(s: ParserState): Token | undefined {
  return s.tokens[s.pos++];
}

function matchKw(s: ParserState, ...names: string[]): Token | undefined {
  if (isKw(at(s), ...names)) return advance(s);
  return undefined;
}

function matchVal(s: ParserState, ...vals: string[]): Token | undefined {
  if (isVal(at(s), ...vals)) return advance(s);
  return undefined;
}

/** `{` ou `Inicio` (ADR-008). */
function atBlockOpen(s: ParserState): boolean {
  return isVal(at(s), "{") || (isKw(at(s), "Inicio") && !isVal(s.tokens[s.pos - 1], "."));
}

/** `}` ou `Fim` (ADR-008); `X.Fim` é membro, não fecha bloco. */
function atBlockClose(s: ParserState): boolean {
  return isVal(at(s), "}") || (isKw(at(s), "Fim") && !isVal(s.tokens[s.pos - 1], "."));
}

/** Consome `}` ou `Fim` (+ `;` opcional depois de `Fim`). */
function matchBlockClose(s: ParserState): void {
  if (matchVal(s, "}")) return;
  if (matchKw(s, "Fim")) matchVal(s, ";");
}

/** Consome até `;` ou fechamento de bloco (não consome o fechamento). */
function recover(s: ParserState): void {
  while (!eof(s)) {
    const t = at(s);
    if (isVal(t, ";")) {
      advance(s);
      return;
    }
    if (atBlockClose(s)) return;
    advance(s);
  }
}

function parseBalancedParenText(s: ParserState): { text: string; line: number; column: number } | null {
  const open = matchVal(s, "(");
  if (!open) return null;
  const parts: string[] = [];
  let depth = 1;
  const line = open.line;
  const column = open.column;
  while (!eof(s) && depth > 0) {
    const t = advance(s)!;
    if (t.value === "(") depth++;
    else if (t.value === ")") {
      depth--;
      if (depth === 0) break;
    }
    if (depth > 0) {
      if (parts.length > 0) parts.push(" ");
      parts.push(t.value);
    }
  }
  return { text: parts.join("").replace(/\s+/g, " ").trim(), line, column };
}

function parseBlock(s: ParserState): AstNode {
  const open = matchVal(s, "{") ?? matchKw(s, "Inicio");
  const line = open?.line ?? at(s)?.line ?? 0;
  const column = open?.column ?? 0;
  const children: AstNode[] = [];
  while (!eof(s) && !atBlockClose(s)) {
    const stmt = parseStatement(s);
    if (stmt) children.push(stmt);
    else {
      if (eof(s) || atBlockClose(s)) break;
      recover(s);
    }
  }
  matchBlockClose(s);
  return { kind: "Block", line, column, children };
}

function parseDefinir(s: ParserState): AstNode {
  const kw = advance(s)!; // Definir
  const typeTok = at(s);
  let typeName: string | undefined;
  if (typeTok && (typeTok.kind === "keyword" || typeTok.kind === "ident")) {
    typeName = advance(s)!.value;
  }
  const nameTok = at(s);
  let name: string | undefined;
  if (nameTok && (nameTok.kind === "ident" || nameTok.kind === "keyword")) {
    name = advance(s)!.value;
  }
  // opcional: (params) em Definir Funcao Nome(…)
  if (isVal(at(s), "(")) {
    let depth = 0;
    while (!eof(s)) {
      const t = advance(s)!;
      if (t.value === "(") depth++;
      if (t.value === ")") {
        depth--;
        if (depth === 0) break;
      }
    }
  }
  matchVal(s, ";");
  return {
    kind: "Definir",
    line: kw.line,
    column: kw.column,
    typeName,
    name,
  };
}

function parseSe(s: ParserState): AstNode {
  const kw = advance(s)!; // Se
  const cond = parseBalancedParenText(s);
  const thenBody = atBlockOpen(s)
    ? parseBlock(s)
    : ({ kind: "Block", line: kw.line, children: [] } as AstNode);
  let elseBody: AstNode | undefined;
  if (matchKw(s, "Senao")) {
    elseBody = atBlockOpen(s)
      ? parseBlock(s)
      : ({ kind: "Block", line: kw.line, children: [] } as AstNode);
  }
  return {
    kind: "Se",
    line: kw.line,
    column: kw.column,
    text: cond?.text,
    condition: cond
      ? { kind: "Condition", line: cond.line, column: cond.column, text: cond.text }
      : undefined,
    thenBody,
    elseBody,
    children: [thenBody, ...(elseBody ? [elseBody] : [])],
  };
}

/** Corpo de laço: bloco, ou um comando só (sem chaves) embrulhado num Block. */
function parseLoopBody(s: ParserState, kw: Token): AstNode {
  if (atBlockOpen(s)) return parseBlock(s);
  const single = eof(s) || atBlockClose(s) ? null : parseStatement(s);
  return { kind: "Block", line: kw.line, children: single ? [single] : [] };
}

/** `Enquanto (…)` e `Para (…)` têm a mesma forma: condição entre parênteses + corpo. */
function parseLoop(s: ParserState, kind: "Enquanto" | "Para"): AstNode {
  const kw = advance(s)!;
  const cond = parseBalancedParenText(s);
  const body = parseLoopBody(s, kw);
  return {
    kind,
    line: kw.line,
    column: kw.column,
    text: cond?.text,
    condition: cond
      ? { kind: "Condition", line: cond.line, column: cond.column, text: cond.text }
      : undefined,
    body,
    children: [body],
  };
}

function parseFuncao(s: ParserState): AstNode {
  const kw = advance(s)!; // Funcao
  const nameTok = at(s);
  let name: string | undefined;
  if (nameTok && (nameTok.kind === "ident" || nameTok.kind === "keyword")) {
    name = advance(s)!.value;
  }
  if (isVal(at(s), "(")) {
    let depth = 0;
    while (!eof(s)) {
      const t = advance(s)!;
      if (t.value === "(") depth++;
      if (t.value === ")") {
        depth--;
        if (depth === 0) break;
      }
    }
  }
  // Decl: Funcao Nome(...);  | Impl: Funcao Nome(...) { … }
  if (matchVal(s, ";")) {
    return { kind: "FuncaoDecl", line: kw.line, column: kw.column, name };
  }
  const body = atBlockOpen(s)
    ? parseBlock(s)
    : ({ kind: "Block", line: kw.line, children: [] } as AstNode);
  return {
    kind: "Funcao",
    line: kw.line,
    column: kw.column,
    name,
    body,
    children: [body],
  };
}

function parseSimpleOrRetorna(s: ParserState): AstNode | null {
  const start = at(s);
  if (!start) return null;

  // Retorna; / Retorne; sem parênteses (Retorna(x) é chamada embutida — ADR-008)
  if (isKw(start, "Retorna", "Retorne") && !isVal(s.tokens[s.pos + 1], "(")) {
    const kw = advance(s)!;
    matchVal(s, ";");
    return { kind: "Retorna", line: kw.line, column: kw.column, name: kw.value };
  }

  // assignment / call / expression até ;
  const line = start.line;
  const column = start.column;
  const parts: string[] = [];
  while (!eof(s) && !isVal(at(s), ";") && !atBlockClose(s)) {
    // nested block shouldn't appear in simple stmt often, but stop before }
    const t = advance(s)!;
    if (parts.length) parts.push(" ");
    parts.push(t.value);
  }
  matchVal(s, ";");
  const text = parts.join("").replace(/\s+/g, " ").trim();
  if (!text) return null;
  return { kind: "Statement", line, column, text };
}

function parseStatement(s: ParserState): AstNode | null {
  if (eof(s)) return null;
  if (atBlockClose(s)) return null;

  if (isKw(at(s), "Definir")) return parseDefinir(s);
  if (isKw(at(s), "Se")) return parseSe(s);
  if (isKw(at(s), "Enquanto")) return parseLoop(s, "Enquanto");
  if (isKw(at(s), "Para") && isVal(s.tokens[s.pos + 1], "(")) return parseLoop(s, "Para");
  if (isKw(at(s), "Funcao")) return parseFuncao(s);
  if (atBlockOpen(s)) return parseBlock(s);

  // Senao solto — recovery
  if (isKw(at(s), "Senao")) {
    const kw = advance(s)!;
    const body = atBlockOpen(s) ? parseBlock(s) : undefined;
    return { kind: "Senao", line: kw.line, column: kw.column, body, children: body ? [body] : [] };
  }

  return parseSimpleOrRetorna(s);
}

/** Parser recursive-descent com recovery até `;` / `}`. */
export function parse(tokens: Token[]): AstNode {
  const s: ParserState = { tokens, pos: 0 };
  const children: AstNode[] = [];
  while (!eof(s)) {
    const before = s.pos;
    const stmt = parseStatement(s);
    if (stmt) {
      children.push(stmt);
    } else {
      if (eof(s)) break;
      if (atBlockClose(s)) {
        // } / Fim extra — avança para recovery
        matchBlockClose(s);
        continue;
      }
      recover(s);
    }
    if (s.pos === before) {
      // evita loop infinito
      advance(s);
    }
  }
  return { kind: "Program", line: 0, children };
}
