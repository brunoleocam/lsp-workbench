import { ROUNDING_FUNCS, TRUNCATE_FUNCS } from "./rule-catalog";
import { LSP_FUNCTION_CATALOG, type LspFunctionEntry } from "./function-catalog";

/** Seeds de autocomplete sem dependência do módulo vscode (testável em node). */

export type LspCompletionSeed = {
  label: string;
  insertText: string;
  kind: "keyword" | "function" | "type";
  detail: string;
  documentation?: string;
  isSnippet?: boolean;
};

function entryToSeed(e: LspFunctionEntry): LspCompletionSeed {
  return {
    label: e.label,
    insertText: e.insertText,
    kind: e.kind === "keyword" ? "keyword" : "function",
    detail: e.detail,
    documentation: e.documentation,
    isSnippet: e.isSnippet,
  };
}

export function getRoundingCompletionSeeds(): LspCompletionSeed[] {
  return ROUNDING_FUNCS.map((fn) => ({
    label: fn.name,
    insertText: fn.insert,
    kind: "function" as const,
    detail: fn.detail,
    documentation: `Substituto de Arredondar (inexistente). ${fn.detail}`,
    isSnippet: true,
  }));
}

export function getTruncateCompletionSeeds(): LspCompletionSeed[] {
  return TRUNCATE_FUNCS.map((fn) => ({
    label: fn.name,
    insertText: fn.insert,
    kind: "function" as const,
    detail: fn.detail,
    documentation: fn.detail,
    isSnippet: true,
  }));
}

/** Keywords / tipos estruturais (além do catálogo de funções). */
function getStructuralSeeds(): LspCompletionSeed[] {
  return [
    {
      label: "Definir",
      insertText: "Definir ${1|Alfa,Numero,Data,Lista,Cursor|} ${2:nome};",
      kind: "keyword",
      detail: "Declarar variável",
      isSnippet: true,
    },
    {
      label: "Se",
      insertText: "Se (${1:condicao}) {\n  $0\n}",
      kind: "keyword",
      detail: "Condicional",
      isSnippet: true,
    },
    {
      label: "Senao",
      insertText: "Senao {\n  $0\n}",
      kind: "keyword",
      detail: "Senão",
      isSnippet: true,
    },
    {
      label: "Enquanto",
      insertText: "Enquanto (${1:condicao}) {\n  $0\n}",
      kind: "keyword",
      detail: "Loop",
      isSnippet: true,
    },
    {
      label: "Para",
      insertText: "Para (${1:vnI} = 1; ${1:vnI} <= ${2:10}; ${1:vnI}++) {\n  $0\n}",
      kind: "keyword",
      detail: "Loop contado",
      isSnippet: true,
    },
    {
      label: "Funcao",
      insertText: "Funcao ${1:nome}(Numero ${2:vnParam});\n{\n  $0\n}",
      kind: "keyword",
      detail: "Função (params só Numero)",
      isSnippet: true,
    },
    {
      label: "Alfa",
      insertText: "Alfa",
      kind: "type",
      detail: "Tipo texto",
    },
    {
      label: "Numero",
      insertText: "Numero",
      kind: "type",
      detail: "Tipo numérico",
    },
    {
      label: "Data",
      insertText: "Data",
      kind: "type",
      detail: "Tipo data",
    },
    {
      label: "Lista",
      insertText: "Lista",
      kind: "type",
      detail: "Tipo lista",
    },
    {
      label: "Cursor",
      insertText: "Cursor",
      kind: "type",
      detail: "Tipo cursor",
    },
  ];
}

export function getLspCompletionSeeds(): LspCompletionSeed[] {
  const byLabel = new Map<string, LspCompletionSeed>();
  for (const e of LSP_FUNCTION_CATALOG) {
    byLabel.set(e.label.toLowerCase(), entryToSeed(e));
  }
  for (const s of [
    ...getStructuralSeeds(),
    ...getRoundingCompletionSeeds(),
    ...getTruncateCompletionSeeds(),
  ]) {
    if (!byLabel.has(s.label.toLowerCase())) {
      byLabel.set(s.label.toLowerCase(), s);
    }
  }
  return [...byLabel.values()];
}

/** Seeds que batem no prefixo digitado (Mens → Mensagem; M → todas com M…). */
export function getLspCompletionSeedsMatching(prefix: string): LspCompletionSeed[] {
  const p = prefix.trim().toLowerCase();
  if (!p) return [];
  return getLspCompletionSeeds()
    .filter((s) => s.label.toLowerCase().startsWith(p))
    .sort((a, b) => {
      if (a.label.length !== b.label.length) return a.label.length - b.label.length;
      return a.label.localeCompare(b.label);
    });
}

export function completionLabels(): string[] {
  return getLspCompletionSeeds().map((s) => s.label);
}
