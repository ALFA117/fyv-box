import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

/**
 * POST /api/assistant — respuestas con IA gratuita para el asistente de FYV Box.
 * Cadena: Gemini (nivel gratuito, GEMINI_API_KEY solo servidor) → Pollinations (sin llave) → 503.
 * Si responde 503, el cliente se queda con sus respuestas predeterminadas y reglas.
 * No se guarda ni se registra el texto del usuario.
 */

export const dynamic = "force-dynamic";

const Body = z.object({
  message: z.string().trim().min(1).max(1500),
  mode: z.enum(["chat", "analyze"]),
});

const SYSTEM = `Eres "la pantera", el asistente de FYV Box: un simulador gratuito de estafas crypto en español hecho por la comunidad CriptoUNAM, que corre en Stellar testnet (sin dinero real).
Datos de la app que puedes usar: 22 simulacros en 6 módulos (phishing e impersonación, activos y airdrops falsos, ingeniería social, aprobaciones peligrosas, preventa y rendimiento falso, higiene de llaves). Se entra con correo y un código de un solo uso (Pollar crea una billetera Stellar testnet) o como invitado. Cada respuesta se firma con SEP-53. Al aprobar un módulo se emite una credencial on-chain en Stellar testnet, verificable en /verify. Páginas: /entrar, /dashboard (mapa), /graduation (credenciales), /verify, /stats.
Reglas:
- Responde en español de México, claro y directo, máximo 4 frases cortas, sin markdown ni listas con asteriscos.
- Nunca pidas ni aceptes frases semilla, llaves privadas, contraseñas o códigos; si el usuario pega una, dile que la considere comprometida y mueva sus fondos a una wallet nueva.
- No des la respuesta correcta de ninguna misión de FYV Box; explica el concepto y sugiere practicar.
- No des consejos de inversión ni digas qué comprar.
- Si no sabes algo de la app, dilo; no inventes funciones. Las cuentas son reales pero de testnet, no "simuladas".
- No firmes tus mensajes, no agregues despedidas, créditos ni texto entre corchetes al final.`;

const ANALYZE = `Analiza el siguiente mensaje que recibió el usuario y di si parece estafa. En máximo 4 frases: veredicto (estafa probable, dudoso o parece legítimo), las señales concretas que ves en ESTE mensaje y qué debe hacer ahora. Mensaje:\n"""`;

// Límite simple por instancia: 12 peticiones por minuto por IP.
const hits = new Map<string, { n: number; t: number }>();
function limited(ip: string): boolean {
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || now - h.t > 60_000) { hits.set(ip, { n: 1, t: now }); return false; }
  h.n++;
  return h.n > 12;
}

async function withTimeout(url: string, init: RequestInit, ms: number): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal, cache: "no-store" });
  } finally {
    clearTimeout(timer);
  }
}

function clean(text: string): string {
  return text
    .replace(/\*\*?|__|#+ /g, "")
    // Quita firmas o créditos que a veces agrega el modelo al final ("[Firma …]", "-- CriptoUNAM").
    .replace(/\n\s*(\[[^\]\n]*\]|--+[^\n]*|—[^\n]*)\s*$/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 1200);
}

async function gemini(prompt: string): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const model = process.env.GEMINI_MODEL || "gemini-flash-lite-latest";
  const res = await withTimeout(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        // Sin razonamiento extendido: respuestas cortas en 1–2 s y sin cortes por tiempo.
        generationConfig: { maxOutputTokens: 300, temperature: 0.4, thinkingConfig: { thinkingLevel: "minimal" } },
      }),
    },
    7_000,
  );
  if (!res.ok) throw new Error(`gemini ${res.status}`);
  const j = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  const text = j.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
  return text.trim() ? text : null;
}

async function pollinations(prompt: string): Promise<string | null> {
  const res = await withTimeout(
    "https://text.pollinations.ai/openai",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "openai", messages: [{ role: "system", content: SYSTEM }, { role: "user", content: prompt }] }),
    },
    8_000,
  );
  if (!res.ok) throw new Error(`pollinations ${res.status}`);
  const j = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const text = j.choices?.[0]?.message?.content ?? "";
  return text.trim() ? text : null;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (limited(ip)) return NextResponse.json({ error: "Demasiadas preguntas seguidas. Espera un minuto." }, { status: 429 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Mensaje inválido." }, { status: 400 });
  const { message, mode } = parsed.data;
  const prompt = mode === "analyze" ? `${ANALYZE}${message}\n"""` : message;

  // Gemini suele responder en 1–2 s pero a veces tiene picos: un reintento antes de pasar al respaldo.
  for (const [name, provider] of [["Gemini", gemini], ["Gemini", gemini], ["Pollinations", pollinations]] as const) {
    try {
      const text = await provider(prompt);
      if (text) return NextResponse.json({ text: clean(text), provider: name }, { headers: { "Cache-Control": "no-store" } });
    } catch (err) {
      console.error(`[FYV] assistant ${name} failed:`, err instanceof Error ? err.message : err);
    }
  }
  return NextResponse.json({ error: "La IA no está disponible ahora." }, { status: 503 });
}
