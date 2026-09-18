import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { analyzeLsp } from "../diagnostics";
import {
  applyFun001Fix,
  applyFun002Fix,
  applyFun003Fix,
  applyFun004Fix,
  applyFun005Fix,
  applyRul001Fix,
  applyRul002Fix,
  applyRul003Fix,
  applyRul007Fix,
  applyRul011Fix,
  applyRul012Fix,
  applyRul014Fix,
  applyRul015Fix,
  applyRul015MontaDataFix,
  applyRul016Fix,
  applyRul019Fix,
  findRul019CancelRange,
  applySem002CompleteFix,
  applySem003CompleteFix,
  applySql001Fix,
  findSem002FileOpen,
  findSem003Cursor,
  findSem004InsertAfterLine,
  findSem004Usage,
  applySql004SourceFix,
  applySql006MoveUsarBeforeComando,
  applySql009LineFix,
  applySql009ScaffoldFix,
  applySyn001Fix,
  applySyn002Fix,
  applySyn003Fix,
  applySyn004InicioFim,
  applySyn004PairFix,
  syn004PairLineEdits,
  applySyn005MoveDefinir,
  applySyn007CloseComment,
  applySyn007CloseCommentLine,
  applySyn008RemoveExtraBrace,
  applySyn009BreakString,
  applySyn010DefinirStub,
  isSyn010OrphanStatement,
  findSql002Criar,
  findSql003Abrir,
  findSql002DestruirAfterLine,
  findSqlHandleCall,
  isSuppressible,
  sem002FecharInsert,
  sem003FecharInsert,
  sem004AdicionarCampoLine,
  sql002DestruirInsert,
  sql003FecharInsert,
  sql005DefinirComandoInsert,
  sql007CriarInsert,
  sql008NativeInsert,
  sqlEnquantoLoopInsert,
  suggestedPrefixedName,
  renameIdentifierInSource,
  findFun003VdArg,
  findFun004PArg,
  findRul007Ranges,
} from "../quick-fixes";
import {
  sqlNeedsNativeDialect,
  resolveSqlText,
} from "../sql-native-heuristics";
import {
  addSuppression,
  filterSuppressedHits,
  initSuppressions,
  isLineSuppressed,
} from "../suppressions";

describe("quick-fixes", () => {
  it("RUL007 Retorna/Retorne", () => {
    assert.equal(applyRul007Fix("  Retorna;"), "  Cancel(1);");
    assert.equal(applyRul007Fix("  Retorne;"), "  Cancel(1);");
    assert.equal(findRul007Ranges('Mensagem(Retorna, "x");').length, 0);
  });

  it("RUL019 Cancel só 1|2|3", () => {
    assert.ok(findRul019CancelRange("Cancel(4);"));
    assert.ok(findRul019CancelRange("Cancel;"));
    assert.ok(findRul019CancelRange("Cancel();"));
    assert.equal(findRul019CancelRange("Cancel(1);"), null);
    assert.equal(findRul019CancelRange("Cancel(2);"), null);
    assert.equal(findRul019CancelRange("Cancel(3);"), null);
    assert.equal(findRul019CancelRange("Definir Numero Cancel;"), null);
    assert.equal(applyRul019Fix("  Cancel(4);", "1"), "  Cancel(1);");
    assert.equal(applyRul019Fix("  Cancel;", "2"), "  Cancel(2);");
  });

  it("RUL014 Break", () => {
    assert.equal(applyRul014Fix("  Break;"), "  Pare;");
  });

  it("RUL002 out-param", () => {
    assert.equal(
      applyRul002Fix("vnTamanho = TamanhoAlfa(vaTexto);"),
      "TamanhoAlfa(vaTexto, vnTamanho);"
    );
  });

  it("RUL003 EstaNulo fora do Se", () => {
    assert.equal(
      applyRul003Fix("Se (EstaNulo(vaTexto, vnNulo) = 0) {"),
      "EstaNulo(vaTexto, vnNulo);\nSe (vnNulo = 0) {"
    );
  });

  it("RUL011 RestoDivisao", () => {
    assert.equal(applyRul011Fix("vnX = vnX % 2;"), "RestoDivisao(vnX, 2, vnX);");
  });

  it("RUL012 CaracterParaAlfa", () => {
    assert.equal(applyRul012Fix("vaTexto = Chr(13);"), "CaracterParaAlfa(13, vaTexto);");
  });

  it("RUL015 CodData retorna valor", () => {
    assert.equal(applyRul015Fix("vdData = 15/08/1990;"), "vdData = CodData(15, 8, 1990);");
  });

  it("RUL015 MontaData alternativa", () => {
    assert.equal(
      applyRul015MontaDataFix("vdData = 15/08/1990;"),
      "MontaData(15, 8, 1990, vdData);"
    );
  });

  it("RUL001 remove param Alfa (vira global, sem nome solto na assinatura)", () => {
    assert.equal(applyRul001Fix("Funcao Foo(Alfa vaP);"), "Funcao Foo();");
    assert.equal(
      applyRul001Fix("Definir Funcao Foo(Alfa vaP, Numero vnX);"),
      "Definir Funcao Foo(Numero vnX);"
    );
  });

  it("RUL001 param sem tipo → Numero na assinatura", () => {
    assert.equal(
      applyRul001Fix("Definir Funcao Foo(vaP);"),
      "Definir Funcao Foo(Numero vnP);"
    );
  });

  it("RUL016 reservada → prefixo", () => {
    assert.equal(applyRul016Fix("Definir Numero Cancel;"), "Definir Numero vnCancel;");
  });

  it("SEM003 FecharCursor insert", () => {
    assert.equal(sem003FecharInsert("Cur_Ped.AbrirCursor();"), "Cur_Ped.FecharCursor();\n");
    assert.ok(findSem003Cursor("  Cur_X.AbrirCursor();"));
    assert.ok(applySem003CompleteFix("Cur_Ped.AbrirCursor();").includes("FecharCursor"));
  });

  it("SEM002 Fechar insert", () => {
    assert.equal(sem002FecharInsert('vnArq = Abrir("tmp.txt", Gravar);'), "Fechar(vnArq);\n");
    assert.ok(findSem002FileOpen('  vnArq = Abrir("x", Ler);'));
    assert.ok(applySem002CompleteFix('vnArq = Abrir("x", Ler);').includes("Fechar(vnArq)"));
  });

  it("SEM004 AdicionarCampo", () => {
    const info = findSem004Usage("vlItens.Codigo = 1;");
    assert.ok(info);
    assert.equal(info!.field, "Codigo");
    assert.equal(info!.tipo, "numero");
    assert.equal(
      sem004AdicionarCampoLine("vlItens", "Codigo", "numero"),
      'vlItens.AdicionarCampo("Codigo", numero);\n'
    );
    const src = "Definir Lista vlItens;\nvlItens.DefinirCampos();\nvlItens.EfetivarCampos();\nvlItens.Codigo = 1;\n";
    assert.equal(findSem004InsertAfterLine(src, "vlItens", 3), 1);
  });

  it("SQL001 bind placeholder", () => {
    assert.equal(
      applySql001Fix('vaSql = "SELECT * FROM T WHERE ID = " + vnId;'),
      'vaSql = "SELECT * FROM T WHERE ID = :vnId";'
    );
  });

  it("SQL002/SQL003 inserts", () => {
    assert.equal(sql002DestruirInsert("SQL_Criar(vnH);"), "SQL_Destruir(vnH);\n");
    assert.equal(sql003FecharInsert("SQL_AbrirCursor(vnH);"), "SQL_FecharCursor(vnH);\n");
    assert.ok(findSql002Criar("SQL_Criar(vnH);"));
    assert.ok(findSql003Abrir("SQL_AbrirCursor(vnH);"));
  });

  it("SQL005/SQL007 inserts", () => {
    assert.equal(
      sql005DefinirComandoInsert("SQL_AbrirCursor(vaCur);"),
      "SQL_DefinirComando(vaCur, vaSql);\n"
    );
    assert.equal(sql007CriarInsert("SQL_DefinirComando(vaOrfao, \"SELECT 1\");"), "SQL_Criar(vaOrfao);\n");
    assert.ok(findSqlHandleCall("SQL_Criar(juros);", "SQL_Criar"));
  });

  it("SQL008 native insert + heurística", () => {
    assert.ok(sqlNeedsNativeDialect("SELECT a FROM t INNER JOIN u ON 1=1"));
    assert.ok(sqlNeedsNativeDialect("SELECT (SELECT 1 FROM DUAL) x FROM t"));
    assert.equal(sqlNeedsNativeDialect("SELECT 1 FROM DUAL"), false);
    assert.equal(
      sql008NativeInsert('SQL_DefinirComando(vaJoin, "SELECT 1");'),
      "SQL_UsarAbrangencia(vaJoin, 0);\nSQL_UsarSQLSenior2(vaJoin, 0);\n"
    );
    const map = new Map([["vasql", "SELECT a FROM t JOIN u ON 1=1"]]);
    assert.equal(resolveSqlText("vaSql", map), "SELECT a FROM t JOIN u ON 1=1");
  });

  it("SQL002 Destruir após último uso / Fechar", () => {
    const src =
      "Definir Alfa vaCur;\nSQL_Criar(vaCur);\nSQL_AbrirCursor(vaCur);\nSQL_FecharCursor(vaCur);\n";
    assert.equal(findSql002DestruirAfterLine(src, "vaCur", 1), 3);
    assert.equal(suggestedPrefixedName("alfa", "vnH"), "vaH");
    assert.equal(suggestedPrefixedName("numero", "vaX"), "vnX");
    assert.equal(renameIdentifierInSource("SQL_Criar(vnH);", "vnH", "vaH"), "SQL_Criar(vaH);");
  });

  it("SQL004 rename atômico inclui SQL_Criar", () => {
    const src = "Definir Numero vnH;\nSQL_Criar(vnH);\n";
    const next = applySql004SourceFix(src, "vnH");
    assert.ok(next);
    assert.match(next!, /Definir Alfa vaH/);
    assert.match(next!, /SQL_Criar\(vaH\)/);
    assert.equal(next!.includes("vnH"), false);
  });

  it("SQL006 move Usar antes de DefinirComando", () => {
    const src =
      'Definir Alfa vaNat;\nSQL_Criar(vaNat);\nSQL_DefinirComando(vaNat, "SELECT 1");\nSQL_UsarSQLSenior2(vaNat, 0);\n';
    const next = applySql006MoveUsarBeforeComando(src, 3);
    assert.ok(next);
    assert.match(
      next!,
      /SQL_UsarSQLSenior2\(vaNat, 0\);\s*\nSQL_DefinirComando\(vaNat/
    );
  });

  it("SQL009 converte APIs", () => {
    const src = "Definir Cursor Cur_Mix;\nDefinir Alfa vaMix;\nSQL_Criar(vaMix);\n";
    assert.equal(
      applySql009LineFix("SQL_AbrirCursor(Cur_Mix);", src),
      "Cur_Mix.AbrirCursor();"
    );
    assert.equal(
      applySql009LineFix("vaMix.AbrirCursor();", src),
      "SQL_AbrirCursor(vaMix);"
    );
    assert.equal(sqlEnquantoLoopInsert("vaCur"), "Enquanto (SQL_EOF(vaCur) = 0) {\n  SQL_Proximo(vaCur);\n}\n");
  });

  it("SQL009 esqueleto simples e completo", () => {
    const srcSimples = "Definir Cursor Cur_Simples;\n";
    const sc = applySql009ScaffoldFix("SQL_AbrirCursor(Cur_Simples);", srcSimples);
    assert.ok(sc);
    assert.match(sc!, /Cursor SIMPLES/);
    assert.match(sc!, /Cur_Simples\.AbrirCursor\(\);/);
    assert.match(sc!, /Cur_Simples\.FecharCursor\(\);/);
    assert.doesNotMatch(sc!, /SQL_AbrirCursor/);

    const srcComp = "Definir Alfa vaCompleto;\nSQL_Criar(vaCompleto);\n";
    const cc = applySql009ScaffoldFix("vaCompleto.AbrirCursor();", srcComp);
    assert.ok(cc);
    assert.match(cc!, /Cursor COMPLETO/);
    assert.match(cc!, /SQL_DefinirComando\(vaCompleto, vaSql\);/);
    assert.match(cc!, /SQL_AbrirCursor\(vaCompleto\);/);
    assert.match(cc!, /SQL_FecharCursor\(vaCompleto\);/);
    assert.match(cc!, /SQL_Destruir\(vaCompleto\);/);
    assert.doesNotMatch(cc!, /vaCompleto\.AbrirCursor/);
  });

  it("SQL009 adia SQL002 enquanto API misturada", () => {
    const hits = analyzeLsp(
      "Definir Alfa vaX;\nSQL_Criar(vaX);\nvaX.AbrirCursor();\n"
    );
    assert.ok(hits.some((x) => x.id === "SQL009"));
    assert.equal(hits.some((x) => x.id === "SQL002"), false);
  });

  it("SYN001–009 quick-fixes", () => {
    assert.equal(applySyn001Fix("Definir Numero vnA"), "Definir Numero vnA;");
    assert.equal(applySyn001Fix("Definir Numero vnB;"), "Definir Numero vnB;");
    assert.equal(applySyn002Fix("Se vnB > 0 {"), "Se (vnB > 0) {");
    assert.equal(
      applySyn003Fix("Se (vnA > 0 e vnB < 10) {"),
      "Se ((vnA > 0) e (vnB < 10)) {"
    );
    assert.equal(applySyn004InicioFim("Inicio"), "{");
    assert.equal(applySyn004InicioFim("Fim;"), "}");
    const pair = applySyn004PairFix("Inicio\n  vnB = 4;\nFim;\n", 0);
    assert.equal(pair, "{\n  vnB = 4;\n}\n");
    const pairFromFim = applySyn004PairFix("Inicio\n  vnB = 4;\nFim;\n", 2);
    assert.equal(pairFromFim, "{\n  vnB = 4;\n}\n");
    const lineEdits = syn004PairLineEdits("Inicio\n  vnB = 4;\nFim;\n", 0);
    assert.deepEqual(lineEdits, [
      { line: 0, text: "{" },
      { line: 2, text: "}" },
    ]);
    const moved = applySyn005MoveDefinir(
      "Definir Numero vnA;\nvnA = 1;\nDefinir Numero vnTarde;\n",
      2
    );
    assert.ok(moved);
    assert.match(moved!, /^Definir Numero vnA;\nDefinir Numero vnTarde;\nvnA = 1;/);
    const closed = applySyn007CloseComment("vnA = 1;\n/* aberto\n");
    assert.ok(closed);
    assert.match(closed!.next, /\/\* aberto \*\//);
    assert.equal(applySyn007CloseCommentLine("/* aberto"), "/* aberto */");
    assert.equal(applySyn008RemoveExtraBrace("}}"), "}");
    const broken = applySyn009BreakString(
      'vaLonga = "' + "A".repeat(100) + '";'
    );
    assert.match(broken, /\\\n/);
  });

  it("FUN001 Truncar", () => {
    assert.equal(applyFun001Fix("Truncar(vnX, vnY);"), "vnY = Truncar(vnX);");
  });

  it("FUN001 Truncar with numeric 2nd arg → TruncarDecimal", () => {
    assert.equal(applyFun001Fix("Truncar(vnX, 2);"), "TruncarDecimal(vnX, 2);");
  });

  it("FUN001 does not produce 2, vnY = for 3-arg", () => {
    // 3 args não casam no QF de 2 args
    assert.equal(applyFun001Fix("Truncar(vnX, 2, vnY);"), "Truncar(vnX, 2, vnY);");
  });

  it("FUN002 mask", () => {
    assert.equal(
      applyFun002Fix('FormatarData(vnDh, "DD/MM/YYYY", vaFmt);'),
      'FormatarData(vnDh, "dd/mm/yyyy", vaFmt);'
    );
  });

  it("FUN004 p* to vn*", () => {
    assert.equal(
      applyFun004Fix('SQL_RetornarInteiro(vaSql, "CODIGO", pCodigo);'),
      'SQL_RetornarInteiro(vaSql, "CODIGO", vnCodigo);'
    );
    const info = findFun004PArg('SQL_RetornarInteiro(vaSql, "CODIGO", pCodigo);');
    assert.ok(info);
    assert.equal(info!.from, "pCodigo");
    assert.equal(info!.to, "vnCodigo");
  });

  it("FUN005 Arredondar to Arredonda", () => {
    assert.equal(
      applyFun005Fix("Arredondar(vnX, 2, vnY);"),
      "Arredonda(vnX, 2);"
    );
  });

  it("FUN003 vd* → va*", () => {
    assert.equal(applyFun003Fix("EstaNulo(vdD, vnY);"), "EstaNulo(vaD, vnY);");
    const info = findFun003VdArg("EstaNulo(vdD, vnY);");
    assert.ok(info);
    assert.equal(info!.from, "vdD");
    assert.equal(info!.to, "vaD");
  });

  it("FUN001 does not rewrite EstaNulo", () => {
    assert.equal(applyFun001Fix("EstaNulo(vdD, vnY);"), "EstaNulo(vdD, vnY);");
  });
});

describe("analyzeLsp expanded", () => {
  it("detects RUL002 out-param assign", () => {
    const hits = analyzeLsp("vnT = TamanhoAlfa(vaT);\n");
    assert.ok(hits.some((h) => h.id === "RUL002"));
  });

  it("detects RUL003 EstaNulo in Se", () => {
    const hits = analyzeLsp("Se (EstaNulo(vaD, vnN) = 0) {\n}\n");
    assert.ok(hits.some((h) => h.id === "RUL003"));
  });

  it("detects RUL006 concat in args", () => {
    const hits = analyzeLsp('Mensagem(Retorna, "x" + vaY);\n');
    assert.ok(hits.some((h) => h.id === "RUL006"));
  });

  it("detects RUL011 percent", () => {
    const hits = analyzeLsp("vnR = vnA % vnB;\n");
    assert.ok(hits.some((h) => h.id === "RUL011"));
  });

  it("detects RUL012 Chr", () => {
    const hits = analyzeLsp("vaX = Chr(13);\n");
    assert.ok(hits.some((h) => h.id === "RUL012"));
  });

  it("detects RUL001 Funcao Alfa param", () => {
    const hits = analyzeLsp("Funcao Foo(Alfa vaX);\n{\n}\n");
    assert.ok(hits.some((h) => h.id === "RUL001"));
  });

  it("RUL001 param sem tipo em Definir Funcao (não SEM001)", () => {
    const src = "Definir Numero vnX;\nDefinir Funcao Foo(vaP);\n";
    const hits = analyzeLsp(src);
    assert.ok(hits.some((h) => h.id === "RUL001"));
    assert.equal(
      hits.some((h) => h.id === "SEM001" && /vaP/i.test(h.message)),
      false
    );
  });

  it("RUL001 QF não gera Definir + param solto", () => {
    const fixed = applyRul001Fix("Definir Funcao Foo(vaP);");
    assert.match(fixed, /Definir Funcao Foo\(Numero vnP\);/);
    assert.equal(/Definir Alfa vaP/.test(fixed), false);
  });

  it("detects SQL001 concat SQL", () => {
    const hits = analyzeLsp('Definir Alfa vaSql;\nvaSql = "SELECT * FROM T WHERE ID = " + vnId;\n');
    assert.ok(hits.some((h) => h.id === "SQL001"));
  });

  it("detects SQL002 unpaired SQL_Criar", () => {
    const hits = analyzeLsp("SQL_Criar(vnH);\n");
    assert.ok(hits.some((h) => h.id === "SQL002"));
  });

  it("detects FUN005 Arredondar 3-arg", () => {
    const hits = analyzeLsp("Arredondar(vnX, 2, vnY);\n");
    assert.ok(hits.some((h) => h.id === "FUN005"));
  });

  it("FUN003 grifa só o vd* (não a linha inteira)", () => {
    const line = "EstaNulo(vdD, vnY);";
    const hits = analyzeLsp(`Definir Data vdD;\nDefinir Numero vnY;\n${line}\n`);
    const fun = hits.find((h) => h.id === "FUN003");
    assert.ok(fun);
    assert.equal(fun!.startCol !== undefined, true);
    assert.equal(fun!.endCol !== undefined, true);
    assert.equal(line.slice(fun!.startCol!, fun!.endCol!), "vdD");
  });

  it("RUL009 pode ser ignorado sem comentário no fonte", () => {
    initSuppressions([], async () => undefined);
    const line = "Se (vnRetSql = 1) {";
    const src = `Definir Numero vnRetSql;\nExecSQLEx(vaT, vnRetSql);\n${line}\n}\n`;
    const lines = src.replace(/\r\n/g, "\n").split("\n");
    const uri = "file:///test.lsp";
    const before = analyzeLsp(src);
    assert.ok(before.some((h) => h.id === "RUL009"));
    addSuppression(uri, "RUL009", line);
    const after = filterSuppressedHits(uri, lines, before);
    assert.equal(after.some((h) => h.id === "RUL009"), false);
    assert.equal(isLineSuppressed(uri, "RUL009", line), true);
  });

  it("ignore de RUL010 não exige comentário no código", () => {
    initSuppressions([], async () => undefined);
    const line = "Mensagem(Retorna, vaJSON);";
    const src = `Definir Alfa vaJSON;\n${line}\n`;
    const lines = src.replace(/\r\n/g, "\n").split("\n");
    const uri = "file:///test2.lsp";
    const before = analyzeLsp(src);
    assert.ok(before.some((h) => h.id === "RUL010"));
    addSuppression(uri, "RUL010", line);
    assert.equal(filterSuppressedHits(uri, lines, before).some((h) => h.id === "RUL010"), false);
  });

  it("RUL018 não é suppressible", () => {
    assert.equal(isSuppressible("RUL018"), false);
    assert.equal(isSuppressible("RUL019"), false);
  });

  it("RUL019 alerta Cancel inválido", () => {
    const hits = analyzeLsp("Cancel(9);\nCancel(1);\n");
    assert.ok(hits.some((h) => h.id === "RUL019"));
    assert.equal(hits.filter((h) => h.id === "RUL019").length, 1);
  });

  it("RUL017 não some só com ignore genérico de outro ID", () => {
    const hits = analyzeLsp("Pare;\n");
    assert.ok(hits.some((h) => h.id === "RUL017"));
  });

  it("RUL018 alerta ExecSQL sem SQL atribuído", () => {
    const hits = analyzeLsp("Definir Alfa vaTexto;\nExecSQL(vaTexto);\n");
    assert.ok(hits.some((h) => h.id === "RUL018"));
  });

  it("RUL018 ok quando Alfa tem SQL", () => {
    const hits = analyzeLsp(
      'Definir Alfa vaSQL;\nvaSQL = "INSERT INTO T (A) VALUES (1)";\nExecSQL(vaSQL);\n'
    );
    assert.equal(hits.some((h) => h.id === "RUL018"), false);
  });

  it("detects SEM001 undefined prefixed var", () => {
    const hits = analyzeLsp('Definir Numero vnA;\nvaB = "x";\n');
    assert.ok(hits.some((h) => h.id === "SEM001"));
  });

  it("SEM001 não alerta vn* (Numero implícito)", () => {
    const hits = analyzeLsp("Definir Alfa vaA;\nvnB = 1;\n");
    assert.equal(hits.some((h) => h.id === "SEM001"), false);
  });

  it("SYN001 não alerta tipo solto Numero", () => {
    const hits = analyzeLsp("Definir Numero vnA;\nNumero\n");
    assert.equal(hits.some((h) => h.id === "SYN001" && h.line === 1), false);
    assert.ok(hits.some((h) => h.id === "SYN010" && h.line === 1));
  });

  it("SYN010 alerta numero; solto (erro Senior)", () => {
    const hits = analyzeLsp("Definir Numero vnA;\nnumero;\n");
    assert.ok(hits.some((h) => h.id === "SYN010"));
    assert.equal(hits.some((h) => h.id === "SYN001" && h.line === 1), false);
    assert.equal(applySyn010DefinirStub("numero;"), "Definir Numero vnValor;");
  });

  it("detects SEM004 list field without AdicionarCampo", () => {
    const hits = analyzeLsp(
      "Definir Lista vlX;\nvlX.DefinirCampos();\nvlX.EfetivarCampos();\nvlX.Codigo = 1;\n"
    );
    assert.ok(hits.some((h) => h.id === "SEM004"));
  });

  it("allows SEM004 when AdicionarCampo registered the field", () => {
    const hits = analyzeLsp(
      'Definir Lista vlX;\nvlX.AdicionarCampo("Codigo", numero);\nvlX.Codigo = 1;\n'
    );
    assert.ok(!hits.some((h) => h.id === "SEM004"));
  });

  it("SEM003 alerta na linha do AbrirCursor", () => {
    const src = `Definir Cursor Cur_Ped;\nCur_Ped.AbrirCursor();\n`;
    const hits = analyzeLsp(src);
    const sem = hits.find((h) => h.id === "SEM003");
    assert.ok(sem);
    assert.equal(sem!.line, 1);
    assert.ok(sem!.startCol !== undefined);
    assert.equal(src.split("\n")[1].slice(sem!.startCol!, sem!.endCol!), "Cur_Ped.AbrirCursor");
  });

  it("SEM003 some com FecharCursor pareado", () => {
    const hits = analyzeLsp(
      "Definir Cursor Cur_Ped;\nCur_Ped.AbrirCursor();\nCur_Ped.FecharCursor();\n"
    );
    assert.equal(hits.some((h) => h.id === "SEM003"), false);
  });

  it("SEM002 alerta na linha do Abrir", () => {
    const line = 'vnArq = Abrir("tmp.txt", Gravar);';
    const src = `Definir Numero vnArq;\n${line}\n`;
    const hits = analyzeLsp(src);
    const sem = hits.find((h) => h.id === "SEM002");
    assert.ok(sem);
    assert.equal(sem!.line, 1);
    assert.equal(line.slice(sem!.startCol!, sem!.endCol!), "Abrir");
  });

  it("SEM002 some com Fechar pareado", () => {
    const hits = analyzeLsp(
      'Definir Numero vnArq;\nvnArq = Abrir("tmp.txt", Gravar);\nFechar(vnArq);\n'
    );
    assert.equal(hits.some((h) => h.id === "SEM002"), false);
  });

  it("SQL002 alerta na linha do SQL_Criar", () => {
    const src = "SQL_Criar(vnH);\n";
    const hits = analyzeLsp(src);
    const h = hits.find((x) => x.id === "SQL002");
    assert.ok(h);
    assert.equal(h!.line, 0);
    assert.equal(src.slice(h!.startCol!, h!.endCol!), "SQL_Criar");
  });

  it("SQL003 alerta na linha do SQL_AbrirCursor", () => {
    const src = "SQL_AbrirCursor(vnH);\n";
    const hits = analyzeLsp(src);
    const h = hits.find((x) => x.id === "SQL003");
    assert.ok(h);
    assert.equal(h!.line, 0);
    assert.equal(src.slice(h!.startCol!, h!.endCol!), "SQL_AbrirCursor");
  });

  it("SQL004 exige Definir Alfa no handle de SQL_Criar", () => {
    const hits = analyzeLsp("Definir Numero vnH;\nSQL_Criar(vnH);\n");
    const h = hits.find((x) => x.id === "SQL004");
    assert.ok(h);
    assert.match(h!.message, /Alfa/i);
  });

  it("SQL004 some com Definir Alfa", () => {
    const hits = analyzeLsp(
      'Definir Alfa vaCur;\nSQL_Criar(vaCur);\nSQL_DefinirComando(vaCur, "SELECT 1");\nSQL_AbrirCursor(vaCur);\nSQL_FecharCursor(vaCur);\nSQL_Destruir(vaCur);\n'
    );
    assert.equal(hits.some((x) => x.id === "SQL004"), false);
  });

  it("SQL005 AbrirCursor sem DefinirComando", () => {
    const hits = analyzeLsp("Definir Alfa vaCur;\nSQL_Criar(vaCur);\nSQL_AbrirCursor(vaCur);\n");
    assert.ok(hits.some((x) => x.id === "SQL005"));
  });

  it("SQL006 Usar* depois de DefinirComando", () => {
    const hits = analyzeLsp(
      'Definir Alfa vaNat;\nSQL_Criar(vaNat);\nSQL_DefinirComando(vaNat, "SELECT 1");\nSQL_UsarSQLSenior2(vaNat, 0);\n'
    );
    assert.ok(hits.some((x) => x.id === "SQL006"));
  });

  it("SQL007 DefinirComando sem SQL_Criar", () => {
    const hits = analyzeLsp(
      'Definir Alfa vaOrfao;\nSQL_DefinirComando(vaOrfao, "SELECT 1");\n'
    );
    assert.ok(hits.some((x) => x.id === "SQL007"));
  });

  it("SQL008 JOIN sem Usar* nativo", () => {
    const hits = analyzeLsp(
      'Definir Alfa vaJoin;\nSQL_Criar(vaJoin);\nSQL_DefinirComando(vaJoin, "SELECT a FROM t INNER JOIN u ON 1=1");\n'
    );
    assert.ok(hits.some((x) => x.id === "SQL008"));
  });

  it("SQL008 some com Abrangencia(0)+Senior2(0)", () => {
    const hits = analyzeLsp(
      'Definir Alfa vaJoin;\nSQL_Criar(vaJoin);\nSQL_UsarAbrangencia(vaJoin, 0);\nSQL_UsarSQLSenior2(vaJoin, 0);\nSQL_DefinirComando(vaJoin, "SELECT a FROM t INNER JOIN u ON 1=1");\nSQL_FecharCursor(vaJoin);\nSQL_Destruir(vaJoin);\n'
    );
    assert.equal(hits.some((x) => x.id === "SQL008"), false);
  });

  it("SQL008 via variável Alfa com subquery", () => {
    const hits = analyzeLsp(
      'Definir Alfa vaCur;\nDefinir Alfa vaSql;\nvaSql = "SELECT (SELECT 1 FROM DUAL) x FROM t";\nSQL_Criar(vaCur);\nSQL_DefinirComando(vaCur, vaSql);\n'
    );
    assert.ok(hits.some((x) => x.id === "SQL008"));
  });

  it("SQL009 mistura API simples e completa", () => {
    const hits = analyzeLsp(
      "Definir Cursor Cur_X;\nDefinir Alfa vaX;\nSQL_Criar(vaX);\nSQL_AbrirCursor(Cur_X);\nvaX.AbrirCursor();\n"
    );
    assert.ok(hits.some((x) => x.id === "SQL009"));
    assert.ok(hits.filter((x) => x.id === "SQL009").length >= 2);
  });
});
