/**
 * Gera catálogos HCM/ERP a partir das listas oficiais Senior (índices de documentação).
 *
 * Entrada preferencial:
 *   packages/lsp-workbench/fixtures/senior-docs-hcm-functions.json
 *   packages/lsp-workbench/fixtures/senior-docs-erp-functions.json
 *
 * Se ausentes, reconstrói a partir do HTML HCM upload + MD ERP em tmp/.
 *
 * Saída:
 *   packages/lsp-analyzer/src/lint/function-catalog.hcm.generated.ts
 *   packages/lsp-analyzer/src/lint/function-catalog.erp.generated.ts
 *   fixtures JSON atualizados (com descrições quando disponíveis)
 *
 * Uso: node scripts/generate-system-function-catalogs.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function findRepoRoot() {
  let dir = __dirname;
  for (let i = 0; i < 6; i++) {
    if (fs.existsSync(path.join(dir, "docs", "lsp"))) return dir;
    dir = path.dirname(dir);
  }
  throw new Error("Não encontrou docs/lsp a partir de " + __dirname);
}

const ROOT = findRepoRoot();
const FIXTURES = path.join(ROOT, "packages", "lsp-workbench", "fixtures");
const ANALYZER_LINT = path.join(ROOT, "packages", "lsp-analyzer", "src", "lint");
const WORKBENCH_SRC = path.join(ROOT, "packages", "lsp-workbench", "src");

const FALSE_POSITIVES = new Set(["acumuladores", "Nome", "Descrição", "Descricao", "Módulo", "Modulo"]);

function normLabel(name) {
  return String(name)
    .trim()
    .replace(/\s*\(.*?\)\s*$/, "");
}

function isValidLabel(n) {
  if (!n || FALSE_POSITIVES.has(n)) return false;
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(n)) return false;
  return true;
}

/** Parse markdown tables: | Name | Desc | */
function parseMdTables(text) {
  /** @type {Map<string, string>} */
  const map = new Map();
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(
      /^\|\s*(?:\[)?([A-Za-z_][A-Za-z0-9_]*)(?:\])?(?:\([^)]*\))?\s*\|\s*(.*?)\s*\|/
    );
    if (!m) continue;
    const label = normLabel(m[1]);
    if (!isValidLabel(label)) continue;
    let desc = (m[2] || "").replace(/\*\*/g, "").trim();
    if (desc === "---" || desc === "Descrição" || desc === "Descricao") continue;
    if (!map.has(label) || (desc && !map.get(label))) map.set(label, desc);
  }
  return map;
}

/**
 * Parse HCM firecrawl/markdown-ish HTML table rows:
 * | [Name](url) | Desc | Module |
 */
function parseHcmHtml(htm) {
  /** @type {Map<string, string>} */
  const map = new Map();
  const rowRe =
    /\|\s*\[([A-Za-z_][A-Za-z0-9_]*)\]\([^)]+\)\s*\|\s*([^|]*?)\s*\|/g;
  let m;
  while ((m = rowRe.exec(htm))) {
    const label = normLabel(m[1]);
    if (!isValidLabel(label)) continue;
    const desc = m[2].replace(/\*\*/g, "").replace(/\s+/g, " ").trim();
    if (!map.has(label)) map.set(label, desc);
  }
  // fallback: bare links already covered; also catch any leftover [Name](
  const linkRe = /\[([A-Za-z_][A-Za-z0-9_]*)\]\(/g;
  while ((m = linkRe.exec(htm))) {
    const label = normLabel(m[1]);
    if (!isValidLabel(label)) continue;
    if (!map.has(label)) map.set(label, "");
  }
  return map;
}

function loadExistingFixture(file) {
  const p = path.join(FIXTURES, file);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function buildEntries(system, labelToDesc) {
  const labels = [...labelToDesc.keys()].sort((a, b) => a.localeCompare(b, "pt"));
  return labels.map((label) => {
    const description = labelToDesc.get(label) || "";
    const detail = `${system} · ${label}`;
    const docParts = [`**${label}**`, `\`${label}(...);\``];
    if (description) docParts.push("", description);
    docParts.push("", `_Sistema: ${system}_`);
    return {
      label,
      insertText: `${label}($0);`,
      detail,
      documentation: docParts.join("\n"),
      kind: "function",
      isSnippet: true,
      system,
      description,
    };
  });
}

/** Prefer fixture entries already enriched (syntax/params/docs). */
function buildEntriesFromFixture(system, fixture) {
  if (!fixture?.entries?.length) return null;
  const rich = fixture.entries.some((e) => e.syntax || e.documentation || e.insertText);
  if (!rich && system === "ERP") {
    // still use entries if present (index-only)
  }
  return fixture.entries
    .filter((e) => isValidLabel(e.label))
    .sort((a, b) => a.label.localeCompare(b.label, "pt"))
    .map((e) => {
      const description = e.description || "";
      const detail = e.detail || `${system} · ${e.label}`;
      const insertText = e.insertText || `${e.label}($0);`;
      let documentation = e.documentation;
      if (!documentation) {
        const docParts = [`**${e.label}**`, `\`${e.syntax || e.label + "(...);"}\``];
        if (description) docParts.push("", description);
        if (e.params?.length) {
          docParts.push("", "**Parâmetros**");
          for (const p of e.params) {
            docParts.push(
              `- \`${p.name}\` (${p.tipo})${p.description ? ` — ${p.description}` : ""}`
            );
          }
        }
        if (e.url) docParts.push("", `_Fonte: [doc Senior](${e.url})_`);
        docParts.push("", `_Sistema: ${system}_`);
        documentation = docParts.join("\n");
      }
      return {
        label: e.label,
        insertText,
        detail,
        documentation,
        kind: "function",
        isSnippet: true,
        system,
        description,
        syntax: e.syntax,
        params: e.params,
        url: e.url,
        enriched: e.enriched,
        source: e.source,
        example: e.example,
      };
    });
}

function emitTs(system, entries, outFile) {
  const constName =
    system === "HCM"
      ? "LSP_FUNCTION_CATALOG_HCM"
      : system === "ERP"
        ? "LSP_FUNCTION_CATALOG_ERP"
        : `LSP_FUNCTION_CATALOG_${system}`;
  const labelsName =
    system === "HCM"
      ? "HCM_FUNCTION_LABELS"
      : system === "ERP"
        ? "ERP_FUNCTION_LABELS"
        : `${system}_FUNCTION_LABELS`;

  const lines = [];
  lines.push(`/** AUTO-GERADO por scripts/generate-system-function-catalogs.mjs — não editar à mão. */`);
  lines.push(`import type { LspFunctionEntry } from "./function-catalog.types";`);
  lines.push("");
  lines.push(`export const ${constName}: LspFunctionEntry[] = [`);
  for (const e of entries) {
    lines.push(`  {`);
    lines.push(`    label: ${JSON.stringify(e.label)},`);
    lines.push(`    insertText: ${JSON.stringify(e.insertText)},`);
    lines.push(`    detail: ${JSON.stringify(e.detail)},`);
    lines.push(`    documentation: ${JSON.stringify(e.documentation)},`);
    lines.push(`    kind: "function",`);
    lines.push(`    isSnippet: true,`);
    lines.push(`    system: ${JSON.stringify(system)},`);
    lines.push(`  },`);
  }
  lines.push(`];`);
  lines.push("");
  lines.push(
    `export const ${labelsName}: string[] = ${JSON.stringify(
      entries.map((e) => e.label),
      null,
      2
    )};`
  );
  lines.push("");
  fs.writeFileSync(outFile, lines.join("\n"), "utf8");
}

function writeFixture(system, entries, meta) {
  const file =
    system === "HCM"
      ? "senior-docs-hcm-functions.json"
      : "senior-docs-erp-functions.json";
  const payload = {
    generatedAt: new Date().toISOString(),
    system,
    source: meta.source,
    count: entries.length,
    enrichedCount: entries.filter((e) => e.enriched).length || undefined,
    labels: entries.map((e) => e.label),
    entries: entries.map((e) => ({
      label: e.label,
      description: e.description || undefined,
      syntax: e.syntax || undefined,
      params: e.params?.length ? e.params : undefined,
      example: e.example || undefined,
      url: e.url || undefined,
      insertText: e.insertText || undefined,
      documentation: e.documentation || undefined,
      detail: e.detail || undefined,
      source: e.source || undefined,
      enriched: e.enriched || undefined,
    })),
  };
  fs.writeFileSync(path.join(FIXTURES, file), JSON.stringify(payload, null, 2) + "\n");
}

function resolveHcmMap() {
  const existing = loadExistingFixture("senior-docs-hcm-functions.json");
  if (existing?.entries?.length) {
    const map = new Map();
    for (const e of existing.entries) {
      if (isValidLabel(e.label)) map.set(e.label, e.description || "");
    }
    // Prefer re-enrich from HTML if present
    const htmlCandidates = [
      path.join(
        process.env.USERPROFILE || "",
        ".cursor/projects/c-Dev-lsp-workbench/uploads/funcoes-3.htm"
      ),
      path.join(ROOT, "tmp", "senior-docs-functions", "funcoes-hcm.htm"),
    ];
    for (const hp of htmlCandidates) {
      if (!fs.existsSync(hp)) continue;
      const fromHtml = parseHcmHtml(fs.readFileSync(hp, "utf8"));
      for (const [k, v] of fromHtml) {
        if (!map.has(k) || (v && !map.get(k))) map.set(k, v || map.get(k) || "");
      }
      break;
    }
    return { map, source: existing.source || "fixtures/senior-docs-hcm-functions.json" };
  }

  const htmlCandidates = [
    path.join(
      process.env.USERPROFILE || "",
      ".cursor/projects/c-Dev-lsp-workbench/uploads/funcoes-3.htm"
    ),
    path.join(ROOT, "tmp", "senior-docs-functions", "funcoes-hcm.htm"),
  ];
  for (const hp of htmlCandidates) {
    if (!fs.existsSync(hp)) continue;
    return {
      map: parseHcmHtml(fs.readFileSync(hp, "utf8")),
      source: "HCM 6.10.4 customizacoes/funcoes.htm",
    };
  }

  const labelsOnly = path.join(ROOT, "tmp", "senior-docs-functions", "hcm-labels.json");
  if (fs.existsSync(labelsOnly)) {
    const j = JSON.parse(fs.readFileSync(labelsOnly, "utf8"));
    const map = new Map();
    for (const l of j.labels || []) {
      if (isValidLabel(l)) map.set(l, "");
    }
    return { map, source: "tmp/senior-docs-functions/hcm-labels.json" };
  }
  throw new Error("Sem fonte HCM (fixture, HTML ou hcm-labels.json)");
}

function resolveErpMap() {
  const existing = loadExistingFixture("senior-docs-erp-functions.json");
  if (existing?.entries?.length) {
    const map = new Map();
    for (const e of existing.entries) {
      if (isValidLabel(e.label)) map.set(e.label, e.description || "");
    }
    const md = path.join(ROOT, "tmp", "senior-docs-functions", "erp-gerador-relatorios.md");
    if (fs.existsSync(md)) {
      const fromMd = parseMdTables(fs.readFileSync(md, "utf8"));
      for (const [k, v] of fromMd) {
        if (!map.has(k) || (v && !map.get(k))) map.set(k, v || map.get(k) || "");
      }
    }
    return { map, source: existing.source || "fixtures/senior-docs-erp-functions.json" };
  }

  const mdCandidates = [
    path.join(ROOT, "tmp", "senior-docs-functions", "erp-gerador-relatorios.md"),
    path.join(ROOT, "tmp", "senior-docs-functions", "erp-gerador-labels.json"),
  ];
  for (const p of mdCandidates) {
    if (!fs.existsSync(p)) continue;
    if (p.endsWith(".json")) {
      const j = JSON.parse(fs.readFileSync(p, "utf8"));
      const map = new Map();
      for (const l of j.labels || []) {
        if (isValidLabel(l)) map.set(l, "");
      }
      return { map, source: "tmp erp-gerador-labels.json" };
    }
    return {
      map: parseMdTables(fs.readFileSync(p, "utf8")),
      source: "ERP 5.10.3 regra_funcoes/indice_funcoes_gerador_relatorios.htm",
    };
  }
  throw new Error("Sem fonte ERP");
}

function writeWorkbenchReexports() {
  const hcmRe =
    `/** Reexport — fonte: @lsp-workbench/analyzer */\n` +
    `export {\n  LSP_FUNCTION_CATALOG_HCM,\n  HCM_FUNCTION_LABELS,\n} from "@lsp-workbench/analyzer";\n`;
  const erpRe =
    `/** Reexport — fonte: @lsp-workbench/analyzer */\n` +
    `export {\n  LSP_FUNCTION_CATALOG_ERP,\n  ERP_FUNCTION_LABELS,\n} from "@lsp-workbench/analyzer";\n`;
  fs.writeFileSync(path.join(WORKBENCH_SRC, "function-catalog.hcm.generated.ts"), hcmRe);
  fs.writeFileSync(path.join(WORKBENCH_SRC, "function-catalog.erp.generated.ts"), erpRe);
}

function main() {
  const hcmFixture = loadExistingFixture("senior-docs-hcm-functions.json");
  const hcm = resolveHcmMap();
  const erpFixture = loadExistingFixture("senior-docs-erp-functions.json");
  const erp = resolveErpMap();

  const hcmFromFixture = buildEntriesFromFixture("HCM", hcmFixture);
  const hcmEntries = hcmFromFixture?.length
    ? hcmFromFixture
    : buildEntries("HCM", hcm.map);
  const erpFromFixture = buildEntriesFromFixture("ERP", erpFixture);
  const erpEntries = erpFromFixture?.length
    ? erpFromFixture
    : buildEntries("ERP", erp.map);

  emitTs("HCM", hcmEntries, path.join(ANALYZER_LINT, "function-catalog.hcm.generated.ts"));
  emitTs("ERP", erpEntries, path.join(ANALYZER_LINT, "function-catalog.erp.generated.ts"));
  writeFixture("HCM", hcmEntries, {
    source: hcmFixture?.source || hcm.source,
  });
  writeFixture("ERP", erpEntries, {
    source: erpFixture?.source || erp.source,
  });
  writeWorkbenchReexports();

  console.log(
    JSON.stringify(
      {
        hcm: hcmEntries.length,
        hcmEnriched: hcmEntries.filter((e) => e.enriched).length,
        erp: erpEntries.length,
        erpEnriched: erpEntries.filter((e) => e.enriched).length,
        hcmSource: hcmFixture?.source || hcm.source,
        erpSource: erpFixture?.source || erp.source,
      },
      null,
      2
    )
  );
}

main();
