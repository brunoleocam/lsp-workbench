/**
 * Mensagens do compilador Senior (texto exato; PDR-012 REQ-004).
 * Diagnósticos referenciam por chave e podem acrescentar uma dica depois do texto.
 */
export const COMPILER_MESSAGES = {
  faltaValorExpressaoComando: "falta valor, expressão ou comando",
} as const;

export type CompilerMessageKey = keyof typeof COMPILER_MESSAGES;

/** Texto do compilador + dica opcional da extensão. */
export function compilerMessage(key: CompilerMessageKey, hint?: string): string {
  const base = COMPILER_MESSAGES[key];
  return hint ? `${base} — ${hint}` : base;
}

export const RUL007_MESSAGE = compilerMessage(
  "faltaValorExpressaoComando",
  "`Retorna;`/`Retorne;` sem parênteses não compila; após erro use `Cancel(1);`."
);

export const SYN016_MESSAGE = compilerMessage(
  "faltaValorExpressaoComando",
  "`FimSe`/`FimEnquanto` não existem; feche o bloco com `}` ou `Fim;`."
);

/** TYP001 / TYP002 — `ALFA`/`NUMERO` na ordem do compilador (alvo/esquerda primeiro). */
export function tiposIncompativeisMessage(left: string, right: string): string {
  return `tipos incompatíveis: ${left} e ${right}`;
}

/** TYP002 (`op` = operador) e TYP003 (`op` = "na condição"). */
export function operadorAlfaMessage(op: string): string {
  return `Variáveis alfanuméricas ou operadores não compatíveis ${op}`;
}

/** FUN010 */
export function faltaDeclaracaoMessage(name: string): string {
  return `Falta declaração do "Label/Função" = "${name}"`;
}

/** FUN011 */
export function faltamParametrosMessage(name: string): string {
  return `Faltam parâmetros na chamada da função "${name}"`;
}

/** FUN011 */
export function muitosParametrosMessage(name: string): string {
  return `Muitos parâmetros na chamada da função "${name}"`;
}

/** Valor e parâmetro como o compilador escreve: `valor "x" (ALFA) para o parâmetro "P" (NUMERO)`. */
export type ArgumentMessageParts = {
  value: string;
  valueType: string;
  param: string;
  paramType: string;
};

function argumentPrefix(p: ArgumentMessageParts): string {
  return `valor "${p.value}" (${p.valueType}) para o parâmetro "${p.param}" (${p.paramType})`;
}

/** FUN012 */
export function incompativeisMessage(p: ArgumentMessageParts): string {
  return `${argumentPrefix(p)} são incompatíveis`;
}

/** FUN013 */
export function naoPodeSerExpressaoMessage(p: ArgumentMessageParts): string {
  return `${argumentPrefix(p)} não pode ser uma expressão`;
}

/** FUN013 */
export function naoPodeSerConstanteMessage(p: ArgumentMessageParts): string {
  return `${argumentPrefix(p)} não pode ser constante`;
}

/** FUN014 */
export function naoPodeSerCampoCursorMessage(p: ArgumentMessageParts): string {
  return `${argumentPrefix(p)} não pode ser campo de cursor`;
}

/** DEM002 */
export function campoNaoEncontradoMessage(field: string): string {
  return `Campo ${field} não foi encontrado`;
}

/** DEM003 (texto da `cursor-senior-lsp`; o compilador não confere o SELECT contra o dicionário) */
export function campoNaoEncontradoNaTabelaMessage(field: string, table: string, cursor: string): string {
  return `Campo ${field} não foi encontrado na tabela ${table} (SELECT do cursor ${cursor})`;
}

/** SQL012 (texto da `cursor-senior-lsp`) */
export function campoForaDoSelectMessage(field: string, cursor: string): string {
  return `Campo ${field} não foi encontrado no SELECT do cursor ${cursor}`;
}

/** SQL013 */
export function campoRepetidoMessage(field: string, cursor: string): string {
  return `Campo de nome "${field}" está sendo selecionado repetidamente no cursor "${cursor}".`;
}

/** SQL014 */
export function cursorSemSqlMessage(cursor: string): string {
  return `Cursor ${cursor} está sem comando SQL`;
}

/** SQL015 */
export function parametroSqlNaoDeclaradoMessage(name: string): string {
  return `comando SQL definido incorretamente: identificador "${name}" não foi declarado ou utilizado na regra. Somente variáveis da regra podem ser utilizadas como parâmetros de cursores`;
}

/** SEM007 */
export const ATRIBUIR_CAMPO_CURSOR_MESSAGE = "não é possível atribuir valores a campos de cursores.";
