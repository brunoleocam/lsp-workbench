# TDD — Agent skills / geradores

| ID | Caso | Expectativa |
|----|------|-------------|
| AG-LIST-01 | Lista COD:Numero, NOME:Alfa | `AdicionarCampo` para ambos; prefixo `vl` |
| AG-CUR-01 | Cursor completo + SQL longo | `\` ~80; Abrir/Fechar |
| AG-HTTP-01 | URL + json | Sem concat em argumento; `Cancel(1)` em erro |
| AG-GOLD-01 | Qualquer gerador | Sem `Retorna`; sem `Inicio`/`Fim` |

Validação manual ou eval automatizado via asserts em texto gerado (ver EVAL-agent.md).
