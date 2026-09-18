/**
 * Hover, signature help e Go to Definition (PDR-003).
 */

import * as vscode from "vscode";
import { SENIOR_LSP_LANGUAGE_ID } from "./language";
import { getWorkspaceSymbolIndex } from "./workspace-symbol-index";
import { markdownForFunction, parseFileSymbols } from "./document-symbols";
import { LSP_FUNCTION_CATALOG } from "./function-catalog";
import { mergeEligible } from "./symbol-scope";

function wordAt(
  document: vscode.TextDocument,
  position: vscode.Position
): { name: string; range: vscode.Range } | undefined {
  const range = document.getWordRangeAtPosition(position, /[A-Za-z_][\w]*/);
  if (!range) return undefined;
  return { name: document.getText(range), range };
}

export function createHoverProvider(): vscode.HoverProvider {
  return {
    async provideHover(document, position) {
      const w = wordAt(document, position);
      if (!w) return undefined;

      const idx = getWorkspaceSymbolIndex();
      const { local, peers } = await idx.getScopedEligible(document);
      const all = mergeEligible(local, peers, document.uri.toString());
      const fn = all.find((f) => f.name.toLowerCase() === w.name.toLowerCase());
      if (fn) {
        const md = new vscode.MarkdownString(markdownForFunction(fn));
        if (fn.uri !== document.uri.toString()) {
          md.appendMarkdown(`\n\n_Origem: \`${fn.fileName}\`_`);
        }
        return new vscode.Hover(md, w.range);
      }

      const builtin = LSP_FUNCTION_CATALOG.find(
        (e) => e.label.toLowerCase() === w.name.toLowerCase()
      );
      if (builtin) {
        const md = new vscode.MarkdownString(
          `**${builtin.label}** — ${builtin.detail}\n\n${builtin.documentation ?? ""}`
        );
        return new vscode.Hover(md, w.range);
      }
      return undefined;
    },
  };
}

export function createDefinitionProvider(): vscode.DefinitionProvider {
  return {
    async provideDefinition(document, position) {
      const w = wordAt(document, position);
      if (!w) return undefined;
      const hit = await getWorkspaceSymbolIndex().findFunctionDefinition(document, w.name);
      if (!hit) return undefined;
      return new vscode.Location(hit.uri, new vscode.Position(hit.line, 0));
    },
  };
}

export function createSignatureHelpProvider(): vscode.SignatureHelpProvider {
  return {
    async provideSignatureHelp(document, position) {
      const line = document.lineAt(position).text.slice(0, position.character);
      const m = line.match(/([A-Za-z_][\w]*)\s*\(([^()]*)$/);
      if (!m) return undefined;
      const name = m[1];
      const argsSoFar = m[2];
      const activeParameter = argsSoFar.split(",").length - 1;

      const idx = getWorkspaceSymbolIndex();
      const { local, peers } = await idx.getScopedEligible(document);
      const all = mergeEligible(local, peers, document.uri.toString());
      const fn = all.find((f) => f.name.toLowerCase() === name.toLowerCase());
      if (!fn) {
        const builtin = LSP_FUNCTION_CATALOG.find(
          (e) => e.label.toLowerCase() === name.toLowerCase()
        );
        if (!builtin) return undefined;
        const sig = new vscode.SignatureInformation(
          builtin.insertText.replace(/\$\{\d+:([^}]+)\}/g, "$1"),
          builtin.documentation ?? builtin.detail
        );
        const help = new vscode.SignatureHelp();
        help.signatures = [sig];
        help.activeSignature = 0;
        help.activeParameter = Math.max(0, activeParameter);
        return help;
      }

      const label = fn.signature;
      const sig = new vscode.SignatureInformation(label, fn.lspDoc?.summary ?? "");
      sig.parameters = fn.params.map((p) => {
        const docParam = fn.lspDoc?.params.find(
          (d) => d.name.toLowerCase() === p.name.toLowerCase()
        );
        return new vscode.ParameterInformation(
          p.name,
          docParam?.description ?? `${p.tipo}${p.isEnd ? " End" : ""}`
        );
      });
      const help = new vscode.SignatureHelp();
      help.signatures = [sig];
      help.activeSignature = 0;
      help.activeParameter = Math.min(
        Math.max(0, activeParameter),
        Math.max(0, fn.params.length - 1)
      );
      return help;
    },
  };
}

export function registerLanguageFeatures(context: vscode.ExtensionContext): void {
  const sel = { language: SENIOR_LSP_LANGUAGE_ID, scheme: "*" };
  context.subscriptions.push(
    vscode.languages.registerHoverProvider(sel, createHoverProvider()),
    vscode.languages.registerDefinitionProvider(sel, createDefinitionProvider()),
    vscode.languages.registerSignatureHelpProvider(
      sel,
      createSignatureHelpProvider(),
      "(",
      ","
    )
  );
}

/** Símbolos locais puros (testes / completion sync fallback). */
export function localSymbolsOf(source: string) {
  return parseFileSymbols(source);
}
