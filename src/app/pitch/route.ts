import { NextResponse } from "next/server";

const HTML = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"/>
<title>FYV Box — Pitch</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"/>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;overflow:hidden;background:#03060E;color:#EEEADF;font-family:'Inter',sans-serif;-webkit-tap-highlight-color:transparent}

/* ── canvas bg ── */
#cvs{position:fixed;inset:0;z-index:0;pointer-events:none;opacity:0;transition:opacity 1.2s}
#cvs.show{opacity:1}

/* ── top chrome ── */
.chrome{
  position:fixed;top:0;left:0;right:0;
  z-index:50;
  display:flex;align-items:center;justify-content:space-between;
  padding:20px 40px;
  pointer-events:none;
}
.chrome-logo{
  display:flex;align-items:center;gap:10px;
  opacity:0;transform:translateY(-6px);
  transition:opacity .5s .1s, transform .5s .1s;
}
.chrome-logo.in{opacity:1;transform:none}
.chrome-icon{
  width:32px;height:32px;border-radius:9px;
  background:rgba(201,162,39,.12);border:1px solid rgba(201,162,39,.3);
  display:flex;align-items:center;justify-content:center;
}
.chrome-name{font-family:'Syne',sans-serif;font-weight:800;font-size:15px;letter-spacing:-.02em;color:#EEEADF}
.chrome-name b{color:#C9A227}
.chrome-num{
  font-family:'IBM Plex Mono',monospace;font-size:11px;
  color:rgba(238,234,223,.3);letter-spacing:.08em;
  opacity:0;transition:opacity .4s .2s;
}
.chrome-num.in{opacity:1}

/* ── progress bar ── */
.pbar{position:fixed;top:0;left:0;height:2px;background:linear-gradient(90deg,#C9A227,#E8C840);z-index:100;transition:width .5s cubic-bezier(.22,1,.36,1)}

/* ── deck ── */
.deck{position:fixed;inset:0;z-index:10}
.s{
  position:absolute;inset:0;
  display:flex;
  padding:62px 48px 68px;
  opacity:0;transform:translateX(56px);
  pointer-events:none;
  transition:opacity .48s cubic-bezier(.16,1,.3,1), transform .48s cubic-bezier(.16,1,.3,1);
  will-change:opacity,transform;
}
.s.on{opacity:1;transform:translateX(0);pointer-events:auto}
.s.out{opacity:0;transform:translateX(-56px)}

/* element entrance */
.s.on .e1{animation:up .5s .05s both cubic-bezier(.22,1,.36,1)}
.s.on .e2{animation:up .5s .13s both cubic-bezier(.22,1,.36,1)}
.s.on .e3{animation:up .5s .21s both cubic-bezier(.22,1,.36,1)}
.s.on .e4{animation:up .5s .29s both cubic-bezier(.22,1,.36,1)}
.s.on .e5{animation:up .5s .37s both cubic-bezier(.22,1,.36,1)}
@keyframes up{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}

/* ── nav ── */
.nav{
  position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
  z-index:100;
  display:flex;align-items:center;gap:12px;
  padding:8px 18px;
  background:rgba(3,6,14,.8);
  border:1px solid rgba(201,162,39,.2);
  border-radius:99px;backdrop-filter:blur(20px);
}
.dots{display:flex;gap:5px;align-items:center}
.dot{width:5px;height:5px;border-radius:50%;background:rgba(201,162,39,.2);cursor:pointer;transition:all .3s}
.dot.on{width:20px;border-radius:99px;background:#C9A227}
.arr{background:none;border:none;color:rgba(201,162,39,.35);cursor:pointer;font-size:15px;line-height:1;padding:0 3px;transition:color .15s;display:flex}
.arr:hover{color:#C9A227}
.arr:disabled{opacity:.15;pointer-events:none}
.snum{font-family:'IBM Plex Mono',monospace;font-size:10px;color:rgba(201,162,39,.35);min-width:28px;text-align:center}

/* ── tokens ── */
.eye{font-family:'Syne',sans-serif;font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#C9A227}
.tag{display:inline-flex;align-items:center;gap:5px;padding:5px 13px;border:1px solid rgba(201,162,39,.28);border-radius:99px;font-size:12px;color:#C9A227;font-family:'IBM Plex Mono',monospace;background:rgba(201,162,39,.07)}
.chip{display:inline-flex;align-items:center;padding:5px 13px;border:1px solid rgba(238,234,223,.1);border-radius:99px;font-size:12px;color:rgba(238,234,223,.45);background:rgba(238,234,223,.03)}

/* ── line accent ── */
.line{height:1px;background:linear-gradient(90deg,#C9A227,transparent);width:48px;margin-bottom:14px}

/* ── SLIDE 0 — HERO ── */
.s0{flex-direction:row;align-items:center;gap:0}
.s0-left{flex:0 0 52%;display:flex;flex-direction:column;justify-content:center;padding-right:32px}
.s0-h{
  font-family:'Syne',sans-serif;font-weight:800;
  font-size:clamp(22px,3vw,46px);
  line-height:1.08;letter-spacing:-.03em;
  color:#EEEADF;margin:10px 0 14px;
}
.s0-h em{font-style:normal;color:#C9A227}
.s0-sub{font-size:clamp(12px,1.2vw,15px);color:rgba(238,234,223,.45);line-height:1.65;margin-bottom:18px;max-width:380px}
.s0-tags{display:flex;gap:7px;flex-wrap:wrap}
/* hero right — shield illustration */
.s0-right{flex:1;display:flex;align-items:center;justify-content:center;position:relative}
.shield-wrap{position:relative;width:min(42vw,340px);height:min(42vw,340px)}
@keyframes shieldPulse{0%,100%{opacity:.9;filter:drop-shadow(0 0 24px rgba(201,162,39,.5))}50%{opacity:1;filter:drop-shadow(0 0 48px rgba(201,162,39,.85))}}
@keyframes shieldFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
.shield-svg{animation:shieldFloat 4s ease-in-out infinite;width:100%;height:100%}
.shield-glow{position:absolute;inset:-20%;border-radius:50%;background:radial-gradient(ellipse at center,rgba(201,162,39,.12) 0%,transparent 70%);pointer-events:none}

/* ── SLIDE 1 — PROBLEM ── */
.s1{align-items:center;flex-direction:column;justify-content:center;text-align:center}
.s1-num{
  font-family:'Syne',sans-serif;font-weight:800;
  font-size:clamp(60px,11vw,140px);
  line-height:.88;letter-spacing:-.06em;
  background:linear-gradient(135deg,#ef4444 0%,#f97316 50%,#fbbf24 100%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
}
.s1-label{font-size:clamp(13px,1.5vw,18px);color:rgba(238,234,223,.55);max-width:480px;line-height:1.55;margin:12px auto 16px}
.s1-label strong{color:#EEEADF}
.s1-kicker{font-family:'Syne',sans-serif;font-weight:700;font-size:clamp(13px,1.6vw,20px);color:rgba(238,234,223,.7)}

/* ── SLIDE 2 — SOLUTION ── */
.s2{align-items:center;flex-direction:column;justify-content:center;text-align:center;gap:18px}
.s2-h{font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(20px,3vw,38px);letter-spacing:-.03em;line-height:1.1}
.s2-flow{display:flex;align-items:flex-start;gap:0;width:100%;max-width:800px}
.s2-step{flex:1;display:flex;flex-direction:column;align-items:center;text-align:center;padding:0 10px}
.s2-icon{width:46px;height:46px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;margin:0 auto 10px}
.s2-sname{font-family:'Syne',sans-serif;font-weight:700;font-size:14px;margin-bottom:5px}
.s2-sdesc{font-size:12px;color:rgba(238,234,223,.4);line-height:1.55}
.s2-arr{display:flex;align-items:center;justify-content:center;padding-top:16px;color:rgba(201,162,39,.25);font-size:22px;flex-shrink:0}

/* ── SLIDE 3 — PRODUCT ── */
.s3{flex-direction:row;align-items:center;gap:40px}
.s3-left{flex:0 0 240px;display:flex;flex-direction:column;gap:0}
.s3-left .eye{margin-bottom:10px}
.s3-h{font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(18px,2.2vw,28px);letter-spacing:-.02em;line-height:1.2;margin-bottom:14px}
.s3-feat{display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-top:1px solid rgba(238,234,223,.06)}
.s3-feat:last-child{border-bottom:1px solid rgba(238,234,223,.06)}
.s3-dot{width:5px;height:5px;border-radius:50%;background:#C9A227;margin-top:6px;flex-shrink:0}
.s3-txt{font-size:12.5px;color:rgba(238,234,223,.6);line-height:1.6}
/* mockup */
.mockup{
  flex:1;min-width:0;max-width:460px;
  background:linear-gradient(150deg,#0A1828,#050D1A);
  border:1px solid rgba(201,162,39,.15);
  border-radius:20px;overflow:hidden;
  box-shadow:0 40px 100px rgba(0,0,0,.7),0 0 80px rgba(201,162,39,.05);
}
.mk-bar{display:flex;align-items:center;gap:6px;padding:11px 14px;background:rgba(0,0,0,.25);border-bottom:1px solid rgba(255,255,255,.04)}
.mk-d{width:9px;height:9px;border-radius:50%}
.mk-url{flex:1;text-align:center;font-family:'IBM Plex Mono',monospace;font-size:9.5px;color:rgba(238,234,223,.25);background:rgba(255,255,255,.03);border-radius:4px;padding:3px 8px;margin:0 8px}
.mk-body{padding:14px 16px}
.mk-nav{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,.04)}
.mk-logo{display:flex;align-items:center;gap:6px}
.mk-li{width:20px;height:20px;background:rgba(201,162,39,.12);border:1px solid rgba(201,162,39,.28);border-radius:5px;display:flex;align-items:center;justify-content:center}
.mk-lt{font-family:'Syne',sans-serif;font-weight:800;font-size:12px}
.mk-lt b{color:#C9A227}
.mk-xp{display:flex;align-items:center;gap:4px;background:rgba(201,162,39,.07);border:1px solid rgba(201,162,39,.18);border-radius:99px;padding:3px 10px;font-family:'Syne',sans-serif;font-size:10px;font-weight:700;color:#C9A227}
.mk-prog-head{display:flex;justify-content:space-between;font-size:9.5px;color:rgba(238,234,223,.35);margin-bottom:4px}
.mk-prog-t{height:4px;background:rgba(255,255,255,.06);border-radius:99px;overflow:hidden;margin-bottom:8px}
.mk-prog-f{height:100%;border-radius:99px}
.mk-card{background:rgba(238,234,223,.02);border:1px solid rgba(238,234,223,.06);border-radius:12px;padding:12px;margin-top:10px}
.mk-card-tt{font-family:'Syne',sans-serif;font-weight:700;font-size:11px;margin-bottom:8px;color:#EEEADF}
.mk-mission{background:rgba(239,68,68,.06);border:1px solid rgba(239,68,68,.14);border-radius:10px;padding:10px}
.mk-m-tag{font-size:9px;font-family:'IBM Plex Mono',monospace;color:#f87171;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.18);border-radius:99px;padding:2px 7px;display:inline-block;margin-bottom:5px}
.mk-m-t{font-size:11px;font-weight:600;color:#EEEADF;margin-bottom:2px}
.mk-m-d{font-size:10px;color:rgba(238,234,223,.35)}

/* ── SLIDE 4 — TRACKS ── */
.s4{flex-direction:column;align-items:center;justify-content:center;gap:14px;text-align:center}
.s4-h{font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(19px,2.8vw,36px);letter-spacing:-.025em;line-height:1.1}
.s4-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;width:100%;max-width:680px}
.tc{padding:18px 16px;border-radius:16px;border:1px solid rgba(238,234,223,.06);background:rgba(238,234,223,.02);text-align:left;transition:all .2s}
.tc.lit{border-color:rgba(201,162,39,.28);background:rgba(201,162,39,.05)}
.tc-icon{font-size:26px;margin-bottom:10px}
.tc-name{font-family:'Syne',sans-serif;font-weight:700;font-size:13px;color:#EEEADF;margin-bottom:4px}
.tc-desc{font-size:11px;color:rgba(238,234,223,.38);line-height:1.5;margin-bottom:8px}
.tc-s{font-size:10px;font-family:'IBM Plex Mono',monospace;color:#C9A227}
.tc-ns{font-size:10px;font-family:'IBM Plex Mono',monospace;color:rgba(238,234,223,.2)}

/* ── SLIDE 5 — CREDENTIAL ── */
.s5{flex-direction:row;align-items:center;gap:56px}
.s5-badge-wrap{flex-shrink:0;position:relative;width:min(36vw,220px);height:min(36vw,220px)}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes bpulse{0%,100%{transform:scale(1);opacity:.85}50%{transform:scale(1.05);opacity:1}}
.s5-ring{position:absolute;inset:-3px;border-radius:50%;background:conic-gradient(#C9A227 0%,#E8C840 20%,rgba(201,162,39,.08) 50%,#E8C840 80%,#C9A227 100%);animation:spin 6s linear infinite}
.s5-bg{position:absolute;inset:0;border-radius:50%;background:#03060E}
.s5-inner{position:absolute;inset:0;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;z-index:1;animation:bpulse 3.5s ease-in-out infinite}
.s5-label{font-family:'Syne',sans-serif;font-weight:800;font-size:10px;color:#C9A227;text-align:center;letter-spacing:.1em;line-height:1.4}
.s5-right{display:flex;flex-direction:column;max-width:380px}
.s5-h{font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(18px,2.2vw,32px);letter-spacing:-.025em;line-height:1.15;margin:8px 0 14px}
.s5-pt{display:flex;align-items:flex-start;gap:12px;margin-bottom:14px}
.s5-pd{width:5px;height:5px;border-radius:50%;background:#C9A227;margin-top:7px;flex-shrink:0}
.s5-tt{font-size:13px;font-weight:600;color:#EEEADF;margin-bottom:2px}
.s5-dd{font-size:12px;color:rgba(238,234,223,.42);line-height:1.55}
.s5-code{margin-top:6px;padding:12px 14px;background:rgba(201,162,39,.05);border:1px solid rgba(201,162,39,.14);border-radius:10px;font-family:'IBM Plex Mono',monospace;font-size:11px;color:#C9A227;line-height:1.8}
.s5-code span{color:rgba(238,234,223,.3)}

/* ── SLIDE 6 — HACKATHON ── */
.s6{flex-direction:column;align-items:center;justify-content:center;gap:14px;text-align:center}
.s6-h{font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(19px,2.8vw,36px);letter-spacing:-.025em;line-height:1.1}
.s6-tracks{display:flex;flex-direction:column;gap:10px;width:100%;max-width:580px;text-align:left}
.s6t{display:flex;align-items:center;gap:16px;padding:18px 22px;border-radius:16px}
.s6t.p{background:rgba(201,162,39,.06);border:1px solid rgba(201,162,39,.25)}
.s6t.s{background:rgba(238,234,223,.02);border:1px solid rgba(238,234,223,.07)}
.s6t-icon{font-size:28px;flex-shrink:0}
.s6t-info{flex:1}
.s6t-name{font-family:'Syne',sans-serif;font-weight:700;font-size:15px;margin-bottom:3px}
.s6t-desc{font-size:12px;color:rgba(238,234,223,.42)}
.s6t-prize{font-family:'Syne',sans-serif;font-weight:800;font-size:22px;color:#C9A227;white-space:nowrap}
.s6-total{display:flex;align-items:center;gap:24px;padding:14px 24px;background:rgba(201,162,39,.05);border:1px solid rgba(201,162,39,.14);border-radius:14px}
.s6-tn{font-family:'Syne',sans-serif;font-weight:800;font-size:30px;color:#C9A227}
.s6-tl{font-size:11px;color:rgba(238,234,223,.4)}
.s6-sep{width:1px;height:32px;background:rgba(201,162,39,.12)}

/* ── SLIDE 7 — CTA ── */
.s7{flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:0}
.s7-url{font-family:'Syne',sans-serif;font-weight:800;font-size:clamp(22px,4vw,52px);letter-spacing:-.03em;color:#C9A227;line-height:1;margin:10px 0 4px}
.s7-note{font-family:'IBM Plex Mono',monospace;font-size:12px;color:rgba(238,234,223,.28);margin-bottom:28px}
.s7-btns{display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-bottom:28px}
.btn{display:inline-flex;align-items:center;gap:8px;padding:12px 26px;border-radius:12px;font-family:'Syne',sans-serif;font-size:14px;font-weight:700;text-decoration:none;transition:all .18s;border:none;cursor:pointer}
.btn-g{background:linear-gradient(135deg,#C9A227,#E8C840);color:#03060E}
.btn-g:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(201,162,39,.3)}
.btn-o{background:transparent;border:1px solid rgba(201,162,39,.28);color:#C9A227}
.btn-o:hover{background:rgba(201,162,39,.07)}
.s7-meta{font-size:12px;color:rgba(238,234,223,.22);font-family:'IBM Plex Mono',monospace;line-height:1.9}
.s7-chips{display:flex;gap:7px;flex-wrap:wrap;justify-content:center;margin-bottom:20px}

/* responsive */
@media(max-width:700px){
  .s0,.s3,.s5{flex-direction:column;gap:24px}
  .s0-left,.s3-left,.s5-right{max-width:100%;width:100%}
  .s0-right,.s5-badge-wrap{width:160px;height:160px}
  .s2-flow{flex-direction:column;align-items:center}
  .s2-arr{display:none}
  .s4-grid{grid-template-columns:repeat(2,1fr)}
  .s{padding:64px 18px 72px}
  .chrome{padding:14px 18px}
}
</style>
</head>
<body>

<canvas id="cvs"></canvas>
<div class="pbar" id="pbar" style="width:0%"></div>

<div class="chrome">
  <div class="chrome-logo" id="clogo">
    <div class="chrome-icon">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A227" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L4 6v6c0 4.4 3.4 8.5 8 9.5 4.6-1 8-5.1 8-9.5V6l-8-4z"/></svg>
    </div>
    <span class="chrome-name">FYV<b> Box</b></span>
  </div>
  <span class="chrome-num" id="cnum">1 / 8</span>
</div>

<div class="deck" id="deck"></div>

<nav class="nav">
  <button class="arr" id="prev" onclick="go(-1)">&#8592;</button>
  <div class="dots" id="dots"></div>
  <button class="arr" id="next" onclick="go(1)">&#8594;</button>
  <span class="snum" id="snum">1/8</span>
</nav>

<script>
/* ── particles ── */
const cvs=document.getElementById('cvs'),ctx=cvs.getContext('2d');
let W,H,pts=[],raf=null;
function resize(){W=cvs.width=innerWidth;H=cvs.height=innerHeight}
resize();addEventListener('resize',resize);
for(let i=0;i<65;i++) pts.push({x:Math.random(),y:Math.random(),vx:(Math.random()-.5)*.00018,vy:(Math.random()-.5)*.00018,r:Math.random()*.75+.3,a:Math.random()*.45+.12});
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
    if(d<120){ctx.beginPath();ctx.moveTo(a.x*W,a.y*H);ctx.lineTo(b.x*W,b.y*H);ctx.strokeStyle=\`rgba(201,162,39,\${.11*(1-d/120)})\`;ctx.lineWidth=.6;ctx.stroke()}
  }));
  raf=requestAnimationFrame(drawP);
}

/* ── SVGs ── */
const SH_SM=\`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A227" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L4 6v6c0 4.4 3.4 8.5 8 9.5 4.6-1 8-5.1 8-9.5V6l-8-4z"/></svg>\`;
const SH_LG=\`<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#C9A227" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L4 6v6c0 4.4 3.4 8.5 8 9.5 4.6-1 8-5.1 8-9.5V6l-8-4z"/></svg>\`;

/* ── hero shield SVG ── */
const HERO_SHIELD=\`<svg class="shield-svg" viewBox="0 0 280 320" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="gf" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <linearGradient id="sg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#E8C840"/>
      <stop offset="100%" stop-color="#C9A227"/>
    </linearGradient>
  </defs>
  <!-- outer glow ring -->
  <ellipse cx="140" cy="155" rx="118" ry="132" stroke="rgba(201,162,39,.08)" stroke-width="1" fill="none"/>
  <ellipse cx="140" cy="155" rx="105" ry="118" stroke="rgba(201,162,39,.06)" stroke-width="1" fill="none"/>
  <!-- main shield outer -->
  <path d="M140 18 L28 66 L28 164 Q28 252 140 298 Q252 252 252 164 L252 66 Z"
        fill="rgba(201,162,39,.04)" stroke="url(#sg)" stroke-width="1.5" filter="url(#gf)"/>
  <!-- inner shield -->
  <path d="M140 44 L54 86 L54 162 Q54 234 140 274 Q226 234 226 162 L226 86 Z"
        fill="rgba(201,162,39,.04)" stroke="rgba(201,162,39,.35)" stroke-width="1"/>
  <!-- center icon -->
  <path d="M140 108 L108 124 L108 152 C108 172 122 189 140 195 C158 189 172 172 172 152 L172 124 Z"
        fill="rgba(201,162,39,.08)" stroke="#C9A227" stroke-width="1.5"/>
  <!-- check mark inside shield -->
  <polyline points="124,152 136,164 158,140" stroke="#C9A227" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  <!-- dots accent -->
  <circle cx="100" cy="90" r="2.5" fill="rgba(201,162,39,.4)"/>
  <circle cx="180" cy="90" r="2.5" fill="rgba(201,162,39,.4)"/>
  <circle cx="80" cy="140" r="1.8" fill="rgba(201,162,39,.25)"/>
  <circle cx="200" cy="140" r="1.8" fill="rgba(201,162,39,.25)"/>
  <circle cx="140" cy="240" r="3" fill="rgba(201,162,39,.3)"/>
  <!-- horizontal line accents -->
  <line x1="54" y1="120" x2="90" y2="120" stroke="rgba(201,162,39,.2)" stroke-width="1"/>
  <line x1="190" y1="120" x2="226" y2="120" stroke="rgba(201,162,39,.2)" stroke-width="1"/>
</svg>\`;

/* ── slide HTML ── */
const SLIDES=[

/* 0 — HERO */
\`<div class="s s0">
  <div class="s0-left">
    <div class="eye e1">CriptoUNAM × Semana DIE 2026</div>
    <h1 class="s0-h e2">Entrena para<br><em>no caer</em><br>en estafas<br>crypto</h1>
    <p class="s0-sub e3">El primer simulador de fraudes Web3 que te certifica on-chain, construido sobre Stellar Testnet.</p>
    <div class="s0-tags e4">
      <span class="tag">Stellar · Soroban</span>
      <span class="tag">On-Chain</span>
      <span class="tag">Open Source</span>
      <span class="tag">LATAM</span>
    </div>
  </div>
  <div class="s0-right e5">
    <div class="shield-wrap">
      <div class="shield-glow"></div>
      \${HERO_SHIELD}
    </div>
  </div>
</div>\`,

/* 1 — PROBLEMA */
\`<div class="s s1">
  <div class="eye e1" style="margin-bottom:10px">El problema</div>
  <div class="s1-num e2">$3.2B</div>
  <p class="s1-label e3">robados en <strong>fraudes crypto en LATAM</strong> durante 2023.<br>Víctimas que nunca aprendieron a detectar las señales.</p>
  <p class="s1-kicker e4">"No existe forma de practicar sin perder dinero real."</p>
</div>\`,

/* 2 — SOLUCIÓN */
\`<div class="s s2">
  <div class="eye e1">La solución</div>
  <h2 class="s2-h e2">Simula el fraude.<br><span style="color:#C9A227">Antes de vivirlo.</span></h2>
  <div class="s2-flow e3">
    <div class="s2-step">
      <div class="s2-icon" style="background:rgba(201,162,39,.1);border:1px solid rgba(201,162,39,.25)">🔑</div>
      <div class="s2-sname">Conecta</div>
      <div class="s2-sdesc">Clave pública Stellar como identidad. Sin contraseñas ni fondos reales.</div>
    </div>
    <div class="s2-arr">→</div>
    <div class="s2-step">
      <div class="s2-icon" style="background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2)">🎯</div>
      <div class="s2-sname">Simula</div>
      <div class="s2-sdesc">Phishing, rug pulls y scams reales en entorno 100% controlado.</div>
    </div>
    <div class="s2-arr">→</div>
    <div class="s2-step">
      <div class="s2-icon" style="background:rgba(201,162,39,.1);border:1px solid rgba(201,162,39,.25)">⭐</div>
      <div class="s2-sname">Aprende</div>
      <div class="s2-sdesc">XP, dashboard de progreso y retroalimentación en cada misión.</div>
    </div>
    <div class="s2-arr">→</div>
    <div class="s2-step">
      <div class="s2-icon" style="background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.22)">🏆</div>
      <div class="s2-sname" style="color:#4ade80">Certifícate</div>
      <div class="s2-sdesc">NFT Soroban on-chain verificable por cualquier persona.</div>
    </div>
  </div>
</div>\`,

/* 3 — PRODUCTO */
\`<div class="s s3">
  <div class="s3-left">
    <div class="eye e1">El producto</div>
    <div class="s3-h e2">Un dashboard real,<br>misiones reales</div>
    <div class="e3">
      <div class="s3-feat"><div class="s3-dot"></div><span class="s3-txt">Misiones interactivas — toma decisiones como en el mundo real</span></div>
      <div class="s3-feat"><div class="s3-dot"></div><span class="s3-txt">Retroalimentación inmediata con explicación del fraude</span></div>
      <div class="s3-feat"><div class="s3-dot"></div><span class="s3-txt">Progreso guardado por clave pública en Supabase</span></div>
      <div class="s3-feat"><div class="s3-dot"></div><span class="s3-txt">API pública para verificar graduación on-chain</span></div>
    </div>
  </div>
  <div class="mockup e4">
    <div class="mk-bar">
      <div class="mk-d" style="background:#ef4444"></div>
      <div class="mk-d" style="background:#f59e0b"></div>
      <div class="mk-d" style="background:#22c55e"></div>
      <div class="mk-url">fyv-box.vercel.app/dashboard</div>
    </div>
    <div class="mk-body">
      <div class="mk-nav">
        <div class="mk-logo"><div class="mk-li">\${SH_SM}</div><span class="mk-lt">FYV<b> Box</b></span></div>
        <div class="mk-xp">⭐ 420 XP</div>
      </div>
      <div class="mk-card">
        <div class="mk-card-tt">Tu progreso</div>
        <div class="mk-prog-head"><span>Phishing</span><span style="color:#4ade80">4/4 ✓</span></div>
        <div class="mk-prog-t"><div class="mk-prog-f" style="width:100%;background:linear-gradient(90deg,#16a34a,#22c55e)"></div></div>
        <div class="mk-prog-head"><span>Fake Assets</span><span>3/4</span></div>
        <div class="mk-prog-t"><div class="mk-prog-f" style="width:75%;background:linear-gradient(90deg,#C9A227,#E8C840)"></div></div>
        <div class="mk-prog-head"><span>Social Eng.</span><span>2/4</span></div>
        <div class="mk-prog-t" style="margin-bottom:0"><div class="mk-prog-f" style="width:50%;background:linear-gradient(90deg,#C9A227,#E8C840)"></div></div>
      </div>
      <div class="mk-mission" style="margin-top:10px">
        <span class="mk-m-tag">🎣 PHISHING · ACTIVA</span>
        <div class="mk-m-t">stellar-airdrop.io te pide tu seed phrase</div>
        <div class="mk-m-d">¿Legítimo? Analiza 3 señales de alerta — +80 XP</div>
      </div>
    </div>
  </div>
</div>\`,

/* 4 — TRACKS */
\`<div class="s s4">
  <div class="eye e1">Tracks de entrenamiento</div>
  <h2 class="s4-h e2">6 tipos de fraude.<br><span style="color:#C9A227">Los más comunes en crypto.</span></h2>
  <div class="s4-grid e3">
    <div class="tc lit"><div class="tc-icon">🎣</div><div class="tc-name">Phishing</div><div class="tc-desc">Sitios falsos, emails y links trampa</div><div class="tc-s">● Activo</div></div>
    <div class="tc lit"><div class="tc-icon">💎</div><div class="tc-name">Fake Assets</div><div class="tc-desc">Tokens clonados y contratos trampa</div><div class="tc-s">● Activo</div></div>
    <div class="tc lit"><div class="tc-icon">🤝</div><div class="tc-name">Social Eng.</div><div class="tc-desc">Manipulación y urgencia artificial</div><div class="tc-s">● Activo</div></div>
    <div class="tc"><div class="tc-icon" style="opacity:.4">⚠️</div><div class="tc-name" style="color:rgba(238,234,223,.35)">Approvals</div><div class="tc-desc">Permisos peligrosos de wallet</div><div class="tc-ns">○ Próximamente</div></div>
    <div class="tc"><div class="tc-icon" style="opacity:.4">🚀</div><div class="tc-name" style="color:rgba(238,234,223,.35)">Presale Scam</div><div class="tc-desc">Rug pulls y preventas fraudulentas</div><div class="tc-ns">○ Próximamente</div></div>
    <div class="tc"><div class="tc-icon" style="opacity:.4">🔑</div><div class="tc-name" style="color:rgba(238,234,223,.35)">Key Hygiene</div><div class="tc-desc">Exposición accidental de claves</div><div class="tc-ns">○ Próximamente</div></div>
  </div>
</div>\`,

/* 5 — CREDENCIAL */
\`<div class="s s5">
  <div class="s5-badge-wrap e1">
    <div class="s5-ring"></div>
    <div class="s5-bg"></div>
    <div class="s5-inner">
      \${SH_LG}
      <div class="s5-label">SCAM<br>RESISTANT</div>
      <div style="font-family:'IBM Plex Mono',monospace;font-size:8px;color:rgba(201,162,39,.45);margin-top:2px">Soroban NFT</div>
    </div>
  </div>
  <div class="s5-right">
    <div class="eye e2">Credencial On-Chain</div>
    <h2 class="s5-h e3">Un NFT que prueba<br>competencia real</h2>
    <div class="e4">
      <div class="s5-pt"><div class="s5-pd"></div><div><div class="s5-tt">Verificable públicamente</div><div class="s5-dd">Cualquiera puede consultar el estado de graduación de cualquier dirección Stellar.</div></div></div>
      <div class="s5-pt"><div class="s5-pd"></div><div><div class="s5-tt">Registrado en Soroban</div><div class="s5-dd">ReadinessRegistry — contrato permanente en Stellar Testnet.</div></div></div>
      <div class="s5-pt"><div class="s5-pd"></div><div><div class="s5-tt">Gratis. Zero barreras.</div><div class="s5-dd">Friendbot cubre todas las fees de emisión del NFT.</div></div></div>
    </div>
    <div class="s5-code e5">GET /api/verify?address=GABC…<br><span>→ { "graduated": true, "xp": 820 }</span></div>
  </div>
</div>\`,

/* 6 — HACKATHON */
\`<div class="s s6">
  <div class="eye e1">CriptoUNAM × Semana DIE 2026</div>
  <h2 class="s6-h e2">Postulando a <span style="color:#C9A227">2 tracks</span></h2>
  <div class="s6-tracks e3">
    <div class="s6t p">
      <div class="s6t-icon">🔗</div>
      <div class="s6t-info">
        <div class="s6t-name">Blockchain → <span style="color:#C9A227">Stellar</span></div>
        <div class="s6t-desc">SDK v13 · Horizon API · Soroban ReadinessRegistry — integración nativa desde el día uno</div>
      </div>
      <div class="s6t-prize">$530</div>
    </div>
    <div class="s6t s">
      <div class="s6t-icon">📚</div>
      <div class="s6t-info">
        <div class="s6t-name">Contenido → <span style="color:#C9A227">Tangem</span></div>
        <div class="s6t-desc">Plataforma educativa en español para la comunidad UNAM/LATAM con certificación on-chain</div>
      </div>
      <div class="s6t-prize" style="font-size:15px;line-height:1.3">hasta<br>$85</div>
    </div>
  </div>
  <div class="s6-total e4">
    <div><div class="s6-tn">$615</div><div class="s6-tl">premio potencial total</div></div>
    <div class="s6-sep"></div>
    <div><div class="s6-tn" style="font-size:22px;color:#EEEADF">100%</div><div class="s6-tl">open source</div></div>
    <div class="s6-sep"></div>
    <div><div class="s6-tn" style="font-size:22px;color:#4ade80">0</div><div class="s6-tl">fondos custodiados</div></div>
  </div>
</div>\`,

/* 7 — CTA */
\`<div class="s s7">
  <div class="eye e1">Pruébalo ahora</div>
  <div class="s7-url e2">fyv-box.vercel.app</div>
  <div class="s7-note e3">Demo en vivo · Stellar Testnet · github.com/ALFA117/fyv-box</div>
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
  <div class="s7-chips e5">
    <span class="chip">stellar</span><span class="chip">soroban</span><span class="chip">anti-fraud</span><span class="chip">latam</span><span class="chip">open-source</span>
  </div>
  <div class="s7-meta">Axel Rodríguez Frías &nbsp;·&nbsp; CriptoUNAM × Semana DIE 2026</div>
</div>\`,

];

/* ── engine ── */
let cur=0;
const deck=document.getElementById('deck');
const dotsEl=document.getElementById('dots');
const snumEl=document.getElementById('snum');
const pbar=document.getElementById('pbar');
const cnum=document.getElementById('cnum');
const clogo=document.getElementById('clogo');

function build(){
  deck.innerHTML='';dotsEl.innerHTML='';
  SLIDES.forEach((html,i)=>{
    const tmp=document.createElement('div');
    tmp.innerHTML=html.trim();
    const el=tmp.firstElementChild;
    if(i===0) el.classList.add('on');
    deck.appendChild(el);
    const d=document.createElement('div');
    d.className='dot'+(i===0?' on':'');
    d.onclick=()=>goTo(i);
    dotsEl.appendChild(d);
  });
  clogo.classList.add('in');
  cnum.classList.add('in');
  sync();
  drawP();
  cvs.classList.add('show');
}

function ss(){return deck.querySelectorAll('.s')}

function goTo(n){
  const els=ss();
  if(n<0||n>=els.length||n===cur) return;
  const out=els[cur];
  out.classList.remove('on');
  out.classList.add('out');
  setTimeout(()=>out.classList.remove('out'),520);
  cur=n;
  els[cur].classList.add('on');
  if(cur===0){ if(!raf) drawP(); cvs.classList.add('show'); }
  else{ cancelAnimationFrame(raf);raf=null;ctx.clearRect(0,0,W,H);cvs.classList.remove('show'); }
  sync();
}

function sync(){
  const els=ss();
  dotsEl.querySelectorAll('.dot').forEach((d,i)=>d.classList.toggle('on',i===cur));
  snumEl.textContent=(cur+1)+'/'+els.length;
  cnum.textContent=(cur+1)+' / '+els.length;
  document.getElementById('prev').disabled=cur===0;
  document.getElementById('next').disabled=cur===els.length-1;
  pbar.style.width=(cur/(els.length-1)*100)+'%';
}

function go(d){goTo(cur+d)}

document.addEventListener('keydown',e=>{
  if(['ArrowRight','ArrowDown',' '].includes(e.key)){e.preventDefault();go(1)}
  if(['ArrowLeft','ArrowUp'].includes(e.key)){e.preventDefault();go(-1)}
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
