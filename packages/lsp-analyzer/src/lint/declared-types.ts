/**
 * Tipos conhecidos de nomes do arquivo (PDR-012 REQ-050), compartilhados por FUN012 e TYP*.
 * Sem `Definir`, o tipo fica desconhecido: o Senior aceita a variável como Numero implícito,
 * mas ela pode ser global de outra seção ou de outro arquivo do escopo.
 */
import { normalizeParamType } from "./function-signature";

/** Tipo de valor para compatibilidade: `Data` e `Hora` contam como Numero. */
export type ValueType = "Alfa" | "Numero";

export type Declarations = {
  types: Map<string, ValueType | undefined>;
  cursors: Set<string>;
  functions: Set<string>;
};

export function baseType(raw: string | undefined): ValueType | undefined {
  const t = normalizeParamType(raw);
  if (t === "Alfa") return "Alfa";
  if (t === "Numero" || t === "Data") return "Numero";
  return undefined;
}

export function typeLabel(t: ValueType | undefined): string {
  if (t === "Alfa") return "ALFA";
  if (t === "Numero") return "NUMERO";
  return "?";
}

function declare(types: Declarations["types"], name: string, t: ValueType | undefined): void {
  const key = name.toLowerCase();
  // mesmo nome com tipos diferentes em funções distintas: não arrisca
  types.set(key, types.has(key) && types.get(key) !== t ? undefined : t);
}

/** `masked` = fonte com comentários e miolo de strings mascarados (offsets preservados). */
export function collectDeclarations(masked: string): Declarations {
  const types = new Map<string, ValueType | undefined>();
  const cursors = new Set<string>();
  const functions = new Set<string>();
  for (const m of masked.matchAll(/\bDefinir\s+(Alfa|Numero|Data|Lista|Cursor)\s+([A-Za-z_]\w*)/gi)) {
    const tipo = m[1].toLowerCase();
    if (tipo === "cursor") cursors.add(m[2].toLowerCase());
    declare(types, m[2], baseType(tipo));
  }
  for (const m of masked.matchAll(/\bFuncao\s+([A-Za-z_]\w*)\s*\(([^)]*)\)/gi)) {
    functions.add(m[1].toLowerCase());
    for (const p of m[2].matchAll(/\b(Alfa|Numero|Data)\s+(?:End\s+)?([A-Za-z_]\w*)/gi)) {
      declare(types, p[2], baseType(p[1]));
    }
  }
  return { types, cursors, functions };
}

/**
 * Tipo de coluna do catálogo de banco (`Alfa(14)`, `Número(15,2)`, `Data`, `Hora`)
 * ou do dicionário (`TRtPhyString`, `TRtPhyNumber`, `TRtPhyDate`, `TRtPhyTime`).
 */
export function catalogColumnValueType(raw: string | undefined): ValueType | undefined {
  const t = (raw ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (/^alfa\b|^trtphystring$/.test(t)) return "Alfa";
  if (/^(numero|data|hora)\b|^trtphy(number|date|time)$/.test(t)) return "Numero";
  return undefined;
}
