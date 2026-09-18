/**
 * Heurística nível A: texto SQL que tipicamente exige dialeto nativo
 * (SQL_UsarAbrangencia(0) + SQL_UsarSQLSenior2(0) antes de DefinirComando).
 * Não é um parser completo — falsos positivos/negativos são aceitáveis.
 */

/** JOIN / subquery (SELECT aninhado) → SQL Senior 2 costuma falhar. */
export function sqlNeedsNativeDialect(sql: string): boolean {
  const s = sql.replace(/\\\s*/g, " ").replace(/\s+/g, " ").trim();
  if (!s) return false;
  if (/\b(INNER|LEFT|RIGHT|FULL|CROSS|NATURAL|KEYED)\s+JOIN\b/i.test(s)) return true;
  if (/\bJOIN\b/i.test(s)) return true;
  if (/\(\s*SELECT\b/i.test(s)) return true;
  if (/\bEXISTS\s*\(\s*SELECT\b/i.test(s)) return true;
  if (/\bIN\s*\(\s*SELECT\b/i.test(s)) return true;
  return false;
}

/**
 * Extrai o 2º argumento de `SQL_DefinirComando(handle, …)`.
 * Aceita literal entre aspas, identificador, ou SQL sem aspas (estilo doc Senior).
 */
export function extractDefinirComandoSqlArg(line: string): {
  handle: string;
  arg: string;
  indent: string;
} | null {
  const m = line.match(/^(\s*)SQL_DefinirComando\s*\(\s*(\w+)\s*,\s*(.+?)\s*\)\s*;?\s*$/i);
  if (!m) return null;
  return { indent: m[1], handle: m[2], arg: m[3].trim() };
}

/** Resolve texto SQL a partir do arg + mapa de literais Alfa rastreados. */
export function resolveSqlText(
  arg: string,
  alfaLiterals: ReadonlyMap<string, string>
): string | null {
  if (arg.startsWith('"') && arg.endsWith('"') && arg.length >= 2) {
    return arg.slice(1, -1);
  }
  if (/^\w+$/.test(arg)) {
    return alfaLiterals.get(arg.toLowerCase()) ?? null;
  }
  // SQL sem aspas (ex.: SELECT … FROM …)
  if (/\b(SELECT|INSERT|UPDATE|DELETE|WITH)\b/i.test(arg)) {
    return arg;
  }
  return null;
}

/** Motivo curto para mensagem de diagnóstico. */
export function nativeNeedReason(sql: string): string {
  const s = sql.replace(/\\\s*/g, " ").replace(/\s+/g, " ");
  if (/\(\s*SELECT\b/i.test(s) || /\bEXISTS\s*\(\s*SELECT\b/i.test(s) || /\bIN\s*\(\s*SELECT\b/i.test(s)) {
    return "subquery";
  }
  if (/\bJOIN\b/i.test(s)) return "JOIN";
  return "SQL nativo";
}
