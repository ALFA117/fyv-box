import { NextResponse } from "next/server";
import { loadCatalog } from "@/missions/engine";
import { TrackMeta, type Mission } from "@/missions/schema";
import { siteUrl } from "@/lib/brand";

export const dynamic = "force-static";

/* ─── Lucide icons (inline SVG, stroke = currentColor) ─────────────────────── */
const ICONS: Record<string, string> = {
  fish: `<path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z"/><path d="M18 12v.5"/><path d="M16 17.93a9.77 9.77 0 0 1 0-11.86"/><path d="M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5-.23 6.5C5.58 18.03 7 16 7 13.33"/>`,
  coins: `<circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/>`,
  message: `<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>`,
  zap: `<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>`,
  trending: `<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>`,
  key: `<path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/>`,
  wallet: `<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>`,
  target: `<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>`,
  book: `<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>`,
  award: `<path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"/><circle cx="12" cy="8" r="6"/>`,
  check: `<path d="M20 6 9 17l-5-5"/>`,
  right: `<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>`,
  left: `<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>`,
  external: `<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>`,
  code: `<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>`,
  alert: `<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>`,
  flask: `<path d="M10 2v7.31"/><path d="M14 9.3V1.99"/><path d="M8.5 2h7"/><path d="M14 9.3a6.5 6.5 0 1 1-4 0"/><path d="M5.52 16h12.96"/>`,
  globe: `<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>`,
};
const icon = (name: string, size = 20) =>
  `<svg class="ic" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;

const TRACK_UI: Record<Mission["track"], { icon: string; tone: string }> = {
  "phishing":            { icon: "fish",     tone: "danger" },
  "fake-assets":         { icon: "coins",    tone: "amber" },
  "social-engineering":  { icon: "message",  tone: "info" },
  "dangerous-approvals": { icon: "zap",      tone: "orange" },
  "presale-scam":        { icon: "trending", tone: "violet" },
  "key-hygiene":         { icon: "key",      tone: "success" },
};

function buildHtml() {
  const catalog = loadCatalog().filter((m) => !m.comingSoon);
  const tracks = Object.keys(TrackMeta) as Mission["track"][];
  const count = (t: Mission["track"]) => catalog.filter((m) => m.track === t).length;
  const url = siteUrl();
  const host = url.replace(/^https?:\/\//, "");

  const trackCards = tracks
    .map((t) => {
      const ui = TRACK_UI[t];
      return `<li class="track t-${ui.tone}">
        <span class="track-ic">${icon(ui.icon, 22)}</span>
        <span class="track-name">${TrackMeta[t].label}</span>
        <span class="track-desc">${TrackMeta[t].description}</span>
        <span class="track-count">${count(t)} ${count(t) === 1 ? "misión" : "misiones"}</span>
      </li>`;
    })
    .join("");

  const mockBars = tracks
    .slice(0, 3)
    .map((t, i) => {
      const total = count(t);
      const done = [total, Math.max(1, total - 1), Math.max(0, total - 3)][i];
      return `<div class="mk-row"><span>${TrackMeta[t].label}</span><span class="mono">${done}/${total}</span></div>
        <div class="mk-track"><div class="mk-fill t-${TRACK_UI[t].tone}" style="transform:scaleX(${total ? done / total : 0})"></div></div>`;
    })
    .join("");

  const slides = [
    /* 0 — Hero */
    `<section class="slide s-hero" aria-label="Portada">
      <div class="wrap hero-grid">
        <div>
          <p class="eyebrow a1">CriptoUNAM × Semana DIE 2026</p>
          <h1 class="display a2">Entrena para <em>no caer</em> en estafas crypto</h1>
          <p class="lead a3">Simulador de fraudes Web3 en español: ${catalog.length} escenarios realistas y una credencial verificable ligada a tu dirección de Stellar testnet.</p>
          <ul class="chips a4">
            <li>Stellar testnet</li><li>Open source</li><li>Gratis</li><li>LATAM</li>
          </ul>
        </div>
        <div class="hero-art a3" aria-hidden="true">
          <div class="halo"></div>
          <img src="/logo-panther.webp" alt="" width="420" height="164" class="panther" />
        </div>
      </div>
    </section>`,

    /* 1 — Problema */
    `<section class="slide center" aria-label="El problema">
      <div class="wrap narrow">
        <p class="eyebrow a1">El problema</p>
        <p class="big a2">Miles de millones</p>
        <p class="lead a3">se pierden cada año en estafas crypto. Casi siempre por las mismas señales que nadie enseñó a reconocer: urgencia falsa, dominios clonados y firmas que no se leen.</p>
        <blockquote class="quote a4">“No existe forma de practicar sin perder dinero real.”</blockquote>
      </div>
    </section>`,

    /* 2 — Solución */
    `<section class="slide center" aria-label="La solución">
      <div class="wrap">
        <p class="eyebrow a1">La solución</p>
        <h2 class="title a2">Simula el fraude. <em>Antes de vivirlo.</em></h2>
        <ol class="steps a3">
          <li><span class="step-ic">${icon("wallet")}</span><strong>Entra</strong><span>Con tu correo y un código (Pollar): tu billetera Stellar testnet sin contraseñas ni frase semilla.</span></li>
          <li><span class="step-ic">${icon("target")}</span><strong>Simula</strong><span>Phishing, airdrops falsos, ingeniería social y firmas peligrosas, sin riesgo.</span></li>
          <li><span class="step-ic">${icon("book")}</span><strong>Aprende</strong><span>Explicación inmediata de cada trampa, XP y progreso por módulo.</span></li>
          <li><span class="step-ic">${icon("award")}</span><strong>Certifícate</strong><span>Credencial emitida on-chain en Stellar: cualquier wallet o dApp la verifica.</span></li>
        </ol>
      </div>
    </section>`,

    /* 3 — Producto */
    `<section class="slide" aria-label="El producto">
      <div class="wrap split">
        <div>
          <p class="eyebrow a1">El producto</p>
          <h2 class="title a2">Escenarios reales, decisiones reales</h2>
          <ul class="feats a3">
            <li>${icon("check", 18)}Cada misión recrea un correo, DM, wallet o solicitud de firma.</li>
            <li>${icon("check", 18)}Retroalimentación inmediata que explica la trampa.</li>
            <li>${icon("check", 18)}Respuestas firmadas con tu billetera: nadie responde por ti.</li>
            <li>${icon("check", 18)}Incluye "El Drop de $PUMA": el airdrop falso que imita el drop de GOYA HACK.</li>
            <li>${icon("check", 18)}Diseñado primero para el teléfono.</li>
          </ul>
        </div>
        <figure class="mock a4" aria-label="Vista del mapa de misiones">
          <div class="mk-bar"><i></i><i></i><i></i><span class="mono">${host}/dashboard</span></div>
          <div class="mk-body">
            <div class="mk-head"><span class="wm">FYV <b>Box</b></span><span class="mk-xp">★ 450 XP</span></div>
            <div class="mk-card"><p class="mk-title">Tu progreso</p>${mockBars}</div>
            <div class="mk-mission">
              <span class="mk-tag">${icon("fish", 14)} Phishing</span>
              <p>El Login de Lumena</p>
              <span class="muted">Básico · 100 XP</span>
            </div>
          </div>
        </figure>
      </div>
    </section>`,

    /* 4 — Tracks */
    `<section class="slide" aria-label="Módulos">
      <div class="wrap">
        <p class="eyebrow a1">Módulos</p>
        <h2 class="title a2">${tracks.length} módulos · ${catalog.length} simulacros</h2>
        <ul class="tracks a3">${trackCards}</ul>
      </div>
    </section>`,

    /* 5 — Credencial */
    `<section class="slide" aria-label="Credencial verificable">
      <div class="wrap split">
        <div class="badge-wrap a1" aria-hidden="true">
          <div class="badge">
            <span class="badge-ic">${icon("award", 44)}</span>
            <span class="badge-label">Resistente a estafas</span>
            <span class="mono badge-sub">verificable</span>
          </div>
        </div>
        <div>
          <p class="eyebrow a2">Credencial verificable</p>
          <h2 class="title a3">Una prueba pública de que sabes detectar la trampa</h2>
          <ul class="points a4">
            <li><strong>Pública.</strong> Cualquiera consulta cualquier dirección Stellar.</li>
            <li><strong>Firmada.</strong> Cada respuesta va firmada con SEP-53 por la billetera dueña (Pollar la firma si entraste con correo); nadie responde por ti.</li>
            <li><strong>On-chain.</strong> Cada módulo aprobado es una transacción en Stellar testnet de la cuenta emisora de FYV Box (memo <span class="mono">FYV cert &lt;módulo&gt;</span>), abrible en Stellar Expert.</li>
          </ul>
          <pre class="code a4"><span class="k">GET</span> /api/verify?address=G…
<span class="c">→ { "certified": true,
    "modules": [{ "txHash": "a50a76…" }] }</span></pre>
        </div>
      </div>
    </section>`,

    /* 6 — Hackathon */
    `<section class="slide center" aria-label="Hackathon">
      <div class="wrap narrow">
        <p class="eyebrow a1">CriptoUNAM × Semana DIE 2026</p>
        <h2 class="title a2">Postulando a <em>3 retos</em></h2>
        <ul class="prizes a3">
          <li class="prize main">
            <span class="prize-ic">${icon("code", 22)}</span>
            <span><strong>Blockchain → Stellar · BAF</strong><span class="muted">Cuentas reales en testnet, firmas SEP-53 y credencial emitida on-chain por módulo.</span></span>
            <span class="amount">1.º $150</span>
          </li>
          <li class="prize">
            <span class="prize-ic">${icon("wallet", 22)}</span>
            <span><strong>Blockchain → Pollar</strong><span class="muted">Login con correo, billetera custodiada y firma SEP-53 de cada respuesta con Pollar.</span></span>
            <span class="amount sm">1.º $125</span>
          </li>
          <li class="prize">
            <span class="prize-ic">${icon("book", 22)}</span>
            <span><strong>Contenido → Tangem</strong><span class="muted">Educación en español para la comunidad UNAM y LATAM.</span></span>
            <span class="amount sm">1.º $50</span>
          </li>
        </ul>
        <dl class="totals a4">
          <div><dt>credenciales on-chain</dt><dd class="gold">testnet</dd></div>
          <div><dt>open source</dt><dd>100%</dd></div>
          <div><dt>fondos custodiados</dt><dd class="ok">0</dd></div>
        </dl>
      </div>
    </section>`,

    /* 7 — CTA */
    `<section class="slide center" aria-label="Pruébalo">
      <div class="wrap narrow">
        <p class="eyebrow a1">Pruébalo ahora</p>
        <p class="url a2">${host}</p>
        <p class="muted mono a3">Demo en vivo · Stellar testnet · github.com/ALFA117/fyv-box</p>
        <div class="ctas a4">
          <a class="btn primary" href="${url}" target="_blank" rel="noopener noreferrer">Abrir demo ${icon("external", 18)}</a>
          <a class="btn ghost" href="https://github.com/ALFA117/fyv-box" target="_blank" rel="noopener noreferrer">Ver código ${icon("code", 18)}</a>
        </div>
        <p class="muted small a4">Axel Rodríguez Frías · CriptoUNAM</p>
      </div>
    </section>`,
  ];

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"/>
<meta name="theme-color" content="#0A1A33"/>
<title>FYV Box — Pitch</title>
<meta name="description" content="Pitch de FYV Box: simulador de estafas crypto en español con credencial verificable en Stellar testnet."/>
<meta property="og:title" content="FYV Box — Pitch"/>
<meta property="og:image" content="${url}/opengraph-image"/>
<link rel="icon" href="/icon.svg" type="image/svg+xml"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"/>
<style>
:root{
  --navy:#0A1A33;--surface:#11284D;--surface-2:#162F58;--gold:#C9A227;--gold-hover:#E0C35A;--on-gold:#0A1A33;
  --cream:#F5F1E6;--muted:#B8C2D6;--dim:rgba(245,241,230,.62);--line:rgba(255,255,255,.08);--line-strong:rgba(255,255,255,.16);--line-gold:rgba(201,162,39,.32);
  --gold-subtle:rgba(201,162,39,.10);
  --danger:#EF6363;--amber:#F5A524;--info:#6BA4F8;--violet:#B794F6;--orange:#F29A4A;--success:#3DB882;
  --serif:'Playfair Display',Georgia,serif;--sans:Inter,ui-sans-serif,system-ui,sans-serif;--mono:'IBM Plex Mono',ui-monospace,monospace;
  --safe-top:env(safe-area-inset-top,0px);--safe-bottom:env(safe-area-inset-bottom,0px);--safe-left:env(safe-area-inset-left,0px);--safe-right:env(safe-area-inset-right,0px);
  --ease:cubic-bezier(.16,1,.3,1);
  color-scheme:dark;
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;background:var(--navy);color:var(--cream);font-family:var(--sans);-webkit-font-smoothing:antialiased;-webkit-tap-highlight-color:transparent;-webkit-text-size-adjust:100%}
body{overflow:hidden}
img{max-width:100%;height:auto}
ul,ol{list-style:none}
:focus-visible{outline:2px solid var(--gold);outline-offset:3px;border-radius:8px}
.mono{font-family:var(--mono)}
.muted{color:var(--muted)}
.small{font-size:13px}
em{font-style:italic;color:var(--gold)}
.ic{flex-shrink:0}

/* background */
body::before{content:"";position:fixed;inset:0;z-index:0;pointer-events:none;
  background:radial-gradient(40rem 40rem at 20% 10%,rgba(201,162,39,.10),transparent 70%),radial-gradient(36rem 36rem at 100% 90%,rgba(40,80,160,.22),transparent 70%)}

/* chrome */
.chrome{position:fixed;inset:0 0 auto 0;z-index:20;display:flex;align-items:center;justify-content:space-between;gap:12px;
  padding:calc(var(--safe-top) + 12px) max(20px,var(--safe-right)) 12px max(20px,var(--safe-left));
  background:linear-gradient(var(--navy) 55%,rgba(10,26,51,0))}
.wm{font-family:var(--serif);font-weight:700;font-size:18px;letter-spacing:-.01em;white-space:nowrap}
.wm b{color:var(--gold);font-weight:700}
.counter{font-family:var(--mono);font-size:13px;color:var(--muted)}
.progress{position:fixed;left:0;top:0;height:2px;width:100%;background:var(--gold);transform-origin:left;transform:scaleX(0);z-index:30;transition:transform .45s var(--ease)}

/* deck: native horizontal swipe with scroll-snap */
.deck{position:relative;z-index:1;display:flex;height:100dvh;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;scroll-behavior:smooth;overscroll-behavior-x:contain;scrollbar-width:none}
.deck::-webkit-scrollbar{display:none}
.slide{flex:0 0 100%;height:100dvh;scroll-snap-align:start;scroll-snap-stop:always;overflow-y:auto;overflow-x:hidden;overscroll-behavior-y:contain;display:flex;align-items:center;
  padding:calc(var(--safe-top) + 72px) max(20px,var(--safe-right)) calc(var(--safe-bottom) + 96px) max(20px,var(--safe-left))}
.slide.center{text-align:center}
.wrap{width:100%;max-width:1040px;margin:auto}
.wrap.narrow{max-width:680px}
.split{display:grid;gap:32px;align-items:center}
@media(min-width:860px){.split{grid-template-columns:1fr 1fr;gap:56px}}

/* type */
.eyebrow{font-size:12px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:var(--gold);margin-bottom:14px}
.display{font-family:var(--serif);font-weight:700;font-size:clamp(36px,7.5vw,64px);line-height:1.05;letter-spacing:-.015em;text-wrap:balance}
.title{font-family:var(--serif);font-weight:700;font-size:clamp(28px,5.2vw,44px);line-height:1.1;letter-spacing:-.01em;text-wrap:balance;margin-bottom:24px}
.lead{font-size:clamp(16px,2vw,19px);line-height:1.6;color:var(--muted);margin-top:18px;max-width:34em;text-wrap:pretty}
.center .lead{margin-left:auto;margin-right:auto}
.big{font-family:var(--serif);font-weight:700;font-size:clamp(48px,11vw,104px);line-height:1;color:var(--gold);letter-spacing:-.02em}
.quote{margin-top:28px;font-family:var(--serif);font-style:italic;font-size:clamp(18px,2.4vw,24px);color:var(--cream)}

/* hero */
.hero-grid{display:grid;gap:28px;align-items:center}
@media(min-width:860px){.hero-grid{grid-template-columns:1.1fr .9fr;gap:48px}}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:24px}
.chips li{border:1px solid var(--line-gold);background:var(--gold-subtle);color:var(--gold);border-radius:999px;padding:6px 14px;font-size:13px;font-weight:500}
.hero-art{position:relative;display:flex;justify-content:center;order:-1}
@media(min-width:860px){.hero-art{order:0}}
.halo{position:absolute;inset:-10%;background:radial-gradient(ellipse at center,rgba(201,162,39,.28),rgba(201,162,39,.06) 50%,transparent 70%)}
.panther{position:relative;width:min(72vw,380px);filter:brightness(1.4) contrast(1.2) drop-shadow(0 0 22px rgba(201,162,39,.8)) drop-shadow(0 0 50px rgba(201,162,39,.45))}

/* steps */
.steps{display:grid;gap:12px;text-align:left;margin-top:8px}
@media(min-width:720px){.steps{grid-template-columns:repeat(2,1fr)}}
@media(min-width:1000px){.steps{grid-template-columns:repeat(4,1fr)}}
.steps li{display:flex;flex-direction:column;gap:6px;border:1px solid var(--line);background:rgba(17,40,77,.7);border-radius:16px;padding:18px}
.steps strong{font-family:var(--serif);font-size:19px;font-weight:700}
.steps span:last-child{font-size:15px;line-height:1.55;color:var(--muted)}
.step-ic{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;color:var(--gold);background:var(--gold-subtle);border:1px solid var(--line-gold);margin-bottom:6px}

/* features / points */
.feats,.points{display:grid;gap:12px}
.feats li{display:flex;gap:10px;align-items:flex-start;font-size:16px;line-height:1.55;color:var(--muted)}
.feats .ic{color:var(--success);margin-top:3px}
.points li{font-size:16px;line-height:1.55;color:var(--muted);padding-left:16px;border-left:2px solid var(--line-gold)}
.points strong{color:var(--cream)}

/* mock */
.mock{border:1px solid var(--line-gold);border-radius:20px;overflow:hidden;background:linear-gradient(160deg,var(--surface),var(--navy));box-shadow:0 30px 80px rgba(0,0,0,.5)}
.mk-bar{display:flex;align-items:center;gap:6px;padding:10px 14px;border-bottom:1px solid var(--line);background:rgba(0,0,0,.2)}
.mk-bar i{width:9px;height:9px;border-radius:50%;background:#FF5F57}.mk-bar i:nth-child(2){background:#FFBD2E}.mk-bar i:nth-child(3){background:#28C840}
.mk-bar span{flex:1;min-width:0;text-align:center;font-size:12px;color:var(--dim);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mk-body{padding:16px;display:grid;gap:12px}
.mk-head{display:flex;justify-content:space-between;align-items:center}
.mk-xp{font-size:13px;font-weight:600;color:var(--gold);border:1px solid var(--line-gold);background:var(--gold-subtle);border-radius:999px;padding:4px 10px}
.mk-card{border:1px solid var(--line);border-radius:14px;padding:14px;background:rgba(245,241,230,.02)}
.mk-title{font-weight:600;font-size:14px;margin-bottom:10px}
.mk-row{display:flex;justify-content:space-between;font-size:13px;color:var(--muted);margin-bottom:6px}
.mk-track{height:6px;border-radius:99px;background:var(--line);overflow:hidden;margin-bottom:10px}
.mk-fill{height:100%;border-radius:99px;transform-origin:left}
.mk-mission{border:1px solid rgba(239,99,99,.3);background:rgba(239,99,99,.08);border-radius:14px;padding:12px}
.mk-mission p{font-weight:600;margin:6px 0 2px}
.mk-mission .muted{font-size:13px}
.mk-tag{display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--danger);font-weight:600}

/* tracks */
.tracks{display:grid;gap:12px}
@media(min-width:620px){.tracks{grid-template-columns:repeat(2,1fr)}}
@media(min-width:980px){.tracks{grid-template-columns:repeat(3,1fr)}}
.track{display:grid;grid-template-columns:auto 1fr;grid-template-rows:auto auto auto;column-gap:14px;row-gap:4px;border:1px solid var(--line);background:rgba(17,40,77,.7);border-radius:16px;padding:16px;text-align:left}
.track-ic{grid-row:1/span 3;width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;border:1px solid currentColor;color:var(--c)}
.track-name{font-family:var(--serif);font-weight:700;font-size:18px;color:var(--c)}
.track-desc{font-size:14px;line-height:1.5;color:var(--muted)}
.track-count{font-family:var(--mono);font-size:12px;color:var(--cream)}
.t-danger{--c:var(--danger)}.t-amber{--c:var(--amber)}.t-info{--c:var(--info)}.t-orange{--c:var(--orange)}.t-violet{--c:var(--violet)}.t-success{--c:var(--success)}
.mk-fill{background:var(--c)}

/* credential */
.badge-wrap{display:flex;justify-content:center}
.badge{width:min(62vw,260px);aspect-ratio:1;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;text-align:center;
  border:2px solid var(--gold);background:radial-gradient(circle,var(--surface-2),var(--navy));box-shadow:0 0 0 10px var(--gold-subtle),0 0 60px rgba(201,162,39,.25)}
.badge-ic{color:var(--gold)}
.badge-label{font-family:var(--serif);font-weight:700;font-size:20px;color:var(--gold);max-width:10ch;line-height:1.15}
.badge-sub{font-size:12px;color:var(--dim)}
.code{margin-top:20px;max-width:100%;overflow-x:auto;border:1px solid var(--line-gold);background:rgba(201,162,39,.06);border-radius:14px;padding:14px;font-family:var(--mono);font-size:13px;line-height:1.7;color:var(--gold);white-space:pre}
.split>*{min-width:0}
.code .k{color:var(--info)}.code .c{color:var(--muted)}

/* prizes */
.prizes{display:grid;gap:12px;text-align:left}
.prize{display:grid;grid-template-columns:auto 1fr auto;gap:14px;align-items:center;border:1px solid var(--line);background:rgba(17,40,77,.7);border-radius:16px;padding:16px}
.prize.main{border-color:var(--line-gold);background:var(--gold-subtle)}
.prize strong{display:block;font-weight:600;font-size:16px}
.prize .muted{display:block;font-size:14px;line-height:1.5;margin-top:2px}
.prize-ic{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;color:var(--gold);border:1px solid var(--line-gold)}
.amount{font-family:var(--serif);font-weight:700;font-size:26px;color:var(--gold);white-space:nowrap}
.amount.sm{font-size:18px}
@media(max-width:520px){.prize{grid-template-columns:auto 1fr}.amount{grid-column:2;justify-self:start}}
.totals{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:20px}
.totals div{border:1px solid var(--line);border-radius:14px;padding:14px 8px;display:flex;flex-direction:column-reverse;gap:4px}
.totals dt{font-size:12px;color:var(--muted)}
.totals dd{font-family:var(--serif);font-weight:700;font-size:clamp(22px,4vw,30px)}
.gold{color:var(--gold)}.ok{color:var(--success)}

/* CTA */
.url{font-family:var(--serif);font-weight:700;font-size:clamp(30px,7vw,60px);color:var(--gold);line-height:1.05;word-break:break-word;margin-bottom:12px}
.ctas{display:flex;flex-direction:column;gap:12px;margin:28px auto 20px;max-width:360px}
@media(min-width:560px){.ctas{flex-direction:row;max-width:none;justify-content:center}}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:52px;padding:0 26px;border-radius:14px;font-weight:600;font-size:16px;text-decoration:none;transition:background-color .15s,transform .15s var(--ease)}
.btn:active{transform:scale(.97)}
.btn.primary{background:var(--gold);color:var(--on-gold)}
.btn.primary:hover{background:var(--gold-hover)}
.btn.ghost{border:1px solid var(--line-gold);color:var(--gold)}
.btn.ghost:hover{background:var(--gold-subtle)}

/* nav */
.nav{position:fixed;left:50%;bottom:calc(var(--safe-bottom) + 16px);transform:translateX(-50%);z-index:20;display:flex;align-items:center;gap:4px;
  padding:4px;border:1px solid var(--line-gold);border-radius:999px;background:rgba(10,26,51,.85);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)}
.nav button{appearance:none;border:0;background:transparent;color:var(--gold);cursor:pointer;min-width:44px;min-height:44px;border-radius:999px;display:flex;align-items:center;justify-content:center;touch-action:manipulation}
.nav button:hover{background:var(--gold-subtle)}
.nav button:disabled{opacity:.3;cursor:default;background:transparent}
.dots{display:flex;align-items:center}
.dots button{min-width:28px}
.dots button span{width:6px;height:6px;border-radius:99px;background:rgba(201,162,39,.35);transition:width .3s var(--ease),background-color .3s}
.dots button[aria-current="true"] span{width:18px;background:var(--gold)}
@media(max-width:380px){.dots button{min-width:22px}}

/* entrance (only when motion is allowed) */
@media (prefers-reduced-motion: no-preference){
  .slide .a1,.slide .a2,.slide .a3,.slide .a4{opacity:0;transform:translateY(14px);transition:opacity .45s var(--ease),transform .45s var(--ease)}
  .slide.on .a1,.slide.on .a2,.slide.on .a3,.slide.on .a4{opacity:1;transform:none}
  .slide.on .a2{transition-delay:.06s}.slide.on .a3{transition-delay:.12s}.slide.on .a4{transition-delay:.18s}
}
@media (prefers-reduced-motion: reduce){
  .deck{scroll-behavior:auto}
  .progress,.dots button span,.btn{transition:none}
}
</style>
</head>
<body>
<div class="progress" id="progress" aria-hidden="true"></div>
<header class="chrome">
  <a href="/" class="wm" style="color:inherit;text-decoration:none">FYV <b>Box</b></a>
  <span class="counter" id="counter" aria-live="polite">1 / ${slides.length}</span>
</header>

<main class="deck" id="deck" tabindex="-1" aria-roledescription="presentación">
${slides.join("\n")}
</main>

<nav class="nav" aria-label="Navegación de diapositivas">
  <button type="button" id="prev" aria-label="Diapositiva anterior">${icon("left")}</button>
  <div class="dots" id="dots"></div>
  <button type="button" id="next" aria-label="Diapositiva siguiente">${icon("right")}</button>
</nav>

<script>
(function(){
  var deck=document.getElementById('deck');
  var slides=[].slice.call(deck.querySelectorAll('.slide'));
  var dots=document.getElementById('dots');
  var prev=document.getElementById('prev'),next=document.getElementById('next');
  var counter=document.getElementById('counter'),progress=document.getElementById('progress');
  var cur=0,ready=false;
  slides.forEach(function(s,i){
    var b=document.createElement('button');b.type='button';b.setAttribute('aria-label','Ir a la diapositiva '+(i+1));
    b.innerHTML='<span></span>';b.onclick=function(){go(i)};dots.appendChild(b);
  });
  function sync(i){
    cur=i;
    if(history.replaceState)history.replaceState(null,'',i?'#'+(i+1):location.pathname);
    slides.forEach(function(s,j){s.classList.toggle('on',j===i);s.setAttribute('aria-hidden',j===i?'false':'true');s.inert=j!==i});
    [].forEach.call(dots.children,function(d,j){d.setAttribute('aria-current',j===i?'true':'false')});
    prev.disabled=i===0;next.disabled=i===slides.length-1;
    counter.textContent=(i+1)+' / '+slides.length;
    progress.style.transform='scaleX('+(slides.length>1?i/(slides.length-1):1)+')';
  }
  function go(i){
    i=Math.max(0,Math.min(slides.length-1,i));
    deck.scrollTo({left:slides[i].offsetLeft});
    sync(i);
  }
  prev.onclick=function(){go(cur-1)};next.onclick=function(){go(cur+1)};
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(ready&&e.isIntersecting&&e.intersectionRatio>.6)sync(slides.indexOf(e.target))})},{root:deck,threshold:[.6]});
  slides.forEach(function(s){io.observe(s)});
  document.addEventListener('keydown',function(e){
    if(e.target&&/INPUT|TEXTAREA/.test(e.target.tagName))return;
    if(e.key==='ArrowRight'||e.key==='PageDown'||(e.key===' '&&!e.shiftKey)){e.preventDefault();go(cur+1)}
    if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();go(cur-1)}
    if(e.key==='Home'){e.preventDefault();go(0)}
    if(e.key==='End'){e.preventDefault();go(slides.length-1)}
  });
  window.addEventListener('resize',function(){deck.scrollTo({left:slides[cur].offsetLeft,behavior:'instant'})});
  // Deep link: /pitch#4 opens the 4th slide
  var start=parseInt((location.hash||'').slice(1),10);
  var first=(start>=1&&start<=slides.length)?start-1:0;
  sync(first);
  requestAnimationFrame(function(){deck.scrollTo({left:slides[first].offsetLeft,behavior:'instant'});ready=true});
})();
</script>
</body>
</html>`;
}

export function GET() {
  return new NextResponse(buildHtml(), {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
