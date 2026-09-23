# Media — Marketplace / README

Capturas usadas em:

- [`../README.md`](../README.md) (VS Marketplace)
- [`../../../README.md`](../../../README.md) (GitHub)

## Marketplace (obrigatório)

O VS Marketplace reescreve paths relativos a partir da **raiz do repositório GitHub**, não da pasta da extensão. Em monorepo, `media/foo.png` vira `…/raw/HEAD/media/foo.png` → **404**.

No README da extensão, use URL absoluta:

```text
https://raw.githubusercontent.com/brunoleocam/lsp-workbench/main/packages/lsp-workbench/media/<arquivo>
```

O README da raiz do monorepo pode continuar com path relativo `packages/lsp-workbench/media/…` (GitHub resolve a partir da raiz).

## Arquivos publicados no README

| Arquivo | Uso |
|---------|-----|
| `01-syntax-highlighting.png` | Highlight |
| `02-autocomplete.png` | Completion |
| `03-hover.png` | Hover |
| `04-signature-help.png` | Signature help |
| `05-membros-lista.png` | Membros Lista/Cursor |
| `06-catalog-autocomplete.png` | Catálogo local |
| `07-diagnostics.png` | Diagnósticos |
| `08-validation.gif` | GIF validação + quick fix |

Frames fonte do GIF (opcional manter): `08-validation-1.png` … `08-validation-4.png`.

Exemplos `.lsp` para recriar prints: [`exemplos/`](exemplos/).

## Regenerar o GIF

```powershell
pip install pillow
python -c "
from PIL import Image
from pathlib import Path
m = Path(r'packages/lsp-workbench/media')
frames = [Image.open(m / f'08-validation-{i}.png').convert('RGB') for i in range(1,5)]
frames[0].save(m/'08-validation.gif', save_all=True, append_images=frames[1:],
               duration=[1200,1200,1400,1800], loop=0, optimize=True)
"
```
