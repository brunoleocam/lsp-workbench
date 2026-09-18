# Membros Cursor / Lista (canônico)

Fonte: `packages/lsp-workbench/src/domain/members.ts` (gerado por `scripts/generate-members-reference.mjs`).
**Não inventar** membros fora desta lista.

## Cursor (`Definir Cursor Cur_…`)

| Membro | Tipo | Uso |
|--------|------|-----|
| `.SQL` | property | Atribui o comando SQL do cursor simples. |
| `.AbrirCursor` | method | Abre o cursor e executa o SQL. |
| `.FecharCursor` | method | Fecha o cursor. |
| `.Proximo` | method | Avança para o próximo registro. |
| `.Achou` | property | Indica se há registro atual (loop Enquanto). |
| `.NaoAchou` | property | Indica se não há registro atual. |
| `.UsaAbrangencia` | method | Define abrangência de usuário ao abrir (1 = sim). |

## Lista (`Definir Lista vl…`)

| Membro | Tipo | Uso |
|--------|------|-----|
| `.DefinirCampos` | method | Inicia fase de adição de campos. |
| `.EfetivarCampos` | method | Encerra definição de campos. |
| `.AdicionarCampo` | method | Adiciona campo à lista. |
| `.Adicionar` | method | Adiciona registro no final. |
| `.Inserir` | method | Insere registro na posição atual. |
| `.Editar` | method | Entra em modo edição do registro atual. |
| `.Gravar` | method | Grava alterações do registro virtual. |
| `.Cancelar` | method | Descarta alterações do registro virtual. |
| `.Excluir` | method | Exclui o registro atual. |
| `.Primeiro` | method | Posiciona no primeiro registro. |
| `.Ultimo` | method | Posiciona no último registro. |
| `.Anterior` | method | Registro anterior. |
| `.Proximo` | method | Próximo registro. |
| `.SetarChave` | method | Inicia edição de chave (limpa valores). |
| `.EditarChave` | method | Edita chave mantendo valores. |
| `.VaiParaChave` | method | Procura registro pela chave. |
| `.Limpar` | method | Remove todos os registros. |
| `.Ordenar` | method | Ordena conforme chave ativa. |
| `.IDA` | property | Início de arquivo (antes do primeiro). |
| `.FDA` | property | Fim de arquivo (após o último). |
| `.NumReg` | property | Número do registro atual (base 0). |
| `.QtdRegistros` | property | Quantidade de registros. |

## Campos dinâmicos

Campos de Lista vêm de `AdicionarCampo("NOME", …)` no mesmo arquivo — só sugerir/gerar nomes já adicionados.
