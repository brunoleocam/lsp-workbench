/**
 * Lista dicas de docs/lsp que o hover ainda não mostra.
 * Não grava o catálogo.
 *
 * Uso: node scripts/report-catalog-tips.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { extractAll, tipAudit, tipCoveredBy, tipMarkers } from "./extract-lsp-functions.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OVERRIDES = path.join(
  __dirname,
  "..",
  "packages",
  "lsp-analyzer",
  "src",
  "lint",
  "function-catalog.overrides.ts"
);

/** @param {string} text @param {number} i index of opening quote or backtick */
function readLiteral(text, i) {
  const q = text[i];
  if (q !== '"' && q !== "`") return null;
  let s = "";
  let j = i + 1;
  while (j < text.length) {
    if (text[j] === "\\") {
      const n = text[j + 1] ?? "";
      s += n === "n" ? "\n" : n === "t" ? "\t" : n;
      j += 2;
      continue;
    }
    if (q === "`" && text.startsWith("```", j)) {
      s += "```";
      j += 3;
      continue;
    }
    if (text[j] === q) return { value: s, end: j + 1 };
    s += text[j];
    j++;
  }
  return null;
}

/** @returns {Map<string, string>} */
function readOverrideDocs(file) {
  const text = fs.readFileSync(file, "utf8");
  /** @type {Map<string, string>} */
  const map = new Map();
  const labelRe = /label:\s*"([^"]+)"/g;
  let m;
  while ((m = labelRe.exec(text))) {
    const docAt = text.indexOf("documentation:", m.index);
    if (docAt < 0 || docAt > m.index + 2500) continue;
    const rest = text.slice(docAt + "documentation:".length);
    const rel = rest.search(/["`]/);
    if (rel < 0) continue;
    const parsed = readLiteral(text, docAt + "documentation:".length + rel);
    if (!parsed) continue;
    map.set(m[1].toLowerCase(), parsed.value);
  }
  return map;
}

function mergedDoc(generated, override, tip) {
  if (!override) return generated;
  if (tipCoveredBy(override, tip)) return override;
  return `${override.trim()}\n\n${tip}`;
}

const entries = extractAll();
const audit = tipAudit();
const overrides = readOverrideDocs(OVERRIDES);
const byLabel = new Map(entries.map((e) => [e.label.toLowerCase(), e]));

const missing = [];
for (const item of audit.attached) {
  const gen = byLabel.get(item.label.toLowerCase());
  const ov = overrides.get(item.label.toLowerCase());
  const doc = mergedDoc(gen?.documentation ?? "", ov, item.tip);
  if (!tipCoveredBy(doc, item.tip)) {
    missing.push({ label: item.label, marker: tipMarkers(item.tip)[0] ?? "dica" });
  }
}

function printGroup(title, rows, line) {
  console.log(`\n${title}: ${rows.length}`);
  for (const row of rows) console.log(`  ${line(row)}`);
}

printGroup("Já na doc oficial (HCM/ERP)", audit.official, (r) => `${r.label} — ${r.marker}`);
printGroup("Falta no editor", missing, (r) => `${r.label} — ${r.marker}`);
printGroup("Não cabe (2800)", audit.omitted, (r) => `${r.label} — ${r.reason}`);
console.log(`\nDicas anexadas ao catálogo gerado: ${audit.attached.length}`);
