/** Tipos do catálogo de funções LSP (shared por generated + overrides). */

/** Origem do produto Senior; omitido = plataforma / docs/lsp. */
export type LspFunctionSystem = "HCM" | "ERP" | "ACESSO";

export type LspFunctionEntry = {
  label: string;
  insertText: string;
  detail: string;
  documentation: string;
  kind?: "function" | "keyword";
  isSnippet?: boolean;
  /** Presente em catálogos gerados a partir dos índices HCM/ERP. */
  system?: LspFunctionSystem;
};
