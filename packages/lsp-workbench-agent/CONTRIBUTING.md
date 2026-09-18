# Contributing — LSP Workbench Agent

Instruções para **autores** (não vão no README do Marketplace).

## Testar localmente no Cursor

```powershell
$src = "C:\caminho\para\packages\lsp-workbench-agent"
$dest = "$env:USERPROFILE\.cursor\plugins\local\lsp-workbench-agent"
New-Item -ItemType Directory -Force -Path (Split-Path $dest) | Out-Null
if (Test-Path $dest) { Remove-Item $dest -Recurse -Force }
cmd /c mklink /J "$dest" "$src"
```

Depois: **Developer: Reload Window**.

## Convenção de skills

Padrão **`lsp-<ação>`**: `linguagem` | `gerar` | `validar` | `formatar` | `refatorar` | `revisar` | `logs`

Commands: `/validar-lsp`, `/refatorar-lsp`, `/formatar-lsp`, `/gerar-lista-lsp`, `/gerar-cursor-lsp`, `/gerar-http-lsp`.

## Publicar

Ver [PUBLISH.md](PUBLISH.md).
