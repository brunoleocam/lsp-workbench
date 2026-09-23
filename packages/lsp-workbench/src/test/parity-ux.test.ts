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

  it("ACC-TOK-04 emits End as keyword and types", () => {
    const src = `Definir Funcao foo(Numero vnA, Numero End vnR);\n`;
    const tokens = buildSemanticTokens(src);
    assert.ok(tokens.some((t) => t.type === "keyword" && t.length === 3));
    assert.ok(tokens.some((t) => t.type === "type"));
  });

  it("ACC-TOK-04b emits Se/Senao e se/senao as macro (rosa)", () => {
    const src = `Se (vnX = 1)\n{\n}\nSenao\n{\n}\nse (vnX = 0)\n{\n}\nsenao\n{\n}\n`;
    const tokens = buildSemanticTokens(src);
    assert.ok(
      tokens.some((t) => t.type === "macro" && t.line === 0 && t.length === 2)
    );
    assert.ok(
      tokens.some((t) => t.type === "macro" && t.line === 3 && t.length === 5)
    );
    assert.ok(
      tokens.some((t) => t.type === "macro" && t.line === 6 && t.length === 2)
    );
    assert.ok(
      tokens.some((t) => t.type === "macro" && t.line === 9 && t.length === 5)
    );
  });

  it("ACC-TOK-05 highlights user function call sites", () => {
    const src = `Definir Funcao foo(Numero vnA);\nDefinir Numero vnX;\nfoo(vnX);\nFuncao foo(Numero vnA); {\n}\n`;
    const tokens = buildSemanticTokens(src);
    const callLine = 2;
    assert.ok(
      tokens.some(
        (t) => t.type === "function" && t.line === callLine && t.length === 3
      )
    );
  });

  it("ACC-TOK-06 ignores tokens inside @ and block comments", () => {
    const src =
      "Definir Numero vnX;\n@ Numero End Funcao Se @\n/* Numero End AbrirCursor */\nvnX = 1;\n";
    const tokens = buildSemanticTokens(src);
    assert.equal(
      tokens.some((t) => t.line === 1 || t.line === 2),
      false
    );
  });

  it("ACC-TOK-07 highlights Cur_Tab1.QtdPed as variable+property", () => {
    const src = `Definir Cursor Cur_Tab1;\nCur_Tab1.QtdPed = 1;\nCur_Tab1.AbrirCursor();\n`;
    const tokens = buildSemanticTokens(src);
    const fieldLine = tokens.filter((t) => t.line === 1);
    assert.ok(fieldLine.some((t) => t.type === "variable" && t.length === 8));
    assert.ok(fieldLine.some((t) => t.type === "property" && t.length === 6));
    const methodLine = tokens.filter((t) => t.line === 2);
    assert.ok(methodLine.some((t) => t.type === "method" && t.length === 11));
  });

  it("ACC-TOK-08 highlights porta na regra (PedidoAssitencia.Retorno.NumPed)", () => {
    const src = `PedidoAssitencia.Retorno.CriarLinha();\nPedidoAssitencia.Retorno.NumPed = 0;\n`;
    const tokens = buildSemanticTokens(src);
    const line0 = tokens.filter((t) => t.line === 0);
    assert.ok(line0.some((t) => t.type === "variable" && t.length === 16));
    assert.ok(line0.some((t) => t.type === "type"));
    assert.ok(line0.some((t) => t.type === "property" || t.type === "method"));
    const line1 = tokens.filter((t) => t.line === 1);
    assert.ok(line1.some((t) => t.type === "property" && t.length === 6));
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
      { prefix: string | string[] }
    >;
    const prefixes = Object.values(snip).flatMap((s) =>
      Array.isArray(s.prefix) ? s.prefix : [s.prefix]
    );
    assert.ok(prefixes.includes("se"));
    assert.ok(prefixes.includes("SQL_Criar"));
    assert.ok(prefixes.includes("lista"));
  });
});

describe("ACC-GRM TextMate grammar", () => {
  it("ACC-GRM-SQL embeds sql-in-string patterns", () => {
    const p = path.join(__dirname, "../../syntaxes/lsp.tmLanguage.json");
    const g = JSON.parse(fs.readFileSync(p, "utf8")) as {
      repository: {
        strings: { patterns: { include?: string }[] };
        "sql-in-string": {
          patterns: { name?: string; match?: string }[];
        };
      };
    };
    assert.ok(
      g.repository.strings.patterns.some((x) => x.include === "#sql-in-string")
    );
    const sql = g.repository["sql-in-string"].patterns;
    assert.ok(sql.some((x) => x.name === "keyword.other.sql.lsp"));
    assert.ok(sql.some((x) => x.name === "support.function.sql.lsp"));
    assert.ok(sql.some((x) => x.name === "variable.other.bind.sql.lsp"));
    assert.ok(sql.some((x) => x.match?.includes("SELECT")));
    assert.ok(sql.some((x) => x.match?.includes(":[A-Za-z_]")));
  });

  it("ACC-GRM-flow has Se/Enquanto and operators e/ou", () => {
    const p = path.join(__dirname, "../../syntaxes/lsp.tmLanguage.json");
    const g = JSON.parse(fs.readFileSync(p, "utf8")) as {
      repository: Record<
        string,
        {
          match?: string;
          patterns?: { match?: string; name?: string; ignoreCase?: boolean }[];
        }
      >;
    };
    const flowPatterns = g.repository["keywords-flow"].patterns ?? [];
    assert.ok(flowPatterns.some((x) => /\(\?i\)/.test(x.match ?? "") && /Senao/.test(x.match ?? "")));
    assert.ok(flowPatterns.some((x) => x.match?.includes("Enquanto")));
    assert.ok(flowPatterns.some((x) => /\\bSe\\b/.test(x.match ?? "")));
    // Senao deve aparecer antes de Se na lista de patterns
    const iSenao = flowPatterns.findIndex((x) => x.match?.includes("Senao"));
    const iSe = flowPatterns.findIndex((x) => /\\bSe\\b/.test(x.match ?? ""));
    assert.ok(iSenao >= 0 && iSe >= 0 && iSenao < iSe);
    const ops = g.repository.operators.patterns ?? [];
    assert.ok(ops.some((x) => x.match?.includes("e|ou")));
    assert.ok(ops.some((x) => x.match?.includes("\\+\\+")));
    assert.ok(g.repository["types-lista"]?.match?.includes("Lista"));
    assert.ok(g.repository["list-access"]);
    assert.ok(g.repository["types-cursor"]?.match?.includes("Cursor"));
    assert.ok(g.repository["cursor-access"]);
  });

  it("ACC-GRM-sysvar does not match after dot (WS/Lista/Cursor field)", () => {
    const p = path.join(__dirname, "../../syntaxes/lsp.tmLanguage.json");
    const g = JSON.parse(fs.readFileSync(p, "utf8")) as {
      repository: Record<string, { match?: string }>;
    };
    const m = g.repository["system-vars"]?.match ?? "";
    assert.match(m, /\(\?<!\\\.\)/);
    assert.match(m, /CodEmp/);
  });

  it("ACC-GRM-ws matches porta PascalCase e instância ws*", () => {
    const p = path.join(__dirname, "../../syntaxes/lsp.tmLanguage.json");
    const g = JSON.parse(fs.readFileSync(p, "utf8")) as {
      repository: Record<string, { patterns?: { match?: string }[] }>;
    };
    const patterns = g.repository["webservice-access"]?.patterns ?? [];
    assert.ok(
      patterns.some((x) => x.match?.includes("[A-Z][A-Za-z0-9_]*"))
    );
    assert.ok(patterns.some((x) => x.match?.includes("(?:ws)")));
  });
});
