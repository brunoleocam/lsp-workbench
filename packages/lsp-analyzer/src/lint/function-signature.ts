import type { LspFunctionEntry, LspFunctionParam } from "./function-catalog.types";

export type LspParamType = "Alfa" | "Numero" | "Data" | "Lista" | "Cursor";

export function normalizeParamType(raw: string | undefined): LspParamType | undefined {
  const t = (raw ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (t === "alfa" || t === "alfanumerico") return "Alfa";
  if (t === "numero") return "Numero";
  if (t === "data") return "Data";
  if (t === "lista") return "Lista";
  if (t === "cursor") return "Cursor";
  return undefined;
}

export type SignatureParam = { name: string; tipo: LspParamType | undefined; out: boolean };

/** Lê `Nome(Tipo [End] nome, …)`; `undefined` se não há lista de parâmetros. */
export function parseSignatureParams(signature: string): SignatureParam[] | undefined {
  const m = /[A-Za-z_][\w]*\s*\(([^()]*)\)/.exec(signature);
  if (!m) return undefined;
  const inner = (m[1] ?? "").trim();
  if (!inner) return [];
  return inner.split(",").map((piece) => {
    const words = piece.replace(/[<>]/g, " ").trim().split(/\s+/).filter(Boolean);
    const name = (words.pop() ?? "").replace(/[^\wÀ-ÿ]/g, "");
    return {
      name,
      tipo: normalizeParamType(words[0]),
      out: words.some((w) => /^end$/i.test(w)),
    };
  });
}

function firstCodeSpan(markdown: string): string {
  return /`([^`\n]+)`/.exec(markdown)?.[1] ?? "";
}

function typedCount(params: SignatureParam[] | undefined): number {
  return (params ?? []).filter((p) => p.tipo).length;
}

/** Assinatura documentada: a de `detail` ou a do 1º trecho de código da doc, a que tiver mais tipos. */
export function documentedSignature(entry: LspFunctionEntry): SignatureParam[] | undefined {
  const fromDetail = parseSignatureParams(entry.detail ?? "");
  const fromDoc = parseSignatureParams(firstCodeSpan(entry.documentation ?? ""));
  if (!fromDetail) return fromDoc;
  if (!fromDoc) return fromDetail;
  return typedCount(fromDoc) > typedCount(fromDetail) ? fromDoc : fromDetail;
}

/**
 * REQ-030/033: tipo normalizado e `out` em cada parâmetro, inferidos da assinatura documentada.
 * `sameFunction` = a mesma função em outras fontes (HCM/ERP/docs); vale a assinatura com mais tipos.
 */
export function withStructuredParams(
  entry: LspFunctionEntry,
  sameFunction: LspFunctionEntry[] = []
): LspFunctionEntry {
  let sig = documentedSignature(entry);
  for (const other of sameFunction) {
    const candidate = documentedSignature(other);
    if (typedCount(candidate) > typedCount(sig)) sig = candidate;
  }
  const base = (entry.params ?? []).filter((p) => p.name.trim());
  let params: LspFunctionParam[] | undefined;
  if (base.length) {
    params = base.map((p, i) => {
      const s =
        sig?.find((x) => x.name.toLowerCase() === p.name.toLowerCase()) ??
        (sig?.length === base.length ? sig[i] : undefined);
      return { ...p, tipo: normalizeParamType(p.tipo) ?? s?.tipo ?? p.tipo, out: s?.out ?? false };
    });
  } else if (sig?.length) {
    params = sig.filter((s) => s.name).map((s) => ({ name: s.name, tipo: s.tipo, out: s.out }));
  }
  return { ...entry, ...(params ? { params } : {}), origin: entry.origin ?? "docs" };
}
