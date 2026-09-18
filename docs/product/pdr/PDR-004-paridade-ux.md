# PDR-004 — Paridade UX competitiva (Opção 1)

| Campo | Valor |
|-------|-------|
| Status | Aceito (implementação em levas) |
| Data | 2026-09-18 |
| Artefato | Extensão `packages/lsp-workbench` |
| Roadmap | [ADR-006](../adr/ADR-006-roadmap-opcoes-1-2-3.md) — Opção 1 de 1→2→3 |
| Referência | [matriz-competitiva-extensoes-lsp.md](../matriz-competitiva-extensoes-lsp.md) |
| Relacionados | PDR-001, PDR-003, ADR-003, ADR-005 |

## Problema

llutti 2.0.11 e Killer 1.0.4 oferecem UX que o Workbench 0.1.3 ainda não cobre por completo (membros Cursor/Lista, semantic tokens, snippets, TextMate densa, Outline, refactors, SQL embutido, catálogos multi-sistema). Desenvolvedores Demóbile precisam dessa paridade **sem** abandonar regras de ouro, Agent nem FUN009.

## Decisão

Implementar **paridade de UX in-process** (Opção 1), com núcleo puro (ADR-005), antes de compiler (Opção 2) e Language Server (Opção 3).

## Levas

| Leva | Entrega | Critérios (TDD) |
|------|---------|-----------------|
| **P0a** | Completion membros Cursor / Lista + campos `AdicionarCampo` | ACC-MEM-* |
| **P0b** | `DocumentSemanticTokensProvider` básico | ACC-TOK-* |
| **P1a** | Snippets ~30 (Definir, blocos, SQL API, helpers) estilo `{ }` | ACC-SNP-* |
| **P1b** | TextMate enriquecida a partir do catálogo próprio | ACC-GRM-* |
| **P1c** | Catálogos HCM / ACESSO / ERP (merge por `system`) | ACC-SYS-* |
| **P1d** | Format SQL embutido opt-in | ACC-SQLF-* |
| **P2a** | Outline (`DocumentSymbolProvider`) | ACC-OUT-* |
| **P2b** | Refactors wrap / toggle braces / `\`→`+` | ACC-REF-* |

## Disciplina

- README extensão + raiz atualizados ao fechar cada leva.
- CHANGELOG com toda mudança user-facing.
- SOLID / Clean Code; lógica em `domain` / `application` (sem `vscode`).
- TDD: casos em [TDD-paridade-ux.md](../tdd/TDD-paridade-ux.md); eval em [EVAL-paridade-ux.md](../eval/EVAL-paridade-ux.md).

## Não-objetivos (Opção 1)

- Lexer/parser/AST completo (PDR-005 / Opção 2)
- Language Server / Worker / i18n (Opção 3)
- Marketplace
- Copiar código ou JSON de llutti/Killer
- Substituir IDs SYN/RUL/FUN/SEM/SQL pelos `LSP####` do llutti

## Aceite da Opção 1 (fechamento)

- Todos ACC-MEM/TOK/SNP/GRM/SYS/SQLF/OUT/REF passando ou justificativa documentada.
- Matriz competitiva atualizada: gaps Killer/llutti de UX marcados como cobertos ou “não aplicável”.
- Arquitetura de pastas alvo (ADR-005) aplicada ou migrada nas branches P0+.
