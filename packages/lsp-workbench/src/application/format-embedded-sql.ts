/**
 * Format SQL embutido elegível (application — opt-in PDR-004).
 * Heurística segura: só literais estáticas em ExecSql / .SQL / SQL_DefinirComando.
 */

export type EmbeddedSqlOptions = {
  enabled: boolean;
  dialect: "sql" | "oracle" | "sqlserver";
};

/** Indentação simples de SQL (keywords em maiúsculas em linhas próprias). */
export function formatSqlLiteral(sql: string): string {
  let s = sql.replace(/\s+/g, " ").trim();
  const keywords = [
    "SELECT",
    "FROM",
    "WHERE",
    "AND",
    "OR",
    "ORDER BY",
    "GROUP BY",
    "HAVING",
    "JOIN",
    "LEFT JOIN",
    "INNER JOIN",
    "INSERT",
    "UPDATE",
    "DELETE",
    "SET",
    "VALUES",
  ];
  for (const kw of keywords) {
    const re = new RegExp(`\\b${kw}\\b`, "gi");
    s = s.replace(re, `\n${kw}`);
  }
  return s
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .join("\n");
}

/**
 * Formata literais SQL em contextos reconhecidos; no-op se houver concat `+` na expressão.
 */
export function formatEmbeddedSqlInSource(
  source: string,
  opts: EmbeddedSqlOptions
): string {
  if (!opts.enabled) return source;

  // ExecSql("...") / ExecSQLEx("...")
  let out = source.replace(
    /\b(ExecSQLEx?)\s*\(\s*"([^"]+)"\s*\)/gi,
    (full, fn: string, sql: string) => {
      if (/\+/.test(full)) return full;
      const formatted = formatSqlLiteral(sql).replace(/\n/g, " \\\n");
      return `${fn}("${formatted}")`;
    }
  );

  // Cur.SQL = "..."
  out = out.replace(
    /(\w+\.SQL\s*=\s*)"([^"]+)"/gi,
    (full, lhs: string, sql: string) => {
      if (full.includes("+")) return full;
      const formatted = formatSqlLiteral(sql).replace(/\n/g, " \\\n");
      return `${lhs}"${formatted}"`;
    }
  );

  // SQL_DefinirComando(h, "...")
  out = out.replace(
    /\b(SQL_DefinirComando)\s*\(\s*(\w+)\s*,\s*"([^"]+)"\s*\)/gi,
    (full, fn: string, handle: string, sql: string) => {
      if (/\+/.test(full)) return full;
      const formatted = formatSqlLiteral(sql).replace(/\n/g, " \\\n");
      return `${fn}(${handle}, "${formatted}")`;
    }
  );

  return out;
}
