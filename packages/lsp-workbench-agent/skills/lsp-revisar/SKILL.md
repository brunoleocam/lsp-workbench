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
- [ ] **Comentário `@`:** abre e fecha na mesma linha (`@ texto @`); multi-linha → `/* */` (SYN011)
- [ ] **Nomes:** descritivos por extenso, exceto campo de banco ou variável de sistema (`vnCodEmp`, `vnCodFil`)
- [ ] **String `"`:** fechada ou com `\` no fim (SYN012)
- [ ] **Terminador:** `;` em todo comando
- [ ] **Cursor:** cada caminho abre uma vez e fecha uma vez. Sem `FecharCursor`/`SQL_FecharCursor` órfão; sem fechar no `Se` e de novo depois, salvo com `Numero` de controle que impede o fechar de fora (SEM003/SQL003 não pegam fechar a mais)
- [ ] **Arquivo:** `Abrir`/`Fechar` pareados
- [ ] **ExecSQLEx:** `0` = sucesso
- [ ] **WebService:** `Definir caminho.pontuado wsNome;` (não inventar tipo)
- [ ] **Relatório:** se em projeto `relatorio.json`, lembrar GER* → preferir `/compilar-lsp`
- [ ] **Tabelas:** se citou E*/R*/USU_*, usar `@lsp-banco` (não inventar)

Saída: lista de itens OK / falha. Se houver >3 falhas críticas, sugerir **`/compilar-lsp`**.
