---
name: lsp-validar
description: Valida sintaxe, regras e semântica LSP com IDs canônicos (docs/product/regras-estaticas-lsp.md). Use após gerar/alterar .lsp/.lspt ou ao pedir validação.
---

# lsp-validar

Validação alinhada ao catálogo canônico e à extensão **LSP Workbench** (`analyzeLsp`).

**Fonte de verdade dos IDs:** [`docs/product/regras-estaticas-lsp.md`](../../../docs/product/regras-estaticas-lsp.md)  
**Docs de linguagem:** `docs/lsp/` + rules `lsp-nucleo`, `lsp-sintaxe`, `lsp-limites`.

## Fluxo

1. Identificar escopo (arquivo/seleção/pasta)
2. **Rodar o analyzer** (mesmos ANL* da IDE), na raiz do monorepo:
   ```powershell
   cd packages\lsp-analyzer; npm run compile
   node ..\..\scripts\analyze-lsp.mjs <arquivo-ou-pasta>
   ```
   Incluir toda linha `file:line: [ANL…]` no relatório.
3. Aplicar checklists SYN / RUL / FUN / SEM / SQL abaixo (complementares ao analyzer)
4. Registrar: conforme | violação (ID, local, correção)
5. Entregar relatório no formato final
6. Se o usuário pedir, **aplicar** as correções e reexecutar o analyzer

## Checklist ANL (analyzer — obrigatório via CLI)

| ID | Regra | Correção típica |
|----|-------|-----------------|
| ANL001 | `{` sem `}` | Fechar bloco |
| ANL002 | `}` sem `{` | Remover `}` extra ou abrir bloco |
| ANL010 | `Retorna;` / `Retorne;` | `Cancel(1);` (equiv. RUL007) |
| ANL011 | `e`/`ou` mal parentizado | Parentizar partes (equiv. SYN003) |

Fonte: `@lsp-workbench/analyzer` / `docs/product/regras-estaticas-lsp.md`

## Escopo multiarquivo

- Listar `.lsp` / `.lspt`
- Validar cada arquivo isoladamente
- Cruzar: funções customizadas chamadas vs definidas; `Definir` duplicados
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

## Checklist RUL

| ID | Incorreto → Correto |
|----|---------------------|
| RUL001 | `Funcao F(Alfa x)` → params só `Numero` / globais |
| RUL002 | `vn = TamanhoAlfa(va)` → `TamanhoAlfa(va, vn);` |
| RUL003 | `Se (EstaNulo(...)=0)` → `EstaNulo(...); Se (vn=0)` |
| RUL004 | `FormatarData(vd…)` → `DataHora(vn); FormatarData(vn,…)` |
| RUL005 | passar `Grid.Campo` em arg → variável intermediária |
| RUL006 | `"x" + va` dentro de arg → montar Alfa antes |
| RUL007 | `Retorna;` / `Retorne;` → `Cancel(1);` (não confundir com `Mensagem(Retorna,…)`) |
| RUL008 | `Definir Alfa vnX` → prefixo alinhado ao tipo |
| RUL009 | tratar `ExecSQLEx=1` como sucesso → `0`=ok, `1`=erro |
| RUL010 | `Mensagem(..., vaJSON)` → resumo Alfa |
| RUL011 | `a % b` → `RestoDivisao` |
| RUL012 | `Chr(13)` → `CaracterParaAlfa(13, vaEnter)` |
| RUL013 | `"\n"` → `CaracterParaAlfa(13, …)` |
| RUL014 | `Break` → `Pare` |
| RUL015 | `vd = 15/08/1990` → `MontaData` / `CodData` |
| RUL016 | nome reservado / acento / >100 chars → renomear |
| RUL017 | `Pare;` fora de loop → remover ou envolver em `Para`/`Enquanto` |
| RUL018 | `ExecSQL(` → preferir `ExecSQLEx(` |

## Checklist FUN

| ID | Regra |
|----|-------|
| FUN001 | `Truncar(a,b)` → `b = Truncar(a);` (assinatura `Truncar(Numero)`). 2º arg numérico → `TruncarDecimal`. Ctrl+Espaço: Truncar / TruncarDecimal / TruncarValor |
| FUN002 | máscara `DD/MM/YYYY` → `"dd/mm/yyyy"` |
| FUN003 | `EstaNulo(vd…)` → `EstaNulo(va…, vnRetorno)` + `Definir Alfa va…` se faltar |
| FUN004 | `SQL_Retornar*(…, pX)` → `SQL_Retornar*(…, vnX)` |
| FUN005 | `Arredondar(...)` inexistente → `Arredonda` / `ArredondaABNT` / `ArredondarValor` / `ArredondarValorEx` / `ArredondaValorTipoAcerto` (Ctrl+Espaço ou QF) |

## Checklist SEM (heurística)

| ID | Verificar |
|----|-----------|
| SEM001 | `va*`/`vn*`/`vd*`/`vl*`/`Cur_*` usados sem `Definir` (quando há Definir no arquivo) |
| SEM002 | `Abrir`/`Fechar` de arquivo pareados |
| SEM003 | `Cur_*.Abrir` / `.Fechar` pareados |
| SEM004 | `lista.Campo` sem `AdicionarCampo("Campo", …)` prévio |

## Checklist SQL

| ID | Verificar |
|----|-----------|
| SQL001 | SQL com `+` de variáveis → preferir `:bind` |
| SQL002 | `SQL_Criar` ↔ `SQL_Destruir` |
| SQL003 | `SQL_AbrirCursor` ↔ `SQL_FecharCursor` |

## Severidade

- **erro** — regra de ouro / impede compilação típica
- **aviso** — heurística semântica ou estilo
- **info** — melhoria opcional

## Formato do relatório

```markdown
# Relatório de Validação LSP – [arquivo ou contexto]

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

## Referências

- Catálogo: `docs/product/regras-estaticas-lsp.md`
- Extensão: `packages/lsp-workbench/src/diagnostics.ts`
- `@lsp-linguagem` / `@lsp-revisar` quando existirem no harness
