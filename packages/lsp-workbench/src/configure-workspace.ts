import * as fs from "node:fs";
import * as path from "node:path";
import * as vscode from "vscode";
import {
  mergeFileAssociations,
  partitionScaffold,
  planWorkspaceScaffold,
  type PlannedFile,
  type ScaffoldSourceFile,
} from "./domain/workspace-scaffold";

export function resolveTemplateRoot(extensionPath: string): string | undefined {
  const bundled = path.join(extensionPath, "scaffold");
  if (fs.existsSync(path.join(bundled, "rules"))) return bundled;
  const sibling = path.join(extensionPath, "..", "lsp-workbench-agent");
  if (fs.existsSync(path.join(sibling, "rules"))) return sibling;
  return undefined;
}

function walkFiles(dir: string, prefix: string): ScaffoldSourceFile[] {
  const out: ScaffoldSourceFile[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    const rel = `${prefix}/${entry.name}`;
    if (entry.isDirectory()) {
      out.push(...walkFiles(abs, rel));
    } else if (entry.isFile()) {
      out.push({ path: rel, contents: fs.readFileSync(abs, "utf8") });
    }
  }
  return out;
}

function loadTemplates(templateRoot: string): ScaffoldSourceFile[] {
  const sources: ScaffoldSourceFile[] = [];
  for (const folder of ["rules", "skills", "commands"]) {
    const dir = path.join(templateRoot, folder);
    if (fs.existsSync(dir)) sources.push(...walkFiles(dir, folder));
  }
  return sources;
}

function workspaceRoot(): string | undefined {
  return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
}

async function ensureFileAssociations(): Promise<boolean> {
  const cfg = vscode.workspace.getConfiguration();
  const inspected = cfg.inspect<Record<string, string>>("files.associations");
  const merged = mergeFileAssociations(inspected?.workspaceValue);
  if (!merged.changed) return false;
  await cfg.update("files.associations", merged.value, vscode.ConfigurationTarget.Workspace);
  return true;
}

function writePlanned(root: string, files: PlannedFile[]): void {
  for (const file of files) {
    const abs = path.join(root, ...file.path.split("/"));
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, file.contents, "utf8");
  }
}

export function registerConfigureWorkspace(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand("lspWorkbench.configureWorkspace", () =>
      configureWorkspace(context.extensionPath)
    )
  );
}

export async function configureWorkspace(extensionPath: string): Promise<void> {
  const root = workspaceRoot();
  if (!root) {
    void vscode.window.showWarningMessage("Abra uma pasta de workspace antes de configurar o LSP Workbench.");
    return;
  }
  const templateRoot = resolveTemplateRoot(extensionPath);
  if (!templateRoot) {
    void vscode.window.showErrorMessage(
      "Templates do agent não encontrados. Reinstale a extensão LSP Workbench."
    );
    return;
  }

  const planned = planWorkspaceScaffold(loadTemplates(templateRoot));
  const partition = partitionScaffold(planned, (relativePath) => {
    const abs = path.join(root, ...relativePath.split("/"));
    if (!fs.existsSync(abs)) return null;
    return fs.readFileSync(abs, "utf8");
  });

  let toWrite = partition.create;
  if (partition.conflict.length > 0) {
    const preview = partition.conflict
      .slice(0, 12)
      .map((file) => file.path)
      .join("\n");
    const choice = await vscode.window.showWarningMessage(
      "Alguns arquivos do LSP Workbench já existem e são diferentes. Substituir?",
      { modal: true, detail: preview },
      "Substituir"
    );
    if (choice === "Substituir") {
      toWrite = [...partition.create, ...partition.conflict];
    }
  }

  writePlanned(root, toWrite);
  const settingsChanged = await ensureFileAssociations();

  if (toWrite.length === 0 && !settingsChanged) {
    void vscode.window.showInformationMessage("Este workspace já está configurado para o LSP Workbench.");
    return;
  }

  const parts = [`${toWrite.length} arquivo(s) em .cursor e .github`];
  if (settingsChanged) {
    parts.push("associações *.lsp e *.lspt em .vscode/settings.json");
  }
  void vscode.window.showInformationMessage(`Workspace configurado: ${parts.join("; ")}.`);
}
