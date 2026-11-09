import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { LSP_FUNCTION_CATALOG } from "../function-catalog";
import {
  buildEffectiveFunctionCatalog,
  effectiveFunctionCatalog,
  effectiveFunctionsMatchingPrefix,
  setEffectiveFunctionCatalog,
} from "../effective-function-catalog";
import { catalogForSystem } from "../domain/system-catalog";

const EXTRA = JSON.stringify({
  $schema: "lsp-workbench-functions/v1",
  functions: {
    fakesoextra: {
      nome: "FakeSoExtra",
      assinatura: "Funcao FakeSoExtra(Alfa Linha);",
      params: [{ tipo: "alfa", saida: false, nome: "Linha" }],
    },
    potencia: {
      nome: "Potencia",
      assinatura: "Funcao Potencia(Numero Base, Numero Expoente, Numero End Resultado);",
      params: [
        { tipo: "numero", saida: false, nome: "Base" },
        { tipo: "numero", saida: false, nome: "Expoente" },
        { tipo: "numero", saida: true, nome: "Resultado" },
      ],
    },
  },
});

afterEach(() => setEffectiveFunctionCatalog(undefined));

describe("buildEffectiveFunctionCatalog", () => {
  it("JSON válido → embutido + extra", () => {
    const r = buildEffectiveFunctionCatalog(EXTRA);
    assert.equal(r.error, undefined);
    assert.equal(r.extraCount, 2);
    assert.equal(r.catalog.length, LSP_FUNCTION_CATALOG.length + 1);
    assert.equal(r.catalog.find((e) => e.label === "Potencia")?.origin, "merged");
  });

  it("JSON quebrado ou fora do contrato → só o embutido, com erro", () => {
    for (const raw of ["{ quebrado", JSON.stringify({ foo: 1 })]) {
      const r = buildEffectiveFunctionCatalog(raw);
      assert.ok(r.error);
      assert.equal(r.catalog, LSP_FUNCTION_CATALOG);
    }
  });
});

describe("catálogo efetivo nos consumidores", () => {
  it("padrão é o embutido", () => {
    assert.equal(effectiveFunctionCatalog(), LSP_FUNCTION_CATALOG);
  });

  it("completion por prefixo e catálogo por sistema enxergam o extra", () => {
    setEffectiveFunctionCatalog(buildEffectiveFunctionCatalog(EXTRA).catalog);
    assert.ok(effectiveFunctionsMatchingPrefix("FakeSo").some((e) => e.label === "FakeSoExtra"));
    for (const sys of ["", "ERP", "HCM"]) {
      const cat = catalogForSystem(sys);
      assert.ok(cat.some((e) => e.label === "FakeSoExtra"), sys);
    }
    assert.equal(catalogForSystem("ERP").find((e) => e.label === "Potencia")?.origin, "merged");
  });
});
