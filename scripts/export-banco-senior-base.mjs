#!/usr/bin/env node
/**
 * Exporta docs/banco-senior-base/catalog.json a partir do dicionario markdown
 * do overlay (docs/banco-senior/dicionario-dados/tabelas).
 *
 * - Inclui tabelas/campos padrao Senior
 * - Ignora tabelas USU_* e colunas USU_*
 *
 * Uso (na raiz do monorepo, com docs/banco-senior/ presente):
 *   node scripts/export-banco-senior-base.mjs
 *   node scripts/export-banco-senior-base.mjs --src docs/banco-senior --out docs/banco-senior-base/catalog.json
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function argValue(flag) {
  const i = process.argv.indexOf(flag);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : undefined;
}

const srcRel = argValue("--src") || path.join("docs", "banco-senior");
const outRel =
  argValue("--out") || path.join("docs", "banco-senior-base", "catalog.json");
const srcRoot = path.resolve(root, srcRel);
const tablesDir = path.join(srcRoot, "dicionario-dados", "tabelas");
const outPath = path.resolve(root, outRel);

if (!fs.existsSync(tablesDir)) {
  console.error(
    "Pasta de dicionario nao encontrada:\n  " +
      tablesDir +
      "\nPrecisa de docs/banco-senior/ (overlay local) para exportar a base publica."
  );
  process.exit(2);
}

function isUsuName(name) {
  return /^USU_/i.test(String(name || "").trim());
}

function parseTableMd(text, fileBase) {
  const first = text.split(/\r?\n/, 5)[0] || "";
  const tm = first.match(/^#\s*([A-Z][A-Z0-9_]+)\s*[-–—]\s*(.+)$/u);
  const name = (tm ? tm[1] : fileBase).toUpperCase();
  const description = tm ? tm[2].trim() : undefined;

  const columns = [];
  const lines = text.split(/\r?\n/);
  let inCols = false;
  for (const line of lines) {
    if (/^##\s+Colunas\b/i.test(line)) {
      inCols = true;
      continue;
    }
    if (inCols && /^##\s+/.test(line)) break;
    if (!inCols) continue;
    const m = line.match(/^\|\s*([A-Za-z][A-Za-z0-9_]*)\s*\|\s*([^|]*)\|/);
    if (!m) continue;
    const colName = m[1].trim();
    if (colName === "Coluna" || colName.startsWith("-")) continue;
    if (isUsuName(colName)) continue;
    const typeRaw = m[2].trim();
    const type =
      typeRaw && typeRaw !== "-" && !/^-+$/.test(typeRaw) ? typeRaw : undefined;
    columns.push({ name: colName, type });
  }

  // Chave primaria (opcional) — linha **Chave primaria:** `A`; `B`
  let primaryKey;
  const pk = text.match(/\*\*Chave prim[aá]ria:\*\*\s*(.+)/i);
  if (pk) {
    primaryKey = [...pk[1].matchAll(/`([^`]+)`/g)].map((x) => x[1].trim()).filter(Boolean);
  }

  return { name, description, columns, primaryKey };
}

const files = fs
  .readdirSync(tablesDir)
  .filter((f) => f.toLowerCase().endsWith(".md"))
  .sort((a, b) => a.localeCompare(b));

const tables = [];
let skippedTables = 0;
let skippedColumns = 0;

for (const file of files) {
  const fileBase = file.replace(/\.md$/i, "").toUpperCase();
  if (isUsuName(fileBase)) {
    skippedTables++;
    continue;
  }
  const full = path.join(tablesDir, file);
  const text = fs.readFileSync(full, "utf8");
  // Conta USU_ no arquivo antes de filtrar (so metrica)
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\|\s*(USU_[A-Za-z0-9_]*)\s*\|/i);
    if (m) skippedColumns++;
  }
  const parsed = parseTableMd(text, fileBase);
  if (isUsuName(parsed.name)) {
    skippedTables++;
    continue;
  }
  tables.push({
    name: parsed.name,
    description: parsed.description,
    primaryKey: parsed.primaryKey?.length ? parsed.primaryKey : undefined,
    columns: parsed.columns,
  });
}

tables.sort((a, b) => a.name.localeCompare(b.name));

const catalog = {
  version: 1,
  generatedAt: new Date().toISOString(),
  source: "export-banco-senior-base from " + path.relative(root, tablesDir).split(path.sep).join("/"),
  policy: "USU_* tables and columns excluded",
  tables,
  enums: [],
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(catalog, null, 2), "utf8");

const colCount = tables.reduce((n, t) => n + t.columns.length, 0);
const bytes = fs.statSync(outPath).size;
console.log("Base publica: " + outPath);
console.log(
  "  tabelas=" +
    tables.length +
    " colunas=" +
    colCount +
    " (pulou tabelas USU_=" +
    skippedTables +
    ", campos USU_~=" +
    skippedColumns +
    ")"
);
console.log("  tamanho=" + (bytes / (1024 * 1024)).toFixed(2) + " MB");
