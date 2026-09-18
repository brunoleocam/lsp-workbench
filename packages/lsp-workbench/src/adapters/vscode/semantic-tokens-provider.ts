/**
 * Adapter VS Code — semantic tokens (PDR-004).
 */

import * as vscode from "vscode";
import { SENIOR_LSP_LANGUAGE_ID } from "../../language";
import {
  buildSemanticTokens,
  encodeSemanticTokens,
  SEMANTIC_TOKEN_LEGEND,
} from "../../application/semantic-tokens";

export function registerSemanticTokens(context: vscode.ExtensionContext): void {
  const legend = new vscode.SemanticTokensLegend([...SEMANTIC_TOKEN_LEGEND]);
  const provider: vscode.DocumentSemanticTokensProvider = {
    provideDocumentSemanticTokens(document) {
      const tokens = buildSemanticTokens(document.getText());
      const data = encodeSemanticTokens(tokens);
      return new vscode.SemanticTokens(new Uint32Array(data));
    },
  };
  context.subscriptions.push(
    vscode.languages.registerDocumentSemanticTokensProvider(
      { language: SENIOR_LSP_LANGUAGE_ID, scheme: "*" },
      provider,
      legend
    )
  );
}
