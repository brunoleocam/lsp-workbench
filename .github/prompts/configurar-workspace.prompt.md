---
name: "configurar-workspace"
description: "Configura o workspace com .cursor, .github e .vscode pela extensão LSP Workbench."
agent: agent
---

Execute na paleta de comandos (Ctrl+Shift+P):

**LSP Workbench: Configurar este Workspace**

Esse comando grava:

- `.cursor/rules`, `.cursor/skills` e `.cursor/commands`
- `.github` para o GitHub Copilot (instruções, skills e prompts)
- associações `*.lsp` e `*.lspt` em `.vscode/settings.json`

Não crie essas pastas manualmente nesta conversa. Se o comando não aparecer, a extensão LSP Workbench não está instalada neste editor.
