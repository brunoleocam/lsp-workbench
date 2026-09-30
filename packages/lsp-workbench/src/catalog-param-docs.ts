/**
 * Lê o markdown do catálogo e devolve a documentação de cada parâmetro,
 * incluindo enums aninhados (`1`: Número) e seções soltas (algoritmos, códigos de retorno).
 */

export type CatalogParamDoc = {
  name: string;
  documentation: string;
  tipo?: string;
};

type Section = { title: string; body: string };

function parseBoldSections(markdown: string): Section[] {
  const sections: Section[] = [];
  let current: { title: string; lines: string[] } | null = null;
  const flush = () => {
    if (!current) return;
    const body = current.lines.join("\n").trim();
    if (body) sections.push({ title: current.title, body });
    current = null;
  };
  for (const line of markdown.split("\n")) {
    const bold = line.trim().match(/^\*\*([^*]+)\*\*$/);
    if (bold) {
      flush();
      current = { title: bold[1].replace(/:$/, "").trim(), lines: [] };
      continue;
    }
    if (current) current.lines.push(line);
  }
  flush();
  return sections;
}

function canonicalTipo(raw: string): string {
  const t = raw.trim();
  if (/^n[uú]mero$/i.test(t)) return "Numero";
  if (/^alfanum[eé]rico$/i.test(t) || /^alfa$/i.test(t)) return "Alfa";
  if (/^data$/i.test(t)) return "Data";
  if (/^lista$/i.test(t)) return "Lista";
  return t;
}

function paramsFromSection(body: string): CatalogParamDoc[] {
  const params: CatalogParamDoc[] = [];
  let current: { name: string; tipo?: string; lines: string[] } | null = null;
  const flush = () => {
    if (!current) return;
    const documentation = current.lines.join("\n").trim();
    if (documentation || current.tipo) {
      params.push({
        name: current.name,
        documentation,
        tipo: current.tipo,
      });
    }
    current = null;
  };
  for (const line of body.split("\n")) {
    if (/^\s/.test(line)) {
      if (current && /^\s+- /.test(line)) current.lines.push(line.trim());
      continue;
    }
    const typed = line.match(/^- `([^`]+)`\s*\(([^)]+)\)\s*(?:—|--|-)\s*(.*)$/);
    const typedOnly = line.match(/^- `([^`]+)`\s*\(([^)]+)\)\s*$/);
    const colon = line.match(/^- `([^`]+)`:\s*(.*)$/);
    const hit = typed ?? typedOnly ?? colon;
    if (!hit) continue;
    flush();
    if (typed) {
      current = { name: typed[1] ?? "", tipo: canonicalTipo(typed[2] ?? ""), lines: typed[3] ? [typed[3]] : [] };
    } else if (typedOnly) {
      current = { name: typedOnly[1] ?? "", tipo: canonicalTipo(typedOnly[2] ?? ""), lines: [] };
    } else {
      current = { name: colon?.[1] ?? "", lines: colon?.[2] ? [colon[2]] : [] };
    }
  }
  flush();
  return params;
}

function appendParamDoc(param: CatalogParamDoc, extra: string): void {
  const block = extra.trim();
  if (!block) return;
  param.documentation = param.documentation.trim()
    ? `${param.documentation.trim()}\n\n${block}`
    : block;
}

function callInner(insertText: string): string {
  const line = insertText.split("\n")[0] ?? "";
  const m = line.match(/[A-Za-z_][\w]*\s*\(([^()]*)\)\s*;?\s*$/);
  return m?.[1] ?? line;
}

function splitSlots(inner: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let cur = "";
  for (const ch of inner) {
    if (ch === "{" || ch === "(") depth++;
    else if ((ch === "}" || ch === ")") && depth > 0) depth--;
    if (ch === "," && depth === 0) {
      parts.push(cur.trim());
      cur = "";
    } else {
      cur += ch;
    }
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
}

function slotName(slot: string): string {
  const named = slot.match(/\$\{\d+:([^}]+)\}/);
  if (named?.[1]) return named[1];
  const choice = slot.match(/\$\{\d+\|([^}]+)\|\}/);
  if (choice?.[1]) return choice[1].split(",")[0] ?? choice[1];
  if (/\$\{\d+\}/.test(slot)) return "";
  return slot.replace(/^["']|["']$/g, "").trim();
}

/** Nomes dos argumentos do snippet (só a chamada da primeira linha). */
export function snippetParamNames(insertText: string): string[] {
  return splitSlots(callInner(insertText))
    .map(slotName)
    .filter((name) => name.length > 0);
}

/** Rótulo da assinatura sem placeholders de snippet. */
export function signatureLabelFromSnippet(insertText: string): string {
  const line = (insertText.split("\n")[0] ?? "").trim();
  return line
    .replace(/\$\{\d+:([^}]+)\}/g, "$1")
    .replace(/\$\{\d+\|([^}]+)\|\}/g, (_all, raw: string) => raw.split(",").join("|"));
}

function alignParams(fromMd: CatalogParamDoc[], snippetNames: string[]): CatalogParamDoc[] {
  if (snippetNames.length === 0) return fromMd.map((p) => ({ ...p }));
  if (fromMd.length === snippetNames.length) return fromMd.map((p) => ({ ...p }));
  if (fromMd.length === 0) {
    return snippetNames.map((name) => ({ name, documentation: "" }));
  }

  const result: CatalogParamDoc[] = snippetNames.map((name) => ({ name, documentation: "" }));
  const used = new Set<number>();
  for (let i = 0; i < snippetNames.length; i++) {
    const idx = fromMd.findIndex(
      (p, j) => !used.has(j) && p.name.toLowerCase() === snippetNames[i]?.toLowerCase()
    );
    if (idx >= 0) {
      used.add(idx);
      result[i] = { ...fromMd[idx]! };
    }
  }
  let mdCursor = 0;
  for (let i = 0; i < result.length; i++) {
    if (result[i]?.documentation) continue;
    while (mdCursor < fromMd.length && used.has(mdCursor)) mdCursor++;
    if (mdCursor >= fromMd.length) break;
    used.add(mdCursor);
    result[i] = { ...fromMd[mdCursor]! };
    mdCursor++;
  }
  return result;
}

function hasCodeList(text: string): boolean {
  return /`\s*-?\d+\s*`|^\s*-?\d+\s*[=:]/m.test(text);
}

/** Parâmetros na ordem do snippet, com enums e seções soltas já grudados no argumento certo. */
export function orderedCatalogParams(
  markdown: string,
  snippetNames: string[],
  structured?: { name: string; tipo?: string; description?: string }[]
): CatalogParamDoc[] {
  const sections = parseBoldSections(markdown);
  const paramSection = sections.find((s) => /^parâmetros$/i.test(s.title));
  const fromMd = paramSection ? paramsFromSection(paramSection.body) : [];
  const ordered = alignParams(fromMd, snippetNames);

  const algo = sections.find((s) => /^algoritmos\b/i.test(s.title));
  if (algo) {
    const param = ordered.find((p) => /algoritmo/i.test(p.name));
    if (param) appendParamDoc(param, algo.body);
  }

  const codes = sections.find((s) =>
    /^(códigos de retorno|codigos de retorno|valores de retorno)$/i.test(s.title)
  );
  if (codes) {
    const param = ordered.find(
      (p) => /retorn/i.test(p.documentation) || /^(tipo|pdia|dia)$/i.test(p.name)
    );
    if (param) appendParamDoc(param, codes.body);
  }

  const obs = sections.find((s) => /^observa/i.test(s.title));
  if (obs && /tipo de dado/i.test(obs.body)) {
    const param = ordered.find((p) => /tipo/i.test(p.name));
    if (param) appendParamDoc(param, obs.body);
  }

  const retorno = sections.find((s) => /^(retorno|valor de retorno)$/i.test(s.title));
  if (retorno && ordered.length === 1 && !hasCodeList(ordered[0]?.documentation ?? "")) {
    appendParamDoc(ordered[0]!, `**Retorno**\n${retorno.body}`);
  }

  const dica = sections.find((s) => /^dica$/i.test(s.title));
  if (dica?.body) {
    const mentioned = ordered.filter((p) => {
      const name = p.name.replace(/^<|>$/g, "").trim();
      if (name.length < 3) return false;
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`\\b${escaped}\\b`, "i").test(dica.body);
    });
    if (mentioned.length === 1) appendParamDoc(mentioned[0]!, `**Dica**\n${dica.body}`);
  }

  applyStructured(ordered, structured, snippetNames);
  return ordered;
}

function applyStructured(
  ordered: CatalogParamDoc[],
  structured: { name: string; tipo?: string; description?: string }[] | undefined,
  snippetNames: string[]
): void {
  if (!structured?.length) return;
  const byIndex = structured.length === ordered.length || structured.length === snippetNames.length;
  ordered.forEach((param, index) => {
    const fromTable = byIndex
      ? structured[index]
      : structured.find((p) => p.name.toLowerCase() === param.name.toLowerCase());
    if (!fromTable) return;
    if (fromTable.name.trim()) {
      const slot = snippetNames[index]?.trim() ?? "";
      param.name = /^<.+>$/.test(slot) ? slot : fromTable.name.trim();
    }
    if (fromTable.tipo) param.tipo = canonicalTipo(fromTable.tipo);
    if (fromTable.description?.trim() && !param.documentation.trim()) {
      param.documentation = fromTable.description.trim();
    }
  });
  if (ordered.length === 0 && structured.length) {
    for (const p of structured) {
      ordered.push({
        name: p.name,
        tipo: p.tipo ? canonicalTipo(p.tipo) : undefined,
        documentation: p.description?.trim() ?? "",
      });
    }
  }
}

/**
 * Documentação por parâmetro do snippet.
 * A chave é o nome do markdown e, quando diferir, também o nome do placeholder.
 */
export function docsForSnippetParams(markdown: string, paramNames: string[]): Map<string, string> {
  const ordered = orderedCatalogParams(markdown, paramNames);
  const map = new Map<string, string>();
  ordered.forEach((param, index) => {
    if (!param.documentation.trim()) return;
    map.set(param.name.toLowerCase(), param.documentation);
    const snippetName = paramNames[index];
    if (snippetName) map.set(snippetName.toLowerCase(), param.documentation);
  });
  return map;
}

/** Texto do hover/assinatura de um argumento. */
export function formatParamHover(
  functionLabel: string,
  param: CatalogParamDoc,
  snippetSlot?: string
): string {
  const tipo = param.tipo ? ` (${param.tipo})` : "";
  const slot = snippetSlot?.trim() ?? "";
  const shown = /^<.+>$/.test(slot)
    ? slot
    : /^<.+>$/.test(param.name.trim())
      ? param.name.trim()
      : param.name.trim();
  const head = `**${functionLabel}** · \`${shown}\`${tipo}`;
  const body = paramBodyForHover(param.documentation);
  return body ? `${head}\n\n${body}` : head;
}

/** Lista logo após um parágrafo não aparece no hover do editor sem uma linha em branco. */
function paramBodyForHover(documentation: string): string {
  const lines = documentation.trim().split("\n");
  const out: string[] = [];
  for (const line of lines) {
    const prev = out[out.length - 1];
    if (/^-\s/.test(line) && prev && prev !== "" && !/^-\s/.test(prev)) out.push("");
    out.push(line);
  }
  return out.join("\n").trim();
}

/**
 * Documentação da assinatura sem repetir o bloco **Parâmetros**
 * (cada argumento aparece na ajuda do parâmetro ativo).
 */
export function signatureOverview(markdown: string): string {
  const lines = markdown.split("\n");
  const out: string[] = [];
  let skipping = false;
  for (const line of lines) {
    const bold = line.trim().match(/^\*\*([^*]+)\*\*$/);
    if (bold) {
      const title = bold[1].replace(/:$/, "").trim();
      if (/^parâmetros$/i.test(title)) {
        skipping = true;
        continue;
      }
      if (skipping) skipping = false;
    }
    if (!skipping) out.push(line);
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}
