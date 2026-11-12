import * as vscode from "vscode";

let channel: vscode.OutputChannel | undefined;

/** Canal "LSP Workbench: desempenho" (Output); só recebe operações lentas. */
export function logPerf(message: string): void {
  channel ??= vscode.window.createOutputChannel("LSP Workbench: desempenho");
  channel.appendLine(`${new Date().toISOString()} ${message}`);
}
