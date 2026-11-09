import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  createSeniorBinaryRule,
  decodeSeniorBinaryRule,
  encodeCp1252,
  encodeSeniorBinaryRule,
  isSeniorBinaryRule,
  newRuleGuid,
  readSeniorBinaryRule,
  validateSeniorRuleTitle,
} from "../domain/senior-binary-rule";

const KEY = 0x5a;
const HISTORY = [0x78, 0x9c, 0x00, 0x01, 0xff, 0x10, 0x20];

function cp1252(text: string): number[] {
  return [...encodeCp1252(text)];
}

/** Monta um .LSP sintético: cabeçalho de 0x6A bytes + sete valores Delphi (i s m b b i s) + histórico. */
function buildRule(source: string, sourceTag: 0x06 | 0x0c, keyHighByte = 0x01): Buffer {
  const head = Buffer.alloc(0x6a);
  for (let i = 0; i < head.length; i++) head[i] = (i * 7 + 3) & 0xff;
  const title = Buffer.from("SARG999 - Teste", "latin1");
  head[0x09] = title.length;
  title.copy(head, 0x0a);

  const plain = cp1252(source);
  const encrypted = plain.map((b) => b ^ KEY);
  const sourceHeader =
    sourceTag === 0x06
      ? [0x06, plain.length]
      : [0x0c, plain.length & 0xff, (plain.length >> 8) & 0xff, (plain.length >> 16) & 0xff, 0];

  const values = [
    0x02, 0x5d, // chave-senha (int8)
    0x06, 0x03, 0x61, 0x62, 0x63, // senha "abc"
    0x01, // lista
    0x09, // depurar = true
    0x08, // SQL Senior 2 = false
    0x03, KEY, keyHighByte, // CHAVE (int16); só o byte baixo vale para o XOR
    ...sourceHeader,
    ...encrypted,
  ];
  return Buffer.concat([head, Buffer.from(values), Buffer.from(HISTORY)]);
}

function sourceOfSize(size: number): string {
  const line = "Definir Alfa vaTexto;\r\n";
  let text = "";
  while (text.length + line.length <= size) text += line;
  return text + "x".repeat(size - text.length);
}

const SAMPLE = "/* Regra de teste */\r\nDefinir Alfa vaDescrição;\r\nvaDescrição = \"Preço €\";\r\n";

describe("isSeniorBinaryRule (AC-070)", () => {
  it("reconhece o binário pelos sete valores em 0x6A", () => {
    assert.equal(isSeniorBinaryRule(buildRule(SAMPLE, 0x06)), true);
    assert.equal(isSeniorBinaryRule(buildRule(SAMPLE, 0x0c)), true);
  });

  it("arquivo .lsp texto não é binário", () => {
    const text = Buffer.from(
      "Definir Alfa vaNome;\r\nDefinir Numero vnQtd;\r\n" + "vaNome = \"Teste\";\r\n".repeat(10),
      "latin1"
    );
    assert.equal(isSeniorBinaryRule(text), false);
  });

  it("buffer curto, vazio ou com fonte truncada não é binário", () => {
    assert.equal(isSeniorBinaryRule(Buffer.alloc(0)), false);
    assert.equal(isSeniorBinaryRule(Buffer.alloc(0x6a)), false);
    const full = buildRule(SAMPLE, 0x0c);
    const truncated = full.subarray(0, full.length - HISTORY.length - 5);
    assert.equal(isSeniorBinaryRule(truncated), false);
  });
});

describe("decodeSeniorBinaryRule (AC-070)", () => {
  it("decodifica a fonte com XOR (CHAVE & 0xFF) e Windows-1252", () => {
    assert.equal(decodeSeniorBinaryRule(buildRule(SAMPLE, 0x06)), SAMPLE);
    assert.equal(decodeSeniorBinaryRule(buildRule(SAMPLE, 0x0c)), SAMPLE);
  });

  it("expõe a chave e a tag da fonte", () => {
    const info = readSeniorBinaryRule(buildRule(SAMPLE, 0x06));
    assert.equal(info.key, KEY);
    assert.equal(info.sourceTag, 0x06);
  });

  it("recusa arquivo que não é .LSP binário", () => {
    assert.throws(() => decodeSeniorBinaryRule(Buffer.from("Definir Alfa vaX;", "latin1")));
  });
});

describe("encodeSeniorBinaryRule (AC-071)", () => {
  const cases: Array<[string, number, 0x06 | 0x0c]> = [
    ["fonte ≤ 255 com tag 06", 200, 0x06],
    ["fonte ≤ 255 com tag 0C", 200, 0x0c],
    ["fonte > 255 com tag 0C", 300, 0x0c],
    ["fonte grande com tag 0C", 70000, 0x0c],
  ];
  for (const [name, size, tag] of cases) {
    it(`round-trip byte a byte: ${name}`, () => {
      const buf = buildRule(sourceOfSize(size), tag);
      const again = encodeSeniorBinaryRule(decodeSeniorBinaryRule(buf), buf);
      assert.ok(Buffer.from(again).equals(buf));
    });
  }

  it("fonte que cresce de 200 para 300 bytes troca 06 por 0C e mantém os demais bytes", () => {
    const model = buildRule(sourceOfSize(200), 0x06);
    const info = readSeniorBinaryRule(model);
    const grown = sourceOfSize(300);
    const out = Buffer.from(encodeSeniorBinaryRule(grown, model));

    assert.ok(out.subarray(0, info.sourceTagOffset).equals(model.subarray(0, info.sourceTagOffset)));
    assert.equal(out[info.sourceTagOffset], 0x0c);
    assert.equal(out.readInt32LE(info.sourceTagOffset + 1), 300);
    assert.ok(out.subarray(out.length - HISTORY.length).equals(Buffer.from(HISTORY)));
    assert.equal(decodeSeniorBinaryRule(out), grown);
  });

  it("tag 0C continua 0C quando a fonte encolhe", () => {
    const model = buildRule(sourceOfSize(300), 0x0c);
    const out = encodeSeniorBinaryRule(sourceOfSize(100), model);
    assert.equal(readSeniorBinaryRule(out).sourceTag, 0x0c);
  });

  it("grava quebras de linha como CRLF", () => {
    const model = buildRule(SAMPLE, 0x06);
    const out = encodeSeniorBinaryRule("linha 1\nlinha 2\r\nlinha 3", model);
    assert.equal(decodeSeniorBinaryRule(out), "linha 1\r\nlinha 2\r\nlinha 3");
  });

  it("recusa modelo que não é .LSP binário", () => {
    assert.throws(() => encodeSeniorBinaryRule("x", Buffer.from("Definir Alfa vaX;", "latin1")));
  });
});

describe("Windows-1252 (AC-072)", () => {
  it("usa a tabela Windows-1252 em 0x80–0x9F, não Latin-1", () => {
    assert.deepEqual(cp1252("€“”–çÿ"), [0x80, 0x93, 0x94, 0x96, 0xe7, 0xff]);
  });

  it("€ existe no Windows-1252 e passa", () => {
    const model = buildRule(SAMPLE, 0x06);
    const out = encodeSeniorBinaryRule("vaMoeda = \"€\";", model);
    assert.equal(decodeSeniorBinaryRule(out), "vaMoeda = \"€\";");
  });

  it("→ não existe no Windows-1252: erro cita o caractere e a linha", () => {
    const model = buildRule(SAMPLE, 0x06);
    assert.throws(
      () => encodeSeniorBinaryRule("linha 1\r\nlinha 2\r\nvaSeta = \"→\";", model),
      (err: Error) => err.message.includes("→") && /linha 3\b/.test(err.message)
    );
  });
});

describe("createSeniorBinaryRule (AC-081)", () => {
  const GUID = newRuleGuid(Uint8Array.from({ length: 16 }, (_, i) => 0xa0 + i));
  const EMPTY_HISTORY = Buffer.from("00010203020e78016362606060fa0f00011501040008020006000100", "hex");
  const create = (source: string, title = "Regra de Teste Ação") =>
    Buffer.from(createSeniorBinaryRule({ title, source, guid: GUID, key: 0x2b }));

  it("gera um .LSP binário que decodifica para o texto em CRLF", () => {
    const buf = create("Definir Alfa vaX;\nvaX = \"€\";");
    assert.equal(isSeniorBinaryRule(buf), true);
    assert.equal(decodeSeniorBinaryRule(buf), "Definir Alfa vaX;\r\nvaX = \"€\";");
  });

  it("cabeçalho: título em 0x0A, 0x10 em 0x51, GUID em 0x52", () => {
    const buf = create("x");
    assert.ok(buf.subarray(0, 9).equals(Buffer.from("010300000007000000", "hex")));
    const title = cp1252("Regra de Teste Ação");
    assert.equal(buf[0x09], title.length);
    assert.deepEqual([...buf.subarray(0x0a, 0x0a + title.length)], title);
    assert.equal(buf[0x51], 0x10);
    assert.ok(buf.subarray(0x52, 0x62).equals(Buffer.from(GUID)));
  });

  it("valores em 0x6A: senha vazia, depurar e SQL2 desligados, chave informada", () => {
    const buf = create("x");
    const info = readSeniorBinaryRule(buf);
    assert.equal(info.key, 0x2b);
    assert.equal(buf[0x6a], 0x02);
    assert.ok(buf.subarray(0x6c, 0x71).equals(Buffer.from([0x06, 0x00, 0x01, 0x08, 0x08])));
  });

  it("fonte ≤ 255 usa 06, > 255 usa 0C; final é o histórico vazio", () => {
    assert.equal(readSeniorBinaryRule(create(sourceOfSize(255))).sourceTag, 0x06);
    const big = create(sourceOfSize(256));
    assert.equal(readSeniorBinaryRule(big).sourceTag, 0x0c);
    assert.ok(big.subarray(big.length - EMPTY_HISTORY.length).equals(EMPTY_HISTORY));
  });

  it("round-trip byte a byte no .LSP gerado", () => {
    const buf = create(SAMPLE);
    assert.ok(Buffer.from(encodeSeniorBinaryRule(decodeSeniorBinaryRule(buf), buf)).equals(buf));
  });

  it("recusa título inválido, chave fora de 1–127 e texto fora do Windows-1252", () => {
    assert.throws(() => create("x", ""));
    assert.throws(() => create("x", "a".repeat(71)));
    assert.throws(() => createSeniorBinaryRule({ title: "T", source: "x", guid: GUID, key: 0 }));
    assert.throws(() => createSeniorBinaryRule({ title: "T", source: "x", guid: GUID, key: 128 }));
    assert.throws(
      () => create("linha 1\nvaSeta = \"→\";"),
      (err: Error) => err.message.includes("→") && /linha 2\b/.test(err.message)
    );
  });
});

describe("newRuleGuid", () => {
  it("marca versão 4 e variante RFC no layout do TGUID", () => {
    const guid = newRuleGuid(new Uint8Array(16).fill(0xff));
    assert.equal(guid[7], 0x4f);
    assert.equal(guid[8], 0xbf);
    assert.throws(() => newRuleGuid(new Uint8Array(15)));
  });
});

describe("validateSeniorRuleTitle (AC-083)", () => {
  it("aceita até 70 bytes Windows-1252", () => {
    assert.equal(validateSeniorRuleTitle("Ação €"), undefined);
    assert.equal(validateSeniorRuleTitle("a".repeat(70)), undefined);
  });

  it("recusa vazio, 71 bytes e caractere fora do Windows-1252", () => {
    assert.match(validateSeniorRuleTitle("  ") ?? "", /título/i);
    assert.match(validateSeniorRuleTitle("a".repeat(71)) ?? "", /70/);
    assert.match(validateSeniorRuleTitle("Seta →") ?? "", /→/);
  });
});

describe("regras reais (opcional, LSP_BINARY_RULES_DIR ou docs/senior/regras-binarias)", () => {
  const dir =
    process.env.LSP_BINARY_RULES_DIR ||
    join(__dirname, "..", "..", "..", "..", "docs", "senior", "regras-binarias");
  const skip = !existsSync(dir) ? `pasta ausente: ${dir}` : false;

  it("round-trip byte a byte em cada .LSP binário da pasta", { skip }, () => {
    const files = readdirSync(dir!)
      .filter((name) => /\.lsp$/i.test(name))
      .map((name) => join(dir!, name))
      .filter((file) => statSync(file).isFile());
    let binaries = 0;
    for (const file of files) {
      const buf = readFileSync(file);
      if (!isSeniorBinaryRule(buf)) continue;
      binaries++;
      const again = Buffer.from(encodeSeniorBinaryRule(decodeSeniorBinaryRule(buf), buf));
      assert.ok(again.equals(buf), `round-trip diferente em ${file}`);
    }
    assert.ok(binaries > 0, `nenhum .LSP binário em ${dir}`);
  });
});
