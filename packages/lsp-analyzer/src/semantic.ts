import { RUL007_MESSAGE } from "./lint/compiler-messages";
import type { AstNode, Diagnostic, Token } from "./types";

function walk(node: AstNode, visit: (n: AstNode) => void): void {
  visit(node);
  if (node.condition) walk(node.condition, visit);
  if (node.children) {
    for (const c of node.children) walk(c, visit);
    return;
  }
  if (node.thenBody) walk(node.thenBody, visit);
  if (node.elseBody) walk(node.elseBody, visit);
  if (node.body) walk(node.body, visit);
}

/** Heurística SYN003 sobre texto da condição (AST). */
function compoundNeedsParens(inner: string): boolean {
  if (!/\b(e|ou)\b/i.test(inner)) return false;
  // já no padrão (a) e (b) / (a) ou (b)
  if (/\([^)]+\)\s+(e|ou)\s+\(/i.test(inner)) return false;
  return true;
}

/** `Inicio` / `Fim` equivalem a `{` / `}` (ADR-008); `X.Fim` é membro, não bloco. */
function blockDelta(tokens: Token[], i: number): number {
  const t = tokens[i];
  if (t.value === "{") return 1;
  if (t.value === "}") return -1;
  if (t.kind !== "keyword" || tokens[i - 1]?.value === ".") return 0;
  const v = t.value.toLowerCase();
  if (v === "inicio") return 1;
  if (v === "fim") return -1;
  return 0;
}

function braceDiagnostics(tokens: Token[]): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  let depth = 0;
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    const delta = blockDelta(tokens, i);
    if (delta > 0) depth++;
    if (delta < 0) {
      depth--;
      if (depth < 0) {
        diagnostics.push({
          id: "ANL001",
          message: "'}' sem '{' correspondente",
          line: t.line,
          severity: "error",
        });
        depth = 0;
      }
    }
  }
  if (depth > 0) {
    diagnostics.push({
      id: "ANL002",
      message: `'{' sem fechamento (${depth})`,
      line: tokens[tokens.length - 1]?.line ?? 0,
      severity: "error",
    });
  }
  return diagnostics;
}

function astDiagnostics(ast: AstNode): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  walk(ast, (n) => {
    if (n.kind === "Retorna") {
      diagnostics.push({
        id: "ANL010",
        message: RUL007_MESSAGE,
        line: n.line,
        severity: "error",
      });
    }
    if (n.kind === "Se" || n.kind === "Enquanto") {
      const inner = n.condition?.text ?? n.text ?? "";
      if (inner && compoundNeedsParens(inner)) {
        diagnostics.push({
          id: "ANL011",
          message: "Condição composta: cada parte deve estar entre parênteses.",
          line: n.line,
          severity: "error",
        });
      }
    }
  });
  return diagnostics;
}

/** SYN002 — Se/Enquanto/Para sem '(' imediato. */
function controlParenDiagnostics(tokens: Token[]): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.kind !== "keyword") continue;
    const v = t.value.toLowerCase();
    if (v !== "se" && v !== "enquanto" && v !== "para") continue;
    const next = tokens[i + 1];
    if (!next || next.value !== "(") {
      diagnostics.push({
        id: "ANL012",
        message: `${t.value} deve ter a condição entre parênteses: ${t.value} (…)`,
        line: t.line,
        severity: "error",
      });
    }
  }
  return diagnostics;
}

/** Semantic mínimo + braces a partir de tokens/AST. */
export function collectSemantics(tokens: Token[], ast: AstNode): Diagnostic[] {
  return [
    ...braceDiagnostics(tokens),
    ...controlParenDiagnostics(tokens),
    ...astDiagnostics(ast),
  ];
}
