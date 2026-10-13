Instruções de workspace do LSP Workbench para o GitHub Copilot (espelho das regras sempre ativas de `.cursor/rules`).

Para criar SQL ou consultar tabela, coluna, chave ou enum, use o `catalog.json` local. Ordem: `lsp.catalog.path`, `docs/banco-senior/.generated/catalog.json`, `docs/banco-senior-base/.generated/catalog.json`, `docs/banco-senior-base/catalog.json`.

# LSP – Núcleo (sempre aplicar)

## Anti-padrões frequentes (não gerar código assim)

1. **`Retorna`** — não existe; após erro usar `Cancel(1);`.
2. **Parâmetros de função** — apenas tipo `Numero` **na assinatura** (`Definir Funcao Foo(Numero vnP);`). Sem tipo (`Foo(vaP)`) é erro (RUL001). Alfa/Data/Lista não vão no param — use variável global; não faça `Definir Alfa` + `Foo(vaP)`.
3. **Retorno de função** — por parâmetro (`TamanhoAlfa(va, vn);`), não `vn = Func();` quando a função usa parâmetro de saída.
4. **Concatenação** — só `Alfa + Alfa`; nunca concatenar dentro de **argumento** de função; nunca `Alfa + Numero` sem `IntParaAlfa` antes.
5. **Condições com `e` / `ou`** — cada parte entre parênteses: `Se ((a > 0) e (b < 10))`.
6. **`Objeto.Campo` em parâmetro** — permitido quando a doc do parâmetro diz Campo/Variável (ex.: `IntParaAlfa(E900COP.NUMORP, vaNum);`, também Alfa ou Data). Se a descrição fala só em variável de retorno, use intermediária antes de gravar em grid.
7. **`FormatarData`** — só aceita `Numero`; obter instante com `DataHora(vn)` antes.
8. **`EstaNulo`** — `EstaNulo(vaDado, vnEhNulo);` depois `Se (vnEhNulo = 0)`; não usar `Se (EstaNulo(...) = 0)` na condição.
9. **`ExecSQLEx`** — `0` = sucesso, `1` = erro (não inverter).
10. **`SQL_RetornarInteiro` / `SQL_RetornarAlfa`** — não usar variáveis de parâmetro de função como destino; usar variável local e depois atribuir.
11. **Blocos** — usar **`{ }`**; não usar `Inicio` / `Fim;` (nem `FimSe` / `FimEnquanto`) neste padrão.
12. **`FecharCursor` / `SQL_FecharCursor`** — só no caminho em que esse cursor foi aberto e ainda está aberto. Fechar sem `AbrirCursor` / `SQL_AbrirCursor` não compila. Fechar dentro de um `Se` e de novo depois do `Se` também não: o caminho que entra fecha duas vezes.

## Regras de ouro (detalhe)

- **Parâmetros de função:** apenas tipo `Numero` **na assinatura** (`Definir Funcao Foo(Numero vnP);`). Sem tipo (`Foo(vaP)`) = RUL001. Alfa/Data/Lista = variável global (sem o param). Não `Definir Alfa` + `Foo(vaP)`.
- **Condições compostas:** em `Se`/`Enquanto` com `e` ou `ou`, cada condição entre parênteses: `Se ((a > 0) e (b < 10))`.
- **Retorno:** funções retornam por parâmetro (ex.: `TamanhoAlfa(vaTexto, vnTamanho);`), não por atribuição direta.
- **Interrupção:** usar `Cancel(1);` após mensagem de erro; não existe `Retorna`.
- **Conversões:** sempre variável intermediária (ex.: `AlfaParaDecimal(vaTexto, vnValor);` depois `Grid.Campo = vnValor`).
- **Concatenação:** apenas Alfa + Alfa; converter número com `IntParaAlfa` antes de concatenar.
- **Nunca** concatene dentro de parâmetros de funções. Regra de ouro: manipule primeiro (operações, conversões, concatenações em variáveis), depois chame a função com as variáveis (consulte `docs/lsp/lembrete-final-regra-de-ouro-da-lsp.md`).
- **Cursor:** em cada caminho, abrir uma vez e fechar uma vez, depois do uso. O fechar fica fora da condicional. Se precisar fechar dentro do `Se`, use um `Numero` de controle e só execute o `FecharCursor` de fora quando ele indicar que o cursor ainda está aberto. Vale para `.FecharCursor` e `SQL_FecharCursor`.
- **Banco / SQL:** tabela, coluna ou SQL do ERP somente a partir do `catalog.json` resolvido pela extensão (`lsp.catalog.path` ou, se existir no projeto, `docs/banco-senior/.generated/catalog.json`, `docs/banco-senior-base/.generated/catalog.json`, `docs/banco-senior-base/catalog.json`).

# Global – Boas Práticas

- Princípios gerais de engenharia (SOLID, Clean Code, testes, arquitetura antes de código em projetos novos, decomposição de tarefas complexas): seguir as **User Rules** do Cursor.
- Antes de concluir uma resposta que possa depender de docs locais Senior/LSP: aplicar **MCP – Triagem** (`mcp-triagem-obrigatoria.mdc`) — neste workspace, docs em `docs/` têm prioridade sobre MCP externo. Tabela canônica: `uso-ferramentas-mcp.mdc`.
- Lacunas de regras e fluxo de memória: `regras-memoria-evolucao.mdc`.

# MCP – Triagem antes de responder (workspace LSP)

## Objetivo

Antes de responder, avaliar se é necessário consultar ferramenta/MCP. Se for, consultar primeiro. Neste workspace, **preferir evidência em `docs/lsp`** (e, se existirem localmente, `docs/senior` / `docs/banco-senior`) antes de MCP externo.

## Checklist (mental)

- **Linguagem LSP / sintaxe / padrões?** → `docs/lsp/` + skills `lsp-gerar` / `lsp-linguagem` (não inventar).
- **Regra de negócio / o que pode no Sapiens?** → `docs/senior/` (fluxo + insights + `regras/`), se a pasta existir no workspace.
- **Tabela, coluna, chave, enum, SQL Senior?** → `docs/banco-senior/` + skill `lsp-banco`, se a pasta existir.
- **Planejamento / critérios / edge cases?** → `spec-driven` (se disponível).
- **Quebrar em tarefas?** → `task-master-ai` (se disponível).
- **Debug lógico passo a passo?** → `sequential-thinking` (se disponível).
- **Trade-offs / arquitetura?** → `structured-thinking` (se disponível).
- **Invariantes / contratos?** → `tractatus_thinking` (se disponível).
- **Docs de lib externa (versão atual)?** → Context7 (se disponível).
- **Exploração ampla do codebase?** → busca local ou subagent explore.

## Quando NÃO chamar MCP

- Resposta só com docs locais deste pacote.
- Pergunta conceitual sem dependência de versão externa.
- Opinião/abordagem pedida pelo usuário.

## Anti-padrões

- Inventar tabela, coluna, enum ou comportamento de regra sem ler o doc local.
- Dizer “está certo” sem validar quando a validação é barata (docs ou skill de validação LSP).

# Memória e evolução de regras

## Comportamento do agente

- Se a resposta **violar** uma project rule de LSP/Senior ou **revelar lacuna** (comportamento repetido sem regra escrita): **informar o usuário** de forma objetiva.
- Sugerir **1–3 linhas** de texto canônico para:
  - **Cursor → Memories** (hábitos curtos), ou
  - **[docs/lsp/evolucao-regras-lsp.md](../../docs/lsp/evolucao-regras-lsp.md)** (histórico versionado no pacote), ou
  - edição pontual de um `.mdc` específico, quando for o caso.
- **Não** afirmar que a regra já foi gravada; a persistência é sempre ação do usuário.

## Frase-gatilho (usuário)

- *"Adicionar na memória: [descrição da regra ou correção]"* — o agente deve redigir o trecho final e indicar **onde** colar (Memories vs `docs/lsp/evolucao-regras-lsp.md` vs arquivo de rule indicado).
