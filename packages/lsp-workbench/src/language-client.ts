import * as fs from "node:fs";
import * as path from "node:path";
import * as vscode from "vscode";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient/node";

let client: LanguageClient | undefined;

/** True quando `lsp.server.enabled` (Opção 3). Default false = in-process. */
export function isLanguageServerEnabled(): boolean {
  return vscode.workspace.getConfiguration("lsp").get<boolean>("server.enabled", false);
}

/**
 * Inicia o Language Server apontando para `../lsp-language-server/out/server.js`.
 * Retorna o client, ou undefined se desabilitado / binário ausente.
 */
export async function startLanguageServer(
  context: vscode.ExtensionContext
): Promise<LanguageClient | undefined> {
  if (!isLanguageServerEnabled()) {
    return undefined;
  }

  const serverModule = path.join(
    context.extensionPath,
    "..",
    "lsp-language-server",
    "out",
    "server.js"
  );

  if (!fs.existsSync(serverModule)) {
    throw new Error(
      `Language Server não encontrado em ${serverModule}. Compile packages/lsp-language-server ou desligue lsp.server.enabled.`
    );
  }

  const serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: { execArgv: ["--nolazy", "--inspect=6009"] },
    },
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: "*", language: "senior-lsp" }],
    synchronize: {
      configurationSection: "lsp",
    },
  };

  client = new LanguageClient(
    "lspWorkbenchLanguageServer",
    "LSP Workbench Language Server",
    serverOptions,
    clientOptions
  );

  context.subscriptions.push({
    dispose: () => {
      void client?.stop();
      client = undefined;
    },
  });

  await client.start();
  return client;
}

export async function stopLanguageServer(): Promise<void> {
  if (!client) return;
  await client.stop();
  client = undefined;
}
