import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  DATA_DICTIONARY_CMD,
  dictionaryColumnItems,
  dictionaryInsertText,
  dictionaryTableItems,
  suggestedDictionaryTable,
} from "../domain/data-dictionary";
import type { LocalCatalog } from "../domain/local-catalog";

const catalog: LocalCatalog = {
  version: 1,
  tables: [
    {
      name: "E075PRO",
      description: "Produtos",
      primaryKey: ["CodEmp", "CodPro"],
      columns: [
        { name: "CodEmp", type: "Número(4)", description: "Código da empresa" },
        { name: "CodPro", type: "Alfa(14)" },
        { name: "PreVen", type: "Numero", size: "15", decimals: "5" },
      ],
    },
    { name: "E085CLI", description: "Clientes", columns: [{ name: "CodCli", type: "Número(9)" }] },
    { name: "E085HCL", description: "Histórico de clientes por filial", columns: [] },
    { name: "E120PED", description: "Pedidos (código E085)", columns: [] },
  ],
};

const labels = (items: { label: string }[]) => items.map((i) => i.label);

describe("Dicionário de dados — tabelas (AC-065)", () => {
  it("sem filtro lista todas as tabelas com descrição e nº de campos", () => {
    const items = dictionaryTableItems(catalog, "");
    assert.deepEqual(labels(items), ["E075PRO", "E085CLI", "E085HCL", "E120PED"]);
    assert.deepEqual(items[0], { label: "E075PRO", description: "Produtos", detail: "3 campos" });
    assert.equal(items[2].detail, "0 campos");
  });

  it("filtra pelo nome sem diferenciar maiúsculas", () => {
    assert.deepEqual(labels(dictionaryTableItems(catalog, "e085")), ["E085CLI", "E085HCL", "E120PED"]);
  });

  it("filtra pela descrição, ignorando acentos", () => {
    assert.deepEqual(labels(dictionaryTableItems(catalog, "historico")), ["E085HCL"]);
    assert.deepEqual(labels(dictionaryTableItems(catalog, "cliente")), ["E085CLI", "E085HCL"]);
  });

  it("todas as palavras do filtro precisam aparecer no nome ou na descrição", () => {
    assert.deepEqual(labels(dictionaryTableItems(catalog, "clientes filial")), ["E085HCL"]);
    assert.deepEqual(labels(dictionaryTableItems(catalog, "e085 filial")), ["E085HCL"]);
  });

  it("nome que começa com o filtro vem antes de nome que só contém e de descrição", () => {
    assert.deepEqual(labels(dictionaryTableItems(catalog, "085")), ["E085CLI", "E085HCL", "E120PED"]);
    assert.deepEqual(labels(dictionaryTableItems(catalog, "E085")), ["E085CLI", "E085HCL", "E120PED"]);
  });

  it("filtro sem resultado devolve lista vazia", () => {
    assert.deepEqual(dictionaryTableItems(catalog, "inexistente"), []);
  });
});

describe("Dicionário de dados — campos e texto inserido (AC-065)", () => {
  it("primeiro item insere só a tabela; campos trazem tipo, tamanho, chave e descrição", () => {
    const table = catalog.tables[0];
    const items = dictionaryColumnItems(table);
    assert.deepEqual(items[0], {
      label: "$(table) Inserir só o nome da tabela",
      description: "E075PRO",
      insertText: "E075PRO",
    });
    assert.deepEqual(items[1], {
      label: "CodEmp",
      description: "Chave · Número(4)",
      detail: "Código da empresa",
      insertText: "E075PRO.CodEmp",
    });
    assert.equal(items[2].description, "Chave · Alfa(14)");
    assert.equal(items[2].detail, undefined);
    assert.equal(items[3].description, "Numero(15,5)");
  });

  it("texto inserido é TABELA.CAMPO, ou só TABELA sem campo", () => {
    assert.equal(dictionaryInsertText("E085CLI", "CodCli"), "E085CLI.CodCli");
    assert.equal(dictionaryInsertText("E085CLI"), "E085CLI");
  });

  it("palavra sob o cursor que é tabela vira filtro inicial (maiúsculas)", () => {
    assert.equal(suggestedDictionaryTable(catalog, "e085cli"), "E085CLI");
    assert.equal(suggestedDictionaryTable(catalog, "vnCodCli"), undefined);
    assert.equal(suggestedDictionaryTable(catalog, ""), undefined);
  });
});

describe("Dicionário de dados — package.json (AC-065)", () => {
  const pkg = JSON.parse(readFileSync(join(__dirname, "..", "..", "package.json"), "utf8"));
  const inLsp = "editorLangId == senior-lsp";

  it("declara o comando com ícone de banco", () => {
    const cmd = pkg.contributes.commands.find((c: { command: string }) => c.command === DATA_DICTIONARY_CMD);
    assert.ok(cmd, "comando ausente");
    assert.equal(cmd.title, "LSP Workbench: Dicionário de Dados (tabelas e campos)");
    assert.equal(cmd.icon, "$(database)");
  });

  it("liga Ctrl+Alt+D só em senior-lsp", () => {
    const binding = pkg.contributes.keybindings.find(
      (k: { command: string }) => k.command === DATA_DICTIONARY_CMD
    );
    assert.equal(binding.key, "ctrl+alt+d");
    assert.equal(binding.when, inLsp);
  });

  it("mostra o botão no título do editor só em senior-lsp", () => {
    const entry = pkg.contributes.menus["editor/title"].find(
      (m: { command: string }) => m.command === DATA_DICTIONARY_CMD
    );
    assert.equal(entry.when, inLsp);
    assert.match(entry.group, /^navigation/);
  });
});
