import Link from "next/link";
import { Wordmark } from "./Wordmark";

const LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/dashboard", label: "Misiones" },
  { href: "/verify", label: "Verificar" },
  { href: "/stats", label: "Estadísticas" },
];

/** `clearFixedBar` reserves room for a fixed bottom action bar on phones. */
export function AppFooter({ clearFixedBar = false }: { clearFixedBar?: boolean }) {
  return (
    <footer className={`px-gutter mt-16 border-t border-line pt-8 ${clearFixedBar ? "pb-44 lg:pb-safe" : "pb-safe"}`}>
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <Wordmark size="sm" />
          <p className="text-xs text-cream-muted">Entrenamiento anti-estafas · Stellar testnet</p>
        </div>
        <nav aria-label="Pie de página" className="flex flex-wrap items-center justify-center gap-1">
          {LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className="flex min-h-[44px] items-center rounded-xl px-3 text-sm text-cream-muted transition-colors hover:text-gold">
              {label}
            </Link>
          ))}
          <a
            href="https://github.com/ALFA117/fyv-box"
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[44px] items-center rounded-xl px-3 text-sm text-cream-muted transition-colors hover:text-gold"
          >
            GitHub
          </a>
        </nav>
      </div>
      <p className="mx-auto mt-4 max-w-5xl text-center text-xs text-cream-dim sm:text-left">
        © 2026 FYV Box · Hecho por la comunidad CriptoUNAM · Sin dinero real
      </p>
    </footer>
  );
}
