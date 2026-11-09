#!/usr/bin/env node
/**
 * ADR-009 §5: falha se um arquivo do repo público tem dado proprietário:
 * - JSON que parece catálogo de funções extraído do Senior (envelope lsp-workbench-functions/v1
 *   com mais de 10 funções, ou `sapienssrv.exe` em `origem`);
 * - tabela ou campo `USU_` (customização de cliente) fora da lista de nomes fictícios.
 *
 * Uso: node scripts/check-proprietary-data.mjs            (versionados + novos não ignorados)
 *      node scripts/check-proprietary-data.mjs a.lsp ...  (só os arquivos dados)
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const MAX_PUBLIC_FUNCTIONS = 10;

/** Únicos `USU_` aceitos no repo público: nomes inventados para testes e exemplos. */
const FICTITIOUS_USU = new Set(["USU_T999ZZZ", "USU_T999AAA", "USU_CAMPOA", "USU_CAMPOB", "USU_ALFA", "USU_ZETA"]);

function repoFiles() {
  const out = execFileSync("git", ["ls-files", "-z", "--cached", "--others", "--exclude-standard"], {
    encoding: "utf8",
  });
  return [...new Set(out.split("\0").filter(Boolean))];
}

function readText(file) {
  try {
    const buf = readFileSync(file);
    return buf.includes(0) ? undefined : buf.toString("utf8");
  } catch {
    return undefined;
  }
}

function functionCatalogViolation(file, text) {
  if (!file.toLowerCase().endsWith(".json")) return undefined;
  if (/sapienssrv\.exe/i.test(text)) return "menciona sapienssrv.exe (origem de dado extraído)";
  if (!text.includes("lsp-workbench-functions/v1")) return undefined;
  try {
    const count = Object.keys(JSON.parse(text)?.functions ?? {}).length;
    if (count > MAX_PUBLIC_FUNCTIONS) {
      return `catálogo de funções com ${count} entradas (máximo público: ${MAX_PUBLIC_FUNCTIONS})`;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

function customFieldViolation(text) {
  const found = new Set();
  for (const m of text.matchAll(/\bUSU_[A-Za-z0-9_]+/gi)) {
    const name = m[0].toUpperCase();
    if (!FICTITIOUS_USU.has(name)) found.add(name);
  }
  if (!found.size) return undefined;
  return `tabela/campo de cliente: ${[...found].sort().join(", ")} (use um nome fictício da lista)`;
}

function violation(file) {
  const text = readText(file);
  if (text === undefined) return undefined;
  return functionCatalogViolation(file, text) ?? customFieldViolation(text);
}

const files = process.argv.length > 2 ? process.argv.slice(2) : repoFiles();
const problems = files.map((f) => [f, violation(f)]).filter(([, reason]) => reason);

for (const [file, reason] of problems) {
  console.error(`${file}: ${reason}`);
}
if (problems.length) {
  console.error("Dado proprietário não pode ir para o repo público (ADR-009).");
  process.exit(1);
}
console.log(`check-proprietary-data: ${files.length} arquivo(s) ok`);
