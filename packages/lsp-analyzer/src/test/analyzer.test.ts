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

  it("texto continua na linha seguinte com `\\` mesmo havendo espaços depois dele", () => {
    const toks = tokenize('vaSql = "A = 1, \\   \n  B = 2";\nvnX = 1;');
    const strings = toks.filter((t) => t.kind === "string");
    assert.equal(strings.length, 1);
    assert.ok(toks.some((t) => t.kind === "ident" && t.value === "vnX" && t.line === 2));
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

  it("no ANL010 for Retorna(x) / Retorna() / Mensagem(Retorna, …)", () => {
    const { diagnostics } = analyze('Retorna(1);\nRetorna();\nMensagem(Retorna, "x");\n');
    assert.ok(!diagnostics.some((d) => d.id === "ANL010"));
  });

  it("Inicio/Fim balance like braces (no ANL004/ANL001/ANL002)", () => {
    const { diagnostics } = analyze("Se (x > 0) Inicio\n  x = 1;\n  Se (x < 5) {\n    x = 2;\n  }\nFim;\n");
    const ids = diagnostics.map((d) => d.id);
    assert.ok(!ids.includes("ANL004"));
    assert.ok(!ids.includes("ANL001"));
    assert.ok(!ids.includes("ANL002"));
  });

  it("Inicio without Fim gives ANL002; Fim without Inicio gives ANL001", () => {
    assert.ok(analyze("Se (x > 0) Inicio\n  x = 1;\n").diagnostics.some((d) => d.id === "ANL002"));
    assert.ok(analyze("x = 1;\nFim;\n").diagnostics.some((d) => d.id === "ANL001"));
  });

  it("parses Se ... Inicio ... Fim; as block", () => {
    const ast = parse(tokenize("Se (x > 0) Inicio\n  x = 1;\nFim;\ny = 2;\n"));
    const se = ast.children?.[0];
    assert.equal(se?.kind, "Se");
    assert.equal(se?.thenBody?.children?.length, 1);
    assert.equal(ast.children?.[1]?.kind, "Statement");
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

  it("indents Inicio/Fim like braces", () => {
    const out = format("Se (1) Inicio\nx;\nFim;\ny;\n", { indentSize: 2 });
    assert.match(out, /^  x;/m);
    assert.match(out, /^Fim;/m);
    assert.match(out, /^y;/m);
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

  it("RUL007 com mensagem do compilador para Retorna; e Retorne;", () => {
    for (const src of ["Retorna;\n", "Retorne;\n"]) {
      const hits = analyzeLsp(src);
      const rul = hits.filter((h) => h.id === "RUL007");
      assert.equal(rul.length, 1, src);
      assert.match(rul[0]?.message ?? "", /falta valor, expressão ou comando/);
      assert.ok(!hits.some((h) => h.id === "ANL010"), "ANL010 deduplicado pelo RUL007");
    }
  });

  it("Retorna(x), Retorna() e Mensagem(Retorna, …) não geram RUL007/ANL010", () => {
    const src =
      'Definir Numero vnX;\nRetorna(1);\nRetorna(vnX);\nRetorna();\nMensagem(Retorna, "x");\n';
    const hits = analyzeLsp(src);
    assert.deepEqual(
      hits.filter((h) => h.id === "RUL007" || h.id === "ANL010").map((h) => h.id),
      []
    );
  });

  it("Inicio/Fim equivalem a { } sem SYN004/ANL004/ANL001/ANL002/SYN008", () => {
    const src = "Definir Numero vnX;\nSe (vnX > 0) Inicio\n  vnX = 1;\nFim;\n";
    const hits = analyzeLsp(src);
    const bad = ["SYN004", "ANL004", "ANL001", "ANL002", "SYN008"];
    assert.deepEqual(hits.filter((h) => bad.includes(h.id)).map((h) => h.id), []);
  });

  it("Inicio/Fim aninhado com { } misturado balanceia", () => {
    const src =
      "Definir Numero vnX;\nSe (vnX > 0) Inicio\n  Enquanto (vnX < 10) {\n    vnX = vnX + 1;\n  }\nFim;\n";
    const hits = analyzeLsp(src);
    const bad = ["ANL001", "ANL002", "SYN008"];
    assert.deepEqual(hits.filter((h) => bad.includes(h.id)).map((h) => h.id), []);
  });

  it("Inicio sem Fim acusa desbalanceamento", () => {
    const hits = analyzeLsp("Definir Numero vnX;\nSe (vnX > 0) Inicio\n  vnX = 1;\n");
    assert.ok(hits.some((h) => h.id === "SYN008" || h.id === "ANL002"));
  });

  it("SYN016 para FimSe e FimEnquanto com mensagem do compilador", () => {
    for (const kw of ["FimSe", "FimEnquanto"]) {
      const hits = analyzeLsp(`Definir Numero vnX;\nSe (vnX > 0) {\n  vnX = 1;\n}\n${kw};\n`);
      const syn = hits.filter((h) => h.id === "SYN016");
      assert.equal(syn.length, 1, kw);
      assert.equal(syn[0]?.severity, "error");
      assert.match(syn[0]?.message ?? "", /falta valor, expressão ou comando/);
    }
  });

  describe("laços de cursor (PDR-012 etapa 2)", () => {
    const ids = (src: string, id: string) => analyzeLsp(src).filter((h) => h.id === id);

    it("AC-020: Enquanto (C.Achou) sem C.Proximo() → SEM005 no Enquanto", () => {
      const sem = ids("Enquanto (C.Achou) {\n  x = 1;\n}\n", "SEM005");
      assert.equal(sem.length, 1);
      assert.equal(sem[0]?.line, 0);
      assert.equal(sem[0]?.severity, "error");
      assert.match(sem[0]?.message ?? "", /C\.Proximo/);
    });

    it("AC-020: com C.Proximo() no corpo → nada", () => {
      assert.equal(ids("Enquanto (C.Achou) {\n  x = 1;\n  C.Proximo();\n}\n", "SEM005").length, 0);
    });

    it("SEM005 ignora caixa e aceita Proximo aninhado e bloco Inicio/Fim", () => {
      const src = "enquanto (cur.achou)\nInicio\n  Se (x > 0) {\n    CUR.PROXIMO();\n  }\nFim;\n";
      assert.equal(ids(src, "SEM005").length, 0);
    });

    it("SEM005 não se aplica a Enquanto que não testa Achou", () => {
      assert.equal(ids("Enquanto (vnI < 10) {\n  vnI++;\n}\n", "SEM005").length, 0);
    });

    it("SEM005 cobre Enquanto de um comando só, sem chaves", () => {
      assert.equal(ids("Enquanto (C.Achou)\n  C.Proximo();\n", "SEM005").length, 0);
      assert.equal(ids("Enquanto (C.Achou)\n  x = 1;\n", "SEM005").length, 1);
    });

    it("AC-021: Continue antes de C.Proximo() → SEM006 no Continue", () => {
      const src = "Enquanto (C.Achou) {\n  Se (x) {\n    Continue;\n  }\n  C.Proximo();\n}\n";
      const sem = ids(src, "SEM006");
      assert.equal(sem.length, 1);
      assert.equal(sem[0]?.line, 2);
      assert.equal(sem[0]?.severity, "error");
      assert.equal(ids(src, "SEM005").length, 0);
    });

    it("AC-021: C.Proximo() antes do Continue (mesmo bloco ou ancestral) → nada", () => {
      const sameBlock =
        "Enquanto (C.Achou) {\n  Se (x) {\n    C.Proximo();\n    Continue;\n  }\n  C.Proximo();\n}\n";
      const ancestor = "Enquanto (C.Achou) {\n  C.Proximo();\n  Se (x) {\n    Continue;\n  }\n}\n";
      assert.equal(ids(sameBlock, "SEM006").length, 0);
      assert.equal(ids(ancestor, "SEM006").length, 0);
    });

    it("Continue de laço interno não é atribuído ao Enquanto do cursor", () => {
      const src =
        "Enquanto (C.Achou) {\n  Para (i = 1; i < 3; i++) {\n    Continue;\n  }\n" +
        "  Enquanto (vnI < 3) {\n    Continue;\n  }\n  C.Proximo();\n}\n";
      assert.equal(ids(src, "SEM006").length, 0);
    });

    it("Proximo depois de SQL com `\\` + espaços no fim da linha continua dentro do laço", () => {
      const src =
        "Enquanto (C.Achou) {\n" +
        '  ExecSQLEx("UPDATE T \\   \n     SET A = 1 \\\n   WHERE B = :vnB", vnErr, vaMsg);\n' +
        "  Se (vnErr <> 0) {\n    vaMsg = \"Erro: \" + vaMsg;\n  }\n  C.Proximo();\n}\n";
      assert.equal(ids(src, "SEM005").length, 0);
    });

    it("ignoreIds desliga SEM005/SEM006", () => {
      const src = "Enquanto (C.Achou) {\n  x = 1;\n}\n";
      assert.equal(analyzeLsp(src, ["SEM005"]).filter((h) => h.id === "SEM005").length, 0);
    });
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
