/**
 * Catálogo de funções extra (ADR-009): leitura do contrato `lsp-workbench-functions/v1`
 * e merge com o embutido — estrutura do extra vence, texto da nossa doc complementa.
 */
import type { LspFunctionEntry, LspFunctionParam } from "./function-catalog.types";
import { normalizeParamType, type SignatureParam } from "./function-signature";

export type ExtraFunction = {
  name: string;
  signature: string;
  params: SignatureParam[];
  variants: SignatureParam[][];
};

export type ExtraFunctionCatalog = { functions: ExtraFunction[] };

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function readParams(raw: unknown): SignatureParam[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(isObject).map((p) => ({
    name: String(p.nome ?? "").trim(),
    tipo: normalizeParamType(typeof p.tipo === "string" ? p.tipo : undefined),
    out: p.saida === true,
  }));
}

function readFunction(raw: unknown): ExtraFunction | undefined {
  if (!isObject(raw) || typeof raw.nome !== "string" || !raw.nome.trim()) return undefined;
  const name = raw.nome.trim();
  const params = readParams(raw.params);
  const variants = Array.isArray(raw.variantes)
    ? raw.variantes.map(readParams)
    : [params];
  const signature =
    typeof raw.assinatura === "string" && raw.assinatura.trim()
      ? raw.assinatura.trim()
      : `Funcao ${name}(${params.map(paramText).join(", ")});`;
  return { name, signature, params, variants: variants.length ? variants : [params] };
}

/** Envelope v1 ou o mapa cru (valores com `nome`). Conteúdo inválido → `undefined`. */
export function parseExtraFunctionCatalog(json: unknown): ExtraFunctionCatalog | undefined {
  if (!isObject(json)) return undefined;
  const map = isObject(json.functions) ? json.functions : json;
  const functions = Object.values(map)
    .map(readFunction)
    .filter((f): f is ExtraFunction => !!f);
  return functions.length ? { functions } : undefined;
}

function paramText(p: SignatureParam): string {
  return [p.tipo, p.out ? "End" : undefined, p.name].filter(Boolean).join(" ");
}

/** `Funcao X(…);` → `X(…)` para `detail`. */
function bareSignature(signature: string): string {
  return signature.replace(/^\s*funcao\s+/i, "").replace(/;\s*$/, "").trim();
}

function snippet(name: string, params: SignatureParam[]): string {
  const args = params.map((p, i) => `\${${i + 1}:<${p.name}>}`).join(", ");
  return `${name}(${args});`;
}

function toParams(params: SignatureParam[], described?: LspFunctionParam[]): LspFunctionParam[] {
  return params.map((p) => {
    const description = described?.find(
      (d) => d.name.toLowerCase() === p.name.toLowerCase()
    )?.description;
    return { name: p.name, tipo: p.tipo, out: p.out, ...(description ? { description } : {}) };
  });
}

/** Troca o 1º trecho de código (a assinatura documentada) pela assinatura do extra. */
function replaceDocSignature(documentation: string, signature: string): string {
  const code = `\`${signature}\``;
  return /`[^`\n]+`/.test(documentation)
    ? documentation.replace(/`[^`\n]+`/, () => code)
    : `${code}\n\n${documentation}`;
}

function mergedEntry(base: LspFunctionEntry, extra: ExtraFunction): LspFunctionEntry {
  const bare = bareSignature(extra.signature);
  return {
    ...base,
    detail: base.system ? `${base.system} · ${bare}` : bare,
    insertText: snippet(base.label, extra.params),
    isSnippet: true,
    documentation: replaceDocSignature(base.documentation ?? "", extra.signature),
    params: toParams(extra.params, base.params),
    variants: extra.variants.map((v) => toParams(v, base.params)),
    origin: "merged",
  };
}

function extraOnlyEntry(extra: ExtraFunction): LspFunctionEntry {
  return {
    label: extra.name,
    insertText: snippet(extra.name, extra.params),
    detail: bareSignature(extra.signature),
    documentation: `\`${extra.signature}\`\n\nSem documentação pública (catálogo extra).`,
    kind: "function",
    isSnippet: true,
    params: toParams(extra.params),
    variants: extra.variants.map((v) => toParams(v)),
    origin: "extra",
  };
}

/** REQ-032: não remove função do embutido; não altera as entradas recebidas. */
export function mergeFunctionCatalog(
  base: LspFunctionEntry[],
  extra: ExtraFunctionCatalog
): LspFunctionEntry[] {
  const extraByKey = new Map(extra.functions.map((f) => [f.name.toLowerCase(), f]));
  const out = base.map((e) => {
    const x = extraByKey.get(e.label.toLowerCase());
    return x ? mergedEntry(e, x) : e;
  });
  const baseKeys = new Set(base.map((e) => e.label.toLowerCase()));
  for (const [key, f] of extraByKey) {
    if (!baseKeys.has(key)) out.push(extraOnlyEntry(f));
  }
  return out.sort((a, b) => a.label.localeCompare(b.label));
}

export type EffectiveCatalogBuild = {
  catalog: LspFunctionEntry[];
  extraCount: number;
  divergences: string[];
  error?: string;
};

/** Texto do arquivo extra → `base` + extra. Inválido = só `base` + `error`. */
export function buildEffectiveFunctionCatalog(
  raw: string,
  base: LspFunctionEntry[]
): EffectiveCatalogBuild {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    return { catalog: base, extraCount: 0, divergences: [], error: `JSON inválido: ${reason}` };
  }
  const extra = parseExtraFunctionCatalog(json);
  if (!extra) {
    return {
      catalog: base,
      extraCount: 0,
      divergences: [],
      error: "arquivo fora do contrato lsp-workbench-functions/v1 (sem funções reconhecidas)",
    };
  }
  return {
    catalog: mergeFunctionCatalog(base, extra),
    extraCount: extra.functions.length,
    divergences: functionCatalogDivergences(base, extra),
  };
}

/** Funções presentes nos dois com nº de params, tipo ou `End` diferentes (para revisar a doc). */
export function functionCatalogDivergences(
  base: LspFunctionEntry[],
  extra: ExtraFunctionCatalog
): string[] {
  const baseByKey = new Map(base.map((e) => [e.label.toLowerCase(), e]));
  const out: string[] = [];
  for (const f of extra.functions) {
    const b = baseByKey.get(f.name.toLowerCase());
    if (!b) continue;
    const bp = b.params ?? [];
    const differs =
      bp.length !== f.params.length ||
      f.params.some(
        (p, i) =>
          (p.tipo && normalizeParamType(bp[i]?.tipo) && p.tipo !== normalizeParamType(bp[i]?.tipo)) ||
          p.out !== (bp[i]?.out ?? false)
      );
    if (differs) out.push(b.label);
  }
  return out.sort();
}
