export type FormatOptions = {
  indentSize: number;
  useTabs: boolean;
  braceStyle: "sameLine" | "nextLine";
};

const DEFAULTS: FormatOptions = {
  indentSize: 2,
  useTabs: false,
  braceStyle: "sameLine",
};

/** Formatação mínima: normaliza espaços ao redor de `{`/`}` e indenta por profundidade. */
export function formatLsp(source: string, options: Partial<FormatOptions> = {}): string {
  const opts = { ...DEFAULTS, ...options };
  const indentUnit = opts.useTabs ? "\t" : " ".repeat(opts.indentSize);
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let depth = 0;

  for (let raw of lines) {
    let line = raw.replace(/\s+$/g, "");
    const trimmed = line.trim();
    if (trimmed === "") {
      out.push("");
      continue;
    }

    // Fechar braces diminuem indent antes
    if (trimmed.startsWith("}")) {
      depth = Math.max(0, depth - 1);
    }

    if (opts.braceStyle === "sameLine") {
      line = trimmed.replace(/\)\s*\n\s*\{/g, ") {");
      // Se { sozinho após Se (...), juntar na prática já vem na mesma linha tipicamente
    }

    out.push(indentUnit.repeat(depth) + trimmed);

    const opens = (trimmed.match(/\{/g) || []).length;
    const closes = (trimmed.match(/\}/g) || []).length;
    // Se a linha abre e não é só `}`, depth já foi ajustado para closes no início
    if (!trimmed.startsWith("}")) {
      depth += opens - closes;
    } else {
      depth += opens;
    }
    depth = Math.max(0, depth);
  }

  return out.join("\n").replace(/\n+$/g, "\n");
}
