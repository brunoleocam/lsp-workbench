import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { analyzeLsp, type DiagnosticHit } from "../index";

const DECL = "Definir Alfa vaDes;\nDefinir Numero vnCod;\nDefinir Cursor C;\n";
const DECL_LINES = 3;
const IDS = /^(DEM002|DEM003|SQL01[2-5]|SEM007)$/;

const catalogTableColumns = new Map([
  ["E075PRO", new Set(["CODEMP", "CODPRO", "DESPRO"])],
  ["E085CLI", new Set(["CODCLI", "NOMCLI"])],
]);

function dic(body: string, opts: Parameters<typeof analyzeLsp>[1] = {}): DiagnosticHit[] {
  return analyzeLsp(DECL + body, opts).filter((h) => IDS.test(h.id));
}

const ids = (hits: DiagnosticHit[]) => hits.map((h) => h.id);

describe("DEM002 — campo inexistente em TABELA.CAMPO (AC-060)", () => {
  it("campo fora da tabela do catálogo dá erro no nome do campo", () => {
    const hits = dic("vaDes = E075PRO.XYZ;\n", { catalogTableColumns });
    assert.equal(hits.length, 1);
    assert.equal(hits[0].id, "DEM002");
    assert.equal(hits[0].message, "Campo XYZ não foi encontrado");
    assert.equal(hits[0].severity, "error");
    assert.equal(hits[0].line, DECL_LINES);
    assert.equal(hits[0].startCol, 16);
    assert.equal(hits[0].endCol, 19);
  });

  it("campo existente (sem diferenciar caixa), tabela fora do catálogo ou sem catálogo: nada", () => {
    assert.deepEqual(dic("vaDes = E075PRO.DesPro;\n", { catalogTableColumns }), []);
    assert.deepEqual(dic("vaDes = E999ABC.XYZ;\n", { catalogTableColumns }), []);
    assert.deepEqual(dic("vaDes = E075PRO.XYZ;\n"), []);
  });

  it("vale também como destino e dentro de condição", () => {
    assert.deepEqual(ids(dic('E075PRO.XYZ = "a";\nSe (E085CLI.ABC = 1) { }\n', { catalogTableColumns })), [
      "DEM002",
      "DEM002",
    ]);
  });

  it("variável declarada com nome de tabela não é TABELA.CAMPO", () => {
    assert.deepEqual(dic("Definir Cursor E075PRO;\nvaDes = E075PRO.XYZ;\n", { catalogTableColumns }), []);
  });
});

describe("DEM003 — coluna do SELECT inexistente na tabela (aviso)", () => {
  it("coluna sem prefixo, com uma tabela no FROM", () => {
    const hits = dic('C.SQL "SELECT CODPRO, XYZ FROM E075PRO";\n', { catalogTableColumns });
    assert.equal(hits.length, 1);
    assert.equal(hits[0].id, "DEM003");
    assert.equal(hits[0].message, "Campo XYZ não foi encontrado na tabela E075PRO (SELECT do cursor C)");
    assert.equal(hits[0].severity, "warning");
    assert.equal(hits[0].startCol, 22);
    assert.equal(hits[0].endCol, 25);
  });

  it("coluna com alias da tabela", () => {
    const hits = dic('C.SQL "SELECT P.CODPRO, P.XYZ FROM E075PRO P";\n', { catalogTableColumns });
    assert.deepEqual(ids(hits), ["DEM003"]);
  });

  it("sem prefixo com duas tabelas, ou sem catálogo: nada", () => {
    assert.deepEqual(dic('C.SQL "SELECT XYZ FROM E075PRO, E085CLI";\n', { catalogTableColumns }), []);
    assert.deepEqual(dic('C.SQL "SELECT XYZ FROM E075PRO";\n'), []);
  });
});

describe("SQL012 / SQL013 — campos do SELECT do cursor (AC-061)", () => {
  it("campo fora do SELECT", () => {
    const hits = dic('C.SQL "SELECT CODPRO FROM E075PRO";\nC.AbrirCursor();\nvaDes = C.DesPro;\nC.FecharCursor();\n');
    assert.equal(hits.length, 1);
    assert.equal(hits[0].id, "SQL012");
    assert.equal(hits[0].message, "Campo DesPro não foi encontrado no SELECT do cursor C");
    assert.equal(hits[0].severity, "error");
    assert.equal(hits[0].line, DECL_LINES + 2);
    assert.equal(hits[0].startCol, 10);
    assert.equal(hits[0].endCol, 16);
  });

  it("apelido, Tabela.Coluna, texto em várias linhas com \\ e concatenação de literais", () => {
    const src =
      'C.SQL "SELECT E075PRO.CODPRO, DESPRO AS NOME \\\n  FROM E075PRO " + "WHERE CODEMP = 1";\n' +
      "C.AbrirCursor();\nvaDes = C.NOME;\nvaDes = C.CodPro;\nvaDes = C.DESPRO;\nC.FecharCursor();\n";
    assert.deepEqual(
      dic(src).map((h) => `${h.id}:${h.line}`),
      [`SQL012:${DECL_LINES + 5}`]
    );
  });

  it("métodos e Achou/NaoAchou não são campos", () => {
    const src =
      'C.SQL "SELECT CODPRO FROM E075PRO";\nC.AbrirCursor();\nEnquanto (C.Achou) { C.Proximo(); }\nSe (C.NaoAchou) { }\nC.FecharCursor();\n';
    assert.deepEqual(dic(src), []);
  });

  it("SELECT *, SQL por variável ou cursor com outro SQL que traz o campo: nada", () => {
    assert.deepEqual(dic('C.SQL "SELECT * FROM E075PRO";\nvaDes = C.DESPRO;\n'), []);
    assert.deepEqual(dic('C.SQL "SELECT P.* FROM E075PRO P";\nvaDes = C.DESPRO;\n'), []);
    assert.deepEqual(dic("C.SQL vaDes;\nvaDes = C.DESPRO;\n"), []);
    assert.deepEqual(
      dic('Se (vnCod = 1) C.SQL "SELECT CODPRO FROM E075PRO";\nSenao C.SQL "SELECT DESPRO FROM E075PRO";\nvaDes = C.DESPRO;\n'),
      []
    );
  });

  it("coluna repetida no SELECT (aviso: regras em produção têm SELECT com coluna repetida)", () => {
    const hits = dic('C.SQL "SELECT CODPRO, DESPRO, CODPRO FROM E075PRO";\n');
    assert.equal(hits.length, 1);
    assert.equal(hits[0].id, "SQL013");
    assert.equal(hits[0].severity, "warning");
    assert.equal(hits[0].message, 'Campo de nome "CODPRO" está sendo selecionado repetidamente no cursor "C".');
    assert.equal(hits[0].startCol, 30);
    assert.equal(hits[0].endCol, 36);
  });

  it("mesmo nome em tabelas diferentes conta como repetido; apelido distinto não", () => {
    assert.deepEqual(ids(dic('C.SQL "SELECT A.CODEMP, B.CODEMP FROM E075PRO A, E085CLI B";\n')), ["SQL013"]);
    assert.deepEqual(dic('C.SQL "SELECT A.CODEMP, B.CODEMP EMPCLI FROM E075PRO A, E085CLI B";\n'), []);
  });

  it("subconsulta e função no SELECT não confundem a lista de colunas", () => {
    const src =
      'C.SQL "SELECT MAX(CODPRO) MAIOR, (SELECT COUNT(*) FROM E085CLI) QTD FROM E075PRO";\nvaDes = C.MAIOR;\nvnCod = C.QTD;\n';
    assert.deepEqual(dic(src), []);
  });
});

describe("SEM007 — atribuição a campo de cursor (AC-062)", () => {
  it("atribuição direta e composta", () => {
    const hits = dic("C.CODPRO = 1;\nC.CODPRO += 1;\n");
    assert.deepEqual(ids(hits), ["SEM007", "SEM007"]);
    assert.equal(hits[0].message, "não é possível atribuir valores a campos de cursores.");
    assert.equal(hits[0].startCol, 0);
    assert.equal(hits[0].endCol, 8);
  });

  it("comparação em condição e leitura do campo: nada", () => {
    assert.deepEqual(dic("Se (C.CODPRO = 1) { vnCod = C.CODPRO; }\n"), []);
  });
});

describe("SQL014 — AbrirCursor sem SQL (AC-063)", () => {
  it("AbrirCursor sem C.SQL antes", () => {
    const hits = dic("C.AbrirCursor();\nC.FecharCursor();\n");
    assert.equal(hits.length, 1);
    assert.equal(hits[0].id, "SQL014");
    assert.equal(hits[0].message, "Cursor C está sem comando SQL");
    assert.equal(hits[0].startCol, 2);
    assert.equal(hits[0].endCol, 13);
  });

  it("com C.SQL antes: nada", () => {
    assert.deepEqual(dic('C.SQL "SELECT CODPRO FROM E075PRO";\nC.AbrirCursor();\nC.FecharCursor();\n'), []);
  });
});

describe("SQL015 — parâmetro do SQL sem variável (AC-064)", () => {
  const sql = 'C.SQL "SELECT CODPRO FROM E075PRO WHERE CODEMP = :vnEmp";\n';

  it("parâmetro não definido nem usado na regra: aviso", () => {
    const hits = dic(sql);
    assert.equal(hits.length, 1);
    assert.equal(hits[0].id, "SQL015");
    assert.equal(
      hits[0].message,
      'comando SQL definido incorretamente: identificador "vnEmp" não foi declarado ou utilizado na regra. Somente variáveis da regra podem ser utilizadas como parâmetros de cursores'
    );
    assert.equal(hits[0].severity, "warning");
    assert.equal(hits[0].startCol, 49);
    assert.equal(hits[0].endCol, 55);
  });

  it("definido, usado fora do SQL ou dentro de literal SQL entre aspas simples: nada", () => {
    assert.deepEqual(dic("Definir Numero vnEmp;\n" + sql), []);
    assert.deepEqual(dic("vnEmp = 1;\n" + sql), []);
    assert.deepEqual(dic("Funcao F(Numero vnEmp); { }\n" + sql), []);
    assert.deepEqual(dic("C.SQL \"SELECT CODPRO FROM E075PRO WHERE HORA = '10:MI'\";\n"), []);
  });
});
