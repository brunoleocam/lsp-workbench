#!/usr/bin/env node
/**
 * Gera catalogo local a partir de base publica + overlay de cliente (PDR-009).
 *
 * Colunas: le a secao "## Colunas" de cada dicionario-dados/tabelas/<TABELA>.md
 *
 * Uso:
 *   node scripts/build-local-catalog.mjs
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

const baseRel = argValue("--base") || path.join("docs", "banco-senior-base");
const overlayRel = argValue("--overlay") || path.join("docs", "banco-senior");
const baseRoot = path.resolve(root, baseRel);
const overlayRoot = path.resolve(root, overlayRel);

const outArg = argValue("--out");
const defaultOut = fs.existsSync(overlayRoot)
  ? path.join(overlayRoot, ".generated", "catalog.json")
  : path.join(baseRoot, ".generated", "catalog.json");
const outPath = outArg ? path.resolve(root, outArg) : defaultOut;

const tables = new Map();

function upsert(name, patch) {
  const key = name.toUpperCase();
  const prev = tables.get(key) ?? { name: key, columns: [] };
  if (patch.description) {
    if (!prev.description || patch.forceDescription) prev.description = patch.description;
  }
  if (patch.primaryKey?.length && (!prev.primaryKey || prev.primaryKey.length === 0)) {
    prev.primaryKey = patch.primaryKey;
  }
  if (patch.columns?.length) {
    const seen = new Set(prev.columns.map((c) => c.name.toUpperCase()));
    for (const c of patch.columns) {
      const cn = String(c.name);
      const ck = cn.toUpperCase();
      if (!seen.has(ck)) {
        prev.columns.push({ name: cn, type: c.type, ...(c.key ? { key: true } : {}) });
        seen.add(ck);
      } else if (c.type) {
        const existing = prev.columns.find((x) => x.name.toUpperCase() === ck);
        if (existing && !existing.type) existing.type = c.type;
      }
    }
  }
  tables.set(key, prev);
}

/** Carrega catalog.json (export-banco-senior-base / LocalCatalog). */
function loadCatalogJson(absPath) {
  if (!fs.existsSync(absPath)) return false;
  try {
    const data = JSON.parse(fs.readFileSync(absPath, "utf8"));
    if (!data || !Array.isArray(data.tables)) return false;
    for (const t of data.tables) {
      if (!t || typeof t.name !== "string") continue;
      upsert(t.name, {
        description: t.description,
        primaryKey: Array.isArray(t.primaryKey)
          ? t.primaryKey.filter((k) => typeof k === "string" && k.trim()).map((k) => String(k).trim())
          : undefined,
        columns: Array.isArray(t.columns)
          ? t.columns
              .filter((c) => c && typeof c.name === "string")
              .map((c) => ({ name: String(c.name), type: c.type, key: c.key === true }))
          : [],
        forceDescription: Boolean(t.description),
      });
    }
    return true;
  } catch {
    return false;
  }
}

function parsePrimaryKeyFromMd(text) {
  const pk = text.match(/\*\*Chave prim[aá]ria:\*\*\s*(.+)/i);
  if (!pk) return undefined;
  const names = [...pk[1].matchAll(/`([^`]+)`/g)].map((x) => x[1].trim()).filter(Boolean);
  return names.length ? names : undefined;
}

function parseColumnsFromTableMd(text) {
  const cols = [];
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
    const name = m[1].trim();
    if (name === "Coluna" || name.startsWith("-")) continue;
    const typeRaw = m[2].trim();
    const type = typeRaw && typeRaw !== "-" && !/^-+$/.test(typeRaw) ? typeRaw : undefined;
    cols.push({ name, type });
  }
  return cols;
}

function ingestBancoRoot(bancoRoot) {
  if (!fs.existsSync(bancoRoot)) return false;
  const principais = path.join(bancoRoot, "tabelas-principais.md");
  const tablesDir = path.join(bancoRoot, "dicionario-dados", "tabelas");

  if (fs.existsSync(principais)) {
    const text = fs.readFileSync(principais, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const m = line.match(/^\|\s*([A-Z][A-Z0-9_]+)\s*\|\s*([^|]+)\|\s*([^|]*)\|\s*([^|]*)\|/);
      if (!m) continue;
      const name = m[1].trim();
      if (name === "Tabela" || name.startsWith("-")) continue;
      const description = m[2].trim();
      const keys = m[3].split(",").map((s) => s.trim()).filter((s) => s && s !== "-");
      const typical = m[4].split(",").map((s) => s.trim()).filter((s) => s && s !== "-");
      const cols = [...new Set([...keys, ...typical])].map((n) => ({ name: n }));
      upsert(name, { description, columns: cols, primaryKey: keys });
    }
  }

  if (fs.existsSync(tablesDir)) {
    for (const file of fs.readdirSync(tablesDir)) {
      if (!file.endsWith(".md")) continue;
      const fileBase = file.replace(/\.md$/i, "").toUpperCase();
      const full = path.join(tablesDir, file);
      const text = fs.readFileSync(full, "utf8");
      const first = text.split(/\r?\n/, 5)[0] || "";
      const tm = first.match(/^#\s*([A-Z][A-Z0-9_]+)\s*[-–—]\s*(.+)$/u);
      const description = tm ? tm[2].trim() : undefined;
      const name = tm ? tm[1].toUpperCase() : fileBase;
      const columns = parseColumnsFromTableMd(text);
      const primaryKey = parsePrimaryKeyFromMd(text);
      upsert(name, {
        description,
        primaryKey,
        columns,
        forceDescription: Boolean(description && columns.length),
      });
    }
  }
  return true;
}

const sources = [];
const baseCatalogJson = path.join(baseRoot, "catalog.json");
if (loadCatalogJson(baseCatalogJson)) {
  sources.push(path.relative(root, baseCatalogJson).split(path.sep).join("/"));
} else if (ingestBancoRoot(baseRoot)) {
  sources.push(path.relative(root, baseRoot).split(path.sep).join("/"));
}
if (ingestBancoRoot(overlayRoot)) sources.push(path.relative(root, overlayRoot).split(path.sep).join("/"));

if (sources.length === 0) {
  console.error("Nenhuma pasta de catalogo encontrada.");
  process.exit(2);
}

const catalog = {
  version: 1,
  generatedAt: new Date().toISOString(),
  source: sources.join(" + "),
  sources,
  tables: [...tables.values()].sort((a, b) => a.name.localeCompare(b.name)),
  enums: [],
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(catalog, null, 2), "utf8");
console.log("Catalogo: " + outPath + " (" + catalog.tables.length + " tabelas) <- " + catalog.source);
const sample = catalog.tables.find((t) => t.name === "E012FAM");
if (sample) console.log("  E012FAM: " + sample.columns.length + " colunas");
