/** Barrel do lint heurístico (SYN/RUL/FUN/SEM/SQL/DEM) + merge ANL*. */
export type { AnalyzeLspOptions, DiagnosticHit } from "./diagnostics";
export { analyzeLsp, lineSuppressions } from "./diagnostics";
export * from "./quick-fixes";
export * from "./document-symbols";
export * from "./symbol-scope";
export * from "./function-catalog";
export * from "./rule-catalog";
export * from "./sql-native-heuristics";
