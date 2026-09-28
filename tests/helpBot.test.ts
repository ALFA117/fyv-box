import { describe, expect, it } from "vitest";
import { analyzeMessage, looksLikeMessage, matchTopic } from "@/lib/helpBot";

describe("analizador de mensajes sospechosos", () => {
  it.each([
    ["Hola, soy del soporte oficial de Lobstr. Tu cuenta será suspendida en 24h. Verifica tu wallet aquí: https://lobstr-secure-login.com y escribe tus 12 palabras.", ["secreto", "urgencia", "soporte"]],
    ["¡Ganaste el drop de GOYA HACK! Reclama 50,000,000 PUMA antes de que se cierre: bit.ly/puma-claim", ["premio", "urgencia"]],
    ["Preventa exclusiva: rendimiento garantizado de 900% APY, lista blanca solo hoy. Escríbeme por Telegram.", ["ganancia", "privado"]],
    ["Para recibir tus 500 USDC primero manda 20 XLM de comisión para liberar los fondos.", ["enviar"]],
    ["Felicidades! Ganaste 1000 USDT del airdrop oficial de Tangem. Reclama en tangem-claim.xyz conectando tu wallet antes de 2 horas", ["premio", "firma", "urgencia"]],
  ])("marca riesgo alto: %s", (msg, expected) => {
    const a = analyzeMessage(msg);
    expect(a.level).toBe("alto");
    const ids = a.flags.map((f) => f.id);
    for (const id of expected) expect(ids).toContain(id);
    expect(a.practice?.href).toMatch(/^\/mission\//);
  });

  it.each([
    "Hola, ¿nos vemos mañana en el CIA para terminar el pitch? El link del repo es github.com/ALFA117/fyv-box",
    "Revisa https://stellar.org/learn para aprender sobre anchors.",
  ])("no da falsas alarmas: %s", (msg) => {
    expect(analyzeMessage(msg).level).toBe("bajo");
  });

  it("detecta dominios que imitan marcas, acortadores y punycode", () => {
    const ids = (t: string) => analyzeMessage(t).flags.map((f) => f.label).join(" | ");
    expect(ids("entra a freighter-wallet-verify.app")).toMatch(/imita una marca/);
    expect(ids("mira esto bit.ly/abc123")).toMatch(/acortado/);
    expect(ids("https://xn--stllar-9ua.org")).toMatch(/disfrazadas/);
  });

  it("reconoce un mensaje pegado frente a una pregunta", () => {
    expect(looksLikeMessage("¿cómo empiezo?")).toBe(false);
    expect(looksLikeMessage("reclama aquí https://claim-now.xyz")).toBe(true);
  });
});

describe("temas de ayuda", () => {
  it.each([
    ["¿cómo empiezo?", "empezar"],
    ["perdi mi fraze semiya", "frase"],
    ["qué es stellar", "stellar"],
    ["¿es dinero real?", "dinero-real"],
    ["no me llega el código", "correo"],
    ["hola", "saludo"],
  ])("%s → %s", (q, id) => {
    expect(matchTopic(q)?.id).toBe(id);
  });

  it("sin coincidencia devuelve null", () => {
    expect(matchTopic("asdfgh")).toBeNull();
  });
});
