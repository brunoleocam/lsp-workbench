import * as fs from "node:fs";
import * as vscode from "vscode";
import {
  type FunctionsCatalogDiscovery,
  resolveFunctionsCatalogPath,
} from "./domain/functions-catalog-discovery";
import {
  buildEffectiveFunctionCatalog,
  setEffectiveFunctionCatalog,
} from "./effective-function-catalog";

let channel: vscode.OutputChannel | undefined;

function log(line: string): void {
  channel ??= vscode.window.createOutputChannel("LSP Workbench");
  channel.appendLine(`[catálogo de funções] ${line}`);
}

/** ADR-009 §2: `lsp.functions.path` ou extensão com `lspWorkbench.functionsCatalog`. */
export function discoverFunctionsCatalog(): FunctionsCatalogDiscovery {
  return resolveFunctionsCatalogPath({
    settingPath: vscode.workspace.getConfiguration("lsp").get<string>("functions.path", ""),
    workspaceRoot: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath,
    extensions: vscode.extensions.all,
    exists: (p) => fs.existsSync(p),
  });
}

/** Lê o catálogo extra e grava o efetivo; arquivo ausente ou inválido = só o embutido. */
export function reloadFunctionsCatalog(): FunctionsCatalogDiscovery {
  const found = discoverFunctionsCatalog();
  for (const id of found.ignored) {
    log(`extensão ${id} também declara catálogo; ignorada (vale ${found.source}).`);
  }
  if (!found.path) {
    setEffectiveFunctionCatalog(undefined);
    return found;
  }
  let raw: string;
  try {
    raw = fs.readFileSync(found.path, "utf8");
  } catch (err) {
    log(`não foi possível ler ${found.path}: ${err instanceof Error ? err.message : String(err)}`);
    setEffectiveFunctionCatalog(undefined);
    return { ignored: found.ignored };
  }
  const built = buildEffectiveFunctionCatalog(raw);
  if (built.error) {
    log(`${found.path} ignorado: ${built.error}`);
    setEffectiveFunctionCatalog(undefined);
    return { ignored: found.ignored };
  }
  setEffectiveFunctionCatalog(built.catalog);
  log(`${found.path} (${found.source}): ${built.extraCount} funções.`);
  if (built.divergences.length) {
    log(`${built.divergences.length} com assinatura diferente da doc (vale o extra): ${built.divergences.join(", ")}`);
  }
  return found;
}

/** Recarrega ao mudar `lsp.functions.path` ou a lista de extensões; `onChanged` revalida os documentos. */
export function registerFunctionsCatalog(
  context: vscode.ExtensionContext,
  onChanged: (found: FunctionsCatalogDiscovery) => void
): FunctionsCatalogDiscovery {
  const initial = reloadFunctionsCatalog();
  let current = initial.path;
  const reload = () => {
    const found = reloadFunctionsCatalog();
    current = found.path;
    onChanged(found);
  };
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("lsp.functions.path")) reload();
    }),
    vscode.extensions.onDidChange(() => {
      if (discoverFunctionsCatalog().path !== current) reload();
    }),
    { dispose: () => channel?.dispose() }
  );
  return initial;
}
