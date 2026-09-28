/**
 * Hover, signature help e Go to Definition (PDR-003).
 */

import * as vscode from "vscode";
import { SENIOR_LSP_LANGUAGE_ID } from "./language";
import { getWorkspaceSymbolIndex } from "./workspace-symbol-index";
import { markdownForFunction, parseFileSymbols, type CustomFunctionSymbol } from "./document-symbols";
import { callSiteAt, isDirectCallee } from "./call-site";
import {
  formatParamHover,
  orderedCatalogParams,
  signatureLabelFromSnippet,
  signatureOverview,
  snippetParamNames,
} from "./catalog-param-docs";
import { LSP_FUNCTION_CATALOG, findSystemVar } from "./function-catalog";
import { mergeEligible } from "./symbol-scope";

function wordAt(
  document: vscode.TextDocument,
  position: vscode.Position
): { name: string; range: vscode.Range } | undefined {
  const range = document.getWordRangeAtPosition(position, /[A-Za-z_][\w]*/);
  if (!range) return undefined;
  return { name: document.getText(range), range };
}

function tokenAt(
  document: vscode.TextDocument,
  position: vscode.Position
): { name: string; range: vscode.Range } | undefined {
  const range = document.getWordRangeAtPosition(position, /[A-Za-z_][\w]*|\d+/);
  if (!range) return undefined;
  return { name: document.getText(range), range };
}

function userParamHover(fn: CustomFunctionSymbol, argIndex: number): string | undefined {
  const param = fn.params[argIndex];
  if (!param) return undefined;
  const described = fn.lspDoc?.params.find(
    (d) => d.name.toLowerCase() === param.name.toLowerCase()
  );
  const lines = [
    `**${fn.name}** · \`${param.name}\``,
    "",
    `${param.tipo}${param.isEnd ? " End" : ""}`,
  ];
  if (described?.description) lines.push("", described.description);
  return lines.join("\n");
}

function builtinHoverMarkdown(label: string, detail: string, documentation: string): vscode.MarkdownString {
  const safeDetail = detail.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return new vscode.MarkdownString(`**${label}** — ${safeDetail}\n\n${documentation}`);
}

function builtinParamHover(name: string, argIndex: number): string | undefined {
  const builtin = LSP_FUNCTION_CATALOG.find((e) => e.label.toLowerCase() === name.toLowerCase());
  if (!builtin) return undefined;
  const names = snippetParamNames(builtin.insertText);
  const param = orderedCatalogParams(
    builtin.documentation ?? "",
    names,
    builtin.params
  )[argIndex];
  if (!param || (!param.documentation.trim() && !param.tipo)) return undefined;
  return formatParamHover(builtin.label, param, names[argIndex]);
}

export function createHoverProvider(): vscode.HoverProvider {
  return {
    async provideHover(document, position) {
      const token = tokenAt(document, position);
      if (!token) return undefined;

      const source = document.getText();
      const ident = /^[A-Za-z_]/.test(token.name);
      const callee = ident && isDirectCallee(source, document.offsetAt(token.range.end));

      const idx = getWorkspaceSymbolIndex();
      const { local, peers } = await idx.getScopedEligible(document);
      const all = mergeEligible(local, peers, document.uri.toString());

      if (callee) {
        const fn = all.find((f) => f.name.toLowerCase() === token.name.toLowerCase());
        if (fn) {
          const md = new vscode.MarkdownString(markdownForFunction(fn));
          if (fn.uri !== document.uri.toString()) {
            md.appendMarkdown(`\n\n_Origem: \`${fn.fileName}\`_`);
          }
          return new vscode.Hover(md, token.range);
        }
        const builtin = LSP_FUNCTION_CATALOG.find(
          (e) => e.label.toLowerCase() === token.name.toLowerCase()
        );
        if (builtin) {
          return new vscode.Hover(
            builtinHoverMarkdown(builtin.label, builtin.detail, builtin.documentation ?? ""),
            token.range
          );
        }
      }

      const site = callSiteAt(source, document.offsetAt(position));
      let paramMd: string | undefined;
      if (site) {
        const fn = all.find((f) => f.name.toLowerCase() === site.name.toLowerCase());
        paramMd = fn ? userParamHover(fn, site.argIndex) : builtinParamHover(site.name, site.argIndex);
      }

      let symbolMd: string | undefined;
      if (ident) {
        const sys = findSystemVar(token.name);
        if (sys) {
          symbolMd = `**${sys.name}** — variável de sistema (${sys.tipo})\n\n${sys.documentation}`;
        } else {
          const fn = all.find((f) => f.name.toLowerCase() === token.name.toLowerCase());
          if (fn) {
            symbolMd = markdownForFunction(fn);
            if (fn.uri !== document.uri.toString()) {
              symbolMd += `\n\n_Origem: \`${fn.fileName}\`_`;
            }
          } else {
            const builtin = LSP_FUNCTION_CATALOG.find(
              (e) => e.label.toLowerCase() === token.name.toLowerCase()
            );
            if (builtin) {
              symbolMd = builtinHoverMarkdown(
                builtin.label,
                builtin.detail,
                builtin.documentation ?? ""
              ).value;
            }
          }
        }
      }

      if (paramMd && symbolMd) {
        const md = new vscode.MarkdownString(`${paramMd}\n\n---\n\n${symbolMd}`);
        return new vscode.Hover(md, token.range);
      }
      if (paramMd) return new vscode.Hover(new vscode.MarkdownString(paramMd), token.range);
      if (symbolMd) return new vscode.Hover(new vscode.MarkdownString(symbolMd), token.range);
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
      const site = callSiteAt(document.getText(), document.offsetAt(position));
      if (!site) return undefined;
      const { name, argIndex: activeParameter } = site;

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
          signatureLabelFromSnippet(builtin.insertText),
          signatureOverview(builtin.documentation ?? builtin.detail)
        );
        const paramNames = snippetParamNames(builtin.insertText);
        const ordered = orderedCatalogParams(
          builtin.documentation ?? "",
          paramNames,
          builtin.params
        );
        if (paramNames.length) {
          sig.parameters = paramNames.map((snippetName, index) => {
            const param = ordered[index];
            const doc = param ? formatParamHover(builtin.label, param, snippetName) : undefined;
            return new vscode.ParameterInformation(snippetName, doc);
          });
        }
        const help = new vscode.SignatureHelp();
        help.signatures = [sig];
        help.activeSignature = 0;
        help.activeParameter = paramNames.length
          ? Math.min(Math.max(0, activeParameter), paramNames.length - 1)
          : Math.max(0, activeParameter);
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
