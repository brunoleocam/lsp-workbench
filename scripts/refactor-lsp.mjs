#!/usr/bin/env node
/**
 * PDR-006 — refactors mecânicos (mesmo núcleo da extensão).
 *
 * Uso:
 *   node scripts/refactor-lsp.mjs <arquivo.lsp> --kind braces|concat [--write]
 *
 * braces = Inicio/Fim* → { }
 * concat = literais com \ → concatenação +
 */
import fs from "node:fs";
import path from "node:path";

function toggleInicioFimToBraces(source) {
  return source
    .replace(/\bInicio\b/gi, "{")
    .replace(/\bFimSe\b/gi, "}")
    .replace(/\bFimEnquanto\b/gi, "}")
    .replace(/\bFim\s*;/gi, "}");
}

function backslashLiteralToConcat(source) {
  return source.replace(
    /"([^"\\]*(?:\\.[^"\\]*)*)"\s*\\\s*\r?\n\s*"([^"]*)"/g,
    (_m, a, b) => `"${a}" + "${b}"`
  );
}

const args = process.argv.slice(2);
const write = args.includes("--write");
const kindIdx = args.indexOf("--kind");
const kind = kindIdx >= 0 ? args[kindIdx + 1] : "";
const positional = args.filter(
  (a, i) =>
    a !== "--write" &&
    a !== "--kind" &&
    !(kindIdx >= 0 && i === kindIdx + 1)
);

if (positional.length !== 1 || !["braces", "concat"].includes(kind)) {
  console.error(
    "Uso: node scripts/refactor-lsp.mjs <arquivo> --kind braces|concat [--write]"
  );
  process.exit(2);
}

const filePath = path.resolve(positional[0]);
if (!fs.existsSync(filePath)) {
  console.error(`Não encontrado: ${positional[0]}`);
  process.exit(2);
}

const source = fs.readFileSync(filePath, "utf8");
const out =
  kind === "braces" ? toggleInicioFimToBraces(source) : backslashLiteralToConcat(source);

if (write) {
  fs.writeFileSync(filePath, out, "utf8");
  console.error(`Refactor ${kind}: ${filePath}`);
} else {
  process.stdout.write(out);
}
