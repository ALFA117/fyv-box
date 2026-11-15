"use client";
import Link from "next/link";
import { Check, ChevronRight } from "lucide-react";
import { TrackArt } from "@/components/TrackArt";
import { DIFFICULTY, TRACK_STYLE } from "@/components/trackStyle";
import { TrackMeta, type Mission } from "@/missions/schema";
import type { PublicMission } from "@/missions/engine";

interface Props {
  track: Mission["track"];
  missions: PublicMission[];
  completed: Set<string>;
  nextId: string | null;
}

/** One module as a checklist: header with progress, then one row per mission. */
export function ModulePath({ track, missions, completed, nextId }: Props) {
  const style = TRACK_STYLE[track];
  const done = missions.filter((m) => completed.has(m.id)).length;
  const total = missions.length;
  const isComplete = total > 0 && done === total;
  const xpTotal = missions.reduce((a, m) => a + m.xp, 0);

  return (
    <section
      aria-labelledby={`track-${track}`}
      className={`relative overflow-hidden rounded-lg border bg-surface shadow-[var(--shadow-md)] ${isComplete ? "border-success-border" : "border-line-strong"}`}
    >
      <span aria-hidden className={`absolute inset-y-0 left-0 w-[3px] ${isComplete ? "bg-success" : style.bar}`} />

      <header className="relative flex items-center gap-4 border-b border-line px-5 py-4">
        <TrackArt track={track} size={40} />
        <div className="min-w-0 flex-1">
          <h2 id={`track-${track}`} className="text-title-3 text-cream">{TrackMeta[track].label}</h2>
          <p className="mt-0.5 font-mono text-xs text-cream-muted">
            {isComplete ? "Completado · credencial ganada" : `${total} ${total === 1 ? "misión" : "misiones"} · ${xpTotal} XP`}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-sm border px-2 py-0.5 font-mono text-xs tabular-nums ${isComplete ? "border-success-border text-success" : done > 0 ? "border-line-gold text-gold" : "border-line-strong text-cream-muted"}`}
          aria-label={`${done} de ${total} completadas`}
        >
          {done}/{total}
        </span>
        {done > 0 && (
          <span aria-hidden className="absolute inset-x-0 -bottom-px h-0.5 overflow-hidden">
            <span
              className={`block h-full origin-left transition-transform duration-700 ease-out ${isComplete ? "bg-success" : "bg-gold"}`}
              style={{ transform: `scaleX(${done / total})` }}
            />
          </span>
        )}
      </header>

      <ol aria-label={`Misiones de ${TrackMeta[track].label}`}>
        {missions.map((m, i) => {
          const isDone = completed.has(m.id);
          const isNext = m.id === nextId;
          const diff = DIFFICULTY[m.difficulty];
          return (
            <li key={m.id} className={i > 0 ? "border-t border-line" : ""}>
              <Link
                href={`/mission/${m.id}`}
                aria-label={`${m.title}${isDone ? ", completada" : isNext ? ", tu siguiente misión" : ""}, ${m.xp} XP`}
                className={`group flex min-h-[56px] items-center gap-3 px-5 py-3 sm:min-h-[52px] sm:py-2.5 transition-colors hover:bg-surface-2 ${isNext ? "bg-gold-subtle" : ""}`}
              >
                <span
                  aria-hidden
                  className={[
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border font-mono text-xs",
                    isDone
                      ? "border-success bg-success text-on-gold"
                      : isNext
                        ? "border-gold-active bg-gold text-on-gold"
                        : "border-line-strong text-cream-muted",
                  ].join(" ")}
                >
                  {isDone ? <Check className="h-4 w-4" strokeWidth={3} /> : String(i + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1 sm:flex sm:items-center sm:gap-4">
                  <span className={`block truncate text-[0.9375rem] font-medium sm:flex-1 ${isDone ? "text-cream-muted" : "text-cream"}`}>{m.title}</span>
                  <span className="block font-mono text-xs text-cream-dim sm:shrink-0 sm:text-right">
                    {isNext ? <span className="text-gold">Siguiente · </span> : isDone ? <span className="text-success">Hecha · </span> : null}
                    {diff?.label ?? m.difficulty} · {m.xp} XP
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-cream-dim transition-[color,transform] group-hover:translate-x-0.5 group-hover:text-gold" aria-hidden />
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
