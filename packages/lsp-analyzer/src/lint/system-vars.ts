/**
 * Variáveis de sistema do Gerador de Relatórios / ambiente Senior.
 * Fonte: docs/lsp/variaveis-de-sistema.md
 */

export type SystemVarTipo = "Alfa" | "Numero" | "Data";

export type SystemVarEntry = {
  name: string;
  tipo: SystemVarTipo;
  documentation: string;
  /** Snippet de insert (Ctrl+Espaço). Default = name. */
  insertText?: string;
  isSnippet?: boolean;
};

const GERTAB_NOTE =
  "Um único buffer em memória: não é possível ter dois GerTab* com o mesmo índice e valores diferentes. Use índices distintos ou limpe com LimpaGerTab* antes de reutilizar.";

export const LSP_SYSTEM_VARS: readonly SystemVarEntry[] = [
  { name: "AnoSis", tipo: "Numero", documentation: "Ano do sistema operacional." },
  { name: "CodEmp", tipo: "Numero", documentation: "Código da empresa." },
  { name: "CodFil", tipo: "Numero", documentation: "Código da filial." },
  { name: "CodUsu", tipo: "Numero", documentation: "Código do usuário." },
  { name: "DatSis", tipo: "Data", documentation: "Data do sistema operacional." },
  {
    name: "DBNomeUsuario",
    tipo: "Alfa",
    documentation: "Nome do usuário do banco de dados.",
  },
  {
    name: "DBTipo",
    tipo: "Alfa",
    documentation: "Banco de dados utilizado (ORACLE/SQLSERVER/POSTGRESQL/OUTRO).",
  },
  { name: "DesRodape", tipo: "Alfa", documentation: "Descrição para rodapé." },
  { name: "DiaSis", tipo: "Numero", documentation: "Dia do sistema operacional." },
  { name: "Empresa", tipo: "Alfa", documentation: "Nome da empresa." },
  {
    name: "ExtSis",
    tipo: "Alfa",
    documentation: "Data por extenso do sistema operacional.",
  },
  { name: "Filial", tipo: "Alfa", documentation: "Nome da filial." },
  {
    name: "GerTabAlf",
    tipo: "Alfa",
    documentation: `Variável alfanumérica com 2000 ocorrências (GerTabAlf[n]).\n\n${GERTAB_NOTE}\n\nPara zerar: \`LimpaGerTabAlf();\``,
    insertText: "GerTabAlf[${1:1}]",
    isSnippet: true,
  },
  {
    name: "GerTabNum",
    tipo: "Numero",
    documentation: `Variável numérica flutuante com 999 ocorrências (GerTabNum[n]).\n\n${GERTAB_NOTE}\n\nPara zerar: \`LimpaGerTabNum();\``,
    insertText: "GerTabNum[${1:1}]",
    isSnippet: true,
  },
  { name: "HorSis", tipo: "Alfa", documentation: "Hora do sistema operacional." },
  { name: "MesSis", tipo: "Numero", documentation: "Mês do sistema operacional." },
  { name: "NomUsu", tipo: "Alfa", documentation: "Nome do usuário." },
  { name: "NumPag", tipo: "Numero", documentation: "Número da página." },
  {
    name: "QtdDupPag",
    tipo: "Numero",
    documentation:
      "Quantidade de duplicatas impressas por página — utilizado no modelo FRCR002.DUP.",
  },
];

export const SYSTEM_VAR_NAMES = new Set(
  LSP_SYSTEM_VARS.map((v) => v.name.toLowerCase())
);

export function systemVarsMatchingPrefix(prefix: string): SystemVarEntry[] {
  const p = prefix.trim().toLowerCase();
  if (!p) return [...LSP_SYSTEM_VARS];
  return LSP_SYSTEM_VARS.filter((v) => v.name.toLowerCase().startsWith(p)).sort((a, b) =>
    a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" })
  );
}

export function findSystemVar(name: string): SystemVarEntry | undefined {
  const key = name.toLowerCase();
  return LSP_SYSTEM_VARS.find((v) => v.name.toLowerCase() === key);
}
