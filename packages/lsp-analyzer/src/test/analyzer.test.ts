import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ANALYZER_VERSION,
  analyze,
  format,
  parse,
  tokenize,
} from "../index";

describe("lexer", () => {
  it("tokenizes keywords", () => {
    const toks = tokenize("Definir Numero vnX;");
    assert.ok(toks.some((t) => t.kind === "keyword" && /^Definir$/i.test(t.value)));
    assert.ok(toks.some((t) => t.kind === "ident" && t.value === "vnX"));
  });

  it("skips @…@ comments", () => {
    const toks = tokenize("@ skip me @\nDefinir Numero vnX;");
    assert.ok(!toks.some((t) => t.value === "skip"));
    assert.ok(toks.some((t) => /^Definir$/i.test(t.value)));
  });

  it("skips /* */ comments", () => {
    const toks = tokenize("/* bloco */\nSe (1) {\n}");
    assert.ok(!toks.some((t) => t.value === "bloco"));
    assert.ok(toks.some((t) => /^Se$/i.test(t.value)));
  });

  it("does not count braces inside comments", () => {
    const { diagnostics } = analyze("/* { { */\nDefinir Numero vnX;\n");
    assert.equal(
      diagnostics.filter((d) => d.id === "ANL001" || d.id === "ANL002").length,
      0
    );
  });
});

describe("parser", () => {
  it("parses Definir", () => {
    const ast = parse(tokenize("Definir Numero vnX;"));
    assert.equal(ast.kind, "Program");
    assert.equal(ast.children?.[0]?.kind, "Definir");
    assert.equal(ast.children?.[0]?.name, "vnX");
    assert.ok(/^Numero$/i.test(ast.children?.[0]?.typeName ?? ""));
  });

  it("parses Se / Senao", () => {
    const src = "Se (vnX > 0) {\nvnY = 1;\n} Senao {\nvnY = 0;\n}\n";
    const ast = parse(tokenize(src));
    const se = ast.children?.[0];
    assert.equal(se?.kind, "Se");
    assert.ok(se?.thenBody);
    assert.ok(se?.elseBody);
  });

  it("parses Enquanto and Funcao", () => {
    const src =
      "Enquanto (vnI < 10) {\nvnI = vnI + 1;\n}\nFuncao Foo(vnA) {\nvnA = 1;\n}\n";
    const ast = parse(tokenize(src));
    assert.ok(ast.children?.some((c) => c.kind === "Enquanto"));
    assert.ok(ast.children?.some((c) => c.kind === "Funcao"));
  });
});

describe("semantic", () => {
  it("ANL010 Retorna standalone", () => {
    const { diagnostics } = analyze("Retorna;\n");
    assert.ok(diagnostics.some((d) => d.id === "ANL010"));
  });

  it("ANL010 Retorne", () => {
    const { diagnostics } = analyze("Retorne;\n");
    assert.ok(diagnostics.some((d) => d.id === "ANL010"));
  });

  it("ANL011 compound condition without parens", () => {
    const { diagnostics } = analyze("Se (a > 0 e b < 10) {\n}\n");
    assert.ok(diagnostics.some((d) => d.id === "ANL011"));
  });

  it("no ANL011 when sides parenthesized", () => {
    const { diagnostics } = analyze("Se ((a > 0) e (b < 10)) {\n}\n");
    assert.ok(!diagnostics.some((d) => d.id === "ANL011"));
  });

  it("detects unbalanced braces ANL002", () => {
    const { diagnostics } = analyze("Se (1) {\n  x;\n");
    assert.ok(diagnostics.some((d) => d.id === "ANL002"));
  });

  it("detects extra close ANL001", () => {
    const { diagnostics } = analyze("}\n");
    assert.ok(diagnostics.some((d) => d.id === "ANL001"));
  });

  it("ok balanced", () => {
    const { diagnostics } = analyze("Se (1) {\n  x;\n}\n");
    assert.equal(
      diagnostics.filter((d) => d.id === "ANL001" || d.id === "ANL002").length,
      0
    );
  });

  it("respects ignoreIds", () => {
    const { diagnostics } = analyze("Retorna;\n", { ignoreIds: ["ANL010"] });
    assert.ok(!diagnostics.some((d) => d.id === "ANL010"));
  });
});

describe("format + version", () => {
  it("indents by brace depth", () => {
    const out = format("Se (1) {\nx;\n}\n", { indentSize: 2 });
    assert.match(out, /^Se \(1\) \{/m);
    assert.match(out, /^  x;/m);
  });

  it("ANALYZER_VERSION is 0.2.0", () => {
    assert.equal(ANALYZER_VERSION, "0.2.0");
  });
});
