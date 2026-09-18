---
name: lsp-refatorar
description: Refatora LSP — extrai funções, envolve blocos, converte Inicio/Fim↔braces, literais com \ para +, comentários e relatório de lógica. Use com /refatorar-lsp.
---

# lsp-refatorar

Melhora estrutura e legibilidade **mantendo** regras de ouro (`lsp-nucleo`). Diferente de `@lsp-formatar` (só whitespace).

## Preferência determinística (PDR-006)

Para `Inicio`/`Fim` → braces e `\` → `+`, preferir na raiz:

```powershell
node scripts/refactor-lsp.mjs <arquivo.lsp> --kind braces --write
node scripts/refactor-lsp.mjs <arquivo.lsp> --kind concat --write
```

Demais transformações (extrair função, wrap Se/Enquanto) seguem o fluxo abaixo com LLM.

## Fluxo

1. **Entender** responsabilidade do arquivo/trecho
2. **Aplicar** mecânicos via script quando couber; demais transformações da lista
3. **Comentar** só decisões não óbvias (`@ ... @`)
4. **Formatar** com `scripts/format-lsp.mjs` / `@lsp-formatar`
5. Entregar **relatório final** (melhorias + riscos de lógica)

## Transformações suportadas

### Estrutura

| Ação | Como |
|------|------|
| Extrair função | Params só `Numero`; Alfa/Data/Lista via globais; retorno por parâmetro |
| Envolver seleção com bloco `{ }` | Indentação +2 |
| Envolver com `Se (cond) { }` | Pedir/inferir condição; parentizar |
| Envolver com `Enquanto` / `Para` | Idem |
| `Inicio`/`Fim;` → `{ }` | Converter corpo inteiro; remover `FimSe`/`FimEnquanto` |
| `{ }` → `Inicio`/`Fim` | Só se o usuário pedir explicitamente (padrão do plugin é braces) |

### Texto / literais

| Ação | Como |
|------|------|
| Multilinha com `\` → concatenação `+` | Quebrar em `vaSql = "..." + "..."`; variáveis no meio: `"a" + vaX + "b"` |
| Concat em argumento | Extrair para variável antes da chamada |
| Campos `Objeto.Campo` em args | Variável intermediária |

### Limpeza

- Nomenclatura `va`/`vn`/`vd`/`vl`/`Cur_`
- Remover `Retorna` → `Cancel(1)` após mensagem
- Comentários de seção para blocos longos (`@ === NOME === @`)

## Relatório final (obrigatório)

```markdown
# Relatório de Refatoração LSP – [arquivo]

## O que foi feito
- …

## O que não foi alterado (de propósito)
- …

## Riscos / problemas de lógica observados
| # | Local | Risco | Sugestão |
|---|-------|-------|----------|
| 1 | … | … | … |

## Próximos passos recomendados
- Rodar `/validar-lsp`
```

## Anti-padrões na refatoração

- Criar função com parâmetro `Alfa`/`Data`/`Lista`
- Deixar concatenação dentro de chamada
- Mudar comportamento SQL/binds sem avisar no relatório
