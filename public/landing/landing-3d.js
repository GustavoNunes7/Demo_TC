/* TechCampus — experiência 3D interativa, em seção própria (não sobre a imagem do hero). */
(() => {
  const hero = document.querySelector('.hero');
  if (!hero || document.querySelector('.tc-3d-showcase')) return;

  const section = document.createElement('section');
  section.className = 'tc-3d-showcase';
  section.setAttribute('aria-label', 'Experiência visual interativa do TechCampus');
  section.innerHTML = `
    <div class="tc-showcase-inner">
      <div class="tc-showcase-copy">
        <span class="tc-showcase-kicker"><i></i> TECNOLOGIA EM MOVIMENTO</span>
        <h2>Conexões que<br><strong>ganham vida.</strong></h2>
        <p>Explore o universo TechCampus. Mova o mouse e veja a experiência reagir aos seus movimentos.</p>
        <div class="tc-showcase-hint"><span class="tc-mouse-icon">↗</span> INTERAJA COM O OBJETO 3D</div>
      </div>
      <div class="tc-interactive-stage" tabindex="0" role="img" aria-label="Objeto geométrico tridimensional interativo. Mova o mouse para girar.">
        <div class="tc-stage-glow"></div>
        <div class="tc-stage-grid"></div>
        <div class="tc-stage-orbit orbit-a"><span></span></div>
        <div class="tc-stage-orbit orbit-b"><span></span></div>
        <div class="tc-stage-orbit orbit-c"></div>
        <div class="tc-stage-object">
          <div class="tc-object-cube">
            <div class="tc-face front"><span>TC</span></div>
            <div class="tc-face back"></div><div class="tc-face right"></div>
            <div class="tc-face left"></div><div class="tc-face top"></div><div class="tc-face bottom"></div>
          </div>
          <div class="tc-object-inner"></div>
        </div>
        <div class="tc-stage-label label-top"><i></i> SISTEMA CONECTADO <span>01</span></div>
        <div class="tc-stage-label label-bottom"><span>TECHCAMPUS</span><i>INTERACTIVE / 3D</i></div>
        <div class="tc-stage-particles"></div>
      </div>
    </div>
  `;
  hero.insertAdjacentElement('afterend', section);

  const stage = section.querySelector('.tc-interactive-stage');
  const object = section.querySelector('.tc-stage-object');
  let targetX = -12, targetY = 22, currentX = targetX, currentY = targetY, raf = 0;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function move(e) {
    const r = stage.getBoundingClientRect();
    targetY = ((e.clientX - r.left) / r.width - .5) * 52;
    targetX = -(((e.clientY - r.top) / r.height - .5) * 38);
    stage.style.setProperty('--mx', ((e.clientX-r.left)/r.width*100)+'%');
    stage.style.setProperty('--my', ((e.clientY-r.top)/r.height*100)+'%');
  }
  function reset() { targetX = -12; targetY = 22; }
  stage.addEventListener('pointermove', move, {passive:true});
  stage.addEventListener('pointerleave', reset, {passive:true});
  stage.addEventListener('focus', () => { targetY = 42; targetX = -20; });
  stage.addEventListener('blur', reset);
  if (!reduce) {
    const tick = () => {
      currentX += (targetX-currentX)*.075;
      currentY += (targetY-currentY)*.075;
      object.style.transform = 'rotateX('+currentX+'deg) rotateY('+currentY+'deg)';
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  } else {
    object.style.transform = 'rotateX(-12deg) rotateY(22deg)';
  }
  const particleHost = section.querySelector('.tc-stage-particles');
  for (let i=0; i<22; i++) {
    const p=document.createElement('span');
    p.style.setProperty('--i', i);
    p.style.left=(4+Math.random()*92)+'%';
    p.style.top=(8+Math.random()*84)+'%';
    p.style.setProperty('--delay',(-Math.random()*8)+'s');
    p.style.setProperty('--duration',(5+Math.random()*6)+'s');
    particleHost.appendChild(p);
  }
})();
