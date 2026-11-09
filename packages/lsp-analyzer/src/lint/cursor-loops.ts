import { tokenize } from "../lexer";
import { parse } from "../parser";
import type { AstNode } from "../types";
import type { DiagnosticHit } from "./diagnostics";

/** Condição exatamente `X.Achou` (o texto da AST separa tokens com espaço). */
const ACHOU_CONDITION = /^\(?\s*([A-Za-z_]\w*)\s*\.\s*Achou\s*\)?$/i;

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function children(node: AstNode): AstNode[] {
  if (node.children) return node.children;
  return [node.thenBody, node.elseBody, node.body].filter((n): n is AstNode => !!n);
}

function containsProximo(node: AstNode, proximo: RegExp): boolean {
  if (node.kind === "Statement" && proximo.test(node.text ?? "")) return true;
  return children(node).some((c) => containsProximo(c, proximo));
}

function isContinue(node: AstNode): boolean {
  return node.kind === "Statement" && /^continue$/i.test(node.text ?? "");
}

/**
 * SEM006: percorre o corpo em ordem; `seen` = já houve `X.Proximo()` antes, no mesmo bloco
 * ou num ancestral. Laços internos têm o próprio `Continue` e não entram na busca.
 */
function findContinueWithoutProximo(
  node: AstNode,
  proximo: RegExp,
  seenBefore: boolean,
  out: AstNode[]
): void {
  let seen = seenBefore;
  for (const child of children(node)) {
    if (isContinue(child)) {
      if (!seen) out.push(child);
      continue;
    }
    if (child.kind !== "Enquanto" && child.kind !== "Para") {
      findContinueWithoutProximo(child, proximo, seen, out);
    }
    if (!seen && containsProximo(child, proximo)) seen = true;
  }
}

function walkLoops(node: AstNode, visit: (n: AstNode) => void): void {
  if (node.kind === "Enquanto") visit(node);
  for (const c of children(node)) walkLoops(c, visit);
}

/** SEM005 / SEM006 — laço `Enquanto (X.Achou)` que não avança o cursor (PDR-012 etapa 2). */
export function collectCursorLoopHits(source: string): DiagnosticHit[] {
  const hits: DiagnosticHit[] = [];
  walkLoops(parse(tokenize(source)), (loop) => {
    const cursor = ACHOU_CONDITION.exec(loop.condition?.text ?? "")?.[1];
    if (!cursor || !loop.body) return;
    const proximo = new RegExp(String.raw`\b${escapeRegExp(cursor)}\s*\.\s*Proximo\b`, "i");

    if (!containsProximo(loop.body, proximo)) {
      const col = loop.column ?? 0;
      hits.push({
        id: "SEM005",
        message: `Laço em \`${cursor}.Achou\` sem \`${cursor}.Proximo()\` no corpo: o cursor não avança e o laço não termina.`,
        line: loop.line,
        severity: "error",
        startCol: col,
        endCol: col + "Enquanto".length,
      });
      return;
    }

    const orphans: AstNode[] = [];
    findContinueWithoutProximo(loop.body, proximo, false, orphans);
    for (const c of orphans) {
      const col = c.column ?? 0;
      hits.push({
        id: "SEM006",
        message: `\`Continue\` sem \`${cursor}.Proximo()\` antes: o laço volta ao mesmo registro e não termina. Chame \`${cursor}.Proximo();\` antes do \`Continue\`.`,
        line: c.line,
        severity: "error",
        startCol: col,
        endCol: col + "Continue".length,
      });
    }
  });
  return hits;
}
