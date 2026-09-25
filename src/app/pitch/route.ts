import { NextResponse } from "next/server";

const HTML = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"/>
<title>FYV Box — Pitch</title>
<meta name="description" content="Simulador anti-fraude crypto sobre Stellar Testnet. Certifícate on-chain."/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"/>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --n0:#02080F;--n1:#060E1F;--n2:#0A1830;--n3:#112040;--n4:#1A2E50;
  --g1:#C9A227;--g2:#E8C84A;--g3:#F0D870;
  --gd:rgba(201,162,39,.18);--gr:rgba(201,162,39,.35);
  --c0:#F5F0E0;--c1:#C4B898;--c2:#8A7A60;--c3:#4A3C28;
  --red:#ef4444;--green:#22c55e;--blue:#3b82f6;
  color-scheme:dark;
}
html,body{height:100%;background:var(--n0);color:var(--c0);font-family:'Inter',sans-serif;overflow:hidden;-webkit-tap-highlight-color:transparent}

/* ──────── CANVAS ──────── */
#cvs{position:fixed;inset:0;pointer-events:none;z-index:0;opacity:0;transition:opacity 1s}
#cvs.vis{opacity:1}

/* ──────── DECK ──────── */
.deck{position:fixed;inset:0;z-index:1}
.s{
  position:absolute;inset:0;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  padding:40px 5vw 80px;
  opacity:0;pointer-events:none;
  transition:opacity .5s cubic-bezier(.22,1,.36,1);
}
.s.on{opacity:1;pointer-events:auto}

/* stagger entrance */
.s.on .a1{animation:up .55s .08s both cubic-bezier(.22,1,.36,1)}
.s.on .a2{animation:up .55s .18s both cubic-bezier(.22,1,.36,1)}
.s.on .a3{animation:up .55s .28s both cubic-bezier(.22,1,.36,1)}
.s.on .a4{animation:up .55s .38s both cubic-bezier(.22,1,.36,1)}
.s.on .a5{animation:up .55s .48s both cubic-bezier(.22,1,.36,1)}
.s.on .af{animation:fade .6s .1s both}
@keyframes up{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:none}}
@keyframes fade{from{opacity:0}to{opacity:1}}

/* ──────── BG layers ──────── */
.bg-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(201,162,39,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(201,162,39,.035) 1px,transparent 1px);background-size:72px 72px;pointer-events:none}
.bg-glow{position:absolute;border-radius:50%;filter:blur(110px);pointer-events:none}

/* ──────── TYPE ──────── */
.eye{font-family:'Syne',sans-serif;font-size:11px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:var(--g1)}
.h1{font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(34px,5.5vw,68px);line-height:1.0;letter-spacing:-.03em;text-wrap:balance;text-align:center}
.h2{font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(26px,4vw,50px);line-height:1.1;letter-spacing:-.025em;text-wrap:balance}
.h3{font-family:'Syne',sans-serif;font-weight:700;font-size:clamp(18px,2.5vw,28px);line-height:1.2;letter-spacing:-.02em}
.body{font-size:clamp(13px,1.4vw,16px);line-height:1.7;color:var(--c1)}
.gold{color:var(--g1)}
.dim{color:var(--c2)}
.mono{font-family:'IBM Plex Mono',monospace}

/* ──────── NAV ──────── */
.nav{
  position:fixed;bottom:22px;left:50%;transform:translateX(-50%);
  display:flex;align-items:center;gap:18px;
  background:rgba(10,24,48,.8);border:1px solid rgba(201,162,39,.25);
  border-radius:99px;padding:9px 20px;backdrop-filter:blur(16px);
  z-index:100;
}
.dots{display:flex;gap:6px;align-items:center}
.dot{width:6px;height:6px;border-radius:50%;background:var(--c3);cursor:pointer;transition:all .25s}
.dot.on{background:var(--g1);width:20px;border-radius:99px}
.arr{background:none;border:none;color:var(--c2);cursor:pointer;font-size:17px;padding:0 4px;transition:color .15s;display:flex;align-items:center}
.arr:hover{color:var(--g1)}
.arr:disabled{opacity:.2;pointer-events:none}
.sn{font-family:'IBM Plex Mono',monospace;font-size:10px;color:var(--c3);min-width:36px;text-align:center;letter-spacing:.06em}

/* ──────── COMPONENTS ──────── */
/* pill */
.pill{display:inline-flex;align-items:center;gap:5px;background:var(--gd);border:1px solid var(--gr);border-radius:99px;padding:4px 12px;font-size:12px;color:var(--g1);font-family:'IBM Plex Mono',monospace;letter-spacing:.04em}

/* card */
.card{background:linear-gradient(135deg,rgba(17,32,64,.9),rgba(10,20,40,.9));border:1px solid rgba(240,235,216,.08);border-radius:18px;padding:22px}

/* glow border card */
.gcard{position:relative;border-radius:18px;padding:1px;background:linear-gradient(135deg,rgba(201,162,39,.35),rgba(201,162,39,.08),rgba(201,162,39,.35))}
.gcard-inner{background:linear-gradient(135deg,#0D1E38,#091525);border-radius:17px;padding:22px;height:100%}

/* stat big */
.stat{text-align:center}
.stat-n{font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(42px,7vw,80px);line-height:1;letter-spacing:-.04em}
.stat-l{font-size:12px;color:var(--c2);margin-top:6px;line-height:1.4}

/* step row */
.step-row{display:flex;align-items:flex-start;gap:14px;padding:14px 16px;background:rgba(17,32,64,.7);border:1px solid rgba(240,235,216,.07);border-radius:14px}
.step-num{width:30px;height:30px;border-radius:50%;background:var(--gd);border:1px solid var(--gr);display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:12px;font-weight:800;color:var(--g1);flex-shrink:0;margin-top:1px}

/* track chip */
.tc{padding:14px;background:rgba(17,32,64,.8);border:1px solid rgba(240,235,216,.07);border-radius:14px}
.tc.lit{border-color:rgba(201,162,39,.3);background:rgba(201,162,39,.07)}
.tc-icon{font-size:24px;margin-bottom:8px}
.tc-name{font-family:'Syne',sans-serif;font-weight:700;font-size:13px;color:var(--c0);margin-bottom:3px}
.tc-desc{font-size:11px;color:var(--c2);line-height:1.4}
.tc-badge{display:inline-block;margin-top:6px;font-size:10px;color:var(--g1);background:var(--gd);border-radius:99px;padding:2px 8px}

/* award mock */
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes pulse{0%,100%{opacity:.7;transform:scale(1)}50%{opacity:1;transform:scale(1.04)}}
.award-ring{position:relative;width:160px;height:160px;flex-shrink:0}
.award-ring::before{content:'';position:absolute;inset:-2px;border-radius:50%;background:conic-gradient(var(--g1),var(--g2),transparent,var(--g1));animation:spin 4s linear infinite}
.award-ring::after{content:'';position:absolute;inset:0;border-radius:50%;background:var(--n2)}
.award-inner{position:absolute;inset:0;border-radius:50%;z-index:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;animation:pulse 3s ease-in-out infinite}

/* pbar */
.pb{margin-bottom:10px}
.pb-head{display:flex;justify-content:space-between;font-size:11px;color:var(--c2);margin-bottom:4px}
.pb-track{height:5px;background:rgba(255,255,255,.06);border-radius:99px;overflow:hidden}
.pb-fill{height:100%;border-radius:99px;background:linear-gradient(90deg,var(--g1),var(--g2))}
.pb-fill.full{background:linear-gradient(90deg,#16a34a,var(--green))}

/* tech badge */
.tech-b{display:flex;align-items:center;gap:10px;padding:10px 16px;background:rgba(17,32,64,.8);border:1px solid rgba(240,235,216,.08);border-radius:12px}
.tech-b-name{font-family:'Syne',sans-serif;font-size:13px;font-weight:700}
.tech-b-role{font-size:11px;color:var(--c2)}

/* link btns */
.btn{display:inline-flex;align-items:center;gap:8px;padding:12px 24px;border-radius:13px;font-family:'Syne',sans-serif;font-size:14px;font-weight:700;text-decoration:none;transition:all .15s;cursor:pointer;border:none}
.btn-gold{background:linear-gradient(135deg,var(--g1),var(--g2));color:var(--n0)}
.btn-gold:hover{transform:translateY(-1px);box-shadow:0 8px 24px rgba(201,162,39,.35)}
.btn-outline{background:transparent;border:1px solid var(--gr);color:var(--g1)}
.btn-outline:hover{background:var(--gd)}

/* divider line */
.vline{width:1px;height:40px;background:linear-gradient(to bottom,transparent,var(--g1),transparent);flex-shrink:0}

/* chip row */
.chips{display:flex;flex-wrap:wrap;gap:7px}
.chip{padding:5px 13px;background:rgba(17,32,64,.9);border:1px solid rgba(240,235,216,.1);border-radius:99px;font-size:12px;color:var(--c1)}

/* ──────── SLIDE SPECIFIC ──────── */

/* S0 hero */
.hero-logo{display:flex;align-items:center;gap:14px}
.hero-icon{width:56px;height:56px;background:var(--gd);border:1px solid var(--gr);border-radius:16px;display:flex;align-items:center;justify-content:center;box-shadow:0 0 40px rgba(201,162,39,.2)}
.hero-wordmark{font-family:'Syne',sans-serif;font-weight:800;font-size:32px;letter-spacing:-.025em}
.hero-wordmark span{color:var(--g1)}

/* S1 problem - big layout */
.prob-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;width:100%;max-width:780px}

/* S2 solution - horizontal steps */
.sol-steps{display:grid;grid-template-columns:1fr auto 1fr auto 1fr auto 1fr;align-items:start;gap:0;width:100%;max-width:820px}
.sol-step{text-align:center;padding:0 8px}
.sol-icon{width:52px;height:52px;background:var(--gd);border:1px solid var(--gr);border-radius:14px;display:flex;align-items:center;justify-content:center;margin:0 auto 10px;font-size:22px}
.sol-arrow{display:flex;align-items:center;justify-content:center;padding-top:14px;color:var(--g1);opacity:.5;font-size:20px}

/* S3 product demo */
.mockup{background:linear-gradient(160deg,#0D1E38,#07111E);border:1px solid rgba(201,162,39,.2);border-radius:20px;padding:20px;width:100%;max-width:480px;box-shadow:0 24px 64px rgba(0,0,0,.5),0 0 60px rgba(201,162,39,.06)}
.mock-bar{display:flex;align-items:center;gap:8px;margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid rgba(240,235,216,.07)}
.mock-dot{width:8px;height:8px;border-radius:50%}
.mission-card{background:rgba(201,162,39,.06);border:1px solid rgba(201,162,39,.2);border-radius:12px;padding:14px;margin-bottom:10px}
.mission-tag{display:inline-block;font-size:10px;padding:2px 8px;border-radius:99px;margin-bottom:8px}

/* S5 stellar */
.stellar-logo{display:flex;align-items:center;gap:10px;margin-bottom:10px}

/* S7 final cta */
.qr-block{width:120px;height:120px;background:var(--c0);border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0}

/* responsive */
@media(max-width:700px){
  .prob-grid{grid-template-columns:1fr}
  .sol-steps{grid-template-columns:1fr;gap:8px}
  .sol-arrow{display:none}
  .s{padding:28px 18px 80px}
  .hero-wordmark{font-size:24px}
}
</style>
</head>
<body>

<canvas id="cvs"></canvas>
<div class="deck" id="deck"></div>
<nav class="nav">
  <button class="arr" id="prev" onclick="go(-1)">&#8592;</button>
  <div class="dots" id="dots"></div>
  <button class="arr" id="next" onclick="go(1)">&#8594;</button>
  <span class="sn" id="snum">1/9</span>
</nav>

<script>
/* ── particles (only on slide 0) ── */
const cvs = document.getElementById('cvs');
const ctx = cvs.getContext('2d');
let W, H, pts = [], raf;
function resize(){ W=cvs.width=innerWidth; H=cvs.height=innerHeight; }
resize(); addEventListener('resize', resize);
for(let i=0;i<90;i++) pts.push({x:Math.random()*2-1,y:Math.random()*2-1,vx:(Math.random()-.5)*.0003,vy:(Math.random()-.5)*.0003,r:Math.random()*.8+.4,a:Math.random()*.7+.2});
function drawParticles(){
  ctx.clearRect(0,0,W,H);
  const cx=W/2,cy=H/2;
  pts.forEach(p=>{
    p.x+=p.vx; p.y+=p.vy;
    if(p.x<-1.2)p.x=1.2; if(p.x>1.2)p.x=-1.2;
    if(p.y<-1.2)p.y=1.2; if(p.y>1.2)p.y=-1.2;
    const px=cx+p.x*W*.6, py=cy+p.y*H*.6;
    ctx.beginPath(); ctx.arc(px,py,p.r,0,Math.PI*2);
    ctx.fillStyle=\`rgba(201,162,39,\${p.a*.55})\`; ctx.fill();
  });
  pts.forEach((a,i)=>pts.slice(i+1).forEach(b=>{
    const ax=cx+a.x*W*.6,ay=cy+a.y*H*.6,bx=cx+b.x*W*.6,by=cy+b.y*H*.6;
    const d=Math.hypot(ax-bx,ay-by);
    if(d<140){ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);ctx.strokeStyle=\`rgba(201,162,39,\${(.14*(1-d/140))})\`;ctx.lineWidth=.7;ctx.stroke()}
  }));
  raf=requestAnimationFrame(drawParticles);
}

/* ── slides content ── */
const SHIELD = \`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C9A227" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L4 6v6c0 4.4 3.4 8.5 8 9.5 4.6-1 8-5.1 8-9.5V6l-8-4z"/></svg>\`;

const SLIDES = [

/* ── 0 PORTADA ── */
\`<div class="bg-glow" style="width:600px;height:600px;top:-200px;left:-150px;background:rgba(201,162,39,.04)"></div>
<div class="bg-glow" style="width:400px;height:400px;bottom:-150px;right:-100px;background:rgba(59,130,246,.04)"></div>
<div style="display:flex;flex-direction:column;align-items:center;gap:20px;max-width:760px;text-align:center;position:relative">
  <div class="a1">
    <div class="hero-logo">
      <div class="hero-icon">\${SHIELD}</div>
      <div class="hero-wordmark">FYV<span> Box</span></div>
    </div>
  </div>
  <div class="a2" style="width:100%">
    <div class="h1">Entrena para <span class="gold">no caer</span><br>en estafas crypto</div>
  </div>
  <p class="body a3" style="max-width:520px;font-size:clamp(14px,1.8vw,18px)">El primer simulador de fraudes Web3 que te certifica on-chain — construido sobre <span class="gold">Stellar Testnet</span>.</p>
  <div class="a4" style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center">
    <span class="pill">Stellar · Soroban</span>
    <span class="pill">Credencial On-Chain</span>
    <span class="pill">Open Source</span>
    <span class="pill">LATAM</span>
  </div>
  <div class="a5" style="display:flex;align-items:center;gap:16px;margin-top:6px">
    <span style="font-size:12px;color:var(--c2);font-family:'IBM Plex Mono',monospace">fyv-box.vercel.app</span>
    <div class="vline"></div>
    <span style="font-size:12px;color:var(--c2)">CriptoUNAM × Semana DIE 2026</span>
  </div>
</div>\`,

/* ── 1 PROBLEMA ── */
\`<div class="bg-grid"></div>
<div style="display:flex;flex-direction:column;align-items:center;gap:24px;width:100%;max-width:820px">
  <div class="a1" style="text-align:center">
    <div class="eye" style="margin-bottom:8px">El problema</div>
    <div class="h2">En crypto LATAM,<br>aprendes perdiendo</div>
  </div>
  <div class="prob-grid a2">
    <div class="gcard">
      <div class="gcard-inner" style="text-align:center;padding:24px 18px">
        <div class="stat-n" style="color:#ef4444">$3.2B</div>
        <div class="stat-l">perdidos en fraudes<br>crypto en LATAM (2023)<br><span style="font-size:10px;opacity:.6">Chainalysis</span></div>
      </div>
    </div>
    <div class="card" style="text-align:center;padding:24px 18px">
      <div class="stat-n" style="color:#f97316">73%</div>
      <div class="stat-l">de víctimas no reconocieron<br>la señal de alerta<br>a tiempo</div>
    </div>
    <div class="card" style="text-align:center;padding:24px 18px">
      <div class="stat-n" style="color:var(--g1)">0</div>
      <div class="stat-l">plataformas de<br>entrenamiento anti-fraude<br>en español</div>
    </div>
  </div>
  <p class="body a3" style="text-align:center;max-width:540px">Los walkthroughs de YouTube no entrenan el instinto. Los fraudes se reconocen <em>viviéndolos</em>, no leyéndolos.</p>
</div>\`,

/* ── 2 SOLUCIÓN ── */
\`<div class="bg-grid"></div>
<div style="display:flex;flex-direction:column;align-items:center;gap:24px;width:100%;max-width:820px">
  <div class="a1" style="text-align:center">
    <div class="eye" style="margin-bottom:8px">La solución</div>
    <div class="h2"><span class="gold">FYV Box</span> — simulacro · XP · credencial</div>
  </div>
  <div class="sol-steps a2" style="display:grid;grid-template-columns:1fr auto 1fr auto 1fr auto 1fr;align-items:start;gap:0;width:100%">
    <div class="sol-step">
      <div class="sol-icon">🔑</div>
      <div style="font-family:'Syne',sans-serif;font-weight:700;font-size:13px;color:var(--c0);margin-bottom:4px">Conecta</div>
      <div style="font-size:11.5px;color:var(--c2);line-height:1.5">Clave pública Stellar como identidad. Sin contraseña.</div>
    </div>
    <div class="sol-arrow">→</div>
    <div class="sol-step">
      <div class="sol-icon">🎯</div>
      <div style="font-family:'Syne',sans-serif;font-weight:700;font-size:13px;color:var(--c0);margin-bottom:4px">Simula</div>
      <div style="font-size:11.5px;color:var(--c2);line-height:1.5">Phishing, rug pulls y scams reales en un entorno seguro.</div>
    </div>
    <div class="sol-arrow">→</div>
    <div class="sol-step">
      <div class="sol-icon">⭐</div>
      <div style="font-family:'Syne',sans-serif;font-weight:700;font-size:13px;color:var(--c0);margin-bottom:4px">Aprende</div>
      <div style="font-size:11.5px;color:var(--c2);line-height:1.5">Cada error enseña. XP y progreso por track.</div>
    </div>
    <div class="sol-arrow">→</div>
    <div class="sol-step">
      <div class="sol-icon" style="background:rgba(34,197,94,.15);border-color:rgba(34,197,94,.4)">🏆</div>
      <div style="font-family:'Syne',sans-serif;font-weight:700;font-size:13px;color:var(--green);margin-bottom:4px">Gradúate</div>
      <div style="font-size:11.5px;color:var(--c2);line-height:1.5">Credencial Soroban on-chain verificable por cualquiera.</div>
    </div>
  </div>
  <div class="a3" style="display:flex;gap:24px;flex-wrap:wrap;justify-content:center;padding:18px 24px;background:rgba(201,162,39,.05);border:1px solid rgba(201,162,39,.15);border-radius:16px">
    <div style="text-align:center"><div style="font-family:'Syne',sans-serif;font-weight:800;font-size:26px;color:var(--g1)">6</div><div style="font-size:11px;color:var(--c2)">tracks de entrenamiento</div></div>
    <div class="vline" style="height:32px;margin:auto"></div>
    <div style="text-align:center"><div style="font-family:'Syne',sans-serif;font-weight:800;font-size:26px;color:var(--g1)">20+</div><div style="font-size:11px;color:var(--c2)">misiones activas</div></div>
    <div class="vline" style="height:32px;margin:auto"></div>
    <div style="text-align:center"><div style="font-family:'Syne',sans-serif;font-weight:800;font-size:26px;color:var(--green)">1</div><div style="font-size:11px;color:var(--c2)">credencial on-chain</div></div>
  </div>
</div>\`,

/* ── 3 PRODUCTO / DEMO ── */
\`<div class="bg-grid"></div>
<div style="display:flex;align-items:center;gap:40px;width:100%;max-width:860px;flex-wrap:wrap;justify-content:center">
  <div style="flex:1;min-width:260px;max-width:360px">
    <div class="eye a1" style="margin-bottom:10px">El producto</div>
    <div class="h3 a2" style="margin-bottom:14px">Misiones que se sienten reales</div>
    <div style="display:flex;flex-direction:column;gap:10px">
      <div class="step-row a3">
        <div class="step-num">✓</div>
        <div><div style="font-weight:600;font-size:13px;color:var(--c0)">Phishing interactivo</div><div style="font-size:12px;color:var(--c2)">El usuario decide si el sitio es legítimo. Retroalimentación inmediata.</div></div>
      </div>
      <div class="step-row a4">
        <div class="step-num">✓</div>
        <div><div style="font-weight:600;font-size:13px;color:var(--c0)">Falsos tokens Stellar</div><div style="font-size:12px;color:var(--c2)">Assets reales de testnet clonados para el simulacro.</div></div>
      </div>
      <div class="step-row a5">
        <div class="step-num">✓</div>
        <div><div style="font-weight:600;font-size:13px;color:var(--c0)">Progreso persistente</div><div style="font-size:12px;color:var(--c2)">Supabase + clave pública. Historial permanente.</div></div>
      </div>
    </div>
  </div>
  <div class="mockup a2" style="flex:1;min-width:260px;max-width:380px">
    <div class="mock-bar">
      <div class="mock-dot" style="background:#ef4444"></div>
      <div class="mock-dot" style="background:#f59e0b"></div>
      <div class="mock-dot" style="background:#22c55e"></div>
      <span style="font-family:'IBM Plex Mono',monospace;font-size:10px;color:var(--c2);margin-left:8px">fyv-box.vercel.app/dashboard</span>
    </div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
      <div style="font-family:'Syne',sans-serif;font-weight:700;font-size:14px">Tu progreso</div>
      <div style="display:flex;align-items:center;gap:5px;background:rgba(201,162,39,.1);border:1px solid rgba(201,162,39,.25);border-radius:99px;padding:3px 10px">
        <span style="font-size:14px">⭐</span><span style="font-family:'Syne',sans-serif;font-weight:800;font-size:13px;color:var(--g1)">420 XP</span>
      </div>
    </div>
    <div class="pb"><div class="pb-head"><span>Phishing</span><span>4/4</span></div><div class="pb-track"><div class="pb-fill full" style="width:100%"></div></div></div>
    <div class="pb"><div class="pb-head"><span>Fake Assets</span><span>3/4</span></div><div class="pb-track"><div class="pb-fill" style="width:75%"></div></div></div>
    <div class="pb"><div class="pb-head"><span>Social Eng.</span><span>2/4</span></div><div class="pb-track"><div class="pb-fill" style="width:50%"></div></div></div>
    <div style="margin-top:14px;border-top:1px solid rgba(240,235,216,.07);padding-top:12px">
      <div class="mission-card">
        <span class="mission-tag" style="background:rgba(239,68,68,.12);color:#f87171;border:1px solid rgba(239,68,68,.2)">🎣 PHISHING</span>
        <div style="font-weight:600;font-size:13px;margin-bottom:4px">stellar-airdrop.com te pide tu seed phrase</div>
        <div style="font-size:11px;color:var(--c2)">¿Es legítimo? · 3 puntos de evidencia</div>
      </div>
    </div>
  </div>
</div>\`,

/* ── 4 TRACKS ── */
\`<div class="bg-grid"></div>
<div style="display:flex;flex-direction:column;align-items:center;gap:20px;width:100%;max-width:780px">
  <div class="a1" style="text-align:center">
    <div class="eye" style="margin-bottom:8px">Tracks de entrenamiento</div>
    <div class="h2">6 categorías de fraude<br><span class="gold">real</span></div>
  </div>
  <div class="a2" style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;width:100%">
    <div class="tc lit">
      <div class="tc-icon">🎣</div>
      <div class="tc-name">Phishing</div>
      <div class="tc-desc">Sitios falsos, emails y links trampa diseñados para robar claves</div>
      <span class="tc-badge">Activo ✓</span>
    </div>
    <div class="tc lit">
      <div class="tc-icon">💎</div>
      <div class="tc-name">Fake Assets</div>
      <div class="tc-desc">Tokens clonados, contratos trampa y airdrops fraudulentos</div>
      <span class="tc-badge">Activo ✓</span>
    </div>
    <div class="tc lit">
      <div class="tc-icon">🤝</div>
      <div class="tc-name">Social Eng.</div>
      <div class="tc-desc">Manipulación psicológica, urgencia artificial y falsa autoridad</div>
      <span class="tc-badge">Activo ✓</span>
    </div>
    <div class="tc">
      <div class="tc-icon">⚠️</div>
      <div class="tc-name">Approvals</div>
      <div class="tc-desc">Permisos de wallet peligrosos e infinite approvals</div>
      <span class="tc-badge" style="color:var(--c2);background:rgba(255,255,255,.05)">Próximamente</span>
    </div>
    <div class="tc">
      <div class="tc-icon">🚀</div>
      <div class="tc-name">Presale Scam</div>
      <div class="tc-desc">Rug pulls, preventa fraudulenta y tokenomics trampa</div>
      <span class="tc-badge" style="color:var(--c2);background:rgba(255,255,255,.05)">Próximamente</span>
    </div>
    <div class="tc">
      <div class="tc-icon">🔑</div>
      <div class="tc-name">Key Hygiene</div>
      <div class="tc-desc">Exposición accidental de claves y malas prácticas de custodia</div>
      <span class="tc-badge" style="color:var(--c2);background:rgba(255,255,255,.05)">Próximamente</span>
    </div>
  </div>
</div>\`,

/* ── 5 CREDENCIAL ── */
\`<div class="bg-grid"></div>
<div style="display:flex;align-items:center;gap:48px;width:100%;max-width:820px;flex-wrap:wrap;justify-content:center">
  <div class="a1" style="display:flex;flex-direction:column;align-items:center">
    <div class="award-ring">
      <div class="award-inner">
        \${SHIELD}
        <div style="font-family:'Syne',sans-serif;font-weight:800;font-size:11px;color:var(--g1);text-align:center;line-height:1.3">SCAM<br>RESISTANT</div>
        <div style="font-family:'IBM Plex Mono',monospace;font-size:9px;color:var(--c2);margin-top:4px">Soroban NFT</div>
      </div>
    </div>
    <div style="margin-top:14px;font-size:11px;color:var(--c2);text-align:center;font-family:'IBM Plex Mono',monospace;line-height:1.5">
      ReadinessRegistry<br>Stellar Testnet
    </div>
  </div>
  <div style="flex:1;min-width:260px;max-width:380px">
    <div class="eye a2" style="margin-bottom:10px">Credencial On-Chain</div>
    <div class="h3 a3" style="margin-bottom:14px">Un NFT que demuestra<br>competencia real</div>
    <div class="a4" style="display:flex;flex-direction:column;gap:12px">
      <div style="display:flex;align-items:flex-start;gap:12px">
        <div style="width:8px;height:8px;border-radius:50%;background:var(--g1);margin-top:5px;flex-shrink:0"></div>
        <div><div style="font-size:13px;font-weight:600;color:var(--c0);margin-bottom:2px">Verificable públicamente</div><div style="font-size:12px;color:var(--c2)">Cualquiera puede consultar GET /api/verify?address=G…</div></div>
      </div>
      <div style="display:flex;align-items:flex-start;gap:12px">
        <div style="width:8px;height:8px;border-radius:50%;background:var(--g1);margin-top:5px;flex-shrink:0"></div>
        <div><div style="font-size:13px;font-weight:600;color:var(--c0);margin-bottom:2px">Permanente en la red</div><div style="font-size:12px;color:var(--c2)">Registrado en el contrato Soroban ReadinessRegistry</div></div>
      </div>
      <div style="display:flex;align-items:flex-start;gap:12px">
        <div style="width:8px;height:8px;border-radius:50%;background:var(--g1);margin-top:5px;flex-shrink:0"></div>
        <div><div style="font-size:13px;font-weight:600;color:var(--c0);margin-bottom:2px">Sin costo</div><div style="font-size:12px;color:var(--c2)">Testnet. Friendbot cubre las fees de emisión.</div></div>
      </div>
    </div>
    <div class="a5" style="margin-top:16px;background:rgba(34,197,94,.07);border:1px solid rgba(34,197,94,.2);border-radius:10px;padding:10px 14px">
      <code class="mono" style="font-size:12px;color:var(--green)">GET /api/verify?address=GABC…<br>→ { "graduated": true, "xp": 820 }</code>
    </div>
  </div>
</div>\`,

/* ── 6 STELLAR + STACK ── */
\`<div class="bg-grid"></div>
<div style="display:flex;flex-direction:column;align-items:center;gap:20px;width:100%;max-width:820px">
  <div class="a1" style="text-align:center">
    <div class="eye" style="margin-bottom:8px">Tecnología</div>
    <div class="h2">Construido sobre <span class="gold">Stellar</span></div>
  </div>
  <div class="a2" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;width:100%;max-width:660px">
    <div class="card" style="padding:18px">
      <div style="font-size:20px;margin-bottom:8px">⚡</div>
      <div style="font-family:'Syne',sans-serif;font-weight:700;font-size:13px;margin-bottom:5px">Testnet gratuita</div>
      <div style="font-size:12px;color:var(--c2)">Friendbot financia las cuentas. Los usuarios practican sin riesgo real.</div>
    </div>
    <div class="card" style="padding:18px">
      <div style="font-size:20px;margin-bottom:8px">📋</div>
      <div style="font-family:'Syne',sans-serif;font-weight:700;font-size:13px;margin-bottom:5px">Soroban Contracts</div>
      <div style="font-size:12px;color:var(--c2)">ReadinessRegistry emite credenciales on-chain permanentes.</div>
    </div>
    <div class="card" style="padding:18px">
      <div style="font-size:20px;margin-bottom:8px">🌎</div>
      <div style="font-family:'Syne',sans-serif;font-weight:700;font-size:13px;margin-bottom:5px">Diseñada para LATAM</div>
      <div style="font-size:12px;color:var(--c2)">Mismo público objetivo que Stellar: finanzas inclusivas.</div>
    </div>
    <div class="card" style="padding:18px">
      <div style="font-size:20px;margin-bottom:8px">🔍</div>
      <div style="font-family:'Syne',sans-serif;font-weight:700;font-size:13px;margin-bottom:5px">Horizon API</div>
      <div style="font-size:12px;color:var(--c2)">Datos on-chain en tiempo real para escenarios de simulacro.</div>
    </div>
  </div>
  <div class="a3" style="width:100%;max-width:660px">
    <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center">
      <div class="tech-b"><div><div class="tech-b-name">Next.js 16</div><div class="tech-b-role">App Router · TS</div></div></div>
      <div class="tech-b"><div><div class="tech-b-name">Stellar SDK v13</div><div class="tech-b-role">Horizon · Soroban</div></div></div>
      <div class="tech-b"><div><div class="tech-b-name">Supabase</div><div class="tech-b-role">Auth · Progress</div></div></div>
      <div class="tech-b"><div><div class="tech-b-name">Tailwind v4</div><div class="tech-b-role">Framer Motion</div></div></div>
      <div class="tech-b"><div><div class="tech-b-name">Vercel</div><div class="tech-b-role">Deploy · Edge</div></div></div>
    </div>
  </div>
</div>\`,

/* ── 7 SPONSORS ── */
\`<div class="bg-grid"></div>
<div style="display:flex;flex-direction:column;align-items:center;gap:24px;width:100%;max-width:780px">
  <div class="a1" style="text-align:center">
    <div class="eye" style="margin-bottom:8px">CriptoUNAM × Semana DIE 2026</div>
    <div class="h2">Postulando a <span class="gold">2 tracks</span></div>
  </div>
  <div class="a2" style="display:flex;flex-direction:column;gap:10px;width:100%;max-width:560px">
    <div class="gcard">
      <div class="gcard-inner" style="display:flex;align-items:flex-start;gap:14px">
        <div style="font-size:28px">🔗</div>
        <div style="flex:1">
          <div style="font-family:'Syne',sans-serif;font-weight:700;font-size:15px;margin-bottom:4px">Blockchain → <span class="gold">Stellar</span></div>
          <div style="font-size:12px;color:var(--c2);margin-bottom:10px">Integración nativa desde el primer commit: SDK v13, Horizon API, Soroban ReadinessRegistry.</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <span class="pill" style="font-size:11px">Stellar $330</span>
            <span class="pill" style="font-size:11px">Pollar $200</span>
          </div>
        </div>
      </div>
    </div>
    <div class="card" style="display:flex;align-items:flex-start;gap:14px">
      <div style="font-size:28px">📚</div>
      <div style="flex:1">
        <div style="font-family:'Syne',sans-serif;font-weight:700;font-size:15px;margin-bottom:4px">Contenido → <span class="gold">Tangem</span></div>
        <div style="font-size:12px;color:var(--c2);margin-bottom:10px">Plataforma educativa en español. Misiones progresivas, certificación. Comunidad UNAM/LATAM.</div>
        <span class="pill" style="font-size:11px">Tangem hasta $85</span>
      </div>
    </div>
  </div>
  <div class="a3" style="display:flex;gap:20px;flex-wrap:wrap;justify-content:center">
    <div style="text-align:center;padding:14px 28px;background:rgba(201,162,39,.07);border:1px solid rgba(201,162,39,.2);border-radius:14px">
      <div style="font-family:'Syne',sans-serif;font-weight:800;font-size:32px;color:var(--g1)">$615</div>
      <div style="font-size:11px;color:var(--c2);margin-top:2px">premio potencial total</div>
    </div>
    <div style="text-align:center;padding:14px 28px;background:rgba(17,32,64,.8);border:1px solid rgba(240,235,216,.08);border-radius:14px">
      <div style="font-family:'Syne',sans-serif;font-weight:800;font-size:32px;color:var(--c0)">100%</div>
      <div style="font-size:11px;color:var(--c2);margin-top:2px">open source</div>
    </div>
  </div>
</div>\`,

/* ── 8 CTA ── */
\`<div class="bg-glow" style="width:500px;height:500px;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(201,162,39,.04);border-radius:50%"></div>
<div style="display:flex;flex-direction:column;align-items:center;gap:22px;max-width:580px;text-align:center;position:relative">
  <div class="a1">
    <div class="hero-logo" style="justify-content:center">
      <div class="hero-icon">\${SHIELD}</div>
      <div class="hero-wordmark">FYV<span> Box</span></div>
    </div>
  </div>
  <div class="a2">
    <div class="h2">Pruébalo ahora</div>
  </div>
  <div class="a3" style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center">
    <a class="btn btn-gold" href="https://fyv-box.vercel.app" target="_blank">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
      fyv-box.vercel.app
    </a>
    <a class="btn btn-outline" href="https://github.com/ALFA117/fyv-box" target="_blank">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/></svg>
      ALFA117/fyv-box
    </a>
  </div>
  <div class="a4 chips" style="justify-content:center">
    <span class="chip">stellar</span><span class="chip">soroban</span><span class="chip">anti-fraud</span><span class="chip">latam</span><span class="chip">open-source</span>
  </div>
  <div class="a5" style="padding:14px 20px;background:rgba(17,32,64,.8);border:1px solid rgba(240,235,216,.08);border-radius:12px;width:100%;max-width:420px">
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
      <div>
        <div style="font-family:'Syne',sans-serif;font-weight:700;font-size:14px">Axel Rodríguez Frías</div>
        <div style="font-size:12px;color:var(--c2)">rodriguez.frias.axelisaias@gmail.com</div>
      </div>
      <code class="mono" style="font-size:11px;color:var(--g1)">github.com/ALFA117</code>
    </div>
  </div>
</div>\`,

];

/* ── engine ── */
let cur = 0;
const deck = document.getElementById('deck');
const dotsEl = document.getElementById('dots');
const snumEl = document.getElementById('snum');

function build(){
  deck.innerHTML=''; dotsEl.innerHTML='';
  SLIDES.forEach((html,i)=>{
    const el = document.createElement('div');
    el.className = 's' + (i===0?' on':'');
    el.innerHTML = html;
    deck.appendChild(el);
    const d = document.createElement('div');
    d.className = 'dot' + (i===0?' on':'');
    d.onclick = ()=>goTo(i);
    dotsEl.appendChild(d);
  });
  sync();
  // particles on first slide
  drawParticles();
  cvs.classList.add('vis');
}

function slides(){ return deck.querySelectorAll('.s') }

function goTo(n){
  const ss = slides();
  if(n<0||n>=ss.length) return;
  ss[cur].classList.remove('on');
  cur = n;
  ss[cur].classList.add('on');
  // particles only on slide 0
  if(cur===0){ cvs.classList.add('vis'); if(!raf) drawParticles(); }
  else { cvs.classList.remove('vis'); cancelAnimationFrame(raf); raf=null; }
  sync();
}

function sync(){
  const ss = slides();
  dotsEl.querySelectorAll('.dot').forEach((d,i)=>d.classList.toggle('on',i===cur));
  snumEl.textContent=(cur+1)+'/'+ss.length;
  document.getElementById('prev').disabled=cur===0;
  document.getElementById('next').disabled=cur===ss.length-1;
}

function go(d){ goTo(cur+d); }

document.addEventListener('keydown',e=>{
  if(e.key==='ArrowRight'||e.key==='ArrowDown') go(1);
  if(e.key==='ArrowLeft'||e.key==='ArrowUp') go(-1);
});

let tx=0;
document.addEventListener('touchstart',e=>{tx=e.touches[0].clientX},{passive:true});
document.addEventListener('touchend',e=>{
  const dx=e.changedTouches[0].clientX-tx;
  if(Math.abs(dx)>48) go(dx<0?1:-1);
},{passive:true});

build();
</script>
</body>
</html>`;

export async function GET() {
  return new NextResponse(HTML, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
