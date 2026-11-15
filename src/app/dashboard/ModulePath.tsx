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

  return (
    <section
      aria-labelledby={`track-${track}`}
      className={`relative overflow-hidden rounded-lg border bg-surface shadow-[var(--shadow-md)] ${isComplete ? "border-success-border" : "border-line-strong"}`}
    >
      <span aria-hidden className={`absolute inset-y-0 left-0 w-[3px] ${isComplete ? "bg-success" : style.bar}`} />

      <header className="flex items-center gap-4 border-b border-line px-5 py-4">
        <TrackArt track={track} size={40} />
        <div className="min-w-0 flex-1">
          <h2 id={`track-${track}`} className="text-title-3 text-cream">{TrackMeta[track].label}</h2>
          <p className="mt-0.5 font-mono text-xs text-cream-muted">
            {isComplete ? "Completado · credencial ganada" : `${done}/${total} misiones`}
          </p>
        </div>
        <div className="h-1.5 w-16 shrink-0 overflow-hidden rounded-sm bg-line" aria-hidden>
          <div
            className={`h-full origin-left transition-transform duration-700 ease-out ${isComplete ? "bg-success" : "bg-gold"}`}
            style={{ transform: `scaleX(${total ? done / total : 0})` }}
          />
        </div>
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
                className={`group flex min-h-[56px] items-center gap-3 px-5 py-3 transition-colors hover:bg-surface-2 ${isNext ? "bg-gold-subtle" : ""}`}
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
                <span className="min-w-0 flex-1">
                  <span className={`block truncate text-[0.9375rem] font-medium ${isDone ? "text-cream-muted" : "text-cream"}`}>{m.title}</span>
                  <span className="block font-mono text-xs text-cream-dim">
                    {isNext ? <span className="text-gold">Siguiente · </span> : null}
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
