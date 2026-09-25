"use client";
import { use, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Loader2, Award, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getWallet } from "@/identity";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AppNav } from "@/components/AppNav";
import type { Mission } from "@/missions/schema";

interface MissionResult {
  isCorrect: boolean;
  explanation: string;
  xpEarned: number;
  newCertifications: string[];
  selectedOptionLabel: string;
}

export default function MissionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router  = useRouter();

  const [mission, setMission]     = useState<Mission | null>(null);
  const [selected, setSelected]   = useState<string | null>(null);
  const [result, setResult]       = useState<MissionResult | null>(null);
  const [loading, setLoading]     = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("/api/missions/list")
      .then((r) => r.json())
      .then((missions: Mission[]) => {
        const found = missions.find((m) => m.id === id);
        setMission(found ?? null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit() {
    if (!selected || !mission) return;
    setSubmitting(true);

    const wallet  = await getWallet();
    const address = wallet?.publicKey ?? "GTEST000000000000000000000000000000000000000000000000000";

    const res = await fetch("/api/missions/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stellarAddress: address,
        missionId: mission.id,
        selectedOptionId: selected,
      }),
    });

    const data = await res.json();
    setResult(data);
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--gold)]" />
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
        <XCircle className="h-10 w-10 text-[var(--danger)]" strokeWidth={1.5} />
        <p className="text-sm text-[var(--cream-muted)]">Misión no encontrada</p>
        <Link href="/dashboard" className="text-sm text-[var(--gold)] hover:underline">
          Volver al mapa
        </Link>
      </div>
    );
  }

  const difficultyLabel = {
    beginner:     "Básico",
    intermediate: "Intermedio",
    advanced:     "Avanzado",
  }[mission.difficulty];

  const difficultyColor = {
    beginner:     "text-[var(--success)]",
    intermediate: "text-[var(--amber)]",
    advanced:     "text-[var(--danger)]",
  }[mission.difficulty];

  return (
    <div className="min-h-dvh pb-24">
      <AppNav back="/dashboard" />

      <div className="px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mx-auto max-w-xl space-y-5"
        >
          {/* Mission header */}
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-2.5 py-0.5 text-xs font-medium capitalize text-[var(--cream-muted)]">
                {mission.track.replace(/-/g, " ")}
              </span>
              <span className={`text-xs font-semibold ${difficultyColor}`}>
                {difficultyLabel}
              </span>
            </div>
            <h1 className="font-playfair text-2xl font-bold text-[var(--cream)]">
              {mission.title}
            </h1>
          </div>

          {/* Narrative — styled as a simulation frame */}
          <div className="relative overflow-hidden rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] shadow-[var(--shadow-md)]">
            <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--navy)]/60 px-4 py-2.5">
              <div className="flex gap-1.5" aria-hidden>
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--danger)]/50" />
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--amber)]/50" />
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--success)]/50" />
              </div>
              <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--cream-muted)]">
                simulacro
              </span>
            </div>
            <div className="p-5">
              <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--cream-muted)]">
                {mission.narrative}
              </p>
            </div>
          </div>

          {/* Options */}
          <AnimatePresence>
            {!result && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-2"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--cream-muted)]">
                  ¿Qué haces?
                </p>
                {mission.options.map((opt) => (
                  <motion.button
                    key={opt.id}
                    onClick={() => setSelected(opt.id)}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className={[
                      "w-full cursor-pointer rounded-xl border px-4 py-3.5 text-left text-sm transition-all duration-150",
                      selected === opt.id
                        ? "border-[var(--gold)] bg-[var(--gold-subtle)] text-[var(--cream)] shadow-[var(--shadow-gold)]"
                        : "border-[var(--border)] bg-[var(--surface)] text-[var(--cream-muted)] hover:border-[var(--border-strong)] hover:text-[var(--cream)]",
                    ].join(" ")}
                    aria-pressed={selected === opt.id}
                  >
                    <span className="mr-2 font-mono text-[10px] uppercase text-[var(--gold)]/70">
                      {opt.id}.
                    </span>
                    {opt.label}
                  </motion.button>
                ))}

                <Button
                  className="mt-2 w-full"
                  disabled={!selected}
                  loading={submitting}
                  onClick={handleSubmit}
                  size="lg"
                >
                  Confirmar respuesta
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Result */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 26 }}
                className="space-y-4"
              >
                {/* Verdict */}
                <div
                  className={[
                    "flex items-start gap-3 rounded-2xl border p-5",
                    result.isCorrect
                      ? "border-[var(--success-border)] bg-[var(--success-subtle)]"
                      : "border-[var(--danger-border)] bg-[var(--danger-subtle)]",
                  ].join(" ")}
                >
                  {result.isCorrect ? (
                    <CheckCircle
                      className="mt-0.5 h-6 w-6 shrink-0 text-[var(--success)]"
                      strokeWidth={2}
                    />
                  ) : (
                    <XCircle
                      className="mt-0.5 h-6 w-6 shrink-0 text-[var(--danger)]"
                      strokeWidth={2}
                    />
                  )}
                  <div>
                    <p
                      className={`font-semibold ${
                        result.isCorrect ? "text-[var(--success)]" : "text-[var(--danger)]"
                      }`}
                    >
                      {result.isCorrect
                        ? `+${result.xpEarned} XP — ¡Correcto!`
                        : "Trampa activada"}
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-[var(--cream-muted)]">
                      {result.explanation}
                    </p>
                  </div>
                </div>

                {/* New certification */}
                {result.newCertifications.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 280, damping: 24 }}
                    className="flex flex-col items-center gap-3 rounded-2xl border border-[var(--border-gold)] bg-[var(--gold-subtle)] p-5 text-center shadow-[var(--shadow-gold)]"
                  >
                    <Award className="h-8 w-8 text-[var(--gold)]" strokeWidth={1.5} />
                    <div>
                      <p className="font-semibold text-[var(--gold)]">
                        ¡Módulo certificado!
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--cream-muted)]">
                        {result.newCertifications.join(", ")}
                      </p>
                    </div>
                    <Link
                      href="/graduation"
                      className="text-sm font-medium text-[var(--cream)] hover:text-[var(--gold)] transition-colors"
                    >
                      Ver mi credencial →
                    </Link>
                  </motion.div>
                )}

                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => router.push("/dashboard")}
                >
                  Volver al mapa de misiones
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
