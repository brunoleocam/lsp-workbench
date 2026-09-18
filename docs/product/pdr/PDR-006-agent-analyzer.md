# PDR-006 — Agent consome o analyzer

| Campo | Valor |
|-------|-------|
| Status | Aceito — **P0 em andamento** (CLI + skills; format/eval P1+) |
| Data | 2026-09-18 |
| Artefato | `packages/lsp-workbench-agent` (+ harness `.cursor/`) |
| Pré-requisito | PDR-005 Opção 2 foundation (`@lsp-workbench/analyzer` 0.2.0) |
| Relacionados | ADR-002, ADR-003, PDR-002, `regras-estaticas-lsp.md` |

## Problema

O Agent valida LSP por checklist textual (`@lsp-validar`). A extensão já emite **ANL*** via analyzer. Isso gera divergência: o chat pode “passar” código que o Problems acusa.

## Decisão

O Agent usa o **mesmo** `@lsp-workbench/analyzer` para a parte estrutural (ANL*), e mantém o checklist SYN/RUL/FUN/SEM/SQL como camada complementar até a migração AST.

Fronteira (ADR-002): Agent **não** vira IDE (sem tokens/outline/completion em tempo real).

## Levas

| Leva | Entrega | Aceite |
|------|---------|--------|
| **P0** | CLI/script `analyze-lsp` no monorepo (Node, consome analyzer) + skill `lsp-validar` / command `/validar-lsp` obrigados a rodar e reportar ANL* + IDs canônicos | Fixture com `Retorna;` → ANL010 ou RUL007 no relatório Agent | **Feito** (`scripts/analyze-lsp.mjs`) |
| **P1** | `/formatar-lsp` e trechos mecânicos de `/refatorar-lsp` preferem `format()` / APIs de refactor do núcleo (ou script) antes do LLM | Diff estável em fixture de indentação |
| **P2** | Snippets/referência de membros Cursor/Lista alinhados a `domain/members` (doc gerada ou espelho) | Geração não inventa membro inexistente |
| **P3** | Eval Agent inclui fixtures da extensão (`smoke-sem.lsp`, etc.) | EVAL-agent atualizado |

## Não-objetivos

- Language Server dentro do Agent
- Substituir geradores PDR-002 por analyzer
- Publicar Demóbile no Agent público

## Disciplina

- IDs: mesma fonte `docs/product/regras-estaticas-lsp.md`
- Script versionado em `scripts/` ou `packages/lsp-workbench-agent/bin/`
- README Agent + EVAL atualizados ao fechar P0
