import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "../packages/lsp-workbench");
const j = JSON.parse(
  fs.readFileSync(path.join(root, "fixtures/extracted-functions.json"), "utf8")
);
const labels = Array.isArray(j) ? j : j.labels ?? [];
const names = [
  ...new Set(
    labels
      .map((x) => (typeof x === "string" ? x : x.label))
      .filter(Boolean)
  ),
];
const escaped = names
  .map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
  .join("|");

const SYSTEM_VARS = [
  "AnoSis",
  "CodEmp",
  "CodFil",
  "CodUsu",
  "DatSis",
  "DBNomeUsuario",
  "DBTipo",
  "DesRodape",
  "DiaSis",
  "Empresa",
  "ExtSis",
  "Filial",
  "GerTabAlf",
  "GerTabNum",
  "HorSis",
  "MesSis",
  "NomUsu",
  "NumPag",
  "QtdDupPag",
];
const systemEscaped = SYSTEM_VARS.map((n) =>
  n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
).join("|");

const TYPES_SCALAR = "Alfa|Numero|Data|Tabela";
const TYPES = `${TYPES_SCALAR}|Lista|Cursor`;

const LISTA_METHODS = [
  "DefinirCampos",
  "EfetivarCampos",
  "AdicionarCampo",
  "Adicionar",
  "Inserir",
  "Editar",
  "Gravar",
  "Cancelar",
  "Excluir",
  "Primeiro",
  "Ultimo",
  "Anterior",
  "Proximo",
  "SetarChave",
  "VaiParaChave",
  "Chave",
  "Quantidade",
  "Posicionar",
  "Ordenar",
  "Limpar",
].join("|");

const CURSOR_METHODS = [
  "AbrirCursor",
  "FecharCursor",
  "Proximo",
  "UsaAbrangencia",
].join("|");

const CURSOR_PROPS = ["SQL", "Achou", "NaoAchou"].join("|");

/** Instância `ws*` ou nome da porta na regra (PascalCase, ex. PedidoAssitencia). */
const WS_ROOT = "(?:(?:ws)\\w+|[A-Z][A-Za-z0-9_]*)";

/** Keywords SQL longas — case-insensitive (Select/FROM/…). */
const SQL_KEYWORDS_CI = [
  "SELECT",
  "INSERT",
  "UPDATE",
  "DELETE",
  "FROM",
  "WHERE",
  "EXISTS",
  "BETWEEN",
  "LIKE",
  "NULL",
  "JOIN",
  "INNER",
  "LEFT",
  "RIGHT",
  "OUTER",
  "FULL",
  "CROSS",
  "UNION",
  "ORDER",
  "GROUP",
  "HAVING",
  "DISTINCT",
  "INTO",
  "VALUES",
  "CREATE",
  "DROP",
  "ALTER",
  "TABLE",
  "VIEW",
  "INDEX",
  "DUAL",
  "MERGE",
  "WHEN",
  "THEN",
  "ELSE",
  "CASE",
  "WITH",
  "OVER",
  "PARTITION",
  "ROWNUM",
  "FETCH",
  "OFFSET",
  "LIMIT",
  "RETURNING",
  "DESC",
  "UNIQUE",
  "PRIMARY",
  "FOREIGN",
  "REFERENCES",
  "CONSTRAINT",
  "DEFAULT",
  "CAST",
].join("|");

/**
 * Keywords curtas — só MAIÚSCULAS (evita "as"/"or"/"in" em mensagens PT).
 */
const SQL_KEYWORDS_UPPER = [
  "AND",
  "OR",
  "NOT",
  "IN",
  "IS",
  "ON",
  "AS",
  "BY",
  "ALL",
  "SET",
  "KEY",
  "TOP",
  "ASC",
  "END",
].join("|");

const SQL_FUNCTIONS = [
  "TO_DATE",
  "STRTODATE",
  "TO_CHAR",
  "TO_NUMBER",
  "NVL",
  "NVL2",
  "COALESCE",
  "COUNT",
  "SUM",
  "AVG",
  "MAX",
  "MIN",
  "DECODE",
  "SYSDATE",
  "NEXTVAL",
  "CURRVAL",
  "UPPER",
  "LOWER",
  "TRIM",
  "SUBSTR",
  "LENGTH",
  "ROUND",
  "TRUNC",
  "ABS",
  "GREATEST",
  "LEAST",
].join("|");

const grammar = {
  scopeName: "source.senior-lsp",
  patterns: [
    { include: "#comments" },
    { include: "#strings" },
    { include: "#definitions" },
    { include: "#param-decls" },
    { include: "#webservice-access" },
    { include: "#cursor-access" },
    { include: "#list-access" },
    { include: "#operators" },
    { include: "#keywords-flow" },
    { include: "#keywords" },
    { include: "#types-lista" },
    { include: "#types-cursor" },
    { include: "#types" },
    { include: "#param-modifiers" },
    { include: "#system-vars" },
    { include: "#functions" },
    { include: "#function-calls" },
    { include: "#numbers" },
  ],
  repository: {
    comments: {
      patterns: [
        { name: "comment.line.lsp", begin: "@", end: "@|(?=$)" },
        { name: "comment.block.lsp", begin: "/\\*", end: "\\*/" },
      ],
    },
    strings: {
      name: "string.quoted.double.lsp",
      begin: '"',
      end: '"',
      patterns: [
        {
          name: "constant.character.escape.lsp",
          match: "\\\\.",
        },
        {
          name: "keyword.operator.continuation.lsp",
          match: "\\\\$",
        },
        { include: "#sql-in-string" },
      ],
    },
    "sql-in-string": {
      patterns: [
        {
          name: "keyword.other.sql.lsp",
          match: `\\b(${SQL_KEYWORDS_CI})\\b`,
          ignoreCase: true,
        },
        {
          name: "keyword.other.sql.lsp",
          match: `\\b(${SQL_KEYWORDS_UPPER})\\b`,
        },
        {
          name: "support.function.sql.lsp",
          match: `\\b(${SQL_FUNCTIONS})\\b`,
          ignoreCase: true,
        },
        {
          name: "variable.other.bind.sql.lsp",
          match: ":[A-Za-z_][A-Za-z0-9_]*",
        },
      ],
    },
    definitions: {
      patterns: [
        {
          name: "meta.definition.webservice.lsp",
          match: `\\b(Definir)\\s+((?:[A-Za-z_]\\w*\\.)+[A-Za-z_]\\w*)\\s+(\\w+)`,
          captures: {
            1: { name: "keyword.control.lsp" },
            2: { name: "entity.name.type.webservice.lsp" },
            3: { name: "variable.other.webservice.lsp" },
          },
        },
        {
          name: "meta.definition.function.lsp",
          match: `\\b(Definir)\\s+(Funcao)\\s+(\\w+)`,
          captures: {
            1: { name: "keyword.control.lsp" },
            2: { name: "storage.type.lsp" },
            3: { name: "entity.name.function.lsp" },
          },
        },
        {
          name: "meta.definition.lista.lsp",
          match: `\\b(Definir)\\s+(Lista)\\s+(\\w+)`,
          captures: {
            1: { name: "keyword.control.lsp" },
            2: { name: "storage.type.lista.lsp" },
            3: { name: "variable.other.lista.lsp" },
          },
        },
        {
          name: "meta.definition.cursor.lsp",
          match: `\\b(Definir)\\s+(Cursor)\\s+(\\w+)`,
          captures: {
            1: { name: "keyword.control.lsp" },
            2: { name: "storage.type.cursor.lsp" },
            3: { name: "variable.other.cursor.lsp" },
          },
        },
        {
          name: "meta.definition.variable.lsp",
          match: `\\b(Definir)\\s+(${TYPES_SCALAR})\\s+(\\w+)`,
          captures: {
            1: { name: "keyword.control.lsp" },
            2: { name: "storage.type.lsp" },
            3: { name: "variable.other.lsp" },
          },
        },
        {
          name: "meta.definition.function.impl.lsp",
          match: `^\\s*(Funcao)\\s+(\\w+)\\s*(?=\\()`,
          captures: {
            1: { name: "storage.type.lsp" },
            2: { name: "entity.name.function.lsp" },
          },
        },
      ],
    },
    "param-decls": {
      patterns: [
        {
          match: `\\b(${TYPES})\\s+(End)\\s+(\\w+)`,
          captures: {
            1: { name: "storage.type.lsp" },
            2: { name: "storage.modifier.lsp" },
            3: { name: "variable.parameter.lsp" },
          },
        },
        {
          match: `\\b(${TYPES})\\s+(\\w+)(?=\\s*[,\\)])`,
          captures: {
            1: { name: "storage.type.lsp" },
            2: { name: "variable.parameter.lsp" },
          },
        },
      ],
    },
    "webservice-access": {
      patterns: [
        {
          match: `\\b(${WS_ROOT})\\.(\\w+)\\.(\\w+)\\.(\\w+)\\.(\\w+)\\b`,
          captures: {
            1: { name: "variable.other.webservice.lsp" },
            2: { name: "variable.other.webservice.table.lsp" },
            3: { name: "variable.other.webservice.table.lsp" },
            4: { name: "variable.other.webservice.table.lsp" },
            5: { name: "variable.other.webservice.field.lsp" },
          },
        },
        {
          match: `\\b(${WS_ROOT})\\.(\\w+)\\.(\\w+)\\.(\\w+)\\b`,
          captures: {
            1: { name: "variable.other.webservice.lsp" },
            2: { name: "variable.other.webservice.table.lsp" },
            3: { name: "variable.other.webservice.table.lsp" },
            4: { name: "variable.other.webservice.field.lsp" },
          },
        },
        {
          match: `\\b(${WS_ROOT})\\.(\\w+)\\.(\\w+)\\b`,
          captures: {
            1: { name: "variable.other.webservice.lsp" },
            2: { name: "variable.other.webservice.table.lsp" },
            3: { name: "variable.other.webservice.field.lsp" },
          },
        },
        {
          match: `\\b(${WS_ROOT})\\.(\\w+)\\b`,
          captures: {
            1: { name: "variable.other.webservice.lsp" },
            2: { name: "variable.other.webservice.field.lsp" },
          },
        },
        {
          name: "variable.other.webservice.lsp",
          match: "\\bws\\w+\\b",
        },
      ],
    },
    "cursor-access": {
      patterns: [
        {
          match: `\\b((?:Cur_)\\w+)\\.(${CURSOR_METHODS})\\b`,
          captures: {
            1: { name: "variable.other.cursor.lsp" },
            2: { name: "entity.name.function.member.cursor.lsp" },
          },
        },
        {
          match: `\\b((?:Cur_)\\w+)\\.(${CURSOR_PROPS})\\b`,
          captures: {
            1: { name: "variable.other.cursor.lsp" },
            2: { name: "variable.other.property.cursor.lsp" },
          },
        },
        {
          match: "\\b((?:Cur_)\\w+)\\.(\\w+)\\b",
          captures: {
            1: { name: "variable.other.cursor.lsp" },
            2: { name: "variable.other.property.cursor.lsp" },
          },
        },
        {
          name: "variable.other.cursor.lsp",
          match: "\\bCur_\\w+\\b",
        },
      ],
    },
    "list-access": {
      patterns: [
        {
          match: `\\b((?:vl|a)\\w+)\\.(${LISTA_METHODS})\\b`,
          captures: {
            1: { name: "variable.other.lista.lsp" },
            2: { name: "entity.name.function.member.lista.lsp" },
          },
        },
        {
          match: "\\b((?:vl|a)\\w+)\\.(\\w+)\\b",
          captures: {
            1: { name: "variable.other.lista.lsp" },
            2: { name: "variable.other.property.lista.lsp" },
          },
        },
      ],
    },
    operators: {
      patterns: [
        {
          name: "keyword.operator.logical.lsp",
          match: "\\b(e|ou)\\b",
          ignoreCase: true,
        },
        {
          name: "keyword.operator.increment.lsp",
          match: "\\+\\+|--",
        },
        {
          name: "keyword.operator.comparison.lsp",
          match: "<>|<=|>=|<|>|=",
        },
        {
          name: "keyword.operator.arithmetic.division.lsp",
          match: "/",
        },
        {
          name: "keyword.operator.continuation.lsp",
          match: "\\\\",
        },
        {
          name: "keyword.operator.arithmetic.lsp",
          match: "\\+|\\-|\\*",
        },
      ],
    },
    "keywords-flow": {
      patterns: [
        {
          name: "keyword.control.flow.lsp",
          match: "(?i)\\bSenao\\b",
        },
        {
          name: "keyword.control.flow.lsp",
          match: "(?i)\\bEnquanto\\b",
        },
        {
          name: "keyword.control.flow.lsp",
          match: "(?i)\\bContinue\\b",
        },
        {
          name: "keyword.control.flow.lsp",
          match: "(?i)\\bPara\\b",
        },
        {
          name: "keyword.control.flow.lsp",
          match: "(?i)\\bPare\\b",
        },
        {
          name: "keyword.control.flow.lsp",
          match: "(?i)\\bSe\\b",
        },
      ],
    },
    keywords: {
      name: "keyword.control.lsp",
      match:
        "(?i)\\b(Definir|Cancel|Mensagem|Retorna|Inicio|Fim|FimSe|FimEnquanto)\\b",
    },
    "types-lista": {
      name: "storage.type.lista.lsp",
      match: "\\bLista\\b",
    },
    "types-cursor": {
      name: "storage.type.cursor.lsp",
      match: "\\bCursor\\b",
    },
    types: {
      name: "storage.type.lsp",
      match: `\\b(${TYPES_SCALAR}|Funcao)\\b`,
    },
    "param-modifiers": {
      name: "storage.modifier.lsp",
      match: "\\bEnd\\b",
    },
    "system-vars": {
      name: "constant.language.lsp",
      // Só sozinha (atribuição/parâmetro); após `.` é campo (WS/Lista/Cursor).
      match: `(?<!\\.)\\b(${systemEscaped})\\b`,
    },
    functions: {
      name: "entity.name.function.lsp",
      match: `\\b(${escaped})\\b`,
    },
    "function-calls": {
      name: "entity.name.function.lsp",
      match: "\\b([A-Za-z_]\\w*)\\s*(?=\\()",
    },
    numbers: {
      name: "constant.numeric.lsp",
      match: "\\b\\d+(\\.\\d+)?\\b",
    },
  },
};
fs.writeFileSync(
  path.join(root, "syntaxes/lsp.tmLanguage.json"),
  JSON.stringify(grammar, null, 2) + "\n"
);
console.log(
  "TextMate functions:",
  names.length,
  "system-vars:",
  SYSTEM_VARS.length
);
