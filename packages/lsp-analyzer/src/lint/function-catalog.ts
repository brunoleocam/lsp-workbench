/**
 * Catálogo de funções LSP para Ctrl+Espaço.
 * Merge: HCM, ERP por cima, docs/lsp conserva o texto e completa tipo/descrição do produto, overrides por último.
 */
import { LSP_FUNCTION_CATALOG_GENERATED } from "./function-catalog.generated";
import { LSP_FUNCTION_CATALOG_HCM } from "./function-catalog.hcm.generated";
import { LSP_FUNCTION_CATALOG_ERP } from "./function-catalog.erp.generated";
import { LSP_FUNCTION_CATALOG_OVERRIDES } from "./function-catalog.overrides";
import type { LspFunctionEntry, LspFunctionParam } from "./function-catalog.types";

export type { LspFunctionEntry, LspFunctionParam, LspFunctionSystem } from "./function-catalog.types";

export { LSP_FUNCTION_CATALOG_GENERATED, EXTRACTED_FUNCTION_LABELS } from "./function-catalog.generated";
export { LSP_FUNCTION_CATALOG_HCM, HCM_FUNCTION_LABELS } from "./function-catalog.hcm.generated";
export { LSP_FUNCTION_CATALOG_ERP, ERP_FUNCTION_LABELS } from "./function-catalog.erp.generated";
export { LSP_FUNCTION_CATALOG_OVERRIDES, OVERRIDE_EXTRA_LABELS } from "./function-catalog.overrides";

function mergeCatalog(): LspFunctionEntry[] {
  const byLabel = new Map<string, LspFunctionEntry>();
  // Produto primeiro; plataforma e overrides sobrescrevem docs genéricas de produto.
  for (const e of LSP_FUNCTION_CATALOG_HCM) {
    byLabel.set(e.label.toLowerCase(), angleEntry(e));
  }
  for (const e of LSP_FUNCTION_CATALOG_ERP) {
    byLabel.set(e.label.toLowerCase(), angleEntry(e));
  }
  for (const e of LSP_FUNCTION_CATALOG_GENERATED) {
    const key = e.label.toLowerCase();
    byLabel.set(key, angleEntry(withProductParams(e, byLabel.get(key))));
  }
  for (const e of LSP_FUNCTION_CATALOG_OVERRIDES) {
    const key = e.label.toLowerCase();
    byLabel.set(key, withPreservedTip(e, byLabel.get(key)));
  }
  return [...byLabel.values()].sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * docs/lsp guarda enums e o texto. O tipo e a descrição da tabela Senior
 * vêm do catálogo de produto quando a plataforma não os trouxe.
 */
function withProductParams(
  platform: LspFunctionEntry,
  product: LspFunctionEntry | undefined
): LspFunctionEntry {
  const params = usableParams(product?.params);
  if (!params) return platform;
  const insertText =
    product?.insertText && /\$\{\d+:/.test(product.insertText)
      ? product.insertText
      : platform.insertText;
  return { ...platform, params, insertText };
}

function usableParams(params: LspFunctionParam[] | undefined): LspFunctionParam[] | undefined {
  const cleaned = (params ?? []).filter((p) => p.name.trim());
  return cleaned.length ? cleaned : undefined;
}

/** O tipo fica no helper. O snippet só deixa o marcador `<Nome>`, que não compila até ser trocado. */
function angleBracketSnippet(insertText: string): string {
  return insertText.replace(/\$\{(\d+):([^}]+)\}/g, (_all, n: string, hint: string) => {
    const trimmed = hint.trim();
    if (/^<.+>$/.test(trimmed)) return `\${${n}:${trimmed}}`;
    let name = trimmed.replace(/^(?:Numero|Alfa|Data|Lista|Alfanum[eé]rico)\s+/i, "");
    name = name.replace(/^End\s+/i, "").replace(/[}$]/g, "").trim();
    if (!name) return `\${${n}:${trimmed}}`;
    return `\${${n}:<${name}>}`;
  });
}

/** Trechos que identificam a dica vinda de docs/lsp. */
function tipMarkers(tip: string): string[] {
  const markers: string[] = [];
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
      return t.length > 0 && !t.startsWith("```") && !t.startsWith("**") && !t.startsWith("@");
    });
    if (code) markers.push(code.trim().slice(0, 60));
  }
  return markers;
}

function generatedDica(documentation: string): string | undefined {
  const idx = documentation.search(/^\*\*Dica\*\*\s*$/m);
  if (idx < 0) return undefined;
  return documentation
    .slice(idx)
    .replace(/\n+_Fonte:[\s\S]*$/, "")
    .trim();
}

function normTip(s: string): string {
  return s.replace(/[`*]/g, "").toLowerCase();
}

function tipCoveredBy(doc: string, tip: string): boolean {
  const buttons = [...tip.matchAll(/\[&[^\]]+\]/g)].map((m) => m[0]);
  const hay = doc.toLowerCase();
  if (buttons.length) return buttons.every((b) => hay.includes(b.toLowerCase()));
  const markers = tipMarkers(tip);
  if (!markers.length) return doc.includes("**Dica**");
  const nHay = normTip(doc);
  return markers.every((m) => nHay.includes(normTip(m)));
}

/** O override substitui a entrada, mas não apaga **Dica** se o texto curto não tem os mesmos marcadores. */
function withPreservedTip(
  override: LspFunctionEntry,
  generated: LspFunctionEntry | undefined
): LspFunctionEntry {
  if (!generated) return override;
  const dica = generatedDica(generated.documentation ?? "");
  if (!dica) return override;
  if (tipCoveredBy(override.documentation ?? "", dica)) return override;
  const documentation = `${(override.documentation ?? "").trim()}\n\n${dica}`;
  return { ...override, documentation };
}

function angleEntry(entry: LspFunctionEntry): LspFunctionEntry {
  const insertText = angleBracketSnippet(entry.insertText);
  if (insertText === entry.insertText) return entry;
  return { ...entry, insertText };
}

export const LSP_FUNCTION_CATALOG: LspFunctionEntry[] = mergeCatalog();

/**
 * Doc Senior do parâmetro aceita campo ou variável (Alfa, Numero ou Data).
 * Formas: "Campo/Variável …", "Campo ou Variável …", "Campo, Valor ou Variável …".
 * Menção subordinada não conta: "tamanho do campo/variável", "posição do campo/variável".
 */
const CAMPO_VARIAVEL =
  /campo\s*\/\s*vari[aá]vel|campo\s+ou\s+vari[aá]vel|campo\s*,\s*(?:valor\s+ou\s+)?vari[aá]vel/i;
const MENCAO_SUBORDINADA = /\b(retornar[aá]|tamanho do|posi[cç][aã]o do)\b/i;

export function descriptionAcceptsCampoVariavel(text: string): boolean {
  if (!CAMPO_VARIAVEL.test(text)) return false;
  if (/^\s*campo\s*(?:\/|ou)\s*vari[aá]vel\b/i.test(text)) return true;
  if (/^\s*campo\s*,\s*(?:valor\s+ou\s+)?vari[aá]vel\b/i.test(text)) return true;
  return !MENCAO_SUBORDINADA.test(text);
}

function paramDescriptionsFromDocs(documentation: string): string[] {
  const parts = documentation.split(/\*\*Par[aâ]metros\*\*/i);
  if (parts.length < 2) return [];
  const section = (parts[1] ?? "").split(/\n\*\*[^*]+\*\*/)[0] ?? "";
  const descs: string[] = [];
  for (const line of section.split("\n")) {
    if (/^\s/.test(line)) continue;
    const m = line.match(/^- `[^`]+`\s*(?:\([^)]*\))?\s*(?:—|--|:|-)\s*(.+)$/);
    if (m?.[1]) descs.push(m[1]);
  }
  return descs;
}

function entryParamTexts(entry: LspFunctionEntry): string[] {
  const fromParams = (entry.params ?? [])
    .filter((p) => p.name.trim())
    .map((p) => p.description ?? "");
  const fromDocs = paramDescriptionsFromDocs(entry.documentation);
  const count = Math.max(fromParams.length, fromDocs.length);
  const texts: string[] = [];
  for (let i = 0; i < count; i++) {
    texts.push(`${fromParams[i] ?? ""} ${fromDocs[i] ?? ""}`);
  }
  return texts;
}

const FORBIDS_TABLE_FIELD = /n[aã]o pode ser campo do sistema ou de tabela/i;

function fieldAcceptingParams(): Map<string, boolean[]> {
  const map = new Map<string, boolean[]>();
  const sources = [
    LSP_FUNCTION_CATALOG_HCM,
    LSP_FUNCTION_CATALOG_ERP,
    LSP_FUNCTION_CATALOG_GENERATED,
    LSP_FUNCTION_CATALOG_OVERRIDES,
  ];
  const forbidsTableField = new Set<string>();
  for (const catalog of sources) {
    for (const entry of catalog) {
      if (FORBIDS_TABLE_FIELD.test(entry.documentation)) {
        forbidsTableField.add(entry.label.toLowerCase());
      }
    }
  }
  for (const catalog of sources) {
    for (const entry of catalog) {
      const key = entry.label.toLowerCase();
      if (forbidsTableField.has(key)) continue;
      const flags = map.get(key) ?? [];
      entryParamTexts(entry).forEach((text, index) => {
        if (descriptionAcceptsCampoVariavel(text)) flags[index] = true;
      });
      map.set(key, flags);
    }
  }
  return map;
}

const FIELD_ACCEPTING_PARAMS = fieldAcceptingParams();

/** Parâmetro cuja descrição Senior aceita campo de tabela/objeto ou variável. */
export function catalogParamAcceptsField(functionName: string, argIndex: number): boolean {
  return FIELD_ACCEPTING_PARAMS.get(functionName.toLowerCase())?.[argIndex] === true;
}

export function functionsMatchingPrefix(prefix: string): LspFunctionEntry[] {
  const p = prefix.trim().toLowerCase();
  if (!p) return [];
  return LSP_FUNCTION_CATALOG.filter((e) => e.label.toLowerCase().startsWith(p)).sort((a, b) =>
    a.label.localeCompare(b.label, "pt-BR", { sensitivity: "base" })
  );
}
