# LSP Workbench — conteúdo Demóbile (privado)

O pacote **LSP Workbench Demóbile** (`packages/lsp-workbench-demobile/`) e as pastas `docs/banco-senior/` e `docs/senior/` **não são versionados** neste repositório público (ver `.gitignore`).

Eles existem só na máquina / repositório interno Demóbile e são instalados localmente:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install-demobile-plugin.ps1
```

O plugin Demóbile complementa **LSP Workbench** (extensão) + **LSP Workbench Agent** (plugin Cursor público).

## Bridge para a IDE (PDR-007)

Contrato do catálogo gerado (arquivo **local/gitignored**, sem dados neste repo público):

```json
{
  "version": 1,
  "generatedAt": "ISO-8601",
  "tables": [
    {
      "name": "E120PED",
      "columns": [{ "name": "CODIGO", "type": "NUMBER" }]
    }
  ],
  "enums": []
}
```

- Script gerador: `scripts/build-demobile-catalog.mjs` (quando implementado)
- Path default sugerido: `docs/banco-senior/.generated/catalog.json`
- Extensão: setting `lsp.demobile.catalogPath` — se o arquivo não existir, no-op
