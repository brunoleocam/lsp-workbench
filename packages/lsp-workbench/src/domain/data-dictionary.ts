/**
 * Dicionário de dados (PDR-012, REQ-065): itens do QuickPick de tabelas e campos
 * a partir do catálogo local, e o texto inserido no editor.
 */
import { markCatalogColumns, type LocalCatalog, type LocalCatalogColumn, type LocalCatalogTable } from "./local-catalog";

export const DATA_DICTIONARY_CMD = "lsp.dataDictionary";

export type DictionaryTableItem = { label: string; description?: string; detail: string };
export type DictionaryColumnItem = {
  label: string;
  description: string;
  detail?: string;
  insertText: string;
};

function normalize(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
}

function tableItem(table: LocalCatalogTable): DictionaryTableItem {
  return {
    label: table.name,
    ...(table.description ? { description: table.description } : {}),
    detail: `${table.columns.length} campos`,
  };
}

/**
 * Tabelas cujo nome ou descrição contém todas as palavras do filtro (sem acento nem caixa).
 * Ordem: nome começa com o filtro, nome contém o filtro, demais; empate na ordem do catálogo.
 */
export function dictionaryTableItems(catalog: LocalCatalog, query: string): DictionaryTableItem[] {
  const q = normalize(query.trim());
  if (!q) return catalog.tables.map(tableItem);
  const terms = q.split(/\s+/);
  const ranked: { rank: number; table: LocalCatalogTable }[] = [];
  for (const table of catalog.tables) {
    const name = normalize(table.name);
    const haystack = `${name} ${normalize(table.description ?? "")}`;
    if (!terms.every((t) => haystack.includes(t))) continue;
    const rank = name.startsWith(q) ? 0 : name.includes(q) ? 1 : 2;
    ranked.push({ rank, table });
  }
  return ranked.sort((a, b) => a.rank - b.rank).map((r) => tableItem(r.table));
}

function columnType(column: LocalCatalogColumn): string {
  const type = column.type ?? "";
  if (!column.size || type.includes("(")) return type;
  const size = column.decimals ? `${column.size},${column.decimals}` : column.size;
  return `${type}(${size})`;
}

export function dictionaryInsertText(tableName: string, columnName?: string): string {
  return columnName ? `${tableName}.${columnName}` : tableName;
}

/** Primeiro item insere só a tabela; os demais, `TABELA.CAMPO` na ordem do banco. */
export function dictionaryColumnItems(table: LocalCatalogTable): DictionaryColumnItem[] {
  const items: DictionaryColumnItem[] = [
    {
      label: "$(table) Inserir só o nome da tabela",
      description: table.name,
      insertText: dictionaryInsertText(table.name),
    },
  ];
  for (const column of markCatalogColumns(table)) {
    items.push({
      label: column.name,
      description: [column.key ? "Chave" : "", columnType(column)].filter(Boolean).join(" · "),
      ...(column.description ? { detail: column.description } : {}),
      insertText: dictionaryInsertText(table.name, column.name),
    });
  }
  return items;
}

/** Nome da tabela (maiúsculas) quando a palavra sob o cursor é uma tabela do catálogo. */
export function suggestedDictionaryTable(catalog: LocalCatalog, word: string): string | undefined {
  const name = word.trim().toUpperCase();
  if (!name) return undefined;
  return catalog.tables.some((t) => t.name === name) ? name : undefined;
}
