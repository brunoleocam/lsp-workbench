# LEMBRETE FINAL: Regra de Ouro da LSP

### **Manipule primeiro, chame a função depois!**

**Esta é a regra mais importante da LSP. Memorize e aplique sempre:**

1. **Faça todas as operações** (concatenação, conversões, cálculos)
2. **Armazene em variáveis**
3. **Passe as variáveis** para as funções

**Errado:**

```lsp
Mensagem(Retorna, "Total: " + IntParaAlfa(vnSoma + vnExtra));
```

**Correto:**

```lsp
vnTotal = vnSoma + vnExtra;
IntParaAlfa(vnTotal, vaTotalStr);
vaMensagem = "Total: " + vaTotalStr;
Mensagem(Retorna, vaMensagem);
```

---

- **Fim da Documentação LSP - Linguagem Senior de Programação**

- *Desenvolvido em colaboração | Atualizado em 2025*
