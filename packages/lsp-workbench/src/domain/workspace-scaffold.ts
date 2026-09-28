/** Arquivos que o comando Configurar este Workspace grava no projeto. */

export type ScaffoldSourceFile = {
  /** Caminho relativo à raiz dos templates (`rules/`, `skills/`, `commands/`). */
  path: string;
  contents: string;
};

export type PlannedFile = {
  /** Caminho relativo à raiz do workspace, com `/`. */
  path: string;
  contents: string;
};

export type ScaffoldPartition = {
  create: PlannedFile[];
  unchanged: PlannedFile[];
  conflict: PlannedFile[];
};

const ALWAYS_ORDER = ["lsp-nucleo", "global-rules", "mcp-triagem-obrigatoria", "regras-memoria-evolucao"];

type Frontmatter = {
  attrs: Record<string, string | string[]>;
  body: string;
};

function normalizeNewlines(text: string): string {
  return text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
}

function unquote(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function yamlQuote(value: string): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function parseFrontmatter(text: string): Frontmatter {
  const normalized = normalizeNewlines(text);
  if (!normalized.startsWith("---")) {
    return { attrs: {}, body: normalized.trimStart() };
  }
  const end = normalized.indexOf("\n---", 3);
  if (end === -1) {
    return { attrs: {}, body: normalized.trimStart() };
  }
  const raw = normalized.slice(3, end).replace(/^\n/, "");
  const body = normalized.slice(end + 4).replace(/^\n/, "");
  const attrs: Record<string, string | string[]> = {};
  const lines = raw.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (!match) continue;
    const key = match[1];
    const value = match[2].trim();
    if (value === "" || value === "|" || value === ">") {
      const items: string[] = [];
      while (i + 1 < lines.length && /^\s+-\s+/.test(lines[i + 1])) {
        i++;
        items.push(unquote(lines[i].replace(/^\s+-\s+/, "").trim()));
      }
      attrs[key] = items;
      continue;
    }
    attrs[key] = unquote(value);
  }
  return { attrs, body };
}

function isAlways(attrs: Record<string, string | string[]>): boolean {
  return attrs.alwaysApply === "true";
}

function applyToFrom(attrs: Record<string, string | string[]>, fileName: string): string {
  const globs = attrs.globs;
  if (Array.isArray(globs) && globs.length > 0) return globs.join(",");
  if (typeof globs === "string" && globs.length > 0) return globs;
  if (fileName.startsWith("lsp")) return "**/*.{lsp,lspt}";
  return "**/*";
}

function posix(path: string): string {
  return path.replace(/\\/g, "/");
}

function assertSafeRelative(path: string): string {
  const normalized = posix(path).replace(/^\.\//, "");
  if (normalized.startsWith("/") || normalized.includes("../") || normalized === "..") {
    throw new Error(`Caminho de template inválido: ${path}`);
  }
  return normalized;
}

function githubFromCursor(sources: ScaffoldSourceFile[]): PlannedFile[] {
  const planned: PlannedFile[] = [];
  const always: { stem: string; body: string }[] = [];

  for (const source of sources) {
    const rel = assertSafeRelative(source.path);
    if (rel.startsWith("skills/")) {
      planned.push({ path: `.github/${rel}`, contents: normalizeNewlines(source.contents) });
      continue;
    }
    if (rel.startsWith("commands/") && rel.endsWith(".md")) {
      const stem = rel.slice("commands/".length, -".md".length);
      const { attrs, body } = parseFrontmatter(source.contents);
      const name = typeof attrs.name === "string" ? attrs.name : stem;
      const description = typeof attrs.description === "string" ? attrs.description : name;
      planned.push({
        path: `.github/prompts/${stem}.prompt.md`,
        contents: `---\nname: ${yamlQuote(name)}\ndescription: ${yamlQuote(description)}\nagent: agent\n---\n\n${body.trim()}\n`,
      });
      continue;
    }
    if (!rel.startsWith("rules/") || !rel.endsWith(".mdc")) continue;
    const stem = rel.slice("rules/".length, -".mdc".length);
    const { attrs, body } = parseFrontmatter(source.contents);
    if (isAlways(attrs)) {
      always.push({ stem, body: body.trim() });
      continue;
    }
    const description = typeof attrs.description === "string" ? attrs.description : stem;
    const applyTo = applyToFrom(attrs, stem);
    planned.push({
      path: `.github/instructions/${stem}.instructions.md`,
      contents: `---\ndescription: ${yamlQuote(description)}\napplyTo: ${yamlQuote(applyTo)}\n---\n\n${body.trim()}\n`,
    });
  }

  always.sort((a, b) => {
    const ia = ALWAYS_ORDER.indexOf(a.stem);
    const ib = ALWAYS_ORDER.indexOf(b.stem);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.stem.localeCompare(b.stem);
  });
  const sections = always.map((rule) => rule.body).filter(Boolean);
  planned.push({
    path: ".github/copilot-instructions.md",
    contents: [
      "Instruções de workspace do LSP Workbench para o GitHub Copilot.",
      "",
      "Para criar SQL ou consultar tabela, coluna, chave ou enum, use o `catalog.json` resolvido pela extensão LSP Workbench: `lsp.catalog.path` ou, se existir no projeto, `docs/banco-senior/.generated/catalog.json`, `docs/banco-senior-base/.generated/catalog.json`, `docs/banco-senior-base/catalog.json`.",
      "",
      ...sections.flatMap((section) => [section, ""]),
    ]
      .join("\n")
      .trimEnd()
      .concat("\n"),
  });
  return planned;
}

export function planWorkspaceScaffold(sources: ScaffoldSourceFile[]): PlannedFile[] {
  const cursor = sources.map((source) => {
    const rel = assertSafeRelative(source.path);
    if (!rel.startsWith("rules/") && !rel.startsWith("skills/") && !rel.startsWith("commands/")) {
      throw new Error(`Caminho de template inválido: ${source.path}`);
    }
    return { path: `.cursor/${rel}`, contents: normalizeNewlines(source.contents) };
  });
  return [...cursor, ...githubFromCursor(sources)];
}

export function partitionScaffold(
  planned: PlannedFile[],
  readExisting: (relativePath: string) => string | null
): ScaffoldPartition {
  const create: PlannedFile[] = [];
  const unchanged: PlannedFile[] = [];
  const conflict: PlannedFile[] = [];
  for (const file of planned) {
    const existing = readExisting(file.path);
    if (existing == null) {
      create.push(file);
      continue;
    }
    if (normalizeNewlines(existing) === normalizeNewlines(file.contents)) {
      unchanged.push(file);
    } else {
      conflict.push(file);
    }
  }
  return { create, unchanged, conflict };
}

/** Acrescenta associações da Linguagem Senior sem trocar um mapeamento que o workspace já definiu. */
export function mergeFileAssociations(
  workspaceValue: Record<string, string> | undefined
): { value: Record<string, string>; changed: boolean } {
  const current = { ...(workspaceValue ?? {}) };
  const wanted: Record<string, string> = {
    "*.lsp": "senior-lsp",
    "*.lspt": "senior-lsp",
  };
  let changed = false;
  for (const [key, value] of Object.entries(wanted)) {
    if (current[key] == null) {
      current[key] = value;
      changed = true;
    }
  }
  return { value: current, changed };
}
