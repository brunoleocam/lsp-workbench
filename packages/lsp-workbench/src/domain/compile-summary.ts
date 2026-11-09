/** Mesmos valores de `vscode.DiagnosticSeverity`, sem importar `vscode` (testável em node). */
export const SEVERITY_ERROR = 0;
export const SEVERITY_WARNING = 1;

export interface CompileCounts {
  errors: number;
  warnings: number;
}

export function countBySeverity(diagnostics: ReadonlyArray<{ severity: number }>): CompileCounts {
  let errors = 0;
  let warnings = 0;
  for (const d of diagnostics) {
    if (d.severity === SEVERITY_ERROR) errors++;
    else if (d.severity === SEVERITY_WARNING) warnings++;
  }
  return { errors, warnings };
}

function plural(n: number, singular: string, pluralForm: string): string {
  return `${n} ${n === 1 ? singular : pluralForm}`;
}

export function formatCompileSummary(counts: CompileCounts): string {
  return `${plural(counts.errors, "erro", "erros")}, ${plural(counts.warnings, "aviso", "avisos")}`;
}

export interface SaveHandlerDeps<D> {
  languageId: string;
  /** `undefined` = setting ausente; vale como ligado (padrão de `lsp.compileOnSave`). */
  compileOnSave: () => boolean | undefined;
  revalidate: (doc: D) => unknown;
}

export function createSaveHandler<D extends { languageId: string }>(
  deps: SaveHandlerDeps<D>
): (doc: D) => void {
  return (doc) => {
    if (doc.languageId !== deps.languageId) return;
    if (deps.compileOnSave() === false) return;
    void deps.revalidate(doc);
  };
}

export function formatStatusBarText(counts: CompileCounts): string {
  return `$(error) ${counts.errors} $(warning) ${counts.warnings}`;
}
