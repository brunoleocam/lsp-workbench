# Documentação para desenvolvedores — LSP Workbench

Mantenedores do monorepo público.  
**Usuário final / configuração da extensão:** [README.md](../../README.md) na raiz · guia Marketplace: [packages/lsp-workbench/README.md](../../packages/lsp-workbench/README.md).

## Monorepo

| Package | Papel | Versão (ref.) |
|---------|-------|----------------|
| `packages/lsp-workbench` | Extensão VS Code/Cursor | 0.2.3 |
| `packages/lsp-workbench-agent` | Agent Cursor (rules/skills/commands) | — |
| `packages/lsp-analyzer` | Lexer/parser/AST + `analyzeLsp` | 0.3.0 |
| `packages/lsp-language-server` | Language Server + Worker (opt-in) | 0.2.0 |

Remoto: https://github.com/brunoleocam/lsp-workbench

Arquitetura: [architecture/ARCHITECTURE.md](architecture/ARCHITECTURE.md) · [ADR-005](adr/ADR-005-clean-architecture-nucleo-puro.md) · [ADR-006](adr/ADR-006-roadmap-opcoes-1-2-3.md)

## Build e teste

```powershell
cd packages\lsp-analyzer
npm install
npm run compile

cd ..\lsp-workbench
npm install
npm test
```

Na **raiz do monorepo**: Run and Debug → **Run LSP Workbench Extension** (F5).

Setup detalhado: [LOCAL-TEST.md](LOCAL-TEST.md).

### Language Server (opt-in)

```powershell
cd packages\lsp-analyzer
npm run compile
cd ..\lsp-language-server
npm install
npm test
```

Na extensão: `lsp.server.enabled` = `true` → **Reload Window**.

### Publicar VSIX / Marketplace

Ver [packages/lsp-workbench/PUBLISH.md](../../packages/lsp-workbench/PUBLISH.md).

```powershell
cd packages\lsp-workbench
npm run package:vsix
```

### Scripts úteis (raiz)

| Script | Uso |
|--------|-----|
| `scripts/extract-lsp-functions.mjs` | Extrai builtins a partir de `docs/lsp` |
| `scripts/generate-tmgrammar.mjs` | Regenera TextMate |
| `scripts/analyze-lsp.mjs` | CLI do analyzer (Agent / CI local) |
| `scripts/package-extension.mjs` | Empacota VSIX com analyzer vendored |
| `scripts/sync-brand-assets.js` | Regenera logo/icon a partir de `assets/` |

## Configuração da extensão (referência)

Chaves `lsp.*` — [ADR-003](adr/ADR-003-config-unificada.md).  
Passo a passo para o usuário (multiarquivo, `.txt`, catálogo): [README.md](../../README.md#configuração-passo-a-passo).

Defaults em `packages/lsp-workbench/package.json` e `lsp.config.json`.

## Documentação de produto

Índice: [README.md](README.md) · Status: [CHANGELOG-plataforma.md](CHANGELOG-plataforma.md) · IDs: [regras-estaticas-lsp.md](regras-estaticas-lsp.md)

## Conteúdo local privado

Pastas no `.gitignore` (dicionário/regras de cliente) **não** entram no remoto público. Não publicar dados sensíveis.
