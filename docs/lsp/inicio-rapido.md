# 🚀 Início Rápido

### **Primeiro Programa LSP**

```lsp
@ Meu primeiro programa em LSP @
Definir Alfa vaMensagem;
vaMensagem = "Olá, mundo LSP!";
Mensagem(Retorna, vaMensagem);
```

### **Conceitos Fundamentais**

- **Case Insensitive**: `vaNome` = `VANOME` = `vanome`
- **Terminador obrigatório**: Toda linha termina com `;`
- **Comentários**: `@ uma linha @` ou `/* múltiplas linhas */`
- **Identação**: 2 espaços (padrão Senior)

### **Tipos de Dados Essenciais**

```lsp
Definir Alfa vaNome;        @ Texto/String @
Definir Numero vnIdade;     @ Número (int/decimal) @
Definir Data vdNascimento;  @ Data @
```

### **⚠️ Lembre-se Sempre**

1. **Não concatene dentro de parâmetros de funções**
2. **Use variáveis intermediárias para conversões**
3. **Siga o padrão de nomenclatura (va, vn, vd)**
4. **Use `\` para quebra de linha em strings longas**

### **📝 Quebra de Linha em Strings Longas**

Quando uma string (especialmente em cursores SQL) excede o limite de uma linha, use o caractere `\` no final da linha para continuar na próxima linha. **Padrão recomendado: coluna 80.**

```lsp
@ ❌ INCORRETO - String muito longa em uma linha @
Cur_Consulta.SQL "SELECT PRODUTO.NOME, PRODUTO.DESCRICAO, PRODUTO.PRECO, PRODUTO.DATA_CADASTRO, PRODUTO.ULTIMA_ATUALIZACAO, PRODUTO.ESTOQUE, PRODUTO.STATUS, CASE WHEN SYSDATE - PRODUTO.ULTIMA_ATUALIZACAO > 7 THEN 0 ELSE 1 END AS PRODUTO_ATUALIZADO FROM PRODUTOS PRODUTO, CATEGORIAS CAT WHERE CAT.COD_CATEGORIA = PRODUTO.COD_CATEGORIA AND PRODUTO.STATUS = 'A' AND PRODUTO.ESTOQUE > 0";

@ ✅ CORRETO - Quebra de linha com \ @
Cur_Consulta.SQL "SELECT PRODUTO.NOME,                               \
                        PRODUTO.DESCRICAO,                          \
                        PRODUTO.PRECO,                              \
                        PRODUTO.DATA_CADASTRO,                      \
                        PRODUTO.ULTIMA_ATUALIZACAO,                 \
                        PRODUTO.ESTOQUE,                            \
                        PRODUTO.STATUS,                             \
                        CASE WHEN SYSDATE - PRODUTO.ULTIMA_ATUALIZACAO > 7 THEN 0 ELSE 1 END AS PRODUTO_ATUALIZADO \
                 FROM PRODUTOS PRODUTO, CATEGORIAS CAT              \
                 WHERE CAT.COD_CATEGORIA = PRODUTO.COD_CATEGORIA    \
                   AND PRODUTO.STATUS = 'A'                         \
                   AND PRODUTO.ESTOQUE > 0";
```

**Regras para quebra de linha:**

- **Posição do `\`:** Coluna 80 (ou quando o texto passar dessa posição)
- **Alinhamento:** Alinhe as colunas para facilitar leitura
- **Espaçamento:** Mantenha espaços consistentes após o `\`
- **Indentação:** Use 2 espaços para cada nível de indentação

---
