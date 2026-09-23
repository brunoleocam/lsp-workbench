/**
 * Ordenação do Ctrl+Espaço (canônico):
 * 1. Match de escrita (label === prefixo digitado)
 * 2. Variáveis
 * 3. Funções
 * 4. Comandos / keywords / tipos
 * 5. Outros (tabelas, colunas, Definir-insert…)
 * 6. Quick Fixes
 *
 * Dentro de cada faixa: ordem alfabética (A→Z, case-insensitive).
 */

export type CompletionSortBand =
  | "exact"
  | "variable"
  | "function"
  | "command"
  | "other"
  | "qf";

const BAND_CODE: Record<CompletionSortBand, string> = {
  exact: "0",
  variable: "1",
  function: "2",
  command: "3",
  other: "4",
  qf: "5",
};

/**
 * sortText estável para o cliente VS Code / Cursor.
 * Se `label` casar exatamente com `prefix`, sobe para a faixa `exact` (match de escrita).
 * Dentro da faixa: só o label em minúsculas → ordem alfabética.
 */
export function completionSortText(
  band: Exclude<CompletionSortBand, "exact">,
  label: string,
  prefix: string
): string {
  const p = prefix.trim().toLowerCase();
  const l = label.toLowerCase();
  const effective: CompletionSortBand = p.length > 0 && l === p ? "exact" : band;
  return `${BAND_CODE[effective]}_${l}`;
}

/** Compara dois sortText (útil em testes). */
export function compareCompletionSortText(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
