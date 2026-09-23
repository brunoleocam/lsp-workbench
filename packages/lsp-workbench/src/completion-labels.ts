/**
 * Rótulos canônicos do Ctrl+Espaço (coluna description / detail).
 * Facilita distinguir sistema × arquivo × projeto × parâmetro × Senior × snippet.
 */

export type CompletionOrigin =
  | "sistema"
  | "global"
  | "arquivo"
  | "projeto"
  | "funcao"
  | "parametro"
  | "senior"
  | "custom"
  | "snippet"
  | "comando"
  | "membro"
  | "catalogo"
  | "qf";

const ORIGIN_LABEL: Record<CompletionOrigin, string> = {
  sistema: "Sistema",
  global: "Global",
  arquivo: "Arquivo",
  projeto: "Projeto",
  funcao: "Função (local)",
  parametro: "Parâmetro",
  senior: "Senior",
  custom: "Custom",
  snippet: "Snippet",
  comando: "Comando",
  membro: "Membro",
  catalogo: "Catálogo",
  qf: "Quick Fix",
};

export function completionOriginLabel(origin: CompletionOrigin): string {
  return ORIGIN_LABEL[origin];
}

/** Texto curto para `detail` (à direita do label no suggest). */
export function completionDetailLine(
  origin: CompletionOrigin,
  extra?: string
): string {
  const base = ORIGIN_LABEL[origin];
  return extra ? `${base} · ${extra}` : base;
}
