/* TechCampus — Hero 3D em movimento
   Partículas e objeto geométrico 3D renderizados em Canvas, sem bibliotecas. */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hero = document.querySelector('.hero');
  if (!hero || hero.querySelector('.tc-3d-scene')) return;

  const scene = document.createElement('div');
  scene.className = 'tc-3d-scene';
  scene.setAttribute('aria-hidden', 'true');
  scene.innerHTML = `
    <canvas class="tc-3d-canvas"></canvas>
    <div class="tc-3d-orbit tc-3d-orbit-one"><span></span></div>
    <div class="tc-3d-orbit tc-3d-orbit-two"><span></span></div>
    <div class="tc-3d-hud"><span class="tc-hud-dot"></span> TECHCAMPUS <i>•</i> CONECTANDO POSSIBILIDADES</div>
    <div class="tc-3d-core"><div class="tc-core-ring"></div><div class="tc-core-cube"><b></b><b></b><b></b><b></b><b></b><b></b></div></div>
    <div class="tc-3d-caption"><span>01</span><div><b>IDEIAS EM MOVIMENTO</b><small>TECNOLOGIA · CONEXÃO · FUTURO</small></div></div>
  `;
  hero.appendChild(scene);

  const canvas = scene.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, dpr = 1, raf = 0, pointerX = 0, pointerY = 0, targetX = 0, targetY = 0;
  let particles = [];
  const rand = (a,b) => a + Math.random() * (b-a);
  function resize() {
    const box = hero.getBoundingClientRect();
    w = box.width; h = box.height; dpr = Math.min(window.devicePixelRatio || 1, 1.7);
    canvas.width = Math.round(w*dpr); canvas.height = Math.round(h*dpr);
    canvas.style.width = w+'px'; canvas.style.height = h+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
    particles = Array.from({length: Math.min(95, Math.floor(w/11))}, () => ({
      x: rand(w*.45,w*1.08), y: rand(0,h), z: rand(.25,1),
      r: rand(.7,2.1), phase: rand(0,Math.PI*2), speed: rand(.12,.45)
    }));
  }
  function draw(t) {
    ctx.clearRect(0,0,w,h);
    const time = t * .00025;
    const cx = w*.79 + pointerX*18, cy = h*.48 + pointerY*12;
    // Camada de luz atmosférica
    const glow = ctx.createRadialGradient(cx,cy,0,cx,cy,Math.min(w*.37,360));
    glow.addColorStop(0,'rgba(229,36,59,.19)'); glow.addColorStop(.5,'rgba(229,36,59,.055)'); glow.addColorStop(1,'rgba(229,36,59,0)');
    ctx.fillStyle=glow; ctx.fillRect(0,0,w,h);

    // Campo de partículas com deriva contínua
    particles.forEach(p => {
      const x = p.x + Math.sin(time*2+p.phase)*18*p.z + pointerX*22*p.z;
      const y = (p.y + t*p.speed*.018) % (h+20);
      const alpha = .22 + (.5+.5*Math.sin(time*5+p.phase))*.5*p.z;
      ctx.beginPath(); ctx.arc(x,y,p.r*p.z,0,Math.PI*2);
      ctx.fillStyle = 'rgba(255,95,108,'+alpha+')'; ctx.fill();
    });

    // Wireframe 3D: dois icosaedros giratórios em projeção perspectiva
    const vertices = [];
    const phi = (1+Math.sqrt(5))/2;
    for (const a of [-1,1]) for (const b of [-1,1]) vertices.push([0,a,b*phi],[a,b*phi,0],[b*phi,0,a]);
    const unique = [...new Map(vertices.map(v=>[v.join(','),v])).values()];
    const edges = [];
    for(let i=0;i<unique.length;i++) for(let j=i+1;j<unique.length;j++){
      const dist=Math.hypot(unique[i][0]-unique[j][0],unique[i][1]-unique[j][1],unique[i][2]-unique[j][2]);
      if(dist<2.01) edges.push([i,j]);
    }
    function poly(scale, spin, tilt, ox, oy, color, alpha) {
      const projected = unique.map(v=>{
        let [x,y,z]=v.map(n=>n*scale);
        const X=x*Math.cos(spin)-z*Math.sin(spin), Z=x*Math.sin(spin)+z*Math.cos(spin);
        const Y=y*Math.cos(tilt)-Z*Math.sin(tilt), ZZ=y*Math.sin(tilt)+Z*Math.cos(tilt);
        const depth=420/(420+ZZ);
        return [ox+X*depth,oy+Y*depth,ZZ];
      });
      edges.forEach(([a,b])=>{
        const A=projected[a],B=projected[b];
        ctx.beginPath();ctx.moveTo(A[0],A[1]);ctx.lineTo(B[0],B[1]);
        ctx.strokeStyle=color;ctx.globalAlpha=alpha*(.5+(.5*Math.sin(time*3+A[2]*.01)));ctx.lineWidth=1.1;ctx.stroke();
      });
      ctx.globalAlpha=1;
      projected.forEach((p,i)=>{
        ctx.beginPath();ctx.arc(p[0],p[1],1.8,0,Math.PI*2);
        ctx.fillStyle=color;ctx.globalAlpha=.55;ctx.fill();ctx.globalAlpha=1;
      });
    }
    const size = Math.min(w*.115,115);
    poly(size*1.45,time*1.15,.55+Math.sin(time)*.22,cx,cy,'#ff485b',.72);
    poly(size*.86,-time*.8,1.05,cx,cy,'#f4f5f7',.36);

    // Anéis luminosos e traços técnicos no cenário
    ctx.save();ctx.translate(cx,cy);ctx.rotate(-time*.18);
    ctx.setLineDash([2,9]);ctx.lineWidth=1;ctx.strokeStyle='rgba(255,255,255,.25)';
    ctx.beginPath();ctx.ellipse(0,0,size*2.55,size*1.18,-.25,0,Math.PI*2);ctx.stroke();
    ctx.setLineDash([]);ctx.restore();

    // Linhas de conexão entre partículas próximas
    for(let i=0;i<particles.length;i++) for(let j=i+1;j<Math.min(i+5,particles.length);j++){
      const a=particles[i],b=particles[j];
      const ax=a.x+Math.sin(time*2+a.phase)*18*a.z, ay=(a.y+t*a.speed*.018)%(h+20);
      const bx=b.x+Math.sin(time*2+b.phase)*18*b.z, by=(b.y+t*b.speed*.018)%(h+20);
      const dist=Math.hypot(ax-bx,ay-by);
      if(dist<80){ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);ctx.strokeStyle='rgba(229,36,59,'+(1-dist/80)*.14+')';ctx.lineWidth=.7;ctx.stroke();}
    }
    raf = requestAnimationFrame(draw);
  }
  hero.addEventListener('pointermove', e => {
    const r=hero.getBoundingClientRect();
    targetX=((e.clientX-r.left)/r.width-.5)*2;
    targetY=((e.clientY-r.top)/r.height-.5)*2;
  }, {passive:true});
  hero.addEventListener('pointerleave',()=>{targetX=0;targetY=0;},{passive:true});
  window.addEventListener('resize',resize,{passive:true});
  resize();
  if (!reduce) {
    raf = requestAnimationFrame(function frame(t){
      pointerX += (targetX-pointerX)*.045;
      pointerY += (targetY-pointerY)*.045;
      draw(t);
      raf = requestAnimationFrame(frame);
    });
  } else {
    draw(0);
  }
})();
