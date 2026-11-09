import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  countBySeverity,
  createSaveHandler,
  formatCompileSummary,
  formatStatusBarText,
  SEVERITY_ERROR,
  SEVERITY_WARNING,
} from "../domain/compile-summary";

describe("countBySeverity", () => {
  it("conta só erros e avisos; info e hint ficam de fora", () => {
    const counts = countBySeverity([
      { severity: SEVERITY_ERROR },
      { severity: SEVERITY_WARNING },
      { severity: SEVERITY_ERROR },
      { severity: 2 },
      { severity: 3 },
    ]);
    assert.deepEqual(counts, { errors: 2, warnings: 1 });
  });

  it("lista vazia dá zero", () => {
    assert.deepEqual(countBySeverity([]), { errors: 0, warnings: 0 });
  });
});

describe("formatCompileSummary (AC-010)", () => {
  it("plural de erros e singular de aviso", () => {
    assert.equal(formatCompileSummary({ errors: 2, warnings: 1 }), "2 erros, 1 aviso");
  });

  it("singular de erro e plural de avisos", () => {
    assert.equal(formatCompileSummary({ errors: 1, warnings: 3 }), "1 erro, 3 avisos");
  });

  it("documento limpo", () => {
    assert.equal(formatCompileSummary({ errors: 0, warnings: 0 }), "0 erros, 0 avisos");
  });
});

describe("createSaveHandler (AC-011)", () => {
  const lspDoc = { languageId: "senior-lsp" };

  function setup(setting: boolean | undefined) {
    const revalidated: unknown[] = [];
    const onSave = createSaveHandler({
      languageId: "senior-lsp",
      compileOnSave: () => setting,
      revalidate: (doc) => revalidated.push(doc),
    });
    return { onSave, revalidated };
  }

  it("sem configuração, salvar revalida", () => {
    const { onSave, revalidated } = setup(undefined);
    onSave(lspDoc);
    assert.deepEqual(revalidated, [lspDoc]);
  });

  it("com compileOnSave = false, salvar não revalida", () => {
    const { onSave, revalidated } = setup(false);
    onSave(lspDoc);
    assert.deepEqual(revalidated, []);
  });

  it("ignora documentos de outra linguagem", () => {
    const { onSave, revalidated } = setup(true);
    onSave({ languageId: "typescript" });
    assert.deepEqual(revalidated, []);
  });

  it("package.json declara lsp.compileOnSave com padrão true", () => {
    const pkg = JSON.parse(readFileSync(join(__dirname, "..", "..", "package.json"), "utf8"));
    assert.equal(pkg.contributes.configuration.properties["lsp.compileOnSave"].default, true);
  });

  it("package.json liga F9 ao lsp.compileDocument só em senior-lsp (AC-010)", () => {
    const pkg = JSON.parse(readFileSync(join(__dirname, "..", "..", "package.json"), "utf8"));
    const binding = pkg.contributes.keybindings.find(
      (k: { command: string }) => k.command === "lsp.compileDocument"
    );
    assert.equal(binding.key, "f9");
    assert.equal(binding.when, "editorLangId == senior-lsp");
  });
});

describe("formatStatusBarText (AC-012)", () => {
  it("usa os ícones de erro e aviso do VS Code", () => {
    assert.equal(formatStatusBarText({ errors: 2, warnings: 1 }), "$(error) 2 $(warning) 1");
  });

  it("mostra zeros em documento limpo", () => {
    assert.equal(formatStatusBarText({ errors: 0, warnings: 0 }), "$(error) 0 $(warning) 0");
  });
});
