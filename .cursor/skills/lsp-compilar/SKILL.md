---
name: lsp-compilar
description: Pré-compilação LSP — valida sintaxe, regras e semântica com IDs canônicos (mesmos da extensão LSP Workbench). Use após gerar/alterar .lsp/.lspt ou ao pedir validar/compilar.
---

# lsp-compilar

Pré-compilação alinhada ao catálogo canônico e à extensão **LSP Workbench** (`analyzeLsp` / Problems).

> Nome antigo: `@lsp-validar` / `/validar-lsp` — use **`@lsp-compilar`** / **`/compilar-lsp`**.

**IDs:** os checklists deste skill e o painel Problems da extensão.  
**Docs de linguagem:** rules `lsp-nucleo`, `lsp-sintaxe`, `lsp-limites` e a skill `@lsp-linguagem`.  
**Compat:** extensão LSP Workbench **≥ 0.2.4**.

## Fluxo

1. Identificar escopo (arquivo / seleção / pasta / projeto de relatório)
2. **Diagnósticos:** painel Problems da extensão (mesmos ANL*). Use `node scripts/analyze-lsp.mjs` só se esse arquivo existir no workspace aberto.
3. Aplicar checklists SYN / RUL / FUN / SEM / SQL abaixo (complementares ao analyzer)
4. Se houver **projeto de relatório** (`relatorio.json` acima): checklist GER*
5. Se houver **`catalog.json`** (ver `@lsp-banco`): checklist DEM001
6. Registrar: conforme | violação (ID, local, correção)
7. Entregar relatório no formato final
8. Se o usuário pedir, **aplicar** as correções e reexecutar o analyzer

## Checklist ANL (analyzer — o mesmo do painel Problems)

| ID | Regra | Correção típica |
|----|-------|-----------------|
| ANL001 | `{` sem `}` | Fechar bloco |
| ANL002 | `}` sem `{` | Remover `}` extra ou abrir bloco |
| ANL004 | `Inicio`/`Fim*` legado | Usar `{ }` (SYN004) |
| ANL010 | `Retorna;` / `Retorne;` | `Cancel(1);` (RUL007) |
| ANL011 | `e`/`ou` mal parentizado | Parentizar partes (SYN003) |
| ANL012 | `Se`/`Enquanto`/`Para` sem `(` | Envolver condição (SYN002) |

## Escopo multiarquivo

- Listar `.lsp` / `.lspt` no escopo (contexto IDE ou pasta)
- Validar cada arquivo; cruzar funções custom (FUN007–FUN009)
- Em relatório: `knownGlobals` de `Entrada.json` (E*) evitam SEM001 falso
- Rotular path em cada diagnóstico

## Checklist SYN

| ID | Regra | Correção típica |
|----|-------|-----------------|
| SYN001 | Stmt sem `;` | Acrescentar `;` |
| SYN002 | `Se`/`Enquanto`/`Para` sem `()` | `Se (cond) {` |
| SYN003 | `e`/`ou` sem partes parentizadas | `Se ((a>0) e (b<10))` |
| SYN004 | `Inicio`/`Fim;`/`FimSe`/`FimEnquanto` | Usar `{ }` |
| SYN005 | `Definir` no meio do fluxo | Mover `Definir` para o início |
| SYN006 | Prefixo ≠ tipo | `Definir Alfa vaX;` / `Numero vnX;` etc. |
| SYN007 | `/*` sem `*/` | Fechar comentário |
| SYN008 | `{`/`}` desbalanceados | Balancear blocos |
| SYN009 | Literal muito longo sem `\` | Quebrar ~col 80 com `\` |
| SYN010 | Identificador/tipo solto | Remover ou `Definir Tipo …` |
| SYN011 | `@` multi-linha (fechamento noutra linha) | Converter para `/* … */` |
| SYN012 | String `"` aberta sem fechar / sem `\` | Fechar `"` ou continuar com `\` |

## Checklist RUL

| ID | Incorreto → Correto |
|----|---------------------|
| RUL001 | `Funcao F(Alfa x)` / `Foo(vaP)` → params só `Numero` tipados / globais |
| RUL002 | `vn = TamanhoAlfa(va)` → `TamanhoAlfa(va, vn);` |
| RUL003 | `Se (EstaNulo(...)=0)` → `EstaNulo(...); Se (vn=0)` |
| RUL004 | `FormatarData(vd…)` → `DataHora(vn); FormatarData(vn,…)` |
| RUL005 | `Obj.Campo` em parâmetro cuja doc não diz Campo/Variável → variável intermediária |
| RUL006 | `"x" + va` dentro de arg → montar Alfa antes |
| RUL007 | `Retorna;` / `Retorne;` → `Cancel(1);` |
| RUL008 | `Definir Alfa vnX` → prefixo alinhado ao tipo |
| RUL009 | `ExecSQLEx=1` como sucesso → `0`=ok, `1`=erro |
| RUL010 | `Mensagem(..., vaJSON)` → resumo Alfa |
| RUL011 | `a % b` → `RestoDivisao` |
| RUL012 | `Chr(13)` → `CaracterParaAlfa(13, vaEnter)` |
| RUL013 | `"\n"` → `CaracterParaAlfa(13, …)` |
| RUL014 | `Break` → `Pare` |
| RUL015 | `vd = 15/08/1990` → `MontaData` / `CodData` |
| RUL016 | nome reservado / acento / >100 chars → renomear |
| RUL017 | `Pare;` fora de loop → remover ou envolver em loop |
| RUL018 | `ExecSQL(` Alfa sem SQL → preferir `ExecSQLEx` / SQL atribuído |
| RUL019 | `Cancel` só com `1`, `2` ou `3` |

## Checklist FUN

| ID | Regra |
|----|-------|
| FUN001 | `Truncar(a,b)` → assinatura correta / TruncarDecimal |
| FUN002 | máscara `DD/MM/YYYY` → `"dd/mm/yyyy"` |
| FUN003 | `EstaNulo(vd…)` → Alfa + retorno |
| FUN004 | `SQL_Retornar*(…, pX)` → destino local `vn*` |
| FUN005 | `Arredondar(...)` → `Arredonda` / variantes |
| FUN006 | `Arredonda(valor)` sem decimais → 2º param |
| FUN007 | `Definir Funcao` sem implementação |
| FUN008 | `Funcao … { }` sem `Definir Funcao` |
| FUN009 | chamada só definida em outro arquivo do escopo |

## Checklist SEM (heurística)

| ID | Verificar |
|----|-----------|
| SEM001 | usados sem `Definir` (exceto `vn*` implícito; E* de Entrada em relatório) |
| SEM002 | `Abrir`/`Fechar` de arquivo pareados |
| SEM003 | `.AbrirCursor` sem `.FecharCursor` (contagem). Fechar a mais quebra a compilação e o analyzer não alerta |
| SEM004 | `lista.Campo` sem `AdicionarCampo` prévio |

Fechar a mais: `FecharCursor` / `SQL_FecharCursor` sem abrir, ou fechar dentro de um `Se` e de novo depois do `Se` sem `Numero` de controle. Conferir o caminho na revisão; SEM003/SQL003 não pegam esse caso.

## Checklist SQL

| ID | Verificar |
|----|-----------|
| SQL001 | SQL com `+` de variáveis → preferir `:bind` |
| SQL002 | `SQL_Criar` ↔ `SQL_Destruir` |
| SQL003 | `SQL_AbrirCursor` sem `SQL_FecharCursor` (contagem). Fechar a mais: mesmo guardrail do SEM003 |
| SQL004 | `SQL_Criar(x)` — `x` é `Definir Alfa` |
| SQL005 | `SQL_AbrirCursor` após `SQL_DefinirComando` |
| SQL006 | `SQL_Usar*` antes de DefinirComando |
| SQL007 | DefinirComando após Criar |
| SQL008 | JOIN/subquery → nativo (`UsarAbrangencia`/`UsarSQLSenior2`) |
| SQL009 | não misturar API simples × completa |
| SQL010 | função nativa (`TO_DATE`/`NVL`/…) → dialeto Senior 2 |
| SQL011 | agregação no SELECT sob Senior 2 → nativo ou mover |

## Checklist DEM (se catálogo local existir)

| ID | Verificar |
|----|-----------|
| DEM001 | E*/R*/USU_* citados existem no catálogo (`lsp.catalog.path` / PDR-009) |

Sem catálogo → não inventar DEM001.

## Checklist GER (se projeto de relatório)

| ID | Verificar |
|----|-----------|
| GER001 | `InsClauSQL*` / `SubstituiFrom` / etc. só em Pré-Seleção |
| GER002 | sem `ListaSecao`/`AlteraControle` na Pré-Seleção |
| GER003 | `ListaSecao("Nome")` — seção existe |
| GER004 | 1º arg InsClau* — detalhe conhecido |

Preferir a extensão (Problems) quando o workspace estiver aberto com LSP Workbench.

## Severidade

- **erro** — impede compilação típica / regra de ouro
- **aviso** — heurística semântica ou estilo
- **info** — melhoria opcional

## Formato do relatório

```markdown
# Relatório de pré-compilação LSP – [arquivo ou contexto]

## Resumo
- Arquivos: N
- Erros: E | Avisos: A | Infos: I

## Diagnósticos
| ID | Sev | Arquivo:Linha | Mensagem | Correção sugerida |
|----|-----|---------------|----------|-------------------|
| RUL007 | erro | regra.lsp:42 | Uso de Retorna | Substituir por Cancel(1); |

## Correções rápidas propostas
1. [ID] descrição — aplicar? (sim se o usuário pediu correção)

## Conclusão
[Conforme / N diagnósticos a tratar]
```

## Paridade com a extensão

| Extensão (Problems / QF) | Agent |
|--------------------------|--------|
| SYN/RUL/FUN/SEM/SQL/ANL | este skill + Problems |
| DEM001 | só com catálogo local de tabelas |
| GER* | só em projeto `relatorio.json` |
| Builtins HCM/ERP (0.2.4+) | completion filtrado por `system` no contexto |
| Scaffold relatório | `/gerar-relatorio` + comando IDE |

## Referências

- IDs: checklists deste skill e Problems da extensão
- `@lsp-linguagem` / `@lsp-revisar` / `/gerar-relatorio`
