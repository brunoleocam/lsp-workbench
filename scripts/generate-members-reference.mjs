#!/usr/bin/env node
/**
 * Gera referência de membros Cursor/Lista para o Agent (espelho de domain/members.ts).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const membersTs = path.join(
  __dirname,
  "..",
  "packages",
  "lsp-workbench",
  "src",
  "domain",
  "members.ts"
);
const outPath = path.join(
  __dirname,
  "..",
  "packages",
  "lsp-workbench-agent",
  "skills",
  "lsp-linguagem",
  "reference-membros.md"
);

const src = fs.readFileSync(membersTs, "utf8");

function extractArray(name) {
  const re = new RegExp(`export const ${name}[^=]*=\\s*\\[([\\s\\S]*?)\\];`);
  const m = src.match(re);
  if (!m) return [];
  const block = m[1];
  const items = [];
  for (const mm of block.matchAll(
    /name:\s*"([^"]+)"[\s\S]*?kind:\s*"([^"]+)"[\s\S]*?documentation:\s*"([^"]*)"/g
  )) {
    items.push({ name: mm[1], kind: mm[2], documentation: mm[3] });
  }
  return items;
}

const cursor = extractArray("CURSOR_MEMBERS");
const lista = extractArray("LISTA_MEMBERS");

let md = `# Membros Cursor / Lista (canônico)

Fonte: \`packages/lsp-workbench/src/domain/members.ts\` (gerado por \`scripts/generate-members-reference.mjs\`).
**Não inventar** membros fora desta lista.

## Cursor (\`Definir Cursor Cur_…\`)

| Membro | Tipo | Uso |
|--------|------|-----|
`;

for (const m of cursor) {
  md += `| \`.${m.name}\` | ${m.kind} | ${m.documentation} |\n`;
}

md += `
## Lista (\`Definir Lista vl…\`)

| Membro | Tipo | Uso |
|--------|------|-----|
`;

for (const m of lista) {
  md += `| \`.${m.name}\` | ${m.kind} | ${m.documentation} |\n`;
}

md += `
## Campos dinâmicos

Campos de Lista vêm de \`AdicionarCampo("NOME", …)\` no mesmo arquivo — só sugerir/gerar nomes já adicionados.
`;

fs.writeFileSync(outPath, md, "utf8");
console.log(`Escrito: ${outPath} (Cursor ${cursor.length}, Lista ${lista.length})`);
