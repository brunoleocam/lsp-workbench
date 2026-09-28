/**
 * Copia rules/skills/commands do agent para o pacote da extensão.
 * O VSIX usa essa pasta no comando Configurar este Workspace.
 *
 *   node scripts/prepare-agent-scaffold.mjs
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const src = path.join(root, "packages", "lsp-workbench-agent");
const dest = path.join(root, "packages", "lsp-workbench", "scaffold");

fs.rmSync(dest, { recursive: true, force: true });
for (const folder of ["rules", "skills", "commands"]) {
  fs.cpSync(path.join(src, folder), path.join(dest, folder), { recursive: true });
}
console.log("Scaffold do agent copiado para packages/lsp-workbench/scaffold/");
