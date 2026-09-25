import { NextResponse } from "next/server";

const HTML = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"/>
<title>FYV Box — Pitch</title>
<meta name="description" content="Simulador anti-fraude crypto sobre Stellar Testnet. Certifícate on-chain."/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500&family=IBM+Plex+Mono:wght@400;500&display=swap"/>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;overflow:hidden;background:#050A14;color:#F0EBD8;font-family:'Inter',sans-serif;-webkit-tap-highlight-color:transparent}

/* ── canvas ── */
#cvs{position:fixed;inset:0;z-index:0;pointer-events:none}

/* ── deck & slides ── */
.deck{position:fixed;inset:0;z-index:1}

.s{
  position:absolute;inset:0;
  display:flex;flex-direction:column;
  padding:0 6vw;
  /* default: hidden right */
  opacity:0;
  transform:translateX(48px);
  pointer-events:none;
  transition:opacity .46s cubic-bezier(.16,1,.3,1), transform .46s cubic-bezier(.16,1,.3,1);
}
.s.on{opacity:1;transform:translateX(0);pointer-events:auto}
.s.left{opacity:0;transform:translateX(-48px)}

/* per-element entrance (only fires when parent has .on) */
.s.on .e1{animation:rise .55s .06s both cubic-bezier(.22,1,.36,1)}
.s.on .e2{animation:rise .55s .14s both cubic-bezier(.22,1,.36,1)}
.s.on .e3{animation:rise .55s .22s both cubic-bezier(.22,1,.36,1)}
.s.on .e4{animation:rise .55s .30s both cubic-bezier(.22,1,.36,1)}
.s.on .e5{animation:rise .55s .38s both cubic-bezier(.22,1,.36,1)}
@keyframes rise{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}

/* ── navigation ── */
.nav{
  position:fixed;bottom:28px;left:50%;transform:translateX(-50%);
  z-index:100;
  display:flex;align-items:center;gap:14px;
  padding:9px 22px;
  background:rgba(5,10,20,.75);
  border:1px solid rgba(201,162,39,.22);
  border-radius:99px;
  backdrop-filter:blur(20px);
}
.dots{display:flex;gap:6px;align-items:center}
.dot{
  width:5px;height:5px;border-radius:50%;
  background:rgba(201,162,39,.25);cursor:pointer;
  transition:all .25s cubic-bezier(.22,1,.36,1);
}
.dot.on{background:#C9A227;width:22px;border-radius:99px}
.arr{
  background:none;border:none;
  color:rgba(201,162,39,.45);cursor:pointer;font-size:16px;
  padding:0 2px;line-height:1;
  transition:color .15s;display:flex;align-items:center
}
.arr:hover{color:#C9A227}
.arr:disabled{opacity:.18;pointer-events:none}
.snum{font-family:'IBM Plex Mono',monospace;font-size:10px;color:rgba(201,162,39,.4);min-width:32px;text-align:center;letter-spacing:.08em}

/* ── slide progress bar top ── */
.prog{position:fixed;top:0;left:0;height:2px;background:linear-gradient(90deg,#C9A227,#E8C84A);z-index:200;transition:width .4s cubic-bezier(.22,1,.36,1)}

/* ── shared tokens ── */
.tag{
  display:inline-flex;align-items:center;gap:6px;
  padding:5px 14px;
  border:1px solid rgba(201,162,39,.3);
  border-radius:99px;
  font-size:12px;color:#C9A227;
  font-family:'IBM Plex Mono',monospace;letter-spacing:.04em;
  background:rgba(201,162,39,.08);
}
.chip{
  display:inline-flex;align-items:center;gap:6px;
  padding:5px 14px;
  border:1px solid rgba(240,235,216,.1);
  border-radius:99px;
  font-size:12px;color:rgba(240,235,216,.55);
  background:rgba(240,235,216,.04);
}
.eye{
  font-family:'Syne',sans-serif;font-size:11px;font-weight:700;
  letter-spacing:.18em;text-transform:uppercase;
  color:#C9A227;margin-bottom:12px;
}

/* ── S0 — COVER ── */
.s0{justify-content:center;align-items:center;text-align:center}
.s0-logo{display:flex;align-items:center;gap:13px;margin-bottom:28px}
.s0-icon{
  width:52px;height:52px;border-radius:14px;
  background:rgba(201,162,39,.1);border:1px solid rgba(201,162,39,.35);
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 0 32px rgba(201,162,39,.18);
}
.s0-wordmark{font-family:'Syne',sans-serif;font-weight:800;font-size:30px;letter-spacing:-.025em;color:#F0EBD8}
.s0-wordmark b{color:#C9A227;font-weight:800}
.s0-h{
  font-family:'Syne',sans-serif;font-weight:800;
  font-size:clamp(40px,7.5vw,88px);
  line-height:.98;letter-spacing:-.035em;
  color:#F0EBD8;margin-bottom:18px;
  text-wrap:balance;
}
.s0-h em{
  font-style:normal;
  background:linear-gradient(90deg,#C9A227,#E8C84A,#C9A227);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
}
.s0-sub{font-size:clamp(14px,1.6vw,18px);color:rgba(240,235,216,.55);margin-bottom:28px;max-width:480px}
.s0-tags{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}

/* ── S1 — PROBLEM ── */
.s1{justify-content:center}
.s1-num{
  font-family:'Syne',sans-serif;font-weight:800;
  font-size:clamp(80px,18vw,200px);
  line-height:.9;letter-spacing:-.05em;
  background:linear-gradient(135deg,#ef4444,#f97316,#fbbf24);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
  margin-bottom:16px;
}
.s1-label{
  font-size:clamp(16px,2.5vw,28px);
  color:rgba(240,235,216,.6);
  max-width:520px;
  line-height:1.4;
  margin-bottom:28px;
}
.s1-label strong{color:#F0EBD8}
.s1-note{
  font-size:clamp(18px,2.8vw,32px);
  font-family:'Syne',sans-serif;font-weight:700;
  color:#F0EBD8;
}

/* ── S2 — SOLUTION ── */
.s2{justify-content:center;align-items:center;text-align:center}
.s2-h{
  font-family:'Syne',sans-serif;font-weight:800;
  font-size:clamp(28px,5vw,60px);
  line-height:1.05;letter-spacing:-.03em;
  margin-bottom:10px;
}
.s2-sub{font-size:clamp(14px,1.5vw,17px);color:rgba(240,235,216,.5);margin-bottom:36px;max-width:500px}
.s2-flow{display:flex;align-items:flex-start;gap:0;width:100%;max-width:760px}
.s2-step{flex:1;display:flex;flex-direction:column;align-items:center;text-align:center;padding:0 12px}
.s2-icon{
  width:60px;height:60px;border-radius:16px;
  display:flex;align-items:center;justify-content:center;
  font-size:26px;margin:0 auto 12px;
}
.s2-step-n{font-family:'Syne',sans-serif;font-weight:700;font-size:14px;color:#F0EBD8;margin-bottom:4px}
.s2-step-d{font-size:12px;color:rgba(240,235,216,.45);line-height:1.5}
.s2-arrow{display:flex;align-items:center;justify-content:center;padding-top:18px;color:rgba(201,162,39,.3);font-size:20px;flex-shrink:0}

/* ── S3 — PRODUCT ── */
.s3{justify-content:center;align-items:center;gap:40px;flex-direction:row;flex-wrap:wrap}
.s3-text{flex:0 0 260px;max-width:300px}
.s3-text .s3-h{
  font-family:'Syne',sans-serif;font-weight:800;
  font-size:clamp(22px,3vw,36px);
  line-height:1.15;letter-spacing:-.025em;
  margin-bottom:16px;
}
.s3-text p{font-size:13px;color:rgba(240,235,216,.5);line-height:1.7;margin-bottom:10px}
.s3-feat{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid rgba(240,235,216,.06)}
.s3-feat:last-child{border-bottom:none}
.s3-feat-dot{width:6px;height:6px;border-radius:50%;background:#C9A227;flex-shrink:0}
.s3-feat-text{font-size:12.5px;color:rgba(240,235,216,.7)}

/* mockup */
.mockup{
  flex:1;min-width:280px;max-width:420px;
  background:linear-gradient(160deg,#0C1B30,#070F1C);
  border:1px solid rgba(201,162,39,.18);
  border-radius:18px;
  overflow:hidden;
  box-shadow:0 32px 80px rgba(0,0,0,.6),0 0 60px rgba(201,162,39,.05);
}
.mk-topbar{
  display:flex;align-items:center;gap:6px;
  padding:10px 14px;
  background:rgba(0,0,0,.3);
  border-bottom:1px solid rgba(255,255,255,.05);
}
.mk-dot{width:9px;height:9px;border-radius:50%}
.mk-url{
  flex:1;text-align:center;
  font-family:'IBM Plex Mono',monospace;font-size:10px;
  color:rgba(240,235,216,.3);
  background:rgba(255,255,255,.04);
  border-radius:5px;padding:3px 8px;
  margin:0 8px;
}
.mk-body{padding:16px}
.mk-nav{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
.mk-logo{display:flex;align-items:center;gap:7px}
.mk-logo-icon{width:22px;height:22px;background:rgba(201,162,39,.15);border:1px solid rgba(201,162,39,.3);border-radius:6px;display:flex;align-items:center;justify-content:center}
.mk-logo-text{font-family:'Syne',sans-serif;font-weight:800;font-size:13px;color:#F0EBD8}
.mk-logo-text b{color:#C9A227}
.mk-xp{display:flex;align-items:center;gap:5px;background:rgba(201,162,39,.08);border:1px solid rgba(201,162,39,.2);border-radius:99px;padding:3px 10px;font-family:'Syne',sans-serif;font-size:11px;font-weight:700;color:#C9A227}
.mk-card{background:rgba(201,162,39,.05);border:1px solid rgba(201,162,39,.15);border-radius:12px;padding:12px;margin-bottom:10px}
.mk-card-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
.mk-card-title{font-family:'Syne',sans-serif;font-weight:700;font-size:12px}
.mk-prog-label{display:flex;justify-content:space-between;font-size:10px;color:rgba(240,235,216,.4);margin-bottom:4px}
.mk-prog-bar{height:4px;background:rgba(255,255,255,.07);border-radius:99px;overflow:hidden;margin-bottom:7px}
.mk-prog-fill{height:100%;border-radius:99px;background:linear-gradient(90deg,#C9A227,#E8C84A)}
.mk-mission{background:rgba(239,68,68,.07);border:1px solid rgba(239,68,68,.15);border-radius:10px;padding:10px}
.mk-mission-tag{display:inline-block;font-size:9px;padding:2px 7px;border-radius:99px;background:rgba(239,68,68,.1);color:#f87171;border:1px solid rgba(239,68,68,.2);margin-bottom:6px;font-family:'IBM Plex Mono',monospace}
.mk-mission-title{font-size:11px;font-weight:600;color:#F0EBD8;margin-bottom:3px}
.mk-mission-sub{font-size:10px;color:rgba(240,235,216,.4)}

/* ── S4 — TRACKS ── */
.s4{justify-content:center;align-items:center;text-align:center}
.s4-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;width:100%;max-width:680px;margin-top:24px}
.s4-card{
  padding:18px 14px 16px;
  border-radius:16px;
  text-align:left;
  border:1px solid rgba(240,235,216,.06);
  background:rgba(240,235,216,.02);
  transition:border-color .2s,background .2s;
}
.s4-card.lit{
  border-color:rgba(201,162,39,.28);
  background:rgba(201,162,39,.05);
}
.s4-icon{font-size:26px;margin-bottom:10px}
.s4-name{font-family:'Syne',sans-serif;font-weight:700;font-size:13px;color:#F0EBD8;margin-bottom:4px}
.s4-desc{font-size:11px;color:rgba(240,235,216,.4);line-height:1.5;margin-bottom:8px}
.s4-status{font-size:10px;font-family:'IBM Plex Mono',monospace;color:#C9A227}
.s4-soon{font-size:10px;font-family:'IBM Plex Mono',monospace;color:rgba(240,235,216,.25)}

/* ── S5 — CREDENTIAL ── */
.s5{justify-content:center;align-items:center;flex-direction:row;gap:52px;flex-wrap:wrap}
.s5-badge{position:relative;width:170px;height:170px;flex-shrink:0}
@keyframes rotateBorder{to{transform:rotate(360deg)}}
@keyframes glow{0%,100%{opacity:.7;transform:scale(1)}50%{opacity:1;transform:scale(1.05)}}
.s5-badge-ring{
  position:absolute;inset:-3px;border-radius:50%;
  background:conic-gradient(#C9A227 0%,#E8C84A 25%,rgba(201,162,39,.1) 50%,#C9A227 75%,#E8C84A 100%);
  animation:rotateBorder 5s linear infinite;
}
.s5-badge-bg{position:absolute;inset:0;border-radius:50%;background:#050A14}
.s5-badge-inner{
  position:absolute;inset:0;border-radius:50%;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;
  animation:glow 3.5s ease-in-out infinite;
  z-index:1;
}
.s5-badge-label{font-family:'Syne',sans-serif;font-weight:800;font-size:10px;color:#C9A227;text-align:center;letter-spacing:.08em;line-height:1.3}
.s5-text{max-width:360px}
.s5-h{font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(22px,3.5vw,40px);line-height:1.1;letter-spacing:-.025em;margin-bottom:12px}
.s5-point{display:flex;align-items:flex-start;gap:12px;margin-bottom:12px}
.s5-dot{width:6px;height:6px;border-radius:50%;background:#C9A227;margin-top:6px;flex-shrink:0}
.s5-point-t{font-size:13px;font-weight:600;color:#F0EBD8;margin-bottom:2px}
.s5-point-d{font-size:12px;color:rgba(240,235,216,.45);line-height:1.5}
.s5-code{
  margin-top:16px;padding:10px 14px;
  background:rgba(201,162,39,.05);border:1px solid rgba(201,162,39,.15);
  border-radius:10px;
  font-family:'IBM Plex Mono',monospace;font-size:11px;color:#C9A227;line-height:1.7;
}

/* ── S6 — HACKATHON ── */
.s6{justify-content:center;align-items:center;text-align:center}
.s6-tracks{display:flex;flex-direction:column;gap:12px;width:100%;max-width:540px;margin-top:24px;text-align:left}
.s6-track{
  display:flex;align-items:center;gap:16px;
  padding:18px 20px;
  border-radius:16px;
}
.s6-track.main{
  background:rgba(201,162,39,.06);
  border:1px solid rgba(201,162,39,.25);
}
.s6-track.sec{
  background:rgba(240,235,216,.02);
  border:1px solid rgba(240,235,216,.08);
}
.s6-icon{font-size:28px;flex-shrink:0}
.s6-info{flex:1}
.s6-track-name{font-family:'Syne',sans-serif;font-weight:700;font-size:15px;color:#F0EBD8;margin-bottom:3px}
.s6-track-desc{font-size:12px;color:rgba(240,235,216,.45)}
.s6-prize{font-family:'Syne',sans-serif;font-weight:800;font-size:18px;color:#C9A227;flex-shrink:0}
.s6-total{
  display:flex;align-items:center;gap:20px;
  margin-top:18px;padding:14px 24px;
  background:rgba(201,162,39,.06);border:1px solid rgba(201,162,39,.15);
  border-radius:14px;
}
.s6-total-n{font-family:'Syne',sans-serif;font-weight:800;font-size:32px;color:#C9A227}
.s6-total-l{font-size:12px;color:rgba(240,235,216,.45)}

/* ── S7 — CTA ── */
.s7{justify-content:center;align-items:center;text-align:center}
.s7-url{
  font-family:'Syne',sans-serif;font-weight:800;
  font-size:clamp(26px,5.5vw,64px);
  letter-spacing:-.03em;
  color:#C9A227;
  margin-bottom:6px;
}
.s7-url-note{font-size:13px;color:rgba(240,235,216,.35);margin-bottom:28px;font-family:'IBM Plex Mono',monospace}
.s7-btns{display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-bottom:24px}
.btn{
  display:inline-flex;align-items:center;gap:8px;
  padding:12px 24px;border-radius:12px;
  font-family:'Syne',sans-serif;font-size:14px;font-weight:700;
  text-decoration:none;transition:all .18s;border:none;cursor:pointer;
}
.btn-g{background:linear-gradient(135deg,#C9A227,#E8C84A);color:#050A14}
.btn-g:hover{transform:translateY(-2px);box-shadow:0 10px 30px rgba(201,162,39,.3)}
.btn-o{background:transparent;border:1px solid rgba(201,162,39,.3);color:#C9A227}
.btn-o:hover{background:rgba(201,162,39,.08)}
.s7-meta{font-size:12px;color:rgba(240,235,216,.25);font-family:'IBM Plex Mono',monospace;line-height:1.8}

/* responsive */
@media(max-width:680px){
  .s3{flex-direction:column;gap:20px}
  .s3-text{flex:unset;max-width:100%;width:100%}
  .s5{flex-direction:column;gap:24px}
  .s5-text{max-width:100%;width:100%}
  .s2-flow{flex-direction:column;align-items:center}
  .s2-arrow{display:none}
  .s4-grid{grid-template-columns:repeat(2,1fr)}
  .s{padding:0 18px}
  .s0-h{font-size:38px}
  .s7-url{font-size:28px}
}
</style>
</head>
<body>

<canvas id="cvs"></canvas>
<div class="prog" id="prog" style="width:0%"></div>
<div class="deck" id="deck"></div>

<nav class="nav">
  <button class="arr" id="prev" onclick="go(-1)">&#8592;</button>
  <div class="dots" id="dots"></div>
  <button class="arr" id="next" onclick="go(1)">&#8594;</button>
  <span class="snum" id="snum">1/8</span>
</nav>

<script>
/* ─── particles ─── */
const cvs=document.getElementById('cvs'),ctx=cvs.getContext('2d');
let W,H,pts=[],raf=null;
function resize(){W=cvs.width=innerWidth;H=cvs.height=innerHeight}
resize();addEventListener('resize',resize);
for(let i=0;i<70;i++) pts.push({x:Math.random(),y:Math.random(),vx:(Math.random()-.5)*.0002,vy:(Math.random()-.5)*.0002,r:Math.random()*.8+.3,a:Math.random()*.5+.15});
function drawP(){
  ctx.clearRect(0,0,W,H);
  pts.forEach(p=>{
    p.x+=p.vx;p.y+=p.vy;
    if(p.x<0)p.x=1;if(p.x>1)p.x=0;
    if(p.y<0)p.y=1;if(p.y>1)p.y=0;
    ctx.beginPath();ctx.arc(p.x*W,p.y*H,p.r,0,Math.PI*2);
    ctx.fillStyle=\`rgba(201,162,39,\${p.a})\`;ctx.fill();
  });
  pts.forEach((a,i)=>pts.slice(i+1).forEach(b=>{
    const d=Math.hypot((a.x-b.x)*W,(a.y-b.y)*H);
    if(d<130){ctx.beginPath();ctx.moveTo(a.x*W,a.y*H);ctx.lineTo(b.x*W,b.y*H);ctx.strokeStyle=\`rgba(201,162,39,\${.12*(1-d/130)})\`;ctx.lineWidth=.6;ctx.stroke()}
  }));
  raf=requestAnimationFrame(drawP);
}

/* ─── shield svg ─── */
const SH=\`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C9A227" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L4 6v6c0 4.4 3.4 8.5 8 9.5 4.6-1 8-5.1 8-9.5V6l-8-4z"/></svg>\`;
const SH2=\`<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C9A227" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L4 6v6c0 4.4 3.4 8.5 8 9.5 4.6-1 8-5.1 8-9.5V6l-8-4z"/></svg>\`;

/* ─── slide templates ─── */
const SLIDES=[

/* 0 — PORTADA */
\`<div class="s s0" data-slide="0">
  <div class="e1 s0-logo">
    <div class="s0-icon">\${SH}</div>
    <div class="s0-wordmark">FYV<b> Box</b></div>
  </div>
  <h1 class="s0-h e2">Entrena para<br><em>no caer</em><br>en estafas crypto</h1>
  <p class="s0-sub e3">El primer simulador de fraudes Web3 construido sobre Stellar Testnet.<br>Practica. Aprende. Certifícate on-chain.</p>
  <div class="s0-tags e4">
    <span class="tag">Stellar · Soroban</span>
    <span class="tag">Credencial On-Chain</span>
    <span class="tag">Open Source</span>
    <span class="tag">LATAM</span>
  </div>
</div>\`,

/* 1 — PROBLEMA */
\`<div class="s s1" data-slide="1">
  <div>
    <div class="eye e1">El problema</div>
    <div class="s1-num e2">$3.2B</div>
    <p class="s1-label e3">robados en <strong>fraudes crypto en LATAM</strong> durante 2023.<br>Victims que nunca aprendieron a detectar las señales.</p>
    <p class="s1-note e4">"No hay forma de practicar sin perder dinero real."</p>
  </div>
</div>\`,

/* 2 — SOLUCIÓN */
\`<div class="s s2" data-slide="2">
  <div class="eye e1">La solución</div>
  <h2 class="s2-h e2">Practica antes<br>de perder</h2>
  <p class="s2-sub e3">Un entorno seguro donde los errores enseñan, no cuestan.</p>
  <div class="s2-flow e4">
    <div class="s2-step">
      <div class="s2-icon" style="background:rgba(201,162,39,.1);border:1px solid rgba(201,162,39,.25)">🔑</div>
      <div class="s2-step-n">Conecta</div>
      <div class="s2-step-d">Clave pública Stellar como identidad. Sin contraseñas.</div>
    </div>
    <div class="s2-arrow">→</div>
    <div class="s2-step">
      <div class="s2-icon" style="background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2)">🎯</div>
      <div class="s2-step-n">Simula</div>
      <div class="s2-step-d">Phishing, rug pulls y scams reales en entorno controlado.</div>
    </div>
    <div class="s2-arrow">→</div>
    <div class="s2-step">
      <div class="s2-icon" style="background:rgba(201,162,39,.1);border:1px solid rgba(201,162,39,.25)">⭐</div>
      <div class="s2-step-n">Aprende</div>
      <div class="s2-step-d">XP por misión. Dashboard de progreso por track.</div>
    </div>
    <div class="s2-arrow">→</div>
    <div class="s2-step">
      <div class="s2-icon" style="background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.22)">🏆</div>
      <div class="s2-step-n" style="color:#4ade80">Certifícate</div>
      <div class="s2-step-d">NFT Soroban on-chain verificable por cualquiera.</div>
    </div>
  </div>
</div>\`,

/* 3 — PRODUCTO */
\`<div class="s s3" data-slide="3" style="padding-top:48px;padding-bottom:80px">
  <div class="s3-text e1">
    <div class="eye">El producto</div>
    <div class="s3-h">Un dashboard real,<br>misiones reales</div>
    <div class="s3-feat">
      <div class="s3-feat-dot"></div>
      <span class="s3-feat-text">Misiones interactivas por track: toma decisiones como en el mundo real</span>
    </div>
    <div class="s3-feat">
      <div class="s3-feat-dot"></div>
      <span class="s3-feat-text">Retroalimentación inmediata con explicación del fraude</span>
    </div>
    <div class="s3-feat">
      <div class="s3-feat-dot"></div>
      <span class="s3-feat-text">Progreso guardado por clave pública en Supabase</span>
    </div>
    <div class="s3-feat">
      <div class="s3-feat-dot"></div>
      <span class="s3-feat-text">API pública para verificar graduación on-chain</span>
    </div>
  </div>
  <div class="mockup e2">
    <div class="mk-topbar">
      <div class="mk-dot" style="background:#ef4444"></div>
      <div class="mk-dot" style="background:#f59e0b"></div>
      <div class="mk-dot" style="background:#22c55e"></div>
      <div class="mk-url">fyv-box.vercel.app/dashboard</div>
    </div>
    <div class="mk-body">
      <div class="mk-nav">
        <div class="mk-logo">
          <div class="mk-logo-icon">\${SH}</div>
          <div class="mk-logo-text">FYV<b> Box</b></div>
        </div>
        <div class="mk-xp">⭐ 420 XP</div>
      </div>
      <div class="mk-card">
        <div class="mk-card-head">
          <div class="mk-card-title">Tu progreso</div>
          <span style="font-size:10px;color:rgba(240,235,216,.35)">3 tracks activos</span>
        </div>
        <div class="mk-prog-label"><span>Phishing</span><span>4/4 ✓</span></div>
        <div class="mk-prog-bar"><div class="mk-prog-fill" style="width:100%;background:linear-gradient(90deg,#16a34a,#22c55e)"></div></div>
        <div class="mk-prog-label"><span>Fake Assets</span><span>3/4</span></div>
        <div class="mk-prog-bar"><div class="mk-prog-fill" style="width:75%"></div></div>
        <div class="mk-prog-label"><span>Social Eng.</span><span>2/4</span></div>
        <div class="mk-prog-bar"><div class="mk-prog-fill" style="width:50%"></div></div>
      </div>
      <div class="mk-mission">
        <span class="mk-mission-tag">🎣 PHISHING · ACTIVA</span>
        <div class="mk-mission-title">stellar-airdrop.io te pide tu seed phrase</div>
        <div class="mk-mission-sub">¿Es legítimo? Analiza 3 señales de alerta — +80 XP</div>
      </div>
    </div>
  </div>
</div>\`,

/* 4 — TRACKS */
\`<div class="s s4" data-slide="4">
  <div class="eye e1">Tracks de entrenamiento</div>
  <h2 class="e2" style="font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(26px,4.5vw,52px);letter-spacing:-.03em;line-height:1.05">6 tipos de fraude.<br><span style="color:#C9A227">Los más comunes en crypto.</span></h2>
  <div class="s4-grid e3">
    <div class="s4-card lit">
      <div class="s4-icon">🎣</div>
      <div class="s4-name">Phishing</div>
      <div class="s4-desc">Sitios falsos, emails y links trampa</div>
      <div class="s4-status">● Activo</div>
    </div>
    <div class="s4-card lit">
      <div class="s4-icon">💎</div>
      <div class="s4-name">Fake Assets</div>
      <div class="s4-desc">Tokens clonados y contratos trampa</div>
      <div class="s4-status">● Activo</div>
    </div>
    <div class="s4-card lit">
      <div class="s4-icon">🤝</div>
      <div class="s4-name">Social Eng.</div>
      <div class="s4-desc">Manipulación y urgencia artificial</div>
      <div class="s4-status">● Activo</div>
    </div>
    <div class="s4-card">
      <div class="s4-icon" style="opacity:.45">⚠️</div>
      <div class="s4-name" style="color:rgba(240,235,216,.4)">Approvals</div>
      <div class="s4-desc">Permisos peligrosos de wallet</div>
      <div class="s4-soon">○ Próximamente</div>
    </div>
    <div class="s4-card">
      <div class="s4-icon" style="opacity:.45">🚀</div>
      <div class="s4-name" style="color:rgba(240,235,216,.4)">Presale Scam</div>
      <div class="s4-desc">Rug pulls y preventas fraudulentas</div>
      <div class="s4-soon">○ Próximamente</div>
    </div>
    <div class="s4-card">
      <div class="s4-icon" style="opacity:.45">🔑</div>
      <div class="s4-name" style="color:rgba(240,235,216,.4)">Key Hygiene</div>
      <div class="s4-desc">Exposición accidental de claves</div>
      <div class="s4-soon">○ Próximamente</div>
    </div>
  </div>
</div>\`,

/* 5 — CREDENCIAL */
\`<div class="s s5" data-slide="5" style="padding-top:40px;padding-bottom:80px">
  <div class="s5-badge e1">
    <div class="s5-badge-ring"></div>
    <div class="s5-badge-bg"></div>
    <div class="s5-badge-inner">
      \${SH2}
      <div class="s5-badge-label">SCAM<br>RESISTANT</div>
      <div style="font-family:'IBM Plex Mono',monospace;font-size:8px;color:rgba(201,162,39,.5);margin-top:3px">Soroban NFT</div>
    </div>
  </div>
  <div class="s5-text">
    <div class="eye e2" style="margin-bottom:10px">Credencial On-Chain</div>
    <h2 class="s5-h e3">Un NFT que demuestra<br>competencia real</h2>
    <div class="e4">
      <div class="s5-point">
        <div class="s5-dot"></div>
        <div><div class="s5-point-t">Verificable públicamente</div><div class="s5-point-d">Cualquiera puede consultar el estado de graduación de cualquier dirección.</div></div>
      </div>
      <div class="s5-point">
        <div class="s5-dot"></div>
        <div><div class="s5-point-t">Registrado en Soroban</div><div class="s5-point-d">ReadinessRegistry — contrato permanente en Stellar Testnet.</div></div>
      </div>
      <div class="s5-point">
        <div class="s5-dot"></div>
        <div><div class="s5-point-t">Sin costo para el usuario</div><div class="s5-point-d">Friendbot cubre todas las fees. Zero barreras.</div></div>
      </div>
    </div>
    <div class="s5-code e5">GET /api/verify?address=GABC...<br><span style="color:rgba(240,235,216,.4)">→ </span>{ "graduated": true, "xp": 820 }</div>
  </div>
</div>\`,

/* 6 — HACKATHON */
\`<div class="s s6" data-slide="6">
  <div class="eye e1">CriptoUNAM × Semana DIE 2026</div>
  <h2 class="e2" style="font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(26px,4.5vw,52px);letter-spacing:-.03em;line-height:1.05">Postulando a<br><span style="color:#C9A227">2 tracks</span></h2>
  <div class="s6-tracks e3">
    <div class="s6-track main">
      <div class="s6-icon">🔗</div>
      <div class="s6-info">
        <div class="s6-track-name">Blockchain → <span style="color:#C9A227">Stellar</span></div>
        <div class="s6-track-desc">SDK v13 · Horizon API · Soroban ReadinessRegistry — integración nativa desde el primer commit</div>
      </div>
      <div class="s6-prize">$530</div>
    </div>
    <div class="s6-track sec">
      <div class="s6-icon">📚</div>
      <div class="s6-info">
        <div class="s6-track-name">Contenido → <span style="color:#C9A227">Tangem</span></div>
        <div class="s6-track-desc">Plataforma educativa en español para comunidad UNAM/LATAM con certificación on-chain</div>
      </div>
      <div class="s6-prize" style="font-size:14px">hasta<br>$85</div>
    </div>
  </div>
  <div class="s6-total e4">
    <div><div class="s6-total-n">$615</div><div class="s6-total-l">premio potencial total</div></div>
    <div style="width:1px;height:36px;background:rgba(201,162,39,.15)"></div>
    <div><div class="s6-total-n" style="font-size:22px;color:#F0EBD8">100%</div><div class="s6-total-l">open source</div></div>
    <div style="width:1px;height:36px;background:rgba(201,162,39,.15)"></div>
    <div><div class="s6-total-n" style="font-size:22px;color:#4ade80">0</div><div class="s6-total-l">fondos custodiados</div></div>
  </div>
</div>\`,

/* 7 — CTA */
\`<div class="s s7" data-slide="7">
  <div class="e1" style="margin-bottom:6px">
    <div class="s0-logo" style="justify-content:center;margin-bottom:20px">
      <div class="s0-icon">\${SH}</div>
      <div class="s0-wordmark">FYV<b> Box</b></div>
    </div>
  </div>
  <div class="s7-url e2">fyv-box.vercel.app</div>
  <div class="s7-url-note e3">Demo en vivo · Stellar Testnet</div>
  <div class="s7-btns e4">
    <a class="btn btn-g" href="https://fyv-box.vercel.app" target="_blank">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
      Abrir Demo
    </a>
    <a class="btn btn-o" href="https://github.com/ALFA117/fyv-box" target="_blank">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/></svg>
      Ver Código
    </a>
  </div>
  <div class="s7-meta e5">
    Axel Rodríguez Frías &nbsp;·&nbsp; ALFA117 &nbsp;·&nbsp; CriptoUNAM × Semana DIE 2026<br>
    github.com/ALFA117/fyv-box
  </div>
</div>\`,

];

/* ─── engine ─── */
let cur=0;
const deck=document.getElementById('deck');
const dotsEl=document.getElementById('dots');
const snumEl=document.getElementById('snum');
const prog=document.getElementById('prog');

function build(){
  deck.innerHTML='';dotsEl.innerHTML='';
  SLIDES.forEach((html,i)=>{
    const wrap=document.createElement('div');
    wrap.innerHTML=html.trim();
    const el=wrap.firstElementChild;
    if(i===0) el.classList.add('on');
    deck.appendChild(el);
    const d=document.createElement('div');
    d.className='dot'+(i===0?' on':'');
    d.onclick=()=>goTo(i);
    dotsEl.appendChild(d);
  });
  sync();
  drawP();
}

function els(){return deck.querySelectorAll('[data-slide]')}

function goTo(n){
  const ss=els();
  if(n<0||n>=ss.length||n===cur) return;
  const going = n > cur ? 'right' : 'left';
  ss[cur].classList.remove('on');
  ss[cur].classList.add(going==='right'?'left':''); // exit direction
  // cleanup after transition
  const old=ss[cur];
  setTimeout(()=>old.classList.remove('left'),500);
  cur=n;
  ss[cur].classList.add('on');
  // particles only slide 0
  if(cur===0){ if(!raf) drawP(); }
  else{ cancelAnimationFrame(raf);raf=null;ctx.clearRect(0,0,W,H); }
  sync();
}

function sync(){
  const ss=els();
  dotsEl.querySelectorAll('.dot').forEach((d,i)=>d.classList.toggle('on',i===cur));
  snumEl.textContent=(cur+1)+'/'+ss.length;
  document.getElementById('prev').disabled=cur===0;
  document.getElementById('next').disabled=cur===ss.length-1;
  prog.style.width=((cur/(ss.length-1))*100)+'%';
}

function go(d){goTo(cur+d)}

document.addEventListener('keydown',e=>{
  if(e.key==='ArrowRight'||e.key==='ArrowDown'||e.key===' ') go(1);
  if(e.key==='ArrowLeft'||e.key==='ArrowUp') go(-1);
});

let tx=0;
document.addEventListener('touchstart',e=>{tx=e.touches[0].clientX},{passive:true});
document.addEventListener('touchend',e=>{
  const dx=e.changedTouches[0].clientX-tx;
  if(Math.abs(dx)>50) go(dx<0?1:-1);
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
