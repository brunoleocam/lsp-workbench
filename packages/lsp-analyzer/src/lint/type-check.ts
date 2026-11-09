/**
 * TYP001..TYP003 — tipos em atribuição, expressão e condição (PDR-012 etapa 5, REQ-050..052).
 * Trabalha sobre os tokens do lexer; comando que o checador não entende é ignorado inteiro,
 * para nunca emitir diagnóstico a partir de uma leitura parcial.
 */
import { tokenize } from "../lexer";
import type { Token } from "../types";
import { ARGUMENT_CONSTANTS } from "./call-check";
import { maskCommentsAndStrings } from "./comment-mask";
import { operadorAlfaMessage, tiposIncompativeisMessage } from "./compiler-messages";
import { collectDeclarations, type Declarations, typeLabel, type ValueType } from "./declared-types";
import type { DiagnosticHit } from "./diagnostics";

export type TypeCheckOptions = {
  /** `TABELA.CAMPO` (maiúsculas) → tipo, do catálogo de banco. */
  columnTypes?: ReadonlyMap<string, ValueType>;
};

/** `undefined` = tipo desconhecido (compatível com tudo). */
type Type = ValueType | undefined;

type RefKind = "var" | "field" | "cursorField" | "object" | "method" | "const";

type Ref = { type: Type; kind: RefKind; first: Token; last: Token };

class Bail extends Error {}

const TWO_CHAR_OPS = new Set(["<>", "<=", ">=", "==", "!=", "&&", "||", "++", "--", "+=", "-=", "*=", "/="]);
const COMPARISON_OPS = new Set(["=", "==", "<>", "!=", "<", ">", "<=", ">="]);
/** Palavras-chave do lexer que aparecem como argumento: `Mensagem(Retorna, …)`, `AdicionarCampo("X", Alfa)`. */
const KEYWORD_ARGUMENTS = new Set(["retorna", "alfa", "numero", "data", "lista", "cursor"]);

function isVal(t: Token | undefined, v: string): boolean {
  return !!t && t.kind === "punct" && t.value === v;
}

function isWord(t: Token | undefined, w: string): boolean {
  return !!t && (t.kind === "ident" || t.kind === "keyword") && t.value.toLowerCase() === w;
}

function adjacent(a: Token, b: Token | undefined): boolean {
  return !!b && b.line === a.line && b.column === a.column + a.value.length;
}

class StatementChecker {
  pos: number;
  readonly hits: DiagnosticHit[] = [];

  constructor(
    private readonly toks: Token[],
    start: number,
    private readonly end: number,
    private readonly decl: Declarations,
    private readonly columnTypes: ReadonlyMap<string, ValueType> | undefined
  ) {
    this.pos = start;
  }

  private peek(k = 0): Token | undefined {
    return this.pos + k < this.end ? this.toks[this.pos + k] : undefined;
  }

  private next(): Token {
    const t = this.peek();
    if (!t) throw new Bail();
    this.pos++;
    return t;
  }

  private expect(v: string): Token {
    const t = this.next();
    if (!isVal(t, v)) throw new Bail();
    return t;
  }

  atEnd(): boolean {
    return this.pos >= this.end;
  }

  expectEnd(): void {
    if (!this.atEnd()) throw new Bail();
  }

  /** Operador na posição atual (`<>`, `+=`… vêm do lexer como dois `punct` colados). */
  private op(): string | undefined {
    const t = this.peek();
    if (!t || t.kind !== "punct") return undefined;
    const n = this.peek(1);
    if (n && n.kind === "punct" && adjacent(t, n) && TWO_CHAR_OPS.has(t.value + n.value)) {
      return t.value + n.value;
    }
    return t.value;
  }

  private takeOp(op: string): Token {
    const t = this.next();
    if (op.length === 2) this.next();
    return t;
  }

  private hit(id: string, message: string, first: Token, last: Token = first): void {
    const endCol = last.line === first.line ? last.column + last.value.length : first.column + first.value.length;
    this.hits.push({ id, message, line: first.line, severity: "error", startCol: first.column, endCol });
  }

  /** Comando simples: chamada, atribuição (`=`, `+=`…, `++`) ou método de objeto. */
  statement(): void {
    const first = this.peek();
    if (!first) throw new Bail();
    if ((first.kind === "ident" || first.kind === "keyword") && isVal(this.peek(1), "(")) {
      this.call();
      this.expectEnd();
      return;
    }
    if (first.kind !== "ident") throw new Bail();
    const target = this.ref();
    const op = this.op();
    if (op === "=") {
      this.takeOp(op);
      this.assign(target, this.expr());
    } else if (op === "+=" || op === "-=" || op === "*=" || op === "/=") {
      this.takeOp(op);
      const value = this.expr();
      if (op !== "+=" && value === "Alfa") {
        this.hit("TYP001", tiposIncompativeisMessage("ALFA", "NUMERO"), target.first, target.last);
      } else {
        this.assign(target, value);
      }
    } else if (op === "++" || op === "--") {
      this.takeOp(op);
      this.assign(target, "Numero");
    } else if (!(this.atEnd() && target.kind === "method")) {
      throw new Bail();
    }
    this.expectEnd();
  }

  private assign(target: Ref, value: Type): void {
    if (target.kind !== "var" && target.kind !== "field") return;
    if (target.type && value && target.type !== value) {
      this.hit(
        "TYP001",
        tiposIncompativeisMessage(typeLabel(target.type), typeLabel(value)),
        target.first,
        target.last
      );
    }
  }

  private call(): void {
    this.next();
    this.expect("(");
    if (isVal(this.peek(), ")")) {
      this.next();
      return;
    }
    for (;;) {
      this.expr();
      const t = this.next();
      if (isVal(t, ")")) return;
      if (!isVal(t, ",")) throw new Bail();
    }
  }

  /** `id [ '[' expr ']' ] { '.' membro [ '(' args ')' ] }` */
  private ref(): Ref {
    const first = this.next();
    if (first.kind !== "ident") throw new Bail();
    const key = first.value.toLowerCase();
    let last = first;
    if (isVal(this.peek(), "[")) {
      this.next();
      this.expr();
      last = this.expect("]");
    }
    const declared = this.decl.types.has(key) || this.decl.cursors.has(key);
    if (!isVal(this.peek(), ".")) {
      if (!declared && ARGUMENT_CONSTANTS.has(key)) return { type: undefined, kind: "const", first, last };
      if (this.decl.cursors.has(key)) return { type: undefined, kind: "object", first, last };
      return { type: this.decl.types.get(key), kind: "var", first, last };
    }
    this.next();
    const member = this.next();
    if (member.kind !== "ident" && member.kind !== "keyword") throw new Bail();
    last = member;
    if (this.decl.cursors.has(key)) {
      const m = member.value.toLowerCase();
      if (isVal(this.peek(), "(")) {
        last = this.chain();
        return { type: undefined, kind: "method", first, last };
      }
      if (m === "achou" || m === "naoachou") return { type: "Numero", kind: "method", first, last };
      return { type: undefined, kind: "cursorField", first, last };
    }
    if (!declared && !isVal(this.peek(), ".") && !isVal(this.peek(), "(")) {
      const type = this.columnTypes?.get(`${first.value}.${member.value}`.toUpperCase());
      return { type, kind: "field", first, last };
    }
    last = this.chain();
    return { type: undefined, kind: "method", first, last };
  }

  /** Resto de um acesso a objeto: `(args)` e `.membro(args)` encadeados. */
  private chain(): Token {
    let last = this.toks[this.pos - 1];
    for (;;) {
      if (isVal(this.peek(), "(")) {
        this.pos--;
        this.call();
        last = this.toks[this.pos - 1];
      } else if (isVal(this.peek(), ".")) {
        this.next();
        last = this.next();
      } else {
        return last;
      }
    }
  }

  expr(): Type {
    let t = this.and();
    while (isWord(this.peek(), "ou") || this.op() === "||") {
      if (this.op() === "||") this.takeOp("||");
      else this.next();
      this.and();
      t = "Numero";
    }
    return t;
  }

  private and(): Type {
    let t = this.not();
    while (isWord(this.peek(), "e") || this.op() === "&&") {
      if (this.op() === "&&") this.takeOp("&&");
      else this.next();
      this.not();
      t = "Numero";
    }
    return t;
  }

  private not(): Type {
    if (isWord(this.peek(), "nao") || this.op() === "!") {
      this.next();
      this.not();
      return "Numero";
    }
    return this.comparison();
  }

  private comparison(): Type {
    const a = this.additive();
    const op = this.op();
    if (!op || !COMPARISON_OPS.has(op)) return a;
    const opTok = this.takeOp(op);
    const b = this.additive();
    if (a && b && a !== b) {
      this.hit("TYP002", tiposIncompativeisMessage(typeLabel(a), typeLabel(b)), opTok);
    }
    return "Numero";
  }

  private additive(): Type {
    let a = this.multiplicative();
    for (;;) {
      const op = this.op();
      if (op !== "+" && op !== "-") return a;
      const opTok = this.takeOp(op);
      const b = this.multiplicative();
      if (!a || !b) {
        a = a ?? b;
        if (op === "-" && a === "Alfa") a = undefined;
      } else if (a !== b) {
        this.hit("TYP002", tiposIncompativeisMessage(typeLabel(a), typeLabel(b)), opTok);
        a = undefined;
      } else if (a === "Alfa" && op === "-") {
        this.hit("TYP002", operadorAlfaMessage("-"), opTok);
      }
    }
  }

  private multiplicative(): Type {
    let a = this.unary();
    for (;;) {
      const op = this.op();
      if (op !== "*" && op !== "/" && op !== "%") return a;
      const opTok = this.takeOp(op);
      const b = this.unary();
      if (a === "Alfa" || b === "Alfa") this.hit("TYP002", operadorAlfaMessage(op), opTok);
      a = "Numero";
    }
  }

  private unary(): Type {
    const op = this.op();
    if (op === "-" || op === "+") {
      const opTok = this.takeOp(op);
      if (this.unary() === "Alfa") this.hit("TYP002", operadorAlfaMessage("-"), opTok);
      return "Numero";
    }
    return this.primary();
  }

  private primary(): Type {
    const t = this.peek();
    if (!t) throw new Bail();
    if (t.kind === "number") {
      this.next();
      return "Numero";
    }
    if (t.kind === "string") {
      this.next();
      return "Alfa";
    }
    if (isVal(t, "'")) {
      // 'X' é caractere: vale como número ou texto
      this.next();
      while (!isVal(this.peek(), "'")) this.next();
      this.next();
      return undefined;
    }
    if (isVal(t, "(")) {
      this.next();
      const inner = this.expr();
      this.expect(")");
      return inner;
    }
    if ((t.kind === "ident" || t.kind === "keyword") && isVal(this.peek(1), "(")) {
      this.call();
      return undefined;
    }
    if (t.kind === "keyword" && KEYWORD_ARGUMENTS.has(t.value.toLowerCase())) {
      this.next();
      return undefined;
    }
    if (t.kind === "ident" && !["e", "ou", "nao"].includes(t.value.toLowerCase())) {
      const r = this.ref();
      return r.kind === "object" ? undefined : r.type;
    }
    throw new Bail();
  }
}

/** Índice do `)` que fecha o `(` em `open`, ou -1. */
function matchingParen(toks: Token[], open: number): number {
  let depth = 0;
  for (let i = open; i < toks.length; i++) {
    if (isVal(toks[i], "(")) depth++;
    else if (isVal(toks[i], ")") && --depth === 0) return i;
    else if (depth > 0 && (isVal(toks[i], "{") || isVal(toks[i], "}"))) return -1;
  }
  return -1;
}

/** Fim do comando simples: `;`, `{` ou `}` fora de parênteses. */
function statementEnd(toks: Token[], start: number): number {
  let depth = 0;
  for (let i = start; i < toks.length; i++) {
    const t = toks[i];
    if (isVal(t, "(") || isVal(t, "[")) depth++;
    else if (isVal(t, ")") || isVal(t, "]")) depth--;
    else if (depth <= 0 && (isVal(t, ";") || isVal(t, "{") || isVal(t, "}"))) return i;
  }
  return toks.length;
}

export function collectTypeHits(source: string, opts: TypeCheckOptions = {}): DiagnosticHit[] {
  const text = source.replace(/\r\n/g, "\n");
  const decl = collectDeclarations(maskCommentsAndStrings(text));
  const toks = tokenize(text);
  const hits: DiagnosticHit[] = [];

  const run = (start: number, end: number, body: (c: StatementChecker) => void): void => {
    if (start >= end) return;
    const c = new StatementChecker(toks, start, end, decl, opts.columnTypes);
    try {
      body(c);
      hits.push(...c.hits);
    } catch (err) {
      if (!(err instanceof Bail)) throw err;
    }
  };

  const simpleStatement = (start: number): number => {
    const end = statementEnd(toks, start);
    run(start, end, (c) => c.statement());
    return Math.max(end, start + 1);
  };

  /** `Se (…)` / `Enquanto (…)`: `open` aponta o `(`; devolve o índice depois do `)`. */
  const condition = (open: number): number => {
    const close = isVal(toks[open], "(") ? matchingParen(toks, open) : -1;
    if (close < 0) return open;
    run(open + 1, close, (c) => {
      const type = c.expr();
      c.expectEnd();
      if (type === "Alfa") {
        const first = toks[open + 1];
        const last = toks[close - 1];
        const endCol = last.line === first.line ? last.column + last.value.length : first.column + first.value.length;
        c.hits.push({
          id: "TYP003",
          message: operadorAlfaMessage("na condição"),
          line: first.line,
          severity: "error",
          startCol: first.column,
          endCol,
        });
      }
    });
    return close + 1;
  };

  /** `Para (inicio; condição; passo)` */
  const para = (open: number): number => {
    const close = matchingParen(toks, open);
    if (close < 0) return open;
    const parts: number[] = [open];
    let depth = 0;
    for (let i = open + 1; i < close; i++) {
      if (isVal(toks[i], "(")) depth++;
      else if (isVal(toks[i], ")")) depth--;
      else if (depth === 0 && isVal(toks[i], ";")) parts.push(i);
    }
    parts.push(close);
    if (parts.length === 4) {
      run(parts[0] + 1, parts[1], (c) => c.statement());
      run(parts[1] + 1, parts[2], (c) => {
        c.expr();
        c.expectEnd();
      });
      run(parts[2] + 1, parts[3], (c) => c.statement());
    }
    return close + 1;
  };

  let i = 0;
  while (i < toks.length) {
    const t = toks[i];
    if (isVal(t, "{") || isVal(t, "}") || isVal(t, ";")) {
      i++;
      continue;
    }
    if (t.kind !== "keyword") {
      i = simpleStatement(i);
      continue;
    }
    const kw = t.value.toLowerCase();
    if (kw === "se" || kw === "enquanto") i = condition(i + 1);
    else if (kw === "para" && isVal(toks[i + 1], "(")) i = para(i + 1);
    else if (kw === "senao" || kw === "inicio" || kw === "fim") i++;
    else if ((kw === "retorna" || kw === "cancel") && isVal(toks[i + 1], "(")) i = simpleStatement(i);
    else if (kw === "funcao") {
      const close = isVal(toks[i + 2], "(") ? matchingParen(toks, i + 2) : -1;
      i = close > 0 ? close + 1 : i + 1;
    } else {
      // Definir, Pare, Continue, `Retorna;`…
      const end = statementEnd(toks, i);
      i = Math.max(end, i + 1);
    }
  }
  return hits;
}
