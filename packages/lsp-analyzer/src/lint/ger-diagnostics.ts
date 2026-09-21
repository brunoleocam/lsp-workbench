/**
 * Diagnostics GER* (projeto de relatório — PDR-008).
 */

import type { DiagnosticHit } from "./diagnostics";
import {
  GER_FORBIDDEN_IN_PRESELECAO,
  GER_PRESELECAO_ONLY,
  type ReportContext,
} from "./report-project";

function push(
  hits: DiagnosticHit[],
  id: string,
  message: string,
  line: number,
  severity: "error" | "warning" = "warning",
  startCol?: number,
  endCol?: number
): void {
  hits.push({ id, message, line, severity, startCol, endCol });
}

function stripStringsKeepLiterals(line: string): string {
  let s = line.replace(/@[^@]*@/g, " ");
  s = s.replace(/\/\*.*?\*\//g, " ");
  return s;
}

/** Emite GER001–GER004 conforme o contexto do arquivo. */
export function collectGerDiagnostics(
  source: string,
  ctx: ReportContext
): DiagnosticHit[] {
  const hits: DiagnosticHit[] = [];
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const sections = new Set(ctx.sectionNames.map((s) => s.toLowerCase()));
  const isPre = ctx.eventKind === "pre-selecao";

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const scan = stripStringsKeepLiterals(raw);

    if (!isPre && GER_PRESELECAO_ONLY.test(scan)) {
      GER_PRESELECAO_ONLY.lastIndex = 0;
      const m = scan.match(GER_PRESELECAO_ONLY);
      const col = m ? scan.search(GER_PRESELECAO_ONLY) : -1;
      push(
        hits,
        "GER001",
        "Função de alteração de SQL do gerador só é válida na Pré-Seleção.",
        i,
        "error",
        col >= 0 ? col : undefined,
        col >= 0 && m ? col + m[0].length : undefined
      );
    }

    if (isPre && GER_FORBIDDEN_IN_PRESELECAO.test(scan)) {
      GER_FORBIDDEN_IN_PRESELECAO.lastIndex = 0;
      const col = scan.search(GER_FORBIDDEN_IN_PRESELECAO);
      push(
        hits,
        "GER002",
        "ListaSecao/AlteraControle não devem ser usados na Pré-Seleção (seções ainda não existem).",
        i,
        "error",
        col >= 0 ? col : undefined
      );
    }

    // GER003 — ListaSecao("Nome")
    for (const m of raw.matchAll(/\bListaSecao\s*\(\s*"([^"]+)"\s*\)/gi)) {
      const name = m[1];
      if (!sections.has(name.toLowerCase())) {
        const col = m.index ?? raw.indexOf(name);
        push(
          hits,
          "GER003",
          `ListaSecao("${name}"): seção não declarada em Secoes/ do projeto.`,
          i,
          "warning",
          col,
          col + name.length + 2
        );
      }
    }

    // GER004 — InsClauSQL*("Secao", …)
    for (const m of raw.matchAll(
      /\b(?:InsClauSQL\w+|InsSQLWhereSimples)\s*\(\s*"([^"]+)"/gi
    )) {
      const name = m[1];
      if (!sections.has(name.toLowerCase())) {
        const col = m.index ?? 0;
        push(
          hits,
          "GER004",
          `Seção "${name}" não encontrada no projeto de relatório (Secoes/).`,
          i,
          "warning",
          col,
          col + (m[0]?.length ?? name.length)
        );
      }
    }
  }

  return hits;
}
