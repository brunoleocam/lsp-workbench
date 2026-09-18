#!/usr/bin/env node
/**
 * Gera catálogo local (gitignored) a partir de docs/banco-senior.
 * Uso: node scripts/build-local-catalog.mjs
 *      node scripts/build-local-catalog.mjs --out docs/banco-senior/.generated/catalog.json
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const bancoRoot = path.join(root, "docs", "banco-senior");
const tablesDir = path.join(bancoRoot, "dicionario-dados", "tabelas");
const principais = path.join(bancoRoot, "tabelas-principais.md");

const outArg = process.argv.indexOf("--out");
const outPath =
  outArg >= 0 && process.argv[outArg + 1]
    ? path.resolve(process.argv[outArg + 1])
    : path.join(bancoRoot, ".generated", "catalog.json");

if (!fs.existsSync(bancoRoot)) {
  console.error("docs/banco-senior/ não encontrado (conteúdo local privado).");
  process.exit(2);
}

/** @type {Map<string, { name: string, description?: string, columns: { name: string, type?: string }[] }>} */
const tables = new Map();

function upsert(name, patch) {
  const key = name.toUpperCase();
  const prev = tables.get(key) ?? { name: key, columns: [] };
  if (patch.description && !prev.description) prev.description = patch.description;
  if (patch.columns?.length) {
    const seen = new Set(prev.columns.map((c) => c.name));
    for (const c of patch.columns) {
      if (!seen.has(c.name)) {
        prev.columns.push(c);
        seen.add(c.name);
      }
    }
  }
  tables.set(key, prev);
}

if (fs.existsSync(principais)) {
  const text = fs.readFileSync(principais, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(
      /^\|\s*([A-Z][A-Z0-9_]+)\s*\|\s*([^|]+)\|\s*([^|]*)\|\s*([^|]*)\|/
    );
    if (!m) continue;
    const name = m[1].trim();
    if (name === "Tabela" || name.startsWith("-")) continue;
    const description = m[2].trim();
    const keys = m[3]
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s && s !== "—" && s !== "-");
    const typical = m[4]
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s && s !== "—" && !s.includes("…"));
    const cols = [...new Set([...keys, ...typical])].map((n) => ({ name: n }));
    upsert(name, { description, columns: cols });
  }
}

if (fs.existsSync(tablesDir)) {
  for (const file of fs.readdirSync(tablesDir)) {
    if (!file.endsWith(".md")) continue;
    const base = file.replace(/\.md$/i, "").toUpperCase();
    const full = path.join(tablesDir, file);
    const first = fs.readFileSync(full, "utf8").split(/\r?\n/, 5)[0] || "";
    const tm = first.match(/^#\s*([A-Z][A-Z0-9_]+)\s*[–-]\s*(.+)$/);
    const description = tm ? tm[2].trim() : undefined;
    const name = tm ? tm[1].toUpperCase() : base;
    upsert(name, { description, columns: [] });
  }
}

const catalog = {
  version: 1,
  generatedAt: new Date().toISOString(),
  source: "docs/banco-senior",
  tables: [...tables.values()].sort((a, b) => a.name.localeCompare(b.name)),
  enums: [],
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(catalog, null, 2), "utf8");
console.log(`Catálogo: ${outPath} (${catalog.tables.length} tabelas)`);
