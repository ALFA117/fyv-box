import { describe, expect, it } from "vitest";
import {
  evaluateMission, getCertifiableModules, getMission, getMissionsByTrack, loadCatalog, toPublicMission,
} from "@/missions/engine";

const catalog = loadCatalog();

describe("catálogo de misiones", () => {
  it("tiene 22 misiones en 6 módulos", () => {
    expect(catalog).toHaveLength(22);
    expect(new Set(catalog.map((m) => m.track)).size).toBe(6);
  });

  it("cada misión tiene exactamente una respuesta correcta", () => {
    for (const m of catalog) {
      expect(m.options.filter((o) => o.isCorrect), m.id).toHaveLength(1);
    }
  });

  it("la respuesta correcta no se queda en la misma posición (máx. 7 de 22 en una letra)", () => {
    const slots = catalog.map((m) => m.options.findIndex((o) => o.isCorrect));
    for (let s = 0; s < 4; s++) {
      expect(slots.filter((x) => x === s).length).toBeLessThanOrEqual(7);
    }
  });

  it("la respuesta correcta no es siempre la más larga", () => {
    const longest = catalog.filter((m) => {
      const max = Math.max(...m.options.map((o) => o.label.length));
      return m.options.find((o) => o.isCorrect)!.label.length === max;
    });
    expect(longest.length).toBeLessThan(catalog.length / 2);
  });
});

describe("lo que llega al navegador", () => {
  it("no incluye respuestas correctas ni explicaciones", () => {
    for (const m of catalog) {
      const pub = toPublicMission(m) as unknown as Record<string, unknown>;
      const json = JSON.stringify(pub);
      expect(json).not.toContain("isCorrect");
      expect(pub.explanation).toBeUndefined();
    }
  });
});

describe("evaluación", () => {
  const m = getMission("phishing-001")!;
  const correct = m.options.find((o) => o.isCorrect)!;
  const wrong = m.options.find((o) => !o.isCorrect)!;

  it("da XP solo con la respuesta correcta", () => {
    expect(evaluateMission(m, correct.id)).toMatchObject({ isCorrect: true, xpEarned: m.xp });
    expect(evaluateMission(m, wrong.id)).toMatchObject({ isCorrect: false, xpEarned: 0 });
  });

  it("una opción inexistente cuenta como incorrecta", () => {
    expect(evaluateMission(m, "zzz").isCorrect).toBe(false);
  });
});

describe("credenciales por módulo", () => {
  it("se emite solo al completar todas las misiones del módulo", () => {
    const ids = getMissionsByTrack("phishing").map((m) => m.id);
    expect(getCertifiableModules(ids.slice(0, -1))).not.toContain("phishing");
    expect(getCertifiableModules(ids)).toEqual(["phishing"]);
  });

  it("sin misiones completadas no hay credenciales", () => {
    expect(getCertifiableModules([])).toEqual([]);
  });
});
