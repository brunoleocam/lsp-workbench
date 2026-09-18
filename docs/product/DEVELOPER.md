# Guia do desenvolvedor — LSP Workbench

Mantenedores do monorepo público. Usuário final: ver [README.md](../../README.md) na raiz.

## Monorepo

| Package | Papel | Versão (ref.) |
|---------|-------|----------------|
| `packages/lsp-workbench` | Extensão VS Code/Cursor | 0.2.0 |
| `packages/lsp-workbench-agent` | Agent Cursor (rules/skills/commands) | — |
| `packages/lsp-analyzer` | Lexer/parser/AST + diagnostics `ANL*` + `format` | 0.2.0 |
| `packages/lsp-language-server` | Language Server + Worker (opt-in) | 0.1.0 |

Remoto: https://github.com/brunoleocam/lsp-workbench

Arquitetura: [architecture/ARCHITECTURE.md](architecture/ARCHITECTURE.md) · [ADR-005](adr/ADR-005-clean-architecture-nucleo-puro.md) · [ADR-006](adr/ADR-006-roadmap-opcoes-1-2-3.md)

## Build e teste

```powershell
# Extensão
cd packages\lsp-workbench
npm install
npm test

# Analyzer
cd ..\lsp-analyzer
npm install
npm run compile

# Language Server
cd ..\lsp-language-server
npm install
npm test
```

F5 na raiz do monorepo: launch **Run LSP Workbench Extension**.

Checklist completo: [LOCAL-TEST.md](LOCAL-TEST.md).

### Scripts úteis (raiz)

| Script | Uso |
|--------|-----|
| `scripts/extract-lsp-functions.mjs` | Extrai builtins a partir de `docs/lsp` |
| `scripts/generate-tmgrammar.mjs` | Regenera TextMate |
| `scripts/analyze-lsp.mjs` | CLI do analyzer (Agent / CI local) |
| `scripts/sync-brand-assets.js` | Regenera logo/icon a partir de `assets/` |

## Configuração

Chaves `lsp.*` — [ADR-003](adr/ADR-003-config-unificada.md). Defaults também em `packages/lsp-workbench/package.json` e `lsp.config.json`.

## Documentação de produto

Índice: [README.md](README.md) · Status/changelog: [CHANGELOG-plataforma.md](CHANGELOG-plataforma.md) · IDs de diagnóstico: [regras-estaticas-lsp.md](regras-estaticas-lsp.md)

## Conteúdo local privado

Pastas listadas no `.gitignore` (ex.: docs de modelo de dados e regras de cliente) **não** entram no remoto público. Não documentar nem publicar conteúdo sensível neste repositório.
