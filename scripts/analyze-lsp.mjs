#!/usr/bin/env node
/**
 * CLI PDR-006 — analisa .lsp/.lspt com @lsp-workbench/analyzer (mesmos ANL* da IDE).
 *
 * Uso (na raiz do monorepo, após compilar o analyzer):
 *   node scripts/analyze-lsp.mjs path/to/file.lsp
 *   node scripts/analyze-lsp.mjs path/to/dir
 *   Get-Content file.lsp -Raw | node scripts/analyze-lsp.mjs -
 *
 * Exit: 0 se sem diagnósticos; 1 se houver; 2 se erro de uso/IO.
 */
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const analyzerJs = path.join(__dirname, "..", "packages", "lsp-analyzer", "out", "index.js");

if (!fs.existsSync(analyzerJs)) {
  console.error(
    "Analyzer não compilado. Rode: cd packages/lsp-analyzer && npm install && npm run compile"
  );
  process.exit(2);
}

const { analyze, ANALYZER_VERSION } = require(analyzerJs);

function collectFiles(arg) {
  if (arg === "-") return [{ file: "<stdin>", source: fs.readFileSync(0, "utf8") }];
  const abs = path.resolve(arg);
  if (!fs.existsSync(abs)) {
    console.error(`Não encontrado: ${arg}`);
    process.exit(2);
  }
  const st = fs.statSync(abs);
  if (st.isFile()) {
    return [{ file: abs, source: fs.readFileSync(abs, "utf8") }];
  }
  const out = [];
  const walk = (dir) => {
    for (const name of fs.readdirSync(dir)) {
      const p = path.join(dir, name);
      const s = fs.statSync(p);
      if (s.isDirectory()) walk(p);
      else if (/\.(lsp|lspt)$/i.test(name)) {
        out.push({ file: p, source: fs.readFileSync(p, "utf8") });
      }
    }
  };
  walk(abs);
  return out;
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Uso: node scripts/analyze-lsp.mjs <arquivo|pasta|->");
  process.exit(2);
}

const ignoreIdx = args.indexOf("--ignore");
let ignoreIds = [];
let targets = args;
if (ignoreIdx >= 0) {
  ignoreIds = (args[ignoreIdx + 1] || "").split(",").filter(Boolean);
  targets = args.filter((_, i) => i !== ignoreIdx && i !== ignoreIdx + 1);
}

const entries = targets.flatMap(collectFiles);
if (entries.length === 0) {
  console.error("Nenhum .lsp/.lspt encontrado.");
  process.exit(2);
}

let total = 0;
console.log(`# LSP Analyzer ${ANALYZER_VERSION}`);
for (const { file, source } of entries) {
  const { diagnostics } = analyze(source, { ignoreIds });
  if (diagnostics.length === 0) {
    console.log(`${file}: OK`);
    continue;
  }
  total += diagnostics.length;
  for (const d of diagnostics) {
    console.log(`${file}:${d.line + 1}: [${d.id}] ${d.message} (${d.severity})`);
  }
}

process.exit(total > 0 ? 1 : 0);
