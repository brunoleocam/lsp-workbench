Gerar esqueleto de **chamada HTTP** LSP + leitura da resposta.

## Entrada (pedir se faltar)

1. URL / endpoint (Alfa)
2. Formato da resposta: `json` ou `xml`
3. Método (default GET) e se há corpo (POST)

## Saída

1. Variáveis `vaUrl`, `vaCorpo`, `vaResposta` (e auxiliares) — montar **antes** da chamada
2. Chamada HTTP **sem** concatenação dentro de argumentos
3. Parse JSON ou XML conforme padrões em `@lsp-linguagem` → `reference-padroes.md`
4. Erro: `Mensagem` + `Cancel(1);` (nunca `Retorna`)
5. Blocos `{ }`

Inserir no editor. Mencionar que schema de negócio/tabelas não faz parte deste plugin público.
