---
name: gerar-http-lsp
description: Gera esqueleto HTTP LSP + parse JSON/XML.
---

Gerar esqueleto de **chamada HTTP** LSP + leitura da resposta.

## Entrada (pedir se faltar)

1. URL / endpoint (Alfa)
2. Formato: `json` ou `xml`
3. Método (default GET) e se há corpo (POST)

## Saída

1. Variáveis `vaUrl`, `vaCorpo`, `vaResposta` — montar **antes** da chamada
2. Chamada **sem** concatenação dentro de argumentos
3. Parse conforme **@lsp-linguagem** → `reference-padroes.md`
4. Erro: `Mensagem` + `Cancel(1);`
5. Blocos `{ }`

Ao final sugerir **`@lsp-revisar`**.
