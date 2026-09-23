---
name: lsp-linguagem
description: Base da Linguagem Senior de Programação (LSP). Use ao criar, editar ou explicar arquivos .lsp/.lspt — sintaxe, tipos, funções, cursores, listas, HTTP/JSON.
---

# lsp-linguagem

Skill base da linguagem. Não inclui dicionário de tabelas nem regras de negócio de um ERP/cliente.

## Quando usar

- Criar ou editar `.lsp` / `.lspt`
- Dúvida de sintaxe, tipos, funções, cursores, listas, HTTP
- Revisar código contra limitações da linguagem

## Quando NÃO usar sozinha

- Tabelas/colunas de um ERP concreto: usar dicionário do workspace do cliente; não inventar schema.

## Fluxo

1. Classificar o pedido (sintaxe / SQL-cursor / strings-datas / HTTP / revisão).
2. Ler só o arquivo necessário:
   - Sintaxe e limitações → [reference-sintaxe.md](reference-sintaxe.md)
   - Padrões (SQL, HTTP, erros) → [reference-padroes.md](reference-padroes.md)
   - Membros Cursor/Lista → [reference-membros.md](reference-membros.md) (**não inventar**)
   - Snippets → [snippets.md](snippets.md)
   - Exemplos → [examples.md](examples.md) e pasta `exemplos/`
3. Gerar ou editar respeitando as regras de ouro.
4. Antes de encerrar: checklist abaixo; para validação completa use `@lsp-compilar`.

## Regras de ouro (sempre)

1. **Sem `Retorna`** — após erro: `Mensagem` + `Cancel(1);`
2. **Parâmetros de função** — só tipo `Numero` (Alfa/Data/Lista via globais ou conversão)
3. **Retorno** — por parâmetro: `TamanhoAlfa(vaTexto, vnTam);` — não `vn = TamanhoAlfa(va)`
4. **Concatenação** — só `Alfa + Alfa`; `IntParaAlfa` antes; nunca concatenar dentro de argumento
5. **Condições compostas** — cada parte entre parênteses: `Se ((a > 0) e (b < 10))`
6. **Campos com ponto** — `Grid.Campo` / `Objeto.Campo` → variável intermediária
7. **`FormatarData`** — só `Numero`; obter com `DataHora(vn)` antes
8. **`EstaNulo`** — `EstaNulo(va, vnNulo);` depois `Se (vnNulo = 0)`
9. **`ExecSQLEx`** — `0` = sucesso, `1` = erro
10. Terminador `;`; comentários `@ ... @` ou `/* ... */`; indentação 2 espaços
11. **Blocos com `{ }`** — não usar `Inicio`/`Fim;` / `FimSe` / `FimEnquanto`

## Nomenclatura

| Prefixo | Tipo |
|---------|------|
| `va` | Alfa |
| `vn` | Numero |
| `vd` | Data |
| `vl` | Lista |
| `Cur_` | Cursor |

## Checklist pré-entrega

- [ ] Sem `Retorna` / `Break` / `%` / `Chr` / `\n` literal
- [ ] Blocos com `{ }`
- [ ] Retorno por parâmetro
- [ ] Sem concatenação dentro de parâmetros
- [ ] `Se`/`Enquanto` com `e`/`ou` bem parentizados
- [ ] SQL longo com `\` ~coluna 80
- [ ] Nomes de função ≤ 30 caracteres

## Skills irmãs

| Skill | Papel |
|-------|-------|
| `@lsp-gerar` | Fluxo completo antes/depois de gerar |
| `@lsp-compilar` | Validação sintática + semântica + IDs |
| `@lsp-formatar` | Só layout (indentação, espaços, SQL) |
| `@lsp-refatorar` | Extrair funções, envolver blocos, relatórios |
| `@lsp-revisar` | Checklist rápido pré-compilação |
| `@lsp-logs` | Padrão `vaMosLog` / pasta `logs/` |

## Docs

- [Senior – tecnologia](https://documentacao.senior.com.br/tecnologia)
- SQL cursores + dialeto Senior 2: `docs/lsp/sql.md` no monorepo · [funções oficiais](https://documentacao.senior.com.br/tecnologia/5.10.3/linguagem-sql-senior-2/funcoes.htm)
