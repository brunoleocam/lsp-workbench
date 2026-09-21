# 05 — Controles

Controles são os elementos que **mostram ou desenham** informação dentro de uma seção. Cada controle pode ter evento **Na Impressão** (no export: `<Nome>_Na Impressão`).

## Catálogo

| Controle | Função |
|----------|--------|
| **Descrição** | Texto fixo ou descrição de enumeração (`Campo Lista`) |
| **Campo Cadastro** | Conteúdo de campo de tabela (até ~256 caracteres) |
| **Fórmula** | Valor calculado / variável (números, datas, horas, alfas) |
| **Totalizador** | Contagem, soma, etc. sobre o modelo/quebra |
| **Sistema** | Dados internos (usuário, data/hora de execução, nº página…) |
| **Especial** | Níveis hierárquicos (Gestão de Pessoas / Vetorh) |
| **Memorando** | Texto longo com quebra de linha (> ~250 caracteres) |
| **Imagem** | Arquivo ou banco |
| **Código de Barras** | Vários padrões |
| **Desenho** | Formas geométricas |
| **Gráfico** | Série/pontos (com funções específicas) |
| **Cubo** | Visões de cubo |
| **Grade** | Células preenchidas via regra (`AdicionaDadosGrade`, …) |

## Cadastro e enumeração

Padrão comum quando o campo é lista/enumeração:

1. Inserir o campo cadastro (código).
2. Ocultar (`Imprimir = Falso`) e marcar visualmente na edição.
3. Inserir **Descrição** com `Campo Lista` apontando para `Tabela.Campo`.

Convenção de nome: `D` + nome do campo (ex. `DTipPro`).

## Edição (máscaras)

Tipos de edição frequentes (curso):

| Código | Significado |
|--------|-------------|
| `9` | Numérico com zeros à esquerda |
| `Z` / `z` | Numérico sem zeros à esquerda |
| `A` | Alfanumérico |
| `U` / `u` | Maiúsculo |
| `L` | Minúsculo |
| `DD` `MM` `YYYY` / `hh` `mm` | Partes de data/hora |
| `C` | Caractere sem símbolos |

Totalizadores devem ter edição **igual ou maior** que o valor totalizado (senão corta dígitos).

## Fórmula vs Totalizador vs Sistema

| Tipo | Fonte do valor |
|------|----------------|
| Fórmula | Regra / variável / expressão do modelo |
| Totalizador | Agregação automática do gerador |
| Sistema | Variáveis internas do runtime (sem regra obrigatória) |

`AlteraValorFormula` altera fórmula **pelo nome** em regra. Preferir em vez da API obsoleta `SetaValorFormula`.

## Na Impressão

Usos típicos:

- Montar texto dinâmico e sair com `Cancel(2)` + `ValStr` (descrição).
- Suprimir campo com `Cancel(1)` / `Cancel(3)` (totais vs. não totais).
- Ajustes finos por controle (a maior parte dos slots no export fica vazia).

Cálculos pesados e SQL: preferir **Antes de Imprimir** da seção ou Inicialização, não espalhar em dezenas de `_Na Impressão`.

## Imagem

Funções específicas: `CarregaImagemControle`, `CarregaImgControle`, `CarregaImgVetorialControle` (BMP/JPG; DXF para vetorial). Frequentemente na **Pré-Seleção** ou Inicialização (logo da empresa, etc.).

## Grade e gráfico

- Grade: popular em regra (`AdicionaDadosGrade` / `LimpaDadosGrade` / `TruncaDadosGrade`).
- Gráfico: `ConfiguraPontoGrafico`, `LimpaDadosGrafico` (reuso no mesmo relatório).

Ver [08-funcoes-especificas.md](08-funcoes-especificas.md).

Próximo: [06-entrada.md](06-entrada.md)
