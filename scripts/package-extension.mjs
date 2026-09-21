#!/usr/bin/env node
/**
 * Empacota o VSIX com analyzer vendored (evita junction file: que quebra o vsce).
 * Uso: node scripts/package-extension.mjs
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const analyzerDir = path.join(root, "packages", "lsp-analyzer");
const extDir = path.join(root, "packages", "lsp-workbench");
const pkgPath = path.join(extDir, "package.json");

function run(cmd, cwd) {
  console.log(`> ${cmd}`);
  execSync(cmd, { cwd, stdio: "inherit", shell: true });
}

const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
const originalDep = pkg.dependencies["@lsp-workbench/analyzer"];

try {
  run("npm run compile", analyzerDir);
  run("npm pack", analyzerDir);
  const analyzerPkg = JSON.parse(
    fs.readFileSync(path.join(analyzerDir, "package.json"), "utf8")
  );
  const tgz = path.join(
    analyzerDir,
    `lsp-workbench-analyzer-${analyzerPkg.version}.tgz`
  );
  if (!fs.existsSync(tgz)) {
    throw new Error(`Tarball não encontrado: ${tgz}`);
  }

  pkg.dependencies["@lsp-workbench/analyzer"] = `file:${tgz.replace(/\\/g, "/")}`;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

  run(`npm install "${tgz}"`, extDir);
  run("npm run vscode:prepublish", extDir);
  run("npx --yes @vscode/vsce package", extDir);
  console.log("VSIX gerado em packages/lsp-workbench/");
} finally {
  pkg.dependencies["@lsp-workbench/analyzer"] = originalDep || "file:../lsp-analyzer";
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  run("npm install", extDir);
  for (const f of fs.readdirSync(analyzerDir)) {
    if (f.endsWith(".tgz")) fs.unlinkSync(path.join(analyzerDir, f));
  }
}
