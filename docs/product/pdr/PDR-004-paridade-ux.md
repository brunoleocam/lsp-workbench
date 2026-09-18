# PDR-004 — UX da extensão IDE (Opção 1)

| Campo | Valor |
|-------|-------|
| Status | **Concluído** (extensão 0.2.0) |
| Data | 2026-09-18 |
| Artefato | Extensão `packages/lsp-workbench` |
| Roadmap | [ADR-006](../adr/ADR-006-roadmap-opcoes-1-2-3.md) — Opção 1 de 1→2→3 |
| Relacionados | PDR-001, PDR-003, ADR-003, ADR-005 |

## Problema

A extensão 0.1.x já tinha diagnostics estáticos, símbolos (PDR-003) e format básico. Faltavam recursos de edição ricos: membros Cursor/Lista, semantic tokens, snippets densos, TextMate alinhada ao catálogo SENIOR, Outline, refactors mecânicos, format SQL embutido opt-in e stubs de catálogo multi-sistema — sem abandonar regras de ouro, Agent nem FUN009.

## Decisão

Implementar **UX in-process** (Opção 1), com núcleo puro (ADR-005), antes do analyzer (Opção 2) e do Language Server (Opção 3).

## Levas (todas entregues na 0.2.0)

| Leva | Entrega | Critérios (TDD) | Estado |
|------|---------|-----------------|--------|
| **P0a** | Completion membros Cursor / Lista + campos `AdicionarCampo` | ACC-MEM-* | Feito |
| **P0b** | `DocumentSemanticTokensProvider` básico | ACC-TOK-* | Feito |
| **P1a** | Snippets ~30 (Definir, blocos, SQL API, helpers) estilo `{ }` | ACC-SNP-* | Feito |
| **P1b** | TextMate enriquecida a partir do catálogo próprio | ACC-GRM-* | Feito |
| **P1c** | Catálogos HCM / ACESSO / ERP (merge por `system`) | ACC-SYS-* | Stub + merge SENIOR |
| **P1d** | Format SQL embutido opt-in | ACC-SQLF-* | Feito |
| **P2a** | Outline (`DocumentSymbolProvider`) | ACC-OUT-* | Feito |
| **P2b** | Refactors wrap / toggle braces / `\`→`+` | ACC-REF-* | Feito |

## Disciplina

- README extensão + raiz atualizados ao fechar cada leva.
- CHANGELOG com toda mudança user-facing.
- SOLID / Clean Code; lógica em `domain` / `application` (sem `vscode`).
- TDD: [TDD-paridade-ux.md](../tdd/TDD-paridade-ux.md); eval: [EVAL-paridade-ux.md](../eval/EVAL-paridade-ux.md).

## Não-objetivos (Opção 1)

- Lexer/parser/AST completo (PDR-005 / Opção 2)
- Language Server / Worker (Opção 3); **sem i18n**
- Marketplace
- Substituir a família de IDs SYN/RUL/FUN/SEM/SQL (permanecem canônicos)

## Aceite da Opção 1

- [x] ACC-MEM/TOK/SNP/GRM/SYS/SQLF/OUT/REF cobertos ou justificativa (SYS = stub documentado)
- [x] Camadas ADR-005 aplicadas nas features novas
- [x] Extensão publicada como **0.2.0** no monorepo
