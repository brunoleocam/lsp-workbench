import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { callSiteAt, isDirectCallee } from "../call-site";
import {
  formatParamHover,
  orderedCatalogParams,
  signatureOverview,
  snippetParamNames,
} from "../catalog-param-docs";
import { LSP_FUNCTION_CATALOG } from "../function-catalog";

function hoverOf(source: string, needle: string): string {
  const offset = source.indexOf(needle);
  assert.ok(offset >= 0, needle);
  const site = callSiteAt(source, offset);
  assert.ok(site, needle);
  const entry = LSP_FUNCTION_CATALOG.find((e) => e.label.toLowerCase() === site.name.toLowerCase());
  assert.ok(entry, site.name);
  const params = orderedCatalogParams(
    entry.documentation,
    snippetParamNames(entry.insertText),
    entry.params
  );
  const param = params[site.argIndex];
  assert.ok(param, `${site.name} arg ${site.argIndex}`);
  return formatParamHover(entry.label, param);
}

describe("call-site", () => {
  it("primeiro argumento, mesmo em outra linha", () => {
    const src = "ConverteMascara(\n  tipoDado, valorOrigem)";
    const site = callSiteAt(src, src.indexOf("tipoDado"));
    assert.equal(site?.name, "ConverteMascara");
    assert.equal(site?.argIndex, 0);
    const second = callSiteAt(src, src.indexOf("valorOrigem"));
    assert.equal(second?.argIndex, 1);
  });

  it("ignora vírgula dentro de string e comentário", () => {
    const src = 'Foo("a,b", /* , */ tipoDado)';
    const site = callSiteAt(src, src.indexOf("tipoDado"));
    assert.equal(site?.name, "Foo");
    assert.equal(site?.argIndex, 1);
  });

  it("chamada aninhada usa o parêntese mais interno", () => {
    const src = "Foo(Bar(1, 2), tipoDado)";
    assert.equal(callSiteAt(src, src.indexOf("1"))?.name, "Bar");
    assert.equal(callSiteAt(src, src.indexOf("tipoDado"))?.name, "Foo");
    assert.equal(callSiteAt(src, src.indexOf("tipoDado"))?.argIndex, 1);
  });

  it("offset com CRLF", () => {
    const src = "ConverteMascara(\r\n  tipoDado)";
    const site = callSiteAt(src, src.indexOf("tipoDado"));
    assert.equal(site?.name, "ConverteMascara");
    assert.equal(site?.argIndex, 0);
  });

  it("nome da função não é argumento", () => {
    const src = "ConverteMascara(tipoDado)";
    const end = src.indexOf("(");
    assert.equal(isDirectCallee(src, end), true);
    assert.equal(isDirectCallee(src, src.indexOf("tipoDado") + "tipoDado".length), false);
  });
});

describe("hover de parâmetro no catálogo", () => {
  it("tipoDado de ConverteMascara lista o enum e o caso Alfa", () => {
    const md = hoverOf(
      "ConverteMascara(tipoDado, valorOrigem, alfaDestino, mascara);",
      "tipoDado"
    );
    assert.match(md, /Tipo_Dado/);
    assert.match(md, /\(Numero\)/);
    assert.match(md, /Valor numérico/);
    assert.match(md, /Use um destes códigos:/);
    assert.match(md, /\n\n- `1`: Número/);
    assert.match(md, /- `2`: Dinheiro/);
    assert.match(md, /- `3`: Data/);
    assert.match(md, /- `4`: Hora/);
    assert.match(md, /- `5`: Alfa/);
    assert.match(md, /tipo de dado ser 5/);
  });

  it("parâmetro Alfa de ConverteMascara não herda o enum numérico", () => {
    const md = hoverOf(
      "ConverteMascara(tipoDado, valorOrigem, alfaDestino, mascara);",
      "alfaDestino"
    );
    assert.match(md, /\(Alfa\)/);
    assert.doesNotMatch(md, /Número/);
  });

  it("o número 1 no mesmo argumento também cai em tipoDado", () => {
    const md = hoverOf('ConverteMascara(1, vnCgc, vaInscr, "999");', "1");
    assert.match(md, /Número/);
  });

  it("GeraHash, RetDiaSemana, Cancel e Mensagem", () => {
    assert.match(hoverOf("GeraHash(vaTexto, algoritmo, vaHash);", "algoritmo"), /SHA-256/);
    assert.match(hoverOf("RetDiaSemana(vnData, vnDia);", "vnDia"), /Domingo/);
    assert.match(hoverOf("Cancel(1);", "1"), /fórmula/);
    assert.match(hoverOf("Mensagem(Erro, vaMsg);", "Erro"), /Advertencia/);
  });

  it("Mensagem documenta botões no texto e na descrição", () => {
    const entry = LSP_FUNCTION_CATALOG.find((e) => e.label === "Mensagem");
    assert.ok(entry);
    assert.match(entry.documentation, /\[&Sim,&Não\]/);
    assert.match(signatureOverview(entry.documentation), /\[&Ok!!!\]/);
    assert.match(hoverOf('Mensagem(Retorna, "Deseja Sair ? [&Sim,&Não]");', "Deseja"), /\[&Sim,&Não\]/);
    assert.match(hoverOf('Mensagem(Retorna, "Deseja Sair ? [&Sim,&Não]");', "Deseja"), /\$Cancelar/);
  });
});
