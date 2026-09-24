import assert from "node:assert/strict";
import { describe, it } from "node:test";
import fs from "node:fs";
import path from "node:path";
import {
  clearLocalCatalogCache,
  columnsForTable,
  loadLocalCatalogFromFile,
  markCatalogColumns,
  parseLocalCatalogJson,
} from "../domain/local-catalog";

describe("local-catalog example", () => {
  it("E012FAM tem colunas do catalog.example.json", () => {
    clearLocalCatalogCache();
    const example = path.resolve(
      __dirname,
      "../../../../docs/banco-senior-base/catalog.example.json"
    );
    assert.ok(fs.existsSync(example), `faltou ${example}`);
    const catalog = loadLocalCatalogFromFile(
      example,
      (fp) => fs.readFileSync(fp, "utf8"),
      (fp) => fs.statSync(fp).mtimeMs
    );
    assert.ok(catalog);
    const cols = columnsForTable(catalog!, "E012FAM");
    const names = cols.map((c) => c.name);
    assert.deepEqual(names, ["CodEmp", "CodFam", "DesFam", "TipPro"]);
    assert.deepEqual(
      cols.filter((c) => c.key).map((c) => c.name),
      ["CodEmp", "CodFam"]
    );
  });

  it("mantém a ordem do banco e só marca a chave", () => {
    const catalog = parseLocalCatalogJson(
      JSON.stringify({
        version: 1,
        tables: [
          {
            name: "E001TNS",
            primaryKey: ["CodEmp", "CodTns"],
            columns: [
              { name: "ZetaOrd", type: "Alfa(1)" },
              { name: "USU_Alfa", type: "Alfa(10)" },
              { name: "CodTns", type: "Alfa(5)" },
              { name: "AbrX", type: "Alfa(3)" },
              { name: "CodEmp", type: "Número(4)" },
              { name: "USU_Zeta", type: "Alfa(2)" },
            ],
          },
        ],
      })
    );
    assert.ok(catalog);
    assert.deepEqual(catalog!.tables[0].primaryKey, ["CodEmp", "CodTns"]);
    const cols = markCatalogColumns(catalog!.tables[0]);
    assert.deepEqual(
      cols.map((c) => c.name),
      ["ZetaOrd", "USU_Alfa", "CodTns", "AbrX", "CodEmp", "USU_Zeta"]
    );
    assert.deepEqual(
      cols.map((c) => c.key === true),
      [false, false, true, false, true, false]
    );
    const filtered = columnsForTable(catalog!, "e001tns", "Cod");
    assert.deepEqual(
      filtered.map((c) => c.name),
      ["CodTns", "CodEmp"]
    );
  });
});
