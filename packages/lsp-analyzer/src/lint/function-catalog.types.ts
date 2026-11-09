/** Tipos do catálogo de funções LSP (shared por generated + overrides). */

/** Origem do produto Senior; omitido = plataforma / docs/lsp. */
export type LspFunctionSystem = "HCM" | "ERP" | "ACESSO";

/** Linha da tabela Parâmetros (Código, Tipo, Descrição) da documentação Senior. */
export type LspFunctionParam = {
  name: string;
  /** `Alfa` | `Numero` | `Data` | `Lista` | `Cursor` quando reconhecido; senão o texto original. */
  tipo?: string;
  description?: string;
  /** Parâmetro `End` (saída). */
  out?: boolean;
};

/** `docs` = só doc pública; `extra` = só catálogo extra; `merged` = os dois (ADR-009). */
export type LspFunctionOrigin = "docs" | "extra" | "merged";

export type LspFunctionEntry = {
  label: string;
  insertText: string;
  detail: string;
  documentation: string;
  kind?: "function" | "keyword";
  isSnippet?: boolean;
  /** Presente em catálogos gerados a partir dos índices HCM/ERP. */
  system?: LspFunctionSystem;
  /** Tipo e descrição de cada argumento, quando a documentação traz a tabela. */
  params?: LspFunctionParam[];
  /** Sobrecargas; ausente = só `params`. */
  variants?: LspFunctionParam[][];
  origin?: LspFunctionOrigin;
};
