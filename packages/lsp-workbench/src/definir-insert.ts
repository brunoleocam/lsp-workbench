/**
 * Onde e como inserir `Definir Tipo nome;` — puro / testável.
 *
 * Ordem de boas práticas no bloco inicial do arquivo:
 * Numero → Alfa → Data → Lista → Tabela → Grid → Cursor → Funcao
 */

export type DefinirKind =
  | "Numero"
  | "Alfa"
  | "Data"
  | "Lista"
  | "Tabela"
  | "Grid"
  | "Cursor"
  | "Funcao";

/** Ordem canônica das declarações no topo do arquivo. */
export const DEFINIR_TYPE_ORDER: readonly DefinirKind[] = [
  "Numero",
  "Alfa",
  "Data",
  "Lista",
  "Tabela",
  "Grid",
  "Cursor",
  "Funcao",
] as const;

export function tipoFromPrefix(name: string): Exclude<DefinirKind, "Funcao" | "Tabela" | "Grid"> {
  if (/^va/i.test(name)) return "Alfa";
  if (/^vn/i.test(name)) return "Numero";
  if (/^vd/i.test(name)) return "Data";
  if (/^vl/i.test(name) || /^a[A-Z]/i.test(name)) return "Lista";
  if (/^Cur_/i.test(name)) return "Cursor";
  return "Numero";
}

export function definirStatement(name: string): string {
  return `Definir ${tipoFromPrefix(name)} ${name};`;
}

export function rankOfDefinirKind(kind: string): number {
  const idx = DEFINIR_TYPE_ORDER.findIndex((k) => k.toLowerCase() === kind.toLowerCase());
  return idx >= 0 ? idx : DEFINIR_TYPE_ORDER.indexOf("Numero");
}

/** Rank do `Definir …` na linha, ou null se não for declaração. */
export function rankOfDefinirLine(line: string): number | null {
  const m = line.match(/^\s*Definir\s+(\w+)\b/i);
  if (!m) return null;
  return rankOfDefinirKind(m[1]);
}

function isPreambleOrComment(line: string): boolean {
  return (
    /^\s*$/.test(line) ||
    /^\s*@/.test(line) ||
    /^\s*\/\*/.test(line) ||
    /^\s*\*/.test(line) ||
    /^\s*\/\//.test(line)
  );
}

/**
 * Região de declarações no arquivo: do primeiro conteúdo útil até antes da
 * primeira instrução que não é `Definir` / comentário / linha em branco.
 */
export function findFileDefinirRegion(lines: string[]): { start: number; end: number } {
  const n = lines.length;
  let start = 0;
  while (start < n && isPreambleOrComment(lines[start])) start++;

  let end = start;
  let seenDefinir = false;
  for (let i = start; i < n; i++) {
    if (isPreambleOrComment(lines[i])) {
      if (seenDefinir) end = i + 1;
      continue;
    }
    if (/^\s*Definir\s+/i.test(lines[i])) {
      seenDefinir = true;
      end = i + 1;
      continue;
    }
    break;
  }
  return { start, end: seenDefinir ? end : start };
}

/**
 * Linha (0-based) após a qual inserir um `Definir` do `kind` informado,
 * respeitando a ordem Numero…Funcao no bloco de declarações do arquivo.
 * Dentro de `Funcao … { }`, mantém o comportamento local (após último Definir do corpo).
 */
export function findDefinirInsertAfterLine(
  source: string,
  refLine: number,
  kind: DefinirKind = "Numero"
): number {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const n = lines.length;
  const ref = Math.max(0, Math.min(refLine, Math.max(0, n - 1)));
  const targetRank = rankOfDefinirKind(kind);

  // Escopo de função: achar Funcao acima e o { correspondente
  let funcStart = -1;
  for (let i = ref; i >= 0; i--) {
    if (/^\s*Funcao\b/i.test(lines[i]) && !/^\s*Definir\s+Funcao\b/i.test(lines[i])) {
      funcStart = i;
      break;
    }
  }

  if (funcStart >= 0) {
    let braceLine = -1;
    for (let i = funcStart; i <= ref; i++) {
      if (lines[i].includes("{")) {
        braceLine = i;
        break;
      }
    }
    if (braceLine >= 0) {
      const scopeFrom = braceLine;
      const scopeTo = ref;
      let after = braceLine;
      for (let i = scopeFrom; i <= scopeTo; i++) {
        const r = rankOfDefinirLine(lines[i]);
        if (r === null) continue;
        if (r <= targetRank) after = i;
        else break;
      }
      // Se não havia Definir no corpo, após `{`
      if (after === braceLine && !/^\s*Definir\s+/i.test(lines[braceLine])) {
        return braceLine;
      }
      return after;
    }
  }

  // Arquivo: bloco inicial ordenado por tipo
  const { start, end } = findFileDefinirRegion(lines);
  if (end <= start) {
    // nenhum Definir ainda: após preâmbulo
    let insert = 0;
    while (
      insert < n &&
      (/^\s*$/.test(lines[insert]) ||
        /^\s*@/.test(lines[insert]) ||
        /^\s*\/\*/.test(lines[insert]))
    ) {
      insert++;
    }
    return Math.max(0, insert - 1);
  }

  let after = start - 1;
  for (let i = start; i < end; i++) {
    const r = rankOfDefinirLine(lines[i]);
    if (r === null) continue;
    if (r <= targetRank) after = i;
    else break;
  }
  if (after < start) {
    // só comentários no miolo — inserir antes do primeiro Definir de rank maior
    return Math.max(0, start - 1);
  }
  return after;
}

/** Após qual linha inserir `Definir Funcao` (sempre no fim do bloco de variáveis). */
export function findDefinirFuncaoInsertAfterLine(source: string): number {
  return findDefinirInsertAfterLine(source, 0, "Funcao");
}

/** Texto completo a inserir (com \n), pronto para TextEdit.insert na linha seguinte. */
export function buildDefinirInsertEdit(
  source: string,
  refLine: number,
  varName: string
): { afterLine: number; text: string } {
  const kind = tipoFromPrefix(varName);
  const afterLine = findDefinirInsertAfterLine(source, refLine, kind);
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const indentMatch = lines[afterLine]?.match(/^(\s*)/);
  let indent = indentMatch ? indentMatch[1] : "";
  if (/{\s*$/.test(lines[afterLine] || "") && indent === "") {
    indent = "  ";
  } else if (/{\s*$/.test(lines[afterLine] || "")) {
    indent = indent + "  ";
  }
  const text = `${indent}${definirStatement(varName)}\n`;
  return { afterLine, text };
}
