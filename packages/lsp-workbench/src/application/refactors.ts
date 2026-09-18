/**
 * Refactors de texto (application — sem vscode).
 */

export type TextEditDto = { start: number; end: number; newText: string };

export function wrapSelection(
  source: string,
  start: number,
  end: number,
  kind: "se" | "enquanto" | "para" | "bloco"
): string {
  const selected = source.slice(start, end);
  const body = selected.trimEnd() || "  ";
  let wrapped: string;
  switch (kind) {
    case "se":
      wrapped = `Se (vnCond) {\n${indentBlock(body)}\n}`;
      break;
    case "enquanto":
      wrapped = `Enquanto (vnCond) {\n${indentBlock(body)}\n}`;
      break;
    case "para":
      wrapped = `Para (vnI = 0; vnI < vnN; vnI = vnI + 1) {\n${indentBlock(body)}\n}`;
      break;
    case "bloco":
    default:
      wrapped = `{\n${indentBlock(body)}\n}`;
      break;
  }
  return source.slice(0, start) + wrapped + source.slice(end);
}

function indentBlock(text: string): string {
  return text
    .split("\n")
    .map((l) => (l.trim() ? "  " + l : l))
    .join("\n");
}

/** Converte Inicio…Fim; em braces no trecho (simplificado). */
export function toggleInicioFimToBraces(source: string): string {
  return source
    .replace(/\bInicio\b/gi, "{")
    .replace(/\bFimSe\b/gi, "}")
    .replace(/\bFimEnquanto\b/gi, "}")
    .replace(/\bFim\s*;/gi, "}");
}

/** Literais multilinha com `\` → concatenação `+` (heurística). */
export function backslashLiteralToConcat(source: string): string {
  return source.replace(
    /"([^"\\]*(?:\\.[^"\\]*)*)"\s*\\\s*\r?\n\s*"([^"]*)"/g,
    (_m, a: string, b: string) => `"${a}" + "${b}"`
  );
}

export type RefactorKind = "wrapSe" | "wrapEnquanto" | "wrapPara" | "wrapBloco" | "toggleBraces" | "concatBackslash";
