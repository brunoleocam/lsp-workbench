---
name: lsp-linguagem
description: Base da Linguagem Senior de Programação (LSP). Use ao criar, editar ou explicar arquivos .lsp/.lspt — sintaxe, tipos, funções, cursores, listas, HTTP/JSON.
---

# lsp-linguagem

Skill base da linguagem. Não inclui dicionário de tabelas nem regras de negócio de um ERP/cliente.

**Compat:** extensão LSP Workbench **≥ 0.2.4** (catálogo unificado de builtins plataforma + HCM + ERP).

## Quando usar

- Criar ou editar `.lsp` / `.lspt`
- Dúvida de sintaxe, tipos, funções, cursores, listas, HTTP
- Revisar código contra limitações da linguagem

## Quando NÃO usar sozinha

- Tabelas/colunas de um ERP concreto: `@lsp-banco` / catálogo local; não inventar schema.
- Funções Senior: preferir completion da extensão (filtro por `system` em `lsp.contexts`); não inventar assinaturas.

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

1. **Sem `Retorna;`** (sem parênteses não compila) — após erro: `Mensagem` + `Cancel(1);`. `Retorna(valor)` é válido
2. **Parâmetros de função** — só tipo `Numero` (Alfa/Data/Lista via globais ou conversão)
3. **Retorno** — por parâmetro: `TamanhoAlfa(vaTexto, vnTam);` — não `vn = TamanhoAlfa(va)`
4. **Concatenação** — só `Alfa + Alfa`; `IntParaAlfa` antes; nunca concatenar dentro de argumento
5. **Condições compostas** — cada parte entre parênteses: `Se ((a > 0) e (b < 10))`
6. **Campos com ponto** — `Objeto.Campo` é válido se a doc do parâmetro diz Campo/Variável (ex.: `IntParaAlfa(E900COP.NUMORP, vaNum);`). Destino só “variável” → intermediária antes do grid
7. **`FormatarData`** — só `Numero`; obter com `DataHora(vn)` antes
8. **`EstaNulo`** — `EstaNulo(va, vnNulo);` depois `Se (vnNulo = 0)`
9. **`ExecSQLEx`** — `0` = sucesso, `1` = erro
10. Terminador `;`; comentário de uma linha abre e fecha com `@` na mesma linha (`@ texto @`); várias linhas `/* ... */`; indentação 2 espaços
11. **Blocos com `{ }`** (padrão de geração) — `Inicio`/`Fim;` são válidos; `FimSe` / `FimEnquanto` não existem
12. **Cursor** — em cada caminho, abrir uma vez e fechar uma vez. `FecharCursor` / `SQL_FecharCursor` sem o cursor aberto não compila. Fechar dentro de um `Se` e de novo depois do `Se` fecha duas vezes no caminho que entra. Se precisar fechar dentro do `Se`, use um `Numero` de controle e só execute o fechar de fora quando o cursor ainda estiver aberto.

## Nomenclatura

| Prefixo | Tipo |
|---------|------|
| `va` | Alfa |
| `vn` | Numero |
| `vd` | Data |
| `vl` | Lista |
| `Cur_` | Cursor |

Depois do prefixo, nome descritivo por extenso. Campo de banco ou variável de sistema: manter o nome do campo (`vnCodEmp`, `vnCodFil`, `vaCodPro`), sem expandir (`vnCodigoEmpresa`).

## Checklist pré-entrega

- [ ] Sem `Retorna;` / `Break` / `%` / `Chr` / `\n` literal
- [ ] Blocos com `{ }`
- [ ] Retorno por parâmetro
- [ ] Sem concatenação dentro de parâmetros
- [ ] `Se`/`Enquanto` com `e`/`ou` bem parentizados
- [ ] SQL longo com `\` ~coluna 80
- [ ] Nomes de função ≤ 30 caracteres
- [ ] **Cursor:** um `FecharCursor` / `SQL_FecharCursor` por caminho, só com o cursor aberto. Sem fechar no `Se` e de novo depois, salvo com `Numero` de controle

## Skills irmãs

| Skill | Papel |
|-------|-------|
| `@lsp-gerar` | Fluxo completo antes/depois de gerar |
| `@lsp-compilar` | Validação sintática + semântica + IDs |
| `@lsp-formatar` | Só layout (indentação, espaços, SQL) |
| `@lsp-refatorar` | Extrair funções, envolver blocos, relatórios |
| `@lsp-revisar` | Checklist rápido pré-compilação |
| `@lsp-logs` | Padrão `vaMosLog` / pasta `logs/` |

## Catálogo de funções (0.2.4+)

- Extensão mescla builtins de plataforma + índices HCM/ERP (~1500+).
- Escopo por sistema: campo `system` em `lsp.contexts` (`HCM` / `ERP`) — ver `@lsp-contexto`.
- Membros Cursor/Lista: só os de [reference-membros.md](reference-membros.md).
- Assinaturas de funções: IDE / docs Senior — não inventar params.

## Docs

- [Senior – tecnologia](https://documentacao.senior.com.br/tecnologia)
- IDs: skill `@lsp-compilar` e o painel Problems
- SQL cursores: [funções oficiais](https://documentacao.senior.com.br/tecnologia/5.10.3/linguagem-sql-senior-2/funcoes.htm)
