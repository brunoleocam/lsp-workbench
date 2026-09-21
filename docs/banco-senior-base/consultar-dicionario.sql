-- =============================================================================
-- Extrair dicionário Senior (R996/R998) para montar catalog.json local
-- (não versionar o resultado completo no git — ver README desta pasta)
--
-- 1. Execute o Bloco 1 no cliente SQL e exporte TSV → r996.tsv
-- 2. (Opcional) Bloco 2 para personalizados → r998.tsv
-- 3. Na raiz do monorepo:
--      node scripts/catalog-from-r996-tsv.mjs --in r996.tsv --out docs/banco-senior-base/catalog.json
--      node scripts/catalog-from-r996-tsv.mjs --in r998.tsv --merge docs/banco-senior-base/catalog.json
-- =============================================================================

-- Bloco 1 – Tabelas/campos padrão (R996)
SELECT
  TBL.TBLNAM,
  TBL.DESTBL,
  TBL.PKFLDS,
  FLD.FLDNAM,
  FLD.FLDORD,
  FLD.DATTYP,
  FLD.LENFLD,
  FLD.PREFLD,
  FLD.DESFLD
FROM R996TBL TBL
JOIN R996FLD FLD ON FLD.TBLNAM = TBL.TBLNAM
ORDER BY TBL.TBLNAM, FLD.FLDORD;

-- Bloco 2 – Tabelas/campos personalizados (R998) — overlay do cliente
SELECT
  TBL.TBLNAM,
  TBL.DESTBL,
  TBL.PKFLDS,
  FLD.FLDNAM,
  FLD.FLDORD,
  FLD.DATTYP,
  FLD.LENFLD,
  FLD.PREFLD,
  FLD.DESFLD
FROM R998TBL TBL
JOIN R998FLD FLD ON FLD.TBLNAM = TBL.TBLNAM
ORDER BY TBL.TBLNAM, FLD.FLDORD;
