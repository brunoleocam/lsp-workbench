import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  BINARY_RULE_SCHEME,
  binaryRuleDiskPath,
  documentDiskPath,
  editedCopyNotice,
  editedCopyPath,
  isEditedCopyPath,
  resolveBinaryRuleFile,
  seniorExportDefaultPath,
  shouldOpenAsBinaryRule,
} from "../domain/binary-rule-paths";

describe("seniorExportDefaultPath (AC-080)", () => {
  it("sugere <NOME>.senior.LSP na mesma pasta do texto", () => {
    assert.equal(seniorExportDefaultPath("C:\\r\\minha-regra.lsp"), "C:\\r\\MINHA-REGRA.senior.LSP");
    assert.equal(seniorExportDefaultPath("C:\\r\\hr01.lspt"), "C:\\r\\HR01.senior.LSP");
    assert.equal(seniorExportDefaultPath("/r/Regra.Nova.lsptxt"), "/r/REGRA.NOVA.senior.LSP");
  });
});

describe("editedCopyPath (REQ-071)", () => {
  it("põe .editado antes da extensão, mantendo a caixa da extensão", () => {
    assert.equal(editedCopyPath("C:\\regras\\SARG008.LSP"), "C:\\regras\\SARG008.editado.LSP");
    assert.equal(editedCopyPath("/r/sarg008.lsp"), "/r/sarg008.editado.lsp");
  });

  it("a cópia é ela mesma (nunca vira o original)", () => {
    assert.equal(editedCopyPath("C:\\regras\\SARG008.editado.LSP"), "C:\\regras\\SARG008.editado.LSP");
    assert.equal(isEditedCopyPath("C:\\regras\\SARG008.EDITADO.lsp"), true);
    assert.equal(isEditedCopyPath("C:\\regras\\SARG008.LSP"), false);
  });
});

describe("resolveBinaryRuleFile (AC-074)", () => {
  const original = "C:\\regras\\SARG008.LSP";
  const copy = "C:\\regras\\SARG008.editado.LSP";

  it("com cópia ao lado, lê a cópia e avisa", () => {
    const r = resolveBinaryRuleFile(original, (p) => p === copy);
    assert.deepEqual(r, { readPath: copy, writePath: copy, readsEditedCopy: true });
    assert.equal(
      editedCopyNotice(r.writePath),
      "Abrindo a cópia editada SARG008.editado.LSP; o original não foi alterado"
    );
  });

  it("sem cópia, lê o original e grava na cópia", () => {
    const r = resolveBinaryRuleFile(original, () => false);
    assert.deepEqual(r, { readPath: original, writePath: copy, readsEditedCopy: false });
  });

  it("abrir a cópia direto lê e grava nela mesma, sem aviso", () => {
    const r = resolveBinaryRuleFile(copy, () => true);
    assert.deepEqual(r, { readPath: copy, writePath: copy, readsEditedCopy: false });
  });
});

describe("shouldOpenAsBinaryRule (AC-070)", () => {
  const binary = () => true;

  it("redireciona .LSP binário aberto como file: com autoOpen ligado", () => {
    assert.equal(
      shouldOpenAsBinaryRule({ scheme: "file", fsPath: "C:\\r\\SARG008.LSP", autoOpen: true }, binary),
      true
    );
  });

  it("com lsp.binary.autoOpen=false o redirecionamento não ocorre", () => {
    let probed = false;
    const result = shouldOpenAsBinaryRule(
      { scheme: "file", fsPath: "C:\\r\\SARG008.LSP", autoOpen: false },
      () => (probed = true)
    );
    assert.equal(result, false);
    assert.equal(probed, false);
  });

  it("não redireciona .lsp texto, .lspt nem outro esquema", () => {
    assert.equal(
      shouldOpenAsBinaryRule({ scheme: "file", fsPath: "C:\\r\\a.lsp", autoOpen: true }, () => false),
      false
    );
    assert.equal(
      shouldOpenAsBinaryRule({ scheme: "file", fsPath: "C:\\r\\a.lspt", autoOpen: true }, binary),
      false
    );
    assert.equal(
      shouldOpenAsBinaryRule(
        { scheme: BINARY_RULE_SCHEME, fsPath: "C:\\r\\SARG008.LSP", autoOpen: true },
        binary
      ),
      false
    );
  });
});

describe("binaryRuleDiskPath — compartilhamento de rede", () => {
  it("devolve o caminho UNC quando a URI lsp-binario tem servidor", () => {
    assert.equal(
      binaryRuleDiskPath("10.0.0.9", "\\Arquivos\\Ti\\8 - Diarios\\SARG664.LSP"),
      "\\\\10.0.0.9\\Arquivos\\Ti\\8 - Diarios\\SARG664.LSP"
    );
    assert.equal(binaryRuleDiskPath("srv", "/Arquivos/SARG664.LSP"), "//srv/Arquivos/SARG664.LSP");
  });

  it("mantém o caminho local quando não há servidor", () => {
    assert.equal(binaryRuleDiskPath("", "c:\\r\\SARG008.LSP"), "c:\\r\\SARG008.LSP");
  });
});

describe("documentDiskPath", () => {
  it("lsp-binario em rede volta com o servidor; file: fica como o VS Code entrega", () => {
    assert.equal(
      documentDiskPath({ scheme: BINARY_RULE_SCHEME, authority: "srv", fsPath: "\\Arq\\A.LSP" }),
      "\\\\srv\\Arq\\A.LSP"
    );
    assert.equal(
      documentDiskPath({ scheme: "file", authority: "srv", fsPath: "\\\\srv\\Arq\\a.lsp" }),
      "\\\\srv\\Arq\\a.lsp"
    );
  });
});

describe("package.json — .LSP binário (D4)", () => {
  const pkg = JSON.parse(readFileSync(join(__dirname, "..", "..", "package.json"), "utf8"));

  it("lsp.binary.autoOpen existe com padrão true", () => {
    const prop = pkg.contributes.configuration.properties["lsp.binary.autoOpen"];
    assert.equal(prop.type, "boolean");
    assert.equal(prop.default, true);
  });

  it("comando para abrir manualmente, no Explorer só para .lsp", () => {
    const cmd = pkg.contributes.commands.find((c: { command: string }) => c.command === "lsp.openBinaryRule");
    assert.equal(cmd?.title, "Abrir regra .LSP binária");
    const menu = pkg.contributes.menus["explorer/context"].find(
      (m: { command: string }) => m.command === "lsp.openBinaryRule"
    );
    assert.ok(menu);
    assert.match(menu.when, /resourceExtname/);
  });

  it("gerar .LSP: comando no título do editor e na paleta só para senior-lsp em file: (AC-080)", () => {
    const when = "editorLangId == senior-lsp && resourceScheme == file";
    assert.ok(pkg.contributes.commands.some((c: { command: string }) => c.command === "lsp.generateSeniorRule"));
    for (const menu of ["editor/title", "commandPalette"]) {
      const entry = pkg.contributes.menus[menu].find(
        (m: { command: string }) => m.command === "lsp.generateSeniorRule"
      );
      assert.equal(entry?.when, when, menu);
    }
    assert.ok(pkg.activationEvents.includes("onCommand:lsp.generateSeniorRule"));
  });

  it(".lsptxt usa a linguagem senior-lsp (AC-084)", () => {
    const lang = pkg.contributes.languages.find((l: { id: string }) => l.id === "senior-lsp");
    assert.ok(lang.extensions.includes(".lsptxt"));
  });

  it("ativa pelo esquema próprio e por workspace com .lsp", () => {
    assert.ok(pkg.activationEvents.includes(`onFileSystem:${BINARY_RULE_SCHEME}`));
    assert.ok(pkg.activationEvents.includes("onCommand:lsp.openBinaryRule"));
    assert.ok(pkg.activationEvents.some((e: string) => /^workspaceContains:.*\.lsp/i.test(e)));
  });
});
