/* TechCampus — cena 3D real com Three.js/WebGL.
   Isolada da imagem principal; interação por mouse/toque e suporte a movimento reduzido. */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

(() => {
  const hero = document.querySelector('.hero');
  if (!hero || document.querySelector('.tc-3d-showcase')) return;

  const section = document.createElement('section');
  section.className = 'tc-3d-showcase';
  section.setAttribute('aria-label', 'Experiência 3D interativa TechCampus');
  section.innerHTML = `
    <div class="tc-showcase-inner">
      <div class="tc-showcase-copy">
        <span class="tc-showcase-kicker"><i></i> TECNOLOGIA EM MOVIMENTO</span>
        <h2>Conexões que<br><strong>ganham vida.</strong></h2>
        <p>Uma experiência tridimensional em tempo real. Arraste para explorar o núcleo de conexões do TechCampus.</p>
        <div class="tc-showcase-hint"><span class="tc-mouse-icon">↗</span> ARRASTE O OBJETO PARA EXPLORAR</div>
        <div class="tc-3d-status"><span></span> RENDERIZAÇÃO WEBGL <b>ATIVA</b></div>
      </div>
      <div class="tc-interactive-stage" tabindex="0" role="group" aria-label="Cena 3D interativa. Arraste com o mouse ou toque para girar.">
        <canvas class="tc-three-canvas" aria-hidden="true"></canvas>
        <div class="tc-stage-vignette"></div>
        <div class="tc-stage-label label-top"><i></i> NÚCLEO DE CONEXÕES <span>01 / 03</span></div>
        <div class="tc-stage-label label-bottom"><span>TECHCAMPUS</span><i>REAL-TIME 3D · WEBGL</i></div>
        <div class="tc-stage-crosshair">+</div>
      </div>
    </div>`;
  hero.insertAdjacentElement('afterend', section);

  const stage = section.querySelector('.tc-interactive-stage');
  const canvas = section.querySelector('.tc-three-canvas');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0, 8.8);

  scene.add(new THREE.AmbientLight(0xffffff, 1.05));
  const keyLight = new THREE.PointLight(0xff344f, 65, 18);
  keyLight.position.set(3.2, 2.4, 4);
  scene.add(keyLight);
  const coolLight = new THREE.PointLight(0x729dff, 42, 16);
  coolLight.position.set(-3.8, -1.5, 2);
  scene.add(coolLight);
  const rimLight = new THREE.DirectionalLight(0xffffff, 2.4);
  rimLight.position.set(0, 4, -3);
  scene.add(rimLight);

  const world = new THREE.Group();
  scene.add(world);
  const core = new THREE.Group();
  world.add(core);

  const coreGeo = new THREE.IcosahedronGeometry(1.08, 2);
  const coreMat = new THREE.MeshPhysicalMaterial({
    color: 0x171b24, metalness: 0.82, roughness: 0.22,
    emissive: 0x300711, emissiveIntensity: 0.65,
    clearcoat: 1, clearcoatRoughness: 0.18, flatShading: false
  });
  const coreMesh = new THREE.Mesh(coreGeo, coreMat);
  core.add(coreMesh);

  const wire = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.105, 2)),
    new THREE.LineBasicMaterial({ color: 0xff536b, transparent: true, opacity: 0.8 })
  );
  core.add(wire);

  const inner = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.62, 1),
    new THREE.MeshStandardMaterial({ color: 0xff294b, emissive: 0x8f071d, emissiveIntensity: 2.1, metalness: 0.45, roughness: 0.25, wireframe: true })
  );
  core.add(inner);

  const ringMat = new THREE.MeshStandardMaterial({ color: 0xff536b, metalness: 0.8, roughness: 0.24, emissive: 0x5c0718, emissiveIntensity: 0.8 });
  const ringSpecs = [
    { radius: 1.62, tube: 0.018, rot: [0.82, 0.22, -0.28] },
    { radius: 1.92, tube: 0.012, rot: [1.18, -0.5, 0.4] },
    { radius: 1.43, tube: 0.009, rot: [0.25, 1.12, 0.7] }
  ];
  const rings = ringSpecs.map((spec, i) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(spec.radius, spec.tube, 10, 180), ringMat.clone());
    ring.rotation.set(...spec.rot);
    ring.material.color.set(i === 1 ? 0x9da9c7 : 0xff536b);
    world.add(ring);
    return ring;
  });

  // Nós tridimensionais distribuídos numa esfera, ligados por segmentos reais.
  const nodePositions = [];
  const nodeCount = 54;
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < nodeCount; i++) {
    const y = 1 - (i / (nodeCount - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const theta = goldenAngle * i;
    nodePositions.push(new THREE.Vector3(Math.cos(theta) * radius * 2.35, y * 2.35, Math.sin(theta) * radius * 2.35));
  }
  const nodeGeo = new THREE.SphereGeometry(0.035, 10, 10);
  const nodeMat = new THREE.MeshStandardMaterial({ color: 0xff7587, emissive: 0xff1737, emissiveIntensity: 1.7, metalness: 0.3, roughness: 0.3 });
  const nodes = new THREE.InstancedMesh(nodeGeo, nodeMat, nodeCount);
  const dummy = new THREE.Object3D();
  nodePositions.forEach((p, i) => {
    dummy.position.copy(p);
    dummy.scale.setScalar(i % 5 === 0 ? 1.8 : 1);
    dummy.updateMatrix();
    nodes.setMatrixAt(i, dummy.matrix);
  });
  world.add(nodes);

  const linePoints = [];
  nodePositions.forEach((p, i) => {
    nodePositions.forEach((q, j) => {
      if (j > i && p.distanceTo(q) < 1.32) linePoints.push(p, q);
    });
  });
  const connectionsGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
  const connections = new THREE.LineSegments(connectionsGeo, new THREE.LineBasicMaterial({ color: 0xff536b, transparent: true, opacity: 0.2 }));
  world.add(connections);

  // Campo de partículas em profundidade para dar escala à cena.
  const particleCount = 420;
  const particleData = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    particleData[i * 3] = (Math.random() - 0.5) * 10;
    particleData[i * 3 + 1] = (Math.random() - 0.5) * 7;
    particleData[i * 3 + 2] = (Math.random() - 0.5) * 5 - 1;
  }
  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(particleData, 3));
  const particleMat = new THREE.PointsMaterial({ color: 0xff7587, size: 0.022, transparent: true, opacity: 0.68, sizeAttenuation: true });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  let targetX = -0.16, targetY = 0.24, currentX = targetX, currentY = targetY;
  let dragging = false, lastX = 0, lastY = 0;
  const pointer = { x: 0, y: 0 };
  stage.addEventListener('pointerdown', e => {
    dragging = true; lastX = e.clientX; lastY = e.clientY;
    stage.setPointerCapture?.(e.pointerId);
  });
  stage.addEventListener('pointermove', e => {
    const rect = stage.getBoundingClientRect();
    pointer.x = (e.clientX - rect.left) / rect.width - 0.5;
    pointer.y = (e.clientY - rect.top) / rect.height - 0.5;
    if (dragging) {
      targetY += (e.clientX - lastX) * 0.008;
      targetX += (e.clientY - lastY) * 0.008;
      lastX = e.clientX; lastY = e.clientY;
    }
    stage.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width * 100) + '%');
    stage.style.setProperty('--my', ((e.clientY - rect.top) / rect.height * 100) + '%');
  });
  const stopDrag = () => { dragging = false; };
  stage.addEventListener('pointerup', stopDrag);
  stage.addEventListener('pointercancel', stopDrag);
  stage.addEventListener('pointerleave', () => { if (!dragging) { pointer.x = 0; pointer.y = 0; } });
  stage.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') targetY -= 0.15;
    if (e.key === 'ArrowRight') targetY += 0.15;
    if (e.key === 'ArrowUp') targetX -= 0.15;
    if (e.key === 'ArrowDown') targetX += 0.15;
  });

  function resize() {
    const rect = stage.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    renderer.setSize(rect.width, rect.height, false);
    camera.aspect = rect.width / rect.height;
    camera.position.z = rect.width < 480 ? 9.8 : rect.width < 760 ? 9.2 : 8.8;
    camera.updateProjectionMatrix();
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(stage);
  window.addEventListener('resize', resize);
  resize();

  const clock = new THREE.Clock();
  let frame = 0;
  function animate() {
    frame = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    if (!reduceMotion) {
      currentX += ((targetX + pointer.y * 0.12) - currentX) * 0.045;
      currentY += ((targetY + pointer.x * 0.18) - currentY) * 0.045;
      world.rotation.x = currentX + Math.sin(t * 0.35) * 0.035;
      world.rotation.y = currentY + t * 0.075;
      core.rotation.x = Math.sin(t * 0.45) * 0.12;
      core.rotation.y = t * 0.13;
      inner.rotation.x = -t * 0.22;
      inner.rotation.y = t * 0.31;
      rings[0].rotation.z += 0.0017;
      rings[1].rotation.x -= 0.0012;
      rings[2].rotation.y += 0.0015;
      particles.rotation.y = t * 0.008;
      nodes.rotation.y = -t * 0.025;
      keyLight.position.x = 3.2 + Math.sin(t * 0.7) * 0.8;
    }
    renderer.render(scene, camera);
  }
  animate();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(frame);
    else animate();
  });
  window.addEventListener('pagehide', () => {
    cancelAnimationFrame(frame);
    resizeObserver.disconnect();
    renderer.dispose();
    coreGeo.dispose(); coreMat.dispose(); nodeGeo.dispose(); nodeMat.dispose();
    particleGeo.dispose(); particleMat.dispose(); connectionsGeo.dispose();
  }, { once: true });
})();
