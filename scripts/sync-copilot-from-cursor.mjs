/**
 * Espelha `.cursor` (rules, skills, commands) para o GitHub Copilot em `.github`.
 * Fonte: `.cursor`. Rode de novo depois de editar rules/skills/commands.
 *
 *   node scripts/sync-copilot-from-cursor.mjs
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const cursorDir = path.join(root, ".cursor");
const githubDir = path.join(root, ".github");

const ALWAYS_ORDER = [
  "lsp-nucleo",
  "global-rules",
  "mcp-triagem-obrigatoria",
  "regras-memoria-evolucao",
];

function parseFrontmatter(text) {
  const normalized = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
  if (!normalized.startsWith("---")) {
    return { attrs: {}, body: normalized.trimStart() };
  }
  const end = normalized.indexOf("\n---", 3);
  if (end === -1) {
    return { attrs: {}, body: normalized.trimStart() };
  }
  const raw = normalized.slice(3, end).replace(/^\r?\n/, "");
  const body = normalized.slice(end + 4).replace(/^\r?\n/, "");
  const attrs = {};
  const lines = raw.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (!match) continue;
    const key = match[1];
    const value = match[2].trim();
    if (value === "" || value === "|" || value === ">") {
      const items = [];
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

function unquote(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function yamlQuote(value) {
  return `"${String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function applyToFrom(attrs, fileName) {
  const globs = attrs.globs;
  if (Array.isArray(globs) && globs.length > 0) return globs.join(",");
  if (typeof globs === "string" && globs.length > 0) return globs;
  if (fileName.startsWith("lsp")) return "**/*.{lsp,lspt}";
  return "**/*";
}

function isAlways(attrs) {
  return attrs.alwaysApply === "true" || attrs.alwaysApply === true;
}

function resetDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

function copySkills() {
  const src = path.join(cursorDir, "skills");
  const dest = path.join(githubDir, "skills");
  resetDir(dest);
  fs.cpSync(src, dest, { recursive: true });
}

function writePrompts() {
  const src = path.join(cursorDir, "commands");
  const dest = path.join(githubDir, "prompts");
  resetDir(dest);
  for (const file of fs.readdirSync(src).filter((name) => name.endsWith(".md"))) {
    const text = fs.readFileSync(path.join(src, file), "utf8");
    const { attrs, body } = parseFrontmatter(text);
    const stem = file.replace(/\.md$/, "");
    const name = attrs.name || stem;
    const description = attrs.description || name;
    const out = `---\nname: ${yamlQuote(name)}\ndescription: ${yamlQuote(description)}\nagent: agent\n---\n\n${body.trim()}\n`;
    fs.writeFileSync(path.join(dest, `${stem}.prompt.md`), out, "utf8");
  }
}

function writeRules() {
  const src = path.join(cursorDir, "rules");
  const dest = path.join(githubDir, "instructions");
  resetDir(dest);
  const files = fs
    .readdirSync(src)
    .filter((name) => name.endsWith(".mdc"))
    .map((name) => {
      const text = fs.readFileSync(path.join(src, name), "utf8");
      const parsed = parseFrontmatter(text);
      return { stem: name.replace(/\.mdc$/, ""), ...parsed };
    });

  const always = [];
  const scoped = [];
  for (const rule of files) {
    if (isAlways(rule.attrs)) always.push(rule);
    else scoped.push(rule);
  }
  always.sort((a, b) => {
    const ia = ALWAYS_ORDER.indexOf(a.stem);
    const ib = ALWAYS_ORDER.indexOf(b.stem);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.stem.localeCompare(b.stem);
  });

  const sections = always.map((rule) => rule.body.trim()).filter(Boolean);
  const instructions = [
    "Instruções de workspace do LSP Workbench para o GitHub Copilot (espelho das regras sempre ativas de `.cursor/rules`).",
    "",
    "Para criar SQL ou consultar tabela, coluna, chave ou enum, use o `catalog.json` local. Ordem: `lsp.catalog.path`, `docs/banco-senior/.generated/catalog.json`, `docs/banco-senior-base/.generated/catalog.json`, `docs/banco-senior-base/catalog.json`.",
    "",
    ...sections.flatMap((section) => [section, ""]),
  ];
  fs.writeFileSync(path.join(githubDir, "copilot-instructions.md"), `${instructions.join("\n").trim()}\n`, "utf8");

  for (const rule of scoped) {
    const description = rule.attrs.description || rule.stem;
    const applyTo = applyToFrom(rule.attrs, rule.stem);
    const out = `---\ndescription: ${yamlQuote(description)}\napplyTo: ${yamlQuote(applyTo)}\n---\n\n${rule.body.trim()}\n`;
    fs.writeFileSync(path.join(dest, `${rule.stem}.instructions.md`), out, "utf8");
  }
}

copySkills();
writePrompts();
writeRules();
console.log("Copilot espelhado em .github/ (instructions, skills, prompts, copilot-instructions.md)");
