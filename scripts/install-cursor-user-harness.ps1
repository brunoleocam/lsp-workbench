# Instala harness LSP no perfil do usuário Cursor
# Copia rules, skills e commands deste pacote para %USERPROFILE%\.cursor\
# Assim a linguagem LSP fica disponível em qualquer pasta aberta no Cursor.
#
# Uso (PowerShell, na raiz deste pacote):
#   powershell -ExecutionPolicy Bypass -File .\scripts\install-cursor-user-harness.ps1

$ErrorActionPreference = 'Stop'

$pkgRoot = Split-Path -Parent $PSScriptRoot
$srcCursor = Join-Path $pkgRoot '.cursor'
$userCursor = Join-Path $env:USERPROFILE '.cursor'

if (-not (Test-Path -LiteralPath (Join-Path $srcCursor 'rules'))) {
  throw "Nao encontrado: $srcCursor\rules — abra/rode o script a partir do pacote Documentacao-LSP."
}

$destRules = Join-Path $userCursor 'rules'
$destSkills = Join-Path $userCursor 'skills'
$destCommands = Join-Path $userCursor 'commands'

New-Item -ItemType Directory -Force -Path $destRules | Out-Null
New-Item -ItemType Directory -Force -Path $destSkills | Out-Null
New-Item -ItemType Directory -Force -Path $destCommands | Out-Null

Write-Host "Pacote : $pkgRoot"
Write-Host "Destino: $userCursor"
Write-Host ''

# Rules (.mdc)
$rules = Get-ChildItem -LiteralPath (Join-Path $srcCursor 'rules') -Filter '*.mdc' -File
foreach ($f in $rules) {
  Copy-Item -LiteralPath $f.FullName -Destination (Join-Path $destRules $f.Name) -Force
  Write-Host "rule  $($f.Name)"
}
Write-Host "Rules: $($rules.Count)"
Write-Host ''

# Skills (pastas inteiras)
$skills = Get-ChildItem -LiteralPath (Join-Path $srcCursor 'skills') -Directory
foreach ($d in $skills) {
  $dest = Join-Path $destSkills $d.Name
  if (Test-Path -LiteralPath $dest) { Remove-Item -LiteralPath $dest -Recurse -Force }
  Copy-Item -LiteralPath $d.FullName -Destination $dest -Recurse -Force
  Write-Host "skill $($d.Name)"
}
Write-Host "Skills: $($skills.Count)"
Write-Host ''

# Commands
$cmdsSrc = Join-Path $srcCursor 'commands'
if (Test-Path -LiteralPath $cmdsSrc) {
  $cmds = Get-ChildItem -LiteralPath $cmdsSrc -Filter '*.md' -File
  foreach ($f in $cmds) {
    Copy-Item -LiteralPath $f.FullName -Destination (Join-Path $destCommands $f.Name) -Force
    Write-Host "cmd   $($f.Name)"
  }
  Write-Host "Commands: $($cmds.Count)"
}

Write-Host ''
Write-Host 'OK. Reinicie o Cursor (ou abra um novo Agent chat).'
Write-Host 'Nota: docs/banco-senior e docs/senior ficam SO neste pacote.'
Write-Host '      Para Demobile (tabelas/regras internas), abra esta pasta como workspace.'
