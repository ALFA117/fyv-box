import { NextResponse } from "next/server";

const HTML = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"/>
<title>FYV Box — Pitch</title>
<meta name="description" content="Simulador de estafas crypto sobre Stellar Testnet. Certifícate on-chain."/>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"/>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --navy:#0A1A33;--navy2:#0D2040;--surf:#162240;
  --gold:#C9A227;--gold2:#E8B830;--gold-dim:rgba(201,162,39,.15);--gold-ring:rgba(201,162,39,.3);
  --cream:#F0EBD8;--cream-mid:#B8A890;--cream-low:#6A6050;
  --success:#22c55e;
  color-scheme:dark;
}
html,body{height:100%;background:var(--navy);color:var(--cream);font-family:'Inter',system-ui,sans-serif;overflow:hidden;user-select:none}
.deck{position:fixed;inset:0;display:grid;grid-template-columns:1fr;grid-template-rows:1fr}
.slide{grid-area:1/1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 28px;opacity:0;transform:translateX(60px);transition:opacity .45s cubic-bezier(.22,1,.36,1),transform .45s cubic-bezier(.22,1,.36,1);pointer-events:none;position:relative;overflow:hidden}
.slide.active{opacity:1;transform:translateX(0);pointer-events:auto}
.slide.prev{opacity:0;transform:translateX(-60px)}
.slide::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(201,162,39,.04) 0%,transparent 50%),radial-gradient(ellipse 80% 60% at 80% 110%,rgba(201,162,39,.06) 0%,transparent 60%);pointer-events:none}
.grid-bg{position:absolute;inset:0;background-image:linear-gradient(rgba(201,162,39,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(201,162,39,.04) 1px,transparent 1px);background-size:64px 64px;pointer-events:none}
.nav{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:20px;background:rgba(22,34,64,.85);border:1px solid var(--gold-ring);border-radius:99px;padding:10px 20px;backdrop-filter:blur(12px);z-index:100}
.dots{display:flex;gap:7px;align-items:center}
.dot{width:6px;height:6px;border-radius:50%;background:var(--cream-low);cursor:pointer;transition:background .2s,width .2s}
.dot.on{background:var(--gold);width:18px;border-radius:99px}
.arr{background:none;border:none;color:var(--cream-mid);cursor:pointer;display:flex;align-items:center;font-size:18px;padding:0 4px;transition:color .15s}
.arr:hover{color:var(--gold)}
.arr:disabled{opacity:.25;cursor:default}
.slide-num{font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--cream-low);letter-spacing:.08em;min-width:40px;text-align:center}
.eyebrow{font-family:'Syne',sans-serif;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--gold);margin-bottom:10px}
.h1{font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(28px,5vw,56px);line-height:1.08;letter-spacing:-.03em;text-wrap:balance;text-align:center}
.h2{font-family:'Syne',sans-serif;font-weight:700;font-size:clamp(22px,3.5vw,40px);line-height:1.15;letter-spacing:-.025em;text-wrap:balance;text-align:center}
.lead{font-size:clamp(14px,1.6vw,17px);line-height:1.65;color:var(--cream-mid);text-align:center;max-width:560px}
.accent{color:var(--gold)}
.dim{color:var(--cream-low)}
.pill{display:inline-flex;align-items:center;gap:6px;background:var(--gold-dim);border:1px solid var(--gold-ring);border-radius:99px;padding:4px 12px;font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--gold);letter-spacing:.04em}
.chip{display:inline-flex;align-items:center;gap:6px;background:var(--surf);border:1px solid rgba(240,235,216,.1);border-radius:99px;padding:5px 14px;font-size:13px;color:var(--cream-mid)}
.chip-row{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
.logo-wrap{display:flex;align-items:center;gap:12px;margin-bottom:20px}
.logo-icon{width:48px;height:48px;background:var(--gold-dim);border:1px solid var(--gold-ring);border-radius:14px;display:flex;align-items:center;justify-content:center}
.logo-text{font-family:'Syne',sans-serif;font-weight:800;font-size:26px;letter-spacing:-.02em}
.logo-text span{color:var(--gold)}
.stat-block{text-align:center;padding:20px 28px;background:var(--surf);border:1px solid rgba(240,235,216,.08);border-radius:18px}
.stat-num{font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(36px,6vw,72px);letter-spacing:-.04em;line-height:1;color:var(--gold)}
.stat-label{font-size:13px;color:var(--cream-mid);margin-top:6px}
.step{display:flex;align-items:flex-start;gap:14px;padding:14px 16px;background:var(--surf);border:1px solid rgba(240,235,216,.07);border-radius:14px}
.step-n{width:28px;height:28px;border-radius:50%;background:var(--gold-dim);border:1px solid var(--gold-ring);display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:12px;font-weight:800;color:var(--gold);flex-shrink:0}
.step-title{font-weight:600;font-size:14px;color:var(--cream);margin-bottom:2px}
.step-desc{font-size:12.5px;color:var(--cream-mid);line-height:1.5}
.tracks{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;width:100%;max-width:600px}
.track-card{padding:14px 14px 12px;background:var(--surf);border:1px solid rgba(240,235,216,.07);border-radius:14px;text-align:left}
.track-icon{font-size:20px;margin-bottom:6px}
.track-name{font-family:'Syne',sans-serif;font-weight:700;font-size:13px;color:var(--cream);margin-bottom:2px}
.track-desc{font-size:11.5px;color:var(--cream-low);line-height:1.4}
.track-card.at{border-color:var(--gold-ring);background:rgba(201,162,39,.07)}
.tech-grid{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;max-width:600px}
.tech{display:flex;align-items:center;gap:8px;padding:9px 16px;background:var(--surf);border:1px solid rgba(240,235,216,.08);border-radius:12px}
.tech-name{font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:var(--cream)}
.tech-role{font-size:11px;color:var(--cream-low)}
.link-row{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-top:4px}
.link-btn{display:inline-flex;align-items:center;gap:8px;padding:10px 20px;border-radius:12px;font-family:'Syne',sans-serif;font-size:13px;font-weight:700;text-decoration:none;transition:opacity .15s}
.link-btn:hover{opacity:.85}
.link-btn.primary{background:var(--gold);color:var(--navy)}
.link-btn.outline{background:transparent;border:1px solid var(--gold-ring);color:var(--gold)}
.pbar-wrap{width:100%;max-width:420px;margin-top:8px}
.pbar-label{display:flex;justify-content:space-between;font-size:12px;color:var(--cream-low);margin-bottom:5px}
.pbar-track{height:6px;background:rgba(255,255,255,.08);border-radius:99px;overflow:hidden}
.pbar-fill{height:100%;border-radius:99px;background:linear-gradient(90deg,var(--gold),var(--gold2))}
.award{display:inline-flex;align-items:center;gap:10px;padding:14px 22px;background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.28);border-radius:14px;font-family:'Syne',sans-serif;font-weight:700;font-size:15px;color:#4ade80;margin:10px 0}
@media(max-width:600px){.tracks{grid-template-columns:repeat(2,1fr)}.nav{padding:8px 14px;gap:12px}.slide{padding:28px 18px 80px}}
</style>
</head>
<body>
<div class="deck" id="deck"></div>
<nav class="nav">
  <button class="arr" id="prev" onclick="go(-1)">&#8592;</button>
  <div class="dots" id="dots"></div>
  <button class="arr" id="next" onclick="go(1)">&#8594;</button>
  <span class="slide-num" id="snum">1 / 9</span>
</nav>
<script>
const SH=\`<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#C9A227" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L4 6v6c0 4.4 3.4 8.5 8 9.5 4.6-1 8-5.1 8-9.5V6l-8-4z"/></svg>\`;
const SLIDES=[
()=>\`<div class="grid-bg"></div><div style="display:flex;flex-direction:column;align-items:center;gap:18px;max-width:700px;text-align:center"><div class="logo-wrap"><div class="logo-icon">\${SH}</div><div class="logo-text">FYV<span> Box</span></div></div><div class="h1">Entrena para <span class="accent">no caer</span><br>en estafas crypto</div><p class="lead">El simulador de fraudes sobre Stellar Testnet que certifica tu competencia on-chain.</p><div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:8px"><span class="pill">Stellar Testnet</span><span class="pill">Soroban · On-chain</span><span class="pill">Open Source</span></div></div>\`,
()=>\`<div class="grid-bg"></div><div style="display:flex;flex-direction:column;align-items:center;gap:24px;max-width:680px"><div class="eyebrow">El problema</div><div class="h2">En crypto LATAM, aprendes perdiendo</div><div style="display:flex;gap:14px;flex-wrap:wrap;justify-content:center;width:100%"><div class="stat-block" style="flex:1;min-width:160px"><div class="stat-num">$3.2B</div><div class="stat-label">perdidos en fraudes crypto en 2023<br><span class="dim">(Chainalysis, LATAM)</span></div></div><div class="stat-block" style="flex:1;min-width:160px"><div class="stat-num">73%</div><div class="stat-label">víctimas no reconocieron<br>la señal de alerta a tiempo</div></div><div class="stat-block" style="flex:1;min-width:160px"><div class="stat-num">0</div><div class="stat-label">plataformas de entrenamiento<br>anti-fraude en español</div></div></div><p class="lead">Los walkthroughs de YouTube no entrenan el instinto. Los fraudes se reconocen viviéndolos, no leyéndolos.</p></div>\`,
()=>\`<div class="grid-bg"></div><div style="display:flex;flex-direction:column;align-items:center;gap:22px;max-width:660px"><div class="eyebrow">La solución</div><div class="h2"><span class="accent">FYV Box</span> = simulacro + XP + credencial</div><div style="display:flex;flex-direction:column;gap:10px;width:100%;max-width:520px"><div class="step"><div class="step-n">1</div><div class="step-body"><div class="step-title">Conecta con tu clave pública Stellar</div><div class="step-desc">Sin contraseña, sin custodiar fondos. Solo tu dirección pública como identidad.</div></div></div><div class="step"><div class="step-n">2</div><div class="step-body"><div class="step-title">Enfrenta simulacros reales</div><div class="step-desc">Phishing, falsos tokens, presales fraudulentos, social engineering — exactamente como en el mundo real.</div></div></div><div class="step"><div class="step-n">3</div><div class="step-body"><div class="step-title">Acumula XP y progresa</div><div class="step-desc">Cada misión completada suma experiencia. El dashboard muestra tu avance por track.</div></div></div><div class="step"><div class="step-n">4</div><div class="step-body"><div class="step-title">Graduación on-chain</div><div class="step-desc">Al completar todos los tracks, recibes una credencial Soroban verificable públicamente.</div></div></div></div></div>\`,
()=>\`<div class="grid-bg"></div><div style="display:flex;flex-direction:column;align-items:center;gap:20px;max-width:660px"><div class="eyebrow">Tracks de entrenamiento</div><div class="h2">6 categorías de fraude</div><div class="tracks"><div class="track-card at"><div class="track-icon">🎣</div><div class="track-name">Phishing</div><div class="track-desc">Sitios falsos, emails y links trampa</div></div><div class="track-card at"><div class="track-icon">💎</div><div class="track-name">Fake Assets</div><div class="track-desc">Tokens clonados y contratos trampa</div></div><div class="track-card at"><div class="track-icon">🤝</div><div class="track-name">Social Eng.</div><div class="track-desc">Manipulación y urgencia artificial</div></div><div class="track-card"><div class="track-icon">⚠️</div><div class="track-name">Approvals</div><div class="track-desc">Permisos peligrosos de wallet</div></div><div class="track-card"><div class="track-icon">🚀</div><div class="track-name">Presale Scam</div><div class="track-desc">Rug pulls y preventa fraudulenta</div></div><div class="track-card"><div class="track-icon">🔑</div><div class="track-name">Key Hygiene</div><div class="track-desc">Exposición accidental de claves</div></div></div><p class="dim" style="font-size:12px">Activos hoy: Phishing · Fake Assets · Social Engineering &nbsp;·&nbsp; Próximamente: los demás</p></div>\`,
()=>\`<div class="grid-bg"></div><div style="display:flex;flex-direction:column;align-items:center;gap:22px;max-width:580px;text-align:center"><div class="eyebrow">Credencial on-chain</div><div class="h2">Verifica tu competencia<br>en <span class="accent">Soroban</span></div><div class="award"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12"/></svg>Certified: Scam-Resistant — Stellar Testnet</div><p class="lead">El ReadinessRegistry de Soroban registra tu graduación con un NFT verificable públicamente.</p><code style="font-family:'IBM Plex Mono',monospace;font-size:13px;color:var(--gold);background:var(--surf);border:1px solid var(--gold-ring);border-radius:8px;padding:8px 16px">GET /api/verify?address=G...</code><div style="display:flex;flex-direction:column;gap:8px;width:100%;max-width:380px"><div class="pbar-wrap"><div class="pbar-label"><span>Phishing</span><span>4/4</span></div><div class="pbar-track"><div class="pbar-fill" style="width:100%"></div></div></div><div class="pbar-wrap"><div class="pbar-label"><span>Fake Assets</span><span>3/4</span></div><div class="pbar-track"><div class="pbar-fill" style="width:75%"></div></div></div><div class="pbar-wrap"><div class="pbar-label"><span>Social Engineering</span><span>2/4</span></div><div class="pbar-track"><div class="pbar-fill" style="width:50%"></div></div></div></div></div>\`,
()=>\`<div class="grid-bg"></div><div style="display:flex;flex-direction:column;align-items:center;gap:22px;max-width:600px;text-align:center"><div class="eyebrow">Por qué Stellar</div><div class="h2">La red perfecta para<br>entrenar sin riesgo</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;width:100%"><div class="step" style="flex-direction:column;gap:8px;align-items:flex-start"><div style="font-size:22px">⚡</div><div class="step-title">Testnet gratuita</div><div class="step-desc">Friendbot da XLM de prueba en segundos. Sin arriesgar fondos reales.</div></div><div class="step" style="flex-direction:column;gap:8px;align-items:flex-start"><div style="font-size:22px">📄</div><div class="step-title">Soroban Contracts</div><div class="step-desc">El ReadinessRegistry emite credenciales on-chain permanentes y verificables.</div></div><div class="step" style="flex-direction:column;gap:8px;align-items:flex-start"><div style="font-size:22px">🌎</div><div class="step-title">Diseñada para LATAM</div><div class="step-desc">Bajo costo, finanzas inclusivas. FYV Box apunta al mismo usuario que Stellar.</div></div><div class="step" style="flex-direction:column;gap:8px;align-items:flex-start"><div style="font-size:22px">🔍</div><div class="step-title">Horizon API</div><div class="step-desc">Consultas on-chain en tiempo real para simular escenarios reales con datos de la red.</div></div></div></div>\`,
()=>\`<div class="grid-bg"></div><div style="display:flex;flex-direction:column;align-items:center;gap:22px;max-width:640px;text-align:center"><div class="eyebrow">Stack técnico</div><div class="h2">Moderno · Open Source · Verificable</div><div class="tech-grid"><div class="tech"><div><div class="tech-name">Next.js 16</div><div class="tech-role">App Router · TypeScript</div></div></div><div class="tech"><div><div class="tech-name">Stellar SDK v13</div><div class="tech-role">Horizon · Soroban</div></div></div><div class="tech"><div><div class="tech-name">Supabase</div><div class="tech-role">Progress · RLS</div></div></div><div class="tech"><div><div class="tech-name">Tailwind CSS v4</div><div class="tech-role">Framer Motion</div></div></div><div class="tech"><div><div class="tech-name">Vercel</div><div class="tech-role">Deploy · Edge</div></div></div></div><div class="chip-row" style="margin-top:4px"><span class="chip">100% open source</span><span class="chip">No custodia fondos</span><span class="chip">API pública</span><span class="chip">Testnet-only</span></div></div>\`,
()=>\`<div class="grid-bg"></div><div style="display:flex;flex-direction:column;align-items:center;gap:22px;max-width:620px;text-align:center"><div class="eyebrow">Tracks · CriptoUNAM × Semana DIE</div><div class="h2">Postulando a <span class="accent">Blockchain</span><br>y <span class="accent">Contenido</span></div><div style="display:flex;flex-direction:column;gap:10px;width:100%;max-width:500px"><div class="step"><div class="step-n" style="width:36px;height:36px;font-size:16px">🔗</div><div class="step-body"><div class="step-title">Blockchain → Stellar &nbsp;<span class="pill" style="font-size:10px">$330 + $200 USD</span></div><div class="step-desc">Integración nativa con Stellar SDK, Horizon API y Soroban ReadinessRegistry desde el primer commit.</div></div></div><div class="step"><div class="step-n" style="width:36px;height:36px;font-size:16px">📚</div><div class="step-body"><div class="step-title">Contenido → Tangem &nbsp;<span class="pill" style="font-size:10px">hasta $85 USD</span></div><div class="step-desc">Plataforma educativa en español para la comunidad UNAM/LATAM. Misiones progresivas, certificación.</div></div></div></div><div style="margin-top:4px;display:flex;gap:14px;flex-wrap:wrap;justify-content:center"><div style="text-align:center;padding:10px 20px;background:var(--surf);border:1px solid rgba(240,235,216,.08);border-radius:12px"><div style="font-family:'Syne',sans-serif;font-weight:800;font-size:22px;color:var(--gold)">$615</div><div style="font-size:12px;color:var(--cream-low);margin-top:2px">premio potencial total</div></div></div></div>\`,
()=>\`<div class="grid-bg"></div><div style="display:flex;flex-direction:column;align-items:center;gap:22px;max-width:580px;text-align:center"><div class="logo-wrap"><div class="logo-icon">\${SH}</div><div class="logo-text">FYV<span> Box</span></div></div><div class="h2">Pruébalo ahora</div><div class="link-row"><a class="link-btn primary" href="https://fyv-box.vercel.app">fyv-box.vercel.app</a><a class="link-btn outline" href="https://github.com/ALFA117/fyv-box">ALFA117/fyv-box</a></div><div class="chip-row" style="margin-top:12px"><span class="chip">stellar</span><span class="chip">soroban</span><span class="chip">anti-fraud</span><span class="chip">latam</span><span class="chip">open-source</span></div><p style="font-size:12px;color:var(--cream-low);margin-top:8px">Axel Rodríguez Frías &nbsp;·&nbsp; CriptoUNAM × Semana DIE 2026</p></div>\`,
];
let cur=0;
const deck=document.getElementById('deck');
const dots=document.getElementById('dots');
const snum=document.getElementById('snum');
function build(){
  deck.innerHTML='';dots.innerHTML='';
  SLIDES.forEach((fn,i)=>{
    const el=document.createElement('div');
    el.className='slide'+(i===0?' active':'');
    el.innerHTML=fn();deck.appendChild(el);
    const d=document.createElement('div');
    d.className='dot'+(i===0?' on':'');
    d.onclick=()=>goTo(i);dots.appendChild(d);
  });sync();
}
function slides(){return deck.querySelectorAll('.slide')}
function goTo(n){
  const ss=slides();if(n<0||n>=ss.length)return;
  ss[cur].classList.remove('active');ss[cur].classList.add('prev');
  setTimeout(()=>ss[cur].classList.remove('prev'),500);
  cur=n;ss[cur].classList.add('active');sync();
}
function sync(){
  const ss=slides();
  dots.querySelectorAll('.dot').forEach((d,i)=>d.classList.toggle('on',i===cur));
  snum.textContent=(cur+1)+' / '+ss.length;
  document.getElementById('prev').disabled=cur===0;
  document.getElementById('next').disabled=cur===ss.length-1;
}
function go(d){goTo(cur+d)}
document.addEventListener('keydown',e=>{
  if(e.key==='ArrowRight'||e.key==='ArrowDown')go(1);
  if(e.key==='ArrowLeft'||e.key==='ArrowUp')go(-1);
});
let tx=0;
deck.addEventListener('touchstart',e=>{tx=e.touches[0].clientX},{passive:true});
deck.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-tx;if(Math.abs(dx)>50)go(dx<0?1:-1)},{passive:true});
build();
</script>
</body>
</html>`;

export async function GET() {
  return new NextResponse(HTML, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
