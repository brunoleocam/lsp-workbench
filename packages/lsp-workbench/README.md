# LSP Workbench

Extensão para **VS Code** e **Cursor** com suporte à **Linguagem Senior de Programação (LSP)** usada no ecossistema **Senior Sistemas** (Sapiens, HCM e afins).

Abra um arquivo `.lsp` ou `.lspt` e a extensão ativa automaticamente a linguagem **Linguagem Senior** (`senior-lsp`).

![Syntax highlighting](media/01-syntax-highlighting.png)

---

## O que você ganha

| Recurso | O que faz |
|---------|-----------|
| **Syntax highlighting** | Cores para palavras-chave, funções, variáveis e literais |
| **Autocompletar** | Funções nativas (~200), variáveis, membros de Cursor/Lista e campos |
| **Hover** | Documentação ao passar o mouse em funções |
| **Ajuda de parâmetros** | Signature help ao digitar argumentos entre `(` `)` |
| **Diagnósticos** | Validação sintática e de regras (erros/avisos na edição) |
| **Quick fixes** | Correções sugeridas (lâmpada / Ctrl+.) |
| **Snippets** | Atalhos para `Definir`, blocos `{ }`, SQL API, helpers |
| **Formatador** | Indentação e layout (opcional: SQL embutido) |
| **Outline** | Visão de funções e símbolos no arquivo |
| **Ir para definição** | Navegação para funções do projeto |
| **Catálogo de banco** | Autocomplete de tabelas/campos (com catálogo local) |
| **Contextos / relatórios** | Escopo de símbolos e comandos de projeto de relatório |

---

## Instalação

1. Abra o [Marketplace](https://marketplace.visualstudio.com/items?itemName=brunoleocam.lsp-workbench) ou, no VS Code/Cursor: **Extensions** → busque **LSP Workbench**.
2. Instale e abra (ou crie) um arquivo com extensão `.lsp`.
3. Confirme no canto inferior direito que o modo de linguagem é **Linguagem Senior**.

Atalho de instalação rápida (Command Palette / Quick Open):

```text
ext install brunoleocam.lsp-workbench
```

---

## Guia rápido (5 minutos)

1. Crie `exemplo.lsp`.
2. Digite `def` e escolha um snippet de **Definir** (variável, função, etc.).
3. Digite o nome de uma função nativa (ex.: `TamanhoAlfa`) e use **Ctrl+Espaço** para completar.
4. Passe o mouse sobre a função → veja o **hover**.
5. Dentro dos `(` `)`, observe a **ajuda de parâmetros**.
6. Formate com **Shift+Alt+F** (ou Format Document).
7. Se aparecer um sublinhado vermelho/amarelo, abra a lâmpada (**Ctrl+.**) para quick fixes.

---

## Recursos em detalhe

### Syntax highlighting (cores)

A gramática TextMate + *semantic tokens* colorizam palavras-chave (`Se`, `Enquanto`, `Definir`), funções builtins, variáveis e membros.

![Syntax highlighting](media/01-syntax-highlighting.png)

Não há configuração obrigatória: basta o arquivo estar como **Linguagem Senior**.

---

### Autocompletar

Sugestões ao digitar ou com **Ctrl+Espaço**:

- Funções nativas Senior (catálogo SENIOR)
- Variáveis e funções do arquivo / projeto (conforme escopo)
- Após `.` em Cursor/Lista: membros e campos (`AdicionarCampo`, etc.)
- Com catálogo local: tabelas e `Tabela.Campo`

![Autocompletar](media/02-autocomplete.png)

Dica: em `[senior-lsp]` a extensão já desliga sugestões genéricas de “palavras do arquivo” para priorizar o completion LSP.

#### Membros de Lista / Cursor

Após digitar `.` em uma variável `Lista` ou `Cursor`, o suggest lista membros válidos:

![Membros de Lista](media/05-membros-lista.png)

---

### Hover (documentação)

Passe o mouse sobre uma função (nativa ou do projeto) para ver resumo e detalhes.

![Hover](media/03-hover.png)

---

### Ajuda durante a digitação (parâmetros)

Ao abrir `(` em uma chamada de função, o editor mostra a assinatura e destaca o parâmetro atual (*signature help*).

![Ajuda de parâmetros](media/04-signature-help.png)

---

### Validação sintática e de regras

Enquanto você edita, a extensão analisa o código e marca problemas (ex.: parâmetros incorretos, padrões inválidos da linguagem, regras `RUL*` / `SYN*` / `ANL*` / `GER*`).

![Diagnósticos](media/07-diagnostics.png)

Fluxo típico: erro → alerta → Quick Fix → código corrigido:

![Validação e quick fix](media/08-validation.gif)

- Painel **Problems** (Ctrl+Shift+M) lista todos os alertas.
- **Quick Fix** (Ctrl+.) aplica correções quando disponíveis.
- Para ignorar IDs específicos: setting `lsp.diagnostics.ignoreIds`.

---

### Snippets

Dezenas de snippets para estruturas comuns: `Definir Alfa/Numero/...`, blocos `Se`/`Enquanto`/`Para` com `{ }`, helpers de SQL (`ExecSQLEx`, `SQL_*`), etc.

Digite o prefixo do snippet e confirme com Tab/Enter.

---

### Formatador

- **Format Document** / **Format Selection**
- Settings: `lsp.format.enabled`, `lsp.format.indentSize`, `lsp.format.braceStyle`, …
- SQL dentro de `ExecSql` / `.SQL` / `SQL_DefinirComando`: ligue `lsp.format.embeddedSql.enabled` (opt-in)

---

### Outline e navegação

- **Outline** na barra lateral: funções e símbolos do arquivo
- **Go to Definition** (F12) em funções do projeto
- Escopo cross-file: ver seção [Contextos e escopo](#contextos-e-escopo-de-símbolos)

---

### Catálogo de banco (tabelas e campos)

Sem catálogo local, a extensão funciona normalmente — só não sugere tabelas/campos do dicionário Senior.

Com catálogo JSON na máquina:

1. Gere ou aponte o arquivo (ver [docs do repositório](https://github.com/brunoleocam/lsp-workbench/tree/main/docs/banco-senior-base)).
2. Configure `lsp.catalog.path` **ou** deixe o default:
   - `docs/banco-senior/.generated/catalog.json`
   - ou `docs/banco-senior-base/.generated/catalog.json`
3. Use completion de tabelas e `Tabela.Campo` (útil também em projetos de relatório).

![Autocomplete de catálogo](media/06-catalog-autocomplete.png)

O dicionário da sua empresa **não** vem no pacote do Marketplace (privacidade / tamanho). Cada ambiente gera o catálogo localmente.

---

### Contextos e escopo de símbolos

Útil quando o workspace tem vários conjuntos de regras LSP.

| Setting / comando | Uso |
|-------------------|-----|
| `lsp.symbols.scope` | `project` (workspace), `file` (só arquivo atual) ou `mixed` |
| `lsp.contexts` | Contextos nomeados (pasta, padrão de arquivos, sistema HCM/ACESSO/ERP) |
| **LSP Workbench: Criar/Editar/Apagar Contexto** | Assistente via Command Palette |
| **Alternar Escopo de Símbolos** | Troca rápida do escopo |
| Status bar | Mostra escopo / sistema atual |

---

### Projeto de relatório

Comandos (Command Palette → “LSP Workbench”):

- **Gerar Projeto de Relatório** — scaffold
- **Copiar Regra do Relatório** / **Visualizar Todas as Regras**
- **Importar / Exportar Contexto**
- **Mostrar Escopo do Relatório**

Há diagnósticos específicos (`GER*`) para pré-seleção e seções.

---

### Refactors

Code Actions / refactors: envolver seleção em `Se`/`Enquanto`/`Para`/bloco, converter `Inicio`/`Fim` → `{ }`, `\` → `+`, entre outros. Estilo padrão de bloco: `lsp.refactor.defaultBlockStyle`.

---

## Configuração (settings)

Abra **Settings** e busque `LSP Workbench`, ou edite o `settings.json`:

| Setting | Default | Descrição |
|---------|---------|-----------|
| `lsp.format.enabled` | `true` | Formatação de documentos |
| `lsp.format.indentSize` | `2` | Indentação (2 ou 4) |
| `lsp.format.braceStyle` | `sameLine` | `{` na mesma linha ou na seguinte |
| `lsp.format.embeddedSql.enabled` | `false` | Formatar SQL embutido |
| `lsp.format.embeddedSql.dialect` | `sql` | `sql` / `oracle` / `sqlserver` |
| `lsp.diagnostics.ignoreIds` | `[]` | IDs de diagnóstico a ignorar |
| `lsp.symbols.scope` | `project` | Escopo de símbolos / completion |
| `lsp.contexts` | `[]` | Contextos nomeados |
| `lsp.fallback.defaultSystem` | `""` | Sistema na status bar (HCM / ACESSO / ERP) |
| `lsp.catalog.path` | `""` | Path do catálogo JSON de tabelas |
| `lsp.server.enabled` | `false` | Language Server externo (experimental; ver abaixo) |

Exemplo mínimo:

```json
{
  "[senior-lsp]": {
    "editor.formatOnSave": true
  },
  "lsp.format.indentSize": 2,
  "lsp.catalog.path": "C:/caminho/para/catalog.json"
}
```

### Language Server (opcional / avançado)

Por padrão (`lsp.server.enabled` = `false`) os diagnósticos rodam **in-process** (estável).

Se você compilar o analyzer/server a partir do [repositório](https://github.com/brunoleocam/lsp-workbench) e ligar `lsp.server.enabled`, os diagnósticos do analyzer aparecem com source **LSP Analyzer**. Format e completion rich continuam na extensão. Após alterar a setting: **Developer: Reload Window**.

---

## Atalhos úteis

| Ação | Atalho típico (Windows) |
|------|-------------------------|
| Completar | Ctrl+Espaço |
| Quick Fix | Ctrl+. |
| Format Document | Shift+Alt+F |
| Go to Definition | F12 |
| Hover | Mouse over / Ctrl+K Ctrl+I |
| Problems | Ctrl+Shift+M |
| Command Palette | Ctrl+Shift+P → `LSP Workbench:` |

---

## Requisitos

- VS Code **1.85+** (ou Cursor compatível)
- Arquivos `.lsp` / `.lspt`

---

## Problemas comuns

| Sintoma | O que verificar |
|---------|-----------------|
| Sem cores / sem completion | Linguagem do editor = **Linguagem Senior** (não Plain Text) |
| Sem sugestão de tabelas | Catálogo local ausente ou `lsp.catalog.path` incorreto |
| Formatação não roda | `lsp.format.enabled` = true; Format Document no comando |
| Muitos avisos indesejados | `lsp.diagnostics.ignoreIds` ou ignore por contexto |

Issues: [github.com/brunoleocam/lsp-workbench/issues](https://github.com/brunoleocam/lsp-workbench/issues)

---

## Licença e créditos

MIT — ver [LICENSE](LICENSE). Créditos de terceiros: [CREDITS.md](CREDITS.md).

Código-fonte e documentação de produto (para mantenedores): [github.com/brunoleocam/lsp-workbench](https://github.com/brunoleocam/lsp-workbench).
