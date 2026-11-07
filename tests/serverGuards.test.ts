import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { dbKnownDown, guardedFetch, markDbDown, resetDbHealth } from "@/lib/supabase";
import { rateLimit, resetRateLimits } from "@/lib/rateLimit";
import { claimIssuance, releaseIssuance, resetIssuance } from "@/lib/issuance";

const saved = { url: process.env.NEXT_PUBLIC_SUPABASE_URL, anon: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY };

function restore(key: string, value: string | undefined) {
  if (value === undefined) delete process.env[key];
  else process.env[key] = value;
}

beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.invalid";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon";
  resetDbHealth();
  resetRateLimits();
  resetIssuance();
});
afterEach(() => {
  vi.unstubAllGlobals();
  restore("NEXT_PUBLIC_SUPABASE_URL", saved.url);
  restore("NEXT_PUBLIC_SUPABASE_ANON_KEY", saved.anon);
});

describe("base de datos caída: fallar rápido", () => {
  it("sin URL configurada se da por caída", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    expect(dbKnownDown()).toBe(true);
  });

  it("tras un error de red, las consultas siguientes fallan sin salir a la red durante un minuto", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError("fetch failed"));
    vi.stubGlobal("fetch", fetchMock);

    await expect(guardedFetch("https://example.invalid/rest/v1/x")).rejects.toThrow("fetch failed");
    expect(dbKnownDown()).toBe(true);
    await expect(guardedFetch("https://example.invalid/rest/v1/x")).rejects.toThrow(/no responde/);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    expect(dbKnownDown(Date.now() + 61_000)).toBe(false);
  });

  it("una respuesta 5xx del proxy (proyecto pausado) también la marca caída; un 4xx no", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 404 })));
    await guardedFetch("https://example.invalid/rest/v1/x");
    expect(dbKnownDown()).toBe(false);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 540 })));
    await guardedFetch("https://example.invalid/rest/v1/x");
    expect(dbKnownDown()).toBe(true);
  });

  it("markDbDown caduca", () => {
    const now = 1_000_000;
    markDbDown(now);
    expect(dbKnownDown(now + 1000)).toBe(true);
    expect(dbKnownDown(now + 60_001)).toBe(false);
  });
});

describe("límites de ritmo y candado de emisión", () => {
  it("permite hasta el límite dentro de la ventana y luego frena", () => {
    const t = 5_000_000;
    for (let i = 0; i < 3; i++) expect(rateLimit("ip:1", 3, 1000, t + i)).toBe(true);
    expect(rateLimit("ip:1", 3, 1000, t + 10)).toBe(false);
    expect(rateLimit("ip:2", 3, 1000, t + 10)).toBe(true);
    expect(rateLimit("ip:1", 3, 1000, t + 2000)).toBe(true);
  });

  it("no deja emitir dos veces el mismo módulo a la vez, y se libera si falla", () => {
    expect(claimIssuance("GA", "phishing")).toBe(true);
    expect(claimIssuance("GA", "phishing")).toBe(false);
    expect(claimIssuance("GA", "fake-assets")).toBe(true);
    releaseIssuance("GA", "phishing");
    expect(claimIssuance("GA", "phishing")).toBe(true);
  });
});
