import * as vscode from "vscode";
import { getStructuralSeedsMatching } from "./completion-seeds";
import { completionSortText } from "./completion-rank";
import { functionsMatchingPrefix } from "./function-catalog";
import { completeMembersAt } from "./application/complete-members";
import { functionsMatchingPrefixForSystem } from "./domain/system-catalog";
import {
  arredondarRewriteOptions,
  findCallSpan,
  formatarDataMaskOptions,
  truncarRewriteOptions,
} from "./rewrite-options";
import { buildDefinirInsertEdit, definirStatement, tipoFromPrefix } from "./definir-insert";
import { analyzeLsp } from "./diagnostics";
import {
  filterSenior2Completions,
  isSqlStringCompletionContext,
} from "./sql-native-heuristics";
import {
  applyFun003Fix,
  applyFun004Fix,
  applyRul015MontaDataFix,
  applyRul019Fix,
  applySem002CompleteFix,
  applySem003CompleteFix,
  applySql001Fix,
  findFun003VdArg,
  findFun004PArg,
  findRul001Param,
  applyRul001FixAllSignatures,
  findSem002FileOpen,
  findSem003Cursor,
  findSem004InsertAfterLine,
  findSem004Usage,
  findSql002Criar,
  findSql003Abrir,
  findSql002DestruirAfterLine,
  findSql003FecharInsertPos,
  findSqlHandleCall,
  applySql004SourceFix,
  applySql006MoveUsarBeforeComando,
  applySql009LineFix,
  applySql009ScaffoldFix,
  applyPrefixRenameSourceFix,
  applyPrefixChangeTypeFix,
  applySyn005MoveDefinir,
  applySyn007CloseComment,
  applySyn007CloseCommentLine,
  applySyn010DefinirStub,
  applySyn011ToBlockComment,
  applySyn009BreakString,
  applySyn004InicioFim,
  syn004PairLineEdits,
  isDefinirCursorHandle,
  isSuppressible,
  LINE_FIXERS,
  newVarsFromFix,
  sem002FecharInsert,
  sem003FecharInsert,
  sem004AdicionarCampoLine,
  sql002DestruirInsert,
  sql003FecharInsert,
  sql005DefinirComandoInsert,
  sql007CriarInsert,
  sql008MissingFlags,
  sql008NativeInsert,
  sqlEnquantoLoopInsert,
  suggestedPrefixedName,
  suggestedTipoFromPrefix,
} from "./quick-fixes";
import { filterSuppressedHits, IGNORE_DIAGNOSTIC_CMD, isLineSuppressed } from "./suppressions";
import {
  APPLY_TEXT_EDITS_CMD,
  APPLY_SYN009_CMD,
  serializeFullDocumentReplace,
  serializeLineReplace,
  serializeTextEdit,
  type SerializedTextEdit,
} from "./apply-edits";
import { getWorkspaceSymbolIndex } from "./workspace-symbol-index";
import {
  callSnippetFor,
  markdownForFunction,
  applyFun007InsertImpl,
  applyFun008InsertDecl,
  type CustomFunctionSymbol,
} from "./document-symbols";
import { mergeEligible } from "./symbol-scope";
import { localTableCompletions, localColumnCompletions, isTableColumnCompletionContext } from "./adapters/vscode/local-catalog-loader";

function toKind(kind: "keyword" | "function" | "type"): vscode.CompletionItemKind {
  switch (kind) {
    case "function":
      return vscode.CompletionItemKind.Function;
    case "type":
      return vscode.CompletionItemKind.TypeParameter;
    case "keyword":
    default:
      return vscode.CompletionItemKind.Keyword;
  }
}

function isDefined(source: string, name: string): boolean {
  return new RegExp(String.raw`Definir\s+\w+\s+${name}\b`, "i").test(source);
}

/** RUL001 em todas as assinaturas (decl+impl) + Definir global dos params ilegais. */
function applyRul001DocumentFix(source: string): string {
  const { next, globals } = applyRul001FixAllSignatures(source);
  let sim = next;
  for (const g of globals) {
    if (isDefined(sim, g.name)) continue;
    const { afterLine } = buildDefinirInsertEdit(sim, 0, g.name);
    const lines = sim.replace(/\r\n/g, "\n").split("\n");
    lines.splice(afterLine + 1, 0, `Definir ${g.tipo} ${g.name};`);
    sim = lines.join("\n");
  }
  return sim;
}

function rewriteItems(
  document: vscode.TextDocument,
  line: vscode.TextLine,
  word: string,
  kind: "truncar" | "arredondar"
): vscode.CompletionList {
  const opts =
    kind === "truncar" ? truncarRewriteOptions(line.text) : arredondarRewriteOptions(line.text);

  const fnRe = kind === "truncar" ? /\bTruncar(?:Decimal|Valor)?/i : /\bArredond\w*/i;
  const span = findCallSpan(line.text, fnRe);
  const replaceRange = span
    ? new vscode.Range(line.lineNumber, span.start, line.lineNumber, span.end)
    : new vscode.Range(line.lineNumber, 0, line.lineNumber, line.text.length);

  const src = document.getText();
  const items = opts.map((opt) => {
    const item = new vscode.CompletionItem(opt.label, vscode.CompletionItemKind.Function);
    item.detail = `LSP · ${opt.detail}`;
    const docText = opt.insertText.replace(/\$\{\d+:([^}]+)\}/g, "<$1>");
    item.documentation = new vscode.MarkdownString("```lsp\n" + docText + "\n```");
    item.filterText = `${word} ${opt.label} ${opt.sortKey} ${opt.detail}`;
    item.sortText = opt.sortKey;
    item.range = replaceRange;
    if (opt.isSnippet) {
      item.insertText = new vscode.SnippetString(opt.insertText);
    } else {
      item.insertText = opt.insertText;
    }
    if (opt.sortKey === "01") {
      item.preselect = true;
    }

    const extras: vscode.TextEdit[] = [];
    const need: string[] = [];
    for (const m of opt.insertText.matchAll(/\b(vnCasas|vnTipoAcerto|vnDecimais)\b/g)) {
      if (!need.includes(m[1])) need.push(m[1]);
    }
    // Snippet placeholders ${1:vnDecimais} also count
    for (const m of opt.insertText.matchAll(/\$\{\d+:(vn\w+)\}/g)) {
      if (!need.includes(m[1])) need.push(m[1]);
    }
    let simSrc = src;
    for (const name of need) {
      if (new RegExp(String.raw`Definir\s+\w+\s+${name}\b`, "i").test(simSrc)) continue;
      if (
        opt.insertText.includes(`, ${name}`) ||
        opt.insertText.includes(`,${name}`) ||
        opt.insertText.includes(`\${1:${name}}`)
      ) {
        const { afterLine, text } = buildDefinirInsertEdit(simSrc, line.lineNumber, name);
        extras.push(vscode.TextEdit.insert(new vscode.Position(afterLine + 1, 0), text));
        const lines = simSrc.replace(/\r\n/g, "\n").split("\n");
        lines.splice(afterLine + 1, 0, text.replace(/\n$/, ""));
        simSrc = lines.join("\n");
      }
    }
    if (extras.length) {
      item.additionalTextEdits = extras;
    }
    return item;
  });

  return new vscode.CompletionList(items, false);
}

function maskCompletion(
  line: vscode.TextLine,
  position: vscode.Position
): vscode.CompletionList | null {
  if (!/\bFormatarData\s*\(/i.test(line.text)) return null;

  const text = line.text;
  let inString = false;
  let strStart = -1;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '"' && text[i - 1] !== "\\") {
      if (!inString) {
        inString = true;
        strStart = i;
      } else {
        const strEnd = i;
        if (position.character > strStart && position.character <= strEnd) {
          const mask = text.slice(strStart + 1, strEnd);
          const opts = formatarDataMaskOptions(mask);
          if (!opts) return null;
          const range = new vscode.Range(
            line.lineNumber,
            strStart,
            line.lineNumber,
            strEnd + 1
          );
          const items = opts.map((opt) => {
            const item = new vscode.CompletionItem(
              opt.label,
              vscode.CompletionItemKind.Value
            );
            item.detail = `LSP · ${opt.detail}`;
            item.insertText = opt.insertText;
            item.range = range;
            item.sortText = opt.sortKey;
            item.preselect = true;
            item.filterText = `${mask} dd/mm/yyyy ${opt.label}`;
            return item;
          });
          return new vscode.CompletionList(items, false);
        }
        inString = false;
      }
    }
  }
  return null;
}

function definirCompletion(
  document: vscode.TextDocument,
  position: vscode.Position,
  word: string,
  wordRange: vscode.Range
): vscode.CompletionItem | null {
  if (!/^(va|vn|vd|vl)[A-Za-z_]\w*$|^Cur_[A-Za-z_]\w*$/i.test(word)) {
    return null;
  }
  const hits = analyzeLsp(document.getText());
  const sem =
    hits.find(
      (h) =>
        h.id === "SEM001" &&
        h.line === position.line &&
        h.startCol !== undefined &&
        h.startCol <= wordRange.start.character &&
        (h.endCol ?? 0) >= wordRange.end.character
    ) ||
    hits.find((h) => h.id === "SEM001" && new RegExp(`'${word}'`, "i").test(h.message));

  if (!sem) {
    if (!/\bDefinir\s+/i.test(document.getText())) return null;
    if (new RegExp(String.raw`Definir\s+\w+\s+${word}\b`, "i").test(document.getText())) {
      return null;
    }
  }

  const tipo = tipoFromPrefix(word);
  const { afterLine, text } = buildDefinirInsertEdit(document.getText(), position.line, word);
  const item = new vscode.CompletionItem(
    definirStatement(word),
    vscode.CompletionItemKind.Keyword
  );
  item.detail = `LSP · inserir Definir ${tipo} após declarações`;
  item.documentation = new vscode.MarkdownString(
    `Insere \`${definirStatement(word)}\` no bloco de declarações.`
  );
  item.filterText = `${word} Definir`;
  item.sortText = completionSortText("other", definirStatement(word), word);
  item.preselect = true;
  item.range = wordRange;
  item.insertText = word;
  item.additionalTextEdits = [
    vscode.TextEdit.insert(new vscode.Position(afterLine + 1, 0), text),
  ];
  return item;
}

/**
 * Espelha QFs de TODOS os alertas grifados na linha (Ctrl+Espaço).
 * filterText inclui a palavra sob o cursor para o VS Code não esconder o item.
 *
 * VS Code exige que `CompletionItem.range` contenha a posição do completion.
 * Range em col 0 + insertText="" com cursor em `SQL_|Criar` apaga `SQL_` → `Criar(...)`.
 */
function quickFixCompletions(
  document: vscode.TextDocument,
  line: vscode.TextLine,
  word: string,
  wordRange: vscode.Range,
  position: vscode.Position
): vscode.CompletionItem[] {
  const src = document.getText();
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const uri = document.uri.toString();
  const hits = filterSuppressedHits(
    uri,
    lines,
    analyzeLsp(src).filter((h) => h.line === line.lineNumber)
  );
  const items: vscode.CompletionItem[] = [];

  // Literal longo / dentro de aspas: range zero no cursor. Ambos SEM001 e SYN009
  // usam pushCommandFix (mesmo mecanismo) — additionalTextEdits vs command fazia
  // o suggest mostrar só o Definir; e additionalTextEdits com \\n escondia o SYN009.
  const inString =
    (line.text.slice(0, position.character).match(/"/g) || []).length % 2 === 1;
  const longToken = word.length > 48 || inString;
  const qfInsert = longToken ? "" : word;
  const qfRange = longToken
    ? new vscode.Range(position, position)
    : wordRange;
  const lineKeys = (line.text.match(/\b(?:va|vn|vd|vl|Cur_)[A-Za-z_]\w*/gi) || [])
    .slice(0, 6)
    .join(" ");
  const filterWord = [word || "_", lineKeys].filter(Boolean).join(" ");
  const filterLine = line.text.length > 64 ? line.text.slice(0, 48) : line.text;
  const hasSyn009 = hits.some((h) => h.id === "SYN009");

  const pushLineFix = (
    label: string,
    detail: string,
    insertText: string,
    sortText: string,
    extras: vscode.TextEdit[] = [],
    preselect = false,
    asSnippet = false
  ) => {
    const item = new vscode.CompletionItem(label, vscode.CompletionItemKind.Issue);
    item.detail = detail;
    if (asSnippet) {
      item.insertText = new vscode.SnippetString(insertText);
    } else {
      item.insertText = insertText;
    }
    item.range = line.range;
    item.sortText = sortText;
    item.filterText = `${filterWord} ${label} ${detail} ${filterLine}`;
    if (preselect) item.preselect = true;
    // extras NÃO podem sobrepor line.range (senão o VS Code corrompe o texto)
    if (extras.length) item.additionalTextEdits = extras;
    const docText = insertText.replace(/\$\{\d+:([^}]+)\}/g, "<$1>");
    item.documentation = new vscode.MarkdownString("```lsp\n" + docText + "\n```");
    items.push(item);
  };

  /**
   * QF que só altera outras posições: primary = no-op no wordRange (contém o cursor).
   * additionalTextEdits NÃO podem sobrepor wordRange / a linha do cursor.
   */
  const pushQfEditsOnly = (
    label: string,
    detail: string,
    sortText: string,
    edits: vscode.TextEdit[],
    filterExtra = ""
  ) => {
    const item = new vscode.CompletionItem(label, vscode.CompletionItemKind.Issue);
    item.detail = detail;
    item.insertText = qfInsert;
    item.range = qfRange;
    item.additionalTextEdits = edits;
    item.sortText = sortText;
    item.filterText = `${filterWord} ${filterExtra} ${label} ${filterLine}`;
    item.preselect = true;
    items.push(item);
  };

  /**
   * QF multi-linha / doc inteiro via command (Ctrl+Espaço).
   * Primary = no-op no cursor (bate o filtro); edits reais no command.
   */
  const pushCommandFix = (
    label: string,
    detail: string,
    sortText: string,
    edits: SerializedTextEdit[],
    filterExtra = "",
    preselect = true
  ) => {
    if (!edits.length) return;
    // Keyword: Issue some no Cursor quando há outro Keyword (Definir) na lista.
    const item = new vscode.CompletionItem(label, vscode.CompletionItemKind.Keyword);
    item.detail = detail;
    item.insertText = qfInsert;
    item.range = qfRange;
    item.sortText = sortText;
    item.filterText = `${filterWord} ${label} ${filterExtra} ${filterLine}`;
    if (preselect) item.preselect = true;
    item.command = {
      command: APPLY_TEXT_EDITS_CMD,
      title: label,
      arguments: [uri, edits],
    };
    const preview = edits.map((e) => e.newText).join("\n").slice(0, 400);
    item.documentation = new vscode.MarkdownString(
      "```lsp\n" + preview + (preview.length >= 400 ? "\n…" : "") + "\n```"
    );
    items.push(item);
  };

  /** Substitui o documento inteiro — só via command (range multi-linha quebra o suggest). */
  const pushWholeDocFix = (
    label: string,
    detail: string,
    next: string,
    sortText: string,
    filterExtra = ""
  ) => {
    pushCommandFix(
      label,
      detail,
      sortText,
      [serializeFullDocumentReplace(document, next)],
      filterExtra
    );
  };

  for (const hit of hits) {
    if (hit.id === "FUN007") {
      const name = hit.message.match(/Função '(\w+)'/i)?.[1];
      if (name) {
        const next = applyFun007InsertImpl(src, name);
        if (next && next !== src) {
          pushWholeDocFix(
            `QF: Implementar Funcao ${name}`,
            "LSP · FUN007 — stub Funcao … { }",
            next,
            "00_QF_FUN007",
            `Funcao ${name} FUN007`
          );
        }
      }
      continue;
    }
    if (hit.id === "FUN008") {
      const name = hit.message.match(/Função '(\w+)'/i)?.[1];
      if (name) {
        const next = applyFun008InsertDecl(src, name);
        if (next && next !== src) {
          pushWholeDocFix(
            `QF: Definir Funcao ${name}`,
            "LSP · FUN008 — inserir declaração",
            next,
            "00_QF_FUN008",
            `Definir Funcao ${name} FUN008`
          );
        }
      }
      continue;
    }
    if (hit.id === "FUN001") {
      const opt = truncarRewriteOptions(line.text)[0];
      if (opt) {
        pushLineFix(`QF: ${opt.label}`, opt.detail, opt.insertText, "00_QF_FUN001", [], true);
      }
      continue;
    }
    if (hit.id === "FUN003") {
      const info = findFun003VdArg(line.text);
      const fixed = applyFun003Fix(line.text);
      if (info && fixed !== line.text) {
        const extras: vscode.TextEdit[] = [];
        if (!isDefined(src, info.to)) {
          const { afterLine, text } = buildDefinirInsertEdit(src, line.lineNumber, info.to);
          extras.push(vscode.TextEdit.insert(new vscode.Position(afterLine + 1, 0), text));
        }
        pushLineFix(
          `QF: ${info.from} → ${info.to}`,
          extras.length
            ? `EstaNulo(${info.to}, …) + ${definirStatement(info.to)}`
            : `EstaNulo(${info.to}, …)`,
          fixed,
          "00_QF_FUN003",
          extras,
          true
        );
      }
      continue;
    }
    if (hit.id === "FUN004") {
      const info = findFun004PArg(line.text);
      const fixed = applyFun004Fix(line.text);
      if (info && fixed !== line.text) {
        const extras: vscode.TextEdit[] = [];
        if (!isDefined(src, info.to)) {
          const { afterLine, text } = buildDefinirInsertEdit(src, line.lineNumber, info.to);
          extras.push(vscode.TextEdit.insert(new vscode.Position(afterLine + 1, 0), text));
        }
        pushLineFix(
          `QF: ${info.from} → ${info.to}`,
          extras.length
            ? `${info.to} + ${definirStatement(info.to)}`
            : `destino local ${info.to}`,
          fixed,
          "00_QF_FUN004",
          extras,
          true
        );
      }
      continue;
    }
    if (hit.id === "FUN005") {
      for (const opt of arredondarRewriteOptions(line.text).slice(0, 3)) {
        if (/=\s*Arredonda/i.test(opt.insertText)) continue;
        pushLineFix(
          `QF: ${opt.label}`,
          opt.detail,
          opt.insertText,
          `00_QF_${opt.sortKey}`,
          [],
          opt.sortKey === "01",
          !!opt.isSnippet
        );
      }
      continue;
    }
    if (hit.id === "FUN006") {
      const m = line.text.match(/\b(Arredonda(?:ABNT)?)\s*\(\s*([^,)]+)\s*\)\s*;/i);
      if (m) {
        const fn = m[1];
        const valor = m[2].trim();
        const snippet = `${fn}(${valor}, \${1:vnDecimais});`;
        const extras: vscode.TextEdit[] = [];
        if (!isDefined(src, "vnDecimais")) {
          const { afterLine, text } = buildDefinirInsertEdit(src, line.lineNumber, "vnDecimais");
          extras.push(vscode.TextEdit.insert(new vscode.Position(afterLine + 1, 0), text));
        }
        pushLineFix(
          `QF: ${fn}(${valor}, <vnDecimais>)`,
          "2º param Decimais pendente — Tab para preencher (numeral ou vn*)",
          snippet,
          "00_QF_FUN006",
          extras,
          true,
          true
        );
      }
      continue;
    }
    if (hit.id === "RUL019") {
      for (const code of ["1", "2", "3"] as const) {
        const fixed = applyRul019Fix(line.text, code);
        if (fixed === line.text) continue;
        const titles = {
          "1": "Cancel(1); — interromper regra",
          "2": "Cancel(2); — relatório ValStr/ValRet",
          "3": "Cancel(3); — fórmula relatório",
        };
        pushLineFix(
          `QF: ${titles[code]}`,
          "LSP · RUL019 — Cancel só 1|2|3",
          fixed,
          `00_QF_RUL019_${code}`,
          [],
          code === "1"
        );
      }
      continue;
    }
    if (hit.id === "SEM001" && hit.startCol !== undefined && hit.endCol !== undefined) {
      const name = line.text.slice(hit.startCol, hit.endCol);
      if (/^(va|vn|vd|vl|Cur_)/i.test(name) && !isDefined(src, name)) {
        const { afterLine, text } = buildDefinirInsertEdit(src, line.lineNumber, name);
        pushCommandFix(
          `QF: ${definirStatement(name)}`,
          "LSP · Quick Fix SEM001",
          hasSyn009 ? "00_QF_SEM001_b" : "00_QF_SEM001",
          [
            serializeTextEdit(
              vscode.TextEdit.insert(new vscode.Position(afterLine + 1, 0), text)
            ),
          ],
          `${name} Definir SEM001`,
          !hasSyn009
        );
      }
      continue;
    }

    if (hit.id === "SEM004") {
      const info = findSem004Usage(line.text, hit.startCol, hit.endCol);
      if (info) {
        const afterLine = findSem004InsertAfterLine(src, info.list, line.lineNumber);
        const indent =
          document.lineAt(Math.max(0, afterLine)).text.match(/^(\s*)/)?.[1] ?? "";
        const insert = sem004AdicionarCampoLine(info.list, info.field, info.tipo, indent);
        pushQfEditsOnly(
          `QF: ${info.list}.AdicionarCampo("${info.field}", ${info.tipo});`,
          "LSP · SEM004 — declarar campo da lista",
          "00_QF_SEM004",
          [vscode.TextEdit.insert(new vscode.Position(afterLine + 1, 0), insert)],
          "AdicionarCampo SEM004"
        );
      }
      continue;
    }

    if (hit.id === "SQL002") {
      const info = findSql002Criar(line.text);
      const insert = sql002DestruirInsert(line.text);
      if (info && insert) {
        const after = findSql002DestruirAfterLine(document.getText(), info.handle, line.lineNumber);
        if (after >= 0) {
          pushQfEditsOnly(
            `QF: SQL_Destruir(${info.handle}); (final)`,
            "LSP · SQL002 — destruir cursor SQL ao final do uso",
            "00_QF_SQL002",
            [vscode.TextEdit.insert(new vscode.Position(after + 1, 0), insert)],
            "SQL_Destruir SQL002"
          );
        }
      }
      continue;
    }

    if (hit.id === "SQL003") {
      const info = findSql003Abrir(line.text);
      const insert = sql003FecharInsert(line.text);
      if (info && insert) {
        const pos = findSql003FecharInsertPos(document.getText(), info.handle, line.lineNumber);
        if (pos) {
          const insertAt =
            "beforeLine" in pos
              ? new vscode.Position(pos.beforeLine, 0)
              : new vscode.Position(pos.afterLine + 1, 0);
          pushQfEditsOnly(
            `QF: SQL_FecharCursor(${info.handle});`,
            "LSP · SQL003 — fechar cursor SQL",
            "00_QF_SQL003",
            [vscode.TextEdit.insert(insertAt, insert)],
            "SQL_FecharCursor SQL003"
          );
          if (
            !isDefinirCursorHandle(document.getText(), info.handle) &&
            !new RegExp(String.raw`SQL_EOF\s*\(\s*${info.handle}\s*\)`, "i").test(src)
          ) {
            const loop = sqlEnquantoLoopInsert(info.handle, info.indent);
            pushQfEditsOnly(
              `QF: Enquanto (SQL_EOF(${info.handle}) = 0)`,
              "LSP · percorrer cursor completo",
              "00_QF_SQL003_loop",
              [vscode.TextEdit.insert(new vscode.Position(line.lineNumber + 1, 0), loop)],
              "Enquanto SQL_EOF"
            );
          }
        }
      }
      continue;
    }

    if (hit.id === "SQL004") {
      const info = findSqlHandleCall(line.text, "SQL_Criar");
      if (info) {
        const next = applySql004SourceFix(document.getText(), info.handle);
        if (next && next !== document.getText()) {
          const newName = suggestedPrefixedName("alfa", info.handle) ?? info.handle;
          pushWholeDocFix(
            newName !== info.handle
              ? `QF: Definir Alfa ${newName} + renomear`
              : `QF: Definir Alfa ${info.handle}`,
            "LSP · SQL004 — Alfa + prefixo va* em todo o arquivo",
            next,
            "00_QF_SQL004",
            "Definir Alfa SQL004"
          );
        }
      }
      continue;
    }

    if (hit.id === "SQL005") {
      const info = findSqlHandleCall(line.text, "SQL_AbrirCursor");
      const docSrc = document.getText();
      if (info && !isDefinirCursorHandle(docSrc, info.handle)) {
        const insert = sql005DefinirComandoInsert(line.text);
        if (insert) {
          pushQfEditsOnly(
            `QF: SQL_DefinirComando(${info.handle}, vaSql);`,
            "LSP · SQL005 — definir comando antes de abrir",
            "00_QF_SQL005",
            [vscode.TextEdit.insert(new vscode.Position(line.lineNumber, 0), insert)],
            "SQL_DefinirComando SQL005"
          );
        }
        if (!new RegExp(String.raw`SQL_EOF\s*\(\s*${info.handle}\s*\)`, "i").test(docSrc)) {
          const loop = sqlEnquantoLoopInsert(info.handle, info.indent);
          pushQfEditsOnly(
            `QF: Enquanto (SQL_EOF(${info.handle}) = 0)`,
            "LSP · percorrer cursor completo",
            "00_QF_SQL005_loop",
            [vscode.TextEdit.insert(new vscode.Position(line.lineNumber + 1, 0), loop)],
            "Enquanto SQL_EOF"
          );
        }
      }
      continue;
    }

    if (hit.id === "SQL006") {
      const next = applySql006MoveUsarBeforeComando(document.getText(), line.lineNumber);
      if (next) {
        pushWholeDocFix(
          "QF: Mover SQL_Usar* antes de DefinirComando",
          "LSP · SQL006",
          next,
          "00_QF_SQL006",
          "SQL_UsarSQLSenior2 SQL006"
        );
      }
      continue;
    }

    if (hit.id === "SQL007") {
      const info = findSqlHandleCall(line.text, "SQL_DefinirComando");
      const insert = sql007CriarInsert(line.text);
      if (info && insert && !isDefinirCursorHandle(document.getText(), info.handle)) {
        pushQfEditsOnly(
          `QF: SQL_Criar(${info.handle});`,
          "LSP · SQL007 — criar cursor antes do comando",
          "00_QF_SQL007",
          [vscode.TextEdit.insert(new vscode.Position(line.lineNumber, 0), insert)],
          "SQL_Criar SQL007"
        );
      }
      continue;
    }

    if (hit.id === "SQL009") {
      const docSrc = document.getText();
      const scaffold = applySql009ScaffoldFix(line.text, docSrc);
      if (scaffold) {
        pushLineFix(
          "QF: Expandir esqueleto do modo correto (SQL009)",
          "LSP · SQL009 — Cursor simples × completo",
          scaffold,
          "00_QF_SQL009",
          [],
          true
        );
      }
      const fixed = applySql009LineFix(line.text, docSrc);
      if (fixed !== null) {
        if (fixed === "") {
          const end =
            line.lineNumber + 1 < document.lineCount
              ? new vscode.Position(line.lineNumber + 1, 0)
              : line.range.end;
          pushQfEditsOnly(
            "QF: Remover chamada incompatível (SQL009)",
            "LSP · SQL009 — não misturar API de cursor",
            scaffold ? "01_QF_SQL009_line" : "00_QF_SQL009",
            [vscode.TextEdit.delete(new vscode.Range(line.range.start, end))],
            "SQL009"
          );
        } else {
          pushLineFix(
            `QF: Só converter → ${fixed.trim()}`,
            "LSP · SQL009 — não misturar API de cursor",
            fixed,
            scaffold ? "01_QF_SQL009_line" : "00_QF_SQL009",
            [],
            !scaffold
          );
        }
      }
      continue;
    }

    if (hit.id === "SQL008" || hit.id === "SQL011") {
      const info = findSqlHandleCall(line.text, "SQL_DefinirComando");
      if (info) {
        const missing = sql008MissingFlags(document.getText(), info.handle, line.lineNumber);
        const insert = sql008NativeInsert(line.text, missing);
        if (insert) {
          pushQfEditsOnly(
            `QF: UsarAbrangencia/UsarSQLSenior2(${info.handle}, 0)`,
            hit.id === "SQL011"
              ? "LSP · SQL011 — agregação no SELECT exige SQL nativo"
              : "LSP · SQL008 — SQL nativo (JOIN/subquery)",
            hit.id === "SQL011" ? "00_QF_SQL011" : "00_QF_SQL008",
            [vscode.TextEdit.insert(new vscode.Position(line.lineNumber, 0), insert)],
            "SQL_UsarSQLSenior2 SQL008 SQL011"
          );
        }
      }
      continue;
    }

    if (hit.id === "SYN006" || hit.id === "RUL008") {
      const defM = line.text.match(/^(\s*)Definir\s+(Alfa|Numero|Data|Lista|Cursor)\s+(\w+)\b/i);
      if (defM) {
        const tipo = defM[2];
        const nome = defM[3];
        const nextRename = applyPrefixRenameSourceFix(document.getText(), tipo, nome);
        const newName = suggestedPrefixedName(tipo, nome);
        if (nextRename && newName) {
          pushWholeDocFix(
            `QF: Renomear ${nome} → ${newName}`,
            `LSP · ${hit.id} — alinhar prefixo ao tipo ${tipo}`,
            nextRename,
            `00_QF_${hit.id}_rename`,
            `${newName} ${hit.id}`
          );
        }
        const nextTipo = applyPrefixChangeTypeFix(document.getText(), tipo, nome);
        const newTipo = suggestedTipoFromPrefix(nome);
        if (nextTipo && newTipo) {
          pushWholeDocFix(
            `QF: Definir ${newTipo} ${nome}`,
            `LSP · ${hit.id} — alinhar tipo ao prefixo de ${nome}`,
            nextTipo,
            `00_QF_${hit.id}_tipo`,
            `${newTipo} ${hit.id}`
          );
        }
      }
      continue;
    }

    if (hit.id === "SYN005") {
      const next = applySyn005MoveDefinir(document.getText(), line.lineNumber);
      if (next) {
        pushWholeDocFix(
          "QF: Mover Definir para o início",
          "LSP · SYN005 — Definir antes das instruções",
          next,
          "00_QF_SYN005",
          "Definir SYN005"
        );
      }
      continue;
    }

    if (hit.id === "SYN007") {
      const closed = applySyn007CloseCommentLine(line.text);
      if (closed !== line.text) {
        pushLineFix(
          "QF: Fechar comentário */",
          "LSP · SYN007 — fechar /* … */",
          closed,
          "00_QF_SYN007",
          [],
          true
        );
      }
      continue;
    }

    if (hit.id === "SYN011") {
      const next = applySyn011ToBlockComment(document.getText(), line.lineNumber);
      if (next) {
        pushWholeDocFix(
          "QF: Converter @ multi-linha em /* … */",
          "LSP · SYN011 — @ só na mesma linha",
          next,
          "00_QF_SYN011",
          "comentario SYN011"
        );
      }
      continue;
    }

    if (hit.id === "SYN004") {
      // insertText ≠ "Inicio" → suggest some; aplicar via command (noop + edits).
      const edits = syn004PairLineEdits(document.getText(), line.lineNumber);
      if (edits && edits.length) {
        pushCommandFix(
          "QF: Converter par Inicio…Fim; → { … }",
          "LSP · SYN004 — blocos com chaves",
          "00_QF_SYN004",
          edits.map((e) => serializeLineReplace(document, e.line, e.text)),
          "Inicio Fim SYN004"
        );
      } else {
        const fixed = applySyn004InicioFim(line.text);
        if (fixed !== line.text) {
          pushLineFix(
            `QF: ${fixed.trim()}`,
            "LSP · SYN004 — blocos com chaves",
            fixed,
            "00_QF_SYN004",
            [],
            true
          );
        }
      }
      continue;
    }

    if (hit.id === "SYN009") {
      const fixed = applySyn009BreakString(line.text);
      if (fixed === line.text) continue;
      // Não embutir o literal quebrado em insertText/command.args/docs — o suggest do Cursor
      // descarta o item. Só uri+linha; o comando relê e aplica.
      const item = new vscode.CompletionItem(
        "QF: Quebrar literal longo (SYN009)",
        vscode.CompletionItemKind.Keyword
      );
      item.detail = "LSP · SYN009 — inserir \\ ~coluna 80";
      item.insertText = qfInsert;
      item.range = qfRange;
      item.sortText = "00_QF_SYN009_a";
      item.filterText = `${filterWord} Quebrar SYN009`;
      item.preselect = true;
      item.command = {
        command: APPLY_SYN009_CMD,
        title: "QF: Quebrar literal longo (SYN009)",
        arguments: [uri, line.lineNumber],
      };
      items.push(item);
      continue;
    }

    if (hit.id === "SYN010") {
      const end =
        line.lineNumber + 1 < document.lineCount
          ? new vscode.Position(line.lineNumber + 1, 0)
          : line.range.end;
      // Primary = apagar a linha (range contém o cursor). Sem additionalTextEdits.
      const del = new vscode.CompletionItem(
        "QF: Remover instrução inválida",
        vscode.CompletionItemKind.Issue
      );
      del.detail = "LSP · SYN010 — falta valor, expressão ou comando";
      del.insertText = "";
      del.range = new vscode.Range(line.range.start, end);
      del.sortText = "00_QF_SYN010";
      del.filterText = `${filterWord} SYN010 ${filterLine}`;
      del.preselect = true;
      items.push(del);
      const stub = applySyn010DefinirStub(line.text);
      if (stub) {
        pushLineFix(
          `QF: ${stub.trim()}`,
          "LSP · SYN010 — converter tipo solto em Definir",
          stub,
          "01_QF_SYN010_definir",
          [],
          false
        );
      }
      continue;
    }

    if (hit.id === "SEM002") {
      const info = findSem002FileOpen(line.text);
      const fechar = sem002FecharInsert(line.text);
      if (info && fechar) {
        pushQfEditsOnly(
          `QF: Fechar(${info.handle});`,
          "LSP · SEM002 — fechar arquivo",
          "00_QF_SEM002",
          [vscode.TextEdit.insert(new vscode.Position(line.lineNumber + 1, 0), fechar)],
          "Fechar SEM002"
        );
      }
      const complete = applySem002CompleteFix(line.text);
      if (info && complete !== line.text) {
        pushLineFix(
          `QF: Completar arquivo (Abrir + Fechar)`,
          `LSP · SEM002`,
          complete,
          "00_QF_SEM002_complete",
          [],
          false
        );
      }
      continue;
    }

    if (hit.id === "SEM003") {
      const info = findSem003Cursor(line.text);
      const fechar = sem003FecharInsert(line.text);
      if (info && fechar) {
        pushQfEditsOnly(
          `QF: ${info.name}.FecharCursor();`,
          "LSP · SEM003 — fechar cursor",
          "00_QF_SEM003",
          [vscode.TextEdit.insert(new vscode.Position(line.lineNumber + 1, 0), fechar)],
          "FecharCursor SEM003"
        );
      }
      const complete = applySem003CompleteFix(line.text);
      if (info && complete !== line.text) {
        pushLineFix(
          `QF: Completar cursor (Enquanto + FecharCursor)`,
          `LSP · SEM003`,
          complete,
          "00_QF_SEM003_complete",
          [],
          false
        );
      }
      continue;
    }

    // RUL*/SYN004/FUN002 via catálogo LINE_FIXERS
    if (hit.id === "RUL001") {
      const next = applyRul001DocumentFix(src);
      if (next !== src) {
        pushWholeDocFix(
          findRul001Param(line.text)
            ? "QF: Remover param ilegal em decl+impl + Definir global"
            : "QF: Declarar params como Numero (decl+impl)",
          "LSP · RUL001 — corrige Definir Funcao e Funcao",
          next,
          "00_QF_RUL001",
          "RUL001 Numero assinatura"
        );
      }
      continue;
    }
    const fixer = LINE_FIXERS.find((f) => f.id === hit.id);
    if (fixer) {
      const fixed = fixer.apply(line.text);
      if (fixed !== line.text) {
        const extras: vscode.TextEdit[] = [];
        let simSrc = src;
        const extraNames = newVarsFromFix(hit.id, fixed);
        for (const name of extraNames) {
          if (isDefined(simSrc, name)) continue;
          const { afterLine, text } = buildDefinirInsertEdit(simSrc, line.lineNumber, name);
          extras.push(vscode.TextEdit.insert(new vscode.Position(afterLine + 1, 0), text));
          const lines = simSrc.replace(/\r\n/g, "\n").split("\n");
          lines.splice(afterLine + 1, 0, text.replace(/\n$/, ""));
          simSrc = lines.join("\n");
        }
        pushLineFix(
          `QF: ${fixer.title}`,
          `LSP · ${hit.id}`,
          fixed,
          `00_QF_${hit.id}`,
          extras,
          true
        );
      }
      if (hit.id === "RUL015") {
        const monta = applyRul015MontaDataFix(line.text);
        if (monta !== line.text) {
          pushLineFix(
            "QF: MontaData(dia, mes, ano, vd)",
            "LSP · RUL015 alternativa (4º param = destino)",
            monta,
            "00_QF_RUL015_monta",
            [],
            false
          );
        }
      }
    }

    if (isSuppressible(hit.id) && !isLineSuppressed(uri, hit.id, line.text)) {
      const item = new vscode.CompletionItem(
        `Ignorar alerta ${hit.id}`,
        vscode.CompletionItemKind.Issue
      );
      item.detail = `LSP · silencia ${hit.id} sem alterar o código`;
      item.insertText = qfInsert;
      item.range = qfRange;
      item.sortText = `01_IGNORE_${hit.id}`;
      item.filterText = `${filterWord} ${filterLine} Ignorar ${hit.id}`;
      item.command = {
        command: IGNORE_DIAGNOSTIC_CMD,
        title: `Ignorar ${hit.id}`,
        arguments: [uri, hit.id, line.text],
      };
      items.push(item);
    }
  }
  return items;
}

function functionCompletionItems(
  word: string,
  wordRange: vscode.Range,
  system: string = ""
): vscode.CompletionItem[] {
  if (!word || word.length < 1) return [];
  const fromCatalog = (
    system ? functionsMatchingPrefixForSystem(word, system) : functionsMatchingPrefix(word)
  ).filter((e) => e.kind !== "keyword");

  const items: vscode.CompletionItem[] = [];
  for (const e of fromCatalog) {
    const item = new vscode.CompletionItem(e.label, toKind(e.kind === "keyword" ? "keyword" : "function"));
    item.detail = `LSP · ${e.detail}`;
    item.documentation = new vscode.MarkdownString(e.documentation ?? e.detail);
    item.filterText = e.label;
    item.range = wordRange;
    if (e.isSnippet) {
      item.insertText = new vscode.SnippetString(e.insertText);
    } else {
      item.insertText = e.insertText;
    }
    item.sortText = completionSortText("function", e.label, word);
    items.push(item);
  }
  return items;
}

/** Comandos / keywords / tipos (Definir, Se, Alfa, …) no prefixo digitado. */
function commandCompletionItems(word: string, wordRange: vscode.Range): vscode.CompletionItem[] {
  if (!word || word.length < 1) return [];
  const items: vscode.CompletionItem[] = [];
  for (const seed of getStructuralSeedsMatching(word)) {
    const item = new vscode.CompletionItem(seed.label, toKind(seed.kind));
    item.detail = `LSP · ${seed.detail}`;
    item.documentation = new vscode.MarkdownString(seed.documentation ?? seed.detail);
    item.filterText = seed.label;
    item.range = wordRange;
    if (seed.isSnippet) {
      item.insertText = new vscode.SnippetString(seed.insertText);
    } else {
      item.insertText = seed.insertText;
    }
    item.sortText = completionSortText("command", seed.label, word);
    items.push(item);
  }
  return items;
}

function customSymbolCompletions(
  word: string,
  wordRange: vscode.Range,
  functions: (CustomFunctionSymbol & { uri?: string; fileName?: string })[],
  variables: { name: string; tipo: string; scope: string; fileName?: string }[],
  currentUri: string
): vscode.CompletionItem[] {
  const p = word.toLowerCase();
  const items: vscode.CompletionItem[] = [];

  const seenVar = new Set<string>();
  for (const v of variables) {
    if (p && !v.name.toLowerCase().startsWith(p)) continue;
    const key = v.name.toLowerCase();
    if (seenVar.has(key)) continue;
    seenVar.add(key);
    const item = new vscode.CompletionItem(v.name, vscode.CompletionItemKind.Variable);
    const where =
      v.scope === "file"
        ? v.fileName
          ? `projeto · ${v.fileName}`
          : "local · arquivo"
        : `param · ${v.scope}`;
    item.detail = `LSP · ${v.tipo} · ${where}`;
    item.filterText = v.name;
    item.range = wordRange;
    item.insertText = v.name;
    item.sortText = completionSortText("variable", v.name, word);
    items.push(item);
  }

  for (const fn of functions) {
    if (p && !fn.name.toLowerCase().startsWith(p)) continue;
    const item = new vscode.CompletionItem(fn.name, vscode.CompletionItemKind.Function);
    const remote = fn.uri && fn.uri !== currentUri;
    item.detail = remote
      ? `LSP · customizada · ${fn.fileName ?? "projeto"}`
      : "LSP · customizada · local";
    item.documentation = new vscode.MarkdownString(markdownForFunction(fn));
    item.filterText = fn.name;
    item.range = wordRange;
    item.insertText = new vscode.SnippetString(callSnippetFor(fn));
    item.sortText = completionSortText("function", fn.name, word);
    items.push(item);
  }

  return items;
}

export function createLspCompletionProvider(): vscode.CompletionItemProvider {
  return {
    async provideCompletionItems(document, position) {
      const line = document.lineAt(position);
      const linePrefix = line.text.slice(0, position.character);
      const quotes = (linePrefix.match(/"/g) || []).length;
      const rawWordRange =
        document.getWordRangeAtPosition(position, /[A-Za-z_][\w]*/) ??
        new vscode.Range(position, position);
      const rawWord = document.getText(rawWordRange);
      // Dentro de literal / token gigante: zera a palavra do filtro senão o suggest
      // exige casar AAA… e esconde QFs (exceto SEM001 que repetia o token no filter).
      const inStringOrLong = quotes % 2 === 1 || rawWord.length > 48;
      const wordRange = inStringOrLong
        ? new vscode.Range(position, position)
        : rawWordRange;
      const word = inStringOrLong ? "" : rawWord;

      const memberSuggestions = completeMembersAt(document.getText(), linePrefix);
      if (memberSuggestions.length) {
        const memberItems = memberSuggestions.map((m) => {
          const kind =
            m.kind === "method"
              ? vscode.CompletionItemKind.Method
              : vscode.CompletionItemKind.Property;
          const item = new vscode.CompletionItem(m.name, kind);
          item.detail = m.detail;
          item.documentation = new vscode.MarkdownString(m.documentation);
          item.sortText = m.name.toLowerCase();
          if (m.isSnippet) {
            item.insertText = new vscode.SnippetString(m.insertText);
          } else {
            item.insertText = m.insertText;
          }
          return item;
        });
        return new vscode.CompletionList(memberItems, false);
      }

      const qfItems = quickFixCompletions(document, line, word, wordRange, position);
      const lineHasAlerts = qfItems.length > 0;

      let system = "";
      try {
        const scoped = await getWorkspaceSymbolIndex().getScopedEligible(document);
        system = scoped.resolution.system ?? "";
      } catch {
        system = "";
      }
      const fnItems = functionCompletionItems(word, wordRange, system);
      const cmdItems = commandCompletionItems(word, wordRange);

      let customItems: vscode.CompletionItem[] = [];
      try {
        const idx = getWorkspaceSymbolIndex();
        const scoped = await idx.getScopedEligible(document);
        const merged = mergeEligible(scoped.local, scoped.peers, document.uri.toString());
        const localSym = await idx.getSymbols(document.uri, document.getText());
        const vars: { name: string; tipo: string; scope: string; fileName?: string }[] =
          localSym.variables.map((v) => ({
            name: v.name,
            tipo: v.tipo,
            scope: v.scope,
          }));

        for (const peerPath of scoped.resolution.peers) {
          const same =
            peerPath.replace(/\\/g, "/").toLowerCase() ===
            document.uri.fsPath.replace(/\\/g, "/").toLowerCase();
          if (same) continue;
          const uri = vscode.Uri.file(peerPath);
          const sym = await idx.getSymbols(uri);
          const base = peerPath.replace(/\\/g, "/").split("/").pop() ?? peerPath;
          for (const v of sym.variables) {
            if (v.scope !== "file") continue;
            vars.push({ name: v.name, tipo: v.tipo, scope: "file", fileName: base });
          }
        }

        customItems = customSymbolCompletions(
          word,
          wordRange,
          merged,
          vars,
          document.uri.toString()
        );
      } catch {
        customItems = [];
      }

      // QFs no fim da lista (não escondem vars/funções/comandos do prefixo).
      for (const q of qfItems) {
        const label = typeof q.label === "string" ? q.label : q.label.label;
        q.sortText = completionSortText("qf", label, word || "_");
      }

      if (quotes % 2 === 1) {
        const mask = maskCompletion(line, position);
        if (mask) {
          return new vscode.CompletionList([...mask.items, ...qfItems], false);
        }
        // Dialeto SQL Senior 2 dentro de literais (DefinirComando / .SQL / SELECT…)
        if (isSqlStringCompletionContext(line.text, linePrefix)) {
          const sqlPrefix = (linePrefix.match(/[A-Za-z_][A-Za-z0-9_]*$/) || [""])[0];
          const sqlRange =
            sqlPrefix.length > 0
              ? new vscode.Range(
                  position.line,
                  position.character - sqlPrefix.length,
                  position.line,
                  position.character
                )
              : new vscode.Range(position, position);
          const sqlItems = filterSenior2Completions(sqlPrefix).map((f, i) => {
            const item = new vscode.CompletionItem(
              f.name,
              f.category === "aggregate"
                ? vscode.CompletionItemKind.Keyword
                : vscode.CompletionItemKind.Function
            );
            item.detail = f.detail;
            if (f.documentation) {
              item.documentation = new vscode.MarkdownString(f.documentation);
            }
            item.insertText = new vscode.SnippetString(f.insertText);
            item.range = sqlRange;
            item.sortText = `0${String(i).padStart(3, "0")}_${f.name}`;
            item.filterText = `${sqlPrefix} ${f.name} Senior2 SQL`;
            return item;
          });
          // Operador de concatenação Senior 2
          if (!sqlPrefix || "||".startsWith(sqlPrefix)) {
            const concat = new vscode.CompletionItem(
              "||",
              vscode.CompletionItemKind.Operator
            );
            concat.detail = "SQL Senior 2 · concatenação de texto";
            concat.insertText = "||";
            concat.range = sqlRange;
            concat.sortText = "0999_concat";
            concat.filterText = `${sqlPrefix} || concat Senior2`;
            sqlItems.push(concat);
          }
          return new vscode.CompletionList([...sqlItems, ...qfItems], false);
        }
        // Só QFs da linha — incomplete:false evita o cliente refiltrar e sumir o SYN009.
        if (lineHasAlerts) {
          return new vscode.CompletionList(qfItems, false);
        }
        return [];
      }

      if (/^Arredond/i.test(word)) {
        const rewrite = rewriteItems(document, line, word, "arredondar");
        return new vscode.CompletionList(
          [...customItems, ...fnItems, ...cmdItems, ...rewrite.items, ...qfItems],
          false
        );
      }

      if (/^Truncar/i.test(word)) {
        const rewrite = rewriteItems(document, line, word, "truncar");
        return new vscode.CompletionList(
          [...customItems, ...fnItems, ...cmdItems, ...rewrite.items, ...qfItems],
          false
        );
      }

      // Após "E012FAM." — somente campos dessa tabela (sem builtins/funções/variáveis).
      if (isTableColumnCompletionContext(linePrefix)) {
        const catalogColRaw = localColumnCompletions(document.uri.fsPath, linePrefix);
        const catalogColItems = catalogColRaw.map((t, i) => {
          const item = new vscode.CompletionItem(t.label, vscode.CompletionItemKind.Field);
          item.insertText = t.insertText;
          item.detail = t.detail;
          if (t.documentation) item.documentation = t.documentation;
          item.sortText = completionSortText("other", t.label, word);
          const m = linePrefix.match(/([A-Za-z0-9_]*)$/);
          const suf = m?.[1]?.length ?? 0;
          item.range = new vscode.Range(
            position.line,
            position.character - suf,
            position.line,
            position.character
          );
          return item;
        });
        return new vscode.CompletionList(catalogColItems, false);
      }

      const defItem = definirCompletion(document, position, word, wordRange);
      const catalogColRaw = localColumnCompletions(document.uri.fsPath, linePrefix);
      const catalogColItems = catalogColRaw.map((t) => {
        const item = new vscode.CompletionItem(t.label, vscode.CompletionItemKind.Field);
        item.insertText = t.insertText;
        item.detail = t.detail;
        if (t.documentation) item.documentation = t.documentation;
        item.sortText = completionSortText("other", t.label, word);
        if (/\.\s*[A-Za-z0-9_]*$/.test(linePrefix)) {
          const m = linePrefix.match(/([A-Za-z0-9_]*)$/);
          const suf = m?.[1]?.length ?? 0;
          item.range = new vscode.Range(
            position.line,
            position.character - suf,
            position.line,
            position.character
          );
        } else {
          item.range = wordRange;
        }
        return item;
      });
      const catalogTableItems =
        word.length >= 1 && /^[A-Za-z_]/.test(word)
          ? localTableCompletions(word).map((t) => {
              const item = new vscode.CompletionItem(t.label, vscode.CompletionItemKind.Struct);
              item.detail = t.detail;
              if (t.documentation) {
                item.documentation = t.documentation;
              }
              item.range = wordRange;
              item.sortText = completionSortText("other", t.label, word);
              return item;
            })
          : [];

      // Ordem via sortText: match exato → vars → funções → comandos → outros → QFs.
      // Com alerta na linha (SYN010 em prefixo parcial etc.) NÃO esconder o catálogo.
      const base = [
        ...customItems,
        ...fnItems,
        ...cmdItems,
        ...(defItem ? [defItem] : []),
        ...catalogColItems,
        ...catalogTableItems,
        ...qfItems,
      ];

      if (
        fnItems.length ||
        cmdItems.length ||
        defItem ||
        customItems.length ||
        catalogTableItems.length ||
        catalogColItems.length ||
        qfItems.length
      ) {
        return new vscode.CompletionList(base, false);
      }

      return new vscode.CompletionList([], false);
    },
  };
}
