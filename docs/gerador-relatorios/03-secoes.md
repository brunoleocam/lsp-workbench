# 03 — Seções

Lista de seções: [Selecionar seções](https://documentacao.senior.com.br/tecnologia/5.10.3/geradores/relatorios/fsectionform.htm).

A **ordem visual no editor não define a ordem de impressão**. O fluxo depende do tipo da seção, da Classificação da Detalhe e de chamadas explícitas (`ListaSecao`).

## Catálogo

| Seção | Instâncias | Quando imprime | Doc Senior |
|-------|------------|----------------|------------|
| **Modelo_Gerador** | 1 (corpo) | Não é “banda”; concentra props/eventos do modelo | [modelo-gerador](https://documentacao.senior.com.br/tecnologia/5.10.3/geradores/relatorios/secoes/modelo-gerador.htm) |
| **Título** | 1 | Uma vez no início (ou antes do cabeçalho se `Tít. Antes Cabeçalho`) | [titulo](https://documentacao.senior.com.br/tecnologia/5.10.3/geradores/relatorios/secoes/titulo.htm) |
| **Cabecalho** | 1 | Topo de cada página | [cabecalho](https://documentacao.senior.com.br/tecnologia/5.10.3/geradores/relatorios/secoes/cabecalho.htm) |
| **Cabecalho_Colunas** | 1 | Topo de cada coluna (multi-coluna / etiquetas) | [cabecalho-colunas](https://documentacao.senior.com.br/tecnologia/5.10.3/geradores/relatorios/secoes/cabecalho-colunas.htm) |
| **Subtítulo** | N | Por quebra definida na Classificação da Detalhe | [subtitulo](https://documentacao.senior.com.br/tecnologia/5.10.3/geradores/relatorios/secoes/subtitulo.htm) |
| **Detalhe** | N | Uma impressão por registro válido da Tabela Base | [detalhe](https://documentacao.senior.com.br/tecnologia/5.10.3/geradores/relatorios/secoes/detalhe.htm) |
| **Subtotal** | N | Por quebra (Classificação da Detalhe) | [subtotal](https://documentacao.senior.com.br/tecnologia/5.10.3/geradores/relatorios/secoes/subtotal.htm) |
| **Total_Geral** | 1 | Final do modelo | [total-geral](https://documentacao.senior.com.br/tecnologia/5.10.3/geradores/relatorios/secoes/total-geral.htm) |
| **Rodape_Titulo** | 1 | Rodapé da última página (ou final da última, conforme prop. do modelo) | [rodape título](https://documentacao.senior.com.br/tecnologia/5.10.3/geradores/relatorios/secoes/titulo.htm) |
| **Rodape_Cabecalho** | 1 | Rodapé de todas as páginas | [rodape-cabecalho](https://documentacao.senior.com.br/tecnologia/5.10.3/geradores/relatorios/secoes/rodape-cabecalho.htm) |
| **Adicional** | N | **Só** via regra `ListaSecao("Nome")` — não entra no fluxo automático | [adicional](https://documentacao.senior.com.br/tecnologia/5.10.3/geradores/relatorios/secoes/adicional.htm) |
| **Pagina_Fundo** | 1 | Fundo / marca d’água | [pagina-fundo](https://documentacao.senior.com.br/tecnologia/5.10.3/geradores/relatorios/secoes/pagina-fundo.htm) |

Nomes de seção no modelo costumam ser `Tipo_Identificador` (ex.: `Detalhe_Transportadora`, `Subtitulo_CodTra`, `Adicional_Motivo`).

## Propriedades transversais (quase todas as seções)

| Propriedade | Uso |
|-------------|-----|
| Nome | Único no modelo |
| Altura | Altura da banda |
| Imprimir | Liga/desliga impressão |
| Cor / Fonte / Cor da Fonte / Tipo do Caractere | Visual |
| Moldura | Moldura da seção inteira |
| Salto Página | Nova página antes de imprimir (com restrições por tipo) |
| Seção Lig. SQL | Liga campos de cadastro desta seção ao SQL de uma Detalhe |
| Pano de Fundo | Imagem de fundo da seção |
| Exportação / Ins. Antes|Depois HTML | Exportação HTML |
| Ordem Controles | Ordem dos controles na seção |

Eventos comuns: **Antes de Imprimir**, **Depois de Imprimir**.

## Detalhe — propriedades centrais

| Propriedade | Papel |
|-------------|--------|
| **Tabela Base** | Tabela raiz do SELECT da seção |
| **Classificação** | Ordem e quebras; **conecta** Subtítulo/Subtotal à Detalhe |
| **Seleção Detalhe** | SQL adicional na inicialização |
| **Relacionamento** | Ajuste de joins entre tabelas da seção e seções ligadas |
| **Seção Detalhe** | Em subdetalhe: aponta para a Detalhe mestre |
| **Intercalado / Ordem** | Várias Detalhe no mesmo nível |
| **Imprimir Seção Vazia** | Se subdetalhes vazios, omitir a Detalhe atual |
| **Salto Página** | Em Detalhe, só funciona se já houver impresso outra Detalhe/Adicional/Subtítulo antes |

Sem Classificação correta, subtítulos e subtotais **nunca** saem.

## Adicional

Não imprime no fluxo normal. Padrão de uso:

```lsp
ListaSecao("Adicional_Entrada");
```

Útil para blocos condicionais (tela de parâmetros impressa, gráficos sob demanda, cabeçalhos extras).

## Rodape_Cabecalho — cuidado

Dados vindos da Detalhe precisam de regra: ao fechar a impressão do detalhe, o posicionamento vai para o próximo registro. Não contar com “último registro da página” sem tratar.

## Pagina_Fundo + Qtd. Imagens

Se `Qtd. Imagens` do modelo > 1 e há figura em Pano de Fundo da Pagina_Fundo, a figura vale só para o **primeiro** registro/imagem de cada página. Para fundo em todos, usar controles **Imagem** repetidos.

## Mestre / detalhe

- Uma Detalhe → Tipo **Padrão**.
- Várias Detalhe → Tipo **Mestre Detalhe**; uma delas é a tabela mestre; as outras ligam via **Seção Detalhe** / relacionamentos.
- **Agrupar SQL** (modelo): um SELECT unificado vs. um por Detalhe.

Próximo: [04-eventos-ciclo-vida.md](04-eventos-ciclo-vida.md)
