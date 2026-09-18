/** Transformações puras usadas por Quick Fix (testáveis sem vscode). */
import { OUT_PARAM_FUNCS, RESERVED_WORDS } from "./rule-catalog";

export function applyRul007Fix(line: string): string {
  return line
    .replace(/\bRetorna\s*;/gi, "Cancel(1);")
    .replace(/\bRetorne\s*;/gi, "Cancel(1);");
}

export function applyRul014Fix(line: string): string {
  return line.replace(/\bBreak\b/gi, "Pare");
}

/** RUL002: vn = TamanhoAlfa(va); → TamanhoAlfa(va, vn); */
export function applyRul002Fix(line: string): string {
  for (const fn of OUT_PARAM_FUNCS) {
    const re = new RegExp(
      String.raw`^(\s*)(\w+)\s*=\s*${fn}\s*\(\s*([^)]*)\s*\)\s*;`,
      "i"
    );
    const m = line.match(re);
    if (!m) continue;
    const indent = m[1];
    const dest = m[2].trim();
    const args = m[3].trim();
    // já tem o destino como último arg?
    if (new RegExp(String.raw`\b${dest}\s*$`, "i").test(args)) return line;
    const newArgs = args.length ? `${args}, ${dest}` : dest;
    return `${indent}${fn}(${newArgs});`;
  }
  return line;
}

/** RUL003: Se (EstaNulo(a, b) = 0) { → EstaNulo(a, b);\nSe (b = 0) { */
export function applyRul003Fix(line: string): string {
  const m = line.match(
    /^(\s*)Se\s*\(\s*EstaNulo\s*\(\s*([^,]+)\s*,\s*([^)]+)\s*\)\s*=\s*0\s*\)(\s*\{?)/i
  );
  if (!m) return line;
  const indent = m[1];
  const a = m[2].trim();
  const b = m[3].trim();
  const brace = m[4] || "";
  return `${indent}EstaNulo(${a}, ${b});\n${indent}Se (${b} = 0)${brace}`;
}

/**
 * RUL004: FormatarData(vdX, ...) → DataHora(vnDataHora); FormatarData(vnDataHora, ...)
 * (FormatarData só aceita Numero.)
 */
export function applyRul004Fix(line: string): string {
  const m = line.match(/^(\s*)FormatarData\s*\(\s*(vd\w*)\s*,/i);
  if (!m) return line;
  const indent = m[1];
  const rest = line.replace(/^(\s*)FormatarData\s*\(\s*vd\w*\s*,/i, `$1FormatarData(vnDataHora,`);
  return `${indent}DataHora(vnDataHora);\n${rest}`;
}

/** RUL005: Func(Obj.Campo, ...) → vnCampo = Obj.Campo; Func(vnCampo, ...) */
export function applyRul005Fix(line: string): string {
  const m = line.match(
    /^(\s*)(IntParaAlfa|AlfaParaInt|AlfaParaDecimal|DecimalParaAlfa|TamanhoAlfa|FormatarData|Mensagem|SubstAlfa|CopiarAlfa)\s*\(\s*([A-Za-z_]\w*(?:\.[A-Za-z_]\w+)+)\s*(,|\))/i
  );
  if (!m) return line;
  const indent = m[1];
  const fn = m[2];
  const field = m[3];
  const mid = `vnCampo`;
  const replaced = line.replace(field, mid);
  return `${indent}${mid} = ${field};\n${replaced}`;
}

/** RUL006: Func(..., a + b) → vaMsg = a + b; Func(..., vaMsg) — foco Mensagem */
export function applyRul006Fix(line: string): string {
  const m = line.match(/^(\s*)Mensagem\s*\(\s*([^,]+)\s*,\s*(.+)\s*\)\s*;/i);
  if (!m || !/\+/.test(m[3])) return line;
  const indent = m[1];
  const tipo = m[2].trim();
  const expr = m[3].trim();
  return `${indent}vaMsg = ${expr};\n${indent}Mensagem(${tipo}, vaMsg);`;
}

/** Remove params tipados ilegais (Alfa|Data|Lista|Cursor) da assinatura. */
export function applyRul001RemoveIllegalTyped(line: string): string {
  return line.replace(
    /\b((?:Definir\s+)?Funcao\s+\w+\s*\()([^)]*)(\))/i,
    (_all, open: string, inner: string, close: string) => {
      const kept = inner
        .split(",")
        .map((p) => p.trim())
        .filter((p) => p && !/^(Alfa|Data|Lista|Cursor)\s+/i.test(p));
      return `${open}${kept.join(", ")}${close}`;
    }
  );
}

/**
 * RUL001 QF unificado:
 * - Alfa/Data/Lista/Cursor tipados → remove o param (usar variável global + Definir).
 * - Param só com nome → acrescenta `Numero` (único tipo permitido na assinatura).
 */
export function applyRul001Fix(line: string): string {
  if (/\b(?:Definir\s+)?Funcao\s+\w+\s*\([^)]*\b(Alfa|Data|Lista|Cursor)\b/i.test(line)) {
    return applyRul001RemoveIllegalTyped(line);
  }
  if (hasUntypedFuncParam(line)) {
    return applyRul001AddNumeroFix(line);
  }
  return line;
}

/**
 * RUL001 (param sem tipo): Foo(vaP) → Foo(Numero vnP) (só Numero é permitido na assinatura).
 * Não gera `Definir Alfa` + param solto.
 */
export function applyRul001AddNumeroFix(line: string): string {
  return line.replace(
    /\b((?:Definir\s+)?Funcao\s+\w+\s*\()([^)]*)(\))/i,
    (_all, open: string, inner: string, close: string) => {
      const parts = inner.split(",").map((part) => {
        const raw = part;
        const t = part.trim();
        if (!t) return raw;
        if (/^(Numero|Alfa|Data|Lista|Cursor)\b/i.test(t)) return raw;
        if (/^End\s+/i.test(t)) return raw;
        const lead = raw.match(/^\s*/)?.[0] ?? "";
        const name = t.replace(/^End\s+/i, "").trim();
        const numeroName = suggestNumeroParamName(name);
        return `${lead}Numero ${numeroName}`;
      });
      return `${open}${parts.join(",")}${close}`;
    }
  );
}

/** vaNome → vnNome (param Numero na assinatura). */
export function suggestNumeroParamName(name: string): string {
  if (/^vn/i.test(name) || /^p[a-z]/i.test(name)) return name;
  if (/^(va|vd|vl)/i.test(name)) return `vn${name.slice(2)}`;
  if (/^Cur_/i.test(name)) return `vn${name.slice(4)}`;
  return /^vn/i.test(name) ? name : name.match(/^[A-Za-z_]/) ? `vn${name}` : name;
}

/** Extrai param tipado ilegal em Funcao (para Definir global). */
export function findRul001Param(
  line: string
): { tipo: string; name: string } | null {
  const m =
    /\b(?:Definir\s+)?Funcao\s+\w+\s*\(\s*(?:[^)]*,\s*)*(Alfa|Data|Lista|Cursor)\s+(\w+)/i.exec(
      line
    );
  if (!m) return null;
  return { tipo: m[1], name: m[2] };
}

/** True se a assinatura tem parâmetro sem tipo (só o nome). */
export function hasUntypedFuncParam(line: string): boolean {
  const m = /\b(?:Definir\s+)?Funcao\s+\w+\s*\(([^)]*)\)/i.exec(line);
  if (!m) return false;
  for (const part of m[1].split(",")) {
    const t = part.trim();
    if (!t) continue;
    if (/^(Numero|Alfa|Data|Lista|Cursor)\s+/i.test(t)) continue;
    if (/^End\s+(Numero\s+)?\w+$/i.test(t)) continue;
    if (/^\w+$/.test(t)) return true;
  }
  return false;
}

/** Ranges dos parâmetros sem tipo (para grifo). */
export function findUntypedFuncParams(
  line: string
): { name: string; start: number; end: number }[] {
  const m = /\b(?:Definir\s+)?Funcao\s+\w+\s*\(([^)]*)\)/i.exec(line);
  if (!m || m.index === undefined) return [];
  const inner = m[1];
  const listStart = m.index + m[0].lastIndexOf("(") + 1;
  const out: { name: string; start: number; end: number }[] = [];
  let cursor = 0;
  for (const part of inner.split(",")) {
    const idxInInner = inner.indexOf(part, cursor);
    const t = part.trim();
    cursor = idxInInner + part.length;
    if (!t || /^(Numero|Alfa|Data|Lista|Cursor)\s+/i.test(t)) continue;
    if (/^End\s+/i.test(t)) continue;
    if (!/^\w+$/.test(t)) continue;
    const nameOffset = part.indexOf(t);
    const start = listStart + idxInInner + nameOffset;
    out.push({ name: t, start, end: start + t.length });
  }
  return out;
}

/** Nomes de parâmetros em assinaturas Definir Funcao / Funcao (para não alertar SEM001). */
export function collectFuncParamNames(source: string): Set<string> {
  const names = new Set<string>();
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  for (const line of lines) {
    const m = /\b(?:Definir\s+)?Funcao\s+\w+\s*\(([^)]*)\)/i.exec(line);
    if (!m) continue;
    for (const part of m[1].split(",")) {
      const t = part.trim();
      if (!t) continue;
      const named = t.match(
        /^(?:(?:Numero|Alfa|Data|Lista|Cursor)\s+)?(?:End\s+)?(\w+)$/i
      );
      if (named) names.add(named[1].toLowerCase());
      else if (/^\w+$/.test(t)) names.add(t.toLowerCase());
    }
  }
  return names;
}

/** RUL009: Se (vn = 1) após ExecSQLEx → Se (vn = 0) */
export function applyRul009Fix(line: string): string {
  return line.replace(/(\bSe\s*\(\s*\w+\s*=\s*)1(\s*\))/i, "$10$2");
}

/**
 * RUL015: vd = 15/08/1990;
 * Preferido: vd = CodData(15, 8, 1990);  (CodData retorna valor)
 * Alternativa: MontaData(15, 8, 1990, vd); (4º param = destino)
 */
export function applyRul015Fix(line: string): string {
  const m = line.match(/^(\s*)(vd\w*)\s*=\s*(\d{1,2})\/(\d{1,2})\/(\d{2,4})\s*;/i);
  if (!m) return line;
  const dia = String(Number(m[3]));
  const mes = String(Number(m[4]));
  const ano = m[5];
  return `${m[1]}${m[2]} = CodData(${dia}, ${mes}, ${ano});`;
}

export function applyRul015MontaDataFix(line: string): string {
  const m = line.match(/^(\s*)(vd\w*)\s*=\s*(\d{1,2})\/(\d{1,2})\/(\d{2,4})\s*;/i);
  if (!m) return line;
  const dia = String(Number(m[3]));
  const mes = String(Number(m[4]));
  const ano = m[5];
  return `${m[1]}MontaData(${dia}, ${mes}, ${ano}, ${m[2]});`;
}

/** Códigos válidos de Cancel (docs/lsp/cancel.md). */
export const CANCEL_VALID_CODES = new Set(["1", "2", "3"]);

/**
 * RUL019: localiza `Cancel` inválido (sem args, arg ≠ 1|2|3, ou sem parênteses).
 * Retorna range do token Cancel(…) / Cancel;
 */
export function findRul019CancelRange(
  line: string
): { start: number; end: number; arg: string | null } | null {
  // Não confundir com `Definir Numero Cancel;` (RUL016)
  if (/^\s*Definir\b/i.test(line)) return null;

  const bare = /(^|[^.\w])Cancel\s*;/i.exec(line);
  if (bare && bare.index !== undefined) {
    const start = bare[0].startsWith("Cancel") ? bare.index : bare.index + bare[1].length;
    const text = line.slice(start).match(/^Cancel\s*;/i)?.[0];
    if (text) return { start, end: start + text.length, arg: null };
  }
  const call = /(^|[^.\w])Cancel\s*\(([^)]*)\)\s*;?/i.exec(line);
  if (!call || call.index === undefined) return null;
  const arg = (call[2] ?? "").trim();
  if (CANCEL_VALID_CODES.has(arg)) return null;
  const start = call[0].startsWith("Cancel") ? call.index : call.index + call[1].length;
  const matched = line.slice(start).match(/^Cancel\s*\([^)]*\)\s*;?/i)?.[0];
  if (!matched) return null;
  return { start, end: start + matched.length, arg: arg || null };
}

/** RUL019: troca Cancel inválido por Cancel(code); (default 1). */
export function applyRul019Fix(line: string, code: "1" | "2" | "3" = "1"): string {
  if (/\bCancel\s*;/i.test(line) && !/\bCancel\s*\(/i.test(line)) {
    return line.replace(/\bCancel\s*;/i, `Cancel(${code});`);
  }
  return line.replace(/\bCancel\s*\([^)]*\)\s*;?/i, `Cancel(${code});`);
}

/** IDs que podem ser silenciados sem alterar o fonte (heurísticas / avisos). */
export const SUPPRESSIBLE_RULE_IDS = new Set([
  "RUL009",
  "RUL010",
  "SYN009",
  "SQL001",
  "FUN009",
]);

/** IDs que NUNCA devem oferecer ignore (regras duras). */
export const NEVER_SUPPRESS_RULE_IDS = new Set([
  "RUL001",
  "RUL007",
  "RUL014",
  "RUL016",
  "RUL017",
  "RUL018",
  "RUL019",
  "SYN001",
  "SYN007",
  "SYN008",
  "SYN010",
]);

export function isSuppressible(ruleId: string): boolean {
  const id = ruleId.toUpperCase();
  if (NEVER_SUPPRESS_RULE_IDS.has(id)) return false;
  return SUPPRESSIBLE_RULE_IDS.has(id);
}

/** RUL011: vnX = a % b; → RestoDivisao(a, b, vnX); */
export function applyRul011Fix(line: string): string {
  const m = line.match(/^(\s*)(\w+)\s*=\s*(\w+)\s*%\s*(\w+)\s*;/);
  if (!m) return line;
  return `${m[1]}RestoDivisao(${m[3]}, ${m[4]}, ${m[2]});`;
}

/** RUL012: va = Chr(n); → CaracterParaAlfa(n, va); */
export function applyRul012Fix(line: string): string {
  const assign = line.match(/^(\s*)(\w+)\s*=\s*Chr\s*\(\s*([^)]+)\s*\)\s*;/i);
  if (assign) {
    return `${assign[1]}CaracterParaAlfa(${assign[3].trim()}, ${assign[2]});`;
  }
  return line.replace(/\bChr\s*\(/gi, "CaracterParaAlfa(");
}

/**
 * RUL013: "a\nb" → CaracterParaAlfa(13, vaEnter); + concat
 * Caso simples: lhs = "…\n…";
 */
export function applyRul013Fix(line: string): string {
  const m = line.match(/^(\s*)(\w+)\s*=\s*"([^"]*)\\n([^"]*)"\s*;/);
  if (!m) return line;
  const indent = m[1];
  const dest = m[2];
  const before = m[3];
  const after = m[4];
  return `${indent}CaracterParaAlfa(13, vaEnter);\n${indent}${dest} = "${before}" + vaEnter + "${after}";`;
}

/**
 * RUL016: Definir Numero Cancel; → Definir Numero vnCancel;
 * Prefixo conforme o tipo (va/vn/vd/vl/Cur_).
 */
export function applyRul016Fix(line: string): string {
  const m = line.match(/^(\s*)Definir\s+(Alfa|Numero|Data|Lista|Cursor)\s+(\w+)(.*)$/i);
  if (!m) return line;
  const tipo = m[2];
  const nome = m[3];
  if (!RESERVED_WORDS.has(nome.toLowerCase())) return line;
  const prefix =
    /^alfa$/i.test(tipo)
      ? "va"
      : /^numero$/i.test(tipo)
        ? "vn"
        : /^data$/i.test(tipo)
          ? "vd"
          : /^lista$/i.test(tipo)
            ? "vl"
            : "Cur_";
  const rest = nome.charAt(0).toUpperCase() + nome.slice(1);
  const newName = prefix === "Cur_" ? `Cur_${nome}` : `${prefix}${rest}`;
  if (newName.toLowerCase() === nome.toLowerCase()) return line;
  return `${m[1]}Definir ${tipo} ${newName}${m[4]}`;
}

/**
 * SEM002: `vnArq = Abrir(...);` → handle + indent
 */
export function findSem002FileOpen(line: string): { handle: string; indent: string } | null {
  const m = line.match(/^(\s*)(\w+)\s*=\s*Abrir\s*\(/i);
  if (!m) return null;
  return { indent: m[1], handle: m[2] };
}

/**
 * SEM004: uso `vlItens.Codigo` (+ inferência de tipo pelo RHS da atribuição).
 */
export function findSem004Usage(
  line: string,
  startCol?: number,
  endCol?: number
): { list: string; field: string; tipo: "numero" | "alfa" | "data" } | null {
  let span =
    startCol !== undefined && endCol !== undefined
      ? line.slice(startCol, endCol)
      : "";
  let m = span.match(/^(\w+)\.(\w+)$/);
  if (!m) {
    m = line.match(/\b(\w+)\.(\w+)\b/);
  }
  if (!m) return null;
  const list = m[1];
  const field = m[2];
  const assign = line.match(
    new RegExp(String.raw`\b${list}\.${field}\s*=\s*(.+?)\s*;?\s*$`, "i")
  );
  const rhs = (assign?.[1] ?? "").trim();
  let tipo: "numero" | "alfa" | "data" = "numero";
  if (/^"/.test(rhs) || /^'/.test(rhs)) tipo = "alfa";
  else if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(rhs) || /^vd/i.test(rhs)) tipo = "data";
  else if (/^va/i.test(rhs)) tipo = "alfa";
  else if (/^vd/i.test(rhs)) tipo = "data";
  return { list, field, tipo };
}

/**
 * SQL001: `"… = " + vnId` → `"… = :vnId"` (placeholders em vez de concat).
 */
export function applySql001Fix(line: string): string {
  let s = line;
  for (let n = 0; n < 8; n++) {
    const next = s
      .replace(/"([^"]*)"\s*\+\s*((?:va|vn|vd)\w*)/gi, (_m, str, v) => `"${str}:${v}"`)
      .replace(/((?:va|vn|vd)\w*)\s*\+\s*"([^"]*)"/gi, (_m, v, str) => `":${v}${str}"`)
      .replace(/"([^"]*)"\s*\+\s*"([^"]*)"/g, `"$1$2"`);
    if (next === s) break;
    s = next;
  }
  return s;
}

/** SQL002: `SQL_Criar(vnH);` → handle */
export function findSql002Criar(line: string): { handle: string; indent: string } | null {
  const m = line.match(/^(\s*)SQL_Criar\s*\(\s*(\w+)\s*\)\s*;/i);
  if (!m) return null;
  return { indent: m[1], handle: m[2] };
}

/**
 * Linha (0-based) após a qual inserir SQL_Destruir:
 * preferir após SQL_FecharCursor(handle); senão após último SQL_*(handle) desde o Criar.
 */
export function findSql002DestruirAfterLine(
  source: string,
  handle: string,
  criarLine: number
): number {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  let lastUse = criarLine;
  let fecharLine = -1;
  const reCriar = new RegExp(String.raw`\bSQL_Criar\s*\(\s*${handle}\s*\)`, "i");
  const reFechar = new RegExp(String.raw`\bSQL_FecharCursor\s*\(\s*${handle}\s*\)`, "i");
  const reDestruir = new RegExp(String.raw`\bSQL_Destruir\s*\(\s*${handle}\s*\)`, "i");
  const reSql = new RegExp(String.raw`\bSQL_\w+\s*\(\s*${handle}\b`, "i");
  for (let i = criarLine + 1; i < lines.length; i++) {
    const raw = lines[i];
    if (reDestruir.test(raw)) return -1;
    if (reCriar.test(raw)) break;
    if (reFechar.test(raw)) fecharLine = i;
    if (reSql.test(raw)) lastUse = i;
  }
  return fecharLine >= 0 ? fecharLine : lastUse;
}

export function sql002DestruirInsert(line: string): string {
  const info = findSql002Criar(line);
  if (!info) return "";
  return `${info.indent}SQL_Destruir(${info.handle});\n`;
}

/** SQL003: `SQL_AbrirCursor(vnH);` → handle */
export function findSql003Abrir(line: string): { handle: string; indent: string } | null {
  const m = line.match(/^(\s*)SQL_AbrirCursor\s*\(\s*(\w+)\s*\)\s*;/i);
  if (!m) return null;
  return { indent: m[1], handle: m[2] };
}

/**
 * Linha após a qual inserir SQL_FecharCursor:
 * após último SQL_*(handle) desde o Abrir, mas antes de SQL_Destruir se já existir.
 * Retorna { afterLine } ou { beforeLine } se Destruir já está no arquivo.
 */
export function findSql003FecharInsertPos(
  source: string,
  handle: string,
  abrirLine: number
): { afterLine: number } | { beforeLine: number } | null {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  let lastUse = abrirLine;
  const reCriar = new RegExp(String.raw`\bSQL_Criar\s*\(\s*${handle}\s*\)`, "i");
  const reFechar = new RegExp(String.raw`\bSQL_FecharCursor\s*\(\s*${handle}\s*\)`, "i");
  const reDestruir = new RegExp(String.raw`\bSQL_Destruir\s*\(\s*${handle}\s*\)`, "i");
  const reSql = new RegExp(String.raw`\bSQL_\w+\s*\(\s*${handle}\b`, "i");
  for (let i = abrirLine + 1; i < lines.length; i++) {
    const raw = lines[i];
    if (reFechar.test(raw)) return null;
    if (reDestruir.test(raw)) return { beforeLine: i };
    if (reCriar.test(raw)) break;
    if (reSql.test(raw)) lastUse = i;
  }
  return { afterLine: lastUse };
}

export function sql003FecharInsert(line: string): string {
  const info = findSql003Abrir(line);
  if (!info) return "";
  return `${info.indent}SQL_FecharCursor(${info.handle});\n`;
}

/**
 * Nome com prefixo alinhado ao tipo (SYN006/RUL008).
 * Retorna null se já está ok.
 */
export function suggestedPrefixedName(tipo: string, name: string): string | null {
  const t = tipo.toLowerCase();
  const ok =
    (t === "alfa" && /^va/i.test(name)) ||
    (t === "numero" && /^vn/i.test(name)) ||
    (t === "data" && /^vd/i.test(name)) ||
    (t === "lista" && /^(vl|a)/i.test(name)) ||
    (t === "cursor" && /^cur_/i.test(name));
  if (ok) return null;

  let stem = name;
  if (/^(va|vn|vd|vl)/i.test(name)) stem = name.slice(2);
  else if (/^cur_/i.test(name)) stem = name.slice(4);

  if (!stem) stem = "X";
  if (t === "alfa") return "va" + stem;
  if (t === "numero") return "vn" + stem;
  if (t === "data") return "vd" + stem;
  if (t === "lista") return "vl" + stem;
  if (t === "cursor") return `Cur_${stem}`;
  return null;
}

/** Substitui identificador com word-boundary em todo o fonte. */
export function renameIdentifierInSource(source: string, from: string, to: string): string {
  if (from === to) return source;
  const re = new RegExp(String.raw`\b${from}\b`, "g");
  return source.replace(re, to);
}

export function isDefinirCursorHandle(source: string, handle: string): boolean {
  return new RegExp(String.raw`^\s*Definir\s+Cursor\s+${handle}\b`, "im").test(source);
}

export function hadSqlCriar(source: string, handle: string): boolean {
  return new RegExp(String.raw`\bSQL_Criar\s*\(\s*${handle}\s*\)`, "i").test(source);
}

/**
 * SQL004: Definir Alfa + prefixo va* + rename atômico no fonte inteiro.
 */
export function applySql004SourceFix(source: string, handle: string): string | null {
  const defRe = new RegExp(
    String.raw`^(\s*)Definir\s+(Alfa|Numero|Data|Lista|Cursor)\s+(${handle})\b`,
    "im"
  );
  const defM = source.match(defRe);
  if (defM && !/^alfa$/i.test(defM[2])) {
    const oldName = defM[3];
    const newName = suggestedPrefixedName("alfa", oldName) ?? oldName;
    let next = source.replace(defRe, `${defM[1]}Definir Alfa ${newName}`);
    if (newName !== oldName) next = renameIdentifierInSource(next, oldName, newName);
    return next;
  }
  if (defM && /^alfa$/i.test(defM[2])) {
    const oldName = defM[3];
    const newName = suggestedPrefixedName("alfa", oldName);
    if (!newName || newName === oldName) return null;
    return renameIdentifierInSource(source, oldName, newName);
  }
  if (!defM) {
    const newName = suggestedPrefixedName("alfa", handle) ?? handle;
    let next = newName !== handle ? renameIdentifierInSource(source, handle, newName) : source;
    const lines = next.replace(/\r\n/g, "\n").split("\n");
    let lastDef = -1;
    for (let i = 0; i < lines.length; i++) {
      if (/^\s*Definir\s+/i.test(lines[i])) lastDef = i;
    }
    lines.splice(lastDef >= 0 ? lastDef + 1 : 0, 0, `Definir Alfa ${newName};`);
    return lines.join("\n");
  }
  return null;
}

/** SYN006/RUL008: renomeia identificador no documento inteiro. */
export function applyPrefixRenameSourceFix(
  source: string,
  tipo: string,
  oldName: string
): string | null {
  const newName = suggestedPrefixedName(tipo, oldName);
  if (!newName || newName === oldName) return null;
  return renameIdentifierInSource(source, oldName, newName);
}

/** SQL006: move linha SQL_Usar* para imediatamente antes do SQL_DefinirComando. */
export function applySql006MoveUsarBeforeComando(source: string, usarLine: number): string | null {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  if (usarLine < 0 || usarLine >= lines.length) return null;
  const usarM = lines[usarLine].match(
    /^(\s*)SQL_Usar(SQLSenior2|Abrangencia)\s*\(\s*(\w+)\s*,\s*\d+\s*\)\s*;/i
  );
  if (!usarM) return null;
  const handle = usarM[3];
  let cmdLine = -1;
  const reCmd = new RegExp(String.raw`\bSQL_DefinirComando\s*\(\s*${handle}\s*,`, "i");
  for (let i = 0; i < usarLine; i++) {
    if (reCmd.test(lines[i])) cmdLine = i;
  }
  if (cmdLine < 0) return null;
  const [usarLineText] = lines.splice(usarLine, 1);
  lines.splice(cmdLine, 0, usarLineText);
  return lines.join("\n");
}

/** Loop padrão após SQL_AbrirCursor (cursor completo). */
export function sqlEnquantoLoopInsert(handle: string, indent = ""): string {
  return (
    `${indent}Enquanto (SQL_EOF(${handle}) = 0) {\n` +
    `${indent}  SQL_Proximo(${handle});\n` +
    `${indent}}\n`
  );
}

/** SQL009: converte API simples ↔ completa na linha. */
export function applySql009LineFix(line: string, source: string): string | null {
  const sqlAbrir = line.match(/^(\s*)SQL_AbrirCursor\s*\(\s*(\w+)\s*\)\s*;/i);
  if (sqlAbrir && isDefinirCursorHandle(source, sqlAbrir[2])) {
    return `${sqlAbrir[1]}${sqlAbrir[2]}.AbrirCursor();`;
  }
  const sqlFechar = line.match(/^(\s*)SQL_FecharCursor\s*\(\s*(\w+)\s*\)\s*;/i);
  if (sqlFechar && isDefinirCursorHandle(source, sqlFechar[2])) {
    return `${sqlFechar[1]}${sqlFechar[2]}.FecharCursor();`;
  }
  const sqlProx = line.match(/^(\s*)SQL_Proximo\s*\(\s*(\w+)\s*\)\s*;/i);
  if (sqlProx && isDefinirCursorHandle(source, sqlProx[2])) {
    return `${sqlProx[1]}${sqlProx[2]}.Proximo();`;
  }
  const sqlDef = line.match(/^(\s*)SQL_DefinirComando\s*\(\s*(\w+)\s*,\s*(.+?)\s*\)\s*;?\s*$/i);
  if (sqlDef && isDefinirCursorHandle(source, sqlDef[2])) {
    return `${sqlDef[1]}${sqlDef[2]}.SQL ${sqlDef[3].trim()};`;
  }
  const sqlDest = line.match(/^(\s*)SQL_Destruir\s*\(\s*(\w+)\s*\)\s*;/i);
  if (sqlDest && isDefinirCursorHandle(source, sqlDest[2])) {
    return "";
  }
  const sqlCriar = line.match(/^(\s*)SQL_Criar\s*\(\s*(\w+)\s*\)\s*;/i);
  if (sqlCriar && isDefinirCursorHandle(source, sqlCriar[2])) {
    return "";
  }

  const mAbrir = line.match(/^(\s*)(\w+)\.AbrirCursor\s*\(\s*\)\s*;/i);
  if (mAbrir && hadSqlCriar(source, mAbrir[2])) {
    return `${mAbrir[1]}SQL_AbrirCursor(${mAbrir[2]});`;
  }
  const mFechar = line.match(/^(\s*)(\w+)\.FecharCursor\s*\(\s*\)\s*;/i);
  if (mFechar && hadSqlCriar(source, mFechar[2])) {
    return `${mFechar[1]}SQL_FecharCursor(${mFechar[2]});`;
  }
  const mProx = line.match(/^(\s*)(\w+)\.Proximo\s*\(\s*\)\s*;/i);
  if (mProx && hadSqlCriar(source, mProx[2])) {
    return `${mProx[1]}SQL_Proximo(${mProx[2]});`;
  }
  return null;
}

/**
 * SQL009 preferido: esqueleto comentado do modo certo (evita cascade SEM003/SQL002–005).
 * Substitui só a linha incompatível.
 */
export function applySql009ScaffoldFix(line: string, source: string): string | null {
  const sqlAbrir = line.match(/^(\s*)SQL_AbrirCursor\s*\(\s*(\w+)\s*\)\s*;/i);
  if (sqlAbrir && isDefinirCursorHandle(source, sqlAbrir[2])) {
    const ind = sqlAbrir[1];
    const c = sqlAbrir[2];
    return (
      `${ind}@ Cursor SIMPLES (${c}): .SQL → .AbrirCursor → Enquanto(.Achou) → .Proximo → .FecharCursor — sem SQL_* @\n` +
      `${ind}${c}.SQL "SELECT 1 FROM DUAL";\n` +
      `${ind}${c}.AbrirCursor();\n` +
      `${ind}Enquanto (${c}.Achou) {\n` +
      `${ind}  ${c}.Proximo();\n` +
      `${ind}}\n` +
      `${ind}${c}.FecharCursor();`
    );
  }

  const mAbrir = line.match(/^(\s*)(\w+)\.AbrirCursor\s*\(\s*\)\s*;/i);
  if (mAbrir && hadSqlCriar(source, mAbrir[2])) {
    const ind = mAbrir[1];
    const h = mAbrir[2];
    const hasCmd = new RegExp(
      String.raw`\bSQL_DefinirComando\s*\(\s*${h}\s*,`,
      "i"
    ).test(source);
    const hasFechar = new RegExp(
      String.raw`\bSQL_FecharCursor\s*\(\s*${h}\s*\)`,
      "i"
    ).test(source);
    const hasDestruir = new RegExp(String.raw`\bSQL_Destruir\s*\(\s*${h}\s*\)`, "i").test(
      source
    );
    const parts: string[] = [
      `${ind}@ Cursor COMPLETO (${h}): [Usar*] → DefinirComando → Abrir → EOF/Proximo → Fechar → Destruir — sem .AbrirCursor @`,
    ];
    if (!hasCmd) {
      parts.push(`${ind}SQL_DefinirComando(${h}, vaSql);`);
    }
    parts.push(`${ind}SQL_AbrirCursor(${h});`);
    parts.push(`${ind}Enquanto (SQL_EOF(${h}) = 0) {`);
    parts.push(`${ind}  SQL_Proximo(${h});`);
    parts.push(`${ind}}`);
    if (!hasFechar) {
      parts.push(`${ind}SQL_FecharCursor(${h});`);
    }
    if (!hasDestruir) {
      parts.push(`${ind}SQL_Destruir(${h});`);
    }
    return parts.join("\n");
  }

  return null;
}

/** SQL004/SQL005/SQL007: handle em SQL_*(handle…); */
export function findSqlHandleCall(
  line: string,
  fn: "SQL_Criar" | "SQL_AbrirCursor" | "SQL_DefinirComando"
): { handle: string; indent: string } | null {
  const re =
    fn === "SQL_DefinirComando"
      ? /^(\s*)SQL_DefinirComando\s*\(\s*(\w+)\s*,/i
      : new RegExp(String.raw`^(\s*)${fn}\s*\(\s*(\w+)\s*\)\s*;`, "i");
  const m = line.match(re);
  if (!m) return null;
  return { indent: m[1], handle: m[2] };
}

/** SQL005: inserir DefinirComando antes do AbrirCursor (mesma indentação). */
export function sql005DefinirComandoInsert(line: string): string {
  const info = findSqlHandleCall(line, "SQL_AbrirCursor");
  if (!info) return "";
  return `${info.indent}SQL_DefinirComando(${info.handle}, vaSql);\n`;
}

/** SQL007: inserir SQL_Criar antes do DefinirComando. */
export function sql007CriarInsert(line: string): string {
  const info = findSqlHandleCall(line, "SQL_DefinirComando");
  if (!info) return "";
  return `${info.indent}SQL_Criar(${info.handle});\n`;
}

/**
 * SQL008: inserir UsarAbrangencia(0) / UsarSQLSenior2(0) faltantes antes do DefinirComando.
 * `missing` indica o que ainda falta (ambos por padrão).
 */
export function sql008NativeInsert(
  line: string,
  missing: { abrangencia0?: boolean; senior2Off?: boolean } = {
    abrangencia0: true,
    senior2Off: true,
  }
): string {
  const info = findSqlHandleCall(line, "SQL_DefinirComando");
  if (!info) return "";
  const parts: string[] = [];
  if (missing.abrangencia0 !== false) {
    parts.push(`${info.indent}SQL_UsarAbrangencia(${info.handle}, 0);`);
  }
  if (missing.senior2Off !== false) {
    parts.push(`${info.indent}SQL_UsarSQLSenior2(${info.handle}, 0);`);
  }
  return parts.length ? parts.join("\n") + "\n" : "";
}

/** Escaneia fonte: o que falta de nativo para o handle antes da linha do DefinirComando. */
export function sql008MissingFlags(
  source: string,
  handle: string,
  definirComandoLine: number
): { abrangencia0: boolean; senior2Off: boolean } {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  let abr = false;
  let sen = false;
  for (let i = 0; i < definirComandoLine && i < lines.length; i++) {
    const raw = lines[i];
    if (new RegExp(String.raw`\bSQL_Criar\s*\(\s*${handle}\s*\)`, "i").test(raw)) {
      abr = false;
      sen = false;
    }
    if (new RegExp(String.raw`\bSQL_UsarAbrangencia\s*\(\s*${handle}\s*,\s*0\s*\)`, "i").test(raw)) {
      abr = true;
    }
    if (new RegExp(String.raw`\bSQL_UsarSQLSenior2\s*\(\s*${handle}\s*,\s*0\s*\)`, "i").test(raw)) {
      sen = true;
    }
  }
  return { abrangencia0: !abr, senior2Off: !sen };
}

/** Texto `vl.AdicionarCampo("Campo", tipo);` */
export function sem004AdicionarCampoLine(
  list: string,
  field: string,
  tipo: "numero" | "alfa" | "data",
  indent = ""
): string {
  return `${indent}${list}.AdicionarCampo("${field}", ${tipo});\n`;
}

/**
 * Linha (0-based) após a qual inserir AdicionarCampo:
 * último AdicionarCampo / DefinirCampos da lista antes do uso; senão antes de EfetivarCampos; senão antes do uso.
 */
export function findSem004InsertAfterLine(
  source: string,
  listName: string,
  usageLine: number
): number {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const lim = Math.min(lines.length, usageLine);
  let after = -1;
  const addRe = new RegExp(String.raw`^\s*${listName}\.AdicionarCampo\s*\(`, "i");
  const defRe = new RegExp(String.raw`^\s*${listName}\.DefinirCampos\s*\(`, "i");
  const eftRe = new RegExp(String.raw`^\s*${listName}\.EfetivarCampos\s*\(`, "i");
  for (let i = 0; i < lim; i++) {
    if (addRe.test(lines[i]) || defRe.test(lines[i])) after = i;
  }
  if (after >= 0) return after;
  for (let i = 0; i < lim; i++) {
    if (eftRe.test(lines[i])) return Math.max(0, i - 1);
  }
  return Math.max(0, usageLine - 1);
}

/** Linha a inserir após Abrir: `Fechar(vnArq);` */
export function sem002FecharInsert(line: string): string {
  const info = findSem002FileOpen(line);
  if (!info) return "";
  return `${info.indent}Fechar(${info.handle});\n`;
}

/**
 * Completa uso típico de arquivo: Abrir + bloco + Fechar
 * (substitui a linha do Abrir).
 */
export function applySem002CompleteFix(line: string): string {
  const info = findSem002FileOpen(line);
  if (!info) return line;
  const { indent, handle } = info;
  const openCall = line.trim();
  return (
    `${indent}${openCall}\n` +
    `${indent}\n` +
    `${indent}Fechar(${handle});`
  );
}

/**
 * SEM003: nome do cursor em `Cur.AbrirCursor();`
 */
export function findSem003Cursor(line: string): { name: string; indent: string } | null {
  const m = line.match(/^(\s*)(\w+)\.AbrirCursor\s*\(/i);
  if (!m) return null;
  return { indent: m[1], name: m[2] };
}

/** Linha a inserir após AbrirCursor: `Name.FecharCursor();` */
export function sem003FecharInsert(line: string): string {
  const info = findSem003Cursor(line);
  if (!info) return "";
  return `${info.indent}${info.name}.FecharCursor();\n`;
}

/**
 * Completa o uso típico: AbrirCursor + Enquanto + Proximo + FecharCursor
 * (substitui a linha do AbrirCursor).
 */
export function applySem003CompleteFix(line: string): string {
  const info = findSem003Cursor(line);
  if (!info) return line;
  const { indent, name } = info;
  return (
    `${indent}${name}.AbrirCursor();\n` +
    `${indent}Enquanto (${name}.Achou) {\n` +
    `${indent}  \n` +
    `${indent}  ${name}.Proximo();\n` +
    `${indent}}\n` +
    `${indent}${name}.FecharCursor();`
  );
}

/** @deprecated RUL018 não reescreve mais ExecSQL→ExecSQLEx (ExecSQL é válido). */
export function applyRul018Fix(line: string): string {
  return line;
}

/**
 * Truncar errado → forma correta.
 * - Truncar(vnX, vnY); → vnY = Truncar(vnX);  (Truncar retorna valor)
 * - Truncar(vnX, 2);   → TruncarDecimal(vnX, 2); (2º arg numérico = casas)
 */
export function applyFun001Fix(line: string): string {
  const twoArgs = line.match(/^(\s*)Truncar\s*\(\s*([^,]+)\s*,\s*([^,)]+)\s*\)\s*;/i);
  if (!twoArgs) return line;
  const indent = twoArgs[1];
  const a = twoArgs[2].trim();
  const b = twoArgs[3].trim();
  if (/^\d+$/.test(b)) {
    return `${indent}TruncarDecimal(${a}, ${b});`;
  }
  return `${indent}${b} = Truncar(${a});`;
}

/** Alternativa: Truncar(vnX, vnY) → TruncarValor no destino após cópia. */
export function applyFun001TruncarValorFix(line: string): string {
  const twoArgs = line.match(/^(\s*)Truncar\s*\(\s*([^,]+)\s*,\s*([^,)]+)\s*\)\s*;/i);
  if (!twoArgs) return line;
  const indent = twoArgs[1];
  const a = twoArgs[2].trim();
  const b = twoArgs[3].trim();
  if (/^\d+$/.test(b)) {
    return `${indent}TruncarDecimal(${a}, ${b});`;
  }
  return `${indent}${b} = ${a};\n${indent}TruncarValor(${b});`;
}

/** Máscara FormatarData: YYYY/DD/MM → yyyy/dd/mm */
export function applyFun002Fix(line: string): string {
  return line.replace(/\bFormatarData\s*\(([^;]*)\)/i, (full, args: string) => {
    const fixedArgs = args.replace(/"([^"]*)"/g, (_m, mask: string) => {
      const fixed = mask
        .replace(/YYYY/g, "yyyy")
        .replace(/DD/g, "dd")
        .replace(/MM/g, "mm");
      return `"${fixed}"`;
    });
    return full.replace(args, fixedArgs);
  });
}

/** SQL_Retornar*(..., pX) → SQL_Retornar*(..., vnX) */
export function findFun004PArg(
  line: string
): { start: number; end: number; from: string; to: string } | null {
  const m = /\bSQL_Retornar(?:Inteiro|Alfa|Decimal|Data|Flutuante)?\s*\([^;]*,\s*(p[A-Za-z]\w*)\s*\)/i.exec(
    line
  );
  if (!m || m.index === undefined) return null;
  const from = m[1];
  const to = `vn${from.slice(1)}`;
  const start = m.index + m[0].lastIndexOf(from);
  return { start, end: start + from.length, from, to };
}

export function applyFun004Fix(line: string): string {
  return line.replace(
    /(\bSQL_Retornar(?:Inteiro|Alfa|Decimal|Data|Flutuante)?\s*\([^;]*,\s*)p([A-Za-z]\w*)(\s*\))/i,
    "$1vn$2$3"
  );
}

/**
 * Arredondar(valor, casas[, out]) → Arredonda(valor, casas)
 */
export function applyFun005Fix(line: string): string {
  const one = line.match(/^(\s*)Arredondar\s*\(\s*([^,)]+)\s*\)\s*;/i);
  if (one) {
    return `${one[1]}Arredonda(${one[2].trim()}, vnDecimais);`;
  }
  const m = line.match(
    /^(\s*)Arredondar\s*\(\s*([^,]+)\s*,\s*([^,)]+)\s*(?:,\s*[^)]+)?\s*\)\s*;/i
  );
  if (!m) return line;
  return `${m[1]}Arredonda(${m[2].trim()}, ${m[3].trim()});`;
}

/** Arredonda(valor); → Arredonda(valor, vnDecimais); (2º param pendente). */
export function applyFun006Fix(line: string): string {
  const m = line.match(/^(\s*)(Arredonda(?:ABNT)?)\s*\(\s*([^,)]+)\s*\)\s*;/i);
  if (!m) return line;
  if (/\bArredondar\s*\(/i.test(line)) return line;
  return `${m[1]}${m[2]}(${m[3].trim()}, vnDecimais);`;
}

/**
 * FUN003: 1º arg de EstaNulo é vd* (Data) — deve ser va* (Alfa).
 */
export function findFun003VdArg(
  line: string
): { start: number; end: number; from: string; to: string } | null {
  const m = /\bEstaNulo\s*\(\s*(vd\w+)/i.exec(line);
  if (!m || m.index === undefined) return null;
  const from = m[1];
  const to = `va${from.slice(2)}`;
  const start = m.index + m[0].length - from.length;
  return { start, end: start + from.length, from, to };
}

export function applyFun003Fix(line: string): string {
  const info = findFun003VdArg(line);
  if (!info) return line;
  return `${line.slice(0, info.start)}${info.to}${line.slice(info.end)}`;
}

export function applySyn004InicioFim(line: string): string {
  if (/^\s*Inicio\b/i.test(line)) return line.replace(/Inicio/i, "{");
  if (/^\s*Fim\s*;/i.test(line)) return line.replace(/Fim\s*;/i, "}");
  if (/\bFimSe\b/i.test(line)) return line.replace(/FimSe/gi, "}");
  if (/\bFimEnquanto\b/i.test(line)) return line.replace(/FimEnquanto/gi, "}");
  return line;
}

/**
 * SYN004 preferido: converte o par Inicio…Fim; (e a linha atual FimSe/FimEnquanto).
 * Retorna o fonte inteiro ou null se nada mudou.
 */
export function applySyn004PairFix(source: string, lineNumber: number): string | null {
  const edits = syn004PairLineEdits(source, lineNumber);
  if (!edits || edits.length === 0) return null;
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  for (const e of edits) {
    if (e.line >= 0 && e.line < lines.length) lines[e.line] = e.text;
  }
  const next = lines.join("\n");
  return next === source.replace(/\r\n/g, "\n") ? null : next;
}

/** Edições por linha do par Inicio/Fim (para completion: range de 1 linha + additionalTextEdits). */
export function syn004PairLineEdits(
  source: string,
  lineNumber: number
): Array<{ line: number; text: string }> | null {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  if (lineNumber < 0 || lineNumber >= lines.length) return null;
  const cur = lines[lineNumber];

  if (/\bFimSe\b/i.test(cur) || /\bFimEnquanto\b/i.test(cur)) {
    const text = applySyn004InicioFim(cur);
    return text === cur ? null : [{ line: lineNumber, text }];
  }

  const isInicio = /^\s*Inicio\b/i.test(cur);
  const isFim = /^\s*Fim\s*;/i.test(cur);
  if (!isInicio && !isFim) return null;

  let inicioLine = -1;
  let fimLine = -1;

  if (isInicio) {
    inicioLine = lineNumber;
    let depth = 0;
    for (let i = lineNumber; i < lines.length; i++) {
      if (/^\s*Inicio\b/i.test(lines[i])) depth++;
      if (/^\s*Fim\s*;/i.test(lines[i])) {
        depth--;
        if (depth === 0) {
          fimLine = i;
          break;
        }
      }
    }
  } else {
    fimLine = lineNumber;
    let depth = 0;
    for (let i = lineNumber; i >= 0; i--) {
      if (/^\s*Fim\s*;/i.test(lines[i])) depth++;
      if (/^\s*Inicio\b/i.test(lines[i])) {
        depth--;
        if (depth === 0) {
          inicioLine = i;
          break;
        }
      }
    }
  }

  const out: Array<{ line: number; text: string }> = [];
  if (inicioLine >= 0) {
    const t = applySyn004InicioFim(lines[inicioLine]);
    if (t !== lines[inicioLine]) out.push({ line: inicioLine, text: t });
  }
  if (fimLine >= 0) {
    const t = applySyn004InicioFim(lines[fimLine]);
    if (t !== lines[fimLine]) out.push({ line: fimLine, text: t });
  }
  return out.length ? out : null;
}

/** SYN001: acrescenta `;` no fim da instrução (preserva `@ coment @` no fim). */
export function applySyn001Fix(line: string): string {
  const m = line.match(/^(.*?)(\s*@[^@]*@\s*)?$/);
  if (!m) return line;
  const code = (m[1] ?? "").replace(/\s+$/, "");
  const trail = m[2] ?? "";
  if (!code) return line;
  if (/[;{}\\]$/.test(code)) return line;
  return `${code};${trail}`;
}

/**
 * SYN010: linha que é só um identificador (com ou sem `;`) — não é comando/atribuição/chamada.
 * Equivalente ao erro Senior: "falta valor, expressão ou comando".
 */
export function isSyn010OrphanStatement(probe: string): boolean {
  const t = probe.replace(/\s+/g, " ").trim();
  if (!t) return false;
  const core = t.replace(/;$/, "").trim();
  if (!core) return false;
  if (
    /^(Se|Senao|Enquanto|Para|Definir|Funcao|Mensagem|Cancel|Pare|Continue|Inicio|Fim|FimSe|FimEnquanto)\b/i.test(
      core
    )
  ) {
    return false;
  }
  if (/[=({]/.test(core)) return false;
  if (/^[{}]$/.test(core)) return false;
  // um único identificador (tipo Numero, nome solto, vnX sem uso, …)
  return /^[A-Za-z_][\w]*$/i.test(core);
}

/** SYN010 QF: remove a linha inválida. */
export function applySyn010DeleteLine(_line: string): string {
  return "";
}

/** SYN010 QF: se for tipo, sugere Definir Tipo com nome prefixado. */
export function applySyn010DefinirStub(line: string): string | null {
  const m = line.match(/^\s*(Numero|Alfa|Data|Lista|Cursor)\s*;?\s*$/i);
  if (!m) return null;
  const tip = m[1].toLowerCase();
  const tipo =
    tip === "numero"
      ? "Numero"
      : tip === "alfa"
        ? "Alfa"
        : tip === "data"
          ? "Data"
          : tip === "lista"
            ? "Lista"
            : "Cursor";
  const name =
    tip === "numero"
      ? "vnValor"
      : tip === "alfa"
        ? "vaTexto"
        : tip === "data"
          ? "vdData"
          : tip === "lista"
            ? "vlLista"
            : "Cur_Consulta";
  const indent = (line.match(/^(\s*)/) ?? [""])[0];
  return `${indent}Definir ${tipo} ${name};`;
}

/** SYN002: Se/Enquanto/Para cond → (cond). */
export function applySyn002Fix(line: string): string {
  const m = line.match(/^(\s*)(Se|Enquanto|Para)\s+([^{\n]+?)(\s*\{)\s*$/i);
  if (!m) {
    const m2 = line.match(/^(\s*)(Se|Enquanto|Para)\s+(.+?)\s*$/i);
    if (!m2) return line;
    const cond = m2[3].trim();
    if (cond.startsWith("(")) return line;
    return `${m2[1]}${m2[2]} (${cond})`;
  }
  const cond = m[3].trim();
  if (cond.startsWith("(")) return line;
  return `${m[1]}${m[2]} (${cond})${m[4]}`;
}

/** SYN003: Se (a e b) → Se ((a) e (b)). */
export function applySyn003Fix(line: string): string {
  const m = line.match(/^(\s*)(Se|Enquanto)\s*\((.+)\)(\s*\{?\s*)$/i);
  if (!m) return line;
  const inner = m[3].trim();
  if (!/\b(e|ou)\b/i.test(inner)) return line;
  if (/\([^)]+\)\s+(e|ou)\s+\(/i.test(inner)) return line;
  const tokens = inner.split(/(\s+(?:e|ou)\s+)/i);
  if (tokens.length < 3) return line;
  let rebuilt = "";
  for (let i = 0; i < tokens.length; i++) {
    if (i % 2 === 1) {
      rebuilt += tokens[i];
      continue;
    }
    const part = tokens[i].trim();
    if (!part) continue;
    rebuilt += /^\(.*\)$/.test(part) ? part : `(${part})`;
  }
  return `${m[1]}${m[2]} (${rebuilt})${m[4]}`;
}

/**
 * SYN005: move a linha Definir para o bloco de declarações no topo.
 */
export function applySyn005MoveDefinir(source: string, lineNumber: number): string | null {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  if (lineNumber < 0 || lineNumber >= lines.length) return null;
  if (!/^\s*Definir\s+/i.test(lines[lineNumber])) return null;
  const [defLine] = lines.splice(lineNumber, 1);
  let insertAt = 0;
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (!t || t.startsWith("@") || /^\/\//.test(t)) {
      insertAt = i + 1;
      continue;
    }
    if (/^\s*Definir\s+/i.test(lines[i])) {
      insertAt = i + 1;
      continue;
    }
    break;
  }
  lines.splice(insertAt, 0, defLine);
  const next = lines.join("\n");
  return next === source.replace(/\r\n/g, "\n") ? null : next;
}

/** SYN007: fecha comentario de bloco na linha do /* (preferido para completion). */
export function applySyn007CloseCommentLine(line: string): string {
  if (!/\/\*/.test(line) || /\*\//.test(line)) return line;
  return `${line.replace(/\s+$/, "")} */`;
}

/** SYN007: fecha comentario de bloco acrescentando *\/ na linha do /* aberto. */
export function applySyn007CloseComment(source: string): { next: string; line: number } | null {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  let depth = 0;
  let openLine = -1;
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const opens = (raw.match(/\/\*/g) || []).length;
    const closes = (raw.match(/\*\//g) || []).length;
    if (opens > 0 && depth === 0) openLine = i;
    depth += opens - closes;
    if (depth < 0) depth = 0;
  }
  if (depth <= 0 || openLine < 0) return null;
  const closed = applySyn007CloseCommentLine(lines[openLine]);
  if (closed === lines[openLine]) {
    lines.push("*/");
    return { next: lines.join("\n"), line: lines.length - 1 };
  }
  lines[openLine] = closed;
  return { next: lines.join("\n"), line: openLine };
}

/** SYN008: remove um `}` extra na linha (ex.: `}}` → `}`). */
export function applySyn008RemoveExtraBrace(line: string): string {
  if (/\}\s*\}/.test(line)) return line.replace(/\}\s*\}/, "}");
  const m = line.match(/^(.*)\}(\s*)$/);
  if (m) return `${m[1]}${m[2]}`;
  return line;
}

/** SYN009: quebra literal longo com `\` ~col 80. */
export function applySyn009BreakString(line: string): string {
  const m = line.match(/^(\s*)(.*?)(")([^"]{80,})(")(.*)$/);
  if (!m) return line;
  const indent = m[1];
  const before = m[2];
  const body = m[4];
  const after = m[6];
  let breakAt = 80;
  const sp = body.lastIndexOf(" ", 80);
  if (sp >= 40) breakAt = sp + 1;
  return `${indent}${before}"${body.slice(0, breakAt)}\\\n${indent}  ${body.slice(breakAt)}"${after}`;
}

/** Localiza colunas de `Retorna;` / `Retorne;` na linha. */
export function findRul007Ranges(line: string): Array<{ start: number; end: number }> {
  const ranges: Array<{ start: number; end: number }> = [];
  if (/Mensagem\s*\(\s*Retorna/i.test(line)) {
    return ranges;
  }
  const re = /\bRetorn[ae]\s*;/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line)) !== null) {
    ranges.push({ start: m.index, end: m.index + m[0].length });
  }
  return ranges;
}

export function findTokenRange(
  line: string,
  re: RegExp
): { start: number; end: number } | null {
  const flags = re.flags.includes("g") ? re.flags : re.flags + "g";
  const r = new RegExp(re.source, flags);
  const m = r.exec(line);
  if (!m || m.index === undefined) return null;
  return { start: m.index, end: m.index + m[0].length };
}

/** Variáveis novas introduzidas por um fix (para Definir automático). */
export function newVarsFromFix(id: string, fixed: string): string[] {
  const found: string[] = [];
  const add = (n: string) => {
    if (!found.includes(n)) found.push(n);
  };
  if (id === "RUL001") {
    // Definir feito via findRul001Param no code-action
  }
  if (id === "RUL004" && /\bvnDataHora\b/.test(fixed)) add("vnDataHora");
  if (id === "RUL005" && /\bvnCampo\b/.test(fixed)) add("vnCampo");
  if (id === "RUL006" && /\bvaMsg\b/.test(fixed)) add("vaMsg");
  if (id === "RUL013" && /\bvaEnter\b/.test(fixed)) add("vaEnter");
  if ((id === "FUN006" || id === "FUN005") && /\bvnDecimais\b/.test(fixed)) add("vnDecimais");
  return found;
}

/** Catálogo de fixes de linha simples (Ctrl+. e Ctrl+Espaço). */
export const LINE_FIXERS: Array<{
  id: string;
  title: string;
  apply: (line: string) => string;
  tokenRe?: RegExp;
}> = [
  {
    id: "RUL001",
    title: "Param de função: só Numero na assinatura (ou global se Alfa)",
    apply: applyRul001Fix,
    tokenRe: /\b(Alfa|Data|Lista|Cursor)\b|\b(?:va|vn|vd|vl)\w+\b/i,
  },
  { id: "RUL002", title: "Usar parâmetro de saída (não atribuir retorno)", apply: applyRul002Fix },
  { id: "RUL003", title: "EstaNulo fora do Se; depois Se (vn = 0)", apply: applyRul003Fix },
  {
    id: "RUL004",
    title: "DataHora(vn) + FormatarData(vn, …)",
    apply: applyRul004Fix,
    tokenRe: /\bvd\w+/i,
  },
  {
    id: "RUL005",
    title: "Variável intermediária no lugar de Obj.Campo",
    apply: applyRul005Fix,
    tokenRe: /\b[A-Za-z_]\w*(?:\.[A-Za-z_]\w+)+/,
  },
  { id: "RUL006", title: "Montar concat em variável antes da chamada", apply: applyRul006Fix },
  {
    id: "RUL007",
    title: "Substituir Retorna;/Retorne; por Cancel(1);",
    apply: applyRul007Fix,
  },
  {
    id: "RUL009",
    title: "ExecSQLEx: testar = 0 (sucesso), não = 1",
    apply: applyRul009Fix,
    tokenRe: /=\s*1/,
  },
  {
    id: "RUL011",
    title: "% → RestoDivisao(dividendo, divisor, resto)",
    apply: applyRul011Fix,
    tokenRe: /%/,
  },
  {
    id: "RUL012",
    title: "Chr → CaracterParaAlfa",
    apply: applyRul012Fix,
    tokenRe: /\bChr\b/i,
  },
  {
    id: "RUL013",
    title: "\\n → CaracterParaAlfa(13, vaEnter) + concat",
    apply: applyRul013Fix,
    tokenRe: /\\n/,
  },
  {
    id: "RUL014",
    title: "Substituir Break por Pare",
    apply: applyRul014Fix,
    tokenRe: /\bBreak\b/i,
  },
  {
    id: "RUL015",
    title: "Data literal → vd = CodData(dia, mes, ano)",
    apply: applyRul015Fix,
    tokenRe: /\d{1,2}\/\d{1,2}\/\d{2,4}/,
  },
  {
    id: "RUL016",
    title: "Renomear reservada com prefixo (ex.: vnCancel)",
    apply: applyRul016Fix,
    tokenRe: /\bDefinir\s+(?:Alfa|Numero|Data|Lista|Cursor)\s+(\w+)/i,
  },
  {
    id: "SQL001",
    title: "Concat SQL → placeholder :variavel",
    apply: applySql001Fix,
    tokenRe: /\+/,
  },
  {
    id: "SYN001",
    title: "Acrescentar ; no fim da instrução",
    apply: applySyn001Fix,
  },
  {
    id: "SYN002",
    title: "Colocar condição entre parênteses",
    apply: applySyn002Fix,
  },
  {
    id: "SYN003",
    title: "Parentizar cada parte do e/ou",
    apply: applySyn003Fix,
  },
  {
    id: "SYN004",
    title: "Converter Inicio/Fim para { }",
    apply: applySyn004InicioFim,
  },
  {
    id: "SYN008",
    title: "Remover } extra",
    apply: applySyn008RemoveExtraBrace,
  },
  {
    id: "SYN009",
    title: "Quebrar literal longo com \\",
    apply: applySyn009BreakString,
  },
  {
    id: "FUN002",
    title: 'Corrigir máscara FormatarData para dd/mm/yyyy',
    apply: applyFun002Fix,
  },
  {
    id: "FUN006",
    title: "Completar Decimais: Arredonda(valor, vnDecimais)",
    apply: applyFun006Fix,
  },
];
