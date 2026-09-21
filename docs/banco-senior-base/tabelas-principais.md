# Tabelas principais (starter — padrão Senior)

Lista mínima para o catálogo público. Amplie conforme documentação Senior / necessidade da comunidade.
**Sem** tabelas `USU_*` de cliente.

| Tabela | Descrição | Chaves típicas | Campos típicos |
|--------|-----------|----------------|----------------|
| E012FAM | Cadastros — Famílias de produto | CodEmp, CodFam | DesFam, TipPro |
| E073TRA | Transportadoras | CodTra | NomTra |
| E074CID | Cidades | CodCid | NomCid, EstCid |
| E075PRO | Produtos | CodPro | DesPro |
| E085CLI | Clientes | CodCli | NomCli, CgcCpf |
| E120PED | Pedidos | CodEmp, CodFil, NumPed | — |
| R034FUN | Colaboradores (HCM) | NumEmp, TipCol, NumCad | NomFun |
| R074CID | Cidades (HCM) | CodCid | NomCid, EstCid |
| R074BAI | Bairros (HCM) | CodCid, CodBai | NomBai, CepBai |
