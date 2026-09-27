import Link from "next/link";
import { AlertTriangle, CheckCircle, ExternalLink, FlaskConical, Star } from "lucide-react";

export interface HeroPreviewData {
  id: string;
  title: string;
  xp: number;
  senderName: string;
  sender: string;
  subject: string;
  domain: string;
}

const FLAGS = [
  { n: 1, label: "Dominio que imita a la marca" },
  { n: 2, label: "Urgencia para que no pienses" },
  { n: 3, label: "Te pide iniciar sesión desde un link" },
];

function Pin({ n }: { n: number }) {
  return (
    <span
      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-danger text-[12px] font-bold leading-none text-on-danger shadow-[0_0_0_3px_var(--danger-subtle)]"
      aria-hidden
    >
      {n}
    </span>
  );
}

/** Real sample mission rendered as a product preview, with its red flags annotated. */
export function HeroPreview({ data }: { data: HeroPreviewData }) {
  return (
    <figure className="relative mx-auto w-full max-w-md" aria-label={`Vista previa de la misión ${data.title}`}>
      <div className="relative overflow-hidden rounded-3xl border border-line-strong bg-surface/95 shadow-[var(--shadow-lg)] backdrop-blur">
        <div className="flex items-center gap-2 border-b border-line bg-navy/70 px-4 py-2.5">
          <div className="flex gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-sim-red" />
            <span className="h-2.5 w-2.5 rounded-full bg-sim-yellow" />
            <span className="h-2.5 w-2.5 rounded-full bg-sim-green" />
          </div>
          <span className="min-w-0 flex-1 truncate text-center text-xs text-cream-muted">Misión · {data.title}</span>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-border bg-amber-subtle px-2 py-0.5 text-xs font-semibold text-amber">
            <FlaskConical className="h-3 w-3" aria-hidden />
            Simulación
          </span>
        </div>

        <div className="space-y-3 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-danger-border bg-danger-subtle text-sm font-bold text-danger" aria-hidden>
              {data.senderName[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-cream">{data.senderName}</p>
              <p className="flex min-w-0 items-center gap-1.5">
                <span className="min-w-0 truncate font-mono text-xs text-danger" title={data.sender}>&lt;{data.sender}&gt;</span>
                <Pin n={1} />
              </p>
            </div>
          </div>

          <p className="flex items-start gap-2 text-[15px] font-semibold leading-snug text-cream">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber" aria-hidden />
            <span className="flex-1">{data.subject}</span>
            <Pin n={2} />
          </p>

          {data.domain && (
            <div className="flex items-center gap-2 rounded-xl border border-danger-border bg-danger-subtle px-3 py-2.5">
              <ExternalLink className="h-4 w-4 shrink-0 text-danger" aria-hidden />
              <span className="min-w-0 flex-1 truncate font-mono text-xs text-danger">{data.domain}/login</span>
              <Pin n={3} />
            </div>
          )}

          <ol className="space-y-1.5 border-t border-line pt-3">
            {FLAGS.map((f) => (
              <li key={f.n} className="flex items-center gap-2 text-sm text-cream-muted">
                <Pin n={f.n} />
                {f.label}
              </li>
            ))}
          </ol>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-success-border bg-success-subtle px-4 py-3 sm:px-5">
          <span className="flex items-center gap-2 text-sm font-semibold text-success">
            <CheckCircle className="h-4 w-4" aria-hidden />
            ¡Detectaste la trampa!
          </span>
          <span className="flex items-center gap-1 rounded-full border border-line-gold bg-gold-subtle px-2.5 py-1 text-xs font-bold text-gold">
            <Star className="h-3.5 w-3.5" fill="currentColor" aria-hidden />+{data.xp} XP
          </span>
        </div>
      </div>

      <figcaption className="mt-3 text-center text-sm text-cream-muted">
        Así se ve una misión real.{" "}
        <Link href={`/mission/${data.id}`} className="inline-flex min-h-[44px] items-center font-semibold text-gold underline-offset-4 hover:underline">
          Pruébala
        </Link>
      </figcaption>
    </figure>
  );
}
