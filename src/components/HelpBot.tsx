"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, ArrowUpRight, MessageCircle, Send, ShieldAlert, ShieldCheck, Sparkles, X } from "lucide-react";
import {
  ANALYZE_PROMPT, FALLBACK, analyzeMessage, chipsForPath, looksLikeMessage, matchTopic, topicById,
  type Analysis, type BotLink,
} from "@/lib/helpBot";

/** `ai`: nombre del modelo gratuito que generó la respuesta (se etiqueta en la burbuja). */
type Msg = { id: number; from: "bot" | "user"; text: string; links?: BotLink[]; analysis?: Analysis; ai?: string };

const GREETING =
  "¡Hola! Soy la pantera de FYV Box. Te ayudo con dudas de la app y, si te llegó un mensaje o link raro, pégalo aquí y te digo qué señales de estafa tiene.";
const NUDGE_KEY = "fyv_helpbot_nudged";
const ANALYSIS_CHIPS = ["analizar", "sospechoso", "frase"];

const LEVEL_STYLE = {
  alto:  { box: "border-danger-border bg-danger-subtle", text: "text-danger", label: "Riesgo alto", Icon: ShieldAlert },
  medio: { box: "border-amber-border bg-amber-subtle", text: "text-amber", label: "Precaución", Icon: AlertTriangle },
  bajo:  { box: "border-success-border bg-success-subtle", text: "text-success", label: "Sin señales claras", Icon: ShieldCheck },
} as const;

function Avatar() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/panther-face.webp" alt="" width={32} height={32} className="h-8 w-8 shrink-0 rounded-full border border-line-gold bg-navy object-cover" />
  );
}

function AnalysisCard({ a }: { a: Analysis }) {
  const st = LEVEL_STYLE[a.level];
  return (
    <div className="space-y-2">
      <p className={`flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs font-bold ${st.box} ${st.text}`}>
        <st.Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
        {st.label} · {a.flags.length} {a.flags.length === 1 ? "señal" : "señales"}
      </p>
      <p>{a.summary}</p>
      {a.flags.length > 0 && (
        <ul className="space-y-1.5">
          {a.flags.map((f) => (
            <li key={f.id} className="rounded-lg border border-line bg-surface/60 px-2.5 py-2">
              <span className="block break-words text-xs font-semibold text-cream">{f.label}</span>
              <span className="block text-xs text-cream-muted">{f.detail}</span>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-cream-dim">Revisión automática con reglas, en tu navegador. No reemplaza tu criterio.</p>
    </div>
  );
}

function LinkChip({ l, onNavigate }: { l: BotLink; onNavigate: () => void }) {
  const cls = "inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-line-gold px-2.5 text-xs font-semibold text-gold hover:bg-gold-subtle";
  return l.href.startsWith("http") ? (
    <a href={l.href} target="_blank" rel="noopener noreferrer" className={cls}>
      {l.label} <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
    </a>
  ) : (
    <Link href={l.href} onClick={onNavigate} className={cls}>
      {l.label} <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
    </Link>
  );
}

/**
 * Asistente de ayuda con respuestas predeterminadas y un analizador de mensajes por reglas (sin IA).
 * Oculto dentro de las misiones para no ayudar a contestar.
 */
export function HelpBot() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{ id: 0, from: "bot", text: GREETING }]);
  const [chips, setChips] = useState<string[]>(() => chipsForPath(pathname));
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [analyzeNext, setAnalyzeNext] = useState(false);
  const [nudge, setNudge] = useState(false);
  const nextId = useRef(1);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const hidden = pathname?.startsWith("/mission/");

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [msgs, typing, reduce]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => { clearTimeout(t); window.removeEventListener("keydown", onKey); };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (hidden) setOpen(false); }, [hidden]);

  // Sugerencias según la pantalla, mientras la conversación siga en el saludo.
  useEffect(() => {
    if (msgs.length === 1) setChips(chipsForPath(pathname));
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Aviso único la primera vez: "¿Dudas? Pregúntame".
  useEffect(() => {
    let seen = true;
    try { seen = localStorage.getItem(NUDGE_KEY) === "1"; } catch { /* sin storage: no molestar */ }
    if (seen) return;
    const t = setTimeout(() => setNudge(true), 5000);
    return () => clearTimeout(t);
  }, []);

  function dismissNudge() {
    setNudge(false);
    try { localStorage.setItem(NUDGE_KEY, "1"); } catch { /* ignore */ }
  }

  function close() {
    setOpen(false);
    setTimeout(() => buttonRef.current?.focus(), 0);
  }

  function botSay(msg: Omit<Msg, "id" | "from">, nextChips: string[]) {
    setTyping(true);
    setChips([]);
    setTimeout(() => {
      setTyping(false);
      setMsgs((m) => [...m, { id: nextId.current++, from: "bot", ...msg }]);
      setChips(nextChips);
    }, reduce ? 0 : 450);
  }

  /** Pregunta a la IA gratuita del servidor; si no responde, devuelve null y se queda lo predeterminado. */
  async function askAI(message: string, mode: "chat" | "analyze"): Promise<{ text: string; provider: string } | null> {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 20_000);
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, mode }),
        signal: ctrl.signal,
      }).finally(() => clearTimeout(timer));
      if (!res.ok) return null;
      const d = (await res.json()) as { text?: string; provider?: string };
      return d.text ? { text: d.text, provider: d.provider ?? "IA" } : null;
    } catch {
      return null;
    }
  }

  function sayAI(r: { text: string; provider: string }, nextChips: string[]) {
    setMsgs((m) => [...m, { id: nextId.current++, from: "bot", text: r.text, ai: r.provider }]);
    setChips(nextChips);
  }

  async function sayAnalysis(text: string) {
    const a = analyzeMessage(text);
    botSay({ text: "", analysis: a, links: a.practice ? [a.practice] : undefined }, []);
    // Segunda opinión con IA sobre ESTE mensaje, debajo del análisis por reglas.
    setTimeout(() => setTyping(true), reduce ? 0 : 500);
    const r = await askAI(text, "analyze");
    setTyping(false);
    if (r) sayAI(r, ANALYSIS_CHIPS);
    else setChips(ANALYSIS_CHIPS);
  }

  async function sayFallback(question: string) {
    setTyping(true);
    setChips([]);
    const r = await askAI(question, "chat");
    setTyping(false);
    if (r) {
      sayAI(r, chipsForPath(pathname));
    } else {
      setMsgs((m) => [...m, { id: nextId.current++, from: "bot", text: FALLBACK }]);
      setChips(chipsForPath(pathname));
    }
  }

  function reply(question: string, topicId?: string) {
    setMsgs((m) => [...m, { id: nextId.current++, from: "user", text: question }]);

    const pasted = !topicId && looksLikeMessage(question);
    if (topicId === "analizar" || (!topicId && !pasted && matchTopic(question)?.id === "analizar")) {
      setAnalyzeNext(true);
      botSay({ text: ANALYZE_PROMPT }, []);
      return;
    }

    // Mensaje pegado (o modo análisis activo): se revisa con reglas, en el navegador.
    if (!topicId && (analyzeNext || pasted)) {
      setAnalyzeNext(false);
      sayAnalysis(question);
      return;
    }

    const topic = topicId ? topicById(topicId) : matchTopic(question);
    if (topic) {
      botSay({ text: topic.answer, links: topic.links }, topic.next ?? chipsForPath(pathname));
      return;
    }

    // Sin tema, pero con alguna señal de estafa: mejor analizarlo que responder "no entendí".
    if (analyzeMessage(question).flags.length > 0) {
      sayAnalysis(question);
      return;
    }
    // Nada predeterminado encaja: responde la IA gratuita (o el mensaje de siempre si no está disponible).
    void sayFallback(question);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = input.trim().slice(0, 1500);
    if (!q || typing) return;
    setInput("");
    reply(q);
  }

  if (hidden) return null;

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.section
            key="panel"
            role="dialog"
            aria-modal="false"
            aria-label="Asistente de ayuda de FYV Box"
            initial={reduce ? false : { opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.14 } }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            style={{ transformOrigin: "bottom right", bottom: "calc(var(--safe-bottom) + 84px)" }}
            className="fixed right-4 z-[60] flex max-h-[min(600px,calc(100dvh-120px))] w-[calc(100vw-32px)] max-w-sm flex-col overflow-hidden rounded-2xl border border-line-strong bg-surface shadow-[var(--shadow-md)]"
          >
            <header className="flex items-center gap-3 border-b border-line bg-navy/60 px-4 py-3">
              <Avatar />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-cream">Asistente FYV</p>
                <p className="text-xs text-cream-muted">Respuestas guiadas + IA gratuita (Gemini)</p>
              </div>
              <button type="button" onClick={close} aria-label="Cerrar asistente" className="tap flex items-center justify-center rounded-xl text-cream-muted hover:text-cream">
                <X className="h-5 w-5" aria-hidden />
              </button>
            </header>

            <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
              {msgs.map((m) => (
                <motion.div
                  key={m.id}
                  initial={reduce ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-end gap-2 ${m.from === "user" ? "justify-end" : ""}`}
                >
                  {m.from === "bot" && <Avatar />}
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      m.from === "user" ? "rounded-br-md bg-gold text-on-gold" : "rounded-bl-md border border-line bg-navy text-cream"
                    }`}
                  >
                    {m.ai && (
                      <p className="mb-1 flex items-center gap-1 text-[0.75rem] font-semibold text-info">
                        <Sparkles className="h-3 w-3" aria-hidden /> Opinión de IA · {m.ai} · puede equivocarse
                      </p>
                    )}
                    {m.text && <p className="line-clamp-[12] whitespace-pre-line break-words">{m.text}</p>}
                    {m.analysis && <AnalysisCard a={m.analysis} />}
                    {m.links && m.links.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {m.links.map((l) => <LinkChip key={l.href} l={l} onNavigate={close} />)}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {typing && (
                <div className="flex items-end gap-2" role="status" aria-label="Escribiendo">
                  <Avatar />
                  <div className="flex gap-1 rounded-2xl rounded-bl-md border border-line bg-navy px-3.5 py-3">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-cream-muted" style={{ animationDelay: `${i * 120}ms` }} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {chips.length > 0 && (
              <div className="scroll-x flex gap-2 overflow-x-auto border-t border-line px-4 py-2.5" aria-label="Preguntas sugeridas">
                {chips.map((id) => {
                  const t = topicById(id);
                  if (!t) return null;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => reply(t.chip, t.id)}
                      className={`min-h-[40px] shrink-0 whitespace-nowrap rounded-full border px-3 text-xs font-medium transition-colors ${
                        id === "analizar"
                          ? "border-line-gold bg-gold-subtle text-gold hover:border-gold-ring"
                          : "border-line-strong bg-navy text-cream hover:border-line-gold hover:text-gold"
                      }`}
                    >
                      {t.chip}
                    </button>
                  );
                })}
              </div>
            )}

            <form onSubmit={submit} className="flex items-center gap-2 border-t border-line px-3 py-2.5">
              <label htmlFor="helpbot-input" className="sr-only">Escribe tu pregunta o pega un mensaje</label>
              <input
                ref={inputRef}
                id="helpbot-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={1500}
                autoComplete="off"
                enterKeyHint="send"
                placeholder={analyzeNext ? "Pega aquí el mensaje sospechoso…" : "Escribe tu duda o pega un mensaje…"}
                className="h-11 min-w-0 flex-1 rounded-xl border border-line bg-navy px-3 text-base text-cream placeholder:text-cream-dim focus:border-gold-ring focus:outline-none"
              />
              <button type="submit" aria-label="Enviar" disabled={!input.trim() || typing} className="tap flex items-center justify-center rounded-xl bg-gold text-on-gold disabled:opacity-45">
                <Send className="h-4 w-4" aria-hidden />
              </button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {nudge && !open && (
          <motion.div
            key="nudge"
            initial={reduce ? false : { opacity: 0, x: 12, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 8, transition: { duration: 0.12 } }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            style={{ bottom: "calc(var(--safe-bottom) + 22px)" }}
            className="fixed right-[84px] z-[60] flex max-w-[230px] items-center gap-1 rounded-2xl rounded-br-md border border-line-gold bg-surface py-1.5 pl-3 pr-1 text-sm text-cream shadow-[var(--shadow-md)]"
          >
            <button type="button" onClick={() => { dismissNudge(); setOpen(true); }} className="py-1 text-left">
              ¿Dudas o un mensaje raro? <span className="font-semibold text-gold">Pregúntame</span>
            </button>
            <button type="button" onClick={dismissNudge} aria-label="Cerrar aviso" className="tap flex shrink-0 items-center justify-center rounded-lg text-cream-muted hover:text-cream">
              <X className="h-4 w-4" aria-hidden />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        ref={buttonRef}
        type="button"
        onClick={() => { dismissNudge(); if (open) close(); else setOpen(true); }}
        aria-label={open ? "Cerrar asistente de ayuda" : "Abrir asistente de ayuda"}
        aria-expanded={open}
        whileHover={reduce ? undefined : { scale: 1.05 }}
        whileTap={reduce ? undefined : { scale: 0.94 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        style={{ bottom: "calc(var(--safe-bottom) + 16px)" }}
        className="fixed right-4 z-[60] flex h-14 w-14 items-center justify-center rounded-full border border-line-gold bg-surface shadow-[var(--shadow-md)]"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span key="x" initial={reduce ? false : { rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="h-6 w-6 text-cream" aria-hidden />
            </motion.span>
          ) : (
            <motion.span key="bot" initial={reduce ? false : { scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} transition={{ duration: 0.15 }} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/panther-face.webp" alt="" width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
              <MessageCircle className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-gold p-0.5 text-on-gold" aria-hidden />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
