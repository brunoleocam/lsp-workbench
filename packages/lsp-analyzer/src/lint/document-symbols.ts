/**
 * Índice de símbolos por documento (funções, variáveis, LSPDoc).
 * Puro / testável — sem vscode.
 */

import { maskCommentsAndStrings } from "./comment-mask";
import { matchDefinirWebService } from "./webservice";

export type LspDocParam = { name: string; description: string };
export type LspDocInfo = {
  summary: string;
  params: LspDocParam[];
  returns?: string;
  raw: string;
};

export type FuncParam = {
  name: string;
  tipo: string;
  isEnd: boolean;
};

export type CustomFunctionSymbol = {
  name: string;
  params: FuncParam[];
  hasDecl: boolean;
  hasImpl: boolean;
  eligible: boolean;
  declLine: number;
  implLine: number;
  /** Linhas inclusivas do LSPDoc acima da decl/impl (se houver). */
  lspDoc?: LspDocInfo;
  lspDocStartLine?: number;
  lspDocEndLine?: number;
  /** Texto canônico `Definir Funcao …;` */
  declText?: string;
  /** Texto do bloco `Funcao … { … }` (corpo completo) */
  implText?: string;
  signature: string;
};

export type VariableSymbol = {
  name: string;
  tipo: string;
  line: number;
  /** Escopo: arquivo ou nome da função */
  scope: "file" | string;
};

export type FileSymbols = {
  functions: CustomFunctionSymbol[];
  variables: VariableSymbol[];
};

function stripLineComment(line: string): string {
  return maskCommentsAndStrings(line);
}

/** Extrai bloco LSPDoc imediatamente acima de fromLine (só linhas em branco entre). */
export function extractLspDocAbove(lines: string[], fromLine: number): {
  doc?: LspDocInfo;
  startLine?: number;
  endLine?: number;
} {
  let i = fromLine - 1;
  while (i >= 0 && lines[i].trim() === "") i--;
  if (i < 0) return {};
  const endLine = i;
  if (!/\*\//.test(lines[i])) return {};

  let start = i;
  while (start >= 0 && !/\/\*\*/.test(lines[start])) start--;
  if (start < 0 || !/\/\*\*/.test(lines[start])) return {};

  const raw = lines.slice(start, endLine + 1).join("\n");
  return { doc: parseLspDoc(raw), startLine: start, endLine };
}

export function parseLspDoc(raw: string): LspDocInfo {
  const body = raw
    .replace(/^\/\*\*?/, "")
    .replace(/\*\/\s*$/, "")
    .split("\n")
    .map((l) => l.replace(/^\s*\*\s?/, "").trimEnd())
    .join("\n")
    .trim();

  const params: LspDocParam[] = [];
  let returns: string | undefined;
  const summaryLines: string[] = [];

  for (const line of body.split("\n")) {
    const p = line.match(/^@param\s+(\S+)\s+(.*)$/i);
    if (p) {
      params.push({ name: p[1], description: p[2].trim() });
      continue;
    }
    const r = line.match(/^@returns?\s+(.*)$/i);
    if (r) {
      returns = r[1].trim();
      continue;
    }
    if (line.trim()) summaryLines.push(line.trim());
  }

  return {
    summary: summaryLines.join(" ").trim() || body.split("\n")[0]?.trim() || "",
    params,
    returns,
    raw,
  };
}

export function parseFuncParams(paramList: string): FuncParam[] {
  if (!paramList.trim()) return [];
  return paramList.split(",").map((part) => {
    const t = part.trim();
    const m = t.match(/^(Numero|Alfa|Data|Lista)\s+(End\s+)?(\w+)$/i);
    if (m) {
      return {
        tipo: m[1],
        isEnd: !!m[2],
        name: m[3],
      };
    }
    const loose = t.match(/(\w+)\s*$/);
    return { tipo: "Numero", isEnd: /\bEnd\b/i.test(t), name: loose?.[1] ?? t };
  });
}

function signatureOf(name: string, params: FuncParam[]): string {
  const inner = params
    .map((p) => `${p.tipo}${p.isEnd ? " End" : ""} ${p.name}`)
    .join(", ");
  return `${name}(${inner})`;
}

/** Só Numero (e End) são legais na assinatura — Alfa/Data/Lista/Cursor ficam de fora. */
export function legalFuncParams(params: FuncParam[]): FuncParam[] {
  return params.filter((p) => /^Numero$/i.test(p.tipo));
}

function extractImplBlock(lines: string[], startLine: number): string | undefined {
  let depth = 0;
  let started = false;
  const chunk: string[] = [];
  for (let i = startLine; i < lines.length; i++) {
    const line = lines[i];
    chunk.push(line);
    for (const ch of line) {
      if (ch === "{") {
        depth++;
        started = true;
      } else if (ch === "}") {
        depth--;
      }
    }
    if (started && depth <= 0) {
      return chunk.join("\n");
    }
  }
  return chunk.join("\n");
}

/** Analisa um fonte LSP e retorna símbolos. */
export function parseFileSymbols(source: string): FileSymbols {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const byName = new Map<string, CustomFunctionSymbol>();
  const variables: VariableSymbol[] = [];

  const ensure = (name: string): CustomFunctionSymbol => {
    const key = name.toLowerCase();
    let f = byName.get(key);
    if (!f) {
      f = {
        name,
        params: [],
        hasDecl: false,
        hasImpl: false,
        eligible: false,
        declLine: -1,
        implLine: -1,
        signature: `${name}()`,
      };
      byName.set(key, f);
    }
    return f;
  };

  let blockComment = false;
  let currentFunc: string | null = null;
  let braceDepth = 0;
  let funcBraceDepth = 0;

  for (let i = 0; i < lines.length; i++) {
    let raw = lines[i];
    if (blockComment) {
      if (raw.includes("*/")) blockComment = false;
      continue;
    }
    // Não pular LSPDoc inteiro aqui — Declaramos após extrair doc
    const lineNoDoc = stripLineComment(raw);
    if (/\/\*/.test(lineNoDoc) && !/\*\//.test(lineNoDoc)) {
      // bloco aberto — se for LSPDoc (barra-estrela-estrela), ainda processamos Decl abaixo
      if (!/\/\*\*/.test(lineNoDoc)) {
        blockComment = true;
        continue;
      }
    }

    const decl = lineNoDoc.match(/^\s*Definir\s+Funcao\s+(\w+)\s*\(([^)]*)\)\s*;/i);
    if (decl) {
      const name = decl[1];
      const params = parseFuncParams(decl[2]);
      const f = ensure(name);
      f.hasDecl = true;
      f.declLine = i;
      f.params = params.length ? params : f.params;
      f.declText = lines[i].trim();
      f.signature = signatureOf(f.name, f.params);
      const doc = extractLspDocAbove(lines, i);
      if (doc.doc) {
        f.lspDoc = doc.doc;
        f.lspDocStartLine = doc.startLine;
        f.lspDocEndLine = doc.endLine;
      }
      continue;
    }

    const impl = lineNoDoc.match(/^\s*Funcao\s+(\w+)\s*\(([^)]*)\)\s*;?\s*\{?/i);
    if (impl && !/^\s*Definir\s+Funcao/i.test(lineNoDoc)) {
      const name = impl[1];
      const params = parseFuncParams(impl[2]);
      const f = ensure(name);
      f.hasImpl = true;
      f.implLine = i;
      if (params.length) f.params = params;
      f.signature = signatureOf(f.name, f.params);
      f.implText = extractImplBlock(lines, i);
      if (!f.lspDoc) {
        const doc = extractLspDocAbove(lines, i);
        if (doc.doc) {
          f.lspDoc = doc.doc;
          f.lspDocStartLine = doc.startLine;
          f.lspDocEndLine = doc.endLine;
        }
      }
      currentFunc = name;
      funcBraceDepth = braceDepth;
      if (lineNoDoc.includes("{")) {
        // depth tracked below
      }
    }

    const defVar = lineNoDoc.match(
      /^\s*Definir\s+(Alfa|Numero|Data|Lista|Cursor)\s+(\w+)\s*(?:\[[^\]]*\])?\s*;/i
    );
    if (defVar) {
      variables.push({
        name: defVar[2],
        tipo: defVar[1],
        line: i,
        scope: currentFunc ?? "file",
      });
    }
    const defWs = matchDefinirWebService(lineNoDoc);
    if (defWs) {
      variables.push({
        name: defWs.name,
        tipo: "WebService",
        line: i,
        scope: currentFunc ?? "file",
      });
    }

    // params da função ativa como variáveis de escopo
    if (impl && currentFunc) {
      const f = byName.get(currentFunc.toLowerCase());
      if (f) {
        for (const p of f.params) {
          variables.push({
            name: p.name,
            tipo: p.tipo,
            line: i,
            scope: currentFunc,
          });
        }
      }
    }

    for (const ch of lineNoDoc) {
      if (ch === "{") braceDepth++;
      if (ch === "}") {
        braceDepth--;
        if (currentFunc && braceDepth <= funcBraceDepth) {
          currentFunc = null;
        }
      }
    }
  }

  for (const f of byName.values()) {
    f.eligible = f.hasDecl && f.hasImpl;
  }

  return {
    functions: [...byName.values()],
    variables,
  };
}

/** Texto canônico `Definir Funcao name(…);` — só params Numero (nunca copia Alfa/Data/Lista). */
export function declStatementFor(fn: CustomFunctionSymbol): string {
  return `Definir Funcao ${signatureOf(fn.name, legalFuncParams(fn.params))};`;
}

/** FUN008 — inserir `Definir Funcao` no bloco de declarações (após variáveis). */
export function applyFun008InsertDecl(source: string, functionName: string): string | undefined {
  const symbols = parseFileSymbols(source);
  const fn = symbols.functions.find((f) => f.name.toLowerCase() === functionName.toLowerCase());
  if (!fn || !fn.hasImpl || fn.hasDecl || fn.implLine < 0) return undefined;

  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const insertAt = findDefinirFuncaoInsertIndex(lines);
  lines.splice(insertAt, 0, declStatementFor(fn));
  return lines.join("\n");
}

/**
 * Índice (splice) para `Definir Funcao`: após Numero…Cursor (e demais Definir Funcao),
 * antes da primeira instrução executável / `Funcao` de implementação.
 */
function findDefinirFuncaoInsertIndex(lines: string[]): number {
  const order = ["Numero", "Alfa", "Data", "Lista", "Tabela", "Grid", "Cursor", "Funcao"];
  const rank = (line: string): number | null => {
    const m = line.match(/^\s*Definir\s+(\w+)\b/i);
    if (!m) return null;
    const idx = order.findIndex((k) => k.toLowerCase() === m[1].toLowerCase());
    return idx >= 0 ? idx : 0;
  };
  const isNoise = (line: string) =>
    /^\s*$/.test(line) || /^\s*@/.test(line) || /^\s*\/\*/.test(line) || /^\s*\*/.test(line);

  let start = 0;
  while (start < lines.length && isNoise(lines[start])) start++;

  let after = start - 1;
  let i = start;
  for (; i < lines.length; i++) {
    if (isNoise(lines[i])) continue;
    const r = rank(lines[i]);
    if (r === null) break;
    if (r <= order.indexOf("Funcao")) after = i;
    else break;
  }
  return Math.max(0, after + 1);
}

/** FUN007 — inserir stub `Funcao name(…); { }` após o bloco de declarações (não colado no Definir). */
export function applyFun007InsertImpl(source: string, functionName: string): string | undefined {
  const symbols = parseFileSymbols(source);
  const fn = symbols.functions.find((f) => f.name.toLowerCase() === functionName.toLowerCase());
  if (!fn || !fn.hasDecl || fn.hasImpl || fn.declLine < 0) return undefined;

  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const insertAt = findDefinirFuncaoInsertIndex(lines);
  const stub = [`Funcao ${signatureOf(fn.name, legalFuncParams(fn.params))}; {`, "}"];
  lines.splice(insertAt, 0, ...stub);
  return lines.join("\n");
}

/** Snippet de chamada com placeholders de parametro. */
export function callSnippetFor(fn: CustomFunctionSymbol): string {
  if (!fn.params.length) return `${fn.name}();`;
  const args = fn.params.map((p, idx) => `\${${idx + 1}:${p.name}}`).join(", ");
  return `${fn.name}(${args});`;
}

export function markdownForFunction(fn: CustomFunctionSymbol): string {
  const parts: string[] = [];
  parts.push("```lsp");
  parts.push(fn.signature);
  parts.push("```");
  if (fn.lspDoc?.summary) parts.push("", fn.lspDoc.summary);
  if (fn.lspDoc?.params.length) {
    parts.push("", "**Parâmetros**");
    for (const p of fn.lspDoc.params) {
      parts.push(`- \`${p.name}\` — ${p.description}`);
    }
  }
  if (fn.lspDoc?.returns) {
    parts.push("", `**Retorno:** ${fn.lspDoc.returns}`);
  }
  return parts.join("\n");
}

/** Texto a importar (LSPDoc + Definir + Impl). */
export function importBlockFor(fn: CustomFunctionSymbol): string {
  const chunks: string[] = [];
  if (fn.lspDoc?.raw) chunks.push(fn.lspDoc.raw.trimEnd());
  if (fn.declText) chunks.push(fn.declText);
  if (fn.implText) chunks.push(fn.implText);
  return chunks.join("\n\n") + "\n";
}
