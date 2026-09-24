# Publicar — LSP Workbench Agent (Cursor Marketplace)

Plugin Cursor com skills, rules e commands para a Linguagem Senior.  
Repo público: https://github.com/brunoleocam/lsp-workbench  
Pasta do plugin: `packages/lsp-workbench-agent`

Manifesto multi-plugin (monorepo): [`.cursor-plugin/marketplace.json`](../../.cursor-plugin/marketplace.json) na raiz.

## Pré-requisitos

- [x] `.cursor-plugin/plugin.json` com `name`: `lsp-workbench-agent`
- [x] `.cursor-plugin/marketplace.json` com `source`: `./packages/lsp-workbench-agent` (schema oficial)
- [x] Logo em `assets/` (sem paths `..`)
- [x] Sem `docs/banco-senior` / `docs/senior`
- [ ] Teste local (abaixo)
- [ ] Submit em https://cursor.com/marketplace/publish

Schema de referência: [cursor/plugins schemas](https://github.com/cursor/plugins/tree/main/schemas).

## Teste local

```powershell
$dest = "$env:USERPROFILE\.cursor\plugins\local\lsp-workbench-agent"
if (Test-Path $dest) { Remove-Item $dest -Recurse -Force }
New-Item -ItemType Junction -Path $dest -Target "C:\Dev\lsp-workbench\packages\lsp-workbench-agent"
```

Depois: **Developer: Reload Window** → confira skills/commands em Customize.

## Submit

1. Push do monorepo público atualizado.
2. Abra https://cursor.com/marketplace/publish
3. Envie a URL: `https://github.com/brunoleocam/lsp-workbench`
4. Aguarde review manual da equipe Cursor.

A extensão IDE (`brunoleocam.lsp-workbench`) publica à parte no VS Marketplace — não substitui este plugin.
