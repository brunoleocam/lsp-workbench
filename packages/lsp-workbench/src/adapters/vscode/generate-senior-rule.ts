import * as fs from "node:fs";
import * as path from "node:path";
import { randomBytes, randomInt } from "node:crypto";
import * as vscode from "vscode";
import { SENIOR_LSP_LANGUAGE_ID } from "../../language";
import { BINARY_RULE_SCHEME, seniorExportDefaultPath } from "../../domain/binary-rule-paths";
import {
  createSeniorBinaryRule,
  newRuleGuid,
  validateSeniorRuleTitle,
} from "../../domain/senior-binary-rule";
import { isBinaryRuleFileUri } from "./binary-rule-fs";
import { OPEN_BINARY_RULE_CMD } from "./binary-rule-open";

export const GENERATE_SENIOR_RULE_CMD = "lsp.generateSeniorRule";

function errorCount(uri: vscode.Uri): number {
  return vscode.languages
    .getDiagnostics(uri)
    .filter((d) => d.severity === vscode.DiagnosticSeverity.Error).length;
}

async function generateSeniorRule(
  revalidate: (doc: vscode.TextDocument) => Promise<void>
): Promise<void> {
  const doc = vscode.window.activeTextEditor?.document;
  if (!doc || doc.languageId !== SENIOR_LSP_LANGUAGE_ID) {
    void vscode.window.showWarningMessage("LSP: abra um arquivo LSP para gerar o .LSP do Senior.");
    return;
  }
  if (doc.uri.scheme === BINARY_RULE_SCHEME || isBinaryRuleFileUri(doc.uri)) {
    void vscode.window.showInformationMessage(
      "LSP: esta regra já está no formato do Senior; Ctrl+S grava a cópia .editado."
    );
    return;
  }
  if (doc.uri.scheme !== "file") {
    void vscode.window.showWarningMessage("LSP: salve o arquivo de texto antes de gerar o .LSP.");
    return;
  }

  const textPath = doc.uri.fsPath;
  const title = await vscode.window.showInputBox({
    title: "Gerar .LSP para o Senior",
    prompt: "Título da regra (aparece no Senior, até 70 caracteres)",
    value: path.basename(textPath).replace(/\.[^.]*$/, ""),
    validateInput: validateSeniorRuleTitle,
  });
  if (!title) return;

  await revalidate(doc);
  const errors = errorCount(doc.uri);
  if (errors > 0) {
    const choice = await vscode.window.showWarningMessage(
      `A regra tem ${errors} erro(s) de compilação. Gerar o .LSP mesmo assim?`,
      { modal: true },
      "Gerar"
    );
    if (choice !== "Gerar") return;
  }

  const target = await vscode.window.showSaveDialog({
    title: "Gerar .LSP para o Senior",
    defaultUri: vscode.Uri.file(seniorExportDefaultPath(textPath)),
    filters: { "Regra Senior": ["LSP"] },
  });
  if (!target) return;
  if (path.resolve(target.fsPath).toLowerCase() === path.resolve(textPath).toLowerCase()) {
    void vscode.window.showErrorMessage("LSP: o .LSP gerado não pode substituir o próprio arquivo de texto.");
    return;
  }

  try {
    const bytes = createSeniorBinaryRule({
      title: title.trim(),
      source: doc.getText(),
      guid: newRuleGuid(randomBytes(16)),
      key: randomInt(1, 128),
    });
    fs.writeFileSync(target.fsPath, bytes);
    if (!fs.readFileSync(target.fsPath).equals(Buffer.from(bytes))) {
      throw new Error("Conferência falhou: o arquivo relido difere do que foi gravado.");
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    void vscode.window.showErrorMessage(`LSP: não gerou ${path.basename(target.fsPath)}. ${message}`);
    return;
  }

  const choice = await vscode.window.showInformationMessage(
    `LSP: gerado ${path.basename(target.fsPath)} no formato do Senior, pronto para importar.`,
    "Abrir",
    "Mostrar na pasta"
  );
  if (choice === "Abrir") await vscode.commands.executeCommand(OPEN_BINARY_RULE_CMD, target);
  if (choice === "Mostrar na pasta") await vscode.commands.executeCommand("revealFileInOS", target);
}

/** Gera um `.LSP` binário novo a partir do texto do editor (PDR-012, etapa 8). */
export function registerGenerateSeniorRule(
  context: vscode.ExtensionContext,
  revalidate: (doc: vscode.TextDocument) => Promise<void>
): void {
  context.subscriptions.push(
    vscode.commands.registerCommand(GENERATE_SENIOR_RULE_CMD, () => generateSeniorRule(revalidate))
  );
}
