import { analyze as analyzeCore } from "../pipeline";
import {
  collectFuncParamNames,
  findRul007Ranges,
  findRul019CancelRange,
  findTokenRange,
  findUntypedFuncParams,
  hasUntypedFuncParam,
  isSyn010OrphanStatement,
} from "./quick-fixes";
import { LIST_BUILTIN_MEMBERS, OUT_PARAM_FUNCS, RESERVED_WORDS } from "./rule-catalog";
import {
  extractDefinirComandoSqlArg,
  nativeNeedReason,
  resolveSqlText,
  sqlNeedsNativeDialect,
} from "./sql-native-heuristics";
import { parseFileSymbols } from "./document-symbols";
import { findCustomCalls, localEligibleNames } from "./symbol-scope";

export type DiagnosticHit = {
  id: string;
  message: string;
  line: number;
  severity: "error" | "warning";
  startCol?: number;
  endCol?: number;
};

/** Opções de análise (PDR-003: escopo / funções externas). */
export type AnalyzeLspOptions = {
  ignoreIds?: string[];
  /** Funções elegíveis em outros arquivos do escopo (chave = nome lower). */
  scopedExternal?: Map<string, { fileName: string }>;
  /**
   * Nomes de tabela do catálogo local (JSON). Se presente, emite DEM001
   * para identificadores Senior (prefixos E, R, USU_) ausentes do catálogo.
   */
  demobileTableNames?: ReadonlySet<string> | readonly string[];
};

function stripStringsAndComments(line: string): string {
  let s = line.replace(/@[^@]*@/g, " ");
  s = s.replace(/\/\*.*?\*\//g, " ");
  s = s.replace(/"(?:\\.|[^"\\])*"/g, '""');
  return s;
}

function push(
  hits: DiagnosticHit[],
  id: string,
  message: string,
  line: number,
  severity: "error" | "warning" = "error",
  startCol?: number,
  endCol?: number
): void {
  hits.push({ id, message, line, severity, startCol, endCol });
}

const BUILTIN_OR_KW =
  /^(Definir|Se|Senao|Enquanto|Para|Funcao|Inicio|Fim|FimSe|FimEnquanto|Mensagem|Cancel|Pare|Continue|Abrir|Fechar|Ler|Gravar|Lernl|Gravarnl|Inserir|Regra|VaPara|ValRet|ValStr|End|e|ou|Erro|Advertencia|Retorna)$/i;

/** `@ lsp-ignore RUL009 @` na mesma linha ou `@ lsp-ignore-next-line RUL009 @` na linha anterior. */
export function lineSuppressions(lines: string[]): Map<number, Set<string>> {
  const map = new Map<number, Set<string>>();
  const add = (line: number, id: string) => {
    if (!map.has(line)) map.set(line, new Set());
    map.get(line)!.add(id.toUpperCase());
  };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const m of line.matchAll(/@\s*lsp-ignore\s+(RUL\d+|SYN\d+|FUN\d+|SEM\d+|SQL\d+|ANL\d+|DEM\d+)\b/gi)) {
      add(i, m[1]);
    }
    for (const m of line.matchAll(
      /@\s*lsp-ignore-next-line\s+(RUL\d+|SYN\d+|FUN\d+|SEM\d+|SQL\d+|ANL\d+|DEM\d+)\b/gi
    )) {
      add(i + 1, m[1]);
    }
  }
  return map;
}

function resolveAnalyzeOpts(
  ignoreIdsOrOpts: string[] | AnalyzeLspOptions = []
): AnalyzeLspOptions {
  if (Array.isArray(ignoreIdsOrOpts)) {
    return { ignoreIds: ignoreIdsOrOpts };
  }
  return ignoreIdsOrOpts;
}

/** Diagnósticos estáticos (docs/product/regras-estaticas-lsp.md). */
export function analyzeLsp(
  source: string,
  ignoreIdsOrOpts: string[] | AnalyzeLspOptions = []
): DiagnosticHit[] {
  const opts = resolveAnalyzeOpts(ignoreIdsOrOpts);
  const ignore = new Set((opts.ignoreIds ?? []).map((x) => x.toUpperCase()));
  const hits: DiagnosticHit[] = [];
  const lines = source.replace(/\r\n/g, "\n").split("\n");

  let braceDepth = 0;
  let loopDepth = 0;
  let blockComment = false;
  let sawNonDefinirStmt = false;
  let afterExecSqlEx = 0; // janela de linhas após ExecSQLEx (RUL009)
  const defined = new Set<string>();
  /** tipo do Definir: alfa|numero|data|lista|cursor */
  const definedTypes = new Map<string, string>();
  /** Alfas que receberam atribuição com aspecto de SQL (RUL018). */
  const sqlAssignedAlfas = new Set<string>();
  const usedPrefixed = new Map<
    string,
    { line: number; start: number; end: number; display: string }
  >();
  /** SEM004: lista → set de campos via AdicionarCampo("Nome") */
  const listFields = new Map<string, Set<string>>();
  const listFieldHits = new Set<string>(); // evita duplicar mesmo membro na mesma linha

  const SQL_KW = /\b(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|MERGE|WITH)\b/i;

  // SYN007 / SYN008 pré-pass (alerta na linha do problema, não só no topo)
  // Ignora @ … @ para não contar `*/` dentro de comentário de linha do smoke/docs.
  const full = source.replace(/\r\n/g, "\n");
  {
    const synLines = full.split("\n");
    let cDepth = 0;
    let openCommentLine = -1;
    for (let i = 0; i < synLines.length; i++) {
      const raw = synLines[i].replace(/@[^@]*@/g, " ");
      const opens = (raw.match(/\/\*/g) || []).length;
      const closes = (raw.match(/\*\//g) || []).length;
      if (opens > 0 && cDepth === 0) openCommentLine = i;
      cDepth += opens - closes;
      if (cDepth < 0) cDepth = 0;
    }
    if (cDepth > 0) {
      const line = openCommentLine >= 0 ? openCommentLine : 0;
      push(hits, "SYN007", "Comentário de bloco /* sem */ correspondente.", line, "error");
    }
  }

  {
    const synLines = full.split("\n");
    let braces = 0;
    let badLine = -1;
    let lastCloseLine = -1;
    for (let i = 0; i < synLines.length; i++) {
      for (const ch of stripStringsAndComments(synLines[i])) {
        if (ch === "{") braces++;
        if (ch === "}") {
          braces--;
          lastCloseLine = i;
          if (braces < 0 && badLine < 0) badLine = i;
        }
      }
    }
    if (braces !== 0) {
      const line =
        braces < 0 ? (badLine >= 0 ? badLine : lastCloseLine >= 0 ? lastCloseLine : 0) : 0;
      push(hits, "SYN008", `Chaves desbalanceadas (saldo ${braces}).`, line, "error");
    }
  }

  // SQL002 / SQL003: pareamento por handle (alerta na linha do Criar/Abrir)
  const sqlCriarOpens = new Map<string, Array<{ line: number; start: number; end: number }>>();
  const sqlDestruirCount = new Map<string, number>();
  const sqlAbrirOpens = new Map<string, Array<{ line: number; start: number; end: number }>>();
  const sqlFecharCount = new Map<string, number>();
  /** Handles que já tiveram SQL_Criar neste arquivo (ordem). */
  const sqlCreated = new Set<string>();
  /** Handles que já tiveram SQL_DefinirComando. */
  const sqlHasComando = new Set<string>();
  /** Último literal Alfa rastreado (para SQL008 via variável). */
  const alfaLiterals = new Map<string, string>();
  /** Continuação de string com `\` no fim da linha. */
  let pendingAlfaLit: { name: string; buf: string } | null = null;
  /** SQL_UsarAbrangencia(h, 0) desde o último SQL_Criar(h). */
  const sqlAbrangencia0 = new Set<string>();
  /** SQL_UsarSQLSenior2(h, 0) desde o último SQL_Criar(h). */
  const sqlSenior2Off = new Set<string>();
  /** SEM003: por cursor, AbrirCursor órfãos (linha do open). */
  const cursorOpens = new Map<string, Array<{ line: number; start: number; end: number }>>();
  const cursorCloses = new Map<string, number>();
  /** SEM002: por handle de arquivo, Abrir órfãos. */
  const fileOpens = new Map<string, Array<{ line: number; start: number; end: number }>>();
  const fileCloses = new Map<string, number>();
  /** Abrir sem atribuição a variável (raro). */
  const fileOpensBare: Array<{ line: number; start: number; end: number }> = [];
  /** Cursor simples (Definir Cursor) — API .SQL / .AbrirCursor / .Achou */
  const simpleCursors = new Set<string>();
  /** Cursor completo (SQL_Criar) — API SQL_* */
  const completeCursors = new Set<string>();
  /** Completo ainda usando API simples (.AbrirCursor…) — adiar SQL002 até SQL009 */
  const mixedCompleteHandles = new Set<string>();

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    let line = raw;
    if (blockComment) {
      if (line.includes("*/")) {
        blockComment = false;
        line = line.slice(line.indexOf("*/") + 2);
      } else {
        continue;
      }
    }
    if (line.includes("/*") && !line.includes("*/")) {
      blockComment = true;
      line = line.slice(0, line.indexOf("/*"));
    }

    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("@")) {
      continue;
    }

    const code = stripStringsAndComments(trimmed);

    // track braces / loops (aproximado)
    const opens = (code.match(/\{/g) || []).length;
    const closes = (code.match(/\}/g) || []).length;
    const isLoopStart = /^\s*(Enquanto|Para)\b/i.test(trimmed);
    if (isLoopStart) loopDepth++;
    braceDepth += opens;
    // Fecha loops de forma grosseira quando } e loopDepth>0
    if (closes > 0 && loopDepth > 0 && /\}/.test(code)) {
      // reduz no máximo 1 por linha com }
      loopDepth = Math.max(0, loopDepth - 1);
    }
    braceDepth = Math.max(0, braceDepth - closes);

    // Definir tracking
    const def = trimmed.match(/^Definir\s+(Alfa|Numero|Data|Lista|Cursor)\s+(\w+)/i);
    if (def) {
      const tipo = def[1].toLowerCase();
      const nome = def[2];
      defined.add(nome.toLowerCase());
      definedTypes.set(nome.toLowerCase(), tipo);
      const prefixOk =
        (tipo === "alfa" && /^va/i.test(nome)) ||
        (tipo === "numero" && /^vn/i.test(nome)) ||
        (tipo === "data" && /^vd/i.test(nome)) ||
        (tipo === "lista" && /^(vl|a)/i.test(nome)) ||
        (tipo === "cursor" && /^cur_/i.test(nome));
      if (!prefixOk) {
        push(
          hits,
          "SYN006",
          `Nomenclatura: ${tipo} deve usar prefixo adequado (va/vn/vd/vl/Cur_). Nome: ${nome}`,
          i,
          "warning"
        );
        push(hits, "RUL008", `Prefixo desalinhado ao tipo (${tipo} → ${nome}).`, i, "warning");
      }
      if (RESERVED_WORDS.has(nome.toLowerCase())) {
        // grifa só o nome (não o tipo Definir Numero)
        const defSpan = raw.match(
          new RegExp(String.raw`Definir\s+${tipo}\s+(${nome})\b`, "i")
        );
        let startCol: number | undefined;
        let endCol: number | undefined;
        if (defSpan && defSpan.index !== undefined) {
          const nameOff = defSpan[0].lastIndexOf(defSpan[1]);
          startCol = defSpan.index + nameOff;
          endCol = startCol + defSpan[1].length;
        }
        push(
          hits,
          "RUL016",
          `Nome '${nome}' é palavra reservada.`,
          i,
          "error",
          startCol,
          endCol
        );
      }
      if (/[áàâãéêíóôõúüçÁÀÂÃÉÊÍÓÔÕÚÜÇ]/.test(nome)) {
        push(hits, "RUL016", `Nome '${nome}' não deve ter acentuação.`, i, "error");
      }
      if (nome.length > 100) {
        push(hits, "RUL016", `Nome '${nome}' excede 100 caracteres.`, i, "error");
      }
      if (tipo === "lista") {
        listFields.set(nome.toLowerCase(), new Set());
      }
      if (tipo === "cursor") {
        simpleCursors.add(nome.toLowerCase());
      }
      if (sawNonDefinirStmt && braceDepth === 0) {
        push(
          hits,
          "SYN005",
          "Preferir todos os Definir no início da regra (antes de outras instruções).",
          i,
          "warning"
        );
      }
    } else if (!/^(Funcao|Inicio|Fim)\b/i.test(trimmed)) {
      sawNonDefinirStmt = true;
    }

    // SEM004 — AdicionarCampo("Campo") registra campo da lista
    {
      const addRe = /\b(\w+)\.AdicionarCampo\s*\(\s*"([^"]+)"/gi;
      let am: RegExpExecArray | null;
      while ((am = addRe.exec(trimmed)) !== null) {
        const listName = am[1].toLowerCase();
        const field = am[2];
        if (!listFields.has(listName)) {
          listFields.set(listName, new Set());
        }
        listFields.get(listName)!.add(field.toLowerCase());
      }
    }

    // SEM004 — uso lista.Membro que não é builtin nem campo registrado
    {
      const memRe = /\b(\w+)\.(\w+)\b/g;
      let mm: RegExpExecArray | null;
      while ((mm = memRe.exec(code)) !== null) {
        const listName = mm[1].toLowerCase();
        const member = mm[2];
        const memberKey = member.toLowerCase();
        if (!listFields.has(listName)) continue;
        if (LIST_BUILTIN_MEMBERS.has(memberKey)) continue;
        if (listFields.get(listName)!.has(memberKey)) continue;
        const dedupe = `${i}:${listName}.${memberKey}`;
        if (listFieldHits.has(dedupe)) continue;
        listFieldHits.add(dedupe);
        push(
          hits,
          "SEM004",
          `Campo '${member}' em ${mm[1]} sem AdicionarCampo("${member}", …) prévio.`,
          i,
          "error",
          mm.index,
          mm.index + mm[0].length
        );
      }
    }

    // SYN010 — identificador/tipo solto (não é comando, atribuição nem chamada)
    // Compilador Senior: Erro na variável, "falta valor, expressão ou comando"
    {
      const probe = code.replace(/\s+/g, " ").trim();
      if (isSyn010OrphanStatement(probe)) {
        const tok = findTokenRange(raw, /^[A-Za-z_]\w*/);
        push(
          hits,
          "SYN010",
          `Instrução inválida '${probe.replace(/;$/, "")}': falta valor, expressão ou comando (não é atribuição, chamada nem palavra-chave de comando).`,
          i,
          "error",
          tok?.start,
          tok?.end
        );
      }
    }

    // SYN001 — usa `code` (sem @coment@ / strings) para não flagar `…; @ lsp-ignore … @`
    {
      const probe = code.replace(/\s+/g, " ").trim();
      if (isSyn010OrphanStatement(probe)) {
        // SYN010 cuida — não sugerir só acrescentar `;`
      } else {
        const looksLikeStmt =
          /^Definir\s+\w+\s+\w+/i.test(probe) ||
          /^(Se|Senao|Enquanto|Para)\b/i.test(probe) ||
          /^(Mensagem|Cancel|Funcao)\b/i.test(probe) ||
          /^(va|vn|vd|vl)\w+\s*=/i.test(probe) ||
          /^(va|vn|vd|vl)\w+\s*\(/i.test(probe) ||
          /^Cur_\w+\./i.test(probe) ||
          /^[A-Za-z_][\w.]*\s*=/.test(probe) ||
          /^[A-Za-z_]\w*\s*\(/.test(probe);
        if (looksLikeStmt) {
          if (
            !probe.endsWith(";") &&
            !probe.endsWith("{") &&
            !probe.endsWith("}") &&
            !probe.endsWith("\\") &&
            !/^Senao\b/i.test(probe)
          ) {
            push(hits, "SYN001", "Instrução provavelmente sem terminador `;`.", i, "error");
          }
        }
      }
    }

    // SYN002
    if (/\bSe\s+[^(]/i.test(trimmed) || /\bEnquanto\s+[^(]/i.test(trimmed) || /\bPara\s+[^(]/i.test(trimmed)) {
      push(hits, "SYN002", "Condição de Se/Enquanto/Para deve estar entre parênteses.", i, "error");
    }

    // SYN003
    if (/\bSe\s*\([^)]*\b(e|ou)\b[^)]*\)/i.test(trimmed) || /\bEnquanto\s*\([^)]*\b(e|ou)\b[^)]*\)/i.test(trimmed)) {
      const m = trimmed.match(/\b(Se|Enquanto)\s*\((.+)\)\s*\{?/i);
      if (m) {
        const inner = m[2];
        if (/\b(e|ou)\b/i.test(inner) && !/\([^)]+\)\s+(e|ou)\s+\(/i.test(inner)) {
          push(hits, "SYN003", "Condição composta: cada parte deve estar entre parênteses.", i, "error");
        }
      }
    }

    // SYN004
    if (
      /^\s*Inicio\b/i.test(trimmed) ||
      /^\s*Fim\s*;/i.test(trimmed) ||
      /\bFimSe\b/i.test(trimmed) ||
      /\bFimEnquanto\b/i.test(trimmed)
    ) {
      push(hits, "SYN004", "Use blocos { } em vez de Inicio/Fim/FimSe/FimEnquanto.", i, "warning");
    }

    // RUL007
    for (const range of findRul007Ranges(line)) {
      push(
        hits,
        "RUL007",
        "Use Cancel(1); em vez de Retorna;/Retorne; para interromper.",
        i,
        "error",
        range.start,
        range.end
      );
    }

    // SYN009 string longa sem \
    {
      const sm = raw.match(/"([^"]{100,})"/);
      if (sm && !/\\\s*$/.test(trimmed)) {
        const start = raw.indexOf(sm[0]);
        push(
          hits,
          "SYN009",
          "Literal longo: prefira quebrar com \\ ~coluna 80.",
          i,
          "warning",
          start,
          start + sm[0].length
        );
      }
    }

    // SQL001 concat em SQL
    if (
      (/\b(vaSql|vaSQL|vaQuery|vaComando)\w*\s*=/i.test(code) || /\.SQL\s*=/i.test(code)) &&
      /\+/.test(code) &&
      !/:\w+/.test(code)
    ) {
      const tok = findTokenRange(raw, /\+/);
      push(
        hits,
        "SQL001",
        "Prefira placeholders :bind em SQL em vez de concatenar variáveis.",
        i,
        "warning",
        tok?.start,
        tok?.end
      );
    }

    // Rastreia literais Alfa (inclui continuação com `\`) para SQL008
    if (pendingAlfaLit) {
      const chunk = trimmed.replace(/\\$/, "").trim();
      pendingAlfaLit.buf += " " + chunk;
      if (/";\s*$/.test(trimmed) || /"[^"]*"\s*;\s*$/.test(trimmed)) {
        const cleaned = pendingAlfaLit.buf
          .replace(/^"/, "")
          .replace(/"\s*;\s*$/, "")
          .replace(/\\\s*/g, " ");
        alfaLiterals.set(pendingAlfaLit.name, cleaned);
        pendingAlfaLit = null;
      }
    } else {
      const litAssign = trimmed.match(/^(\w+)\s*=\s*"(.*)$/);
      if (litAssign) {
        const name = litAssign[1].toLowerCase();
        const rest = litAssign[2];
        const oneLine = trimmed.match(/^(\w+)\s*=\s*"([\s\S]*)"\s*;\s*$/);
        if (oneLine && !trimmed.trimEnd().endsWith("\\")) {
          // complete one-liner (no trailing \)
          const endQuote = trimmed.lastIndexOf('"');
          const startQuote = trimmed.indexOf('"');
          if (startQuote >= 0 && endQuote > startQuote) {
            alfaLiterals.set(name, trimmed.slice(startQuote + 1, endQuote).replace(/\\\s*/g, " "));
          }
        } else if (/"\s*;\s*$/.test(trimmed) && (rest.match(/"/g) || []).length >= 1) {
          const endQuote = trimmed.lastIndexOf('"');
          const startQuote = trimmed.indexOf('"');
          alfaLiterals.set(name, trimmed.slice(startQuote + 1, endQuote).replace(/\\\s*/g, " "));
        } else {
          pendingAlfaLit = {
            name,
            buf: rest.replace(/\\$/, ""),
          };
        }
      }
    }

    // SQL002 / SQL003 / SQL004–SQL008 — ciclo de vida do cursor SQL
    {
      const criar = raw.match(/\bSQL_Criar\s*\(\s*(\w+)\s*\)/i);
      if (criar) {
        const handleRaw = criar[1];
        const h = handleRaw.toLowerCase();
        const tok = findTokenRange(raw, /\bSQL_Criar\b/i);
        const argTok = findTokenRange(raw, new RegExp(String.raw`\b${handleRaw}\b`));
        if (!sqlCriarOpens.has(h)) sqlCriarOpens.set(h, []);
        sqlCriarOpens.get(h)!.push({
          line: i,
          start: tok?.start ?? criar.index!,
          end: tok?.end ?? criar.index! + "SQL_Criar".length,
        });
        sqlCreated.add(h);
        completeCursors.add(h);
        sqlAbrangencia0.delete(h);
        sqlSenior2Off.delete(h);
        sqlHasComando.delete(h);

        if (simpleCursors.has(h)) {
          const tok = findTokenRange(raw, /\bSQL_Criar\b/i);
          push(
            hits,
            "SQL009",
            `SQL_Criar(${handleRaw}): handle é Cursor simples (Definir Cursor). Use API .SQL/.AbrirCursor ou mude para Definir Alfa + SQL_*.`,
            i,
            "error",
            tok?.start,
            tok?.end
          );
        }

        const tipo = definedTypes.get(h);
        if (!defined.has(h) || tipo !== "alfa") {
          push(
            hits,
            "SQL004",
            !defined.has(h)
              ? `SQL_Criar(${handleRaw}): variável Alfa deve estar Definida antes.`
              : `SQL_Criar(${handleRaw}): parâmetro deve ser Alfa (Definir Alfa), não ${tipo}.`,
            i,
            "error",
            argTok?.start ?? tok?.start,
            argTok?.end ?? tok?.end
          );
        }
      }
      const dest = raw.match(/\bSQL_Destruir\s*\(\s*(\w+)\s*\)/i);
      if (dest) {
        const h = dest[1].toLowerCase();
        sqlDestruirCount.set(h, (sqlDestruirCount.get(h) ?? 0) + 1);
      }

      const usarAbr = raw.match(/\bSQL_UsarAbrangencia\s*\(\s*(\w+)\s*,\s*(\d+)\s*\)/i);
      if (usarAbr) {
        const handleRaw = usarAbr[1];
        const h = handleRaw.toLowerCase();
        const flag = Number(usarAbr[2]);
        if (flag === 0) sqlAbrangencia0.add(h);
        else sqlAbrangencia0.delete(h);
        if (sqlHasComando.has(h)) {
          const tok = findTokenRange(raw, /\bSQL_UsarAbrangencia\b/i);
          push(
            hits,
            "SQL006",
            `SQL_Usar*(${handleRaw}) deve ser chamado antes de SQL_DefinirComando.`,
            i,
            "error",
            tok?.start,
            tok?.end
          );
        }
      }
      const usarSen = raw.match(/\bSQL_UsarSQLSenior2\s*\(\s*(\w+)\s*,\s*(\d+)\s*\)/i);
      if (usarSen) {
        const handleRaw = usarSen[1];
        const h = handleRaw.toLowerCase();
        const flag = Number(usarSen[2]);
        if (flag === 0) sqlSenior2Off.add(h);
        else sqlSenior2Off.delete(h);
        if (sqlHasComando.has(h)) {
          const tok = findTokenRange(raw, /\bSQL_UsarSQLSenior2\b/i);
          push(
            hits,
            "SQL006",
            `SQL_Usar*(${handleRaw}) deve ser chamado antes de SQL_DefinirComando.`,
            i,
            "error",
            tok?.start,
            tok?.end
          );
        }
      }

      const defCmdInfo = extractDefinirComandoSqlArg(raw);
      const defCmd = raw.match(/\bSQL_DefinirComando\s*\(\s*(\w+)\s*,/i);
      if (defCmd) {
        const handleRaw = defCmd[1];
        const h = handleRaw.toLowerCase();
        if (!sqlCreated.has(h)) {
          if (!simpleCursors.has(h)) {
            const tok = findTokenRange(raw, /\bSQL_DefinirComando\b/i);
            push(
              hits,
              "SQL007",
              `SQL_DefinirComando(${handleRaw}): chame SQL_Criar(${handleRaw}) antes.`,
              i,
              "error",
              tok?.start,
              tok?.end
            );
          }
        }

        // SQL008 — JOIN/subquery sem dialeto nativo (Abrangencia 0 + Senior2 0)
        if (defCmdInfo) {
          const sqlText = resolveSqlText(defCmdInfo.arg, alfaLiterals);
          if (sqlText && sqlNeedsNativeDialect(sqlText)) {
            const missingAbr = !sqlAbrangencia0.has(h);
            const missingSen = !sqlSenior2Off.has(h);
            if (missingAbr || missingSen) {
              const reason = nativeNeedReason(sqlText);
              const parts: string[] = [];
              if (missingAbr) parts.push("SQL_UsarAbrangencia(…, 0)");
              if (missingSen) parts.push("SQL_UsarSQLSenior2(…, 0)");
              const tok = findTokenRange(raw, /\bSQL_DefinirComando\b/i);
              push(
                hits,
                "SQL008",
                `SQL_DefinirComando(${handleRaw}): comando com ${reason} exige ${parts.join(" e ")} antes (SQL nativo).`,
                i,
                "error",
                tok?.start,
                tok?.end
              );
            }
          }
        }

        sqlHasComando.add(h);
      }

      const abrir = raw.match(/\bSQL_AbrirCursor\s*\(\s*(\w+)\s*\)/i);
      if (abrir) {
        const handleRaw = abrir[1];
        const h = handleRaw.toLowerCase();
        if (!simpleCursors.has(h)) {
          const tok = findTokenRange(raw, /\bSQL_AbrirCursor\b/i);
          if (!sqlAbrirOpens.has(h)) sqlAbrirOpens.set(h, []);
          sqlAbrirOpens.get(h)!.push({
            line: i,
            start: tok?.start ?? abrir.index!,
            end: tok?.end ?? abrir.index! + "SQL_AbrirCursor".length,
          });
          if (!sqlHasComando.has(h)) {
            push(
              hits,
              "SQL005",
              `SQL_AbrirCursor(${handleRaw}): chame SQL_DefinirComando antes (após SQL_Criar).`,
              i,
              "error",
              tok?.start,
              tok?.end
            );
          }
        }
      }
      const fechar = raw.match(/\bSQL_FecharCursor\s*\(\s*(\w+)\s*\)/i);
      if (fechar) {
        const h = fechar[1].toLowerCase();
        if (!simpleCursors.has(h)) {
          sqlFecharCount.set(h, (sqlFecharCount.get(h) ?? 0) + 1);
        }
      }

      // SQL009 — SQL_* em handle de Cursor simples
      const sqlCall = raw.match(/\bSQL_\w+\s*\(\s*(\w+)\b/i);
      if (sqlCall) {
        const handleRaw = sqlCall[1];
        const h = handleRaw.toLowerCase();
        if (simpleCursors.has(h) && !/\bSQL_Criar\b/i.test(raw)) {
          // SQL_Criar already reported above
          const tok = findTokenRange(raw, /\bSQL_\w+\b/i);
          push(
            hits,
            "SQL009",
            `${tok ? raw.slice(tok.start, tok.end) : "SQL_*"}(${handleRaw}): API de cursor completo em Cursor simples — use ${handleRaw}.AbrirCursor / .FecharCursor / .Proximo.`,
            i,
            "error",
            tok?.start,
            tok?.end
          );
        }
      }

      // SQL009 — API de cursor simples (.AbrirCursor/.SQL/.Achou/…) em handle de SQL_Criar
      const simpleApi = raw.match(
        /\b(\w+)\.(SQL|AbrirCursor|FecharCursor|Proximo|Achou)\b/i
      );
      if (simpleApi) {
        const handleRaw = simpleApi[1];
        const member = simpleApi[2];
        const h = handleRaw.toLowerCase();
        if (completeCursors.has(h)) {
          mixedCompleteHandles.add(h);
          const start = simpleApi.index ?? 0;
          const hint =
            /^AbrirCursor$/i.test(member)
              ? `SQL_AbrirCursor(${handleRaw})`
              : /^FecharCursor$/i.test(member)
                ? `SQL_FecharCursor(${handleRaw})`
                : /^Proximo$/i.test(member)
                  ? `SQL_Proximo(${handleRaw})`
                  : /^Achou$/i.test(member)
                    ? `SQL_EOF(${handleRaw})`
                    : `SQL_DefinirComando(${handleRaw}, …)`;
          push(
            hits,
            "SQL009",
            `${handleRaw}.${member}: API de cursor simples em cursor completo (SQL_Criar) — use ${hint}.`,
            i,
            "error",
            start,
            start + simpleApi[0].length
          );
        }
      }
    }

    // SEM003 — registra AbrirCursor / FecharCursor por nome (posições na linha raw)
    {
      const openRe = /\b(\w+)\.AbrirCursor\b/gi;
      let om: RegExpExecArray | null;
      while ((om = openRe.exec(raw)) !== null) {
        const name = om[1].toLowerCase();
        if (!cursorOpens.has(name)) cursorOpens.set(name, []);
        cursorOpens.get(name)!.push({
          line: i,
          start: om.index,
          end: om.index + om[0].length,
        });
      }
      const closeRe = /\b(\w+)\.FecharCursor\s*\(/gi;
      let cm: RegExpExecArray | null;
      while ((cm = closeRe.exec(raw)) !== null) {
        const name = cm[1].toLowerCase();
        cursorCloses.set(name, (cursorCloses.get(name) ?? 0) + 1);
      }
    }

    // SEM002 — arquivo: vnArq = Abrir(...) / Fechar(vnArq)
    {
      const assignOpen = raw.match(/^(\s*)(\w+)\s*=\s*Abrir\s*\(/i);
      if (assignOpen) {
        const handle = assignOpen[2].toLowerCase();
        const tok = findTokenRange(raw, /\bAbrir\b/i);
        if (!fileOpens.has(handle)) fileOpens.set(handle, []);
        fileOpens.get(handle)!.push({
          line: i,
          start: tok?.start ?? raw.indexOf("Abrir"),
          end: tok?.end ?? (raw.indexOf("Abrir") + 5),
        });
      } else if (/(^|[^\w.])Abrir\s*\(/i.test(raw) && !/\bAbrirCursor\b/i.test(raw)) {
        const tok = findTokenRange(raw, /\bAbrir\b/i);
        if (tok) fileOpensBare.push({ line: i, start: tok.start, end: tok.end });
      }
      const closeRe = /\bFechar\s*\(\s*(\w+)\s*\)/gi;
      let cm: RegExpExecArray | null;
      while ((cm = closeRe.exec(raw)) !== null) {
        // FecharCursor não casa (Fechar + Cursor)
        const handle = cm[1].toLowerCase();
        fileCloses.set(handle, (fileCloses.get(handle) ?? 0) + 1);
      }
    }
    // Coleta ids prefixados usados (SEM001) — colunas no texto da linha do documento
    for (const m of raw.matchAll(/\b((?:va|vn|vd|vl)[A-Za-z_]\w*|Cur_[A-Za-z_]\w*)\b/g)) {
      const display = m[1];
      const key = display.toLowerCase();
      if (usedPrefixed.has(key)) continue;
      // ignorar se só aparece dentro de string pura (heurística: aspas ao redor no raw)
      const before = raw.slice(0, m.index);
      const quoteCount = (before.match(/"/g) || []).length;
      if (quoteCount % 2 === 1) continue;
      usedPrefixed.set(key, {
        line: i,
        start: m.index!,
        end: m.index! + display.length,
        display,
      });
    }

    // FUN005 movido para o bloco FUN* abaixo (qualquer Arredonda*)

    // RUL001 — params de Funcao/Definir Funcao: só Numero; tipo obrigatório na assinatura
    if (/\b(?:Definir\s+)?Funcao\s+\w+\s*\(/i.test(trimmed)) {
      if (/\([^)]*\b(Alfa|Data|Lista|Cursor)\b/i.test(trimmed)) {
        const tok = findTokenRange(raw, /\b(Alfa|Data|Lista|Cursor)\b/i);
        push(
          hits,
          "RUL001",
          "Parâmetros de função devem ser apenas Numero (Alfa/Data/Lista não são suportados — use variável global, sem o param na assinatura).",
          i,
          "error",
          tok?.start,
          tok?.end
        );
      } else if (hasUntypedFuncParam(raw)) {
        const untyped = findUntypedFuncParams(raw);
        for (const p of untyped) {
          push(
            hits,
            "RUL001",
            `Parâmetro '${p.name}' sem tipo na assinatura — declare como Numero (ex.: Numero ${p.name.replace(/^va/i, "vn")}). Não use Definir + nome solto no param.`,
            i,
            "error",
            p.start,
            p.end
          );
        }
      }
    }

    // RUL002 / out-param assign
    for (const fn of OUT_PARAM_FUNCS) {
      const re = new RegExp(String.raw`=\s*${fn}\s*\(`, "i");
      if (re.test(code)) {
        const tok = findTokenRange(raw, new RegExp(String.raw`\b${fn}\b`, "i"));
        push(
          hits,
          "RUL002",
          `${fn} usa parâmetro de retorno — chame ${fn}(..., vnSaida); em vez de vn = ${fn}(...).`,
          i,
          "error",
          tok?.start,
          tok?.end
        );
      }
    }

    // RUL003 EstaNulo in Se
    if (/\bSe\s*\(\s*EstaNulo\s*\(/i.test(code)) {
      const tok = findTokenRange(raw, /\bEstaNulo\b/i);
      push(
        hits,
        "RUL003",
        "Execute EstaNulo(...); depois Se (vn = 0) — não use EstaNulo na condição.",
        i,
        "error",
        tok?.start,
        tok?.end
      );
    }

    // RUL004 FormatarData(vd
    if (/\bFormatarData\s*\(\s*vd\w*/i.test(code)) {
      const tok = findTokenRange(raw, /\bvd\w+/i);
      push(
        hits,
        "RUL004",
        "FormatarData aceita Numero — use DataHora(vn) antes.",
        i,
        "error",
        tok?.start,
        tok?.end
      );
    }

    // RUL005 Obj.Campo as arg — heurística: Func( ... Xxx.Yyy ... )
    const callArgDot = /\b[A-Za-z_]\w*\s*\([^;]*\b[A-Za-z_]\w*(?:\.[A-Za-z_]\w+){1,}[^;]*\)/;
    if (callArgDot.test(code) && !/^\s*[A-Za-z_]\w*(?:\.[A-Za-z_]\w+)+\s*=/.test(trimmed)) {
      if (
        /\b(IntParaAlfa|AlfaParaInt|AlfaParaDecimal|DecimalParaAlfa|TamanhoAlfa|FormatarData|Mensagem|SubstAlfa|CopiarAlfa)\s*\(/i.test(
          code
        )
      ) {
        const tok = findTokenRange(raw, /\b[A-Za-z_]\w*(?:\.[A-Za-z_]\w+)+/);
        push(
          hits,
          "RUL005",
          "Não passe Objeto.Campo diretamente em parâmetro — use variável intermediária.",
          i,
          "error",
          tok?.start,
          tok?.end
        );
      }
    }

    // RUL006 concat/ops in args (Mensagem e calls)
    if (/\b[A-Za-z_]\w*\s*\([^)]*\+[^)]*\)/.test(code)) {
      const tok = findTokenRange(raw, /\+/);
      push(
        hits,
        "RUL006",
        "Não concatene (+) dentro de argumentos de função — monte em variável antes.",
        i,
        "error",
        tok?.start,
        tok?.end
      );
    }

    // RUL009 ExecSQLEx: tratar =1 como sucesso (mesma linha ou logo abaixo)
    if (/\bExecSQLEx\b/i.test(code)) {
      afterExecSqlEx = 4;
    }
    if (
      (afterExecSqlEx > 0 || /\bExecSQLEx\b/i.test(code)) &&
      /\bSe\s*\(\s*\w+\s*=\s*1\s*\)/.test(code)
    ) {
      const tok = findTokenRange(raw, /=\s*1/);
      push(
        hits,
        "RUL009",
        "ExecSQLEx: 0 = sucesso, 1 = erro — verifique se não inverteu o teste.",
        i,
        "warning",
        tok?.start,
        tok?.end
      );
      afterExecSqlEx = 0;
    } else if (afterExecSqlEx > 0) {
      afterExecSqlEx--;
    }

    // RUL010 Mensagem com JSON/XML/Log
    if (/\bMensagem\s*\([^,]+,\s*va(JSON|XML|Log|Resposta|Payload)\w*/i.test(code)) {
      push(hits, "RUL010", "Evite Mensagem com payload grande (JSON/XML/log) — use resumo Alfa.", i, "warning");
    }

    // RUL011 %
    if (/\w+\s*%\s*\w+/.test(code)) {
      const tok = findTokenRange(raw, /%/);
      push(hits, "RUL011", "Operador % não existe — use RestoDivisao.", i, "error", tok?.start, tok?.end);
    }

    // RUL012 Chr(
    if (/\bChr\s*\(/i.test(code)) {
      const tok = findTokenRange(raw, /\bChr\b/i);
      push(hits, "RUL012", "Chr() não existe — use CaracterParaAlfa.", i, "error", tok?.start, tok?.end);
    }

    // RUL013 \n in string
    if (/\\n/.test(raw) && /"/.test(raw)) {
      const tok = findTokenRange(raw, /\\n/);
      push(
        hits,
        "RUL013",
        "Evite \\n em string — use CaracterParaAlfa(13, vaEnter).",
        i,
        "warning",
        tok?.start,
        tok?.end
      );
    }

    // RUL014 Break
    if (/\bBreak\b/i.test(code)) {
      const tok = findTokenRange(raw, /\bBreak\b/i);
      push(hits, "RUL014", "Use Pare; em vez de Break.", i, "error", tok?.start, tok?.end);
    }

    // RUL015 date literal
    if (/\bvd\w*\s*=\s*\d{1,2}\/\d{1,2}\/\d{2,4}\s*;/i.test(trimmed)) {
      const tok = findTokenRange(raw, /\d{1,2}\/\d{1,2}\/\d{2,4}/);
      push(
        hits,
        "RUL015",
        "Não atribua data literal assim — use MontaData/CodData.",
        i,
        "error",
        tok?.start,
        tok?.end
      );
    }

    // RUL017 Pare fora de loop
    if (/\bPare\s*;/i.test(code) && loopDepth <= 0 && !/\b(Enquanto|Para)\b/i.test(trimmed)) {
      const tok = findTokenRange(raw, /\bPare\b/i);
      push(
        hits,
        "RUL017",
        "Pare; só deve ser usado dentro de Para/Enquanto.",
        i,
        "warning",
        tok?.start,
        tok?.end
      );
    }

    // RUL018 — rastreia Alfa com SQL atribuído; ExecSQL(va) sem SQL → alerta
    {
      const assignSql = trimmed.match(/^(va\w+)\s*=\s*(.+)$/i);
      if (assignSql) {
        const dest = assignSql[1].toLowerCase();
        const rhs = assignSql[2];
        if (SQL_KW.test(rhs)) {
          sqlAssignedAlfas.add(dest);
        } else {
          const fromVar = rhs.match(/^(va\w+)\s*;?\s*$/i);
          if (fromVar && sqlAssignedAlfas.has(fromVar[1].toLowerCase())) {
            sqlAssignedAlfas.add(dest);
          }
        }
      }
    }
    if (/\bExecSQL\s*\(/i.test(code) && !/\bExecSQLEx\s*\(/i.test(code)) {
      const argM = /\bExecSQL\s*\(\s*(\w+)\s*\)/i.exec(code);
      const arg = argM?.[1];
      if (arg && /^va/i.test(arg) && !sqlAssignedAlfas.has(arg.toLowerCase())) {
        const tok = findTokenRange(raw, /\bExecSQL\b/i);
        push(
          hits,
          "RUL018",
          `ExecSQL(${arg}): Alfa sem comando SQL atribuído (INSERT/UPDATE/DELETE/…).`,
          i,
          "warning",
          tok?.start,
          tok?.end
        );
      }
    }

    // RUL019 — Cancel só aceita 1, 2 ou 3
    {
      const bad = findRul019CancelRange(raw);
      if (bad) {
        const tip =
          bad.arg === null
            ? "Use Cancel(1); Cancel(2); ou Cancel(3); (docs/lsp/cancel.md)."
            : `Cancel só aceita 1, 2 ou 3 (recebeu "${bad.arg}"). ` +
              "1=interromper regra; 2=relatório ValStr/ValRet; 3=fórmula relatório.";
        push(hits, "RUL019", tip, i, "error", bad.start, bad.end);
      }
    }

    // FUN001 Truncar com aridade ≠ 1 (Truncar(Numero) retorna valor)
    if (/\bTruncar\s*\([^)]*,[^)]*\)/i.test(code)) {
      push(
        hits,
        "FUN001",
        "Truncar(Numero vnValor) retorna valor: vnY = Truncar(vnX);. Para casas use TruncarDecimal(vnValor, vnDecimais); ou TruncarValor(vnValor).",
        i,
        "error"
      );
    }

    // FUN002 FormatarData mask
    if (/\bFormatarData\s*\([^)]*"(?:[^"]*(?:YYYY|DD|MM)[^"]*)"/i.test(raw)) {
      // só alerta se houver token em maiúsculas típico de máscara errada
      if (/FormatarData\s*\([^)]*"[^"]*(?:YYYY|\bDD\b|\bMM\b)/.test(raw)) {
        push(
          hits,
          "FUN002",
          'Máscara FormatarData: use minúsculos — ex.: "dd/mm/yyyy" (não "DD/MM/YYYY").',
          i,
          "warning"
        );
      }
    }

    // FUN003 EstaNulo: 1º Alfa, 2º Numero (End) — não Data — grifa só o vd*
    {
      const vd = /\bEstaNulo\s*\(\s*(vd\w+)/i.exec(raw);
      if (vd && vd.index !== undefined) {
        const name = vd[1];
        const start = vd.index + vd[0].length - name.length;
        push(
          hits,
          "FUN003",
          "EstaNulo(Alfa VarStr, Numero End Retorno) — 1º parâmetro deve ser Alfa (va*), não Data (vd*).",
          i,
          "error",
          start,
          start + name.length
        );
      }
    }

    // FUN004 SQL_Retornar to p* — grifa só o p*
    {
      const pArg = /\bSQL_Retornar(?:Inteiro|Alfa|Decimal|Data|Flutuante)?\s*\([^;]*,\s*(p[A-Za-z]\w*)\s*\)/i.exec(
        raw
      );
      if (pArg) {
        const name = pArg[1];
        const start = raw.lastIndexOf(name);
        push(
          hits,
          "FUN004",
          'Não use parâmetro p* como destino de SQL_Retornar* — use variável local (ex.: SQL_RetornarInteiro(vaSql, "CODIGO", vnCodigo);).',
          i,
          "error",
          start,
          start + name.length
        );
      }
    }

    // FUN005 Arredondar inexistente (qualquer aridade)
    if (/\bArredondar\s*\(/i.test(code)) {
      push(
        hits,
        "FUN005",
        "Arredondar não existe. Use: Arredonda, ArredondaABNT, ArredondarValor, ArredondarValorEx ou ArredondaValorTipoAcerto (Ctrl+Espaço sobre Arredond*).",
        i,
        "error"
      );
    }

    // FUN006: Arredonda/ArredondaABNT com 1 arg — falta Decimais (numeral ou vn*)
    // Não casar Arredondar / ArredondaValor* (precisa de '(' logo após o nome)
    if (/\bArredonda(?:ABNT)?\s*\(\s*[^,)]+\s*\)\s*;/i.test(code) && !/\bArredondar\s*\(/i.test(code)) {
      push(
        hits,
        "FUN006",
        "Arredonda(Valor, Decimais): informe o 2º parâmetro — numeral (ex.: 2) ou variável Numero (ex.: vnCasas).",
        i,
        "warning"
      );
    }
  }

  // SEM001: prefixados usados sem Definir (só se o arquivo já declara algo).
  // Numero é implícito: vn* sem Definir é válido (compilador trata como Numero = 0).
  // Params de Definir Funcao / Funcao NÃO são variáveis de arquivo (não alertar SEM001).
  const funcParamNames = collectFuncParamNames(source);
  if (defined.size > 0) {
    for (const [name, loc] of usedPrefixed) {
      if (defined.has(name)) continue;
      if (funcParamNames.has(name)) continue;
      if (/^p[a-z]/i.test(name)) continue;
      if (/^vn/i.test(name)) continue;
      if (BUILTIN_OR_KW.test(name)) continue;
      push(
        hits,
        "SEM001",
        `Variável '${loc.display}' parece usada sem Definir no arquivo.`,
        loc.line,
        "warning",
        loc.start,
        loc.end
      );
    }
  }

  // SEM003: AbrirCursor sem FecharCursor — alerta na linha do AbrirCursor
  // (ignora handles de cursor completo SQL_Criar — aí a API correta é SQL_*)
  for (const [name, opens] of cursorOpens) {
    if (completeCursors.has(name)) continue;
    const closes = cursorCloses.get(name) ?? 0;
    const unmatched = opens.length - closes;
    if (unmatched <= 0) continue;
    for (const open of opens.slice(-unmatched)) {
      push(
        hits,
        "SEM003",
        `Cursor.AbrirCursor sem .FecharCursor correspondente.`,
        open.line,
        "warning",
        open.start,
        open.end
      );
    }
  }

  // SQL002: SQL_Criar sem SQL_Destruir — alerta na linha do Criar
  for (const [handle, opens] of sqlCriarOpens) {
    if (simpleCursors.has(handle)) continue; // SQL009 — Cursor simples não usa Destruir
    if (mixedCompleteHandles.has(handle)) continue; // SQL009 primeiro — não empilhar Destruir
    const closes = sqlDestruirCount.get(handle) ?? 0;
    const unmatched = opens.length - closes;
    if (unmatched <= 0) continue;
    for (const open of opens.slice(-unmatched)) {
      push(
        hits,
        "SQL002",
        `SQL_Criar sem SQL_Destruir correspondente (use SQL_Destruir(${handle})).`,
        open.line,
        "warning",
        open.start,
        open.end
      );
    }
  }

  // SQL003: SQL_AbrirCursor sem SQL_FecharCursor — alerta na linha do Abrir
  for (const [handle, opens] of sqlAbrirOpens) {
    const closes = sqlFecharCount.get(handle) ?? 0;
    const unmatched = opens.length - closes;
    if (unmatched <= 0) continue;
    for (const open of opens.slice(-unmatched)) {
      push(
        hits,
        "SQL003",
        `SQL_AbrirCursor sem SQL_FecharCursor correspondente (use SQL_FecharCursor(${handle})).`,
        open.line,
        "warning",
        open.start,
        open.end
      );
    }
  }

  // SEM002: Abrir sem Fechar — alerta na linha do Abrir
  for (const [handle, opens] of fileOpens) {
    const closes = fileCloses.get(handle) ?? 0;
    const unmatched = opens.length - closes;
    if (unmatched <= 0) continue;
    for (const open of opens.slice(-unmatched)) {
      push(
        hits,
        "SEM002",
        `Abrir sem Fechar correspondente (use Fechar(${handle})).`,
        open.line,
        "warning",
        open.start,
        open.end
      );
    }
  }
  // Abrir sem atribuição: alerta se há mais Abrir bare do que Fechar “sobrando”
  {
    let closesLeft = 0;
    for (const [handle, n] of fileCloses) {
      const used = Math.min(n, fileOpens.get(handle)?.length ?? 0);
      closesLeft += n - used;
    }
    const bareUnmatched = Math.max(0, fileOpensBare.length - closesLeft);
    for (const open of fileOpensBare.slice(-bareUnmatched)) {
      push(
        hits,
        "SEM002",
        `Abrir sem Fechar correspondente.`,
        open.line,
        "warning",
        open.start,
        open.end
      );
    }
  }

  // FUN007 / FUN008 / FUN009 — funções customizadas (PDR-003)
  {
    const symbols = parseFileSymbols(source);
    const lines = source.replace(/\r\n/g, "\n").split("\n");
    for (const fn of symbols.functions) {
      if (fn.hasDecl && !fn.hasImpl) {
        const lineIdx = fn.declLine >= 0 ? fn.declLine : 0;
        const col = lines[lineIdx]?.toLowerCase().indexOf(fn.name.toLowerCase());
        push(
          hits,
          "FUN007",
          `Função '${fn.name}' declarada (Definir Funcao) sem implementação (Funcao … { }).`,
          lineIdx,
          "error",
          col !== undefined && col >= 0 ? col : undefined,
          col !== undefined && col >= 0 ? col + fn.name.length : undefined
        );
      }
      if (fn.hasImpl && !fn.hasDecl) {
        const lineIdx = fn.implLine >= 0 ? fn.implLine : 0;
        const col = lines[lineIdx]?.toLowerCase().indexOf(fn.name.toLowerCase());
        push(
          hits,
          "FUN008",
          `Função '${fn.name}' implementada sem Definir Funcao correspondente.`,
          lineIdx,
          "error",
          col !== undefined && col >= 0 ? col : undefined,
          col !== undefined && col >= 0 ? col + fn.name.length : undefined
        );
      }
    }

    const localOk = localEligibleNames(symbols);
    const external = opts.scopedExternal;
    if (external && external.size > 0) {
      for (const call of findCustomCalls(source)) {
        const key = call.name.toLowerCase();
        if (localOk.has(key)) continue;
        const ext = external.get(key);
        if (!ext) continue;
        push(
          hits,
          "FUN009",
          `Função '${call.name}' existe em ${ext.fileName}, mas não está Declarada/implementada neste arquivo.`,
          call.line,
          "warning",
          call.startCol,
          call.endCol
        );
      }
    }
  }

  // Opção 2 (PDR-005): merge ANL* do analyzer puro (sem duplicar RUL007 / SYN003 / SYN008).
  const hasRul007 = hits.some((h) => h.id === "RUL007");
  const hasSyn003 = hits.some((h) => h.id === "SYN003");
  const hasSyn008 = hits.some((h) => h.id === "SYN008");
  const hasSyn004 = hits.some((h) => h.id === "SYN004");
  const hasSyn002 = hits.some((h) => h.id === "SYN002");
  const anlIgnore = [
    ...ignore,
    ...(hasRul007 ? ["ANL010"] : []),
    ...(hasSyn003 ? ["ANL011"] : []),
    ...(hasSyn008 ? ["ANL001", "ANL002"] : []),
    ...(hasSyn004 ? ["ANL004"] : []),
    ...(hasSyn002 ? ["ANL012"] : []),
  ];
  try {
    const { diagnostics: anl } = analyzeCore(source, { ignoreIds: anlIgnore });
    for (const d of anl) {
      if (!/^ANL\d+/i.test(d.id)) continue;
      push(hits, d.id, d.message, d.line, d.severity);
    }
  } catch {
    // analyzer opcional — não quebra heurísticas RUL/SYN/FUN
  }

  // DEM001 — tabela Senior citada mas ausente do catálogo local
  if (opts.demobileTableNames) {
    const known = new Set(
      [...opts.demobileTableNames].map((n) => String(n).toUpperCase())
    );
    const TABLE_ID = /\b((?:E|R)\d{3}[A-Z0-9]+|USU_[A-Z][A-Z0-9_]*)\b/gi;
    const reported = new Set<string>();
    for (let i = 0; i < lines.length; i++) {
      const stripped = stripStringsAndComments(lines[i]);
      // Também vasculha literais SQL (strings) — strip remove conteúdo; re-scan raw para strings
      const raw = lines[i];
      const scan = `${stripped} ${raw}`;
      for (const m of scan.matchAll(TABLE_ID)) {
        const name = m[1].toUpperCase();
        const key = `${i}:${name}`;
        if (reported.has(key)) continue;
        if (known.has(name)) continue;
        reported.add(key);
        const col = raw.toUpperCase().indexOf(name);
        push(
          hits,
          "DEM001",
          `Tabela ${name} não encontrada no catálogo local`,
          i,
          "warning",
          col >= 0 ? col : undefined,
          col >= 0 ? col + name.length : undefined
        );
      }
    }
  }

  const suppressedByLine = lineSuppressions(lines);
  return hits.filter((h) => {
    if (ignore.has(h.id.toUpperCase())) return false;
    if (suppressedByLine.get(h.line)?.has(h.id.toUpperCase())) return false;
    return true;
  });
}
