# PDR-001 — Plataforma LSP Workbench

| Campo | Valor |
|-------|-------|
| Status | Aceito |
| Data | 2026-09-16 |
| Marca | LSP Workbench |

## Problema

Desenvolvedores de regras na Linguagem Senior de Programação (LSP) precisam de: (1) suporte IDE rico, (2) Agent Cursor alinhado às regras de ouro. Não havia uma plataforma única que unisse extensão + Agent com a mesma disciplina de regras.

## Personas

- Dev escrevendo/revisando `.lsp` / `.lspt` no Cursor
- Mantenedor da plataforma

## Escopo (artefatos públicos)

1. **LSP Workbench** — extensão VS Code/Cursor (format, diagnostics, completion, hover, go-to-def, refactors)
2. **LSP Workbench Agent** — plugin Cursor (rules/skills/commands + geradores)

Núcleos: `lsp-analyzer`, `lsp-language-server` (opt-in).

## Não-objetivos (esta leva)

- Publicar no Marketplace nesta sprint
- Incluir dicionários Oracle / regras de cliente no artefato público

## Política de reuso (terceiros) — atualizada 2026-09-21

É **permitido** copiar, adaptar ou inspirar-se em código/ideias do projeto MIT [llutti/vscode-language-lsp](https://github.com/llutti/vscode-language-lsp) quando isso fechar lacunas (ex.: catálogos multi-sistema, validação).

Obrigações:

1. Cumprir a MIT do upstream (manter copyright + aviso de licença nas partes substanciais).
2. Registrar atribuição em [`CREDITS.md`](../../../CREDITS.md) (e CHANGELOG do artefato quando for user-facing).
3. Mencionar o repositório do autor nas docs relevantes.

Licença do Workbench: **MIT** na raiz ([`LICENSE`](../../../LICENSE)) — quem redistribuir este projeto também deve manter créditos (copyright + texto MIT).

Não-objetivo permanente: incorporar material proprietário Senior/cliente sem autorização; a MIT do llutti cobre o código dele, não IP de terceiros eventualmente embutido.

## Métricas de sucesso

- Geradores (`/gerar-lista-lsp`, `/gerar-cursor-lsp`, `/gerar-http-lsp`) produzem código que passa checklist de regras de ouro
- Formatter da extensão: snapshot estável com indent 2 e braces
- Clone público do repo **não** contém pastas sensíveis listadas no `.gitignore` (ex.: `docs/banco-senior`, `docs/senior`)
- Eval Agent: taxa de asserts críticos ≥ baseline documentada em EVAL-agent.md
