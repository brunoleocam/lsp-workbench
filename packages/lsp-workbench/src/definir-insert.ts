/** Onde e como inserir `Definir Tipo nome;` (SEM001) — puro / testável. */

export type DefinirKind = "Alfa" | "Numero" | "Data" | "Lista" | "Cursor";

export function tipoFromPrefix(name: string): DefinirKind {
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

/**
 * Linha (0-based) após a qual inserir o Definir.
 * - Se `refLine` está dentro de `Funcao … { … }`, após o último Definir do corpo (ou logo após `{`).
 * - Senão, após o último Definir do nível do arquivo (bloco inicial).
 */
export function findDefinirInsertAfterLine(source: string, refLine: number): number {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const n = lines.length;
  const ref = Math.max(0, Math.min(refLine, n - 1));

  // Escopo de função: achar Funcao acima e o { correspondente
  let funcStart = -1;
  for (let i = ref; i >= 0; i--) {
    if (/^\s*Funcao\b/i.test(lines[i])) {
      funcStart = i;
      break;
    }
  }

  let scopeFrom = 0;
  let scopeTo = ref;

  if (funcStart >= 0) {
    let braceLine = -1;
    for (let i = funcStart; i <= ref; i++) {
      if (lines[i].includes("{")) {
        braceLine = i;
        break;
      }
    }
    if (braceLine >= 0) {
      scopeFrom = braceLine;
      scopeTo = ref;
      let lastDef = -1;
      for (let i = scopeFrom; i <= scopeTo; i++) {
        if (/^\s*Definir\s+/i.test(lines[i])) lastDef = i;
      }
      if (lastDef >= 0) return lastDef;
      return braceLine;
    }
  }

  // Arquivo: último Definir antes de sair do bloco inicial de declarações,
  // ou o último Definir acima de refLine
  let lastDef = -1;
  for (let i = 0; i <= ref; i++) {
    if (/^\s*Definir\s+/i.test(lines[i])) {
      lastDef = i;
    }
  }
  if (lastDef >= 0) return lastDef;

  // nenhum Definir ainda: inserir no topo (após comentários iniciais)
  let insert = 0;
  while (insert < n && (/^\s*$/.test(lines[insert]) || /^\s*@/.test(lines[insert]) || /^\s*\/\*/.test(lines[insert]))) {
    insert++;
  }
  return Math.max(0, insert - 1);
}

/** Texto completo a inserir (com \n), pronto para TextEdit.insert na linha seguinte. */
export function buildDefinirInsertEdit(
  source: string,
  refLine: number,
  varName: string
): { afterLine: number; text: string } {
  const afterLine = findDefinirInsertAfterLine(source, refLine);
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const indentMatch = lines[afterLine]?.match(/^(\s*)/);
  // Definir de arquivo costuma sem indent; dentro de função herda indent do bloco + 2 se após `{`
  let indent = indentMatch ? indentMatch[1] : "";
  if (/{\s*$/.test(lines[afterLine] || "") && indent === "") {
    indent = "  ";
  } else if (/{\s*$/.test(lines[afterLine] || "")) {
    indent = indent + "  ";
  }
  const text = `${indent}${definirStatement(varName)}\n`;
  return { afterLine, text };
}
