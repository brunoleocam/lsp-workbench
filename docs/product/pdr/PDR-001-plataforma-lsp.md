# PDR-001 — Plataforma LSP Workbench

| Campo | Valor |
|-------|-------|
| Status | Aceito |
| Data | 2026-09-16 |
| Marca | LSP Workbench |

## Problema

Desenvolvedores de regras na Linguagem Senior de Programação (LSP) precisam de: (1) suporte IDE rico, (2) Agent Cursor alinhado às regras de ouro, (3) dados internos Demóbile (banco + regras) sem vazar em repositório público. Não havia uma plataforma única que unisse extensão + Agent + plugin privado com a mesma disciplina de regras.

## Personas

- Dev Demóbile escrevendo/revisando `.lsp` / `.lspt` no Cursor
- Dev externo usando só linguagem (sem schema Demóbile)
- Mantenedor da plataforma (Bruno / TI Demóbile)

## Escopo (3 artefatos)

1. **LSP Workbench** — extensão VS Code/Cursor (format, diagnostics, completion, hover, go-to-def, refactors)
2. **LSP Workbench Agent** — plugin Cursor (rules/skills/commands + geradores)
3. **LSP Workbench Demóbile** — plugin local gitignored (banco-senior + senior)

## Não-objetivos (esta leva)

- Publicar no Marketplace nesta sprint
- Copiar código de extensões de terceiros
- Incluir dicionário Oracle Demóbile no artefato público

## Métricas de sucesso

- Geradores (`/gerar-lista-lsp`, `/gerar-cursor-lsp`, `/gerar-http-lsp`) produzem código que passa checklist de regras de ouro
- Formatter da extensão: snapshot estável com indent 2 e braces
- Clone público do repo **não** contém `docs/banco-senior` nem `docs/senior`
- Eval Agent: taxa de asserts críticos ≥ baseline documentada em EVAL-agent.md
