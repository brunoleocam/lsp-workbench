/**
 * Reescritas semânticas para Ctrl+Espaço / QF (testáveis sem vscode).
 * Ordem: mais próximo semanticamente primeiro.
 */

export type RewriteOption = {
  /** Título curto na lista */
  label: string;
  detail: string;
  /** Texto a inserir no lugar da instrução */
  insertText: string;
  /** sortText: menor = primeiro */
  sortKey: string;
  /** Se true, o 2º parâmetro ainda precisa de numeral/variável Numero (aviso) */
  needsDecimaisWarning?: boolean;
  /** Se true, insertText é snippet VS Code (`${1:…}`) — tab para preencher */
  isSnippet?: boolean;
};

function indentOf(line: string): string {
  const m = line.match(/^(\s*)/);
  return m ? m[1] : "";
}

/** Intervalo da chamada Truncar(...); / Arredond*(...); na linha. */
export function findCallSpan(
  line: string,
  fnName: RegExp
): { start: number; end: number; text: string } | null {
  const re = new RegExp(
    String.raw`${fnName.source}\s*\([^;]*\)\s*;?`,
    fnName.flags.includes("i") ? "i" : ""
  );
  const m = line.match(re);
  if (!m || m.index === undefined) return null;
  return { start: m.index, end: m.index + m[0].length, text: m[0] };
}

/**
 * Truncar(vnX, vnY); → opções (Truncar retorno primeiro).
 */
export function truncarRewriteOptions(line: string): RewriteOption[] {
  const ind = indentOf(line);
  const two = line.match(/\bTruncar\s*\(\s*([^,]+)\s*,\s*([^,)]+)\s*\)\s*;/i);
  if (!two) {
    return [
      {
        label: "Truncar",
        detail: "Truncar(Numero) — retorna valor",
        insertText: `${ind}vnResultado = Truncar(vnValor);`,
        sortKey: "01",
      },
      {
        label: "TruncarDecimal",
        detail: "TruncarDecimal(End Valor, Decimais)",
        insertText: `${ind}TruncarDecimal(vnValor, vnDecimais);`,
        sortKey: "02",
      },
      {
        label: "TruncarValor",
        detail: "TruncarValor(End ValorVariavel)",
        insertText: `${ind}TruncarValor(vnValor);`,
        sortKey: "03",
      },
    ];
  }

  const a = two[1].trim();
  const b = two[2].trim();
  const opts: RewriteOption[] = [];

  if (/^\d+$/.test(b)) {
    opts.push({
      label: "TruncarDecimal",
      detail: `TruncarDecimal(${a}, ${b})`,
      insertText: `${ind}TruncarDecimal(${a}, ${b});`,
      sortKey: "01",
    });
    opts.push({
      label: "Truncar",
      detail: `${a} truncado via retorno (ignora casas)`,
      insertText: `${ind}vnResultado = Truncar(${a});`,
      sortKey: "02",
    });
  } else {
    opts.push({
      label: "Truncar",
      detail: `${b} = Truncar(${a});`,
      insertText: `${ind}${b} = Truncar(${a});`,
      sortKey: "01",
    });
    opts.push({
      label: "TruncarValor",
      detail: `copiar + TruncarValor(${b})`,
      insertText: `${ind}${b} = ${a};\n${ind}TruncarValor(${b});`,
      sortKey: "02",
    });
    opts.push({
      label: "TruncarDecimal",
      detail: `TruncarDecimal(${a}, vnDecimais)`,
      insertText: `${ind}TruncarDecimal(${a}, vnDecimais);`,
      sortKey: "03",
    });
  }

  return opts;
}

/** Família de arredondamento (nunca atribuição — Arredonda altera o 1º param). */
function roundingFamily(
  ind: string,
  valor: string,
  casas: string,
  needsWarning: boolean
): RewriteOption[] {
  // Param pendente: convenção <> na UI + snippet ${1:} no insert (padrão VS Code)
  const casasLabel = needsWarning ? "<vnDecimais>" : casas;
  const casasInsert = needsWarning ? "${1:vnDecimais}" : casas;
  return [
    {
      label: "Arredonda",
      detail: `Arredonda(${valor}, ${casasLabel})`,
      insertText: `${ind}Arredonda(${valor}, ${casasInsert});`,
      sortKey: "01",
      needsDecimaisWarning: needsWarning || undefined,
      isSnippet: needsWarning || undefined,
    },
    {
      label: "ArredondaABNT",
      detail: `ArredondaABNT(${valor}, ${casasLabel})`,
      insertText: `${ind}ArredondaABNT(${valor}, ${casasInsert});`,
      sortKey: "02",
      needsDecimaisWarning: needsWarning || undefined,
      isSnippet: needsWarning || undefined,
    },
    {
      label: "ArredondarValor",
      detail: `ArredondarValor(${valor}, ${casasLabel})`,
      insertText: `${ind}ArredondarValor(${valor}, ${casasInsert});`,
      sortKey: "03",
      needsDecimaisWarning: needsWarning || undefined,
      isSnippet: needsWarning || undefined,
    },
    {
      label: "ArredondarValorEx",
      detail: `ArredondarValorEx(${valor}, ${casasLabel})`,
      insertText: `${ind}ArredondarValorEx(${valor}, ${casasInsert});`,
      sortKey: "04",
      needsDecimaisWarning: needsWarning || undefined,
      isSnippet: needsWarning || undefined,
    },
    {
      label: "ArredondaValorTipoAcerto",
      detail: `ArredondaValorTipoAcerto(${valor}, <vnTipoAcerto>)`,
      insertText: `${ind}ArredondaValorTipoAcerto(${valor}, \${1:vnTipoAcerto});`,
      sortKey: "05",
      isSnippet: true,
    },
  ];
}

/**
 * Arredondar(...) / Arredonda(...) → família válida.
 * - Arredondar(vnX, 2, vnY) → Arredonda(vnX, 2);  (literal; sem criar vnCasas; sem atribuição)
 * - Arredondar(vnX, vnY) → Arredonda(vnX, vnY);
 * - Arredondar(vnX) / Arredonda(vnX) → Arredonda(vnX, <vnDecimais>); (1º preservado; 2º pendente)
 * Nunca gera `vnY = Arredonda(...)` (Arredonda não retorna valor).
 */
export function arredondarRewriteOptions(line: string): RewriteOption[] {
  const ind = indentOf(line);

  // Já é Arredonda / ArredondaABNT com 1 arg (FUN006) — preservar valor; Decimais pendente
  const validOne = line.match(
    /\b(Arredonda(?:ABNT)?)\s*\(\s*([^,)]+)\s*\)\s*;/i
  );
  if (validOne && !/\bArredondar\s*\(/i.test(line)) {
    return roundingFamily(ind, validOne[2].trim(), "vnDecimais", true);
  }

  // Arredondar inexistente — 1 argumento
  const one = line.match(/\bArredondar\s*\(\s*([^,)]+)\s*\)\s*;/i);
  const multi = line.match(
    /\bArredondar\s*\(\s*([^,]+)\s*,\s*([^,)]+)\s*(?:,\s*([^)]+))?\s*\)\s*;/i
  );

  if (one && !multi) {
    return roundingFamily(ind, one[1].trim(), "vnDecimais", true);
  }

  if (multi) {
    // 3º arg (out) ignorado — Arredonda altera o 1º parâmetro (nunca atribui ao 3º)
    return roundingFamily(ind, multi[1].trim(), multi[2].trim(), false);
  }

  // Sem chamada parseável (só digitando "Arredond…"): template com placeholders
  return roundingFamily(ind, "vnValor", "vnDecimais", true);
}

/** Máscara FormatarData dentro de aspas. */
export function formatarDataMaskOptions(mask: string): RewriteOption[] | null {
  if (!/(?:YYYY|\bDD\b|\bMM\b)/.test(mask)) return null;
  const fixed = mask.replace(/YYYY/g, "yyyy").replace(/DD/g, "dd").replace(/MM/g, "mm");
  if (fixed === mask) return null;
  return [
    {
      label: `"${fixed}"`,
      detail: "Máscara FormatarData em minúsculos",
      insertText: `"${fixed}"`,
      sortKey: "01",
    },
  ];
}
