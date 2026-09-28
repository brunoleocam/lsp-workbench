import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  nextCursorDisabledLanguages,
  resolveLanguageSettingTarget,
  resolveSettingTarget,
  valueAtTarget,
} from "../ghost-mode";

describe("resolveLanguageSettingTarget", () => {
  it("grava no usuário quando só o default da extensão define a chave", () => {
    assert.equal(resolveLanguageSettingTarget(undefined), "global");
    assert.equal(resolveLanguageSettingTarget({}), "global");
  });

  it("atualiza o workspace se o projeto já fixou a linguagem", () => {
    assert.equal(
      resolveLanguageSettingTarget({ workspaceLanguageValue: false }),
      "workspace"
    );
  });

  it("prefere a pasta do workspace quando ela também define a chave", () => {
    assert.equal(
      resolveLanguageSettingTarget({
        workspaceLanguageValue: false,
        workspaceFolderLanguageValue: true,
      }),
      "workspaceFolder"
    );
  });
});

describe("resolveSettingTarget", () => {
  it("segue o mesmo critério de escopo para settings sem override de linguagem", () => {
    assert.equal(resolveSettingTarget(undefined), "global");
    assert.equal(resolveSettingTarget({ workspaceValue: ["senior-lsp"] }), "workspace");
  });
});

describe("valueAtTarget", () => {
  it("lê só o escopo que será gravado", () => {
    const inspected = {
      workspaceValue: ["senior-lsp"],
      globalValue: ["markdown"],
    };
    assert.deepEqual(valueAtTarget(inspected, resolveSettingTarget(inspected)), ["senior-lsp"]);
  });
});

describe("nextCursorDisabledLanguages", () => {
  it("não cria a lista se ela ainda não existe", () => {
    assert.equal(nextCursorDisabledLanguages(undefined, "senior-lsp", true), undefined);
    assert.equal(nextCursorDisabledLanguages(undefined, "senior-lsp", false), undefined);
  });

  it("tira a linguagem da lista ao ativar o Modo Ghost", () => {
    assert.deepEqual(
      nextCursorDisabledLanguages(["senior-lsp", "markdown"], "senior-lsp", true),
      ["markdown"]
    );
  });

  it("recoloca a linguagem ao desativar, sem duplicar", () => {
    assert.deepEqual(nextCursorDisabledLanguages(["markdown"], "senior-lsp", false), [
      "markdown",
      "senior-lsp",
    ]);
    assert.equal(
      nextCursorDisabledLanguages(["senior-lsp"], "senior-lsp", false),
      undefined
    );
  });

  it("não altera a lista se a linguagem já está liberada", () => {
    assert.equal(nextCursorDisabledLanguages(["markdown"], "senior-lsp", true), undefined);
  });
});
