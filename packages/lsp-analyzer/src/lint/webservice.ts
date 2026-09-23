/**
 * Declaração de WebService Senior:
 *   Definir interno.com.empresa.servico.Porta wsNome;
 * Tipo = caminho pontuado; nome = instância.
 */

const BUILTIN_DEFINIR_TYPES =
  /^(Alfa|Numero|Data|Lista|Cursor|Tabela|Funcao|Grid)$/i;

/**
 * `Definir <caminho.pontuado> <nomeInstancia>` — exige ao menos um `.` no tipo.
 */
export function matchDefinirWebService(
  line: string
): { typePath: string; name: string } | null {
  const cleaned = line
    .trim()
    .replace(/@[^@]*@/g, " ")
    .replace(/@[^\n]*$/g, "")
    .replace(/\/\*.*?\*\//g, " ")
    .trim();
  const m = cleaned.match(/^Definir\s+([\w.]+)\s+(\w+)\s*;?\s*$/i);
  if (!m) return null;
  const typePath = m[1];
  const name = m[2];
  if (!typePath.includes(".")) return null;
  if (BUILTIN_DEFINIR_TYPES.test(typePath)) return null;
  const first = typePath.split(".")[0] ?? "";
  if (BUILTIN_DEFINIR_TYPES.test(first) && typePath.split(".").length === 1) {
    return null;
  }
  return { typePath, name };
}

export function isBuiltinDefinirType(tipo: string): boolean {
  return BUILTIN_DEFINIR_TYPES.test(tipo);
}
