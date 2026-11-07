import { beforeEach, describe, expect, it } from "vitest";
import { localCompleted, localReceipts, saveLocalCompletion } from "@/lib/localProgress";

// localStorage mínimo para el entorno node de Vitest.
class MemoryStorage {
  private m = new Map<string, string>();
  getItem(k: string) { return this.m.has(k) ? this.m.get(k)! : null; }
  setItem(k: string, v: string) { this.m.set(k, String(v)); }
  removeItem(k: string) { this.m.delete(k); }
  clear() { this.m.clear(); }
}

const A = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
const B = "GBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB";

function setStorage(s: unknown) {
  (globalThis as { localStorage?: unknown }).localStorage = s;
}

beforeEach(() => setStorage(new MemoryStorage()));

describe("avance guardado en el navegador", () => {
  it("anota misiones por dirección, sin mezclar cuentas", () => {
    saveLocalCompletion(A, "phishing-001", "r1");
    saveLocalCompletion(B, "phishing-002", "r2");
    expect([...localCompleted(A)]).toEqual(["phishing-001"]);
    expect([...localCompleted(B)]).toEqual(["phishing-002"]);
  });

  it("solo manda al servidor los recibos no vacíos", () => {
    saveLocalCompletion(A, "phishing-001", "r1");
    saveLocalCompletion(A, "phishing-002", null);
    expect(localCompleted(A).size).toBe(2);
    expect(localReceipts(A)).toEqual({ "phishing-001": "r1" });
  });

  it("un recibo nuevo reemplaza al vacío, pero uno vacío no borra uno bueno", () => {
    saveLocalCompletion(A, "phishing-001", null);
    saveLocalCompletion(A, "phishing-001", "r1");
    saveLocalCompletion(A, "phishing-001", null);
    expect(localReceipts(A)).toEqual({ "phishing-001": "r1" });
  });

  it("si el almacenamiento está corrupto o bloqueado, no truena", () => {
    localStorage.setItem(`fyv_progress:${A}`, "{no es json");
    expect(localCompleted(A).size).toBe(0);
    setStorage({
      getItem() { throw new Error("bloqueado"); },
      setItem() { throw new Error("bloqueado"); },
    });
    expect(() => saveLocalCompletion(A, "phishing-001", "r1")).not.toThrow();
    expect(localCompleted(A).size).toBe(0);
  });
});
