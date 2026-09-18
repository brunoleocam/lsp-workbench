---
name: lsp-revisar
description: Checklist rápido pré-compilação LSP. Use após implementar ou antes de compilar; para relatório completo use lsp-validar.
---

# lsp-revisar

Checklist curto antes de compilar ou após implementação. Para relatório com IDs e semântica profunda: **`@lsp-validar`**. Para gerar do zero: **`@lsp-gerar`**.

## Checklist

- [ ] **Condições compostas:** `Se`/`Enquanto` com `e`/`ou` → cada condição entre parênteses
- [ ] **Parâmetros:** só `Numero`
- [ ] **Retorno:** por parâmetro (`TamanhoAlfa(va, vn);`)
- [ ] **Nulos:** `EstaNulo(va, vn);` depois `Se (vn = 0)`
- [ ] **FormatarData:** via `DataHora` + Numero
- [ ] **Conversões / Grid / ponto:** variável intermediária
- [ ] **Concatenação:** só Alfa + Alfa; nada dentro de argumentos
- [ ] **Blocos:** `{ }` (sem `Inicio`/`Fim;`)
- [ ] **Interrupção:** `Cancel(1);` nunca `Retorna`
- [ ] **CopiarAlfa:** cópia se precisar preservar original
- [ ] **SQL longo:** `\` ~coluna 80
- [ ] **Terminador:** `;` em todo comando
- [ ] **Cursor/arquivo:** Abrir/Fechar pareados nos caminhos de erro
- [ ] **ExecSQLEx:** `0` = sucesso

Se o trecho usa tabelas de um ERP concreto, validar nomes contra o dicionário do cliente no workspace (se houver) — não inventar.
