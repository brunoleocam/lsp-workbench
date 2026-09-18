# Teste local — LSP Workbench (antes do git/remoto)

Checklist rápido. Não precisa de Marketplace.

## 0. Pré-requisitos

- Cursor instalado
- Node.js 20+ (para a extensão)
- Esta pasta aberta como workspace

## Autocomplete

Só o catálogo LSP Workbench (`Se`, `Cancel(1);`, `Definir`, …).  
Cursor Tab / sugestões em inglês-espanhol ficam desligados para `senior-lsp` via:

- `cursor.cpp.disabledLanguages`: `["senior-lsp"]` (`.vscode/settings.json`)
- `editor.inlineSuggest.enabled`: false
- `editor.wordBasedSuggestions`: off

Language id: **`senior-lsp`** (não `lsp`, para evitar colisão).

## 1. Extensão (`packages/lsp-workbench`)

```powershell
cd packages\lsp-workbench
npm install
npm test
```

Esperado: **113+ testes passando** (inclui cobertura de fixtures via `MANIFEST.json` e catálogo de funções 100% docs/lsp).

Autocomplete de funções: após alterar `docs/lsp/`, rode `npm run extract-functions` em `packages/lsp-workbench` (já roda no `pretest`). Ctrl+Espaço filtra por prefixo (`Mens` → `Mensagem`, `Http` → família HTTP, …).

Para carregar no Cursor/VS Code (UI):

1. Abra a **raiz do monorepo** neste workspace
2. `npm run compile` em `packages/lsp-workbench` (ou deixe o preLaunchTask rodar)
3. Painel **Run and Debug** → configuração **Run LSP Workbench Extension** → F5  
   (abre Extension Development Host com as fixtures)
4. Confira: colorização, Problems (abrir `fixtures/smoke-*.lsp` — ver `fixtures/README.md` + `MANIFEST.json`), Format Document, Quick Fix em RUL007/RUL014/FUN001/SYN004
5. Smoke negativo: `fixtures/00-ok-clean.lsp` → Problems vazio

Alternativa: abrir só `packages/lsp-workbench` e F5 com extensionDevelopmentPath implícito.

## 2. Agent público (`packages/lsp-workbench-agent`)

```powershell
$src = "c:\Dev\Documentacao-LSP-Linguagem-Senior-de-Programacao\packages\lsp-workbench-agent"
$dest = "$env:USERPROFILE\.cursor\plugins\local\lsp-workbench-agent"
New-Item -ItemType Directory -Force -Path (Split-Path $dest) | Out-Null
if (Test-Path $dest) { Remove-Item $dest -Recurse -Force }
cmd /c mklink /J "$dest" "$src"
```

Depois: **Developer: Reload Window**.

Smoke no Agent (chat novo):

- `/gerar-lista-lsp` → campos `CODIGO:Numero, NOME:Alfa`
- `/validar-lsp` em um `.lsp` com `Retorna;`
- `@lsp-linguagem` em dúvida de sintaxe

(Alternativa sem junction: o harness em `.cursor/` do monorepo já espelha skills/commands ao abrir esta pasta.)

## 3. Plugin Demóbile (privado)

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install-demobile-plugin.ps1
```

Reload Window. No Agent: `@lsp-demobile` e uma pergunta sobre tabela `E120PED` (deve apontar `docs/banco-senior`).

## 4. Gitignore (sanity)

```powershell
git init   # se ainda não houver
git status
```

**Não** devem aparecer como untracked a versionar: `docs/banco-senior/`, `docs/senior/`, `packages/lsp-workbench-demobile/`, `node_modules/`.

## 5. Eval manual Agent

Seguir [`docs/product/eval/EVAL-agent.md`](../docs/product/eval/EVAL-agent.md).

## O que ainda NÃO está completo (plano Fase C)

Extensão **0.1.3** tem: grammar, format, diagnostics do catálogo estático (`regras-estaticas-lsp.md`), snippets, Quick Fixes, completion (builtins + funções/variáveis customizadas no escopo), hover, signature help, go-to-def, modos `lsp.symbols.scope` (`project`/`file`/`mixed`), `lsp.contexts`, FUN007–FUN009 + QF importar, comandos de contexto.

Ainda faltam para paridade IDE plena: semantic tokens dedicados, SQL embutido formatado, catálogos HCM/ACESSO/ERP além de SENIOR, VSIX/Marketplace.

### Setup `.txt` de regra (workspace)

```json
{
  "files.associations": {
    "**/HR/HR*.txt": "lsp",
    "**/TR/TR*.txt": "lsp"
  },
  "lsp.symbols.scope": "project"
}
```

Nota: a language id da extensão é `senior-lsp`; se a association usar `"lsp"`, ajustar para `"senior-lsp"`.

