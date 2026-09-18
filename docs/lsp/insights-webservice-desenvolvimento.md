# Insights de Desenvolvimento – WebServices e LSP

> Documento criado a partir de lições aprendidas no desenvolvimento do módulo de cotação de fretes (COT_Principal, COT_ListarPedidos, COT_CotarTransportadoras, COT_PersistirCotacoes). Use para orientar futuros desenvolvimentos e validação de código.

---

## 1. ExecSQLEx – Retorno invertido em relação a APIs comuns

**Descoberta:** Muitas APIs usam `1 = sucesso`, `0 = erro`. Na LSP, `ExecSQLEx` faz o contrário.

| Retorno | Significado |
|---------|-------------|
| **0** | Sucesso |
| **1** | Erro |

**Exemplo correto:**
```lsp
ExecSQLEx(vaSQL, vnRetornoSQL, vaMensagemSQL);
Se (vnRetornoSQL = 0) {
  @ Sucesso – fazer commit, continuar @
} Senao {
  @ Erro – rollback, tratar @
}
```

**Erro comum:** Usar `Se (vnRetornoSQL = 1)` como sucesso – isso indica erro.

**Referência:** `docs/lsp/sql.md` já documenta corretamente; reforçar em revisões.

---

## 2. WebService filho – Abertura de arquivos em caminho de rede

**Contexto:** Quando um WebService é invocado como filho (via `Executar()` de outro WebService), o contexto de execução pode ser diferente.

**Problema:** `Abrir(vaCaminhoLog, Gravarnl)` em caminho de rede (ex.: `\\10.0.0.139\Senior\Sapiens\LogsAst\`) pode falhar quando o WebService roda como filho (retorno ≤ 0).

**Solução:** Fallback para pasta local do projeto:
```lsp
vnHandleLog = Abrir(vaCaminhoLog, Gravarnl);
Se (vnHandleLog <= 0) {
  vaCaminhoLog = "C:\\Dev\\LSP - Senior\\logs\\" + vaTimestamp + "_NomeRegra.txt";
  vnHandleLog = Abrir(vaCaminhoLog, Gravarnl);
}
```

**Padrão recomendado:** Abrir o log inline no início do programa principal (como em COT_API_Correios), em vez de função separada, para evitar problemas de contexto em WebService filho.

---

## 3. Lista vs Grid em WebService filho – Atribuição direta na grid

**Problema:** Atribuir `vlLista.Campo = valor` na lista e depois popular o WebService com `popularWebServiceComListas()` que repassa essa lista para a grid pode causar interrupção ou comportamento inesperado quando o WebService é invocado como filho.

**Solução:** Atualizar diretamente na grid de saída do WebService (`wsNome.Grid.Campo = valor`), sem gravar na lista intermediária. A grid é a fonte estável para leitura/escrita em fluxos encadeados.

**Exemplo:**
```lsp
@ Em vez de: vlCotacoes.ObsRes = vaObsResAtualizada; popularWebServiceComListas(); @
wsCOT_PersistirCotacoes.Cotacoes.ObsRes = vaObsResAtualizada;  @ Direto na grid @
```

---

## 4. Iteração por índice da grid em fluxos encadeados

**Contexto:** Ao processar múltiplos itens (ex.: várias cotações) em um WebService que é filho de outro.

**Recomendação:** Iterar pela grid usando índice (`Para vnIndiceGrid = 0; vnIndiceGrid < vnQtdRegistros; vnIndiceGrid++`), posicionar `Grid.LinhaAtual = vnIndiceGrid` e ler/escrever diretamente nos campos da grid. A grid tende a ser mais estável que a lista em contexto de WebService filho.

---

## 5. LimparParamsEntrada em cadeia de WebServices

**Problema:** Ao popular um WebService com dados de lista/grid e alterar a grid durante o processamento, chamar `LimparParamsEntrada()` e repopular pode sobrescrever as alterações feitas.

**Recomendação:** Evitar `LimparParamsEntrada()` e repopulação após alterações na grid; manter a grid já modificada para as etapas seguintes.

---

## 6. ModoExecucao = 1 (Local) para WebServices

**Já documentado em** `docs/lsp/web-service.md`: O parâmetro `ModoExecucao = 1` deve ser usado em regras que executam WebServices. Sem ele, a execução pode falhar ou comportar-se de forma incorreta.

---

## 7. Variável de controle para logs (vaRegLog / vaMosLog)

**Padrão:** Declarar `Definir Alfa vaRegLog; vaRegLog = "S";` (ou `vaMosLog`). Condicionar abertura, escrita e fechamento do log a `vaRegLog = "S"`. Em produção, alterar para `"N"` para desativar logs sem remover código.

---

## 8. Condições compostas – Parênteses obrigatórios

**Regra conhecida, reforço:** Em `Se` ou `Enquanto` com mais de uma condição (`e` ou `ou`), cada condição deve estar entre parênteses:

```lsp
Se (((vaRegLog = "S") e (vnHandleLog > 0))) {
```

---

## Índice de referência

| Tópico | Regra/arquivo relacionado |
|--------|---------------------------|
| ExecSQLEx 0=sucesso | `docs/lsp/sql.md`, `lsp-limites.mdc` |
| Parâmetros só Numero | `lsp.mdc`, `lsp-nucleo.mdc` |
| WebService filho / arquivos | `docs/lsp/insights-webservice-desenvolvimento.md` (este doc) |
| ModoExecucao | `docs/lsp/web-service.md` |
| Logs | `lsp-logs.mdc` |
| Condições compostas | `lsp.mdc`, `revisao-pre-compilacao-lsp` |
