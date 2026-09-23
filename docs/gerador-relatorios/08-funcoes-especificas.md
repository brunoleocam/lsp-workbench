# 08 — Funções específicas (índice)

Catálogo detalhado (sintaxe e exemplos): [`docs/lsp/funcoes-especificas-do-gerador-de-relatorios.md`](../lsp/funcoes-especificas-do-gerador-de-relatorios.md).  
Lista oficial Senior: [Funções Específicas Gerador de Relatórios](https://documentacao.senior.com.br/tecnologia/5.10.3/lsp/funcoes/gerador-de-relatorios.htm).

Este capítulo só organiza **quando usar cada família**.

## Por família

### SQL do gerador (Pré-Seleção)

`InsClauSQLWhere`, `InsSQLWhereSimples`, `InsClauSQLOrderBy`, `InsClauSQLGroupBy`, `InsClauSQLFrom`, `InsClauSQLField`, `InsClauSQLCampoDireto`, `DeleteFieldSQL`, `SubstituiFrom`, `DetPrimConector`, `CriaView`, `MontarSQLHistorico*`, `MontarSQLHisCampo*`, `DateToDB`

### Controles / layout em regra

`AlteraControle`, `AlteraValorFormula`, `InsEspAlinhDireita`, `TruncaDadosGrade`

### Grade

`AdicionaDadosGrade`, `LimpaDadosGrade`, `TruncaDadosGrade`

### Imagem / gráfico

`CarregaImagemControle`, `CarregaImgControle`, `CarregaImgVetorialControle`, `ConfiguraPontoGrafico`, `LimpaDadosGrafico`

### Fluxo de seções / páginas

`ListaSecao`, `SaltarPagina`, `PreenchePagina`, `ProximaPagina`, `UltimoRegistro`, `CancelarRelatorio`

### Views temporárias

`RetornaCampoAlfaTabela`, `RetornaCampoNumeroTabela`

### Diversos

`DesCamLista`, `DataInicialFinal`, `CodigoEspNivel`, `OrdenacaoSelecionada`, `SelecionaImpressora`

## APIs obsoletas → preferidas

| Evitar | Preferir |
|--------|----------|
| `SetaValorFormula` | `AlteraValorFormula` |
| `RetornaCampoAlfa` | `SQL_RetornarAlfa` |
| `RetornaCampoNumero` | `SQL_RetornarInteiro` / `SQL_RetornarFlutuante` |
| `SelectData` / `SelectMaskedData` | `SQL_AbrirCursor` e relacionadas |

## Variáveis especiais de runtime

| Variável | Uso |
|----------|-----|
| `vBandeja` | Bandeja após evento Imprimir Página |
| `vNomeRelatorio` | Nome do arquivo gerado (Inicialização) |
| `ValStr` / `ValRet` | Com `Cancel(2)` em descrições / retornos de fórmula |

`ExecutaRelatorio("MODELO.GER", …)` dispara o modelo compilado a partir de outra regra (ver final do catálogo LSP).

## Relação com regras gerais LSP

Funções específicas **não dispensam** as regras de ouro do Workbench (`lsp-nucleo`): parâmetros só `Numero` em `Funcao` definidas pelo usuário, concatenação só Alfa+Alfa, `Cancel(1)` para abortar fluxo de regra genérica, etc.

Próximo: [09-estudo-caso-rdcgxxx.md](09-estudo-caso-rdcgxxx.md)
