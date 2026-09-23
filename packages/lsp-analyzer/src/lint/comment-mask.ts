/**
 * Mascara comentarios (@...@, @ ate EOL, bloco slash-star) e strings, preservando offsets.
 * Usado por diagnosticos e semantic tokens para nao analisar texto em comentarios.
 */

/** Substitui intervalo [start, end) por espaços (preserva `\n`). */
function spaceOut(chars: string[], start: number, end: number): void {
  for (let i = start; i < end && i < chars.length; i++) {
    if (chars[i] !== "\n") chars[i] = " ";
  }
}

/**
 * Versao full-source: mascara @...@ / @ ate EOL, bloco slash-star e miolo de "...".
 * Comprimento e quebras de linha inalterados → indices batem com o fonte original.
 */
export function maskCommentsAndStrings(source: string): string {
  const s = source.replace(/\r\n/g, "\n");
  const chars = s.split("");
  let i = 0;
  while (i < chars.length) {
    const ch = chars[i];

    // @…@ ou @ até fim da linha
    if (ch === "@") {
      const start = i;
      i++;
      while (i < chars.length && chars[i] !== "@" && chars[i] !== "\n") i++;
      if (i < chars.length && chars[i] === "@") i++;
      spaceOut(chars, start, i);
      continue;
    }

    // /* … */
    if (ch === "/" && chars[i + 1] === "*") {
      const start = i;
      i += 2;
      while (i < chars.length - 1 && !(chars[i] === "*" && chars[i + 1] === "/")) {
        i++;
      }
      if (i < chars.length - 1) i += 2;
      else i = chars.length;
      spaceOut(chars, start, i);
      continue;
    }

    // "…" (respeita \)
    if (ch === '"') {
      const start = i;
      i++;
      while (i < chars.length && chars[i] !== '"') {
        if (chars[i] === "\\" && i + 1 < chars.length) {
          i += 2;
          continue;
        }
        if (chars[i] === "\n") break; // string sem fechar: para no EOL
        i++;
      }
      if (i < chars.length && chars[i] === '"') i++;
      // preserva as aspas; mascara só o miolo (e escapes)
      spaceOut(chars, start + 1, i > start && chars[i - 1] === '"' ? i - 1 : i);
      continue;
    }

    i++;
  }
  return chars.join("");
}

/** Atalho por linha (sem bloco multi-linha aberto de fora). */
export function maskCommentsAndStringsLine(line: string): string {
  return maskCommentsAndStrings(line);
}
