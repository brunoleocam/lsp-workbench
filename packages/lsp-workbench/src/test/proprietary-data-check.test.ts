import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const repoRoot = join(__dirname, "..", "..", "..", "..");
const script = join(repoRoot, "scripts", "check-proprietary-data.mjs");
const dir = mkdtempSync(join(tmpdir(), "lsp-prop-"));

function run(...files: string[]) {
  return spawnSync(process.execPath, [script, ...files], { cwd: repoRoot, encoding: "utf8" });
}

function catalogWith(count: number, origem?: string): string {
  const functions: Record<string, unknown> = {};
  for (let i = 0; i < count; i++) {
    functions[`fake${i}`] = { nome: `Fake${i}`, params: [], ...(origem ? { origem: [origem] } : {}) };
  }
  return JSON.stringify({ $schema: "lsp-workbench-functions/v1", functions });
}

describe("check-proprietary-data (ADR-009 §5)", () => {
  it("exemplo público do contrato passa", () => {
    const r = run(join(repoRoot, "docs", "product", "schema", "functions.example.json"));
    assert.equal(r.status, 0, r.stderr);
  });

  it("catálogo com mais de 10 funções falha", () => {
    const f = join(dir, "grande.json");
    writeFileSync(f, catalogWith(11));
    assert.equal(run(f).status, 1);
  });

  it("origem sapienssrv.exe falha mesmo em catálogo pequeno", () => {
    const f = join(dir, "origem.json");
    writeFileSync(f, catalogWith(1, "Sapiens\\sapienssrv.exe"));
    assert.equal(run(f).status, 1);
  });

  it("tabela ou campo USU_ fora da lista de fictícios falha, em qualquer arquivo de texto", () => {
    const notListed = "USU_" + "T000XYZ";
    const f = join(dir, "regra.lsp");
    writeFileSync(f, `vaSQL = "SELECT USU_CAMPOA FROM ${notListed}";`);
    const r = run(f);
    assert.equal(r.status, 1);
    assert.ok(r.stderr.includes(notListed), r.stderr);
  });

  it("USU_ fictício da lista passa", () => {
    const f = join(dir, "ficticio.lsp");
    writeFileSync(f, 'vaSQL = "SELECT USU_CAMPOA FROM USU_T999ZZZ WHERE USU_CAMPOB = 1";');
    assert.equal(run(f).status, 0);
  });

  it("arquivos versionados do repo passam", () => {
    const r = run();
    assert.equal(r.status, 0, r.stderr);
  });
});
