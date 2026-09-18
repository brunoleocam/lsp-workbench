# Cancel

A função `Cancel` é utilizada para cancelar a execução de uma regra. Dependendo do valor passado como parâmetro, diferentes ações podem ser tomadas. Ao usar a função Cancel(n) em regras que são executadas por eventos de tela, a única ação tomada será o cancelamento da execução da regra, independentemente do valor passado como parâmetro.

Para que seja gerado um erro, deve-se usar a função **Mensagem(Erro, "mensagem")** ou então a equipe de desenvolvimento do sistema deve tratar via código de sistema o retorno de **Cancel(n)**.

No **Gerador de Relatórios**, o comando **Cancel** pode ser usado das seguintes formas:

- **Cancel(1)**

    Em controles: Cancela a execução da regra e a impressão do mesmo.
    Nas regras: Definição\Seleção e Detalhe\Antes_de_Imprimir, exclui o registro atual do relatório (detalhe);
    Na regra: Definição\Pré-Seleção cancela a execução do relatório.

- **Cancel(2)**
     Utilizado para imprimir o conteúdo da variável ValStr em controles do tipo descrição e depois sair da regra;

- **Cancel(3)**
    Utilizado apenas em controles do tipo fórmula (na ordenação por fórmula) para excluir o registro atual do relatório (semelhante a executar o Cancel(1) nas regras: Definição\Seleção, Detalhe\Antes_de_Imprimir e Detalhe\Depois_de_Imprimir).

Exemplo:

```lsp
Cancel(1); @ Cancela a execução da regra e a impressão do controle @
Cancel(2); @ Imprime o conteúdo da variável ValStr em controles do tipo descrição e depois sai da regra @
Cancel(3); @ Exclui o registro atual do relatório em controles do tipo fórmula @
```
