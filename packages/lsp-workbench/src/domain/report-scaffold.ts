/**
 * Scaffold de projeto de relatório (PDR-008) + import multi-trecho.
 */

import * as fs from "node:fs";
import * as path from "node:path";

export type SecaoTipo =
  | "Detalhe"
  | "Subtitulo"
  | "Subtotal"
  | "Adicional"
  | "Cabecalho"
  | "Cabecalho_Colunas"
  | "Titulo"
  | "Total_Geral"
  | "Rodape_Cabecalho"
  | "Rodape_Titulo"
  | "Pagina_Fundo";

export type GerarRelatorioInput = {
  /** Pasta pai onde criar o projeto (workspace folder ou escolhida). */
  parentDir: string;
  codigo: string;
  descricao: string;
  categoria?: string;
  /** @deprecated use secoes — mantido para compat. */
  detalheNome?: string;
  /** Nomes Senior das seções (ex. Detalhe_Transportadora). Vazio → Detalhe_1. */
  secoes?: string[];
};

export type MultiTrechoChunk = {
  codigo: number;
  descricao: string;
  body: string;
};

export type ParsedMultiTrecho = {
  chunks: MultiTrechoChunk[];
  ignoredNaImpressao: string[];
};

function writeFile(filePath: string, content: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
}

/** Infere tipo do secao.schema.json a partir do nome Senior. */
export function secaoTipoFromNome(nome: string): SecaoTipo {
  const n = nome.trim();
  if (/^Detalhe(_|$)/i.test(n)) return "Detalhe";
  if (/^Subtitulo(_|$)/i.test(n) || /^Subt[ií]tulo(_|$)/i.test(n)) return "Subtitulo";
  if (/^Subtotal(_|$)/i.test(n)) return "Subtotal";
  if (/^Adicional(_|$)/i.test(n)) return "Adicional";
  if (/^Cabecalho_Colunas/i.test(n) || /^Cabe[cç]alho_Colunas/i.test(n)) return "Cabecalho_Colunas";
  if (/^Cabecalho(_|$)/i.test(n) || /^Cabe[cç]alho(_|$)/i.test(n)) return "Cabecalho";
  if (/^Titulo(_|$)/i.test(n) || /^T[ií]tulo(_|$)/i.test(n)) return "Titulo";
  if (/^Total_Geral/i.test(n)) return "Total_Geral";
  if (/^Rodape_Cabecalho/i.test(n) || /^Rodap[eé]_Cabe/i.test(n)) return "Rodape_Cabecalho";
  if (/^Rodape_Titulo/i.test(n) || /^Rodap[eé]_T[ií]tulo/i.test(n)) return "Rodape_Titulo";
  if (/^Pagina_Fundo/i.test(n) || /^P[aá]gina_Fundo/i.test(n)) return "Pagina_Fundo";
  return "Detalhe";
}

function sanitizeSecaoNome(raw: string): string {
  return raw.trim().replace(/[^A-Za-z0-9_]/g, "") || "";
}

function resolveSecaoList(input: GerarRelatorioInput): string[] {
  if (input.secoes && input.secoes.length > 0) {
    const names = input.secoes.map(sanitizeSecaoNome).filter(Boolean);
    if (names.length) return [...new Set(names)];
  }
  const one = sanitizeSecaoNome(input.detalheNome || "Detalhe_1") || "Detalhe_1";
  return [one];
}

function writeSecaoFolder(root: string, nome: string, tipo: SecaoTipo, bodyAntes = "", bodyDepois = ""): void {
  const secao: Record<string, unknown> = {
    $schema: "../../../../docs/gerador-relatorios/schema/secao.schema.json",
    nome,
    tipo,
    imprimir: true,
  };
  if (tipo === "Detalhe") {
    secao.tabelaBase = "";
    secao.classificacao = [];
  }
  writeFile(path.join(root, "Secoes", nome, "secao.json"), JSON.stringify(secao, null, 2) + "\n");
  writeFile(
    path.join(root, "Secoes", nome, "antes-imprimir.lsp"),
    bodyAntes.trimEnd() ? bodyAntes.replace(/\r\n/g, "\n") : `@ ${nome} Antes de Imprimir @\n`
  );
  writeFile(
    path.join(root, "Secoes", nome, "depois-imprimir.lsp"),
    bodyDepois.trimEnd()
      ? bodyDepois.replace(/\r\n/g, "\n")
      : `@ ${nome} Depois de Imprimir @\n`
  );
}

function defaultEntradaJson(): string {
  return (
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
}

function writeReadme(
  root: string,
  codigo: string,
  desc: string,
  ignoredNaImpressao: string[] = []
): void {
  const ignored =
    ignoredNaImpressao.length > 0
      ? `\n## Eventos ignorados no import\n\n\`_Na Impressão\` não entra no scaffold ADR-007:\n\n${ignoredNaImpressao
          .map((d) => `- ${d}`)
          .join("\n")}\n`
      : "";

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

Comandos úteis na extensão: **Copiar Regra do Relatório**, **Visualizar Todas as Regras**, **Importar Relatório**.
${ignored}`
  );
}

/** Cria a árvore multi-arquivo. Retorna o path da pasta do relatório. */
export function scaffoldRelatorioProject(input: GerarRelatorioInput): string {
  const codigo = input.codigo.trim().replace(/[^A-Za-z0-9_]/g, "");
  if (!codigo) throw new Error("Código do relatório inválido.");
  const secoes = resolveSecaoList(input);
  const detalhePrincipal =
    secoes.find((s) => secaoTipoFromNome(s) === "Detalhe") ?? secoes[0];
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
        detalhePrincipal,
        orientacao: "Retrato",
      },
      null,
      2
    ) + "\n"
  );

  writeFile(path.join(root, "Definicao", "Entrada.json"), defaultEntradaJson());

  const defFiles: [string, string][] = [
    ["Funcoes-Globais.lsp", "@ Funcoes Globais — declarar funcoes aqui; reinicializar vars na Inicializacao @\n"],
    ["Inicializacao.lsp", "@ Inicializacao — uma vez apos OK na Entrada @\n"],
    [
      "Pre-Selecao.lsp",
      `@ Pre-Selecao — unico ponto para alterar o SELECT @
Definir Alfa aSQL;
aSQL = "";
@ InsClauSQLWhere("${detalhePrincipal}", aSQL); @
`,
    ],
    ["Selecao.lsp", "@ Selecao — por registro; Cancel para excluir linha @\n"],
    ["Finalizacao.lsp", "@ Finalizacao @\n"],
    ["Imprimir-Pagina.lsp", "@ Imprimir Pagina — opcional: vBandeja @\n"],
  ];
  for (const [name, body] of defFiles) {
    writeFile(path.join(root, "Definicao", name), body);
  }

  for (const nome of secoes) {
    writeSecaoFolder(root, nome, secaoTipoFromNome(nome));
  }

  writeReadme(root, codigo, desc);
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

const HEADER_RE =
  /^Código:\s*(\d+)\s*-\s*Descrição:\s*(.+)$/i;

/** Detecta se o texto parece um export “Visualizar Todas as Regras”. */
export function looksLikeMultiTrecho(text: string): boolean {
  return /Código:\s*\d+\s*-\s*Descrição:/i.test(text) && /-{20,}/.test(text);
}

/** Parse do dump multi-trecho Senior / Visualizar Todas as Regras. */
export function parseMultiTrechoImport(text: string): ParsedMultiTrecho {
  const src = text.replace(/\r\n/g, "\n");
  if (!looksLikeMultiTrecho(src)) {
    throw new Error(
      'Arquivo não parece um export multi-trecho (esperado "Código: N - Descrição: …").'
    );
  }

  const lines = src.split("\n");
  const chunks: MultiTrechoChunk[] = [];
  const ignoredNaImpressao: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();
    if (/^-{20,}$/.test(line) && i + 1 < lines.length) {
      const header = lines[i + 1].trim();
      const hm = header.match(HEADER_RE);
      if (hm && i + 2 < lines.length && /^-{20,}$/.test(lines[i + 2].trim())) {
        const codigo = Number(hm[1]);
        const descricao = hm[2].trim();
        i += 3;
        while (i < lines.length && lines[i].trim() === "") i++;
        const bodyLines: string[] = [];
        while (i < lines.length) {
          const peek = lines[i].trim();
          if (
            /^-{20,}$/.test(peek) &&
            i + 1 < lines.length &&
            HEADER_RE.test(lines[i + 1].trim())
          ) {
            break;
          }
          bodyLines.push(lines[i]);
          i++;
        }
        while (bodyLines.length && bodyLines[bodyLines.length - 1].trim() === "") {
          bodyLines.pop();
        }
        const body = bodyLines.join("\n");
        if (/_Na Impress[aã]o$/i.test(descricao)) {
          ignoredNaImpressao.push(descricao);
        } else {
          chunks.push({ codigo, descricao, body });
        }
        continue;
      }
    }
    i++;
  }

  if (chunks.length === 0) {
    throw new Error("Nenhum bloco Código/Descrição encontrado no arquivo.");
  }
  return { chunks, ignoredNaImpressao };
}

function normalizeModeloKey(desc: string): string {
  return desc
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

const MODELO_MAP: Record<string, string> = {
  "modelogerador_funcoes globais": "Funcoes-Globais.lsp",
  "modelogerador_inicializacao": "Inicializacao.lsp",
  "modelogerador_pre-selecao": "Pre-Selecao.lsp",
  "modelogerador_selecao": "Selecao.lsp",
  "modelogerador_finalizacao": "Finalizacao.lsp",
  "modelogerador_imprimir pagina": "Imprimir-Pagina.lsp",
};

export type ImportRelatorioInput = {
  parentDir: string;
  codigo: string;
  descricao?: string;
  text: string;
};

/** Cria projeto ADR-007 a partir do dump multi-trecho. */
export function scaffoldFromMultiTrecho(input: ImportRelatorioInput): string {
  const codigo = input.codigo.trim().replace(/[^A-Za-z0-9_]/g, "");
  if (!codigo) throw new Error("Código do relatório inválido.");
  const root = path.join(input.parentDir, codigo);
  if (fs.existsSync(root)) {
    throw new Error(`Pasta já existe: ${root}`);
  }

  const parsed = parseMultiTrechoImport(input.text);
  const desc = (input.descricao || codigo).trim();

  const defBodies = new Map<string, string>();
  const secaoBodies = new Map<string, { antes?: string; depois?: string }>();

  for (const c of parsed.chunks) {
    const key = normalizeModeloKey(c.descricao);
    const defFile = MODELO_MAP[key];
    if (defFile) {
      defBodies.set(defFile, c.body);
      continue;
    }

    const antes = c.descricao.match(/^(.+)_Antes Imprimir$/i);
    if (antes) {
      const nome = sanitizeSecaoNome(antes[1]);
      if (!nome) continue;
      const cur = secaoBodies.get(nome) ?? {};
      cur.antes = c.body;
      secaoBodies.set(nome, cur);
      continue;
    }
    const depois = c.descricao.match(/^(.+)_Depois Imprimir$/i);
    if (depois) {
      const nome = sanitizeSecaoNome(depois[1]);
      if (!nome) continue;
      const cur = secaoBodies.get(nome) ?? {};
      cur.depois = c.body;
      secaoBodies.set(nome, cur);
      continue;
    }
  }

  const secaoNames = [...secaoBodies.keys()];
  if (secaoNames.length === 0) {
    secaoNames.push("Detalhe_1");
  }
  const detalhePrincipal =
    secaoNames.find((s) => secaoTipoFromNome(s) === "Detalhe") ?? secaoNames[0];

  writeFile(
    path.join(root, "relatorio.json"),
    JSON.stringify(
      {
        $schema: "../../docs/gerador-relatorios/schema/relatorio.schema.json",
        codigo,
        descricao: desc,
        tipoRelatorio: "Padrao",
        detalhePrincipal,
        orientacao: "Retrato",
      },
      null,
      2
    ) + "\n"
  );
  writeFile(path.join(root, "Definicao", "Entrada.json"), defaultEntradaJson());

  const defaultDefs: [string, string][] = [
    ["Funcoes-Globais.lsp", "@ Funcoes Globais @\n"],
    ["Inicializacao.lsp", "@ Inicializacao @\n"],
    ["Pre-Selecao.lsp", "@ Pre-Selecao @\n"],
    ["Selecao.lsp", "@ Selecao @\n"],
    ["Finalizacao.lsp", "@ Finalizacao @\n"],
    ["Imprimir-Pagina.lsp", "@ Imprimir Pagina @\n"],
  ];
  for (const [name, fallback] of defaultDefs) {
    const body = defBodies.get(name);
    writeFile(
      path.join(root, "Definicao", name),
      body !== undefined ? (body.endsWith("\n") ? body : body + "\n") : fallback
    );
  }

  for (const nome of secaoNames) {
    const bodies = secaoBodies.get(nome) ?? {};
    writeSecaoFolder(
      root,
      nome,
      secaoTipoFromNome(nome),
      bodies.antes,
      bodies.depois
    );
  }

  writeReadme(root, codigo, desc, parsed.ignoredNaImpressao);
  return root;
}
