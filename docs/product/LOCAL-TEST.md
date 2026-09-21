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

Autocomplete só do catálogo Workbench (Tab Cursor desligado para `senior-lsp` via `.vscode/settings.json`).

## Language Server (opt-in)

```powershell
cd packages\lsp-analyzer; npm run compile
cd ..\lsp-language-server; npm install; npm test
```

`lsp.server.enabled` = `true` → Reload Window.

## Agent

```powershell
$src = "c:\Dev\Documentacao-LSP-Linguagem-Senior-de-Programacao\packages\lsp-workbench-agent"
$dest = "$env:USERPROFILE\.cursor\plugins\local\lsp-workbench-agent"
New-Item -ItemType Directory -Force -Path (Split-Path $dest) | Out-Null
if (Test-Path $dest) { Remove-Item $dest -Recurse -Force }
cmd /c mklink /J "$dest" "$src"
```

Reload Window. No monorepo, `.cursor/` já espelha skills/commands.

## Não versionar

`docs/banco-senior/`, `docs/senior/`, `node_modules/`, `**/out/` — ver `.gitignore`.
