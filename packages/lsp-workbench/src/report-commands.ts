import * as path from "node:path";
import * as os from "node:os";
import * as vscode from "vscode";
import { buildMultiTrechoExport, looksLikeMultiTrecho, scaffoldFromMultiTrecho, scaffoldRelatorioProject } from "./domain/report-scaffold";
import { findReportRoot, normalizeFsPath } from "@lsp-workbench/analyzer";
import * as fs from "node:fs";
import {
  appendContextoExtra,
  loadReportScopeOverlay,
  sourcePathForExport,
} from "./domain/report-project-loader";
import { getWorkspaceSymbolIndex } from "./workspace-symbol-index";
import type { LspContextConfig } from "./scope-config";

function workspaceParent(): string | undefined {
  return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
}

function reportRootForEditor(): string | undefined {
  const ed = vscode.window.activeTextEditor;
  if (!ed) return undefined;
  const root = findReportRoot(normalizeFsPath(ed.document.uri.fsPath), (p) => {
    try {
      return fs.existsSync(p.replace(/\//g, path.sep));
    } catch {
      return false;
    }
  });
  return root ? root.replace(/\//g, path.sep) : undefined;
}

function refreshSymbolIndex(): void {
  getWorkspaceSymbolIndex().refreshCandidates();
  getWorkspaceSymbolIndex().invalidate();
}

/** Windows: pasta e arquivo no mesmo diálogo → só pastas. */
async function pickFolderOrFile(
  title: string,
  defaultDir: string
): Promise<string | undefined> {
  const kind = await vscode.window.showQuickPick(
    [
      { label: "Pasta", description: "Inclui todos os .lsp/.lspt da pasta", mode: "folder" as const },
      { label: "Arquivo .lsp / .lspt", description: "Um arquivo específico", mode: "file" as const },
    ],
    { title, placeHolder: "Pasta ou arquivo?" }
  );
  if (!kind) return undefined;

  const uris = await vscode.window.showOpenDialog(
    kind.mode === "folder"
      ? {
          canSelectFolders: true,
          canSelectFiles: false,
          canSelectMany: false,
          defaultUri: vscode.Uri.file(defaultDir),
          openLabel: "Selecionar pasta",
        }
      : {
          canSelectFolders: false,
          canSelectFiles: true,
          canSelectMany: false,
          defaultUri: vscode.Uri.file(defaultDir),
          openLabel: "Selecionar arquivo",
          filters: { LSP: ["lsp", "lspt"] },
        }
  );
  return uris?.[0]?.fsPath;
}

export function registerReportCommands(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand("lspWorkbench.gerarRelatorio", async () => {
      const codigo = await vscode.window.showInputBox({
        title: "Gerar relatório",
        prompt: "Sigla do relatório (ex. RDCGXXX)",
        validateInput: (v) =>
          /^[A-Za-z0-9_]+$/.test(v.trim()) ? undefined : "Use apenas letras, números e _",
      });
      if (!codigo) return;

      const descricao = await vscode.window.showInputBox({
        title: "Gerar relatório",
        prompt: "Descrição / nome do relatório",
        value: codigo.trim(),
      });
      if (descricao === undefined) return;

      const categoria = await vscode.window.showInputBox({
        title: "Gerar relatório",
        prompt: "Categoria (opcional)",
        placeHolder: "ex. CG, PS, RE",
      });

      const secoesRaw = await vscode.window.showInputBox({
        title: "Gerar relatório",
        prompt: "Seções (vírgula). Vazio = Detalhe_1",
        placeHolder: "ex. Detalhe_Transportadora, Subtitulo_CodTra, Total_Geral",
      });
      if (secoesRaw === undefined) return;
      const secoes = secoesRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      let parentDir = workspaceParent();
      if (!parentDir) {
        const uris = await vscode.window.showOpenDialog({
          canSelectFolders: true,
          canSelectFiles: false,
          openLabel: "Criar relatório nesta pasta",
        });
        parentDir = uris?.[0]?.fsPath;
      }
      if (!parentDir) {
        void vscode.window.showErrorMessage("Nenhuma pasta de destino.");
        return;
      }

      try {
        const root = scaffoldRelatorioProject({
          parentDir,
          codigo: codigo.trim(),
          descricao: descricao.trim() || codigo.trim(),
          categoria: categoria?.trim(),
          secoes: secoes.length ? secoes : undefined,
        });
        const readme = path.join(root, "README.md");
        const doc = await vscode.workspace.openTextDocument(readme);
        await vscode.window.showTextDocument(doc);
        void vscode.window.showInformationMessage(`Projeto criado: ${root}`);
      } catch (err) {
        void vscode.window.showErrorMessage(
          err instanceof Error ? err.message : String(err)
        );
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("lspWorkbench.copiarRegraRelatorio", async () => {
      const ed = vscode.window.activeTextEditor;
      if (!ed || ed.document.languageId !== "senior-lsp") {
        void vscode.window.showWarningMessage("Abra um arquivo .lsp do projeto de relatório.");
        return;
      }
      await vscode.env.clipboard.writeText(ed.document.getText());
      void vscode.window.showInformationMessage("Regra copiada para a área de transferência.");
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("lspWorkbench.exportarRelatorioMultiTrecho", async () => {
      const root = reportRootForEditor() ?? (await pickReportRoot());
      if (!root) {
        void vscode.window.showWarningMessage(
          "Abra um arquivo dentro de um projeto com relatorio.json."
        );
        return;
      }
      const text = buildMultiTrechoExport(root);
      const out = path.join(root, `${path.basename(root)}-export.lsp`);
      fs.writeFileSync(out, text, "utf8");
      const doc = await vscode.workspace.openTextDocument(out);
      await vscode.window.showTextDocument(doc);
      void vscode.window.showInformationMessage(`Todas as regras: ${out}`);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("lspWorkbench.importarRelatorio", async () => {
      let text: string | undefined;
      let defaultCodigo = "RDCGXXX";
      const ed = vscode.window.activeTextEditor;
      if (ed && looksLikeMultiTrecho(ed.document.getText())) {
        text = ed.document.getText();
        const base = path.basename(ed.document.uri.fsPath, path.extname(ed.document.uri.fsPath));
        if (/^[A-Za-z0-9_]+$/.test(base)) defaultCodigo = base;
      } else {
        const uris = await vscode.window.showOpenDialog({
          canSelectFolders: false,
          canSelectFiles: true,
          canSelectMany: false,
          defaultUri: vscode.Uri.file(workspaceParent() ?? os.homedir()),
          openLabel: "Importar relatório",
          filters: { LSP: ["lsp", "lspt", "txt"] },
        });
        if (!uris?.[0]) return;
        text = fs.readFileSync(uris[0].fsPath, "utf8");
        const base = path.basename(uris[0].fsPath, path.extname(uris[0].fsPath));
        if (/^[A-Za-z0-9_]+$/.test(base)) defaultCodigo = base;
      }
      if (!text || !looksLikeMultiTrecho(text)) {
        void vscode.window.showErrorMessage(
          'Arquivo inválido: esperado padrão "Código: N - Descrição: …" (Visualizar Todas as Regras).'
        );
        return;
      }

      const codigo = await vscode.window.showInputBox({
        title: "Importar relatório",
        prompt: "Sigla do relatório (pasta a criar)",
        value: defaultCodigo,
        validateInput: (v) =>
          /^[A-Za-z0-9_]+$/.test(v.trim()) ? undefined : "Use apenas letras, números e _",
      });
      if (!codigo) return;

      const descricao = await vscode.window.showInputBox({
        title: "Importar relatório",
        prompt: "Descrição / nome do relatório",
        value: codigo.trim(),
      });
      if (descricao === undefined) return;

      let parentDir = workspaceParent();
      if (!parentDir) {
        const uris = await vscode.window.showOpenDialog({
          canSelectFolders: true,
          canSelectFiles: false,
          openLabel: "Criar relatório nesta pasta",
        });
        parentDir = uris?.[0]?.fsPath;
      }
      if (!parentDir) {
        void vscode.window.showErrorMessage("Nenhuma pasta de destino.");
        return;
      }

      try {
        const root = scaffoldFromMultiTrecho({
          parentDir,
          codigo: codigo.trim(),
          descricao: descricao.trim() || codigo.trim(),
          text,
        });
        refreshSymbolIndex();
        const readme = path.join(root, "README.md");
        const doc = await vscode.workspace.openTextDocument(readme);
        await vscode.window.showTextDocument(doc);
        void vscode.window.showInformationMessage(`Relatório importado: ${root}`);
      } catch (err) {
        void vscode.window.showErrorMessage(
          err instanceof Error ? err.message : String(err)
        );
      }
    })
  );

  /**
   * Importar Contexto de: pasta/arquivo → contextoExtra do relatório aberto.
   */
  const importarContextoDe = async () => {
    const root = reportRootForEditor() ?? (await pickReportRoot());
    if (!root) {
      void vscode.window.showWarningMessage(
        "Abra um arquivo dentro de um projeto com relatorio.json + Definicao/Secoes."
      );
      return;
    }
    const picked = await pickFolderOrFile(
      "Importar Contexto de",
      path.dirname(root)
    );
    if (!picked) return;
    try {
      const rel = appendContextoExtra(root, picked);
      refreshSymbolIndex();
      void vscode.window.showInformationMessage(
        `Importado: contextoExtra += "${rel}" em ${path.join(root, "relatorio.json")}`
      );
    } catch (err) {
      void vscode.window.showErrorMessage(
        err instanceof Error ? err.message : String(err)
      );
    }
  };

  context.subscriptions.push(
    vscode.commands.registerCommand("lspWorkbench.importarContextoDe", importarContextoDe)
  );

  /**
   * Exportar Contexto para: escopo do arquivo aberto → outro relatório ou lsp.contexts.
   */
  context.subscriptions.push(
    vscode.commands.registerCommand("lspWorkbench.exportarContextoPara", async () => {
      const ed = vscode.window.activeTextEditor;
      if (!ed || ed.document.uri.scheme !== "file") {
        void vscode.window.showWarningMessage("Abra um arquivo do escopo que deseja exportar.");
        return;
      }

      const source = sourcePathForExport(ed.document.uri.fsPath);
      const wsRoot = workspaceParent();
      const cfg = vscode.workspace.getConfiguration("lsp");
      const named = cfg.get<LspContextConfig[]>("contexts", []) ?? [];
      const reportDests = await listWorkspaceReportRoots(
        source.kind === "report" ? source.abs : undefined
      );

      type Dest =
        | { kind: "report"; root: string; codigo: string }
        | { kind: "report-browse" }
        | { kind: "named"; ctx: LspContextConfig };

      const picks: (vscode.QuickPickItem & { dest: Dest })[] = [
        ...reportDests.map((r) => ({
          label: `Relatório · ${r.codigo}`,
          description: `Recebe símbolos de ${source.label}`,
          detail: r.root,
          dest: { kind: "report" as const, root: r.root, codigo: r.codigo },
        })),
        {
          label: "Outro projeto de relatório (escolher pasta)…",
          description: "Navegar até uma pasta com relatorio.json",
          dest: { kind: "report-browse" as const },
        },
        ...named.map((c) => ({
          label: `Contexto nomeado · ${c.name}`,
          description: `${c.rootDir} · ${c.filePattern}`,
          detail: "lsp.contexts (settings do workspace)",
          dest: { kind: "named" as const, ctx: c },
        })),
      ];

      const pick = await vscode.window.showQuickPick(picks, {
        title: `Exportar Contexto para ← origem: ${source.label}`,
        placeHolder: "Para onde enviar este escopo?",
      });
      if (!pick) return;

      try {
        if (pick.dest.kind === "report" || pick.dest.kind === "report-browse") {
          const destRoot =
            pick.dest.kind === "report" ? pick.dest.root : await pickReportRoot();
          if (!destRoot) return;
          if (path.resolve(destRoot) === path.resolve(source.abs)) {
            void vscode.window.showWarningMessage("Origem e destino são o mesmo relatório.");
            return;
          }
          const destLabel =
            pick.dest.kind === "report" ? `Relatório · ${pick.dest.codigo}` : path.basename(destRoot);
          const rel = appendContextoExtra(destRoot, source.abs);
          refreshSymbolIndex();
          void vscode.window.showInformationMessage(
            `${source.label} → ${destLabel} (contextoExtra += "${rel}")`
          );
          return;
        }

        const namedCtx = pick.dest.ctx;
        if (!wsRoot) {
          void vscode.window.showErrorMessage("Workspace sem pasta aberta.");
          return;
        }
        const relWs = path.relative(wsRoot, source.abs).split(path.sep).join("/");
        if (!relWs || relWs.startsWith("..")) {
          void vscode.window.showErrorMessage(
            "O caminho de origem precisa estar dentro do workspace para entrar em lsp.contexts."
          );
          return;
        }

        const next = named.map((c) => {
          if (c.name !== namedCtx.name) return c;
          const files = [...(c.files ?? [])];
          if (!files.some((f) => path.resolve(wsRoot, f) === path.resolve(source.abs))) {
            files.push(relWs);
          }
          return { ...c, files };
        });
        await cfg.update("contexts", next, vscode.ConfigurationTarget.Workspace);
        refreshSymbolIndex();
        void vscode.window.showInformationMessage(
          `Exportado ${source.label} → contexto "${namedCtx.name}" (files += "${relWs}")`
        );
      } catch (err) {
        void vscode.window.showErrorMessage(
          err instanceof Error ? err.message : String(err)
        );
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("lspWorkbench.mostrarEscopoRelatorio", async () => {
      const ed = vscode.window.activeTextEditor;
      if (!ed) {
        void vscode.window.showWarningMessage("Nenhum editor ativo.");
        return;
      }
      const overlay = loadReportScopeOverlay(ed.document.uri.fsPath);
      if (!overlay) {
        void vscode.window.showInformationMessage(
          "Arquivo fora de um projeto de relatório (relatorio.json + Definicao/Secoes)."
        );
        return;
      }
      const extras = overlay.includeRootsAbs
        .slice(1)
        .map((p) => path.relative(overlay.rootAbs, p) || p)
        .join(", ");
      void vscode.window.showInformationMessage(
        `Relatório · ${overlay.name} — root: ${overlay.rootAbs}` +
          (extras ? ` · extra: ${extras}` : " · sem contextoExtra")
      );
    })
  );
}

async function listWorkspaceReportRoots(excludeAbs?: string): Promise<
  { root: string; codigo: string }[]
> {
  const folder = workspaceParent();
  if (!folder) return [];
  const pattern = new vscode.RelativePattern(folder, "**/relatorio.json");
  const uris = await vscode.workspace.findFiles(pattern, "**/node_modules/**", 200);
  const out: { root: string; codigo: string }[] = [];
  const exclude = excludeAbs ? path.resolve(excludeAbs) : undefined;
  for (const u of uris) {
    const root = path.dirname(u.fsPath);
    if (exclude && path.resolve(root) === exclude) continue;
    const hasLayout =
      fs.existsSync(path.join(root, "Definicao")) || fs.existsSync(path.join(root, "Secoes"));
    if (!hasLayout) continue;
    let codigo = path.basename(root);
    try {
      const raw = fs.readFileSync(u.fsPath, "utf8");
      const data = JSON.parse(raw) as { codigo?: string };
      if (typeof data.codigo === "string" && data.codigo.trim()) codigo = data.codigo.trim();
    } catch {
      /* basename */
    }
    out.push({ root, codigo });
  }
  out.sort((a, b) => a.codigo.localeCompare(b.codigo, "pt-BR"));
  return out;
}

async function pickReportRoot(): Promise<string | undefined> {
  const folder = workspaceParent();
  if (!folder) return undefined;
  const uris = await vscode.window.showOpenDialog({
    canSelectFolders: true,
    canSelectFiles: false,
    defaultUri: vscode.Uri.file(folder),
    openLabel: "Pasta do relatório (com relatorio.json)",
  });
  const dir = uris?.[0]?.fsPath;
  if (!dir) return undefined;
  if (!fs.existsSync(path.join(dir, "relatorio.json"))) {
    void vscode.window.showErrorMessage("Pasta sem relatorio.json.");
    return undefined;
  }
  return dir;
}
