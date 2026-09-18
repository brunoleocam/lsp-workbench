#!/usr/bin/env node
/**
 * PDR-006 — formata .lsp via @lsp-workbench/analyzer (mesmo motor da IDE).
 *
 * Uso:
 *   node scripts/format-lsp.mjs <arquivo.lsp> [--write] [--indent 2]
 *   Get-Content file.lsp -Raw | node scripts/format-lsp.mjs - [--write]
 *
 * Sem --write: imprime o resultado no stdout.
 * Com --write: sobrescreve o arquivo (não aplica a stdin).
 */
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const analyzerJs = path.join(__dirname, "..", "packages", "lsp-analyzer", "out", "index.js");

if (!fs.existsSync(analyzerJs)) {
  console.error("Compile o analyzer: cd packages/lsp-analyzer && npm run compile");
  process.exit(2);
}

const { format } = require(analyzerJs);

const args = process.argv.slice(2);
const write = args.includes("--write");
const indentIdx = args.indexOf("--indent");
const indentSize =
  indentIdx >= 0 && args[indentIdx + 1] ? Number(args[indentIdx + 1]) || 2 : 2;
const positional = args.filter(
  (a, i) =>
    a !== "--write" &&
    a !== "--indent" &&
    !(indentIdx >= 0 && i === indentIdx + 1)
);

if (positional.length !== 1) {
  console.error("Uso: node scripts/format-lsp.mjs <arquivo|-> [--write] [--indent N]");
  process.exit(2);
}

const target = positional[0];
let source;
let filePath;
if (target === "-") {
  source = fs.readFileSync(0, "utf8");
  filePath = undefined;
} else {
  filePath = path.resolve(target);
  if (!fs.existsSync(filePath)) {
    console.error(`Não encontrado: ${target}`);
    process.exit(2);
  }
  source = fs.readFileSync(filePath, "utf8");
}

const pretty = format(source, { indentSize });
if (write) {
  if (!filePath) {
    console.error("--write não se aplica a stdin");
    process.exit(2);
  }
  fs.writeFileSync(filePath, pretty, "utf8");
  console.error(`Formatado: ${filePath}`);
} else {
  process.stdout.write(pretty);
}
