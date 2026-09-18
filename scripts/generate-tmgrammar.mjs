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
const grammar = {
  scopeName: "source.senior-lsp",
  patterns: [
    { include: "#comments" },
    { include: "#strings" },
    { include: "#keywords" },
    { include: "#types" },
    { include: "#functions" },
    { include: "#numbers" },
  ],
  repository: {
    comments: {
      patterns: [
        { name: "comment.line.lsp", begin: "@", end: "@" },
        { name: "comment.block.lsp", begin: "/\\*", end: "\\*/" },
      ],
    },
    strings: {
      name: "string.quoted.double.lsp",
      begin: '"',
      end: '"',
      patterns: [{ name: "constant.character.escape.lsp", match: "\\\\." }],
    },
    keywords: {
      name: "keyword.control.lsp",
      match:
        "\\b(Se|Senao|Enquanto|Para|Funcao|Definir|Cancel|Pare|Continue|Mensagem|Retorna|Inicio|Fim|FimSe|FimEnquanto)\\b",
    },
    types: {
      name: "storage.type.lsp",
      match: "\\b(Alfa|Numero|Data|Lista|Cursor|Tabela)\\b",
    },
    functions: {
      name: "support.function.lsp",
      match: `\\b(${escaped})\\b`,
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
console.log("TextMate functions:", names.length);
