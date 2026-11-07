import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Keypair } from "@stellar/stellar-sdk";
import { receiptsEnabled, signReceipt, validReceiptIds } from "@/lib/receipts";

const ENV_KEYS = ["FYV_ATTESTOR_SECRET", "SUPABASE_SERVICE_ROLE_KEY"] as const;
const saved: Record<string, string | undefined> = {};

beforeEach(() => {
  for (const k of ENV_KEYS) saved[k] = process.env[k];
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  process.env.FYV_ATTESTOR_SECRET = Keypair.random().secret();
});
afterEach(() => {
  for (const k of ENV_KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
});

describe("recibos de misión (modo sin base de datos)", () => {
  const address = Keypair.random().publicKey();

  it("un recibo firmado vale para su dirección y su misión", () => {
    const r = signReceipt(address, "phishing-001")!;
    expect(r).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(validReceiptIds(address, { "phishing-001": r })).toEqual(["phishing-001"]);
  });

  it("no sirve para otra dirección ni para otra misión", () => {
    const r = signReceipt(address, "phishing-001")!;
    expect(validReceiptIds(Keypair.random().publicKey(), { "phishing-001": r })).toEqual([]);
    expect(validReceiptIds(address, { "phishing-002": r })).toEqual([]);
  });

  it("ignora recibos inventados o con ids raros y conserva los buenos", () => {
    const good = signReceipt(address, "fake-assets-001")!;
    const ids = validReceiptIds(address, {
      "fake-assets-001": good,
      "fake-assets-002": "x".repeat(43),
      "../etc": good,
      "phishing-003": "",
    });
    expect(ids).toEqual(["fake-assets-001"]);
  });

  it("cambiar la llave del servidor invalida los recibos viejos", () => {
    const r = signReceipt(address, "phishing-001")!;
    process.env.FYV_ATTESTOR_SECRET = Keypair.random().secret();
    expect(validReceiptIds(address, { "phishing-001": r })).toEqual([]);
  });

  it("sin llave no hay recibos", () => {
    delete process.env.FYV_ATTESTOR_SECRET;
    expect(receiptsEnabled()).toBe(false);
    expect(signReceipt(address, "phishing-001")).toBeNull();
    expect(validReceiptIds(address, { "phishing-001": "abc" })).toEqual([]);
  });
});
