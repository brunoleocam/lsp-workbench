import * as fs from "node:fs";
import * as path from "node:path";
import * as vscode from "vscode";
import {
  decodeSeniorBinaryRule,
  encodeSeniorBinaryRule,
  isSeniorBinaryRule,
} from "../../domain/senior-binary-rule";
import { isEditedCopyPath, resolveBinaryRuleFile } from "../../domain/binary-rule-paths";

const LSP_EXT = /\.lsp$/i;
const detectCache = new Map<string, { mtimeMs: number; size: number; binary: boolean }>();

/** Lê os bytes do disco (nunca o texto do documento); cache por mtime+tamanho. */
export function isBinaryRuleFile(fsPath: string): boolean {
  if (!LSP_EXT.test(fsPath)) return false;
  try {
    const st = fs.statSync(fsPath);
    const key = path.resolve(fsPath).toLowerCase();
    const hit = detectCache.get(key);
    if (hit && hit.mtimeMs === st.mtimeMs && hit.size === st.size) return hit.binary;
    const binary = st.isFile() && isSeniorBinaryRule(fs.readFileSync(fsPath));
    detectCache.set(key, { mtimeMs: st.mtimeMs, size: st.size, binary });
    return binary;
  } catch {
    return false;
  }
}

/** Documento `file:` cujo arquivo é `.LSP` binário — analyzer e formatter não atuam nele. */
export function isBinaryRuleFileUri(uri: vscode.Uri): boolean {
  return uri.scheme === "file" && isBinaryRuleFile(uri.fsPath);
}

function resolve(uri: vscode.Uri) {
  return resolveBinaryRuleFile(uri.fsPath, (p) => fs.existsSync(p));
}

function readBytes(uri: vscode.Uri, file: string): Buffer {
  try {
    return fs.readFileSync(file);
  } catch {
    throw vscode.FileSystemError.FileNotFound(uri);
  }
}

/**
 * Esquema `lsp-binario`: a URI aponta para o arquivo aberto; lê a cópia `.editado` se existir,
 * senão o original; grava sempre na cópia (REQ-071, REQ-074).
 */
export class BinaryRuleFileSystem implements vscode.FileSystemProvider {
  private readonly emitter = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
  readonly onDidChangeFile = this.emitter.event;

  watch(): vscode.Disposable {
    return new vscode.Disposable(() => undefined);
  }

  stat(uri: vscode.Uri): vscode.FileStat {
    const { readPath } = resolve(uri);
    try {
      const st = fs.statSync(readPath);
      return { type: vscode.FileType.File, ctime: st.ctimeMs, mtime: st.mtimeMs, size: st.size };
    } catch {
      throw vscode.FileSystemError.FileNotFound(uri);
    }
  }

  readFile(uri: vscode.Uri): Uint8Array {
    const { readPath } = resolve(uri);
    const bytes = readBytes(uri, readPath);
    if (!isSeniorBinaryRule(bytes)) {
      throw vscode.FileSystemError.Unavailable(
        `${path.basename(readPath)} não é uma regra .LSP binária do Senior.`
      );
    }
    return Buffer.from(decodeSeniorBinaryRule(bytes), "utf8");
  }

  writeFile(uri: vscode.Uri, content: Uint8Array): void {
    const { readPath, writePath } = resolve(uri);
    if (!isEditedCopyPath(writePath)) {
      throw vscode.FileSystemError.NoPermissions("A regra só é gravada na cópia .editado.");
    }
    const model = readBytes(uri, readPath);
    let encoded: Uint8Array;
    try {
      encoded = encodeSeniorBinaryRule(Buffer.from(content).toString("utf8"), model);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      void vscode.window.showErrorMessage(`LSP: não salvou ${path.basename(writePath)}. ${message}`);
      throw vscode.FileSystemError.NoPermissions(message);
    }
    fs.writeFileSync(writePath, encoded);
    if (!fs.readFileSync(writePath).equals(Buffer.from(encoded))) {
      throw vscode.FileSystemError.Unavailable(
        `Conferência falhou: ${path.basename(writePath)} relido difere do que foi gravado.`
      );
    }
    vscode.window.setStatusBarMessage(
      `LSP: salvo em ${path.basename(writePath)}; o original não foi alterado`,
      6000
    );
    this.emitter.fire([{ type: vscode.FileChangeType.Changed, uri }]);
  }

  readDirectory(): [string, vscode.FileType][] {
    return [];
  }

  createDirectory(): void {
    throw vscode.FileSystemError.NoPermissions();
  }

  delete(): void {
    throw vscode.FileSystemError.NoPermissions();
  }

  rename(): void {
    throw vscode.FileSystemError.NoPermissions();
  }
}
