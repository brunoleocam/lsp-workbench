@ smoke-sql — SQL001..SQL011 @
Definir Alfa vaSql;
Definir Numero vnId;
Definir Numero vnH;
Definir Alfa vaCur;
Definir Alfa vaNat;
Definir Alfa vaOrfao;
Definir Alfa vaJoin;
Definir Cursor Cur_Simples;
Definir Alfa vaCompleto;
Definir Alfa vaSenior;
Definir Alfa vaAgg;

@ SQL001: concat sem :bind — QF → :vnId @
vaSql = "SELECT * FROM E120PED WHERE NUMPED = " + vnId;

@ SQL004: SQL_Criar exige Alfa (vnH é Numero) — QF → Definir Alfa vaH + renomear @
SQL_Criar(vnH);

@ SQL002+SQL003+SQL005: Criar+Abrir sem DefinirComando/Fechar/Destruir (Destruir no final) @
SQL_Criar(vaCur);
SQL_AbrirCursor(vaCur);

@ SQL006: UsarSQLSenior2 depois de DefinirComando (deve ser antes) @
SQL_Criar(vaNat);
SQL_DefinirComando(vaNat, "SELECT 1 FROM DUAL");
SQL_UsarSQLSenior2(vaNat, 0);

@ SQL007: DefinirComando sem SQL_Criar — QF → SQL_Criar(vaOrfao); @
SQL_DefinirComando(vaOrfao, "SELECT 1 FROM DUAL");

@ SQL008: JOIN sem UsarAbrangencia(0)+UsarSQLSenior2(0) — QF → inserir Usar* @
SQL_Criar(vaJoin);
SQL_DefinirComando(vaJoin, "SELECT a.X FROM E070FIL a INNER JOIN E085HCL b ON a.CODEMP = b.CODEMP");

@ ========== SQL009a — Cursor SIMPLES (Definir Cursor Cur_Simples) ========== @
@ API correta: .SQL → .AbrirCursor → Enquanto(.Achou) → .Proximo → .FecharCursor @
@ NÃO usar: SQL_Criar / SQL_AbrirCursor / SQL_FecharCursor / SQL_Destruir @
@ Anti-padrão: SQL_* no handle de Cursor — QF preferido = esqueleto simples @
SQL_AbrirCursor(Cur_Simples);

@ ========== SQL009b — Cursor COMPLETO (Definir Alfa + SQL_Criar vaCompleto) ========== @
@ API correta: SQL_Criar → [Usar*] → DefinirComando → Abrir → EOF/Proximo → Fechar → Destruir @
@ NÃO usar: .AbrirCursor / .FecharCursor / .Achou / .SQL no Alfa de SQL_Criar @
@ Anti-padrão: .AbrirCursor no handle de SQL_Criar — QF preferido = esqueleto completo @
@ (SQL002/003/005 só depois de corrigir a API — não misturar QFs dos dois modos) @
SQL_Criar(vaCompleto);
vaCompleto.AbrirCursor();

@ SQL010: TO_DATE em Senior 2 — QF → STRTODATE @
SQL_Criar(vaSenior);
SQL_DefinirComando(vaSenior, "SELECT * FROM E070FIL WHERE DATALT = TO_DATE('01/01/2024')");

@ SQL011: COUNT no SELECT em Senior 2 — QF → Usar* nativo @
SQL_Criar(vaAgg);
SQL_DefinirComando(vaAgg, "SELECT COUNT(CODIGO) FROM E070FIL");
