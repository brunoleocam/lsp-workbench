/**
 * Catálogo de membros Cursor / Lista (domínio puro — PDR-004 ACC-MEM).
 * Fonte: docs/lsp/cursores.md e docs/lsp/listas.md
 */

export type MemberKind = "method" | "property";

export type MemberSpec = {
  name: string;
  kind: MemberKind;
  detail: string;
  documentation: string;
  insertText: string;
  /** Snippet VS Code format */
  isSnippet?: boolean;
};

export const CURSOR_MEMBERS: MemberSpec[] = [
  {
    name: "SQL",
    kind: "property",
    detail: "Cursor.SQL",
    documentation: "Atribui o comando SQL do cursor simples.",
    insertText: "SQL = \"${1:SELECT 1 FROM DUAL}\";",
    isSnippet: true,
  },
  {
    name: "AbrirCursor",
    kind: "method",
    detail: "AbrirCursor()",
    documentation: "Abre o cursor e executa o SQL.",
    insertText: "AbrirCursor();",
  },
  {
    name: "FecharCursor",
    kind: "method",
    detail: "FecharCursor()",
    documentation: "Fecha o cursor.",
    insertText: "FecharCursor();",
  },
  {
    name: "Proximo",
    kind: "method",
    detail: "Proximo()",
    documentation: "Avança para o próximo registro.",
    insertText: "Proximo();",
  },
  {
    name: "Achou",
    kind: "property",
    detail: "Achou",
    documentation: "Indica se há registro atual (loop Enquanto).",
    insertText: "Achou",
  },
  {
    name: "NaoAchou",
    kind: "property",
    detail: "NaoAchou",
    documentation: "Indica se não há registro atual.",
    insertText: "NaoAchou",
  },
  {
    name: "UsaAbrangencia",
    kind: "method",
    detail: "UsaAbrangencia(Numero)",
    documentation: "Define abrangência de usuário ao abrir (1 = sim).",
    insertText: "UsaAbrangencia(${1:1});",
    isSnippet: true,
  },
];

export const LISTA_MEMBERS: MemberSpec[] = [
  {
    name: "DefinirCampos",
    kind: "method",
    detail: "DefinirCampos()",
    documentation: "Inicia fase de adição de campos.",
    insertText: "DefinirCampos();",
  },
  {
    name: "EfetivarCampos",
    kind: "method",
    detail: "EfetivarCampos()",
    documentation: "Encerra definição de campos.",
    insertText: "EfetivarCampos();",
  },
  {
    name: "AdicionarCampo",
    kind: "method",
    detail: "AdicionarCampo(Alfa, Tipo, Numero?)",
    documentation: "Adiciona campo à lista.",
    insertText: 'AdicionarCampo("${1:CAMPO}", ${2|Alfa,Numero,Data|});',
    isSnippet: true,
  },
  {
    name: "Adicionar",
    kind: "method",
    detail: "Adicionar()",
    documentation: "Adiciona registro no final.",
    insertText: "Adicionar();",
  },
  {
    name: "Inserir",
    kind: "method",
    detail: "Inserir()",
    documentation: "Insere registro na posição atual.",
    insertText: "Inserir();",
  },
  {
    name: "Editar",
    kind: "method",
    detail: "Editar()",
    documentation: "Entra em modo edição do registro atual.",
    insertText: "Editar();",
  },
  {
    name: "Gravar",
    kind: "method",
    detail: "Gravar()",
    documentation: "Grava alterações do registro virtual.",
    insertText: "Gravar();",
  },
  {
    name: "Cancelar",
    kind: "method",
    detail: "Cancelar()",
    documentation: "Descarta alterações do registro virtual.",
    insertText: "Cancelar();",
  },
  {
    name: "Excluir",
    kind: "method",
    detail: "Excluir()",
    documentation: "Exclui o registro atual.",
    insertText: "Excluir();",
  },
  {
    name: "Primeiro",
    kind: "method",
    detail: "Primeiro()",
    documentation: "Posiciona no primeiro registro.",
    insertText: "Primeiro();",
  },
  {
    name: "Ultimo",
    kind: "method",
    detail: "Ultimo()",
    documentation: "Posiciona no último registro.",
    insertText: "Ultimo();",
  },
  {
    name: "Anterior",
    kind: "method",
    detail: "Anterior()",
    documentation: "Registro anterior.",
    insertText: "Anterior();",
  },
  {
    name: "Proximo",
    kind: "method",
    detail: "Proximo()",
    documentation: "Próximo registro.",
    insertText: "Proximo();",
  },
  {
    name: "SetarChave",
    kind: "method",
    detail: "SetarChave()",
    documentation: "Inicia edição de chave (limpa valores).",
    insertText: "SetarChave();",
  },
  {
    name: "EditarChave",
    kind: "method",
    detail: "EditarChave()",
    documentation: "Edita chave mantendo valores.",
    insertText: "EditarChave();",
  },
  {
    name: "VaiParaChave",
    kind: "method",
    detail: "VaiParaChave()",
    documentation: "Procura registro pela chave.",
    insertText: "VaiParaChave();",
  },
  {
    name: "Limpar",
    kind: "method",
    detail: "Limpar()",
    documentation: "Remove todos os registros.",
    insertText: "Limpar();",
  },
  {
    name: "Ordenar",
    kind: "method",
    detail: "Ordenar()",
    documentation: "Ordena conforme chave ativa.",
    insertText: "Ordenar();",
  },
  {
    name: "IDA",
    kind: "property",
    detail: "IDA",
    documentation: "Início de arquivo (antes do primeiro).",
    insertText: "IDA",
  },
  {
    name: "FDA",
    kind: "property",
    detail: "FDA",
    documentation: "Fim de arquivo (após o último).",
    insertText: "FDA",
  },
  {
    name: "NumReg",
    kind: "property",
    detail: "NumReg",
    documentation: "Número do registro atual (base 0).",
    insertText: "NumReg",
  },
  {
    name: "QtdRegistros",
    kind: "property",
    detail: "QtdRegistros",
    documentation: "Quantidade de registros.",
    insertText: "QtdRegistros",
  },
];

export type ReceiverKind = "cursor" | "lista" | "unknown";

/** Tipo do receptor a partir de Definir no fonte. */
export function resolveReceiverKind(source: string, receiverName: string): ReceiverKind {
  const re = new RegExp(
    String.raw`Definir\s+(Cursor|Lista)\s+${receiverName}\b`,
    "i"
  );
  const m = source.match(re);
  if (!m) return "unknown";
  return /^Cursor$/i.test(m[1]) ? "cursor" : "lista";
}

/** Campos registrados via AdicionarCampo("Nome", …). */
export function extractListaFields(source: string, listName: string): string[] {
  const fields: string[] = [];
  const re = new RegExp(
    String.raw`${listName}\.AdicionarCampo\s*\(\s*"([^"]+)"`,
    "gi"
  );
  let m: RegExpExecArray | null;
  while ((m = re.exec(source))) {
    if (!fields.includes(m[1])) fields.push(m[1]);
  }
  return fields;
}

export type MemberSuggestion = MemberSpec & { source: "builtin" | "field" };

/**
 * Sugestões após `receptor.` (prefixo opcional do membro).
 */
export function membersAfterDot(
  source: string,
  receiverName: string,
  memberPrefix: string
): MemberSuggestion[] {
  const kind = resolveReceiverKind(source, receiverName);
  if (kind === "unknown") return [];

  const prefix = memberPrefix.toLowerCase();
  const out: MemberSuggestion[] = [];

  const builtins = kind === "cursor" ? CURSOR_MEMBERS : LISTA_MEMBERS;
  for (const mem of builtins) {
    if (prefix && !mem.name.toLowerCase().startsWith(prefix)) continue;
    out.push({ ...mem, source: "builtin" });
  }

  if (kind === "lista") {
    for (const field of extractListaFields(source, receiverName)) {
      if (prefix && !field.toLowerCase().startsWith(prefix)) continue;
      if (out.some((x) => x.name.toLowerCase() === field.toLowerCase())) continue;
      out.push({
        name: field,
        kind: "property",
        detail: `${receiverName}.${field}`,
        documentation: `Campo dinâmico via AdicionarCampo.`,
        insertText: field,
        source: "field",
      });
    }
  }

  out.sort((a, b) => a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" }));
  return out;
}

/** Detecta `Nome.` ou `Nome.pre` na linha até o cursor. */
export function parseMemberAccess(
  linePrefix: string
): { receiver: string; memberPrefix: string } | undefined {
  const m = linePrefix.match(/(\w+)\.(\w*)$/);
  if (!m) return undefined;
  return { receiver: m[1], memberPrefix: m[2] };
}
