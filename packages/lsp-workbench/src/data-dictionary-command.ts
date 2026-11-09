import * as vscode from "vscode";
import { SENIOR_LSP_LANGUAGE_ID } from "./language";
import { getLocalCatalog } from "./adapters/vscode/local-catalog-loader";
import {
  DATA_DICTIONARY_CMD,
  dictionaryColumnItems,
  dictionaryTableItems,
  suggestedDictionaryTable,
  type DictionaryTableItem,
} from "./domain/data-dictionary";
import type { LocalCatalog } from "./domain/local-catalog";

function pickTable(catalog: LocalCatalog, initial: string): Promise<DictionaryTableItem | undefined> {
  const qp = vscode.window.createQuickPick<DictionaryTableItem & vscode.QuickPickItem>();
  qp.title = `Dicionário de dados (${catalog.tables.length} tabelas)`;
  qp.placeholder = "Tabela (nome ou descrição), ex.: E085CLI ou cliente";
  qp.matchOnDescription = true;
  const refill = (value: string) => {
    qp.items = dictionaryTableItems(catalog, value).map((i) => ({ ...i, alwaysShow: true }));
  };
  qp.onDidChangeValue(refill);
  qp.value = initial;
  refill(initial);
  return new Promise((resolve) => {
    qp.onDidAccept(() => {
      resolve(qp.selectedItems[0]);
      qp.hide();
    });
    qp.onDidHide(() => {
      resolve(undefined);
      qp.dispose();
    });
    qp.show();
  });
}

async function openDataDictionary(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (editor?.document.languageId !== SENIOR_LSP_LANGUAGE_ID) {
    void vscode.window.showWarningMessage("LSP: abra um arquivo LSP para usar o dicionário de dados.");
    return;
  }
  const catalog = getLocalCatalog();
  if (!catalog?.tables.length) {
    void vscode.window.showWarningMessage(
      "LSP: catálogo local de tabelas não encontrado. Configure lsp.catalog.path."
    );
    return;
  }
  const wordRange = editor.document.getWordRangeAtPosition(editor.selection.active);
  const word = wordRange ? editor.document.getText(wordRange) : "";
  const tableItem = await pickTable(catalog, suggestedDictionaryTable(catalog, word) ?? "");
  const table = tableItem && catalog.tables.find((t) => t.name === tableItem.label);
  if (!table) return;
  const column = await vscode.window.showQuickPick(dictionaryColumnItems(table), {
    title: table.description ? `${table.name}: ${table.description}` : table.name,
    placeHolder: "Campo (nome, tipo ou descrição)",
    matchOnDescription: true,
    matchOnDetail: true,
  });
  if (!column) return;
  await editor.edit((edit) => {
    for (const selection of editor.selections) edit.replace(selection, column.insertText);
  });
}

export function registerDataDictionaryCommand(context: vscode.ExtensionContext): void {
  context.subscriptions.push(vscode.commands.registerCommand(DATA_DICTIONARY_CMD, openDataDictionary));
}
