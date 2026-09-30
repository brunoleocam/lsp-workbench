/**
 * Extrai builtins LSP de docs/lsp/ → function-catalog.generated.ts + fixtures JSON.
 *
 * Uso (na raiz do monorepo ou em packages/lsp-workbench):
 *   node scripts/extract-lsp-functions.mjs
 *   node ../../scripts/extract-lsp-functions.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Resolve raiz do monorepo (pasta com docs/lsp). */
function findRepoRoot() {
  let dir = __dirname;
  for (let i = 0; i < 6; i++) {
    if (fs.existsSync(path.join(dir, "docs", "lsp"))) return dir;
    dir = path.dirname(dir);
  }
  throw new Error("Não encontrou docs/lsp a partir de " + __dirname);
}

const REPO_ROOT = findRepoRoot();
const DOCS_LSP = path.join(REPO_ROOT, "docs", "lsp");
const OUT_TS = path.join(
  REPO_ROOT,
  "packages",
  "lsp-analyzer",
  "src",
  "lint",
  "function-catalog.generated.ts"
);
const OUT_TS_WORKBENCH_REEXPORT = path.join(
  REPO_ROOT,
  "packages",
  "lsp-workbench",
  "src",
  "function-catalog.generated.ts"
);
const OUT_JSON = path.join(
  REPO_ROOT,
  "packages",
  "lsp-workbench",
  "fixtures",
  "extracted-functions.json"
);

/** Arquivos de heading (ordem do plano). */
const HEADING_FILES = [
  "strings.md",
  "funcoes-adicionais-de-manipulacao-de-strings.md",
  "datas.md",
  "funcoes-avancadas-de-data-e-dias-uteis.md",
  "http.md",
  "funcoes-especificas-do-gerador-de-relatorios.md",
  "criptografia-e-seguranca.md",
  "validacao-e-verificacao.md",
  "cast-de-variavel.md",
  "operacoes-numericas-avancadas.md",
  "arquivos.md",
  "gerenciamento-avancado-de-arquivos.md",
  "json.md",
  "listas.md",
  "funcoes-de-lista-de-regras.md",
  "manipulacao-dinamica-de-variaveis.md",
  "sql.md",
  "cursores.md",
  "interface-e-feedback-do-usuario.md",
  "mensagens.md",
  "cancel.md",
  "entrada-valor.md",
  "web-service.md",
];

/** Headings de seção (não são funções). */
const SECTION_SKIP = new Set(
  [
    "controles de grade",
    "controles de imagem",
    "controles de gráfico",
    "manipulação de controles",
    "controle de execução",
    "manipulação de datas",
    "manipulação de sql",
    "manipulação de listas e campos",
    "históricos",
    "controle de páginas",
    "controle de impressão",
    "funções de verificação",
    "views temporárias",
    "seções adicionais",
    "personalização do nome do arquivo gerado",
    "http básico",
    "json",
    "autenticação",
    "banco de dados",
    "cursor simples",
    "cursor completo",
    "armadilhas comuns",
    "essenciais para todo projeto",
    "manipulação de dados comuns",
    "verificação de nulidade e limpeza de dados",
    "verificação de abrangências",
    "validação de arquivos",
    "validação de dados estruturados",
    "verificação de abas ativas",
    "exemplo prático",
    "arredondamento e truncamento",
    "operações especiais",
    "barra de progresso",
    "controle de interface",
    "gerenciamento de configuração",
    "criação e exclusão de arquivos temporários",
    "execução de programas externos",
    "funções de data atual",
    "manipulação de componentes de hora",
    "construção e decomposição de datas",
    "operações aritméticas com datas",
    "formatação avançada de datas",
    "funções de extenso",
    "operações matemáticas e formatação",
    "arrays e listas",
    "validação e comparação de datas",
    "verificação de tipo de variável",
    "obtenção de valores de variáveis",
    "atribuição de valores a variáveis",
    "resumo das funções de string",
    "funções básicas de manipulação",
    "funções avançadas de manipulação",
    "funções de lista e separação",
    "funções de codificação",
    "funções de hash",
    "criptografia de dados",
    "geração de tokens e nonces",
    "ws-security e digest",
    "codificação base64",
    "abrir (open)",
    "fechar (close)",
    "ler (read)",
    "gravar (write)",
    "lernl",
    "gravarnl",
  ].map((s) => s.toLowerCase())
);

const IDENT = "[A-Za-zÀ-ú_][A-Za-zÀ-ú0-9_]*";

/**
 * @typedef {{
 *   label: string;
 *   insertText: string;
 *   detail: string;
 *   documentation: string;
 *   isSnippet?: boolean;
 *   kind?: "function" | "keyword";
 *   source?: string;
 * }} ExtractedFn
 */

/** @param {string} name */
function isValidFnName(name) {
  if (!name || name.length < 2 || name.length > 60) return false;
  if (/^(e|ou|se|senao|para|enquanto|definir|funcao|inicio|fim)$/i.test(name)) return false;
  if (SECTION_SKIP.has(name.toLowerCase())) return false;
  // Sem acentos / espaços / pontuação — só identificador LSP
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name) && name !== "sleep") return false;
  return true;
}

/** Só a tabela funcoes-gerais pode colapsar espaços (Arredonda Valor Tipo Acerto). */
function normalizeTableLabel(raw) {
  let s = raw.replace(/\*\*/g, "").trim();
  if (/\s/.test(s) && /^[A-Za-z]/.test(s) && !/[àáâãéêíóôõúç]/i.test(s)) {
    s = s
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join("");
  }
  return s;
}

/**
 * Split "TamanhoAlfa e TamanhoStr" / "Abrir (Open)" — headings.
 * Multi-palavra PT (sem "e") é seção → [].
 * @param {string} heading
 * @param {{ fromTable?: boolean }} [opts]
 * @returns {string[]}
 */
function splitAliases(heading, opts = {}) {
  const cleaned = heading.replace(/\*\*/g, "").trim();
  // "Abrir (Open)" → Abrir
  const paren = cleaned.match(new RegExp(`^(${IDENT})\\s*\\(`));
  if (paren) return isValidFnName(paren[1]) ? [paren[1]] : [];

  if (/\s+e\s+/i.test(cleaned)) {
    return cleaned
      .split(/\s+e\s+/i)
      .map((p) => p.trim())
      .filter((p) => isValidFnName(p));
  }

  if (opts.fromTable) {
    const one = normalizeTableLabel(cleaned);
    return isValidFnName(one) ? [one] : [];
  }

  // Heading: só Ident puro (sem espaços)
  if (/\s/.test(cleaned)) return [];
  return isValidFnName(cleaned) ? [cleaned] : [];
}

/**
 * @param {string} syntaxLine  e.g. HttpGet(Alfa Objeto, Alfa URL, Alfa end HTML);
 * @param {string} label
 */
function snippetFromSyntax(syntaxLine, label) {
  const m = syntaxLine.match(new RegExp(`${label}\\s*\\(([^)]*)\\)`, "i"));
  if (!m) {
    return { insertText: `${label}($0);`, isSnippet: true };
  }
  const inner = m[1].trim();
  if (!inner) {
    return { insertText: `${label}();`, isSnippet: false };
  }
  // Split params by comma (ignore nested — rare in docs)
  const parts = inner.split(",").map((p) => p.trim()).filter(Boolean);
  const placeholders = parts.map((p, i) => {
    // "Alfa Objeto" | "Alfa end HTML" | "Numero Linha" | "<pData>"
    let name = p
      .replace(/^<|>$/g, "")
      .replace(/^(Alfa|Numero|Data|Lista|Cursor)\s+(end\s+)?/i, "")
      .replace(/^end\s+/i, "")
      .trim();
    if (!name || /^(Alfa|Numero|Data)$/i.test(name)) name = `p${i + 1}`;
    name = name.replace(/[^\wÀ-ú]/g, "") || `p${i + 1}`;
    return `\${${i + 1}:<${name}>}`;
  });
  return {
    insertText: `${label}(${placeholders.join(", ")});`,
    isSnippet: true,
  };
}

/**
 * Find **Sintaxe:** block after a heading position.
 * @param {string} text
 * @param {number} from
 */
function findSyntaxAfter(text, from) {
  const slice = text.slice(from, from + 2500);
  // **Sintaxe:** `Foo(...)`  OR  **Sintaxe:**\n```lsp\nFoo(...)\n```
  const inline = slice.match(/\*\*Sintaxe:\*\*\s*`([^`]+)`/i);
  if (inline) return inline[1].trim();

  const fence = slice.match(/\*\*Sintaxe:\*\*\s*\n+```(?:lsp)?\s*\n([\s\S]*?)```/i);
  if (fence) {
    const line = fence[1]
      .split("\n")
      .map((l) => l.trim())
      .find((l) => l && !l.startsWith("@"));
    return line || "";
  }
  // First code fence with Name(
  const anyFence = slice.match(/```(?:lsp)?\s*\n([\s\S]*?)```/);
  if (anyFence) {
    const line = anyFence[1]
      .split("\n")
      .map((l) => l.trim())
      .find((l) => /\w+\s*\(/.test(l) && !l.startsWith("@"));
    return line || "";
  }
  return "";
}

/**
 * First prose paragraph after heading (before **Sintaxe** or next heading).
 * @param {string} text
 * @param {number} from
 */
function findDescriptionAfter(text, from) {
  const slice = text.slice(from, from + 1500);
  const lines = slice.split("\n");
  const buf = [];
  for (const line of lines) {
    if (/^#{1,6}\s/.test(line)) break;
    if (/^\*\*Sintaxe/i.test(line)) break;
    if (/^```/.test(line)) break;
    const t = line.trim();
    if (!t) {
      if (buf.length) break;
      continue;
    }
    if (t.startsWith("|") || t.startsWith("---")) continue;
    buf.push(t.replace(/\*\*/g, ""));
    if (buf.join(" ").length > 280) break;
  }
  return buf.join(" ").slice(0, 400);
}

/**
 * Seções que o Ctrl+Espaço precisa mostrar: parâmetros (com enums aninhados),
 * códigos/algoritmos/retorno e observação que cita um código numérico.
 * @param {string} text
 * @param {number} from
 */
function findSupplementAfter(text, from) {
  const slice = text.slice(from, from + 8000);
  const lines = slice.split("\n");
  const TITLE =
    /^(parâmetros|parametros|algoritmos|códigos|codigos|retorno|valor de retorno|valores de retorno)\b/i;
  /** @type {"skip" | "keep" | "observe"} */
  let mode = "skip";
  let inFence = false;
  /** @type {string[]} */
  const out = [];
  /** @type {string[]} */
  let observeBuf = [];

  const flushObserve = () => {
    const textObs = observeBuf.join(" ").replace(/\s+/g, " ").trim();
    observeBuf = [];
    if (!textObs) return;
    if (!/tipo de dado|\bcódigo\b|\(\d+\)|`\d+`/i.test(textObs)) return;
    if (out.length) out.push("");
    out.push("**Observação**");
    out.push(textObs.slice(0, 500));
  };

  for (const raw of lines) {
    const trimmed = raw.trim();
    if (/^```/.test(trimmed)) {
      inFence = !inFence;
      if (mode === "observe") flushObserve();
      continue;
    }
    if (inFence) continue;
    if (/^#{1,6}\s/.test(raw)) break;

    const inlineObs = trimmed.match(/^\*\*(Observa[^*]*)\*\*:?\s+(\S.*)$/i);
    if (inlineObs) {
      if (mode === "observe") flushObserve();
      const rest = inlineObs[2].trim();
      if (/tipo de dado|\bcódigo\b|\(\d+\)|`\d+`|\b\d+\b/i.test(rest)) {
        if (out.length) out.push("");
        out.push("**Observação**");
        out.push(rest.slice(0, 500));
      }
      mode = "skip";
      continue;
    }

    const bold = trimmed.match(/^\*\*([^*]+)\*\*\s*$/);
    if (bold) {
      if (mode === "observe") flushObserve();
      const title = bold[1].replace(/:$/, "").trim();
      if (/^exemplo/i.test(title)) {
        mode = "skip";
        continue;
      }
      if (TITLE.test(title)) {
        mode = "keep";
        if (out.length) out.push("");
        out.push(`**${title}**`);
        continue;
      }
      if (/^observa/i.test(title)) {
        mode = "observe";
        continue;
      }
      mode = "skip";
      continue;
    }

    if (mode === "observe") {
      if (!trimmed) {
        flushObserve();
        mode = "skip";
        continue;
      }
      observeBuf.push(trimmed);
      continue;
    }
    if (mode !== "keep") continue;
    if (!trimmed) {
      if (out.length && out[out.length - 1] !== "") out.push("");
      continue;
    }
    out.push(raw.replace(/\s+$/, ""));
    if (out.join("\n").length > 1800) break;
  }
  if (mode === "observe") flushObserve();
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

/**
 * @param {string} label
 * @param {string} syn
 * @param {string} desc
 * @param {string} supplement
 * @param {string} fname
 */
const DOC_LIMIT = 2800;

/** @type {{ label: string, reason: string }[]} */
const omittedTips = [];
/** @type {{ label: string, marker: string }[]} */
const officialTips = [];
/** @type {{ label: string, tip: string }[]} */
const attachedTips = [];

const PRODUCT_DOC_FILES = [
  path.join(REPO_ROOT, "packages", "lsp-analyzer", "src", "lint", "function-catalog.hcm.generated.ts"),
  path.join(REPO_ROOT, "packages", "lsp-analyzer", "src", "lint", "function-catalog.erp.generated.ts"),
];

const DEDICATED_TIP_FILES = {
  "mensagens.md": "Mensagem",
  "cancel.md": "Cancel",
  "entrada-valor.md": "EntradaValor",
};

/** @type {Map<string, string> | null} */
let productDocs = null;

function loadProductDocs() {
  if (productDocs) return productDocs;
  productDocs = new Map();
  for (const file of PRODUCT_DOC_FILES) {
    if (!fs.existsSync(file)) continue;
    const text = fs.readFileSync(file, "utf8");
    const labelRe = /label:\s*"([^"]+)"/g;
    let m;
    while ((m = labelRe.exec(text))) {
      const docAt = text.indexOf("documentation:", m.index);
      if (docAt < 0 || docAt > m.index + 8000) continue;
      const q = text.indexOf('"', docAt + "documentation:".length);
      if (q < 0) continue;
      const parsed = readDoubleQuoted(text, q);
      if (!parsed) continue;
      const key = m[1].toLowerCase();
      const prev = productDocs.get(key);
      productDocs.set(key, prev ? `${prev}\n${parsed.value}` : parsed.value);
    }
  }
  return productDocs;
}

/** @param {string} text @param {number} q index of opening `"` */
function readDoubleQuoted(text, q) {
  let s = "";
  let i = q + 1;
  while (i < text.length) {
    if (text[i] === "\\") {
      const n = text[i + 1] ?? "";
      if (n === "n") s += "\n";
      else if (n === "t") s += "\t";
      else if (n === "r") s += "\r";
      else s += n;
      i += 2;
      continue;
    }
    if (text[i] === '"') return { value: s, end: i + 1 };
    s += text[i];
    i++;
  }
  return null;
}

function sectionBody(text, from) {
  const lines = text.slice(from).split("\n");
  const out = [];
  for (const line of lines) {
    if (/^#{1,6}\s/.test(line)) break;
    out.push(line);
    if (out.join("\n").length > 6000) break;
  }
  return out.join("\n");
}

function truncateFence(body) {
  const lines = body.replace(/\r/g, "").trim().split("\n").slice(0, 12);
  let text = lines.join("\n");
  if (text.length > 500) {
    text = text.slice(0, 500).replace(/\n[^\n]*$/, "");
  }
  return text.trim();
}

/**
 * Um aviso e um exemplo curto. Não leva o tutorial inteiro.
 * @param {string} section
 * @returns {string}
 */
export function findTipBlock(section) {
  const hasMark = /⚠️|💡|não funciona|uso incorreto|\[&/i.test(section);
  const hasExemplo = /^\s*(?:\*\*)?exemplo\b/im.test(section);
  if (!hasMark && !hasExemplo) return "";

  const lines = section.split("\n");
  let warnAt = -1;
  let warning = "";
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (!/⚠️|💡|não funciona|uso incorreto/i.test(t)) continue;
    warning = t.replace(/\*\*/g, "").replace(/\s+/g, " ").trim();
    if (warning.length < 24) {
      const next = lines.slice(i + 1).find((l) => {
        const x = l.trim();
        return x && !x.startsWith("```") && !x.startsWith("#") && !x.startsWith("|");
      });
      if (next) warning = `${warning} ${next.trim().replace(/\*\*/g, "")}`.replace(/\s+/g, " ");
    }
    warning = warning.slice(0, 280);
    warnAt = i;
    break;
  }

  const fences = [];
  const fenceRe = /```(?:lsp)?\s*\n([\s\S]*?)```/gi;
  let fm;
  while ((fm = fenceRe.exec(section))) {
    const line = section.slice(0, fm.index).split("\n").length - 1;
    fences.push({ line, body: truncateFence(fm[1] ?? "") });
  }
  let exemploAt = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*(?:\*\*)?exemplo\b/i.test(lines[i].trim())) {
      exemploAt = i;
      break;
    }
  }
  const withButtons = fences.find((f) => /\[&/.test(f.body));
  const afterWarn = fences.find((f) => warnAt >= 0 && f.line > warnAt && f.body);
  const afterExemplo = fences.find((f) => exemploAt >= 0 && f.line > exemploAt && f.body);
  const example = (afterWarn ?? afterExemplo ?? withButtons ?? fences[0])?.body ?? "";

  if (!warning && !example) return "";
  const parts = ["**Dica**", ""];
  if (warning) parts.push(warning, "");
  if (example) parts.push("```lsp", example, "```");
  return parts.join("\n").trim();
}

/** Trechos que identificam a dica (botões, aviso, primeira linha de código). */
export function tipMarkers(tip) {
  /** @type {string[]} */
  const markers = [];
  for (const m of tip.matchAll(/\[&[^\]]+\]/g)) {
    if (m[0]) markers.push(m[0]);
  }
  const flag = tip.match(/não funciona|uso incorreto/i);
  if (flag?.[0]) markers.push(flag[0]);
  const warnLine = tip.split("\n").find((l) => /⚠️|💡/.test(l));
  if (warnLine) {
    const clean = warnLine.replace(/[⚠️💡*`]/g, "").replace(/\s+/g, " ").trim();
    if (clean.length >= 8) markers.push(clean.slice(0, 60));
  }
  if (!markers.length) {
    const code = tip.split("\n").find((l) => {
      const t = l.trim();
      return t && !t.startsWith("```") && !t.startsWith("**") && !t.startsWith("@");
    });
    if (code) markers.push(code.trim().slice(0, 60));
  }
  return markers;
}

function normTip(s) {
  return s.replace(/[`*]/g, "").toLowerCase();
}

/** @param {string} doc @param {string} tip */
export function tipCoveredBy(doc, tip) {
  const buttons = [...tip.matchAll(/\[&[^\]]+\]/g)].map((m) => m[0]);
  const hay = doc.toLowerCase();
  if (buttons.length) return buttons.every((b) => hay.includes(b.toLowerCase()));
  const markers = tipMarkers(tip);
  if (!markers.length) return doc.includes("**Dica**");
  const nHay = normTip(doc);
  return markers.every((m) => nHay.includes(normTip(m)));
}

function productHasTip(label, tip) {
  const doc = loadProductDocs().get(label.toLowerCase()) ?? "";
  if (!doc) return false;
  return tipCoveredBy(doc, tip);
}

/**
 * @param {string} label
 * @param {string} syn
 * @param {string} desc
 * @param {string} supplement
 * @param {string} fname
 * @param {string} [tip]
 */
function buildDocumentation(label, syn, desc, supplement, fname, tip = "") {
  const parts = [`**${label}**`, ""];
  if (syn) parts.push(`\`${syn}\``);
  if (desc) parts.push("", desc);
  if (supplement) parts.push("", supplement);
  let body = parts.join("\n").replace(/\n{3,}/g, "\n\n");
  const fonte = `\n\n_Fonte: ${fname}_`;
  const limit = DOC_LIMIT - fonte.length;
  if (tip) {
    if (productHasTip(label, tip)) {
      const marker = tipMarkers(tip)[0] ?? "dica";
      officialTips.push({ label, marker });
    } else if (`${body}\n\n${tip}`.length <= limit) {
      body = `${body}\n\n${tip}`;
      attachedTips.push({ label, tip });
    } else {
      omittedTips.push({ label, reason: "não cabe (2800)" });
    }
  }
  if (body.length > limit) {
    body = body.slice(0, limit).replace(/\n[^\n]*$/, "");
  }
  return body + fonte;
}

export function tipAudit() {
  return {
    omitted: omittedTips.slice(),
    official: officialTips.slice(),
    attached: attachedTips.slice(),
  };
}

/** @param {Map<string, ExtractedFn>} map */
function upsert(map, entry) {
  const key = entry.label.toLowerCase();
  const prev = map.get(key);
  if (!prev) {
    map.set(key, entry);
    return;
  }
  // Prefer richer documentation / better snippet
  const betterDoc =
    (entry.documentation?.length || 0) > (prev.documentation?.length || 0);
  const betterSnippet =
    entry.isSnippet && entry.insertText.includes("${") && !prev.insertText.includes("${");
  if (betterDoc || betterSnippet) {
    map.set(key, {
      ...prev,
      ...entry,
      detail: entry.detail || prev.detail,
      documentation: betterDoc ? entry.documentation : prev.documentation,
      insertText: betterSnippet || betterDoc ? entry.insertText : prev.insertText,
      isSnippet: entry.isSnippet || prev.isSnippet,
    });
  }
}

/** Parse funcoes-gerais.md table. */
function extractFromGerais(map) {
  const file = path.join(DOCS_LSP, "funcoes-gerais.md");
  const text = fs.readFileSync(file, "utf8");
  const re = /^\|\s*([^|]+?)\s*\|\s*([^|]*?)\s*\|/gm;
  let m;
  while ((m = re.exec(text)) !== null) {
    const rawName = m[1].trim();
    const desc = m[2].trim();
    if (/^nome$/i.test(rawName) || /^-+$/.test(rawName)) continue;
    if (/\*\*/.test(rawName) && !/[A-Za-z]{3,}/.test(rawName.replace(/\*\*/g, ""))) continue;
    // Section headers in table: **Manipulação Dinâmica...**
    if (/^\*\*.+\*\*$/.test(rawName) && !/^[A-Za-z]/.test(rawName.replace(/\*/g, ""))) continue;
    if (rawName.includes("**") && desc === "") continue;

    for (const label of splitAliases(rawName, { fromTable: true })) {
      if (!isValidFnName(label)) continue;
      const snip = snippetFromSyntax(`${label}();`, label);
      upsert(map, {
        label,
        insertText: `${label}($0);`,
        detail: (desc || label).slice(0, 100),
        documentation: desc
          ? `**${label}**\n\n${desc}\n\n_Fonte: funcoes-gerais.md_`
          : `**${label}**\n\n_Fonte: funcoes-gerais.md_`,
        isSnippet: true,
        source: "funcoes-gerais.md",
      });
      // refine insert if we only have name
      void snip;
    }
  }
}

/** Parse ### / #### headings in topic files. */
function extractFromHeadings(map) {
  for (const fname of HEADING_FILES) {
    const file = path.join(DOCS_LSP, fname);
    if (!fs.existsSync(file)) continue;
    const text = fs.readFileSync(file, "utf8");
    const re = /^(#{3,4})\s+(\*{0,2})(.+?)\2\s*$/gm;
    let m;
    while ((m = re.exec(text)) !== null) {
      const headingRaw = m[3].trim();
      const plain = headingRaw.replace(/\*\*/g, "").trim();
      if (SECTION_SKIP.has(plain.toLowerCase())) continue;
      if (/^(funções|funcoes|exemplo|guia|resumo|importante|atenção|como |quando )/i.test(plain))
        continue;

      const names = splitAliases(headingRaw);
      if (!names.length) continue;

      const after = m.index + m[0].length;
      const syntax = findSyntaxAfter(text, after);
      const desc = findDescriptionAfter(text, after);
      const supplement = findSupplementAfter(text, after);
      const tip = findTipBlock(sectionBody(text, after));

      for (const label of names) {
        if (!isValidFnName(label)) continue;
        // Prefer syntax that mentions this label
        let syn = syntax;
        if (syn && !new RegExp(label, "i").test(syn)) {
          // try to find label( in nearby fence
          const nearby = text.slice(after, after + 2000).match(
            new RegExp(`${label}\\s*\\([^)]*\\)`, "i")
          );
          syn = nearby ? nearby[0] : `${label}();`;
        }
        if (!syn) syn = `${label}();`;
        const snip = snippetFromSyntax(syn, label);
        const detail = (syn.length <= 100 ? syn : desc || label).slice(0, 100);
        const documentation = buildDocumentation(label, syn, desc, supplement, fname, tip);

        upsert(map, {
          label,
          insertText: snip.insertText,
          detail,
          documentation,
          isSnippet: snip.isSnippet,
          source: fname,
        });
      }
    }
  }
}

/** referencia-rapida: Ident( calls not yet in map. */
function extractFromReferencia(map) {
  const file = path.join(DOCS_LSP, "referencia-rapida.md");
  if (!fs.existsSync(file)) return;
  const text = fs.readFileSync(file, "utf8");
  const re = new RegExp(`\\b(${IDENT})\\s*\\(`, "g");
  let m;
  const skip = new Set([
    "se",
    "senao",
    "para",
    "enquanto",
    "definir",
    "mensagem", // already
  ]);
  while ((m = re.exec(text)) !== null) {
    const label = m[1];
    if (skip.has(label.toLowerCase())) continue;
    if (!isValidFnName(label)) continue;
    if (map.has(label.toLowerCase())) continue;
    // Only PascalCase-ish or known prefixes
    if (!/^[A-Z]/.test(label) && !/^SQL_/i.test(label) && label !== "sleep") continue;
    upsert(map, {
      label,
      insertText: `${label}($0);`,
      detail: label,
      documentation: `**${label}**\n\n_Fonte: referencia-rapida.md_`,
      isSnippet: true,
      source: "referencia-rapida.md",
    });
  }
}

/** SQL_* / ExecSQL from cursores+sql via Ident( if missing. */
function extractSqlFamily(map) {
  for (const fname of ["sql.md", "cursores.md"]) {
    const file = path.join(DOCS_LSP, fname);
    if (!fs.existsSync(file)) continue;
    const text = fs.readFileSync(file, "utf8");
    const re = /\b((?:SQL_|ExecSQL)[A-Za-z0-9_]*)\s*\(/g;
    let m;
    while ((m = re.exec(text)) !== null) {
      const label = m[1];
      const heading = text.match(
        new RegExp(`^#{3,6}\\s+\\*{0,2}${label}\\*{0,2}\\s*$`, "m")
      );
      if (heading && heading.index != null) {
        const after = heading.index + heading[0].length;
        const syntax = findSyntaxAfter(text, after) || `${label}();`;
        const desc = findDescriptionAfter(text, after);
        const supplement = findSupplementAfter(text, after);
        const tip = findTipBlock(sectionBody(text, after));
        const snip = snippetFromSyntax(syntax, label);
        upsert(map, {
          label,
          insertText: snip.insertText,
          detail: (syntax.length <= 100 ? syntax : desc || label).slice(0, 100),
          documentation: buildDocumentation(label, syntax, desc, supplement, fname, tip),
          isSnippet: snip.isSnippet,
          source: fname,
        });
        continue;
      }
      if (map.has(label.toLowerCase())) continue;
      upsert(map, {
        label,
        insertText: `${label}($0);`,
        detail: label,
        documentation: `**${label}**\n\n_Fonte: ${fname}_`,
        isSnippet: true,
        source: fname,
      });
    }
  }
}

function applyDedicatedTips(map) {
  for (const [fname, label] of Object.entries(DEDICATED_TIP_FILES)) {
    const file = path.join(DOCS_LSP, fname);
    if (!fs.existsSync(file)) continue;
    const tip = findTipBlock(fs.readFileSync(file, "utf8"));
    if (!tip) continue;
    const entry = map.get(label.toLowerCase());
    if (!entry || entry.documentation.includes("**Dica**")) continue;
    if (productHasTip(label, tip)) {
      if (!officialTips.some((o) => o.label === label)) {
        officialTips.push({ label, marker: tipMarkers(tip)[0] ?? "dica" });
      }
      continue;
    }
    const fonte = `\n\n_Fonte: ${entry.source || fname}_`;
    const base = entry.documentation.replace(/\n+_Fonte:[\s\S]*$/, "");
    if (`${base}\n\n${tip}${fonte}`.length > DOC_LIMIT) {
      omittedTips.push({ label, reason: "não cabe (2800)" });
      continue;
    }
    entry.documentation = `${base}\n\n${tip}${fonte}`;
    attachedTips.push({ label, tip });
  }
}

export function extractAll() {
  omittedTips.length = 0;
  officialTips.length = 0;
  attachedTips.length = 0;
  productDocs = null;
  /** @type {Map<string, ExtractedFn>} */
  const map = new Map();
  extractFromGerais(map);
  extractFromHeadings(map);
  extractFromReferencia(map);
  extractSqlFamily(map);

  // Ensure Cancel base name exists (codes via overrides)
  if (!map.has("cancel")) {
    upsert(map, {
      label: "Cancel",
      insertText: "Cancel(${1|1,2,3|});",
      detail: "Cancel(1|2|3)",
      documentation: "**Cancel(n)** — ver docs/lsp/cancel.md",
      isSnippet: true,
      source: "cancel.md",
    });
  }

  applyDedicatedTips(map);

  return [...map.values()].sort((a, b) => a.label.localeCompare(b.label));
}

function escapeTs(s) {
  return s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}

function emitTs(entries) {
  const body = entries
    .map((e) => {
      const parts = [
        `  {`,
        `    label: ${JSON.stringify(e.label)},`,
        `    insertText: ${JSON.stringify(e.insertText)},`,
        `    detail: ${JSON.stringify(e.detail)},`,
        `    documentation: ${JSON.stringify(e.documentation)},`,
      ];
      if (e.isSnippet) parts.push(`    isSnippet: true,`);
      if (e.kind) parts.push(`    kind: ${JSON.stringify(e.kind)},`);
      parts.push(`  }`);
      return parts.join("\n");
    })
    .join(",\n");

  return `/** AUTO-GERADO por scripts/extract-lsp-functions.mjs — não editar à mão. */\n` +
    `import type { LspFunctionEntry } from "./function-catalog.types";\n\n` +
    `export const LSP_FUNCTION_CATALOG_GENERATED: LspFunctionEntry[] = [\n${body}\n];\n` +
    `export const EXTRACTED_FUNCTION_LABELS: string[] = ${JSON.stringify(
      entries.map((e) => e.label),
      null,
      2
    )};\n`;
}

export function writeOutputs() {
  const entries = extractAll();
  fs.mkdirSync(path.dirname(OUT_TS), { recursive: true });
  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(OUT_TS, emitTs(entries), "utf8");
  fs.writeFileSync(
    OUT_TS_WORKBENCH_REEXPORT,
    `/** Reexport — gerado em packages/lsp-analyzer/src/lint (extract-lsp-functions). */\n` +
      `export { LSP_FUNCTION_CATALOG_GENERATED, EXTRACTED_FUNCTION_LABELS } from "@lsp-workbench/analyzer";\n`,
    "utf8"
  );
  fs.writeFileSync(
    OUT_JSON,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        count: entries.length,
        labels: entries.map((e) => e.label),
        entries: entries.map(({ label, detail, source, insertText }) => ({
          label,
          detail,
          source,
          insertText,
        })),
      },
      null,
      2
    ),
    "utf8"
  );
  return entries;
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  const entries = writeOutputs();
  console.log(`Extraídas ${entries.length} funções →`);
  console.log(`  ${path.relative(REPO_ROOT, OUT_TS)}`);
  console.log(`  ${path.relative(REPO_ROOT, OUT_TS_WORKBENCH_REEXPORT)} (reexport)`);
  console.log(`  ${path.relative(REPO_ROOT, OUT_JSON)}`);
  const samples = ["Mensagem", "HttpGet", "InsClauSQLWhere", "RetDiaSemana", "UltimoDia", "RetiraAcentuacao", "VrfAbrA", "IntParaStr", "Extenso"];
  for (const s of samples) {
    const ok = entries.some((e) => e.label === s || e.label.startsWith(s));
    console.log(`  ${ok ? "OK" : "MISS"} ${s}`);
  }
}
