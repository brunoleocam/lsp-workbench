# Contributing — LSP Workbench Agent

Instruções para **autores** (não vão no README do Marketplace).

## Testar localmente no Cursor

```powershell
$src = "C:\Dev\lsp-workbench\packages\lsp-workbench-agent"
$dest = "$env:USERPROFILE\.cursor\plugins\local\lsp-workbench-agent"
New-Item -ItemType Directory -Force -Path (Split-Path $dest) | Out-Null
if (Test-Path $dest) { Remove-Item $dest -Recurse -Force }
cmd /c mklink /J "$dest" "$src"
```

Depois: **Developer: Reload Window**. Conferir `@lsp-compilar`, `/compilar-lsp`, `@lsp-banco`, `@lsp-contexto`.

## Convenção de skills

Padrão **`lsp-<ação>`**: `linguagem` | `gerar` | `compilar` | `revisar` | `formatar` | `refatorar` | `logs` | `banco` | `contexto`

Commands: `/compilar-lsp`, `/formatar-lsp`, `/refatorar-lsp`, `/gerar-lista-lsp`, `/gerar-cursor-lsp`, `/gerar-http-lsp`, `/gerar-relatorio`, `/escopo-relatorio`, `/copiar-regra-relatorio`.

| Rápido | Completo |
|--------|----------|
| `@lsp-revisar` | `/compilar-lsp` |

## Antes de release / submit Marketplace

```powershell
node scripts/generate-members-reference.mjs
cd packages\lsp-analyzer; npm run compile
node ..\..\scripts\analyze-lsp.mjs packages\lsp-workbench-agent\exemplos\SmokePreCompilar.lsp
```

## Publicar

Ver [PUBLISH.md](PUBLISH.md).
