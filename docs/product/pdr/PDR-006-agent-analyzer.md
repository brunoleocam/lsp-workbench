# PDR-006 — Agent consome o analyzer

| Campo | Valor |
|-------|-------|
| Status | **Concluído** (P0–P3) |
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

| Leva | Entrega | Aceite | Estado |
|------|---------|--------|--------|
| **P0** | CLI `scripts/analyze-lsp.mjs` + `@lsp-validar` / `/validar-lsp` | ANL* no relatório | **Feito** |
| **P1** | `scripts/format-lsp.mjs` + `scripts/refactor-lsp.mjs` + skills/commands | Diff estável | **Feito** |
| **P2** | `reference-membros.md` gerado de `domain/members.ts` | Sem inventar membros | **Feito** |
| **P3** | EVAL-agent com fixtures/CLI | EVAL atualizado | **Feito** |

## Não-objetivos

- Language Server dentro do Agent
- Substituir geradores PDR-002 por analyzer
- Incluir dicionários / regras de cliente no Agent público

## Disciplina

- IDs: `docs/product/regras-estaticas-lsp.md`
- Regenerar membros: `node scripts/generate-members-reference.mjs`
