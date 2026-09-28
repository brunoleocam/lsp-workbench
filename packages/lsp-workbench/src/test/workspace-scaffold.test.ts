import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  mergeFileAssociations,
  partitionScaffold,
  planWorkspaceScaffold,
  type ScaffoldSourceFile,
} from "../domain/workspace-scaffold";

const sources: ScaffoldSourceFile[] = [
  {
    path: "rules/lsp-nucleo.mdc",
    contents: "---\nalwaysApply: true\n---\n# Núcleo\n\n- Banco / SQL: catalog.json\n",
  },
  {
    path: "rules/lsp-banco-http.mdc",
    contents:
      '---\ndescription: Banco\nglobs: "**/*.{lsp,lspt}"\nalwaysApply: false\n---\n# Banco\n',
  },
  {
    path: "skills/lsp-banco/SKILL.md",
    contents: "---\nname: lsp-banco\n---\n# Banco\n",
  },
  {
    path: "commands/compilar-lsp.md",
    contents: "---\nname: compilar-lsp\ndescription: Pré-compilação\n---\n\nValidar.\n",
  },
];

describe("planWorkspaceScaffold", () => {
  const planned = planWorkspaceScaffold(sources);
  const byPath = new Map(planned.map((file) => [file.path, file.contents]));

  it("copia rules, skills e commands para .cursor", () => {
    assert.match(byPath.get(".cursor/rules/lsp-nucleo.mdc") ?? "", /catalog\.json/);
    assert.match(byPath.get(".cursor/skills/lsp-banco/SKILL.md") ?? "", /lsp-banco/);
    assert.match(byPath.get(".cursor/commands/compilar-lsp.md") ?? "", /Validar/);
  });

  it("gera instruções, skill e prompt do Copilot", () => {
    assert.match(byPath.get(".github/copilot-instructions.md") ?? "", /catalog\.json/);
    assert.match(byPath.get(".github/copilot-instructions.md") ?? "", /# Núcleo/);
    const banco = byPath.get(".github/instructions/lsp-banco-http.instructions.md") ?? "";
    assert.match(banco, /applyTo: "\*\*\/\*\.\{lsp,lspt\}"/);
    assert.match(byPath.get(".github/skills/lsp-banco/SKILL.md") ?? "", /lsp-banco/);
    const prompt = byPath.get(".github/prompts/compilar-lsp.prompt.md") ?? "";
    assert.match(prompt, /name: "compilar-lsp"/);
    assert.match(prompt, /description: "Pré-compilação"/);
    assert.equal(byPath.has(".github/instructions/lsp-nucleo.instructions.md"), false);
  });

  it("recusa caminho fora dos templates", () => {
    assert.throws(() => planWorkspaceScaffold([{ path: "../segredo.md", contents: "x" }]));
  });
});

describe("partitionScaffold", () => {
  const planned = planWorkspaceScaffold(sources);

  it("separa arquivo novo, igual e diferente", () => {
    const nucleo = planned.find((file) => file.path === ".cursor/rules/lsp-nucleo.mdc");
    assert.ok(nucleo);
    const partition = partitionScaffold(planned, (relativePath) => {
      if (relativePath === nucleo.path) return nucleo.contents.replace(/\n/g, "\r\n");
      if (relativePath === ".github/copilot-instructions.md") return "outro\n";
      return null;
    });
    assert.ok(partition.unchanged.some((file) => file.path === nucleo.path));
    assert.ok(partition.conflict.some((file) => file.path === ".github/copilot-instructions.md"));
    assert.ok(partition.create.some((file) => file.path === ".cursor/skills/lsp-banco/SKILL.md"));
  });
});

describe("mergeFileAssociations", () => {
  it("acrescenta .lsp e .lspt sem trocar associação existente", () => {
    const merged = mergeFileAssociations({ "*.lsp": "plaintext", "*.txt": "senior-lsp" });
    assert.equal(merged.changed, true);
    assert.equal(merged.value["*.lsp"], "plaintext");
    assert.equal(merged.value["*.lspt"], "senior-lsp");
    assert.equal(merged.value["*.txt"], "senior-lsp");
  });

  it("não altera quando as duas extensões já estão mapeadas", () => {
    const merged = mergeFileAssociations({ "*.lsp": "senior-lsp", "*.lspt": "senior-lsp" });
    assert.equal(merged.changed, false);
  });
});
