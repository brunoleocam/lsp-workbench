# Instala LSP Workbench Demóbile em plugins locais do Cursor (junction).
# Requer docs/banco-senior e docs/senior na raiz do monorepo.

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$src = Join-Path $root "packages\lsp-workbench-demobile"
$dest = Join-Path $env:USERPROFILE ".cursor\plugins\local\lsp-workbench-demobile"

if (-not (Test-Path $src)) {
  Write-Error "Pacote não encontrado: $src"
}
if (-not (Test-Path (Join-Path $root "docs\banco-senior"))) {
  Write-Warning "docs/banco-senior ausente — o plugin Demóbile precisará desses docs no workspace."
}
if (-not (Test-Path (Join-Path $root "docs\senior"))) {
  Write-Warning "docs/senior ausente — o plugin Demóbile precisará desses docs no workspace."
}

New-Item -ItemType Directory -Force -Path (Split-Path $dest) | Out-Null
if (Test-Path $dest) {
  Remove-Item $dest -Recurse -Force
}
cmd /c mklink /J "$dest" "$src"
if ($LASTEXITCODE -ne 0) {
  Write-Error "mklink falhou (execute o terminal como usuário com permissão de junction)."
}
Write-Host "OK: $dest -> $src"
Write-Host "Reinicie o Cursor (Developer: Reload Window)."
