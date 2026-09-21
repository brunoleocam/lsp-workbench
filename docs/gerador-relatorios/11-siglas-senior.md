# 11 — Siglas Sênior (categorias de relatório)

Árvore de **siglas de módulo** usadas na Senior (Sapiens) para organizar menus e, no Gerador de Relatórios, a **categoria** do modelo.

## Como ler o código

Convenção típica do nome de arquivo: `CCCCNNN.GER`, onde:

| Parte | Exemplo (`RDCG183`) | Significado |
|-------|---------------------|-------------|
| Prefixo (4 letras) | `RDCG` | Módulo + assunto (ex.: `RD` Distribuição + `CG` Cargas) |
| Número | `183` | Código único dentro da categoria |

Hierarquia nesta árvore:

1. **Área** — letra inicial (`R` Mercado, `S` Suprimentos, …)
2. **Módulo** — duas letras (`RV`, `RD`, `SC`, …)
3. **Assunto** — duas letras; o código completo é **módulo + assunto** (`RV` + `OR` → `RVOR`)

A **categoria** informada ao criar o modelo no gerador costuma ser esse código de 4 letras (ou o recorte que o sistema expõe no menu).

## R — Mercado

### RV — Vendas

| Assunto | Descrição | Código |
|---------|-----------|--------|
| OR | Orçamentos | `RVOR` |
| PE | Pedidos | `RVPE` |
| TR | Contratos | `RVTR` |
| CM | Controle de Metas | `RVCM` |

### RD — Distribuição

| Assunto | Descrição | Código |
|---------|-----------|--------|
| CG | Cargas | `RDCG` |
| AC | Acertos | `RDAC` |

### RF — Faturamento

| Assunto | Descrição | Código |
|---------|-----------|--------|
| EX | Expedição | `RFEX` |
| NF | Notas Fiscais de Saída | `RFNF` |

### RR — CRM

| Assunto | Descrição | Código |
|---------|-----------|--------|
| CA | Controle de Atendimento | `RRCA` |

## S — Suprimentos

### SC — Compras

| Assunto | Descrição | Código |
|---------|-----------|--------|
| SC | Solicitações de Compra | `SCSC` |
| OC | Ordens de Compra | `SCOC` |
| TR | Contratos | `SCTR` |

### SR — Recebimento

| Assunto | Descrição | Código |
|---------|-----------|--------|
| NF | Notas Fiscais de Entrada | `SRNF` |

### SE — Estoques

| Assunto | Descrição | Código |
|---------|-----------|--------|
| CE | Controle de Estoque | `SECE` |
| RE | Requisição Eletrônica | `SERE` |
| AR | Análise de Reposição | `SEAR` |
| IV | Inventário | `SEIV` |

## F — Finanças

### FP — Contas a Pagar

| Assunto | Descrição | Código |
|---------|-----------|--------|
| CP | Contas a Pagar | `FPCP` |
| MI | Comissões | `FPMI` |
| PE | Pagamento Eletrônico | `FPPE` |

### FR — Contas a Receber

| Assunto | Descrição | Código |
|---------|-----------|--------|
| CR | Contas a Receber | `FRCR` |
| ES | Cobrança Escritural | `FRES` |

### FT — Tesouraria

| Assunto | Descrição | Código |
|---------|-----------|--------|
| CB | Caixa e Bancos | `FTCB` |
| AF | Aplicação e Financiamento | `FTAF` |
| FC | Fluxo de Caixa | `FTFC` |
| ON | Conciliação | `FTON` |

### FF — Plano Financeiro

| Assunto | Descrição | Código |
|---------|-----------|--------|
| OR | Orçamentos | `FFOR` |
| CC | Controle de Contas Financeiras | `FFCC` |
| FC | Fluxo de Caixa Gerencial | `FFFC` |

## C — Controladoria

### CC — Contabilidade

| Assunto | Descrição | Código |
|---------|-----------|--------|
| CC | Contábeis | `CCCC` |
| CO | Operacionais | `CCCO` |
| CG | Gerenciais | `CCCG` |
| CL | Colômbia | `CCCL` |
| MM | Contabilidade Multimoeda | `CCMM` |
| SP | Arquivos Fiscais | `CCSP` |
| VC | Visões Contábeis | `CCVC` |

### CI — Tributos

| Assunto | Descrição | Código |
|---------|-----------|--------|
| EI | Livros de Inventário de Estoques | `CIEI` |
| ES | Livros de Saída | `CIES` |
| EE | Livros de Entrada | `CIEE` |
| EA | Livros de Apuração | `CIAE` |
| ER | Livros de Serviços | `CIER` |
| EM | Livros de Movimentação | `CIEM` |
| EF | Livros para Autenticações Fiscais | `CIEF` |
| ET | Termos de Abertura/Encerramento | `CIET` |
| EX | Específicos | `CIEX` |
| EO | Colômbia | `CIEO` |
| CI | CIAP | `CICI` |
| OD | Declarações | `CIOD` |
| OR | Guias de Recolhimento | `CIOR` |
| OO | Operacionais | `CIOO` |
| AE | Arquivos Eletrônicos | `CIAE` |
| AM | Arquivos Eletrônicos Municipais 1 | `CIAM` |
| M2 | Arquivos Eletrônicos Municipais 2 | `CIM2` |
| SO | EFD - Reinf | `CISO` |

> **Nota:** na fonte original, `EA` (Livros de Apuração) e `AE` (Arquivos Eletrônicos) constam ambos como `CIAE`. Confirme no menu/ambiente Senior qual código prevalece para cada assunto (o padrão módulo+assunto sugeriria `CIEA` para `EA`).

### CP — Patrimônio

| Assunto | Descrição | Código |
|---------|-----------|--------|
| BE | Controle dos Bens | `CPBE` |
| AT | Atualização Patrimonial | `CPAT` |
| IV | Inventário Patrimonial | `CPIV` |

## M — Manufatura

### ME — Engenharia

| Assunto | Descrição | Código |
|---------|-----------|--------|
| CO | Composição Produto/Serviço (Modelo) | `MECO` |
| BI | Combinações | `MEBI` |
| RP | Roteiro de Produção | `MERP` |
| DU | Duplicação de Roteiro/Modelo | `MEDU` |
| FE | Ferramentas | `MEFE` |

### MP — PCP

| Assunto | Descrição | Código |
|---------|-----------|--------|
| CR | Carga de Recursos da Produção | `MPCR` |
| NE | Necessidades de Produção/Compra (MRP) | `MPNE` |
| OP | Ordens de Produção/Serviço | `MPOP` |
| MO | Manutenção de OP/OS | `MPMO` |
| AD | Análise de Disponibilidade de Componentes | `MPAD` |
| LP | Cancelamento de Produção | `MPLP` |

### MC — Chão de Fábrica

| Assunto | Descrição | Código |
|---------|-----------|--------|
| AP | Apontamentos de OP/OS | `MCAP` |
| MM | Manutenção de Movimentos | `MCMM` |
| SS | Separação de Componentes Depósito | `MCSS` |
| RR | Remessa/Retorno Serviço Terceiros | `MCRR` |
| CO | Componentes (OP/OS) | `MCCO` |

## U — Custos

### UI — Preço para Indústria

| Assunto | Descrição | Código |
|---------|-----------|--------|
| FP | Formação de Preços | `UIFP` |
| AD | Análises de Desempenho | `UIAD` |

### UT — Contabilidade de Custos

| Assunto | Descrição | Código |
|---------|-----------|--------|
| CC | Custo Integrado | `UTCC` |
| UA | Custo Não Integrado | `UTUA` |
| AD | Análises de Desempenho | `UTAD` |

## V — Serviços

### VM — Manutenção

| Assunto | Descrição | Código |
|---------|-----------|--------|
| ME | Manutenção de Equipamentos | `VMME` |

### VA — Assistência Técnica

| Assunto | Descrição | Código |
|---------|-----------|--------|
| AT | Assistência Técnica e Garantias | `VAAT` |

## Q — Qualidade

### QQ — SGQ

| Assunto | Descrição | Código |
|---------|-----------|--------|
| DC | Controle de Documentos | `QQDC` |
| RG | Registros | `QQRG` |
| IN | Inspeções | `QQIN` |
| AF | Avaliação de Fornecedores | `QQAF` |

## W — Web

### WW — Web 5.0

| Assunto | Descrição | Código |
|---------|-----------|--------|
| EB | Sapiens WEB 5.0 | `WWEB` |

## D — Cadastros

### DS — Assuntos

| Assunto | Descrição | Código |
|---------|-----------|--------|
| GE | Gerais | `DSGE` |
| EF | Empresas e Filiais | `DSEF` |
| US | Usuários | `DSUS` |
| TR | Transações | `DSTR` |
| PS | Produtos e Serviços | `DSPS` |
| CF | Clientes, Fornecedores e Representantes | `DSCF` |
| MP | Modelos de Planos | `DSMP` |

### DA — Áreas

| Assunto | Descrição | Código |
|---------|-----------|--------|
| MS | Mercado e Suprimentos | `DAMS` |
| FI | Finanças | `DAFI` |
| CT | Controladoria | `DACT` |
| VM | Manufatura e Serviços | `DAVM` |
| US | Custos | `DAUS` |
| QL | Qualidade | `DAQL` |

## Índice rápido (código → caminho)

Útil ao abrir um `.GER` / projeto e interpretar a categoria.

| Código | Área › Módulo › Assunto |
|--------|-------------------------|
| `RVOR` | Mercado › Vendas › Orçamentos |
| `RVPE` | Mercado › Vendas › Pedidos |
| `RVTR` | Mercado › Vendas › Contratos |
| `RVCM` | Mercado › Vendas › Controle de Metas |
| `RDCG` | Mercado › Distribuição › Cargas |
| `RDAC` | Mercado › Distribuição › Acertos |
| `RFEX` | Mercado › Faturamento › Expedição |
| `RFNF` | Mercado › Faturamento › Notas Fiscais de Saída |
| `RRCA` | Mercado › CRM › Controle de Atendimento |
| `SCSC` | Suprimentos › Compras › Solicitações de Compra |
| `SCOC` | Suprimentos › Compras › Ordens de Compra |
| `SCTR` | Suprimentos › Compras › Contratos |
| `SRNF` | Suprimentos › Recebimento › Notas Fiscais de Entrada |
| `SECE` | Suprimentos › Estoques › Controle de Estoque |
| `SERE` | Suprimentos › Estoques › Requisição Eletrônica |
| `SEAR` | Suprimentos › Estoques › Análise de Reposição |
| `SEIV` | Suprimentos › Estoques › Inventário |
| `FPCP` | Finanças › Contas a Pagar › Contas a Pagar |
| `FPMI` | Finanças › Contas a Pagar › Comissões |
| `FPPE` | Finanças › Contas a Pagar › Pagamento Eletrônico |
| `FRCR` | Finanças › Contas a Receber › Contas a Receber |
| `FRES` | Finanças › Contas a Receber › Cobrança Escritural |
| `FTCB` | Finanças › Tesouraria › Caixa e Bancos |
| `FTAF` | Finanças › Tesouraria › Aplicação e Financiamento |
| `FTFC` | Finanças › Tesouraria › Fluxo de Caixa |
| `FTON` | Finanças › Tesouraria › Conciliação |
| `FFOR` | Finanças › Plano Financeiro › Orçamentos |
| `FFCC` | Finanças › Plano Financeiro › Controle de Contas Financeiras |
| `FFFC` | Finanças › Plano Financeiro › Fluxo de Caixa Gerencial |
| `CCCC` | Controladoria › Contabilidade › Contábeis |
| `CCCO` | Controladoria › Contabilidade › Operacionais |
| `CCCG` | Controladoria › Contabilidade › Gerenciais |
| `CCCL` | Controladoria › Contabilidade › Colômbia |
| `CCMM` | Controladoria › Contabilidade › Contabilidade Multimoeda |
| `CCSP` | Controladoria › Contabilidade › Arquivos Fiscais |
| `CCVC` | Controladoria › Contabilidade › Visões Contábeis |
| `CIEI` | Controladoria › Tributos › Livros de Inventário de Estoques |
| `CIES` | Controladoria › Tributos › Livros de Saída |
| `CIEE` | Controladoria › Tributos › Livros de Entrada |
| `CIAE` | Controladoria › Tributos › Livros de Apuração **ou** Arquivos Eletrônicos (ver nota) |
| `CIER` | Controladoria › Tributos › Livros de Serviços |
| `CIEM` | Controladoria › Tributos › Livros de Movimentação |
| `CIEF` | Controladoria › Tributos › Livros para Autenticações Fiscais |
| `CIET` | Controladoria › Tributos › Termos de Abertura/Encerramento |
| `CIEX` | Controladoria › Tributos › Específicos |
| `CIEO` | Controladoria › Tributos › Colômbia |
| `CICI` | Controladoria › Tributos › CIAP |
| `CIOD` | Controladoria › Tributos › Declarações |
| `CIOR` | Controladoria › Tributos › Guias de Recolhimento |
| `CIOO` | Controladoria › Tributos › Operacionais |
| `CIAM` | Controladoria › Tributos › Arquivos Eletrônicos Municipais 1 |
| `CIM2` | Controladoria › Tributos › Arquivos Eletrônicos Municipais 2 |
| `CISO` | Controladoria › Tributos › EFD - Reinf |
| `CPBE` | Controladoria › Patrimônio › Controle dos Bens |
| `CPAT` | Controladoria › Patrimônio › Atualização Patrimonial |
| `CPIV` | Controladoria › Patrimônio › Inventário Patrimonial |
| `MECO` | Manufatura › Engenharia › Composição Produto/Serviço (Modelo) |
| `MEBI` | Manufatura › Engenharia › Combinações |
| `MERP` | Manufatura › Engenharia › Roteiro de Produção |
| `MEDU` | Manufatura › Engenharia › Duplicação de Roteiro/Modelo |
| `MEFE` | Manufatura › Engenharia › Ferramentas |
| `MPCR` | Manufatura › PCP › Carga de Recursos da Produção |
| `MPNE` | Manufatura › PCP › Necessidades de Produção/Compra (MRP) |
| `MPOP` | Manufatura › PCP › Ordens de Produção/Serviço |
| `MPMO` | Manufatura › PCP › Manutenção de OP/OS |
| `MPAD` | Manufatura › PCP › Análise de Disponibilidade de Componentes |
| `MPLP` | Manufatura › PCP › Cancelamento de Produção |
| `MCAP` | Manufatura › Chão de Fábrica › Apontamentos de OP/OS |
| `MCMM` | Manufatura › Chão de Fábrica › Manutenção de Movimentos |
| `MCSS` | Manufatura › Chão de Fábrica › Separação de Componentes Depósito |
| `MCRR` | Manufatura › Chão de Fábrica › Remessa/Retorno Serviço Terceiros |
| `MCCO` | Manufatura › Chão de Fábrica › Componentes (OP/OS) |
| `UIFP` | Custos › Preço para Indústria › Formação de Preços |
| `UIAD` | Custos › Preço para Indústria › Análises de Desempenho |
| `UTCC` | Custos › Contabilidade de Custos › Custo Integrado |
| `UTUA` | Custos › Contabilidade de Custos › Custo Não Integrado |
| `UTAD` | Custos › Contabilidade de Custos › Análises de Desempenho |
| `VMME` | Serviços › Manutenção › Manutenção de Equipamentos |
| `VAAT` | Serviços › Assistência Técnica › Assistência Técnica e Garantias |
| `QQDC` | Qualidade › SGQ › Controle de Documentos |
| `QQRG` | Qualidade › SGQ › Registros |
| `QQIN` | Qualidade › SGQ › Inspeções |
| `QQAF` | Qualidade › SGQ › Avaliação de Fornecedores |
| `WWEB` | Web › Web 5.0 › Sapiens WEB 5.0 |
| `DSGE` | Cadastros › Assuntos › Gerais |
| `DSEF` | Cadastros › Assuntos › Empresas e Filiais |
| `DSUS` | Cadastros › Assuntos › Usuários |
| `DSTR` | Cadastros › Assuntos › Transações |
| `DSPS` | Cadastros › Assuntos › Produtos e Serviços |
| `DSCF` | Cadastros › Assuntos › Clientes, Fornecedores e Representantes |
| `DSMP` | Cadastros › Assuntos › Modelos de Planos |
| `DAMS` | Cadastros › Áreas › Mercado e Suprimentos |
| `DAFI` | Cadastros › Áreas › Finanças |
| `DACT` | Cadastros › Áreas › Controladoria |
| `DAVM` | Cadastros › Áreas › Manufatura e Serviços |
| `DAUS` | Cadastros › Áreas › Custos |
| `DAQL` | Cadastros › Áreas › Qualidade |

## Relação com o estudo de caso

O export [09-estudo-caso-rdcg183.md](09-estudo-caso-rdcg183.md) usa categoria `RDCG` → Mercado › Distribuição › Cargas.

Voltar: [01-visao-geral.md](01-visao-geral.md) · [README](README.md)
