import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { analyzeLsp } from "../index";
import {
  catalogParamAcceptsField,
  descriptionAcceptsCampoVariavel,
  LSP_FUNCTION_CATALOG_ERP,
  LSP_FUNCTION_CATALOG_GENERATED,
  LSP_FUNCTION_CATALOG_HCM,
  LSP_FUNCTION_CATALOG_OVERRIDES,
} from "../lint/function-catalog";
import type { LspFunctionEntry } from "../lint/function-catalog.types";

function paramDescriptionsFromDocs(documentation: string): string[] {
  const parts = documentation.split(/\*\*Par[aâ]metros\*\*/i);
  if (parts.length < 2) return [];
  const section = (parts[1] ?? "").split(/\n\*\*[^*]+\*\*/)[0] ?? "";
  const descs: string[] = [];
  for (const line of section.split("\n")) {
    if (/^\s/.test(line)) continue;
    const m = line.match(/^- `[^`]+`\s*(?:\([^)]*\))?\s*(?:—|--|:|-)\s*(.+)$/);
    if (m?.[1]) descs.push(m[1]);
  }
  return descs;
}

function entryParamTexts(entry: LspFunctionEntry): string[] {
  const fromParams = (entry.params ?? [])
    .filter((p) => p.name.trim())
    .map((p) => p.description ?? "");
  const fromDocs = paramDescriptionsFromDocs(entry.documentation);
  const count = Math.max(fromParams.length, fromDocs.length);
  const texts: string[] = [];
  for (let i = 0; i < count; i++) {
    texts.push(`${fromParams[i] ?? ""} ${fromDocs[i] ?? ""}`);
  }
  return texts;
}

const CATALOGS = [
  LSP_FUNCTION_CATALOG_HCM,
  LSP_FUNCTION_CATALOG_ERP,
  LSP_FUNCTION_CATALOG_GENERATED,
  LSP_FUNCTION_CATALOG_OVERRIDES,
];

describe("RUL005 Campo/Variável em qualquer função do catálogo", () => {
  it("todo parâmetro com Campo/Variável na descrição aceita Objeto.Campo", () => {
    const forbidsTableField = new Set<string>();
    for (const catalog of CATALOGS) {
      for (const entry of catalog) {
        if (/n[aã]o pode ser campo do sistema ou de tabela/i.test(entry.documentation)) {
          forbidsTableField.add(entry.label.toLowerCase());
        }
      }
    }
    const misses: string[] = [];
    const functions = new Set<string>();
    for (const catalog of CATALOGS) {
      for (const entry of catalog) {
        if (forbidsTableField.has(entry.label.toLowerCase())) continue;
        entryParamTexts(entry).forEach((text, index) => {
          if (!descriptionAcceptsCampoVariavel(text)) return;
          functions.add(entry.label.toLowerCase());
          if (!catalogParamAcceptsField(entry.label, index)) {
            misses.push(`${entry.label}#${index}: ${text.slice(0, 80)}`);
          }
        });
      }
    }
    assert.deepEqual(misses, []);
    assert.ok(functions.has("intparaalfa"));
    assert.ok(functions.size >= 20, `esperava dezenas de funções, veio ${functions.size}`);
  });

  it("menção subordinada a tamanho ou posição não libera o parâmetro", () => {
    assert.equal(catalogParamAcceptsField("TamanhoAlfa", 0), true);
    assert.equal(catalogParamAcceptsField("TamanhoAlfa", 1), false);
    assert.equal(catalogParamAcceptsField("LerPosicaoAlfa", 0), true);
    assert.equal(catalogParamAcceptsField("LerPosicaoAlfa", 2), false);
    assert.equal(catalogParamAcceptsField("BuscaLinhaTexto", 0), true);
    assert.equal(catalogParamAcceptsField("PosicaoAlfa", 1), true);
    assert.equal(catalogParamAcceptsField("EstaNulo", 0), true);
    assert.equal(catalogParamAcceptsField("RestoDivisao", 0), true);
    assert.equal(catalogParamAcceptsField("RestoDivisao", 2), false);
    assert.equal(catalogParamAcceptsField("UltimoDia", 0), false);
  });

  it("chamadas com Objeto.Campo no parâmetro Campo/Variável não geram RUL005", () => {
    const lines = [
      "IntParaAlfa(E900COP.NUMORP, vaNumOrpPai);",
      "TamanhoAlfa(E085Cli.NomCli, vnTam);",
      "Concatena(E085Cli.NomCli, vaB, vaC, vaResultado);",
      "DataExtenso(E900COP.DATGER, vaExtenso);",
      "DesMontaData(E900COP.DATGER, vnDia, vnMes, vnAno);",
      "QuebraTexto(E085Cli.NomCli, vnTamLinha, vnQtdLinhas);",
      "CaracterParaAlfa(E900COP.CODASCII, vaChar);",
      "PosicaoAlfa(vaBusca, E085Cli.NomCli, vnPos);",
      "BuscaLinhaTexto(E085Cli.NomCli, vnLinha, vaLinha);",
      "Extenso(E900COP.VLRORP, 40, 40, 40, vaL1, vaL2, vaL3);",
    ];
    for (const line of lines) {
      const hits = analyzeLsp(`${line}\n`).filter((h) => h.id === "RUL005");
      assert.equal(hits.length, 0, line);
    }
  });
});
