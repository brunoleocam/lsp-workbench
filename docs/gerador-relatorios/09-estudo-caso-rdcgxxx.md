# 09 — Estudo de caso: export multi-trecho (RDCGXXX)

Estudo **anonimizado** de um export real de regras (`RDCGXXX.lsp` / modelo `RDCGXXX.GER`).  
Categoria `RDCG` = Mercado › Distribuição › Cargas ([11-siglas-senior.md](11-siglas-senior.md)).  
Artefatos de cliente **não** fazem parte do repositório público; use cópias locais se for reproduzir a análise.

Objetivo: mostrar a **taxonomia de eventos** e o papel de cada bloco, não o negócio do relatório.

## Artefatos

| Arquivo | Papel |
|---------|--------|
| `*.GER` | Modelo compilado (~100 KB+, binário; título legível no header; sem LSP em claro) |
| `*.lsp` | ~140 slots `Código: N - Descrição: …` (muitos `_Na Impressão` vazios) |

## Mapa dos eventos do modelo

| Código (aprox.) | Descrição no export | Conteúdo típico |
|-----------------|---------------------|-----------------|
| 1 | `ModeloGerador_Funções Globais` | `Definir Lista` / estrutura reutilizável |
| 2 | `ModeloGerador_Inicialização` | Flags, contadores, redefinição da lista |
| 3 | `ModeloGerador_Pré-Seleção` | Logo (`CarregaImagemControle`), montagem de `aSQL`, `InsClauSQLWhere("Detalhe_…")` |
| 4–6 | Seleção / Finalização / Imprimir Página | Frequentemente vazios neste modelo |
| 7–8 | `Cabecalho_* Imprimir` | Vazios ou mínimos |
| 13–14 | `Rodape_Cabecalho_*` | — |
| 18–19 | `Total_Geral_*` | Totais / percentuais em lista |
| 37–38 | `Detalhe_Transportadora_*` | Zebrado (`AlteraControle` Cor), lógica por linha |
| 57–58 | `Subtotal_Carga_*` | Agregação da quebra |
| 64–65 / 68–69 | `Subtitulo_CodTra_*` / `Subtitulo_NumAne_*` | Quebras de classificação |
| 72+ | Vários `Adicional_*_* Imprimir` | Blocos listados sob demanda / layout auxiliar |

## Seções inferidas pelos nomes

| Seção | Evidência no export |
|-------|---------------------|
| `Detalhe_Transportadora` | Antes/Depois + alvo de `InsClauSQLWhere` |
| `Subtitulo_CodTra`, `Subtitulo_NumAne` | Pares Antes/Depois |
| `Subtotal_Carga` | Pares Antes/Depois |
| `Total_Geral` | Pares Antes/Depois |
| `Cabecalho`, `Rodape_Cabecalho` | Pares Antes/Depois |
| `Adicional_Titulo`, `Adicional_Motivo`, `Adicional_Transp`, `Adicional_Titulo_Transp`, `Adicional_Subtotal_Transp`, `Adicional_Pallets`, `Adicional_Empresa`, … | Vários adicionais nomeados |

## Controles (amostra de `_Na Impressão`)

Prefixos no export:

- `Cadastro###` — campos de tabela
- `Descricao###` / `D…` — textos e descrições
- `F…` — fórmulas (`FPorGrl`, `FTotAne`, …)
- `T…` — totalizadores
- `Sistema###` — controles de sistema
- `Desenho###`, `Logo…` — visual

A maioria dos slots de controle está **sem regra** — o valor vem da propriedade do controle no modelo `.GER`.

## Padrões de código observados

1. **Pré-Seleção longa** — filtros a partir de `E*` concatenados em Alfa, depois um `InsClauSQLWhere` na Detalhe.
2. **Inicialização** — estado (zebrado, contadores) usado no Antes de Imprimir da Detalhe/Adicional.
3. **Zebrado** — `AlteraControle("Detalhe_…", "Cor", "#ebebeb"|"#ffffff")` alternando sinal de flag.
4. **Lista em memória** — definida em Funções Globais / Inicialização; preenchida na Detalhe; lida no Total_Geral.
5. **Imagem** — `CarregaImagemControle` na Pré-Seleção (caminho de rede ou SQL).

## O que o export **não** revela

- Tabela Base, Classificação, layout, máscaras, cadastro completo da Entrada.
- Relacionamentos e o SELECT final (só o que a regra acrescenta).

Para isso: abrir o modelo no Gerador (ou inspecionar propriedades / Ctrl+Q).

## Lição para o Workbench

Tratar o `.lsp` multi-trecho como **projeto de N regras** com outline por `Descrição`, não como um único programa linear. Ver [10-implicacoes-workbench.md](10-implicacoes-workbench.md).
