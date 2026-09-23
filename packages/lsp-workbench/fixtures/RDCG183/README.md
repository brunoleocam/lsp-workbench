# RDCG183 — Grade de Carregamento - Entrada

Projeto de relatório (LSP Workbench / PDR-008).

## Copiar para o Senior

1. Abra o Gerador de Relatórios e o modelo correspondente (ou crie categoria/número).
2. Para cada arquivo `.lsp` abaixo, cole o conteúdo no evento indicado:

| Arquivo | Evento no Senior |
|---------|------------------|
| `Definicao/Funcoes-Globais.lsp` | Modelo → Funções Globais |
| `Definicao/Inicializacao.lsp` | Modelo → Inicialização |
| `Definicao/Pre-Selecao.lsp` | Modelo → Pré-Seleção |
| `Definicao/Selecao.lsp` | Modelo → Seleção |
| `Definicao/Finalizacao.lsp` | Modelo → Finalização |
| `Definicao/Imprimir-Pagina.lsp` | Modelo → Imprimir Página |
| `Secoes/<Nome>/antes-imprimir.lsp` | Seção → Antes de Imprimir |
| `Secoes/<Nome>/depois-imprimir.lsp` | Seção → Depois de Imprimir |

3. Configure **Tabela Base**, Classificação e Entrada no Senior conforme `secao.json` / `Entrada.json` (não são colados automaticamente).

Comandos úteis na extensão: **Copiar Regra do Relatório**, **Visualizar Todas as Regras**, **Importar Relatório**.

## Eventos ignorados no import

`_Na Impressão` não entra no scaffold ADR-007:

- DFundo_Na Impressão
- Tit_Na Impressão
- SNumPag_Na Impressão
- LogoDemobile_Na Impressão
- Sistema001_Na Impressão
- DUsuario_Na Impressão
- Sistema002_Na Impressão
- TAtraso_Na Impressão
- Descricao011_Na Impressão
- Descricao012_Na Impressão
- TCarregamento_Na Impressão
- Desenho003_Na Impressão
- Descricao013_Na Impressão
- FPorGrl_Na Impressão
- Descricao001_Na Impressão
- Descricao028_Na Impressão
- TComp_Na Impressão
- Descricao027_Na Impressão
- Descricao029_Na Impressão
- Descricao031_Na Impressão
- FPorNComp_Na Impressão
- Descricao032_Na Impressão
- FPorAtr_Na Impressão
- Descricao033_Na Impressão
- Cadastro002_Na Impressão
- Cadastro004_Na Impressão
- Cadastro005_Na Impressão
- Cadastro006_Na Impressão
- Cadastro007_Na Impressão
- Cadastro008_Na Impressão
- Cadastro009_Na Impressão
- Cadastro010_Na Impressão
- Cadastro011_Na Impressão
- Cadastro012_Na Impressão
- Cadastro013_Na Impressão
- Cadastro014_Na Impressão
- Cadastro015_Na Impressão
- Cadastro016_Na Impressão
- Cadastro017_Na Impressão
- Descricao009_Na Impressão
- DDesTpo_Na Impressão
- Cadastro001_Na Impressão
- FMarcaAtraso_Na Impressão
- Desenho002_Na Impressão
- FAtraso_Na Impressão
- Descricao010_Na Impressão
- FMarcaNaoComparecimento_Na Impressão
- DNomTra_Na Impressão
- DNomTra_Subtitulo_Na Impressão
- Descricao014_Na Impressão
- Cadastro018_Na Impressão
- Descricao016_Na Impressão
- Descricao017_Na Impressão
- Descricao018_Na Impressão
- Descricao019_Na Impressão
- Descricao020_Na Impressão
- Descricao021_Na Impressão
- Descricao022_Na Impressão
- Descricao002_Na Impressão
- DObs_Na Impressão
- Descricao003_Na Impressão
- DMotivo_Na Impressão
- Descricao004_Na Impressão
- Descricao005_Na Impressão
- Descricao007_Na Impressão
- Descricao008_Na Impressão
- Descricao023_Na Impressão
- Descricao030_Na Impressão
- Descricao015_Na Impressão
- Descricao024_Na Impressão
- DTra_Na Impressão
- FTotAne_Na Impressão
- FTotAtr_Na Impressão
- FPorEfiAtr_Na Impressão
- FCodTra_Na Impressão
- Descricao006_Na Impressão
- FTotComp_Na Impressão
- FPorEfiCpr_Na Impressão
- Descricao025_Na Impressão
- FPorEfiGrl_Na Impressão
- Descricao026_Na Impressão
- vnPalFerEnv_Na Impressão
- Descricao040_Na Impressão
- vnPalMadEnv_Na Impressão
- Descricao039_Na Impressão
- Descricao038_Na Impressão
- Descricao034_Na Impressão
- vnPalMadRec_Na Impressão
- Descricao035_Na Impressão
- vnPalFerRec_Na Impressão
- vnPalFerSaldoTra_Na Impressão
- Descricao036_Na Impressão
- vnPalMadSaldoTra_Na Impressão
- Descricao037_Na Impressão
- Descricao041_Na Impressão
- Descricao042_Na Impressão
- vnPalMadSaldoEmp_Na Impressão
- Descricao043_Na Impressão
- Descricao044_Na Impressão
- vnPalFerSaldoEmp_Na Impressão
