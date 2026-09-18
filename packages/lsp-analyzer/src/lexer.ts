import type { Token } from "./types";

const KEYWORDS = new Set(
  [
    "se",
    "senao",
    "enquanto",
    "para",
    "funcao",
    "definir",
    "cancel",
    "pare",
    "continue",
    "alfa",
    "numero",
    "data",
    "lista",
    "cursor",
    "retorna",
    "retorne",
    "inicio",
    "fim",
    "fimse",
    "fimenquanto",
  ].map((k) => k.toLowerCase())
);

function isIdentStart(ch: string): boolean {
  return /[A-Za-z_]/.test(ch);
}

function isIdentCont(ch: string): boolean {
  return /[A-Za-z0-9_]/.test(ch);
}

/**
 * Lexer LSP — ignora comentários @…@ e blocos slash-star; preserva strings.
 * API estável: tokenize(source) -> Token[].
 */
export function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  const src = source.replace(/\r\n/g, "\n");
  let i = 0;
  let line = 0;
  let column = 0;

  const peek = (n = 0) => src[i + n] ?? "";
  const advance = (): string => {
    const ch = src[i++] ?? "";
    if (ch === "\n") {
      line++;
      column = 0;
    } else {
      column++;
    }
    return ch;
  };

  while (i < src.length) {
    const ch = peek();

    // whitespace
    if (/\s/.test(ch)) {
      advance();
      continue;
    }

    // @…@ comment — se não fechar, encerra no fim da linha (evita engolir o arquivo)
    if (ch === "@") {
      advance(); // @
      while (i < src.length && peek() !== "@" && peek() !== "\n") {
        advance();
      }
      if (peek() === "@") {
        advance(); // closing @
      }
      continue;
    }

    // /* … */ block comment
    if (ch === "/" && peek(1) === "*") {
      advance();
      advance();
      while (i < src.length) {
        if (peek() === "*" && peek(1) === "/") {
          advance();
          advance();
          break;
        }
        advance();
      }
      continue;
    }

    // string "…"
    if (ch === '"') {
      const startLine = line;
      const startCol = column;
      let value = advance(); // "
      while (i < src.length) {
        const c = peek();
        if (c === '"') {
          value += advance();
          break;
        }
        if (c === "\\" && i + 1 < src.length) {
          value += advance();
          value += advance();
          continue;
        }
        if (c === "\n") {
          // string não fechada: encerra na quebra
          break;
        }
        value += advance();
      }
      tokens.push({ kind: "string", value, line: startLine, column: startCol });
      continue;
    }

    // number
    if (/\d/.test(ch)) {
      const startLine = line;
      const startCol = column;
      let value = "";
      while (/\d/.test(peek())) value += advance();
      if (peek() === "." && /\d/.test(peek(1))) {
        value += advance();
        while (/\d/.test(peek())) value += advance();
      }
      tokens.push({ kind: "number", value, line: startLine, column: startCol });
      continue;
    }

    // ident / keyword
    if (isIdentStart(ch)) {
      const startLine = line;
      const startCol = column;
      let value = "";
      while (isIdentCont(peek())) value += advance();
      const kind = KEYWORDS.has(value.toLowerCase()) ? "keyword" : "ident";
      tokens.push({ kind, value, line: startLine, column: startCol });
      continue;
    }

    // punctuation / operators (single char; multi-char ops as sequence)
    const startLine = line;
    const startCol = column;
    const value = advance();
    tokens.push({ kind: "punct", value, line: startLine, column: startCol });
  }

  return tokens;
}
