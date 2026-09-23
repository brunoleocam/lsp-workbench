---
name: lsp-depurar
description: Depura mentalmente código LSP — resumo, ordem de execução, chamadas de função, o que cada Cursor busca no banco e o resultado final esperado. Use ao pedir depurar, explicar fluxo ou entender uma regra.
---

# lsp-depurar

Análise **dinâmica em prosa** (não substitui `/compilar-lsp`). Objetivo: o leitor entender o que o trecho faz **em tempo de execução**, na ordem real.

**Não** inventar tabelas/colunas: usar `@lsp-banco` / catálogo local se houver SQL.  
**Não** assumir dados reais do banco — descrever o **formato** do retorno e o efeito no fluxo.

## Quando usar

- “Depura essa regra”, “explica o fluxo”, “o que esse cursor busca?”
- Arquivo, seleção ou **contexto** (`lsp.contexts` / pasta de relatório — ver `@lsp-contexto`)

## Fluxo do Agent (ordem obrigatória)

1. **Escopo** — listar arquivos `.lsp`/`.lspt` no foco (seleção > arquivo > pasta/contexto).
2. **Ler o código** — `Definir`, funções, SQL/cursores, `Se`/`Enquanto`/`Para`, `Cancel`, HTTP.
3. **Resumo** — 2–5 frases: propósito de negócio + entradas/saídas principais.
4. **Ordem de execução** — sequência numerada do fluxo principal (e ramos de erro relevantes).
5. **Chamadas** — para cada chamada relevante: quem chama → o quê → efeito (side-effect / variável de saída).
6. **Cursores / SQL** — para cada `Definir Cursor` / `SQL_*` / `ExecSQLEx`:
   - o que busca (tabelas/filtros/joins em linguagem humana + trecho SQL se curto)
   - binds (`:vn…`) e de onde vêm
   - o que **retorna** (campos / linhas / vazio) e como o código usa (`Achou`, `Proximo`, `SQL_Retornar*`)
7. **Resultado final** — estado esperado ao terminar com sucesso; o que acontece em `Cancel(1|2|3)`.
8. **Lacunas** — se faltar contexto (outra função do escopo, tabela sem catálogo), declarar explicitamente.

## Formato da resposta

```markdown
# Depuração LSP – [arquivo ou contexto]

## Resumo
…

## Ordem de execução
1. …
2. …

## Chamadas de função
| # | Onde | Chamada | O que faz / saída |
|---|------|---------|-------------------|
| 1 | … | TamanhoAlfa(va, vn) | Preenche vn com tamanho |

## Cursores e acesso a dados
### Cur_Exemplo (ou SQL_…)
- **Busca:** …
- **Retorno:** …
- **Uso no fluxo:** …

## Resultado final
- Sucesso: …
- Erro / Cancel: …

## Lacunas / hipóteses
- …
```

## Regras

- Seguir a ordem do código Senior: `Definir` no início; depois fluxo; loops de cursor até `FecharCursor`.
- Em projeto de relatório: situar o arquivo no ciclo (Pré-Seleção, Antes de Imprimir, etc.) — ver `docs/gerador-relatorios/`.
- Funções só definidas noutro arquivo do escopo: nomear o arquivo se conhecido (FUN009); senão marcar como “externa / não lida”.
- Após depurar, **não** reescrever o código salvo se o usuário só pediu explicação. Se pedir correção, aí sim editar + sugerir `/compilar-lsp`.

## Relação com outros skills

| Skill / command | Papel |
|-----------------|--------|
| `@lsp-depurar` / `/depurar-lsp` | Entender execução (este) |
| `@lsp-compilar` / `/compilar-lsp` | IDs estáticos / analyzer |
| `@lsp-revisar` | Checklist rápido |
| `@lsp-banco` | Evidência de tabelas/colunas |
| `@lsp-contexto` | Qual pasta/contexto está ativo |
