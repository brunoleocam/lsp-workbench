# IDs estáticos LSP (resumo no plugin)

Cópia operacional para instalação Marketplace. No monorepo, a fonte canônica completa é `docs/product/regras-estaticas-lsp.md`.

Compatível com extensão **LSP Workbench ≥ 0.2.4**.

## SYN

| ID | Regra |
|----|-------|
| SYN001 | Stmt termina com `;` (exceto cabeçalhos / string multilinha com `\`) |
| SYN002 | `Se`/`Enquanto`/`Para` com condição entre `()` |
| SYN003 | Com `e`/`ou`, cada parte entre `()` |
| SYN004 | Blocos `{ }` — sem `Inicio`/`Fim;` |
| SYN005 | `Definir` no início (não no meio do fluxo) |
| SYN006 | Prefixo alinhado ao tipo (`va`/`vn`/`vd`/`vl`/`Cur_`) |
| SYN007 | `/*` fechado com `*/` |
| SYN008 | `{`/`}` balanceados |
| SYN009 | Literal longo: `\` ~coluna 80 |
| SYN010 | Identificador/tipo solto inválido |
| SYN011 | `@` comentário só na mesma linha (multi-linha → `/* */`) |
| SYN012 | String `"` fechada ou continuada com `\` no fim da linha |

## RUL (ouro)

| ID | Regra |
|----|-------|
| RUL001 | Params de função: só `Numero` tipado |
| RUL002 | Retorno por parâmetro (`TamanhoAlfa(va, vn);`) |
| RUL003 | `EstaNulo` em stmt separado, depois `Se` |
| RUL004 | `FormatarData` só com `Numero` (`DataHora` antes) |
| RUL005 | `Grid.Campo` / ponto → variável intermediária |
| RUL006 | Não concatenar dentro de argumento de função |
| RUL007 | Sem `Retorna`/`Retorne` → `Cancel(1);` |
| RUL008 | Prefixo alinhado ao tipo |
| RUL009 | `ExecSQLEx`: `0`=ok, `1`=erro |
| RUL010 | `Mensagem` sem JSON bruto grande |
| RUL011 | Sem `%` → `RestoDivisao` |

## ANL (analyzer)

| ID | Equivalente |
|----|-------------|
| ANL001/002 | braces |
| ANL004 | SYN004 |
| ANL010 | RUL007 |
| ANL011 | SYN003 |
| ANL012 | SYN002 |

## DEM / GER

- **DEM001** — coluna/tabela inexistente no catálogo local (`lsp.catalog.path`).
- **GER001–GER004** — projeto com `relatorio.json` (ver PDR-008 / skill `@lsp-compilar`).

## Analyzer CLI (só monorepo)

```powershell
node scripts/analyze-lsp.mjs <arquivo-ou-pasta>
```

Sem clone do monorepo: use Problems da extensão IDE + checklists deste plugin.
