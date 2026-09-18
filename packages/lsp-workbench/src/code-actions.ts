import * as vscode from "vscode";
import {
  applyFun001Fix,
  applyFun003Fix,
  applyFun004Fix,
  applyFun005Fix,
  applyFun006Fix,
  applyRul015MontaDataFix,
  applyRul019Fix,
  applySem002CompleteFix,
  applySem003CompleteFix,
  applySql001Fix,
  findFun003VdArg,
  findFun004PArg,
  findRul001Param,
  findSem002FileOpen,
  findSem003Cursor,
  findSem004InsertAfterLine,
  findSem004Usage,
  applySql004SourceFix,
  applySql006MoveUsarBeforeComando,
  applySql009LineFix,
  applySql009ScaffoldFix,
  applyPrefixRenameSourceFix,
  applySyn005MoveDefinir,
  applySyn007CloseComment,
  applySyn010DefinirStub,
  applySyn004PairFix,
  applySyn004InicioFim,
  findSql002Criar,
  findSql003Abrir,
  findSql002DestruirAfterLine,
  findSql003FecharInsertPos,
  findSqlHandleCall,
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
} from "./quick-fixes";
import { arredondarRewriteOptions, truncarRewriteOptions } from "./rewrite-options";
import { buildDefinirInsertEdit, definirStatement } from "./definir-insert";
import { analyzeLsp, DiagnosticHit } from "./diagnostics";
import { SENIOR_LSP_LANGUAGE_ID } from "./language";
import { IGNORE_DIAGNOSTIC_CMD } from "./suppressions";
import { getWorkspaceSymbolIndex } from "./workspace-symbol-index";
import { applyImportCustomFunction } from "./import-function";
import { applyFun007InsertImpl, applyFun008InsertDecl } from "./document-symbols";
import { APPLY_TEXT_EDITS_CMD, serializeFullDocumentReplace } from "./apply-edits";

function definedNames(source: string): Set<string> {
  const set = new Set<string>();
  for (const m of source.matchAll(/^\s*Definir\s+(?:Alfa|Numero|Data|Lista|Cursor)\s+(\w+)/gim)) {
    set.add(m[1].toLowerCase());
  }
  return set;
}

/** Remove sintaxe de snippet VS Code para WorkspaceEdit. */
function plainText(text: string): string {
  return text.replace(/\$\{\d+:([^}]+)\}/g, "$1");
}

function newVarsInText(text: string, source: string): string[] {
  const defined = definedNames(source);
  const plain = plainText(text);
  const found: string[] = [];
  for (const m of plain.matchAll(/\b(vnCasas|vnTipoAcerto|vnDecimais|vnCampo|vaMsg|vaEnter|vnDataHora|vnRetSql)\b/g)) {
    const n = m[1];
    if (!defined.has(n.toLowerCase()) && !found.includes(n)) found.push(n);
  }
  return found;
}

function appendDefinirs(
  edit: vscode.WorkspaceEdit,
  document: vscode.TextDocument,
  refLine: number,
  names: string[]
): void {
  if (names.length === 0) return;
  let src = document.getText();
  const defined = definedNames(src);
  for (const name of [...names].reverse()) {
    if (defined.has(name.toLowerCase())) continue;
    const { afterLine, text } = buildDefinirInsertEdit(src, refLine, name);
    edit.insert(document.uri, new vscode.Position(afterLine + 1, 0), text);
    const lines = src.replace(/\r\n/g, "\n").split("\n");
    lines.splice(afterLine + 1, 0, text.replace(/\n$/, ""));
    src = lines.join("\n");
    defined.add(name.toLowerCase());
  }
}

function hitToSyntheticDiag(document: vscode.TextDocument, hit: DiagnosticHit): vscode.Diagnostic {
  const line = document.lineAt(hit.line);
  const range =
    hit.startCol !== undefined && hit.endCol !== undefined
      ? new vscode.Range(hit.line, hit.startCol, hit.line, hit.endCol)
      : new vscode.Range(hit.line, 0, hit.line, line.text.length);
  const d = new vscode.Diagnostic(
    range,
    `[${hit.id}] ${hit.message}`,
    hit.severity === "error" ? vscode.DiagnosticSeverity.Error : vscode.DiagnosticSeverity.Warning
  );
  d.code = hit.id;
  d.source = "LSP Workbench";
  return d;
}

function lineReplaceAction(
  document: vscode.TextDocument,
  diagnostic: vscode.Diagnostic,
  title: string,
  insertText: string,
  extraVars: string[] = []
): vscode.CodeAction | null {
  const line = document.lineAt(diagnostic.range.start.line);
  const plain = plainText(insertText);
  if (plain === line.text) return null;
  const a = new vscode.CodeAction(title, vscode.CodeActionKind.QuickFix);
  a.diagnostics = [diagnostic];
  a.isPreferred = true;
  a.edit = new vscode.WorkspaceEdit();
  a.edit.replace(document.uri, line.range, plain);
  const src = document.getText();
  const fromFix = newVarsFromFix(String(diagnostic.code || ""), plain);
  const vars = [...new Set([...extraVars, ...fromFix, ...newVarsInText(plain, src)])].filter(
    (n) => !definedNames(src).has(n.toLowerCase())
  );
  appendDefinirs(a.edit, document, diagnostic.range.start.line, vars);
  return a;
}

function fun001Actions(
  document: vscode.TextDocument,
  diagnostic: vscode.Diagnostic
): vscode.CodeAction[] {
  const line = document.lineAt(diagnostic.range.start.line);
  const actions: vscode.CodeAction[] = [];

  for (const opt of truncarRewriteOptions(line.text)) {
    const a = lineReplaceAction(
      document,
      diagnostic,
      `${opt.label}: ${opt.detail}`,
      opt.insertText
    );
    if (a) {
      a.isPreferred = opt.sortKey === "01";
      actions.push(a);
    }
  }

  if (actions.length === 0) {
    const preferred = applyFun001Fix(line.text);
    const a = lineReplaceAction(document, diagnostic, "Corrigir Truncar", preferred);
    if (a) actions.push(a);
  }

  return actions;
}

function fun005Actions(
  document: vscode.TextDocument,
  diagnostic: vscode.Diagnostic
): vscode.CodeAction[] {
  const line = document.lineAt(diagnostic.range.start.line);
  const actions: vscode.CodeAction[] = [];

  for (const opt of arredondarRewriteOptions(line.text)) {
    if (/=\s*Arredonda/i.test(opt.insertText)) continue;
    const a = lineReplaceAction(
      document,
      diagnostic,
      `${opt.label}: ${opt.detail}`,
      opt.insertText
    );
    if (a) {
      a.isPreferred = opt.sortKey === "01";
      actions.push(a);
    }
  }

  if (actions.length === 0) {
    const preferred = applyFun005Fix(line.text);
    const a = lineReplaceAction(
      document,
      diagnostic,
      "Substituir Arredondar por Arredonda(valor, casas)",
      preferred
    );
    if (a) actions.push(a);
  }

  return actions;
}

function fun003Actions(
  document: vscode.TextDocument,
  diagnostic: vscode.Diagnostic
): vscode.CodeAction[] {
  const line = document.lineAt(diagnostic.range.start.line);
  const info = findFun003VdArg(line.text);
  if (!info) return [];
  const fixed = applyFun003Fix(line.text);
  const needDefinir = !definedNames(document.getText()).has(info.to.toLowerCase());
  const a = lineReplaceAction(
    document,
    diagnostic,
    needDefinir
      ? `Trocar ${info.from} → ${info.to} + ${definirStatement(info.to)}`
      : `Trocar ${info.from} → ${info.to} (EstaNulo Alfa)`,
    fixed,
    needDefinir ? [info.to] : []
  );
  return a ? [a] : [];
}

function fun004Actions(
  document: vscode.TextDocument,
  diagnostic: vscode.Diagnostic
): vscode.CodeAction[] {
  const line = document.lineAt(diagnostic.range.start.line);
  const info = findFun004PArg(line.text);
  const fixed = applyFun004Fix(line.text);
  if (!info || fixed === line.text) return [];
  const needDefinir = !definedNames(document.getText()).has(info.to.toLowerCase());
  const a = lineReplaceAction(
    document,
    diagnostic,
    needDefinir
      ? `Trocar ${info.from} → ${info.to} + ${definirStatement(info.to)}`
      : `Trocar ${info.from} → ${info.to}`,
    fixed,
    needDefinir ? [info.to] : []
  );
  return a ? [a] : [];
}

function fun006Actions(
  document: vscode.TextDocument,
  diagnostic: vscode.Diagnostic
): vscode.CodeAction[] {
  const line = document.lineAt(diagnostic.range.start.line);
  const fixed = applyFun006Fix(line.text);
  // Alinhado ao Ctrl+Espaço: deixa vnDecimais pendente; Definir só se ainda não existir
  const a = lineReplaceAction(
    document,
    diagnostic,
    "Completar Decimais: Arredonda(valor, <vnDecimais>)",
    fixed
  );
  return a ? [a] : [];
}

function replaceWholeDocument(
  document: vscode.TextDocument,
  diagnostic: vscode.Diagnostic,
  title: string,
  next: string
): vscode.CodeAction {
  const a = new vscode.CodeAction(title, vscode.CodeActionKind.QuickFix);
  a.diagnostics = [diagnostic];
  a.isPreferred = true;
  a.edit = new vscode.WorkspaceEdit();
  const end = document.lineAt(document.lineCount - 1).range.end;
  a.edit.replace(document.uri, new vscode.Range(new vscode.Position(0, 0), end), next);
  return a;
}

function sql004Actions(
  document: vscode.TextDocument,
  diagnostic: vscode.Diagnostic
): vscode.CodeAction[] {
  const line = document.lineAt(diagnostic.range.start.line);
  const info = findSqlHandleCall(line.text, "SQL_Criar");
  if (!info) return [];
  const src = document.getText();
  const next = applySql004SourceFix(src, info.handle);
  if (!next || next === src) return [];
  const newName = suggestedPrefixedName("alfa", info.handle) ?? info.handle;
  const title =
    newName !== info.handle
      ? `Definir Alfa ${newName} + renomear ${info.handle} → ${newName} (todo o arquivo)`
      : `Definir Alfa ${info.handle}`;
  return [replaceWholeDocument(document, diagnostic, title, next)];
}

function prefixRenameActions(
  document: vscode.TextDocument,
  diagnostic: vscode.Diagnostic,
  code: "SYN006" | "RUL008"
): vscode.CodeAction[] {
  const line = document.lineAt(diagnostic.range.start.line);
  const defM = line.text.match(/^(\s*)Definir\s+(Alfa|Numero|Data|Lista|Cursor)\s+(\w+)\b/i);
  if (!defM) return [];
  const next = applyPrefixRenameSourceFix(document.getText(), defM[2], defM[3]);
  if (!next) return [];
  const newName = suggestedPrefixedName(defM[2], defM[3])!;
  void code;
  return [
    replaceWholeDocument(
      document,
      diagnostic,
      `Renomear ${defM[3]} → ${newName} (todo o arquivo)`,
      next
    ),
  ];
}

function sql005Actions(
  document: vscode.TextDocument,
  diagnostic: vscode.Diagnostic
): vscode.CodeAction[] {
  const line = document.lineAt(diagnostic.range.start.line);
  const info = findSqlHandleCall(line.text, "SQL_AbrirCursor");
  if (!info) return [];
  const src = document.getText();
  if (isDefinirCursorHandle(src, info.handle)) return []; // SQL009 cuida
  const insert = sql005DefinirComandoInsert(line.text);
  if (!insert) return [];
  const actions: vscode.CodeAction[] = [];
  const a = new vscode.CodeAction(
    `Inserir SQL_DefinirComando(${info.handle}, vaSql);`,
    vscode.CodeActionKind.QuickFix
  );
  a.diagnostics = [diagnostic];
  a.isPreferred = true;
  a.edit = new vscode.WorkspaceEdit();
  a.edit.insert(document.uri, new vscode.Position(line.lineNumber, 0), insert);
  actions.push(a);

  const loop = sqlEnquantoLoopInsert(info.handle, info.indent);
  if (!new RegExp(String.raw`SQL_EOF\s*\(\s*${info.handle}\s*\)`, "i").test(src)) {
    const a2 = new vscode.CodeAction(
      `Inserir Enquanto (SQL_EOF(${info.handle}) = 0) { SQL_Proximo }`,
      vscode.CodeActionKind.QuickFix
    );
    a2.diagnostics = [diagnostic];
    a2.isPreferred = false;
    a2.edit = new vscode.WorkspaceEdit();
    a2.edit.insert(document.uri, new vscode.Position(line.lineNumber + 1, 0), loop);
    actions.push(a2);
  }
  return actions;
}

function sql006Actions(
  document: vscode.TextDocument,
  diagnostic: vscode.Diagnostic
): vscode.CodeAction[] {
  const next = applySql006MoveUsarBeforeComando(
    document.getText(),
    diagnostic.range.start.line
  );
  if (!next) return [];
  return [
    replaceWholeDocument(
      document,
      diagnostic,
      "Mover SQL_Usar* para antes de SQL_DefinirComando",
      next
    ),
  ];
}

function sql009Actions(
  document: vscode.TextDocument,
  diagnostic: vscode.Diagnostic
): vscode.CodeAction[] {
  const line = document.lineAt(diagnostic.range.start.line);
  const src = document.getText();
  const actions: vscode.CodeAction[] = [];

  const scaffold = applySql009ScaffoldFix(line.text, src);
  if (scaffold) {
    const a = new vscode.CodeAction(
      "Expandir esqueleto do modo correto (SQL009)",
      vscode.CodeActionKind.QuickFix
    );
    a.diagnostics = [diagnostic];
    a.isPreferred = true;
    a.edit = new vscode.WorkspaceEdit();
    a.edit.replace(document.uri, line.range, scaffold);
    actions.push(a);
  }

  const fixed = applySql009LineFix(line.text, src);
  if (fixed !== null) {
    const a = new vscode.CodeAction(
      fixed === ""
        ? "Remover chamada incompatível (cursor simples ≠ SQL_*)"
        : `Só converter a linha → ${fixed.trim()}`,
      vscode.CodeActionKind.QuickFix
    );
    a.diagnostics = [diagnostic];
    a.isPreferred = !scaffold;
    a.edit = new vscode.WorkspaceEdit();
    if (fixed === "") {
      const end =
        line.lineNumber + 1 < document.lineCount
          ? new vscode.Position(line.lineNumber + 1, 0)
          : line.range.end;
      a.edit.delete(document.uri, new vscode.Range(line.range.start, end));
    } else {
      a.edit.replace(document.uri, line.range, fixed);
    }
    actions.push(a);
  }
  return actions;
}

function sql007Actions(
  document: vscode.TextDocument,
  diagnostic: vscode.Diagnostic
): vscode.CodeAction[] {
  const line = document.lineAt(diagnostic.range.start.line);
  const info = findSqlHandleCall(line.text, "SQL_DefinirComando");
  if (!info) return [];
  if (isDefinirCursorHandle(document.getText(), info.handle)) return []; // SQL009
  const insert = sql007CriarInsert(line.text);
  if (!insert) return [];
  const a = new vscode.CodeAction(
    `Inserir SQL_Criar(${info.handle});`,
    vscode.CodeActionKind.QuickFix
  );
  a.diagnostics = [diagnostic];
  a.isPreferred = true;
  a.edit = new vscode.WorkspaceEdit();
  a.edit.insert(document.uri, new vscode.Position(line.lineNumber, 0), insert);
  return [a];
}

function sql008Actions(
  document: vscode.TextDocument,
  diagnostic: vscode.Diagnostic
): vscode.CodeAction[] {
  const line = document.lineAt(diagnostic.range.start.line);
  const info = findSqlHandleCall(line.text, "SQL_DefinirComando");
  if (!info) return [];
  const missing = sql008MissingFlags(document.getText(), info.handle, line.lineNumber);
  const insert = sql008NativeInsert(line.text, missing);
  if (!insert) return [];
  const a = new vscode.CodeAction(
    `Inserir SQL_UsarAbrangencia/SQL_UsarSQLSenior2(${info.handle}, 0)`,
    vscode.CodeActionKind.QuickFix
  );
  a.diagnostics = [diagnostic];
  a.isPreferred = true;
  a.edit = new vscode.WorkspaceEdit();
  a.edit.insert(document.uri, new vscode.Position(line.lineNumber, 0), insert);
  return [a];
}

function sql002Actions(
  document: vscode.TextDocument,
  diagnostic: vscode.Diagnostic
): vscode.CodeAction[] {
  const line = document.lineAt(diagnostic.range.start.line);
  const info = findSql002Criar(line.text);
  const insert = sql002DestruirInsert(line.text);
  if (!info || !insert) return [];
  if (isDefinirCursorHandle(document.getText(), info.handle)) return [];
  const after = findSql002DestruirAfterLine(document.getText(), info.handle, line.lineNumber);
  if (after < 0) return [];
  const a = new vscode.CodeAction(
    `Inserir SQL_Destruir(${info.handle}); (ao final do uso)`,
    vscode.CodeActionKind.QuickFix
  );
  a.diagnostics = [diagnostic];
  a.isPreferred = true;
  a.edit = new vscode.WorkspaceEdit();
  a.edit.insert(document.uri, new vscode.Position(after + 1, 0), insert);
  return [a];
}

function sql003Actions(
  document: vscode.TextDocument,
  diagnostic: vscode.Diagnostic
): vscode.CodeAction[] {
  const line = document.lineAt(diagnostic.range.start.line);
  const info = findSql003Abrir(line.text);
  const insert = sql003FecharInsert(line.text);
  if (!info || !insert) return [];
  const src = document.getText();
  if (isDefinirCursorHandle(src, info.handle)) return [];
  const pos = findSql003FecharInsertPos(src, info.handle, line.lineNumber);
  if (!pos) return [];
  const actions: vscode.CodeAction[] = [];
  const a = new vscode.CodeAction(
    `Inserir SQL_FecharCursor(${info.handle});`,
    vscode.CodeActionKind.QuickFix
  );
  a.diagnostics = [diagnostic];
  a.isPreferred = true;
  a.edit = new vscode.WorkspaceEdit();
  if ("beforeLine" in pos) {
    a.edit.insert(document.uri, new vscode.Position(pos.beforeLine, 0), insert);
  } else {
    a.edit.insert(document.uri, new vscode.Position(pos.afterLine + 1, 0), insert);
  }
  actions.push(a);

  if (!new RegExp(String.raw`SQL_EOF\s*\(\s*${info.handle}\s*\)`, "i").test(src)) {
    const loop = sqlEnquantoLoopInsert(info.handle, info.indent);
    const a2 = new vscode.CodeAction(
      `Inserir Enquanto (SQL_EOF(${info.handle}) = 0) { SQL_Proximo }`,
      vscode.CodeActionKind.QuickFix
    );
    a2.diagnostics = [diagnostic];
    a2.isPreferred = false;
    a2.edit = new vscode.WorkspaceEdit();
    a2.edit.insert(document.uri, new vscode.Position(line.lineNumber + 1, 0), loop);
    actions.push(a2);
  }
  return actions;
}

function sem004Actions(
  document: vscode.TextDocument,
  diagnostic: vscode.Diagnostic
): vscode.CodeAction[] {
  const line = document.lineAt(diagnostic.range.start.line);
  const info = findSem004Usage(
    line.text,
    diagnostic.range.start.character,
    diagnostic.range.end.character
  );
  if (!info) return [];

  const afterLine = findSem004InsertAfterLine(
    document.getText(),
    info.list,
    diagnostic.range.start.line
  );
  const indentMatch = document.lineAt(Math.max(0, afterLine)).text.match(/^(\s*)/);
  const indent = indentMatch?.[1] ?? "";
  const insert = sem004AdicionarCampoLine(info.list, info.field, info.tipo, indent);

  const a = new vscode.CodeAction(
    `Inserir ${info.list}.AdicionarCampo("${info.field}", ${info.tipo});`,
    vscode.CodeActionKind.QuickFix
  );
  a.diagnostics = [diagnostic];
  a.isPreferred = true;
  a.edit = new vscode.WorkspaceEdit();
  a.edit.insert(document.uri, new vscode.Position(afterLine + 1, 0), insert);
  return [a];
}

function sem002Actions(
  document: vscode.TextDocument,
  diagnostic: vscode.Diagnostic
): vscode.CodeAction[] {
  const line = document.lineAt(diagnostic.range.start.line);
  const info = findSem002FileOpen(line.text);
  if (!info) return [];

  const actions: vscode.CodeAction[] = [];
  const fechar = sem002FecharInsert(line.text);
  if (fechar) {
    const a = new vscode.CodeAction(
      `Inserir Fechar(${info.handle});`,
      vscode.CodeActionKind.QuickFix
    );
    a.diagnostics = [diagnostic];
    a.isPreferred = true;
    a.edit = new vscode.WorkspaceEdit();
    a.edit.insert(document.uri, new vscode.Position(line.lineNumber + 1, 0), fechar);
    actions.push(a);
  }

  const complete = applySem002CompleteFix(line.text);
  if (complete !== line.text) {
    const a2 = new vscode.CodeAction(
      `Completar arquivo (Abrir + Fechar(${info.handle}))`,
      vscode.CodeActionKind.QuickFix
    );
    a2.diagnostics = [diagnostic];
    a2.isPreferred = false;
    a2.edit = new vscode.WorkspaceEdit();
    a2.edit.replace(document.uri, line.range, complete);
    actions.push(a2);
  }

  return actions;
}

function sem003Actions(
  document: vscode.TextDocument,
  diagnostic: vscode.Diagnostic
): vscode.CodeAction[] {
  const line = document.lineAt(diagnostic.range.start.line);
  const info = findSem003Cursor(line.text);
  if (!info) return [];

  const actions: vscode.CodeAction[] = [];
  const fechar = sem003FecharInsert(line.text);
  if (fechar) {
    const a = new vscode.CodeAction(
      `Inserir ${info.name}.FecharCursor();`,
      vscode.CodeActionKind.QuickFix
    );
    a.diagnostics = [diagnostic];
    a.isPreferred = true;
    a.edit = new vscode.WorkspaceEdit();
    a.edit.insert(document.uri, new vscode.Position(line.lineNumber + 1, 0), fechar);
    actions.push(a);
  }

  const complete = applySem003CompleteFix(line.text);
  if (complete !== line.text) {
    const a2 = new vscode.CodeAction(
      `Completar cursor (Enquanto + ${info.name}.FecharCursor)`,
      vscode.CodeActionKind.QuickFix
    );
    a2.diagnostics = [diagnostic];
    a2.isPreferred = false;
    a2.edit = new vscode.WorkspaceEdit();
    a2.edit.replace(document.uri, line.range, complete);
    actions.push(a2);
  }

  return actions;
}

function sem001Actions(
  document: vscode.TextDocument,
  diagnostic: vscode.Diagnostic
): vscode.CodeAction[] {
  const name = document.getText(diagnostic.range).trim();
  if (!/^(va|vn|vd|vl|Cur_)/i.test(name)) return [];

  const { afterLine, text } = buildDefinirInsertEdit(
    document.getText(),
    diagnostic.range.start.line,
    name
  );
  const a = new vscode.CodeAction(
    `Inserir ${definirStatement(name)}`,
    vscode.CodeActionKind.QuickFix
  );
  a.diagnostics = [diagnostic];
  a.isPreferred = true;
  a.edit = new vscode.WorkspaceEdit();
  a.edit.insert(document.uri, new vscode.Position(afterLine + 1, 0), text);
  return [a];
}

function lineFixerActions(
  document: vscode.TextDocument,
  diagnostic: vscode.Diagnostic
): vscode.CodeAction[] {
  const code = String(diagnostic.code || "");
  const actions: vscode.CodeAction[] = [];

  if (code === "RUL001") {
    const line = document.lineAt(diagnostic.range.start.line);
    const info = findRul001Param(line.text);
    const entry = LINE_FIXERS.find((f) => f.id === "RUL001");
    if (!entry) {
      /* skip */
    } else if (info) {
      const fixed = entry.apply(line.text);
      const a = lineReplaceAction(
        document,
        diagnostic,
        `Remover param ${info.tipo} (usar Definir ${info.tipo} ${info.name} global)`,
        fixed,
        [info.name]
      );
      if (a) actions.push(a);
    } else {
      const fixed = entry.apply(line.text);
      const a = lineReplaceAction(
        document,
        diagnostic,
        "Declarar param como Numero na assinatura",
        fixed
      );
      if (a) actions.push(a);
    }
  } else if (code === "RUL015") {
    const line = document.lineAt(diagnostic.range.start.line);
    const a1 = lineReplaceAction(
      document,
      diagnostic,
      "vd = CodData(dia, mes, ano)",
      LINE_FIXERS.find((f) => f.id === "RUL015")!.apply(line.text)
    );
    if (a1) actions.push(a1);
    const a2 = lineReplaceAction(
      document,
      diagnostic,
      "MontaData(dia, mes, ano, vd)",
      applyRul015MontaDataFix(line.text)
    );
    if (a2) {
      a2.isPreferred = false;
      actions.push(a2);
    }
  } else {
    const entry = LINE_FIXERS.find((f) => f.id === code);
    if (entry) {
      const line = document.lineAt(diagnostic.range.start.line);
      const fixed = entry.apply(line.text);
      const a = lineReplaceAction(document, diagnostic, entry.title, fixed);
      if (a) actions.push(a);
    }
  }

  // Ignorar alerta sem alterar o fonte (só IDs suppressible — nunca RUL017/RUL018 etc.)
  if (isSuppressible(code)) {
    const line = document.lineAt(diagnostic.range.start.line);
    const a = new vscode.CodeAction(
      `Ignorar alerta ${code} nesta linha`,
      vscode.CodeActionKind.QuickFix
    );
    a.diagnostics = [diagnostic];
    a.isPreferred = false;
    a.command = {
      command: IGNORE_DIAGNOSTIC_CMD,
      title: `Ignorar ${code}`,
      arguments: [document.uri.toString(), code, line.text],
    };
    actions.push(a);
  }

  return actions;
}

function syn005Actions(
  document: vscode.TextDocument,
  diagnostic: vscode.Diagnostic
): vscode.CodeAction[] {
  const lineNo = diagnostic.range.start.line;
  const next = applySyn005MoveDefinir(document.getText(), lineNo);
  if (!next) return [];
  return [
    replaceWholeDocument(
      document,
      diagnostic,
      "Mover Definir para o início da regra",
      next
    ),
  ];
}

function syn007Actions(
  document: vscode.TextDocument,
  diagnostic: vscode.Diagnostic
): vscode.CodeAction[] {
  const fixed = applySyn007CloseComment(document.getText());
  if (!fixed) return [];
  return [
    replaceWholeDocument(document, diagnostic, "Fechar comentário de bloco */", fixed.next),
  ];
}

function syn004Actions(
  document: vscode.TextDocument,
  diagnostic: vscode.Diagnostic
): vscode.CodeAction[] {
  const lineNo = diagnostic.range.start.line;
  const next = applySyn004PairFix(document.getText(), lineNo);
  if (!next) {
    // fallback linha única (FimSe isolado etc.)
    const line = document.lineAt(lineNo);
    const fixed = applySyn004InicioFim(line.text);
    const a = lineReplaceAction(document, diagnostic, "Converter Inicio/Fim para { }", fixed);
    return a ? [a] : [];
  }
  return [
    replaceWholeDocument(
      document,
      diagnostic,
      "Converter par Inicio…Fim; → { … }",
      next
    ),
  ];
}

function syn010Actions(
  document: vscode.TextDocument,
  diagnostic: vscode.Diagnostic
): vscode.CodeAction[] {
  const line = document.lineAt(diagnostic.range.start.line);
  const actions: vscode.CodeAction[] = [];

  const del = new vscode.CodeAction(
    "Remover instrução inválida",
    vscode.CodeActionKind.QuickFix
  );
  del.diagnostics = [diagnostic];
  del.isPreferred = true;
  del.edit = new vscode.WorkspaceEdit();
  const end =
    line.lineNumber + 1 < document.lineCount
      ? new vscode.Position(line.lineNumber + 1, 0)
      : line.range.end;
  del.edit.delete(document.uri, new vscode.Range(line.range.start, end));
  actions.push(del);

  const stub = applySyn010DefinirStub(line.text);
  if (stub) {
    const a = lineReplaceAction(document, diagnostic, `Converter em ${stub.trim()}`, stub);
    if (a) {
      a.isPreferred = false;
      actions.push(a);
    }
  }
  return actions;
}

function rul019Actions(
  document: vscode.TextDocument,
  diagnostic: vscode.Diagnostic
): vscode.CodeAction[] {
  const line = document.lineAt(diagnostic.range.start.line);
  const actions: vscode.CodeAction[] = [];
  const opts: Array<{ code: "1" | "2" | "3"; title: string }> = [
    { code: "1", title: "Cancel(1); — interromper regra / erro" },
    { code: "2", title: "Cancel(2); — relatório: ValStr/ValRet e sair" },
    { code: "3", title: "Cancel(3); — relatório: excluir registro (fórmula)" },
  ];
  for (const o of opts) {
    const fixed = applyRul019Fix(line.text, o.code);
    const a = lineReplaceAction(document, diagnostic, o.title, fixed);
    if (a) {
      a.isPreferred = o.code === "1";
      actions.push(a);
    }
  }
  return actions;
}

async function fun009Actions(
  document: vscode.TextDocument,
  diagnostic: vscode.Diagnostic
): Promise<vscode.CodeAction[]> {
  const line = document.lineAt(diagnostic.range.start.line);
  const slice =
    diagnostic.range.start.character !== undefined
      ? line.text.slice(diagnostic.range.start.character, diagnostic.range.end.character)
      : "";
  const nameMatch =
    slice.match(/^([A-Za-z_][\w]*)$/) ||
    line.text.match(/\b([A-Za-z_][\w]*)\s*\(/) ||
    /Função '([^']+)'/.exec(diagnostic.message);
  const name = nameMatch?.[1];
  if (!name) return [];

  const { external } = await getWorkspaceSymbolIndex().getScopedEligible(document);
  const fn = external.get(name.toLowerCase());
  if (!fn) return [];

  const next = applyImportCustomFunction(document.getText(), fn);
  const action = new vscode.CodeAction(
    `Importar implementação de ${fn.name} (${fn.fileName})`,
    vscode.CodeActionKind.QuickFix
  );
  action.diagnostics = [diagnostic];
  action.isPreferred = true;
  action.command = {
    command: APPLY_TEXT_EDITS_CMD,
    title: action.title,
    arguments: [document.uri.toString(), [serializeFullDocumentReplace(document, next)]],
  };
  return [action];
}

function fun008Actions(
  document: vscode.TextDocument,
  diagnostic: vscode.Diagnostic
): vscode.CodeAction[] {
  const name = /Função '([^']+)'/.exec(diagnostic.message)?.[1];
  if (!name) return [];
  const next = applyFun008InsertDecl(document.getText(), name);
  if (!next || next === document.getText()) return [];
  const action = new vscode.CodeAction(
    `Inserir Definir Funcao ${name}`,
    vscode.CodeActionKind.QuickFix
  );
  action.diagnostics = [diagnostic];
  action.isPreferred = true;
  action.command = {
    command: APPLY_TEXT_EDITS_CMD,
    title: action.title,
    arguments: [document.uri.toString(), [serializeFullDocumentReplace(document, next)]],
  };
  return [action];
}

function fun007Actions(
  document: vscode.TextDocument,
  diagnostic: vscode.Diagnostic
): vscode.CodeAction[] {
  const name = /Função '([^']+)'/.exec(diagnostic.message)?.[1];
  if (!name) return [];
  const next = applyFun007InsertImpl(document.getText(), name);
  if (!next || next === document.getText()) return [];
  const action = new vscode.CodeAction(
    `Implementar Funcao ${name}`,
    vscode.CodeActionKind.QuickFix
  );
  action.diagnostics = [diagnostic];
  action.isPreferred = true;
  action.command = {
    command: APPLY_TEXT_EDITS_CMD,
    title: action.title,
    arguments: [document.uri.toString(), [serializeFullDocumentReplace(document, next)]],
  };
  return [action];
}

function actionsForDiagnostic(
  document: vscode.TextDocument,
  diagnostic: vscode.Diagnostic
): vscode.CodeAction[] {
  const code = String(diagnostic.code || "");
  if (code === "RUL019") return rul019Actions(document, diagnostic);
  if (code === "FUN003") return fun003Actions(document, diagnostic);
  if (code === "FUN004") return fun004Actions(document, diagnostic);
  if (code === "FUN001") return fun001Actions(document, diagnostic);
  if (code === "FUN005") return fun005Actions(document, diagnostic);
  if (code === "FUN006") return fun006Actions(document, diagnostic);
  if (code === "FUN007") return fun007Actions(document, diagnostic);
  if (code === "FUN008") return fun008Actions(document, diagnostic);
  if (code === "SEM001") return sem001Actions(document, diagnostic);
  if (code === "SEM002") return sem002Actions(document, diagnostic);
  if (code === "SEM003") return sem003Actions(document, diagnostic);
  if (code === "SEM004") return sem004Actions(document, diagnostic);
  if (code === "SQL002") return sql002Actions(document, diagnostic);
  if (code === "SQL003") return sql003Actions(document, diagnostic);
  if (code === "SQL004") return sql004Actions(document, diagnostic);
  if (code === "SQL005") return sql005Actions(document, diagnostic);
  if (code === "SQL006") return sql006Actions(document, diagnostic);
  if (code === "SQL007") return sql007Actions(document, diagnostic);
  if (code === "SQL008") return sql008Actions(document, diagnostic);
  if (code === "SQL009") return sql009Actions(document, diagnostic);
  if (code === "SYN004") return syn004Actions(document, diagnostic);
  if (code === "SYN005") return syn005Actions(document, diagnostic);
  if (code === "SYN007") return syn007Actions(document, diagnostic);
  if (code === "SYN010") return syn010Actions(document, diagnostic);
  if (code === "SYN006" || code === "RUL008") return prefixRenameActions(document, diagnostic, code);
  return lineFixerActions(document, diagnostic);
}

export function createLspCodeActionProvider(): vscode.CodeActionProvider {
  return {
    async provideCodeActions(document, range, context) {
      const actions: vscode.CodeAction[] = [];
      const seen = new Set<string>();

      const pushUnique = (list: vscode.CodeAction[]) => {
        for (const a of list) {
          const key = a.title + String(a.diagnostics?.[0]?.code ?? "");
          if (seen.has(key)) continue;
          seen.add(key);
          actions.push(a);
        }
      };

      for (const diagnostic of context.diagnostics) {
        if (diagnostic.source !== "LSP Workbench") continue;
        if (String(diagnostic.code) === "FUN009") {
          pushUnique(await fun009Actions(document, diagnostic));
          continue;
        }
        pushUnique(actionsForDiagnostic(document, diagnostic));
      }

      const lineNo = range.start.line;
      let scopedExternal: Map<string, { fileName: string }> | undefined;
      try {
        scopedExternal = await getWorkspaceSymbolIndex().externalMapFor(document);
      } catch {
        scopedExternal = undefined;
      }
      const hits = analyzeLsp(document.getText(), {
        scopedExternal,
      }).filter((h) => h.line === lineNo);
      for (const hit of hits) {
        const diag = hitToSyntheticDiag(document, hit);
        if (hit.id === "FUN009") {
          pushUnique(await fun009Actions(document, diag));
          continue;
        }
        pushUnique(actionsForDiagnostic(document, diag));
      }

      return actions;
    },
  };
}

export function registerCodeActions(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      { language: SENIOR_LSP_LANGUAGE_ID, scheme: "*" },
      createLspCodeActionProvider(),
      {
        providedCodeActionKinds: [
          vscode.CodeActionKind.QuickFix,
          vscode.CodeActionKind.Empty,
        ],
      }
    )
  );
}
