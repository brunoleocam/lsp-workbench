# Variáveis de Sistema

As variáveis de sistema são utilizadas para obter informações do ambiente de execução, como data, hora, usuário, entre outros. Abaixo estão algumas das principais variáveis de sistema disponíveis no Gerador de Relatórios:

| Variável       | Descrição                                                |
|----------------|----------------------------------------------------------|
| AnoSis         | Ano do sistema operacional                               |
| CodEmp         | Código da empresa                                        |
| CodFil         | Código da Filial                                         |
| CodUsu         | Código do usuário                                        |
| DatSis         | Data do sistema operacional                              |
| DBNomeUsuario  | Nome do usuário do banco de dados                        |
| DBTipo         | Banco de dados utilizado (ORACLE/SQLSERVER/POSTGRESQL/OUTRO) |
| DesRodape      | Descrição para rodapé                                    |
| DiaSis         | Dia do sistema operacional                               |
| Empresa        | Nome da empresa                                          |
| ExtSis         | Data por extenso do sistema operacional                  |
| Filial         | Nome da filial                                           |
| GerTabAlf      | Variável alfanumérica com 2000 ocorrências               |
| GerTabNum      | Variável numérica flutuante com 999 ocorrências          |
| HorSis         | Hora do sistema operacional                              |
| MesSis         | Mês do sistema operacional                               |
| NomUsu         | Nome do usuário                                          |
| NumPag         | Número da página                                         |
| QtdDupPag      | Quantidade de duplicatas impressas por página - Utilizado no modelo FRCR002 |

## GerTabAlf e GerTabNum

São registros indexados em memória (`GerTabAlf[n]`, `GerTabNum[n]`). **Não** funcionam como dois arrays independentes com o mesmo índice: a estrutura é única — atribuir `GerTabAlf[2] = "Pedro"` e depois `GerTabAlf[2] = "Matheus"` sobrescreve o valor. Para trabalhar com conjuntos distintos, use **índices diferentes** (ex.: 1–100 para um conjunto, 101–200 para outro).

Para zerar todo o registro:

- [`LimpaGerTabAlf`](funcoes-avancadas-de-data-e-dias-uteis.md#limpagertabalf) — `LimpaGerTabAlf();`
- [`LimpaGerTabNum`](funcoes-avancadas-de-data-e-dias-uteis.md#limpagertabnum) — `LimpaGerTabNum();`

```lsp
GerTabAlf[1] = "xxx";
LimpaGerTabAlf();

GerTabNum[1] = 1;
LimpaGerTabNum();
```
