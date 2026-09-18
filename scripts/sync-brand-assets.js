/**
 * Regenera /assets/icon.png e /assets/logo.svg a partir do JPG fonte.
 * Nao cria pastas em packages — marca fica so em /assets.
 */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const root = String.raw`c:\Dev\Documentacao-LSP-Linguagem-Senior-de-Programacao`;
const brandDir = path.join(root, "assets");
const srcJpg = path.join(brandDir, "brand-source.jpg");
const fallbackJpg = String.raw`C:\Users\TI09.DEMOBILE\AppData\Local\Temp\lsp-logo-src.jpg`;

(async () => {
  const src = fs.existsSync(srcJpg) ? srcJpg : fallbackJpg;
  if (!fs.existsSync(src)) {
    throw new Error("Fonte nao encontrada: assets/brand-source.jpg");
  }

  fs.mkdirSync(brandDir, { recursive: true });
  const icon512 = await sharp(src).resize(512, 512).png().toBuffer();
  fs.writeFileSync(path.join(brandDir, "icon.png"), icon512);
  if (src !== srcJpg) {
    fs.copyFileSync(src, srcJpg);
  }

  const b64 = icon512.toString("base64");
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     width="512" height="512" viewBox="0 0 512 512"
     role="img" aria-label="LSP Workbench">
  <title>LSP Workbench</title>
  <image width="512" height="512"
         href="data:image/png;base64,${b64}"
         xlink:href="data:image/png;base64,${b64}"/>
</svg>
`;
  fs.writeFileSync(path.join(brandDir, "logo.svg"), svg);
  console.log("OK — apenas", brandDir);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
