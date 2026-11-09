/**
 * Regra `.LSP` binária do Senior (PDR-012, etapa 7).
 *
 * Em 0x6A há sete valores Delphi no padrão `i s m b b i s`: chave-senha, senha, lista,
 * depurar, SQL Senior 2, CHAVE e FONTE. A fonte é Windows-1252 com XOR (CHAVE & 0xFF).
 * Tudo depois da fonte (histórico zlib) é copiado sem leitura.
 */

const VALUES_OFFSET = 0x6a;
const EXPECTED_KINDS = "ismbbis";
const SHORT_STRING_TAG = 0x06;
const LONG_STRING_TAG = 0x0c;
const SHORT_STRING_MAX = 255;

type ValueKind = "i" | "s" | "m" | "b";

interface DelphiValue {
  kind: ValueKind;
  tagOffset: number;
  dataStart: number;
  end: number;
  intValue?: number;
}

export interface SeniorBinaryRuleInfo {
  key: number;
  sourceTag: number;
  sourceTagOffset: number;
  sourceStart: number;
  sourceEnd: number;
}

/**
 * 0x80–0x9F do Windows-1252; o resto coincide com Latin-1. Tabela própria porque o
 * `TextDecoder("windows-1252")` de algumas versões do Node decodifica essa faixa como Latin-1.
 * Bytes sem caractere (81, 8D, 8F, 90, 9D) viram o controle C1 de mesmo valor, como no WHATWG.
 */
const CP1252_HIGH = [
  0x20ac, 0x0081, 0x201a, 0x0192, 0x201e, 0x2026, 0x2020, 0x2021,
  0x02c6, 0x2030, 0x0160, 0x2039, 0x0152, 0x008d, 0x017d, 0x008f,
  0x0090, 0x2018, 0x2019, 0x201c, 0x201d, 0x2022, 0x2013, 0x2014,
  0x02dc, 0x2122, 0x0161, 0x203a, 0x0153, 0x009d, 0x017e, 0x0178,
];

const CHAR_BY_CP1252: readonly string[] = Array.from({ length: 256 }, (_, b) =>
  String.fromCharCode(b >= 0x80 && b <= 0x9f ? CP1252_HIGH[b - 0x80] : b)
);

const CP1252_BY_CHAR: ReadonlyMap<string, number> = new Map(CHAR_BY_CP1252.map((ch, b) => [ch, b]));

function decodeCp1252(bytes: Uint8Array): string {
  let text = "";
  for (const b of bytes) text += CHAR_BY_CP1252[b];
  return text;
}

function readValue(buf: Uint8Array, view: DataView, p: number): DelphiValue | undefined {
  if (p >= buf.length) return undefined;
  const tag = buf[p];
  const fits = (end: number) => (end <= buf.length ? end : undefined);
  switch (tag) {
    case 0x02: {
      const end = fits(p + 2);
      return end === undefined ? undefined : { kind: "i", tagOffset: p, dataStart: p + 1, end, intValue: view.getInt8(p + 1) };
    }
    case 0x03: {
      const end = fits(p + 3);
      return end === undefined ? undefined : { kind: "i", tagOffset: p, dataStart: p + 1, end, intValue: view.getInt16(p + 1, true) };
    }
    case 0x04: {
      const end = fits(p + 5);
      return end === undefined ? undefined : { kind: "i", tagOffset: p, dataStart: p + 1, end, intValue: view.getInt32(p + 1, true) };
    }
    case SHORT_STRING_TAG: {
      if (p + 2 > buf.length) return undefined;
      const end = fits(p + 2 + buf[p + 1]);
      return end === undefined ? undefined : { kind: "s", tagOffset: p, dataStart: p + 2, end };
    }
    case LONG_STRING_TAG: {
      if (p + 5 > buf.length) return undefined;
      const length = view.getInt32(p + 1, true);
      if (length < 0) return undefined;
      const end = fits(p + 5 + length);
      return end === undefined ? undefined : { kind: "s", tagOffset: p, dataStart: p + 5, end };
    }
    case 0x08:
    case 0x09:
      return { kind: "b", tagOffset: p, dataStart: p, end: p + 1 };
    case 0x00:
    case 0x01:
      return { kind: "m", tagOffset: p, dataStart: p, end: p + 1 };
    default:
      return undefined;
  }
}

function tryReadInfo(buf: Uint8Array): SeniorBinaryRuleInfo | undefined {
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const values: DelphiValue[] = [];
  let p = VALUES_OFFSET;
  for (const expected of EXPECTED_KINDS) {
    const value = readValue(buf, view, p);
    if (!value || value.kind !== expected) return undefined;
    values.push(value);
    p = value.end;
  }
  const key = values[5];
  const source = values[6];
  return {
    key: (key.intValue ?? 0) & 0xff,
    sourceTag: buf[source.tagOffset],
    sourceTagOffset: source.tagOffset,
    sourceStart: source.dataStart,
    sourceEnd: source.end,
  };
}

/** True quando os bytes têm a estrutura de regra `.LSP` do Senior (não olha o texto do documento). */
export function isSeniorBinaryRule(buf: Uint8Array): boolean {
  return tryReadInfo(buf) !== undefined;
}

export function readSeniorBinaryRule(buf: Uint8Array): SeniorBinaryRuleInfo {
  const info = tryReadInfo(buf);
  if (!info) {
    throw new Error("Arquivo não é uma regra .LSP binária do Senior (estrutura em 0x6A não reconhecida).");
  }
  return info;
}

export function decodeSeniorBinaryRule(buf: Uint8Array): string {
  const info = readSeniorBinaryRule(buf);
  const plain = new Uint8Array(info.sourceEnd - info.sourceStart);
  for (let i = 0; i < plain.length; i++) plain[i] = buf[info.sourceStart + i] ^ info.key;
  return decodeCp1252(plain);
}

/** Codifica em Windows-1252; caractere fora da tabela gera erro com o caractere e a linha (1-based). */
export function encodeCp1252(text: string): Uint8Array {
  const out = new Uint8Array(text.length);
  let n = 0;
  let line = 1;
  for (const ch of text) {
    const b = CP1252_BY_CHAR.get(ch);
    if (b === undefined) {
      throw new Error(
        `Caractere "${ch}" na linha ${line} não existe no Windows-1252 (codificação do Senior). Troque ou remova antes de salvar.`
      );
    }
    if (ch === "\n") line++;
    out[n++] = b;
  }
  return out.subarray(0, n);
}

function toCrlf(text: string): string {
  return text.replace(/\r?\n/g, "\r\n");
}

/**
 * Grava `text` como fonte usando `model` (o `.LSP` de origem): reescreve só tag+tamanho e a fonte;
 * tag 06 vira 0C quando a fonte passa de 255 bytes. Confere relendo o resultado.
 */
export function encodeSeniorBinaryRule(text: string, model: Uint8Array): Uint8Array {
  const info = readSeniorBinaryRule(model);
  const crlf = toCrlf(text);
  const plain = encodeCp1252(crlf);

  let header: Uint8Array;
  if (info.sourceTag === SHORT_STRING_TAG && plain.length <= SHORT_STRING_MAX) {
    header = Uint8Array.of(SHORT_STRING_TAG, plain.length);
  } else {
    header = new Uint8Array(5);
    header[0] = LONG_STRING_TAG;
    new DataView(header.buffer).setInt32(1, plain.length, true);
  }

  const before = model.subarray(0, info.sourceTagOffset);
  const after = model.subarray(info.sourceEnd);
  const out = new Uint8Array(before.length + header.length + plain.length + after.length);
  out.set(before, 0);
  out.set(header, before.length);
  const sourceStart = before.length + header.length;
  for (let i = 0; i < plain.length; i++) out[sourceStart + i] = plain[i] ^ info.key;
  out.set(after, sourceStart + plain.length);

  if (decodeSeniorBinaryRule(out) !== crlf) {
    throw new Error("Conferência falhou: o .LSP gerado não relê o mesmo texto.");
  }
  return out;
}

const TITLE_MAX_BYTES = 70;
const HEADER_PREFIX = [0x01, 0x03, 0x00, 0x00, 0x00, 0x07, 0x00, 0x00, 0x00];
const TITLE_LENGTH_OFFSET = 0x09;
const TITLE_OFFSET = 0x0a;
const GUID_MARK_OFFSET = 0x51;
const GUID_OFFSET = 0x52;
const GUID_LENGTH = 16;

/** Chave-senha (int8) e bloco de histórico vazio (zlib), como observados em `SARG462.LSP`. */
const NEW_RULE_PASSWORD_KEY = 0x5d;
const EMPTY_HISTORY = [
  0x00, 0x01, 0x02, 0x03, 0x02, 0x0e, 0x78, 0x01, 0x63, 0x62, 0x60, 0x60, 0x60, 0xfa,
  0x0f, 0x00, 0x01, 0x15, 0x01, 0x04, 0x00, 0x08, 0x02, 0x00, 0x06, 0x00, 0x01, 0x00,
];

/** Mensagem de erro para o título da regra, ou `undefined` se válido (até 70 bytes Windows-1252). */
export function validateSeniorRuleTitle(title: string): string | undefined {
  if (!title.trim()) return "Informe o título da regra.";
  for (const ch of title) {
    if (!CP1252_BY_CHAR.has(ch)) {
      return `Caractere "${ch}" no título não existe no Windows-1252 (codificação do Senior).`;
    }
  }
  if (title.length > TITLE_MAX_BYTES) return `Título com ${title.length} caracteres; o máximo é ${TITLE_MAX_BYTES}.`;
  return undefined;
}

/** GUID versão 4 no layout do TGUID do Delphi (Data3 little-endian: versão no byte 7). */
export function newRuleGuid(random: Uint8Array): Uint8Array {
  if (random.length !== GUID_LENGTH) throw new Error(`GUID precisa de ${GUID_LENGTH} bytes.`);
  const guid = Uint8Array.from(random);
  guid[7] = (guid[7] & 0x0f) | 0x40;
  guid[8] = (guid[8] & 0x3f) | 0x80;
  return guid;
}

export interface NewSeniorBinaryRule {
  title: string;
  source: string;
  guid: Uint8Array;
  /** CHAVE do XOR da fonte, 1–127. */
  key: number;
}

/** `.LSP` novo: cabeçalho com título e GUID, valores em 0x6A sem senha e sem depuração, histórico vazio. */
export function createSeniorBinaryRule(rule: NewSeniorBinaryRule): Uint8Array {
  const titleError = validateSeniorRuleTitle(rule.title);
  if (titleError) throw new Error(titleError);
  if (rule.guid.length !== GUID_LENGTH) throw new Error(`GUID precisa de ${GUID_LENGTH} bytes.`);
  if (!Number.isInteger(rule.key) || rule.key < 1 || rule.key > 127) {
    throw new Error("A chave da fonte precisa estar entre 1 e 127.");
  }

  const header = new Uint8Array(VALUES_OFFSET);
  header.set(HEADER_PREFIX, 0);
  const title = encodeCp1252(rule.title);
  header[TITLE_LENGTH_OFFSET] = title.length;
  header.set(title, TITLE_OFFSET);
  header[GUID_MARK_OFFSET] = 0x10;
  header.set(rule.guid, GUID_OFFSET);

  const values = [
    0x02, NEW_RULE_PASSWORD_KEY,
    SHORT_STRING_TAG, 0x00,
    0x01,
    0x08,
    0x08,
    0x02, rule.key,
    SHORT_STRING_TAG, 0x00,
  ];
  const model = new Uint8Array(header.length + values.length + EMPTY_HISTORY.length);
  model.set(header, 0);
  model.set(values, header.length);
  model.set(EMPTY_HISTORY, header.length + values.length);
  return encodeSeniorBinaryRule(rule.source, model);
}
