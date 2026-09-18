# ADR-005 — Clean Architecture e núcleo puro

## Status

Aceito

## Contexto

A extensão mistura providers VS Code e lógica de linguagem. Para evoluir para compiler (Opção 2) e Language Server (Opção 3) sem reescrever features, a regra de negócio não pode depender de `vscode`.

## Decisão

Camadas no `packages/lsp-workbench` (migração gradual a partir das branches P0):

```text
src/
  domain/           # entidades, catálogos, regras puras (sem IO, sem vscode)
  application/      # use cases: completeAt, analyzeDocument, formatDocument, buildTokens
  adapters/
    vscode/         # extension.ts, providers, status bar, commands
```

Regras:

1. **Domain** e **application** não importam `vscode`.
2. Adapters traduzem DTOs ↔ `vscode.CompletionItem` / `Diagnostic` / etc.
3. Testes `node:test` cobrem domain/application; adapters têm testes finos ou smoke F5.
4. SOLID: uma responsabilidade por módulo; dependências apontam para dentro (adapters → application → domain).
5. Clean Code: nomes claros; sem comentários óbvios; funções curtas.

Na Opção 2, `domain`/`application` relevantes migram ou são reexportados por `packages/lsp-analyzer`.

## Consequências

- Refactors de pasta em P0+ (não obrigatório no commit bootstrap).
- Code review rejeita lógica de regra nova só dentro de callbacks `vscode`.

## Relacionados

- [ARCHITECTURE.md](../architecture/ARCHITECTURE.md)
- ADR-006 (roadmap)
