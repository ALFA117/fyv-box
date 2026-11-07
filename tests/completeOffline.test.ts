import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Keypair } from "@stellar/stellar-sdk";
import { NextRequest } from "next/server";

// after() corre la emisión en el acto; Horizon y Soroban se simulan.
const afterTasks: (() => unknown)[] = [];
vi.mock("next/server", async (orig) => ({
  ...(await orig<typeof import("next/server")>()),
  after: (fn: () => unknown) => { afterTasks.push(fn); },
}));
const attest = vi.hoisted(() => ({
  getAttestations: vi.fn(),
  attestModule: vi.fn(),
  issueOnContract: vi.fn(),
}));
vi.mock("@/lib/attest", () => attest);

import { POST } from "@/app/api/missions/complete/route";
import { getMissionsByTrack } from "@/missions/engine";
import { completionMessage } from "@/lib/ownership";
import { resetDbHealth } from "@/lib/supabase";
import { resetIssuance } from "@/lib/issuance";
import { resetRateLimits } from "@/lib/rateLimit";

const saved = { ...process.env };

beforeEach(() => {
  // Sin base configurada: la ruta entra directo al modo sin base de datos.
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  process.env.FYV_ATTESTOR_SECRET = Keypair.random().secret();
  resetDbHealth();
  resetIssuance();
  resetRateLimits();
  afterTasks.length = 0;
  attest.getAttestations.mockReset().mockResolvedValue([]);
  attest.attestModule.mockReset().mockResolvedValue("tx");
  attest.issueOnContract.mockReset().mockResolvedValue("tx2");
});
afterEach(() => {
  process.env = { ...saved };
});

async function answer(kp: Keypair, missionId: string, optionId: string, receipts: Record<string, string> = {}) {
  const issuedAt = Date.now();
  const payload = { stellarAddress: kp.publicKey(), missionId, selectedOptionId: optionId, issuedAt };
  const signature = Buffer.from(kp.signMessage(completionMessage(payload))).toString("base64");
  const req = new NextRequest("http://localhost/api/missions/complete", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.7" },
    body: JSON.stringify({ ...payload, signature, receipts }),
  });
  const res = await POST(req);
  return { status: res.status, body: await res.json() };
}

const phishing = getMissionsByTrack("phishing");
const correct = (id: string) => phishing.find((m) => m.id === id)!.options.find((o) => o.isCorrect)!.id;
const wrong = (id: string) => phishing.find((m) => m.id === id)!.options.find((o) => !o.isCorrect)!.id;

describe("/api/missions/complete sin base de datos", () => {
  it("evalúa la respuesta y devuelve un recibo solo si acertaste", async () => {
    const kp = Keypair.random();
    const id = phishing[0].id;
    const ok = await answer(kp, id, correct(id));
    expect(ok.status).toBe(200);
    expect(ok.body).toMatchObject({ isCorrect: true, saved: "browser", newCertifications: [] });
    expect(typeof ok.body.receipt).toBe("string");

    const bad = await answer(kp, id, wrong(id));
    expect(bad.body).toMatchObject({ isCorrect: false, receipt: null });
  });

  it("al cerrar el módulo con recibos válidos emite la credencial una sola vez", async () => {
    const kp = Keypair.random();
    const receipts: Record<string, string> = {};
    for (const m of phishing.slice(0, -1)) {
      const r = await answer(kp, m.id, correct(m.id), receipts);
      receipts[m.id] = r.body.receipt;
    }
    const last = phishing[phishing.length - 1];
    const done = await answer(kp, last.id, correct(last.id), receipts);
    expect(done.body.newCertifications).toEqual(["phishing"]);
    expect(afterTasks).toHaveLength(1);
    await afterTasks[0]();
    expect(attest.attestModule).toHaveBeenCalledWith(kp.publicKey(), "phishing");
    expect(attest.issueOnContract).toHaveBeenCalledTimes(1);

    // Una segunda respuesta casi simultánea no vuelve a emitir.
    const again = await answer(kp, last.id, correct(last.id), receipts);
    expect(again.body.newCertifications).toEqual([]);
    expect(afterTasks).toHaveLength(1);
  });

  it("si Horizon no responde, no emite a ciegas y avisa que queda pendiente", async () => {
    attest.getAttestations.mockRejectedValue(new Error("Horizon 503"));
    const kp = Keypair.random();
    const receipts: Record<string, string> = {};
    for (const m of phishing.slice(0, -1)) {
      receipts[m.id] = (await answer(kp, m.id, correct(m.id), receipts)).body.receipt;
    }
    const last = phishing[phishing.length - 1];
    const done = await answer(kp, last.id, correct(last.id), receipts);
    expect(done.body.newCertifications).toEqual([]);
    expect(done.body.certificationPending).toBe("phishing");
    expect(afterTasks).toHaveLength(0);
  });

  it("recibos inventados no cuentan para cerrar el módulo", async () => {
    const kp = Keypair.random();
    const fake = Object.fromEntries(phishing.slice(0, -1).map((m) => [m.id, "x".repeat(43)]));
    const last = phishing[phishing.length - 1];
    const done = await answer(kp, last.id, correct(last.id), fake);
    expect(done.body.newCertifications).toEqual([]);
    expect(done.body.certificationPending).toBeNull();
  });

  it("rechaza una firma de otra cuenta", async () => {
    const kp = Keypair.random();
    const other = Keypair.random();
    const id = phishing[0].id;
    const issuedAt = Date.now();
    const payload = { stellarAddress: kp.publicKey(), missionId: id, selectedOptionId: correct(id), issuedAt };
    const signature = Buffer.from(other.signMessage(completionMessage(payload))).toString("base64");
    const res = await POST(new NextRequest("http://localhost/api/missions/complete", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...payload, signature }),
    }));
    expect(res.status).toBe(401);
  });
});
