"use client";
import { use, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getWallet } from "@/identity";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
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
  const router = useRouter();

  const [mission, setMission] = useState<Mission | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<MissionResult | null>(null);
  const [loading, setLoading] = useState(false);
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

    const wallet = await getWallet();
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
        <p className="text-[var(--cream-muted)]">Misión no encontrada</p>
        <Link href="/dashboard" className="text-sm text-[var(--gold)] hover:underline">
          Volver al mapa
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-dvh px-4 py-6">
      {/* Nav */}
      <Link
        href="/dashboard"
        className="mb-6 flex items-center gap-1.5 text-sm text-[var(--cream-muted)] hover:text-[var(--cream)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Mapa de misiones
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto max-w-xl space-y-5"
      >
        {/* Mission header */}
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-widest text-[var(--gold)]">
            {mission.track.replace(/-/g, " ")} · {mission.difficulty}
          </p>
          <h1 className="serif text-2xl font-bold text-[var(--cream)]">{mission.title}</h1>
        </div>

        {/* Narrative */}
        <Card>
          <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--cream-muted)]">
            {mission.narrative}
          </p>
        </Card>

        {/* Options */}
        {!result && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-[var(--cream-muted)]">¿Qué haces?</p>
            {mission.options.map((opt) => (
              <motion.button
                key={opt.id}
                onClick={() => setSelected(opt.id)}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition-colors
                  ${selected === opt.id
                    ? "border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--cream)]"
                    : "border-white/10 bg-[var(--surface)] text-[var(--cream-muted)] hover:border-white/20 hover:text-[var(--cream)]"
                  }`}
                aria-pressed={selected === opt.id}
              >
                <span className="mr-2 font-mono text-xs uppercase text-[var(--gold)]/70">
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
            >
              Confirmar respuesta
            </Button>
          </div>
        )}

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
              <div
                className={`flex items-start gap-3 rounded-2xl border p-4
                  ${result.isCorrect
                    ? "border-[var(--success)]/30 bg-[var(--success)]/10"
                    : "border-[var(--error)]/30 bg-[var(--error)]/10"
                  }`}
              >
                {result.isCorrect ? (
                  <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--success)]" />
                ) : (
                  <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--error)]" />
                )}
                <div>
                  <p className={`font-semibold ${result.isCorrect ? "text-[var(--success)]" : "text-[var(--error)]"}`}>
                    {result.isCorrect ? `+${result.xpEarned} XP — ¡Correcto!` : "Trampa activada"}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--cream-muted)]">
                    {result.explanation}
                  </p>
                </div>
              </div>

              {result.newCertifications.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="rounded-2xl border border-[var(--gold)]/40 bg-[var(--gold)]/10 p-4 text-center"
                >
                  <p className="text-lg">🎓</p>
                  <p className="font-semibold text-[var(--gold)]">
                    ¡Módulo certificado: {result.newCertifications.join(", ")}!
                  </p>
                  <Link
                    href="/graduation"
                    className="mt-2 block text-sm text-[var(--cream)] underline"
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
                Volver al mapa
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
