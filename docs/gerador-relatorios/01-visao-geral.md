# 01 — Visão geral

## O que é

O **Gerador de Relatórios** é a ferramenta Senior para criar e adaptar modelos de relatório (gráfico, texto ou arquivo texto). Em todos os sistemas o funcionamento é semelhante; a **categoria** define onde o modelo aparece no menu e a lógica de confecção.

É necessário ter **permissão para customizações** para acessar o gerador.

Documentação oficial: [Gerador de Relatórios](https://documentacao.senior.com.br/tecnologia/5.10.3/geradores/relatorios/definit.htm) · [Abrir/Criar modelo](https://documentacao.senior.com.br/tecnologia/5.10.3/geradores/relatorios/fgropensave.htm) · [Modelo Gerador](https://documentacao.senior.com.br/tecnologia/5.10.3/geradores/relatorios/suseredt.htm)

## Tipos de modelo

Ao criar (Modelo → Novo):

| Tipo | Uso típico |
|------|------------|
| Relatório gráfico | Layout visual (pixels), controles ricos |
| Relatório texto | Saída em caracteres |
| Arquivo texto | Exportação textual parametrizada |

## Identificação do modelo

Na criação/abertura:

| Campo | Significado |
|-------|-------------|
| **Categoria** | Organiza o relatório no menu do sistema (ex.: `PS`, `RE`, `CG`) |
| **Número** | Código único dentro da categoria |
| **Descrição** | Texto descritivo do modelo |

Convenção comum de nome de arquivo: `XXYYNNN.GER` (categoria + número), ex. `RDCG183.GER` (`RDCG` = Distribuição › Cargas). Árvore completa de siglas: [11-siglas-senior.md](11-siglas-senior.md).

## Passos mínimos para um relatório válido

1. Criar o modelo (tipo + categoria + número).
2. Inserir **pelo menos uma seção Detalhe**.
3. Informar **Tabela Base** na Detalhe (tabela sobre a qual o SQL será montado).
4. Incluir campos de cadastro (e demais controles) nas seções.
5. Se houver mais de uma Detalhe: Tipo de Relatório = **Mestre Detalhe**; definir tabela mestre e ligações.
6. Configurar **Classificação** na Detalhe para subtítulos/subtotais serem impressos.
7. Seções não-detalhe com campos de cadastro: **Seção Lig. SQL** apontando para a Detalhe correspondente.

## Limites e cuidados operacionais

| Tema | Detalhe |
|------|---------|
| **DPI / escala Windows** | Deve estar em **100%** ao editar modelos; escala diferente reposiciona controles e pode cortar/sobrepor campos. |
| **Tamanho da saída** | Relatórios > ~2 GB (limite de integer / arquivo temporário) abortam com mensagem de última página suportada. Mitigação: reduzir abrangência ou gerar vários relatórios menores. |
| **Abrangências de usuário** | Em alguns módulos (ex. Ponto via `custom.Link`), abrangências do perfil só valem se o usuário pertencer a **um único perfil**. |

## Propriedades importantes do Modelo Gerador

Resumo das propriedades do corpo do modelo (seção implícita **Modelo_Gerador**). Detalhe oficial: [Propriedades e Eventos](https://documentacao.senior.com.br/tecnologia/5.10.3/geradores/relatorios/secoes/modelo-gerador.htm).

| Propriedade | Papel |
|-------------|--------|
| Comprimento / Altura / Margem | Dimensões (pixel no gráfico; caractere nos demais) |
| Orientação | Retrato / Paisagem |
| Tipo de Relatório | Padrão (uma Detalhe) / Mestre Detalhe |
| Entrada | Cadastro de variáveis da tela de entrada (`E*`) |
| Preparar Valores | Executa o modelo duas vezes (totalizações prévias) |
| Agrupar SQL | Um SQL único em mestre-detalhe (performance) |
| Relatório em Branco | Em vez de “Não Houve Registros a Listar” |
| Subtítulos nas Páginas | Repete subtítulo em cada página do grupo |
| Consistir Modelo | `Falso` = salva incompleto sem validar/compilar regras |
| Usar valores na forma literal | `Verdadeiro` quando há muitas condições de filtro no SQL |
| Formato de Saída / Parâmetros Exportação / WEB | Saída e exportação |

## Relação com LSP

As **regras** do modelo são código LSP nos eventos (Inicialização, Pré-Seleção, Antes/Depois de Imprimir, etc.). O runtime do gerador chama essas regras; funções específicas (`InsClauSQLWhere`, `ListaSecao`, `AlteraControle`, …) só fazem sentido neste contexto.

Próximo: [02-modelo-e-artefatos.md](02-modelo-e-artefatos.md)
