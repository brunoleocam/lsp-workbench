# 07 — SQL e joins

O gerador **monta o SELECT** com base na **Tabela Base** da Detalhe e nos **campos de cadastro** (e ligações) usados nas seções conectadas. O desenvolvedor reforça ou altera esse SQL principalmente na **Pré-Seleção**.

## Como o SQL nasce

1. Detalhe com Tabela Base `T1`.
2. Campos de `T1` → colunas no SELECT / FROM.
3. Campo de outra tabela `T2` em alguma seção com **Seção Lig. SQL** (ou na própria Detalhe) → o gerador tenta **relacionar** chaves (inteligência de dicionário / relacionamentos do modelo).
4. Propriedade **Relacionamento** da Detalhe: ajuste fino dos joins.
5. Pré-Seleção: `InsClauSQLWhere`, `InsClauSQLOrderBy`, `InsClauSQLFrom`, `InsClauSQLField`, `InsClauSQLGroupBy`, `InsClauSQLCampoDireto`, `SubstituiFrom`, `DeleteFieldSQL`, `InsSQLWhereSimples`, `DetPrimConector`, etc.

## Classificação (ORDER / quebras)

Na Detalhe, **Classificação** define:

- Ordem dos registros.
- Campos de **quebra** que disparam Subtítulo / Subtotal.

Sem Classificação ligada, Subtítulo e Subtotal **não imprimem**.

## Funções de alteração de SQL (Pré-Seleção)

| Função | Efeito |
|--------|--------|
| `InsClauSQLWhere` | Acrescenta predicado WHERE (Senior SQL 2) |
| `InsSQLWhereSimples` | WHERE em pré-seleção (variante “simples”) |
| `InsClauSQLOrderBy` | ORDER BY |
| `InsClauSQLGroupBy` | GROUP BY |
| `InsClauSQLFrom` | Inclui tabela no FROM |
| `InsClauSQLField` | Inclui campo de tabela no SELECT |
| `InsClauSQLCampoDireto` | Campo novo no SELECT (agrupamentos etc.) |
| `DeleteFieldSQL` | Remove campo do SELECT da seção |
| `SubstituiFrom` | Substitui cláusula FROM |
| `DetPrimConector` | Define primeiro conector (`AND`/`OR`) antes de `InsClauSQLWhere` |
| `CriaView` | View temporária respeitando abrangências |
| `MontarSQLHistorico*` / `MontarSQLHisCampo*` | Históricos com data (e sequência) |
| `DateToDB` / `ConverteDataBanco` | Data compatível com o dialeto do banco |

Catálogo completo: [`docs/lsp/funcoes-especificas-do-gerador-de-relatorios.md`](../lsp/funcoes-especificas-do-gerador-de-relatorios.md).

### Padrão de concatenação WHERE

```lsp
Definir Alfa aSQL;
aSQL = "";
@ ... montar predicados em aSQL ... @
InsClauSQLWhere("Detalhe_MinhaSecao", aSQL);
```

Nomes de seção no primeiro parâmetro devem bater com o **Nome** da Detalhe no modelo (ex. `"Detalhe_Transportadora"`).

## Senior SQL 2

Várias funções de cláusula usam **sempre** SQL Senior 2, independente da configuração do modelo. Visão geral em [`docs/lsp/sql.md`](../lsp/sql.md).

No gerador: menu Diversos → Usar Senior SQL 2 (quando aplicável).

## Views temporárias e leitura

- `CriaView` — otimização; views somem ao fim do relatório.
- `RetornaCampoAlfaTabela` / `RetornaCampoNumeroTabela` — ler campo da view temporária.

APIs antigas (`RetornaCampoAlfa`, `SelectData`, …) → preferir `SQL_Retornar*` / `SQL_AbrirCursor` (nota na [lista oficial](https://documentacao.senior.com.br/tecnologia/5.10.3/lsp/funcoes/gerador-de-relatorios.htm)).

## Cursores e SQL nas regras

Além do SELECT do gerador, regras usam `Definir Cursor` / `SQL_*` para consultas auxiliares (Seleção, Antes de Imprimir, Funções Globais). Isso **não** substitui a Pré-Seleção para filtrar a Detalhe principal — complementa.

## Agrupar SQL (mestre-detalhe)

Propriedade do modelo **Agrupar SQL**:

- `Verdadeiro` — um SQL unificado (mais rápido em muitos casos).
- `Falso` — SQL por seção Detalhe.

## Checklist rápido

- [ ] Tabela Base definida
- [ ] Campos externos com Lig. SQL / relacionamento revisado (Ctrl+Q no gerador para ver SQL)
- [ ] Filtros de Entrada aplicados na Pré-Seleção
- [ ] Classificação alinhada a Subtítulo/Subtotal
- [ ] Sem concatenação inválida Alfa+Numero (regras LSP do Workbench)

Próximo: [08-funcoes-especificas.md](08-funcoes-especificas.md)
