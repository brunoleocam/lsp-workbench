import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  membersAfterDot,
  parseMemberAccess,
  extractListaFields,
  resolveReceiverKind,
} from "../domain/members";
import { completeMembersAt } from "../application/complete-members";
import {
  buildSemanticTokens,
  encodeSemanticTokens,
} from "../application/semantic-tokens";
import { buildOutline } from "../application/outline";
import {
  wrapSelection,
  toggleInicioFimToBraces,
  backslashLiteralToConcat,
} from "../application/refactors";
import {
  formatEmbeddedSqlInSource,
  formatSqlLiteral,
} from "../application/format-embedded-sql";
import { catalogForSystem } from "../domain/system-catalog";
import fs from "node:fs";
import path from "node:path";

const SRC = `
Definir Cursor Cur_Ped;
Definir Lista vlItens;
vlItens.AdicionarCampo("CODIGO", Numero);
vlItens.AdicionarCampo("NOME", Alfa);
`;

describe("ACC-MEM members", () => {
  it("ACC-MEM-01 cursor members after dot", () => {
    const m = membersAfterDot(SRC, "Cur_Ped", "");
    assert.ok(m.some((x) => x.name === "AbrirCursor"));
    assert.ok(m.some((x) => x.name === "Achou"));
  });

  it("membros de Lista em ordem alfabética", () => {
    const names = membersAfterDot(SRC, "vlItens", "").map((x) => x.name);
    const sorted = [...names].sort((a, b) =>
      a.localeCompare(b, "pt-BR", { sensitivity: "base" })
    );
    assert.deepEqual(names, sorted);
    assert.ok(names.indexOf("Adicionar") < names.indexOf("DefinirCampos"));
    assert.ok(names.indexOf("CODIGO") < names.indexOf("NOME"));
  });

  it("ACC-MEM-02 lista methods", () => {
    const m = membersAfterDot(SRC, "vlItens", "Ad");
    assert.ok(m.some((x) => x.name === "Adicionar"));
    assert.ok(m.some((x) => x.name === "AdicionarCampo"));
  });

  it("ACC-MEM-03 dynamic field", () => {
    const fields = extractListaFields(SRC, "vlItens");
    assert.deepEqual(fields, ["CODIGO", "NOME"]);
    const m = membersAfterDot(SRC, "vlItens", "CO");
    assert.ok(m.some((x) => x.name === "CODIGO" && x.source === "field"));
  });

  it("ACC-MEM-04 unknown receiver", () => {
    assert.equal(resolveReceiverKind(SRC, "vnX"), "unknown");
    assert.equal(completeMembersAt(SRC, "vnX.").length, 0);
  });

  it("parseMemberAccess", () => {
    assert.deepEqual(parseMemberAccess("  Cur_Ped.Ab"), {
      receiver: "Cur_Ped",
      memberPrefix: "Ab",
    });
  });
});

describe("ACC-TOK semantic tokens", () => {
  it("ACC-TOK-01/02/03 emits function variable method", () => {
    const src = `Definir Funcao foo(Numero vnA, Numero End vnR);\nDefinir Numero vnX;\nFuncao foo(Numero vnA, Numero End vnR); {\n  vnR = vnA;\n}\nCur_Ped.AbrirCursor();\n`;
    const tokens = buildSemanticTokens(src);
    assert.ok(tokens.some((t) => t.type === "function"));
    assert.ok(tokens.some((t) => t.type === "variable"));
    assert.ok(tokens.some((t) => t.type === "method"));
    const data = encodeSemanticTokens(tokens);
    assert.ok(data.length >= 5);
  });
});

describe("ACC-OUT outline", () => {
  it("ACC-OUT-01 lists functions and vars", () => {
    const src = `Definir Funcao somar(Numero vnA, Numero End vnR);\nDefinir Numero vnX;\nFuncao somar(Numero vnA, Numero End vnR); {\n  vnR = vnA;\n}\n`;
    const o = buildOutline(src);
    assert.ok(o.some((i) => i.name === "somar" && i.kind === "function"));
    assert.ok(o.some((i) => i.name === "vnX" && i.kind === "variable"));
  });
});

describe("ACC-REF refactors", () => {
  it("ACC-REF-01 wrap Se", () => {
    const src = "vnX = 1;\n";
    const next = wrapSelection(src, 0, src.length, "se");
    assert.match(next, /Se \(vnCond\) \{/);
  });

  it("ACC-REF-02 toggle braces", () => {
    assert.match(toggleInicioFimToBraces("Inicio\n  x;\nFim;"), /\{/);
  });

  it("ACC-REF-03 concat backslash", () => {
    const src = '"a" \\\n"b"';
    assert.match(backslashLiteralToConcat(src), /"a" \+ "b"/);
  });
});

describe("ACC-SQLF embedded sql", () => {
  it("ACC-SQLF-01 disabled no-op", () => {
    const src = 'ExecSQL("SELECT 1 FROM DUAL");';
    assert.equal(
      formatEmbeddedSqlInSource(src, { enabled: false, dialect: "sql" }),
      src
    );
  });

  it("ACC-SQLF-02 formats literal", () => {
    const f = formatSqlLiteral("SELECT A FROM T WHERE B = 1");
    assert.match(f, /SELECT/);
    assert.match(f, /FROM/);
  });
});

describe("ACC-SYS system catalog", () => {
  it("ACC-SYS-01 HCM merges stub", () => {
    const cat = catalogForSystem("HCM");
    assert.ok(cat.some((e) => e.label === "RetDiaSemana"));
    assert.ok(cat.some((e) => e.label === "Mensagem"));
  });

  it("ACC-SYS-02 empty is SENIOR", () => {
    const cat = catalogForSystem("");
    assert.ok(cat.some((e) => e.label === "Mensagem"));
  });
});

describe("ACC-SNP snippets file", () => {
  it("ACC-SNP-01 has key prefixes", () => {
    const p = path.join(__dirname, "../../snippets/lsp.json");
    const snip = JSON.parse(fs.readFileSync(p, "utf8")) as Record<
      string,
      { prefix: string }
    >;
    const prefixes = Object.values(snip).map((s) => s.prefix);
    assert.ok(prefixes.includes("se"));
    assert.ok(prefixes.includes("SQL_Criar"));
    assert.ok(prefixes.includes("lista"));
  });
});
