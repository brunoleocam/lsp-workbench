---
name: lsp-revisar
description: Checklist rápido (~30s) pré-compilação LSP. Use após implementar; para relatório com IDs e analyzer use @lsp-compilar.
---

# lsp-revisar

Checklist **curto** depois de implementar. Não substitui o relatório completo.

| Quando | Skill / command |
|--------|-----------------|
| Checklist rápido (~30s) | **`@lsp-revisar`** (este) |
| Relatório com IDs + `analyze-lsp.mjs` | **`@lsp-compilar`** / **`/compilar-lsp`** |
| Gerar do zero | **`@lsp-gerar`** |

## Checklist

- [ ] **Condições compostas:** `Se`/`Enquanto` com `e`/`ou` → cada parte entre `()`
- [ ] **Parâmetros:** só `Numero` tipado na assinatura
- [ ] **Retorno:** por parâmetro (`TamanhoAlfa(va, vn);`)
- [ ] **Nulos:** `EstaNulo(va, vn);` depois `Se (vn = 0)`
- [ ] **FormatarData:** via `DataHora` + Numero
- [ ] **Conversões / Grid / ponto:** variável intermediária
- [ ] **Concatenação:** só Alfa + Alfa; nada dentro de argumentos
- [ ] **Blocos:** `{ }` (sem `Inicio`/`Fim;`)
- [ ] **Interrupção:** `Cancel(1);` nunca `Retorna`
- [ ] **CopiarAlfa:** se precisar preservar original
- [ ] **SQL longo:** `\` ~coluna 80
- [ ] **Terminador:** `;` em todo comando
- [ ] **Cursor/arquivo:** Abrir/Fechar pareados
- [ ] **ExecSQLEx:** `0` = sucesso
- [ ] **Relatório:** se em projeto `relatorio.json`, lembrar GER* → preferir `/compilar-lsp`
- [ ] **Tabelas:** se citou E*/R*/USU_*, usar `@lsp-banco` (não inventar)

Saída: lista de itens OK / falha. Se houver >3 falhas críticas, sugerir **`/compilar-lsp`**.
