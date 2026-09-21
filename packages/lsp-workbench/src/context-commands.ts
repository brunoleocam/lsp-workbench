/**
 * Comandos de contexto e escopo (PDR-003).
 */

import * as vscode from "vscode";
import * as path from "path";
import { getWorkspaceSymbolIndex } from "./workspace-symbol-index";
import type { LspContextConfig, SymbolScopeMode } from "./scope-config";
import { SENIOR_LSP_LANGUAGE_ID } from "./language";

const SYSTEMS = ["", "HCM", "ACESSO", "ERP"] as const;

async function updateContexts(mutator: (contexts: LspContextConfig[]) => LspContextConfig[]): Promise<void> {
  const cfg = vscode.workspace.getConfiguration("lsp");
  const current = cfg.get<LspContextConfig[]>("contexts", []) ?? [];
  const next = mutator([...current]);
  await cfg.update("contexts", next, vscode.ConfigurationTarget.Workspace);
  getWorkspaceSymbolIndex().refreshCandidates();
  getWorkspaceSymbolIndex().invalidate();
}

export function registerContextCommands(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand("lspWorkbench.createContext", async () => {
      const name = await vscode.window.showInputBox({
        prompt: "Nome do contexto",
        placeHolder: "HR",
      });
      if (!name) return;

      const rootDir = await vscode.window.showInputBox({
        prompt: "Pasta raiz (relativa ao workspace)",
        placeHolder: "HR",
        value: name,
      });
      if (rootDir === undefined) return;

      const filePattern = await vscode.window.showInputBox({
        prompt: "Padrão de arquivos (glob ou re:…)",
        value: "**/*.{lsp,lspt}",
      });
      if (filePattern === undefined) return;

      const systemPick = await vscode.window.showQuickPick(
        [
          { label: "(nenhum — só SENIOR)", description: "" },
          { label: "HCM", description: "HCM" },
          { label: "ACESSO", description: "ACESSO" },
          { label: "ERP", description: "ERP" },
        ],
        { title: "Sistema adicional" }
      );

      await updateContexts((contexts) => {
        contexts.push({
          name,
          rootDir: rootDir || ".",
          filePattern: filePattern || "**/*.{lsp,lspt}",
          includeSubdirectories: true,
          system: systemPick?.description || undefined,
        });
        return contexts;
      });
      void vscode.window.showInformationMessage(`Contexto '${name}' criado.`);
    }),

    vscode.commands.registerCommand("lspWorkbench.editContext", async () => {
      const cfg = vscode.workspace.getConfiguration("lsp");
      const contexts = cfg.get<LspContextConfig[]>("contexts", []) ?? [];
      if (!contexts.length) {
        void vscode.window.showWarningMessage("Nenhum contexto configurado.");
        return;
      }
      const pick = await vscode.window.showQuickPick(
        contexts.map((c) => ({
          label: c.name,
          description: `${c.rootDir} · ${c.filePattern}`,
          ctx: c,
        })),
        { title: "Editar contexto" }
      );
      if (!pick) return;

      const action = await vscode.window.showQuickPick(
        [
          { label: "Abrir settings.json do workspace", id: "settings" },
          { label: "Abrir arquivo membro…", id: "file" },
        ],
        { title: `Contexto ${pick.label}` }
      );
      if (!action) return;

      if (action.id === "settings") {
        await vscode.commands.executeCommand("workbench.action.openWorkspaceSettingsFile");
        return;
      }

      const folder = vscode.workspace.workspaceFolders?.[0];
      if (!folder) return;
      const pattern = new vscode.RelativePattern(
        path.join(folder.uri.fsPath, pick.ctx.rootDir),
        pick.ctx.filePattern.startsWith("re:") ? "*" : pick.ctx.filePattern
      );
      try {
        const files = await vscode.workspace.findFiles(pattern, null, 50);
        const filePick = await vscode.window.showQuickPick(
          files.map((u) => ({ label: path.basename(u.fsPath), description: u.fsPath, uri: u })),
          { title: "Abrir arquivo do contexto" }
        );
        if (filePick) await vscode.window.showTextDocument(filePick.uri);
      } catch {
        void vscode.window.showWarningMessage("Não foi possível listar arquivos do contexto.");
      }
    }),

    vscode.commands.registerCommand("lspWorkbench.removeContext", async () => {
      const cfg = vscode.workspace.getConfiguration("lsp");
      const contexts = cfg.get<LspContextConfig[]>("contexts", []) ?? [];
      if (!contexts.length) {
        void vscode.window.showWarningMessage("Nenhum contexto configurado.");
        return;
      }
      const pick = await vscode.window.showQuickPick(
        contexts.map((c) => ({ label: c.name, description: c.rootDir })),
        { title: "Apagar contexto" }
      );
      if (!pick) return;
      await updateContexts((list) => list.filter((c) => c.name !== pick.label));
      void vscode.window.showInformationMessage(`Contexto '${pick.label}' apagado.`);
    }),

    vscode.commands.registerCommand("lspWorkbench.addToContext", async () => {
      const editor = vscode.window.activeTextEditor;
      const cfg = vscode.workspace.getConfiguration("lsp");
      const contexts = cfg.get<LspContextConfig[]>("contexts", []) ?? [];
      if (!contexts.length) {
        void vscode.window.showWarningMessage("Crie um contexto antes.");
        return;
      }
      const pick = await vscode.window.showQuickPick(
        contexts.map((c) => ({ label: c.name, ctx: c })),
        { title: "Adicionar ao contexto" }
      );
      if (!pick) return;

      const folder = vscode.workspace.workspaceFolders?.[0];
      if (!folder || !editor) {
        void vscode.window.showWarningMessage("Abra um arquivo LSP no workspace.");
        return;
      }
      const rel = path.relative(folder.uri.fsPath, editor.document.uri.fsPath).replace(/\\/g, "/");
      await updateContexts((list) =>
        list.map((c) => {
          if (c.name !== pick.label) return c;
          const files = [...(c.files ?? []), rel];
          return { ...c, files: [...new Set(files)] };
        })
      );
      void vscode.window.showInformationMessage(`'${rel}' adicionado a '${pick.label}'.`);
    }),

    vscode.commands.registerCommand("lspWorkbench.removeFromContext", async () => {
      const editor = vscode.window.activeTextEditor;
      const cfg = vscode.workspace.getConfiguration("lsp");
      const contexts = cfg.get<LspContextConfig[]>("contexts", []) ?? [];
      const folder = vscode.workspace.workspaceFolders?.[0];
      if (!folder || !editor) return;
      const rel = path.relative(folder.uri.fsPath, editor.document.uri.fsPath).replace(/\\/g, "/");

      const withFile = contexts.filter((c) => (c.files ?? []).includes(rel));
      if (!withFile.length) {
        void vscode.window.showWarningMessage("Arquivo não está na allowlist de nenhum contexto.");
        return;
      }
      const pick = await vscode.window.showQuickPick(
        withFile.map((c) => ({ label: c.name })),
        { title: "Remover do contexto" }
      );
      if (!pick) return;
      await updateContexts((list) =>
        list.map((c) => {
          if (c.name !== pick.label) return c;
          return { ...c, files: (c.files ?? []).filter((f) => f !== rel) };
        })
      );
      void vscode.window.showInformationMessage(`'${rel}' removido de '${pick.label}'.`);
    }),

    vscode.commands.registerCommand("lspWorkbench.toggleSymbolScope", async () => {
      const cfg = vscode.workspace.getConfiguration("lsp");
      const current = cfg.get<SymbolScopeMode>("symbols.scope", "project");
      const pick = await vscode.window.showQuickPick(
        [
          { label: "Projeto", description: "project", mode: "project" as const },
          { label: "Arquivo", description: "file", mode: "file" as const },
          { label: "Misto", description: "mixed", mode: "mixed" as const },
        ],
        {
          title: `Escopo atual: ${current}`,
        }
      );
      if (!pick) return;
      await cfg.update("symbols.scope", pick.mode, vscode.ConfigurationTarget.Workspace);
      getWorkspaceSymbolIndex().invalidate();
      void vscode.window.showInformationMessage(`Escopo de símbolos: ${pick.label}`);
    }),

    vscode.commands.registerCommand("lspWorkbench.selectFallbackSystem", async () => {
      const pick = await vscode.window.showQuickPick(
        SYSTEMS.map((s) => ({
          label: s || "(nenhum — só SENIOR)",
          description: s,
        })),
        { title: "Sistema adicional (SingleFile / modo arquivo)" }
      );
      if (!pick) return;
      await vscode.workspace
        .getConfiguration("lsp")
        .update("fallback.defaultSystem", pick.description, vscode.ConfigurationTarget.Workspace);
      void vscode.window.showInformationMessage(
        `Sistema fallback: ${pick.description || "SENIOR"}`
      );
    })
  );
}

export function registerStatusBar(context: vscode.ExtensionContext): void {
  const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  item.command = "lspWorkbench.selectFallbackSystem";
  context.subscriptions.push(item);

  const refresh = async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor || editor.document.languageId !== SENIOR_LSP_LANGUAGE_ID) {
      item.hide();
      return;
    }
    const idx = getWorkspaceSymbolIndex();
    const { resolution } = await idx.getScopedEligible(editor.document);
    const settings = idx.readSettings();
    if (resolution.mode === "singleFile" || settings.scope === "file") {
      const sys = resolution.system || settings.fallbackSystem || "SENIOR";
      item.text = `$(symbol-misc) LSP · SingleFile · ${sys}`;
      item.tooltip = "Selecionar sistema adicional (fallback)";
      item.show();
    } else {
      const ctx = resolution.contextName ? ` · ${resolution.contextName}` : "";
      item.text = `$(folder) LSP · ${settings.scope}${ctx}`;
      item.tooltip = resolution.contextName?.startsWith("Relatório")
        ? "Escopo do projeto de relatório (PDR-010) — Mostrar escopo"
        : "Alternar escopo de símbolos";
      item.command = resolution.contextName?.startsWith("Relatório")
        ? "lspWorkbench.mostrarEscopoRelatorio"
        : "lspWorkbench.toggleSymbolScope";
      item.show();
    }
  };

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(() => void refresh()),
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("lsp")) void refresh();
    })
  );
  void refresh();
}
