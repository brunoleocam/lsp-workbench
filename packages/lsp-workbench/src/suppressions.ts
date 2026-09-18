/** Suppressões de alerta sem alterar o fonte (workspaceState / sessão). */

const STATE_KEY = "lsp-workbench.ignoredDiagnostics";

export const IGNORE_DIAGNOSTIC_CMD = "lsp-workbench.ignoreDiagnostic";

let store = new Set<string>();
let persist: ((keys: string[]) => Thenable<void>) | null = null;

export function normalizeLineForSuppression(lineText: string): string {
  return lineText.replace(/\s+/g, " ").trim();
}

export function suppressionKey(uri: string, ruleId: string, lineText: string): string {
  return `${uri}||${ruleId.toUpperCase()}||${normalizeLineForSuppression(lineText)}`;
}

export function initSuppressions(
  saved: string[] | undefined,
  save: (keys: string[]) => Thenable<void>
): void {
  store = new Set(saved ?? []);
  persist = save;
}

export function addSuppression(uri: string, ruleId: string, lineText: string): void {
  store.add(suppressionKey(uri, ruleId, lineText));
  void persist?.([...store]);
}

export function isLineSuppressed(uri: string, ruleId: string, lineText: string): boolean {
  return store.has(suppressionKey(uri, ruleId, lineText));
}

export function filterSuppressedHits<T extends { id: string; line: number }>(
  uri: string,
  lines: string[],
  hits: T[]
): T[] {
  return hits.filter((h) => !isLineSuppressed(uri, h.id, lines[h.line] ?? ""));
}

export { STATE_KEY as SUPPRESSIONS_STATE_KEY };
