# Setup local — LSP Workbench

Para mantenedores. Usuário final: [README.md](../../README.md).

## Extensão

```powershell
cd packages\lsp-analyzer
npm install
npm run compile

cd ..\lsp-workbench
npm install
npm test
```

Na **raiz do monorepo**: Run and Debug → **Run LSP Workbench Extension** (F5).

Language id: **`senior-lsp`** (`.lsp` / `.lspt`). Smokes: `packages/lsp-workbench/fixtures/smoke-*.lsp`.

Projeto de relatório: use **Gerar Relatório** (cria a árvore). Ao abrir um `.lsp` interno, o escopo de símbolos fica **só nessa pasta** (PDR-010). **Importar Contexto de…** grava `contextoExtra` no `relatorio.json`.

Autocomplete só do catálogo Workbench (Tab Cursor desligado para `senior-lsp` via `.vscode/settings.json`).

## Language Server (opt-in)

```powershell
cd packages\lsp-analyzer; npm run compile
cd ..\lsp-language-server; npm install; npm test
```

`lsp.server.enabled` = `true` → Reload Window.

## Agent

```powershell
# Na raiz do monorepo (ex.: c:\Dev\lsp-workbench)
$src = (Resolve-Path "packages\lsp-workbench-agent").Path
$dest = "$env:USERPROFILE\.cursor\plugins\local\lsp-workbench-agent"
New-Item -ItemType Directory -Force -Path (Split-Path $dest) | Out-Null
if (Test-Path $dest) { Remove-Item $dest -Recurse -Force }
cmd /c mklink /J "$dest" "$src"
```

Reload Window. No monorepo, `.cursor/` já espelha skills/commands.

## Não versionar

`docs/banco-senior/` (overlay cliente), `docs/banco-senior-base/catalog.json`, `docs/banco-senior-base/.generated/`, `docs/senior/`, `node_modules/`, `**/out/` — ver `.gitignore`.

### Catálogo de tabelas (PDR-009)

```powershell
# Gerar base local a partir de TSV (R996) — ver docs/banco-senior-base/README.md
# node scripts/catalog-from-r996-tsv.mjs --in r996.tsv --out docs/banco-senior-base/catalog.json

# Merge base local ± overlay privado
node scripts/build-local-catalog.mjs
```

- Base local (gitignore): `docs/banco-senior-base/catalog.json`
- Overlay Demobile/cliente: `docs/banco-senior/` (opcional, gitignore)
