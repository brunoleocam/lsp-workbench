import assert from "node:assert/strict";
import { describe, it } from "node:test";
import fs from "node:fs";
import path from "node:path";
import {
  clearLocalCatalogCache,
  columnsForTable,
  loadLocalCatalogFromFile,
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
  });
});
