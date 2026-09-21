/**
 * Índice de workspace para símbolos customizados (PDR-003).
 */

import * as vscode from "vscode";
import * as path from "path";
import { parseFileSymbols, type FileSymbols } from "./document-symbols";
import {
  resolvePeerFiles,
  isLspSourcePath,
  type ScopeSettings,
  type SymbolScopeMode,
  type LspContextConfig,
} from "./scope-config";
import { eligibleFromSymbols, type ScopedFunction } from "./symbol-scope";
import { SENIOR_LSP_LANGUAGE_ID } from "./language";
import { loadReportScopeOverlay } from "./domain/report-project-loader";

type CacheEntry = { symbols: FileSymbols; mtime?: number };

export class WorkspaceSymbolIndex {
  private cache = new Map<string, CacheEntry>();
  private candidates: string[] = [];
  private scanning: Thenable<void> | undefined;

  readSettings(): ScopeSettings {
    const cfg = vscode.workspace.getConfiguration("lsp");
    const scope = (cfg.get<string>("symbols.scope", "project") || "project") as SymbolScopeMode;
    const contexts = cfg.get<LspContextConfig[]>("contexts", []) ?? [];
    const fallbackSystem = cfg.get<string>("fallback.defaultSystem", "") ?? "";
    return { scope, contexts, fallbackSystem };
  }

  invalidate(uri?: vscode.Uri): void {
    if (uri) this.cache.delete(uri.toString());
    else this.cache.clear();
  }

  async ensureCandidates(): Promise<string[]> {
    if (this.scanning) await this.scanning;
    if (this.candidates.length) return this.candidates;

    this.scanning = (async () => {
      const found: string[] = [];
      const folders = vscode.workspace.workspaceFolders ?? [];
      for (const folder of folders) {
        const pattern = new vscode.RelativePattern(folder, "**/*.{lsp,lspt}");
        const uris = await vscode.workspace.findFiles(pattern, "**/node_modules/**", 2000);
        for (const u of uris) found.push(u.fsPath);
      }
      // .txt associados à linguagem: documentos abertos
      for (const doc of vscode.workspace.textDocuments) {
        if (doc.languageId === SENIOR_LSP_LANGUAGE_ID && doc.uri.scheme === "file") {
          const p = doc.uri.fsPath;
          if (!found.includes(p)) found.push(p);
        }
      }
      this.candidates = found;
    })();

    await this.scanning;
    this.scanning = undefined;
    return this.candidates;
  }

  refreshCandidates(): void {
    this.candidates = [];
  }

  async getSymbols(uri: vscode.Uri, source?: string): Promise<FileSymbols> {
    const key = uri.toString();
    if (source !== undefined) {
      const symbols = parseFileSymbols(source);
      this.cache.set(key, { symbols });
      return symbols;
    }
    const open = vscode.workspace.textDocuments.find((d) => d.uri.toString() === key);
    if (open) {
      const symbols = parseFileSymbols(open.getText());
      this.cache.set(key, { symbols });
      return symbols;
    }
    const cached = this.cache.get(key);
    if (cached) return cached.symbols;

    // fs.readFile — NÃO openTextDocument (dispara onDidOpen → refresh em cascata).
    try {
      const bytes = await vscode.workspace.fs.readFile(uri);
      const text = Buffer.from(bytes).toString("utf8");
      const symbols = parseFileSymbols(text);
      this.cache.set(key, { symbols });
      return symbols;
    } catch {
      const empty: FileSymbols = { functions: [], variables: [] };
      return empty;
    }
  }

  workspaceRootFor(fileAbs: string): string {
    const folders = vscode.workspace.workspaceFolders ?? [];
    const norm = fileAbs.replace(/\\/g, "/").toLowerCase();
    for (const f of folders) {
      const root = f.uri.fsPath.replace(/\\/g, "/").toLowerCase();
      if (norm === root || norm.startsWith(root + "/")) return f.uri.fsPath;
    }
    return folders[0]?.uri.fsPath ?? path.dirname(fileAbs);
  }

  async getScopedEligible(document: vscode.TextDocument): Promise<{
    local: ScopedFunction[];
    peers: ScopedFunction[];
    external: Map<string, ScopedFunction>;
    resolution: ReturnType<typeof resolvePeerFiles>;
  }> {
    const settings = this.readSettings();
    const current = document.uri.fsPath;
    const root = this.workspaceRootFor(current);
    let candidates = await this.ensureCandidates();
    if (!candidates.includes(current) && isLspSourcePath(current)) {
      candidates = [...candidates, current];
    }
    // docs abertos .txt lsp
    if (
      document.languageId === SENIOR_LSP_LANGUAGE_ID &&
      !candidates.includes(current)
    ) {
      candidates = [...candidates, current];
    }

    const resolution = resolvePeerFiles({
      currentFileAbs: current,
      workspaceRootAbs: root,
      candidateFilesAbs: candidates,
      settings,
      reportOverlay: loadReportScopeOverlay(current),
    });

    const localSymbols = await this.getSymbols(document.uri, document.getText());
    const local = eligibleFromSymbols(
      localSymbols,
      document.uri.toString(),
      path.basename(current)
    );

    const peers: ScopedFunction[] = [];
    for (const peerPath of resolution.peers) {
      if (peerPath.replace(/\\/g, "/").toLowerCase() === current.replace(/\\/g, "/").toLowerCase()) {
        continue;
      }
      const uri = vscode.Uri.file(peerPath);
      const sym = await this.getSymbols(uri);
      peers.push(...eligibleFromSymbols(sym, uri.toString(), path.basename(peerPath)));
    }

    const external = new Map<string, ScopedFunction>();
    for (const f of peers) {
      external.set(f.name.toLowerCase(), f);
    }

    return { local, peers, external, resolution };
  }

  /** Mapa para analyzeLsp scopedExternal. */
  async externalMapFor(
    document: vscode.TextDocument
  ): Promise<Map<string, { fileName: string }>> {
    const { external } = await this.getScopedEligible(document);
    const m = new Map<string, { fileName: string }>();
    for (const [k, v] of external) {
      m.set(k, { fileName: v.fileName });
    }
    return m;
  }

  async findFunctionDefinition(
    document: vscode.TextDocument,
    name: string
  ): Promise<{ uri: vscode.Uri; line: number } | undefined> {
    const key = name.toLowerCase();
    const { local, peers } = await this.getScopedEligible(document);
    const all = [...local, ...peers];
    const hit = all.find((f) => f.name.toLowerCase() === key);
    if (!hit) return undefined;
    const line = hit.declLine >= 0 ? hit.declLine : hit.implLine;
    return { uri: vscode.Uri.parse(hit.uri), line: Math.max(0, line) };
  }
}

let sharedIndex: WorkspaceSymbolIndex | undefined;

export function getWorkspaceSymbolIndex(): WorkspaceSymbolIndex {
  if (!sharedIndex) sharedIndex = new WorkspaceSymbolIndex();
  return sharedIndex;
}
