/** Tipos do catálogo de funções LSP (shared por generated + overrides). */

export type LspFunctionEntry = {
  label: string;
  insertText: string;
  detail: string;
  documentation: string;
  kind?: "function" | "keyword";
  isSnippet?: boolean;
};
