/** Tipos públicos do analyzer (Opção 2 — PDR-005). */

export type Diagnostic = {
  id: string;
  message: string;
  line: number;
  severity: "error" | "warning";
};

export type Token = {
  kind: string;
  value: string;
  line: number;
  column: number;
};

export type AstNode = {
  kind: string;
  line: number;
  column?: number;
  children?: AstNode[];
  /** Texto bruto útil (ex.: condição Se/Enquanto). */
  text?: string;
  name?: string;
  typeName?: string;
  condition?: AstNode;
  thenBody?: AstNode;
  elseBody?: AstNode;
  body?: AstNode;
};

export type AnalyzeResult = {
  diagnostics: Diagnostic[];
  tokens: Token[];
  ast?: AstNode;
};

export type AnalyzeOptions = {
  ignoreIds?: string[];
};

export type FormatOptions = {
  indentSize?: number;
};
