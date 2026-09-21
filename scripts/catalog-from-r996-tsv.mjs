#!/usr/bin/env node
/**
 * Converte export TSV de R996TBL+R996FLD (ou R998*) em catalog.json.
 *
 * Colunas esperadas (header, case-insensitive):
 *   TBLNAM, DESTBL, PKFLDS, FLDNAM [, FLDORD, DATTYP, LENFLD, PREFLD, DESFLD]
 *
 * Uso:
 *   node scripts/catalog-from-r996-tsv.mjs --in r996.tsv --out docs/banco-senior-base/catalog.json
 *   node scripts/catalog-from-r996-tsv.mjs --in r998.tsv --merge docs/banco-senior-base/catalog.json
 *   node scripts/catalog-from-r996-tsv.mjs --in r996.tsv --out catalog.json --keep-usu
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

const inRel = argValue("--in");
const outRel =
  argValue("--out") ||
  argValue("--merge") ||
  path.join("docs", "banco-senior-base", "catalog.json");
const mergeMode = process.argv.includes("--merge");
const keepUsu = process.argv.includes("--keep-usu");

if (!inRel) {
  console.error(
    "Uso: node scripts/catalog-from-r996-tsv.mjs --in <arquivo.tsv> [--out|--merge <catalog.json>] [--keep-usu]"
  );
  process.exit(2);
}

const inPath = path.resolve(root, inRel);
const outPath = path.resolve(root, outRel);

if (!fs.existsSync(inPath)) {
  console.error("Arquivo TSV nao encontrado: " + inPath);
  process.exit(2);
}

function isUsuName(name) {
  return /^USU_/i.test(String(name || "").trim());
}

/** DATTYP Senior → rotulo legivel (heuristica; ajuste local se preciso). */
function typeLabel(datTyp, lenFld, preFld) {
  const t = Number(datTyp);
  const len = lenFld != null && String(lenFld).trim() !== "" ? String(lenFld).trim() : "";
  const pre = preFld != null && String(preFld).trim() !== "" ? String(preFld).trim() : "";
  if (t === 1) return len ? `Alfa(${len})` : "Alfa";
  if (t === 2) {
    if (len && pre && pre !== "0") return `Número(${len},${pre})`;
    if (len) return `Número(${len})`;
    return "Número";
  }
  if (t === 4) return "Data";
  if (Number.isFinite(t)) return `Tipo(${t})`;
  return undefined;
}

function parsePk(pkflds) {
  if (!pkflds || !String(pkflds).trim()) return undefined;
  return String(pkflds)
    .split(/[;,\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseTsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.length > 0);
  if (lines.length < 2) return [];

  const delim = lines[0].includes("\t") ? "\t" : ";";
  const header = lines[0].split(delim).map((h) => h.trim().replace(/^"|"$/g, ""));
  const idx = (name) =>
    header.findIndex((h) => h.toUpperCase() === name.toUpperCase());

  const iTbl = idx("TBLNAM");
  const iDes = idx("DESTBL");
  const iPk = idx("PKFLDS");
  const iFld = idx("FLDNAM");
  const iOrd = idx("FLDORD");
  const iTyp = idx("DATTYP");
  const iLen = idx("LENFLD");
  const iPre = idx("PREFLD");

  if (iTbl < 0 || iFld < 0) {
    throw new Error(
      "TSV precisa de colunas TBLNAM e FLDNAM (header na 1a linha). Encontrado: " +
        header.join(", ")
    );
  }

  const rows = [];
  for (let li = 1; li < lines.length; li++) {
    const cols = lines[li].split(delim).map((c) => c.replace(/^"|"$/g, "").trim());
    const tbl = cols[iTbl];
    const fld = cols[iFld];
    if (!tbl || !fld) continue;
    rows.push({
      tblnam: tbl,
      destbl: iDes >= 0 ? cols[iDes] : "",
      pkflds: iPk >= 0 ? cols[iPk] : "",
      fldnam: fld,
      fldord: iOrd >= 0 ? Number(cols[iOrd]) || 0 : li,
      dattyp: iTyp >= 0 ? cols[iTyp] : "",
      lenfld: iLen >= 0 ? cols[iLen] : "",
      prefld: iPre >= 0 ? cols[iPre] : "",
    });
  }
  return rows;
}

function rowsToTables(rows, stripUsu) {
  /** @type {Map<string, { name: string, description?: string, primaryKey?: string[], columns: { name: string, type?: string }[] }>} */
  const map = new Map();

  for (const r of rows) {
    const name = String(r.tblnam).toUpperCase();
    if (stripUsu && isUsuName(name)) continue;
    if (stripUsu && isUsuName(r.fldnam)) continue;

    let table = map.get(name);
    if (!table) {
      table = {
        name,
        description: r.destbl ? String(r.destbl).trim() : undefined,
        primaryKey: parsePk(r.pkflds),
        columns: [],
      };
      map.set(name, table);
    }

    const colName = String(r.fldnam).trim();
    if (table.columns.some((c) => c.name.toUpperCase() === colName.toUpperCase())) {
      continue;
    }
    const type = typeLabel(r.dattyp, r.lenfld, r.prefld);
    table.columns.push(type ? { name: colName, type } : { name: colName });
  }

  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function mergeTables(base, extra) {
  const map = new Map(base.map((t) => [t.name.toUpperCase(), structuredClone(t)]));
  for (const t of extra) {
    const key = t.name.toUpperCase();
    const cur = map.get(key);
    if (!cur) {
      map.set(key, structuredClone(t));
      continue;
    }
    if (!cur.description && t.description) cur.description = t.description;
    if ((!cur.primaryKey || cur.primaryKey.length === 0) && t.primaryKey) {
      cur.primaryKey = [...t.primaryKey];
    }
    const seen = new Set(cur.columns.map((c) => c.name.toUpperCase()));
    for (const c of t.columns) {
      if (seen.has(c.name.toUpperCase())) continue;
      cur.columns.push({ ...c });
      seen.add(c.name.toUpperCase());
    }
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

const stripUsu = !keepUsu;
const rows = parseTsv(fs.readFileSync(inPath, "utf8"));
let tables = rowsToTables(rows, stripUsu);

let existing = null;
if (mergeMode && fs.existsSync(outPath)) {
  existing = JSON.parse(fs.readFileSync(outPath, "utf8"));
  tables = mergeTables(existing.tables || [], tables);
}

const catalog = {
  version: 1,
  generatedAt: new Date().toISOString(),
  source: path.relative(root, inPath).split(path.sep).join("/"),
  policy: stripUsu ? "USU_* tables and columns excluded" : "USU_* kept",
  tables,
};

if (existing?.source) {
  catalog.source = `${existing.source} + ${catalog.source}`;
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(catalog, null, 2) + "\n", "utf8");

const cols = tables.reduce((n, t) => n + t.columns.length, 0);
console.log(
  `OK: ${tables.length} tabelas, ${cols} colunas → ${path.relative(root, outPath)}`
);
