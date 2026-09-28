"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, MessageCircle, Send, X } from "lucide-react";
import { FALLBACK, GREETING_CHIPS, matchTopic, topicById, type BotLink } from "@/lib/helpBot";

type Msg = { id: number; from: "bot" | "user"; text: string; links?: BotLink[] };

const GREETING = "¡Hola! Soy la pantera de FYV Box. Te ayudo con dudas de la app y con estafas crypto. ¿Qué quieres saber?";

function Avatar() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/panther-face.webp" alt="" width={32} height={32} className="h-8 w-8 shrink-0 rounded-full border border-line-gold bg-navy object-cover" />
  );
}

/** Asistente de ayuda con respuestas predeterminadas. Oculto dentro de las misiones para no ayudar a contestar. */
export function HelpBot() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{ id: 0, from: "bot", text: GREETING }]);
  const [chips, setChips] = useState<string[]>(GREETING_CHIPS);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
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

  function close() {
    setOpen(false);
    setTimeout(() => buttonRef.current?.focus(), 0);
  }

  function reply(question: string, topicId?: string) {
    const topic = topicId ? topicById(topicId) : matchTopic(question);
    setMsgs((m) => [...m, { id: nextId.current++, from: "user", text: question }]);
    setTyping(true);
    setChips([]);
    setTimeout(() => {
      setTyping(false);
      if (topic) {
        setMsgs((m) => [...m, { id: nextId.current++, from: "bot", text: topic.answer, links: topic.links }]);
        setChips(topic.next ?? GREETING_CHIPS);
      } else {
        setMsgs((m) => [...m, { id: nextId.current++, from: "bot", text: FALLBACK }]);
        setChips(GREETING_CHIPS);
      }
    }, reduce ? 0 : 450);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = input.trim().slice(0, 300);
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
            className="fixed right-4 z-[60] flex max-h-[min(560px,calc(100dvh-120px))] w-[calc(100vw-32px)] max-w-sm flex-col overflow-hidden rounded-2xl border border-line-strong bg-surface shadow-[var(--shadow-md)]"
          >
            <header className="flex items-center gap-3 border-b border-line bg-navy/60 px-4 py-3">
              <Avatar />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-cream">Asistente FYV</p>
                <p className="text-xs text-cream-muted">Respuestas predeterminadas · no es IA</p>
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
                    className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      m.from === "user" ? "rounded-br-md bg-gold text-on-gold" : "rounded-bl-md border border-line bg-navy text-cream"
                    }`}
                  >
                    <p>{m.text}</p>
                    {m.links && m.links.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {m.links.map((l) =>
                          l.href.startsWith("http") ? (
                            <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-line-gold px-2.5 text-xs font-semibold text-gold hover:bg-gold-subtle">
                              {l.label} <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                            </a>
                          ) : (
                            <Link key={l.href} href={l.href} onClick={close} className="inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-line-gold px-2.5 text-xs font-semibold text-gold hover:bg-gold-subtle">
                              {l.label} <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                            </Link>
                          ),
                        )}
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
                      className="min-h-[40px] shrink-0 whitespace-nowrap rounded-full border border-line-strong bg-navy px-3 text-xs font-medium text-cream transition-colors hover:border-line-gold hover:text-gold"
                    >
                      {t.chip}
                    </button>
                  );
                })}
              </div>
            )}

            <form onSubmit={submit} className="flex items-center gap-2 border-t border-line px-3 py-2.5">
              <label htmlFor="helpbot-input" className="sr-only">Escribe tu pregunta</label>
              <input
                ref={inputRef}
                id="helpbot-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={300}
                autoComplete="off"
                enterKeyHint="send"
                placeholder="Escribe tu duda…"
                className="h-11 min-w-0 flex-1 rounded-xl border border-line bg-navy px-3 text-base text-cream placeholder:text-cream-dim focus:border-gold-ring focus:outline-none"
              />
              <button type="submit" aria-label="Enviar pregunta" disabled={!input.trim() || typing} className="tap flex items-center justify-center rounded-xl bg-gold text-on-gold disabled:opacity-45">
                <Send className="h-4 w-4" aria-hidden />
              </button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>

      <motion.button
        ref={buttonRef}
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
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
