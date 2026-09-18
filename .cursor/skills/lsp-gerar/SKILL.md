---
name: lsp-gerar
description: Fluxo obrigatório para gerar ou alterar .lsp/.lspt alinhado às rules e skills do plugin. Use antes de escrever LSP e antes de encerrar a tarefa.
---

# lsp-gerar

Garante que código novo ou alterado siga as rules (`lsp-nucleo`, `lsp-limites`, `lsp-sintaxe`) e a skill **`lsp-linguagem`**, e só então passe na validação.

## Quando acionar

- Criar regra/função LSP do zero
- Editar qualquer `.lsp` / `.lspt`
- Pedido “no padrão Senior” / “sem erro de compilação”

## Fluxo (ordem)

### 1. Classificar e ler referência

| Tipo | Ler |
|------|-----|
| Sintaxe / limitações | `@lsp-linguagem` → `reference-sintaxe.md` + rule `lsp-limites.mdc` |
| Padrões SQL/cursor/HTTP | `@lsp-linguagem` → `reference-padroes.md` + rule `lsp-banco-http.mdc` |
| Strings / datas / funções | rules `lsp-funcoes-strings-datas.mdc`, `lsp-listas.mdc` |
| Exemplos / snippets | `@lsp-linguagem` → `examples.md`, `snippets.md`, pasta `exemplos/` |

**Regras de ouro:** Alfa+Alfa; parâmetros só `Numero`; retorno por parâmetro; `Cancel(1)`; blocos `{ }`. Ver `lsp-nucleo.mdc`.

### 2. Schema de ERP

Este plugin **não** inclui dicionário de tabelas. Se pedirem colunas/JOINs de um banco concreto, pedir documentação do cliente — **não inventar** schema.

### 3. Gerar ou editar

Respeitar sintaxe e limitações. Preferir `{ }`, nomenclatura `va/vn/vd/vl/Cur_`.

### 4. Antes de encerrar

1. **`@lsp-revisar`** (checklist rápido) e/ou
2. **`@lsp-validar`** (relatório completo)
3. Opcional: **`@lsp-formatar`** se o layout estiver irregular

Corrigir violações críticas (`lsp-validacao-obrigatoria.mdc`).

## Anti-padrões

- `vn = TamanhoAlfa(...)` em vez de `TamanhoAlfa(va, vn);`
- `Se (EstaNulo(...) = 0)` na mesma linha
- `FormatarData` sem `DataHora` / tipo errado
- Concatenar dentro de argumento de função
- `Retorna`; `Inicio`/`Fim;`; `ExecSQLEx` com sucesso/erro invertido
