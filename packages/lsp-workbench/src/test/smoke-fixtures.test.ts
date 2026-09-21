import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { analyzeLsp } from "../diagnostics";
import { IMPLEMENTED_RULE_IDS } from "../rule-catalog";

type ManifestFile = {
  path: string;
  expectIds: string[];
  pendingIds?: string[];
  note?: string;
  /** Simula peers elegíveis (FUN009). */
  scopedExternal?: Record<string, { fileName: string }>;
  /** Contexto de projeto de relatório (GER*). */
  reportContext?: {
    eventKind:
      | "pre-selecao"
      | "selecao"
      | "inicializacao"
      | "finalizacao"
      | "funcoes-globais"
      | "imprimir-pagina"
      | "antes-imprimir"
      | "depois-imprimir"
      | "outro";
    sectionNames: string[];
  };
};

type Manifest = {
  pendingIds?: string[];
  files: ManifestFile[];
};

const fixturesDir = path.resolve(__dirname, "../../fixtures");
const manifest: Manifest = JSON.parse(
  fs.readFileSync(path.join(fixturesDir, "MANIFEST.json"), "utf8")
);

describe("smoke fixtures (MANIFEST)", () => {
  for (const file of manifest.files) {
    it(`${file.path} → expect [${file.expectIds.join(", ") || "∅"}]`, () => {
      const full = path.join(fixturesDir, file.path);
      assert.ok(fs.existsSync(full), `fixture ausente: ${file.path}`);
      const src = fs.readFileSync(full, "utf8");
      const scopedExternal = file.scopedExternal
        ? new Map(Object.entries(file.scopedExternal))
        : undefined;
      const hits = analyzeLsp(src, {
        scopedExternal,
        reportContext: file.reportContext,
      });
      const found = new Set(hits.map((h) => h.id.toUpperCase()));

      for (const id of file.expectIds) {
        assert.ok(
          found.has(id.toUpperCase()),
          `${file.path}: faltou ${id}. Achados: ${[...found].sort().join(", ") || "(nenhum)"}`
        );
      }

      // baseline limpo: não pode ter erro/aviso
      if (file.expectIds.length === 0 && !file.pendingIds?.length) {
        assert.equal(
          hits.length,
          0,
          `${file.path}: esperava 0 diagnósticos, veio ${[...found].join(", ")}`
        );
      }
    });
  }

  it("cobre todos os IDs implementados (exceto pending)", () => {
    const pending = new Set(
      [...(manifest.pendingIds || []), ...manifest.files.flatMap((f) => f.pendingIds || [])].map(
        (x) => x.toUpperCase()
      )
    );
    const covered = new Set<string>();
    for (const file of manifest.files) {
      for (const id of file.expectIds) covered.add(id.toUpperCase());
    }

    const missing: string[] = [];
    for (const id of IMPLEMENTED_RULE_IDS) {
      const up = id.toUpperCase();
      if (pending.has(up)) continue;
      if (!covered.has(up)) missing.push(up);
    }

    assert.deepEqual(
      missing,
      [],
      `IDs sem fixture: ${missing.join(", ")}. Atualize fixtures/MANIFEST.json`
    );
  });
});
