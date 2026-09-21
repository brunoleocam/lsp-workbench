# 06 — Entrada (parâmetros do modelo)

A propriedade **Entrada** do Modelo Gerador abre o cadastro de variáveis solicitadas na tela antes da execução. Documentação: [Propriedades do modelo](https://documentacao.senior.com.br/tecnologia/5.10.3/geradores/relatorios/secoes/modelo-gerador.htm) (item Entrada).

## Convenção de nomes

| Prefixo | Uso |
|---------|-----|
| `E` | Toda variável de entrada |
| `EAbr…` | Abrangência / filtro (comum) |
| Exemplos de curso | `ETitulo`, `EMosUsu`, `ELisEnt` |

No código LSP das regras, as variáveis `E*` já existem no contexto do modelo (não precisam de `Definir` se o gerador as injeta — na prática o export mistura `Definir` locais e uso direto de `E*`).

## Campos do cadastro

| Campo | Significado |
|-------|-------------|
| **Nome da Variável** | Identificador (`E…`) |
| **Descrição** | Rótulo na tela |
| **Tipo** | Numérico, cadeia, data, etc. |
| **Tamanho** | Comprimento |
| **Edição** | Máscara (`U`, `9`, …) |
| **Tabela.Campo** | Liga a um campo de cadastro; se preenchido, **Abrangência** costuma ser obrigatória |
| **Abrangência** | Se a variável entra no filtro SQL do gerador |
| **Senha** | Mascarar digitação |
| **Relacionar SQL** | Relaciona a variável ao SELECT |
| **Valores** | Lista de opções (S/N, códigos) |
| **Util. Val** | Usar lista como padrão / valor inicial |
| **Ignorar** | Não considerar em determinado fluxo |

## Tipos de variáveis (visão didática)

1. **Simples** — título, flags S/N, datas de filtro tratadas na Pré-Seleção.
2. **Sistema** — ex. mostrar usuário (`EMosUsu`).
3. **Abrangência** — filtros ligados a `Tabela.Campo` (empresa, filial, cliente…).

## Variáveis “sempre criar” (padrão de curso)

| Variável | Papel | Abrangência tipicamente |
|----------|-------|-------------------------|
| `ETitulo` | Título impresso | Não |
| `EMosUsu` | Mostrar usuário | Não |
| `ELisEnt` | Listar parâmetros na saída | Não |

Flags S/N: tamanho 1, edição `U`, valores `S`/`N`.

## Fluxo com regras

1. Usuário preenche Entrada → OK.
2. **Inicialização** / **Pré-Seleção** leem `E*` e montam SQL (`InsClauSQLWhere`) ou alteram seções (`AlteraControle(..., "Imprimir", "Falso")`).
3. Opcional: seção **Adicional** lista a própria tela de entrada (`ListaSecao`) se `ELisEnt = 'S'`.

## Propriedades do modelo relacionadas

| Propriedade | Efeito |
|-------------|--------|
| **Salvar Entrada** | Reaproveita valores da última execução |
| **Usar valores na forma literal** | Muitas condições de filtro → passar literais no SQL em vez de parâmetros |
| **Tela de Ent. para Serviços** | Modo de execução com serviços |

Próximo: [07-sql-e-joins.md](07-sql-e-joins.md)
