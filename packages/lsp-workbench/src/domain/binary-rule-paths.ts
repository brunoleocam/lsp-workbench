/** Esquema dos documentos `.LSP` binários abertos como texto; o caminho da URI é o do arquivo aberto. */
export const BINARY_RULE_SCHEME = "lsp-binario";

const LSP_EXT = /\.lsp$/i;

/**
 * Caminho em disco de uma URI `lsp-binario`. Fora do esquema `file`, o `fsPath` do VS Code
 * descarta o servidor de um caminho UNC (`\\10.0.0.9\...` vira `\...`); aqui ele volta.
 */
export function binaryRuleDiskPath(authority: string, fsPath: string): string {
  if (!authority) return fsPath;
  const sep = fsPath.startsWith("/") ? "/" : "\\";
  return `${sep}${sep}${authority}${fsPath}`;
}
const EDITED_SUFFIX = /\.editado(\.lsp)$/i;

export function isEditedCopyPath(fsPath: string): boolean {
  return EDITED_SUFFIX.test(fsPath);
}

/** `SARG008.LSP` → `SARG008.editado.LSP`; a cópia aponta para ela mesma. */
export function editedCopyPath(fsPath: string): string {
  if (isEditedCopyPath(fsPath)) return fsPath;
  return fsPath.replace(LSP_EXT, (ext) => `.editado${ext}`);
}

export interface BinaryRuleFileResolution {
  readPath: string;
  /** Sempre a cópia `.editado`; nunca o original. */
  writePath: string;
  /** Abriu o original, mas o conteúdo vem da cópia (REQ-074). */
  readsEditedCopy: boolean;
}

export function resolveBinaryRuleFile(
  fsPath: string,
  exists: (path: string) => boolean
): BinaryRuleFileResolution {
  const writePath = editedCopyPath(fsPath);
  if (writePath === fsPath) {
    return { readPath: fsPath, writePath, readsEditedCopy: false };
  }
  const readsEditedCopy = exists(writePath);
  return { readPath: readsEditedCopy ? writePath : fsPath, writePath, readsEditedCopy };
}

function baseName(fsPath: string): string {
  return fsPath.split(/[\\/]/).pop() ?? fsPath;
}

export function editedCopyNotice(copyPath: string): string {
  return `Abrindo a cópia editada ${baseName(copyPath)}; o original não foi alterado`;
}

/** `C:\r\minha-regra.lsp` → `C:\r\MINHA-REGRA.senior.LSP` (padrão do "Salvar como" ao gerar). */
export function seniorExportDefaultPath(textPath: string): string {
  const name = baseName(textPath);
  const dir = textPath.slice(0, textPath.length - name.length);
  const stem = name.includes(".") ? name.slice(0, name.lastIndexOf(".")) : name;
  return `${dir}${stem.toUpperCase()}.senior.LSP`;
}

export interface OpenedDocumentRef {
  scheme: string;
  fsPath: string;
  autoOpen: boolean;
}

/** Decide se um `.lsp` aberto pelo Explorer deve ir para o esquema binário (REQ-070, D4). */
export function shouldOpenAsBinaryRule(
  doc: OpenedDocumentRef,
  isBinaryFile: (fsPath: string) => boolean
): boolean {
  if (!doc.autoOpen || doc.scheme !== "file" || !LSP_EXT.test(doc.fsPath)) return false;
  return isBinaryFile(doc.fsPath);
}
