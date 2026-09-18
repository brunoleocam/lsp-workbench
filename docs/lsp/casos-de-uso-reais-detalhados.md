# Casos de Uso Reais Detalhados

### **Cenário Empresarial: Validação de Cliente**

```lsp
@ Sistema completo de validação de dados de cliente @
Definir Funcao validarCliente();

Funcao validarCliente(); {
  @ 1. Validação de CNPJ @
  EstaNulo(vaCNPJ, vnEhNulo);
  Se (vnEhNulo = 0) {
    DeixaNumeros(vaCNPJ);
    TamanhoAlfa(vaCNPJ, vnTamanho);
    Se (vnTamanho <> 14) {
      Mensagem(Erro, "CNPJ deve ter 14 dígitos");
      Cancel(1);
    }
  } Senao {
    Mensagem(Erro, "CNPJ não pode ser nulo");
    Cancel(1);
  }
  
  @ 2. Validação de email @
  EstaNulo(vaEmail, vnEhNulo);
  Se (vnEhNulo = 0) {
    PosicaoAlfa("@", vaEmail, vnPosArroba);
    Se (vnPosArroba = 0) {
      Mensagem(Erro, "Email inválido - deve conter @");
      Cancel(1);
    }
  } Senao {
    Mensagem(Erro, "Email não pode ser nulo");
    Cancel(1);
  }
  
  @ 3. Validação de telefone @
  EstaNulo(vaTelefone, vnEhNulo);
  Se (vnEhNulo = 0) {
    DeixaNumeros(vaTelefone);
    TamanhoAlfa(vaTelefone, vnTamanho);
    Se (vnTamanho < 10) {
      Mensagem(Erro, "Telefone inválido - mínimo 10 dígitos");
      Cancel(1);
    }
  } Senao {
    Mensagem(Erro, "Telefone não pode ser nulo");
    Cancel(1);
  }
  
  @ 4. Validação de data de nascimento @
  DataHoje(vdDataAtual);
  Se (vdDataNascimento > vdDataAtual) {
    Mensagem(Erro, "Data de nascimento não pode ser futura");
    Cancel(1);
  }
  
  Mensagem(Retorna, "Cliente validado com sucesso!");
}
```

### **Cenário de Integração: Consulta CEP Automática**

```lsp
@ Sistema de consulta automática de CEP com validação @
Definir Funcao consultarCEP();

Funcao consultarCEP(); {
  @ 1. Limpa e valida CEP @
  EstaNulo(vaCEP, vnEhNulo);
  Se (vnEhNulo = 0) {
    DeixaNumeros(vaCEP);
    TamanhoAlfa(vaCEP, vnTamanho);
    Se (vnTamanho <> 8) {
      Mensagem(Erro, "CEP deve ter 8 dígitos");
      Cancel(1);
    }
  } Senao {
    Mensagem(Erro, "CEP não pode ser nulo");
    Cancel(1);
  }
  
  @ 2. Monta URL da API @
  vaURL = "https://viacep.com.br/ws/" + vaCEP + "/json/";
  
  @ 3. Configura e executa requisição @
  HttpObjeto(vaHTTP);
  HttpGet(vaHTTP, vaURL, vaResposta);
  
  @ 4. Verifica se encontrou CEP @
  PosicaoAlfa("erro", vaResposta, vnPosErro);
  Se (vnPosErro > 0) {
    Mensagem(Erro, "CEP não encontrado");
    Cancel(1);
  }
  
  @ 5. Extrai dados do JSON @
  ValorElementoJson(vaResposta, "", "logradouro", vaEndereco);
  ValorElementoJson(vaResposta, "", "bairro", vaBairro);
  ValorElementoJson(vaResposta, "", "localidade", vaCidade);
  ValorElementoJson(vaResposta, "", "uf", vaEstado);
  
  @ 6. Monta e exibe resultado @
  vaMensagem = vaEndereco + ", " + vaBairro + " - " + vaCidade + "/" + vaEstado;
  Mensagem(Retorna, vaMensagem);
}
```

### **Cenário de Processamento: Relatório de Vendas**

```lsp
@ Sistema de geração de relatório de vendas @
Definir Funcao gerarRelatorioVendas();

Funcao gerarRelatorioVendas(); {
  @ 1. Valida período @
  Se (vdDataInicio > vdDataFim) {
    Mensagem(Erro, "Data inicial não pode ser maior que final");
    Cancel(1);
  }
  
  @ 2. Consulta vendas no banco @
  vaSQL = "SELECT SUM(valor) as total FROM vendas WHERE data BETWEEN '" + 
          vdDataInicio + "' AND '" + vdDataFim + "'";
  
  SQL_Criar(vaSQL);
  SQL_Executar(vaSQL);
  
  @ 3. Processa resultado @
  Se (SQL_Proximo(vaSQL) = 1) {
    SQL_DefinirNumero(vaSQL, "total", vnTotalVendas);
    
    @ 4. Formata valores @
    IntParaAlfa(vnTotalVendas, vaTotalStr);
    
    @ 5. Calcula estatísticas @
    vnMediaDiaria = vnTotalVendas / 30;  @ Assumindo 30 dias @
    IntParaAlfa(vnMediaDiaria, vaMediaStr);
    
    @ 6. Monta relatório @
    vaRelatorio = "RELATÓRIO DE VENDAS" + #13 + #10 +
                  "Período: " + vdDataInicio + " a " + vdDataFim + #13 + #10 +
                  "Total: R$ " + vaTotalStr + #13 + #10 +
                  "Média diária: R$ " + vaMediaStr;
    
    Mensagem(Retorna, vaRelatorio);
  } Senao {
    Mensagem(Erro, "Nenhuma venda encontrada no período");
  }
  
  SQL_Fechar(vaSQL);
}
```

### **Cenário de Segurança: Validação de Senha**

```lsp
@ Sistema de validação de senha com critérios de segurança @
Definir Funcao validarSenha();

Funcao validarSenha(); {
  @ 1. Verifica se não é nulo @
  EstaNulo(vaSenha, vnEhNulo);
  Se (vnEhNulo = 1) {
    Mensagem(Erro, "Senha não pode ser nula");
    Cancel(1);
  }
  
  @ 2. Verifica tamanho mínimo @
  TamanhoAlfa(vaSenha, vnTamanho);
  Se (vnTamanho < 8) {
    Mensagem(Erro, "Senha deve ter pelo menos 8 caracteres");
    Cancel(1);
  }
  
  @ 3. Verifica se tem letra maiúscula @
  vnContador = 1;
  vnTemMaiuscula = 0;
  Enquanto (vnContador <= vnTamanho) {
    CopiarAlfa(vaSenha, vnContador, 1);
    Se (vaCaracter >= "A" E vaCaracter <= "Z") {
      vnTemMaiuscula = 1;
    }
    vnContador++;
  }
  
  Se (vnTemMaiuscula = 0) {
    Mensagem(Erro, "Senha deve conter pelo menos uma letra maiúscula");
    Cancel(1);
  }
  
  @ 4. Verifica se tem número @
  vaSenhaNumeros = vaSenha;  @ Faz cópia para não modificar original @
  DeixaNumeros(vaSenhaNumeros);
  TamanhoAlfa(vaSenhaNumeros, vnTamanhoNumeros);
  Se (vnTamanhoNumeros = 0) {
    Mensagem(Erro, "Senha deve conter pelo menos um número");
    Cancel(1);
  }
  
  @ 5. Verifica se tem caractere especial @
  PosicaoAlfa("!", vaSenha, vnPos);
  Se (vnPos = 0) {
    PosicaoAlfa("@", vaSenha, vnPos);
  }
  Se (vnPos = 0) {
    PosicaoAlfa("#", vaSenha, vnPos);
  }
  
  Se (vnPos = 0) {
    Mensagem(Erro, "Senha deve conter pelo menos um caractere especial (!@#)");
    Cancel(1);
  }
  
  Mensagem(Retorna, "Senha válida!");
}
```

---
