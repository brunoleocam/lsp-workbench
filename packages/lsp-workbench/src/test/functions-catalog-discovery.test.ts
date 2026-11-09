import { describe, it } from "node:test";
import assert from "node:assert/strict";
import * as path from "node:path";
import { resolveFunctionsCatalogPath } from "../domain/functions-catalog-discovery";

const ROOT = path.resolve("/ws");
const ext = (id: string, functionsCatalog?: unknown) => ({
  id,
  extensionPath: path.resolve("/ext", id),
  packageJSON: functionsCatalog === undefined ? {} : { lspWorkbench: { functionsCatalog } },
});

function existsOnly(...paths: string[]) {
  const set = new Set(paths.map((p) => path.resolve(p)));
  return (p: string) => set.has(path.resolve(p));
}

describe("resolveFunctionsCatalogPath (AC-032)", () => {
  it("extensão que declara lspWorkbench.functionsCatalog → path relativo ao extensionPath", () => {
    const expected = path.resolve("/ext/acme.cat/functions/functions.json");
    const r = resolveFunctionsCatalogPath({
      workspaceRoot: ROOT,
      extensions: [ext("outra.ext"), ext("acme.cat", "functions/functions.json")],
      exists: existsOnly(expected),
    });
    assert.equal(r.path, expected);
    assert.equal(r.source, "extension:acme.cat");
  });

  it("lsp.functions.path tem precedência (relativo ao workspace)", () => {
    const fromSetting = path.resolve("/ws/cat/f.json");
    const fromExt = path.resolve("/ext/acme.cat/functions/functions.json");
    const r = resolveFunctionsCatalogPath({
      settingPath: "cat/f.json",
      workspaceRoot: ROOT,
      extensions: [ext("acme.cat", "functions/functions.json")],
      exists: existsOnly(fromSetting, fromExt),
    });
    assert.equal(r.path, fromSetting);
    assert.equal(r.source, "setting");
  });

  it("setting apontando para arquivo inexistente cai para a extensão", () => {
    const fromExt = path.resolve("/ext/acme.cat/functions/functions.json");
    const r = resolveFunctionsCatalogPath({
      settingPath: path.resolve("/nao/existe.json"),
      workspaceRoot: ROOT,
      extensions: [ext("acme.cat", "functions/functions.json")],
      exists: existsOnly(fromExt),
    });
    assert.equal(r.path, fromExt);
  });

  it("várias extensões: vence a 1ª por ID e as outras são listadas", () => {
    const a = path.resolve("/ext/a.cat/f.json");
    const b = path.resolve("/ext/b.cat/f.json");
    const r = resolveFunctionsCatalogPath({
      workspaceRoot: ROOT,
      extensions: [ext("b.cat", "f.json"), ext("a.cat", "f.json")],
      exists: existsOnly(a, b),
    });
    assert.equal(r.path, a);
    assert.deepEqual(r.ignored, ["b.cat"]);
  });

  it("chave com valor não-texto ou arquivo ausente é ignorada", () => {
    const r = resolveFunctionsCatalogPath({
      workspaceRoot: ROOT,
      extensions: [ext("x.cat", 42), ext("y.cat", "nao-existe.json")],
      exists: existsOnly(),
    });
    assert.equal(r.path, undefined);
  });

  it("nenhuma fonte → undefined", () => {
    const r = resolveFunctionsCatalogPath({ workspaceRoot: ROOT, extensions: [], exists: existsOnly() });
    assert.equal(r.path, undefined);
    assert.deepEqual(r.ignored, []);
  });
});
