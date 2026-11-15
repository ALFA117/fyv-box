import Link from "next/link";
import { ArrowRight, CheckCircle, ExternalLink, FlaskConical } from "lucide-react";

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
      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm bg-danger font-mono text-[12px] font-medium leading-none text-on-danger"
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
      <div className="overflow-hidden rounded-lg border border-line-strong bg-surface shadow-[var(--shadow-lg)]">
        <div className="flex items-center gap-3 border-b border-line px-4 py-2.5">
          <span className="min-w-0 flex-1 truncate font-mono text-xs text-cream-muted">Misión · {data.title}</span>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-sm border border-amber-border bg-amber-subtle px-1.5 py-0.5 font-mono text-xs text-amber">
            <FlaskConical className="h-3 w-3" aria-hidden />
            simulación
          </span>
        </div>

        <div className="space-y-3.5 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-line-strong bg-surface-2 text-sm font-semibold text-cream" aria-hidden>
              {data.senderName[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-cream">{data.senderName}</p>
              <p className="flex min-w-0 items-center gap-1.5">
                <span className="min-w-0 truncate font-mono text-xs text-danger underline decoration-danger/50 decoration-wavy underline-offset-4" title={data.sender}>&lt;{data.sender}&gt;</span>
                <Pin n={1} />
              </p>
            </div>
          </div>

          <p className="flex items-start gap-2 text-[15px] font-semibold leading-snug text-cream">
            <span className="flex-1">{data.subject}</span>
            <Pin n={2} />
          </p>

          {data.domain && (
            <div className="flex items-center gap-2 rounded-md border border-danger-border bg-danger-subtle px-3 py-2.5">
              <ExternalLink className="h-4 w-4 shrink-0 text-danger" aria-hidden />
              <span className="min-w-0 flex-1 truncate font-mono text-xs text-danger">{data.domain}/login</span>
              <Pin n={3} />
            </div>
          )}

          <ol className="space-y-2 border-t border-dashed border-line-strong pt-3.5">
            {FLAGS.map((f) => (
              <li key={f.n} className="flex items-center gap-2.5 text-sm text-cream-muted">
                <Pin n={f.n} />
                {f.label}
              </li>
            ))}
          </ol>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-success-border bg-success-subtle px-4 py-3 sm:px-5">
          <span className="flex items-center gap-2 text-sm font-semibold text-success">
            <CheckCircle className="h-4 w-4" aria-hidden />
            Detectaste la trampa
          </span>
          <span className="font-mono text-xs font-medium text-gold">+{data.xp} XP</span>
        </div>
      </div>

      <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-x-3 text-sm text-cream-muted">
        <span>Misión real del catálogo, con sus señales marcadas.</span>
        <Link href={`/mission/${data.id}`} className="inline-flex min-h-[44px] items-center gap-1 font-semibold text-gold underline-offset-4 hover:underline">
          Pruébala <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </figcaption>
    </figure>
  );
}
