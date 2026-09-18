/**
 * Adapter VS Code — refactors (CodeActionKind.Refactor).
 */

import * as vscode from "vscode";
import { SENIOR_LSP_LANGUAGE_ID } from "../../language";
import {
  backslashLiteralToConcat,
  toggleInicioFimToBraces,
  wrapSelection,
} from "../../application/refactors";
import { APPLY_TEXT_EDITS_CMD, serializeFullDocumentReplace } from "../../apply-edits";

export function registerRefactorActions(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      { language: SENIOR_LSP_LANGUAGE_ID, scheme: "*" },
      {
        provideCodeActions(document, range) {
          const actions: vscode.CodeAction[] = [];
          const src = document.getText();
          const start = document.offsetAt(range.start);
          const end = document.offsetAt(range.end);
          const hasSel = !range.isEmpty;

          if (hasSel) {
            for (const [title, kind] of [
              ["Envolver com Se", "se"],
              ["Envolver com Enquanto", "enquanto"],
              ["Envolver com Para", "para"],
              ["Envolver com bloco { }", "bloco"],
            ] as const) {
              const a = new vscode.CodeAction(title, vscode.CodeActionKind.Refactor);
              const next = wrapSelection(src, start, end, kind);
              a.command = {
                title,
                command: APPLY_TEXT_EDITS_CMD,
                arguments: [document.uri.toString(), serializeFullDocumentReplace(document, next)],
              };
              actions.push(a);
            }
          }

          const toggle = new vscode.CodeAction(
            "Converter Inicio/Fim → { }",
            vscode.CodeActionKind.Refactor
          );
          toggle.command = {
            title: "Toggle braces",
            command: APPLY_TEXT_EDITS_CMD,
            arguments: [
              document.uri.toString(),
              serializeFullDocumentReplace(document, toggleInicioFimToBraces(src)),
            ],
          };
          actions.push(toggle);

          const concat = new vscode.CodeAction(
            "Converter \\ multilinha → concatenação +",
            vscode.CodeActionKind.Refactor
          );
          concat.command = {
            title: "Concat",
            command: APPLY_TEXT_EDITS_CMD,
            arguments: [
              document.uri.toString(),
              serializeFullDocumentReplace(document, backslashLiteralToConcat(src)),
            ],
          };
          actions.push(concat);

          return actions;
        },
      },
      { providedCodeActionKinds: [vscode.CodeActionKind.Refactor] }
    )
  );
}
