// ---------- live clock ----------
const clockEl = document.getElementById('clock');
function tick(){
  const fmt = new Intl.DateTimeFormat('en-GB', { timeZone:'Africa/Nairobi', hour:'2-digit', minute:'2-digit' });
  clockEl.textContent = 'Nairobi, KE · ' + fmt.format(new Date());
}
tick(); setInterval(tick, 30000);

// ---------- ticker ----------
const words = ['PYTHON','SCIKIT-LEARN','SCIPY','STATSMODELS','PANDAS','REACT','NODE.JS','POSTGRESQL','AWS SAGEMAKER','GLUE','S3','RLHF','GIT'];
const track = document.getElementById('ticker');
const build = () => words.map((w,i)=>`<span class="${i%3===0?'hi':''}">${w}</span><span>✦</span>`).join('');
track.innerHTML = build() + build();

// ---------- tabs ----------
const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.skill-panel');
function animateBars(panel){
  panel.querySelectorAll('.skill-fill').forEach(f=>{
    f.style.width = '0%';
    requestAnimationFrame(()=> requestAnimationFrame(()=>{ f.style.width = f.dataset.pct + '%'; }));
  });
}
tabs.forEach(tab=>{
  tab.addEventListener('click', ()=>{
    tabs.forEach(t=>t.classList.remove('active'));
    panels.forEach(p=>p.classList.remove('active'));
    tab.classList.add('active');
    const panel = document.querySelector(`.skill-panel[data-panel="${tab.dataset.tab}"]`);
    panel.classList.add('active');
    animateBars(panel);
  });
});

// ---------- reveal on scroll ----------
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add('in-view');
      io.unobserve(e.target);
    }
  });
}, {threshold:0.15});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
const skillsSec = document.getElementById('skills');
const io2 = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting){ animateBars(document.querySelector('.skill-panel.active')); io2.disconnect(); } });
}, {threshold:0.2});
io2.observe(skillsSec);

// ---------- hero sparkle field ----------
const canvas = document.getElementById('network');
const ctx = canvas.getContext('2d');
let W, H, nodes = [], sparkles = [];
const mouse = {x:-9999, y:-9999};
const palette = ['183,110,121', '201,161,90', '156,79,92'];

function resize(){
  W = canvas.width = canvas.parentElement.offsetWidth;
  H = canvas.height = canvas.parentElement.offsetHeight;
  const count = Math.min(55, Math.floor((W*H)/28000));
  nodes = Array.from({length:count}, ()=>({
    x: Math.random()*W, y: Math.random()*H,
    vx:(Math.random()-0.5)*0.28, vy:(Math.random()-0.5)*0.28,
    c: palette[Math.floor(Math.random()*palette.length)],
    r: 1.2 + Math.random()*1.6
  }));
  sparkles = Array.from({length:14}, ()=>({
    x: Math.random()*W, y: Math.random()*H,
    s: 4 + Math.random()*6, phase: Math.random()*Math.PI*2, speed: 0.015+Math.random()*0.02
  }));
}
window.addEventListener('resize', resize);
canvas.parentElement.addEventListener('mousemove', (e)=>{
  const r = canvas.getBoundingClientRect();
  mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
});
canvas.parentElement.addEventListener('mouseleave', ()=>{ mouse.x=-9999; mouse.y=-9999; });

function drawStar(x,y,size,alpha,color){
  ctx.save();
  ctx.translate(x,y);
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  for(let i=0;i<4;i++){
    ctx.rotate(Math.PI/2);
    ctx.moveTo(0,0);
    ctx.quadraticCurveTo(size*0.15, size*0.15, size, 0);
    ctx.quadraticCurveTo(size*0.15, -size*0.15, 0, 0);
  }
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

function drawFrame(t){
  ctx.clearRect(0,0,W,H);
  for(const n of nodes){
    n.x += n.vx; n.y += n.vy;
    if(n.x<0||n.x>W) n.vx*=-1;
    if(n.y<0||n.y>H) n.vy*=-1;
    const dx = mouse.x-n.x, dy = mouse.y-n.y, d = Math.hypot(dx,dy);
    if(d<120){ n.x -= dx/d*0.5; n.y -= dy/d*0.5; }
  }
  for(let i=0;i<nodes.length;i++){
    for(let j=i+1;j<nodes.length;j++){
      const dx = nodes[i].x-nodes[j].x, dy = nodes[i].y-nodes[j].y;
      const dist = Math.hypot(dx,dy);
      if(dist<125){
        ctx.strokeStyle = `rgba(183,110,121,${0.12*(1-dist/125)})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(nodes[i].x,nodes[i].y); ctx.lineTo(nodes[j].x,nodes[j].y); ctx.stroke();
      }
    }
  }
  for(const n of nodes){
    ctx.fillStyle = `rgba(${n.c},0.6)`;
    ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2); ctx.fill();
  }
  for(const sp of sparkles){
    const alpha = 0.15 + 0.35*Math.abs(Math.sin(t*sp.speed + sp.phase));
    drawStar(sp.x, sp.y, sp.s, alpha, '#C9A15A');
  }
}
function loop(t){ drawFrame(t||0); if(!reduced) requestAnimationFrame(loop); }
resize();
if(reduced){ drawFrame(0); } else { requestAnimationFrame(loop); }

// ---------- mini bar chart helper ----------
function drawBars(id, values, colorA, colorB){
  const c = document.getElementById(id);
  const dctx = c.getContext('2d');
  function render(){
    const w = c.clientWidth, h = 160;
    c.width = w * devicePixelRatio; c.height = h * devicePixelRatio;
    dctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
    dctx.clearRect(0,0,w,h);
    const bw = w / values.length;
    values.forEach((v,i)=>{
      const bh = (v/100)*(h-20);
      const grad = dctx.createLinearGradient(0,h-bh,0,h);
      grad.addColorStop(0, colorA); grad.addColorStop(1, colorB);
      dctx.fillStyle = grad;
      const bx = i*bw + bw*0.22, bwid = bw*0.56, rad = Math.min(6, bwid/2);
      dctx.beginPath();
      dctx.moveTo(bx, h);
      dctx.lineTo(bx, h-bh+rad);
      dctx.arcTo(bx, h-bh, bx+rad, h-bh, rad);
      dctx.lineTo(bx+bwid-rad, h-bh);
      dctx.arcTo(bx+bwid, h-bh, bx+bwid, h-bh+rad, rad);
      dctx.lineTo(bx+bwid, h);
      dctx.closePath();
      dctx.fill();
    });
  }
  render();
  window.addEventListener('resize', render);
}
drawBars('chart1', [42,58,67,74,81,88,91], '#B76E79', 'rgba(183,110,121,0.12)');
drawBars('chart2', [30,45,40,60,55,72,68,80], '#C9A15A', 'rgba(201,161,90,0.12)');
drawBars('chart3', [50,62,58,70,66,77,84], '#9C4F5C', 'rgba(156,79,92,0.12)');