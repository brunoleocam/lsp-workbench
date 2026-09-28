import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ANALYZER_VERSION,
  analyze,
  analyzeLsp,
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

  it("ANALYZER_VERSION is 0.3.0", () => {
    assert.equal(ANALYZER_VERSION, "0.3.0");
  });
});

describe("analyzeLsp parity", () => {
  it("flags Retorna as RUL007 or ANL010", () => {
    const hits = analyzeLsp("Retorna;");
    assert.ok(hits.some((h) => h.id === "RUL007" || h.id === "ANL010"));
  });

  it("ANL004 for Inicio", () => {
    const { diagnostics } = analyze("Inicio\nvnX = 1;\nFim;");
    assert.ok(diagnostics.some((d) => d.id === "ANL004"));
  });

  it("SYN013 só em ConverteMascara ainda com marcador", () => {
    const placeholder =
      "ConverteMascara(<Tipo_Dado>, <Valor_Origem>, <Alfa_Origem/Destino>, <Mascara>);\n";
    const placeholderHits = analyzeLsp(placeholder).filter((h) => h.id === "SYN013");
    assert.equal(placeholderHits.length, 4);
    assert.match(placeholderHits[0]?.message ?? "", /99\.999\.999\/9999-99/);

    const typedNames =
      "ConverteMascara(Numero Tipo_dado, Numero Valor_Origem, Alfa Alfa_Origem, Alfa Mascara);\n";
    assert.equal(analyzeLsp(typedNames).filter((h) => h.id === "SYN013").length, 4);

    const withDefinir =
      "Definir Alfa vaDoc;\nConverteMascara(<Tipo_Dado>, <Valor_Origem>, <Alfa_Origem/Destino>, <Mascara>);\n";
    const sem = analyzeLsp(withDefinir).filter((h) => h.id === "SEM001");
    assert.equal(
      sem.filter((h) => /Tipo_Dado|Valor_Origem|Alfa_Origem|Destino|Mascara/i.test(h.message)).length,
      0
    );
    const comparado = "Definir Alfa vaDoc;\nSe (vaDoc < vaLimite) {\n  vaLimite = vaDoc;\n}\n";
    assert.ok(analyzeLsp(comparado).some((h) => h.id === "SEM001" && /vaLimite/i.test(h.message)));

    const filled = 'ConverteMascara (1,R030Fil.NumCgc,VInscrStr,"99.999.999/9999-99");\n';
    assert.equal(analyzeLsp(filled).filter((h) => h.id === "SYN013").length, 0);
    const cpf = 'ConverteMascara(1, R030Fil.NumCgc, VInscrStr, "999.999.999-99");\n';
    assert.equal(analyzeLsp(cpf).filter((h) => h.id === "SYN015").length, 0);

    const outra = "Definir Alfa vaCur;\nSQL_Criar(<vaCur>);\n";
    const outras = analyzeLsp(outra).filter((h) => h.id === "SEM001" || h.id === "SYN013");
    assert.ok(outras.some((h) => h.id === "SYN013" && /SQL_Criar/.test(h.message)));
    assert.equal(outras.filter((h) => h.id === "SEM001" && /vaCur/i.test(h.message)).length, 0);
  });

  it("SYN014 tipo 5 exige 0 e destino Alfa; SYN015 cobra a máscara de CPF/CGC", () => {
    const tipo5 = 'Definir Alfa vaDoc;\nConverteMascara(5, vnCgc, vaDoc, "999");\n';
    const hits5 = analyzeLsp(tipo5);
    assert.ok(hits5.some((h) => h.id === "SYN014" && /Valor_Origem é 0/.test(h.message)));
    assert.equal(hits5.filter((h) => h.id === "SYN014" && /variável Alfa/.test(h.message)).length, 0);

    const tipo5ok = 'Definir Alfa vaDoc;\nConverteMascara(5, 0, vaDoc, "@@@");\n';
    assert.equal(analyzeLsp(tipo5ok).filter((h) => h.id === "SYN014").length, 0);

    const destinoNumero = 'Definir Numero vnDoc;\nConverteMascara(5, 0, vnDoc, "@@@");\n';
    assert.ok(analyzeLsp(destinoNumero).some((h) => h.id === "SYN014" && /variável Alfa/.test(h.message)));

    const mascara = 'ConverteMascara(1, vnCgc, vaDoc, "999.999.999/9999-99");\n';
    const hitsMask = analyzeLsp(mascara).filter((h) => h.id === "SYN015");
    assert.equal(hitsMask.length, 1);
    assert.match(hitsMask[0]?.message ?? "", /999\.999\.999-99/);
    assert.match(hitsMask[0]?.message ?? "", /99\.999\.999\/9999-99/);
  });

  it("RUL005 aceita Objeto.Campo quando a doc do parâmetro diz Campo/Variável", () => {
    const origem = analyzeLsp("IntParaAlfa(E900COP.NUMORP, vaNumOrpPai);\n");
    assert.equal(origem.filter((h) => h.id === "RUL005").length, 0);

    const ambos = analyzeLsp("IntParaAlfa(E900COP.NUMORP, E900COP.DESALF);\n");
    assert.equal(ambos.filter((h) => h.id === "RUL005").length, 0);

    const tamanho = analyzeLsp("TamanhoAlfa(E900COP.DESCRP, vnTam);\n");
    assert.equal(tamanho.filter((h) => h.id === "RUL005").length, 0);
  });

  it("RUL005 ainda cobra variável intermediária quando o parâmetro não é Campo/Variável", () => {
    const destino = analyzeLsp("AlfaParaDecimal(vaTexto, MinhaGrid.CampoDecimal);\n");
    assert.ok(destino.some((h) => h.id === "RUL005"));

    const retorno = analyzeLsp("TamanhoAlfa(vaTexto, MinhaGrid.Campo);\n");
    assert.ok(retorno.some((h) => h.id === "RUL005"));

    const mensagem = analyzeLsp("Mensagem(Erro, E900COP.OBS);\n");
    assert.ok(mensagem.some((h) => h.id === "RUL005"));
  });
});
