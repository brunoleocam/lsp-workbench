/**
 * Scaffold de projeto de relatório (PDR-008).
 */

import * as fs from "node:fs";
import * as path from "node:path";

export type GerarRelatorioInput = {
  /** Pasta pai onde criar o projeto (workspace folder ou escolhida). */
  parentDir: string;
  codigo: string;
  descricao: string;
  categoria?: string;
  detalheNome?: string;
};

function writeFile(filePath: string, content: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
}

/** Cria a árvore multi-arquivo. Retorna o path da pasta do relatório. */
export function scaffoldRelatorioProject(input: GerarRelatorioInput): string {
  const codigo = input.codigo.trim().replace(/[^A-Za-z0-9_]/g, "");
  if (!codigo) throw new Error("Código do relatório inválido.");
  const detalhe = (input.detalheNome || "Detalhe_1").replace(/[^A-Za-z0-9_]/g, "") || "Detalhe_1";
  const root = path.join(input.parentDir, codigo);
  if (fs.existsSync(root)) {
    throw new Error(`Pasta já existe: ${root}`);
  }

  const desc = input.descricao.trim() || codigo;
  const cat = (input.categoria || "").trim();

  writeFile(
    path.join(root, "relatorio.json"),
    JSON.stringify(
      {
        $schema: "../../docs/gerador-relatorios/schema/relatorio.schema.json",
        codigo,
        descricao: desc,
        categoria: cat || undefined,
        tipoRelatorio: "Padrao",
        detalhePrincipal: detalhe,
        orientacao: "Retrato",
      },
      null,
      2
    ) + "\n"
  );

  writeFile(
    path.join(root, "Definicao", "Entrada.json"),
    JSON.stringify(
      {
        $schema: "../../../docs/gerador-relatorios/schema/entrada.schema.json",
        parametros: [
          {
            nome: "ETitulo",
            descricao: "Título do Relatório",
            tipo: "Alfa",
            tamanho: 25,
            abrangencia: false,
          },
          {
            nome: "EMosUsu",
            descricao: "Mostrar o Usuário",
            tipo: "Alfa",
            tamanho: 1,
            edicao: "U",
            abrangencia: false,
            valores: [
              { valor: "S", descricao: "Sim", padrao: true },
              { valor: "N", descricao: "Não" },
            ],
          },
          {
            nome: "ELisEnt",
            descricao: "Listar a Tela de Entrada",
            tipo: "Alfa",
            tamanho: 1,
            edicao: "U",
            abrangencia: false,
            valores: [
              { valor: "S", descricao: "Sim", padrao: true },
              { valor: "N", descricao: "Não" },
            ],
          },
        ],
      },
      null,
      2
    ) + "\n"
  );

  const defFiles: [string, string][] = [
    ["Funcoes-Globais.lsp", "@ Funcoes Globais — declarar funcoes aqui; reinicializar vars na Inicializacao @\n"],
    ["Inicializacao.lsp", "@ Inicializacao — uma vez apos OK na Entrada @\n"],
    [
      "Pre-Selecao.lsp",
      `@ Pre-Selecao — unico ponto para alterar o SELECT @
Definir Alfa aSQL;
aSQL = "";
@ InsClauSQLWhere("${detalhe}", aSQL); @
`,
    ],
    ["Selecao.lsp", "@ Selecao — por registro; Cancel para excluir linha @\n"],
    ["Finalizacao.lsp", "@ Finalizacao @\n"],
    ["Imprimir-Pagina.lsp", "@ Imprimir Pagina — opcional: vBandeja @\n"],
  ];
  for (const [name, body] of defFiles) {
    writeFile(path.join(root, "Definicao", name), body);
  }

  writeFile(
    path.join(root, "Secoes", detalhe, "secao.json"),
    JSON.stringify(
      {
        $schema: "../../../../docs/gerador-relatorios/schema/secao.schema.json",
        nome: detalhe,
        tipo: "Detalhe",
        tabelaBase: "",
        classificacao: [],
        imprimir: true,
      },
      null,
      2
    ) + "\n"
  );
  writeFile(
    path.join(root, "Secoes", detalhe, "antes-imprimir.lsp"),
    `@ ${detalhe} Antes de Imprimir @\n`
  );
  writeFile(
    path.join(root, "Secoes", detalhe, "depois-imprimir.lsp"),
    `@ ${detalhe} Depois de Imprimir @\n`
  );

  writeFile(
    path.join(root, "README.md"),
    `# ${codigo} — ${desc}

Projeto de relatório (LSP Workbench / PDR-008).

## Copiar para o Senior

1. Abra o Gerador de Relatórios e o modelo correspondente (ou crie categoria/número).
2. Para cada arquivo \`.lsp\` abaixo, cole o conteúdo no evento indicado:

| Arquivo | Evento no Senior |
|---------|------------------|
| \`Definicao/Funcoes-Globais.lsp\` | Modelo → Funções Globais |
| \`Definicao/Inicializacao.lsp\` | Modelo → Inicialização |
| \`Definicao/Pre-Selecao.lsp\` | Modelo → Pré-Seleção |
| \`Definicao/Selecao.lsp\` | Modelo → Seleção |
| \`Definicao/Finalizacao.lsp\` | Modelo → Finalização |
| \`Definicao/Imprimir-Pagina.lsp\` | Modelo → Imprimir Página |
| \`Secoes/<Nome>/antes-imprimir.lsp\` | Seção → Antes de Imprimir |
| \`Secoes/<Nome>/depois-imprimir.lsp\` | Seção → Depois de Imprimir |

3. Configure **Tabela Base**, Classificação e Entrada no Senior conforme \`secao.json\` / \`Entrada.json\` (não são colados automaticamente).

Comandos úteis na extensão: **Copiar regra atual**, **Exportar multi-trecho**.
`
  );

  return root;
}

/** Monta um .lsp multi-trecho (estilo export Senior) a partir da pasta do projeto. */
export function buildMultiTrechoExport(rootDir: string): string {
  const chunks: { desc: string; body: string }[] = [];
  const pushIf = (desc: string, rel: string) => {
    const fp = path.join(rootDir, rel);
    if (!fs.existsSync(fp)) return;
    const body = fs.readFileSync(fp, "utf8").replace(/\r\n/g, "\n");
    chunks.push({ desc, body });
  };

  pushIf("ModeloGerador_Funções Globais", path.join("Definicao", "Funcoes-Globais.lsp"));
  pushIf("ModeloGerador_Inicialização", path.join("Definicao", "Inicializacao.lsp"));
  pushIf("ModeloGerador_Pré-Seleção", path.join("Definicao", "Pre-Selecao.lsp"));
  pushIf("ModeloGerador_Seleção", path.join("Definicao", "Selecao.lsp"));
  pushIf("ModeloGerador_Finalização", path.join("Definicao", "Finalizacao.lsp"));
  pushIf("ModeloGerador_Imprimir Página", path.join("Definicao", "Imprimir-Pagina.lsp"));

  const secoes = path.join(rootDir, "Secoes");
  if (fs.existsSync(secoes)) {
    for (const name of fs.readdirSync(secoes)) {
      const dir = path.join(secoes, name);
      if (!fs.statSync(dir).isDirectory()) continue;
      pushIf(`${name}_Antes Imprimir`, path.join("Secoes", name, "antes-imprimir.lsp"));
      pushIf(`${name}_Depois Imprimir`, path.join("Secoes", name, "depois-imprimir.lsp"));
    }
  }

  const lines: string[] = [];
  let code = 1;
  for (const c of chunks) {
    lines.push("--------------------------------------------------------------------------------");
    lines.push(`Código: ${code} - Descrição: ${c.desc}`);
    lines.push("--------------------------------------------------------------------------------");
    lines.push("");
    lines.push(c.body.trimEnd());
    lines.push("");
    code++;
  }
  return lines.join("\n");
}
