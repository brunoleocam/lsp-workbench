import * as vscode from "vscode";
import { SENIOR_LSP_LANGUAGE_ID } from "./language";
import {
  CURSOR_CPP_DISABLED_KEY,
  GHOST_INLINE_SUGGEST_KEY,
  nextCursorDisabledLanguages,
  resolveLanguageSettingTarget,
  resolveSettingTarget,
  valueAtTarget,
  type GhostConfigTarget,
} from "./ghost-mode";

function toConfigurationTarget(target: GhostConfigTarget): vscode.ConfigurationTarget {
  switch (target) {
    case "workspaceFolder":
      return vscode.ConfigurationTarget.WorkspaceFolder;
    case "workspace":
      return vscode.ConfigurationTarget.Workspace;
    case "global":
      return vscode.ConfigurationTarget.Global;
    default: {
      const unreachable: never = target;
      return unreachable;
    }
  }
}

function isCursorHost(): boolean {
  return vscode.env.appName.toLowerCase().includes("cursor");
}

async function setGhostMode(enabled: boolean): Promise<void> {
  const languageConfig = vscode.workspace.getConfiguration(undefined, {
    languageId: SENIOR_LSP_LANGUAGE_ID,
  });
  const inlineTarget = resolveLanguageSettingTarget(
    languageConfig.inspect<boolean>(GHOST_INLINE_SUGGEST_KEY)
  );
  await languageConfig.update(
    GHOST_INLINE_SUGGEST_KEY,
    enabled,
    toConfigurationTarget(inlineTarget),
    true
  );

  if (isCursorHost()) {
    const editorConfig = vscode.workspace.getConfiguration();
    const inspected = editorConfig.inspect<string[]>(CURSOR_CPP_DISABLED_KEY);
    const listTarget = resolveSettingTarget(inspected);
    const next = nextCursorDisabledLanguages(
      valueAtTarget(inspected, listTarget),
      SENIOR_LSP_LANGUAGE_ID,
      enabled
    );
    if (next) {
      await editorConfig.update(CURSOR_CPP_DISABLED_KEY, next, toConfigurationTarget(listTarget));
    }
  }

  void vscode.window.showInformationMessage(
    enabled
      ? "Modo Ghost ativado para a linguagem LSP. Sugestões em texto fantasma podem aparecer ao digitar."
      : "Modo Ghost desativado para a linguagem LSP."
  );
}

export function registerGhostModeCommands(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand("lspWorkbench.enableGhostMode", () => setGhostMode(true)),
    vscode.commands.registerCommand("lspWorkbench.disableGhostMode", () => setGhostMode(false))
  );
}
