import { describe, expect, it } from "vitest";
import { Keypair } from "@stellar/stellar-sdk";
import { completionMessage, isStellarAddress, midTruncate } from "@/lib/ownership";

describe("firma SEP-53 de cada respuesta", () => {
  const kp = Keypair.random();
  const payload = { stellarAddress: kp.publicKey(), missionId: "phishing-001", selectedOptionId: "b", issuedAt: 1_790_000_000_000 };
  const message = completionMessage(payload);
  const signature = kp.signMessage(message);

  it("el mensaje incluye dirección, misión, opción y hora", () => {
    expect(message).toContain(kp.publicKey());
    expect(message).toContain("phishing-001");
    expect(message).toContain("b");
    expect(message).toContain(String(payload.issuedAt));
  });

  it("verifica con la llave de la dirección", () => {
    expect(Keypair.fromPublicKey(kp.publicKey()).verifyMessage(message, signature)).toBe(true);
  });

  it("falla si cambian la opción elegida (nadie puede alterar la respuesta)", () => {
    const forged = completionMessage({ ...payload, selectedOptionId: "a" });
    expect(Keypair.fromPublicKey(kp.publicKey()).verifyMessage(forged, signature)).toBe(false);
  });

  it("falla con la firma de otra cuenta (nadie responde por ti)", () => {
    const other = Keypair.random();
    const otherSig = other.signMessage(message);
    expect(Keypair.fromPublicKey(kp.publicKey()).verifyMessage(message, otherSig)).toBe(false);
  });
});

describe("direcciones", () => {
  it("acepta una dirección pública G… válida y rechaza secretos y basura", () => {
    const kp = Keypair.random();
    expect(isStellarAddress(kp.publicKey())).toBe(true);
    expect(isStellarAddress(kp.secret())).toBe(false);
    expect(isStellarAddress("G123")).toBe(false);
  });

  it("trunca en medio", () => {
    expect(midTruncate("GABCDEFGHIJKLMNOP", 4, 3)).toBe("GABC…NOP");
  });
});
