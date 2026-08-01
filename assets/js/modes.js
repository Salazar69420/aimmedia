// ── INDUSTRY MODES — Cinematic GLB edition ────────────────────────
(function() {
  const MODES = {
    realtor: {
      badge: 'REAL ESTATE MODE',
      eyebrow: 'Real Estate · AI Voice Infrastructure',
      bg: '#E8E2D6', accent: '#1B3A6B', text: '#0A0A14',
      headline: '<em>For</em><br>Real Estate.',
      services: ['Lead Intake', 'Qualification', 'Appointment Booking', 'CRM Follow-Up'],
      cs: { tag: 'Real Estate · AI Voice', stat: 'Lead → Booking → CRM', name: 'Typical Deployment', desc: 'Every inbound lead is qualified, a showing is booked, and the record lands in the CRM before the call ends.' },
      scene: 'realtor',
    },
    cafe: {
      badge: 'HOSPITALITY MODE',
      eyebrow: 'Hospitality · AI Voice Infrastructure',
      bg: '#130B06', accent: '#D4956A', text: '#F5E6D3',
      headline: '<em>For</em><br>Hospitality.',
      sub: 'Reservations answered, hours and menu questions handled, and overflow calls covered around the clock.',
      services: ['Reservations', 'Hours & FAQ Handling', 'Customer Inquiries', 'Overflow & After-Hours'],
      cs: { tag: 'Hospitality · AI Voice', stat: 'Every Call Answered', name: 'Typical Deployment', desc: 'Reservations, hours, and menu questions are handled live, with overflow and after-hours calls covered automatically.' },
      scene: 'cafe',
    },
    corporate: {
      badge: 'ENTERPRISE MODE',
      eyebrow: 'Enterprise · AI Voice Infrastructure',
      bg: '#04060E', accent: '#4A9EDB', text: '#E8F4FD',
      headline: '<em>For</em><br>Enterprises.',
      sub: 'Support calls handled, internal routing automated, and every update written back to the CRM and ticketing queue.',
      services: ['Customer Support', 'Internal Routing', 'CRM Updates', 'Ticketing & Escalation'],
      cs: { tag: 'Enterprise · AI Voice', stat: 'Support → Ticket → CRM', name: 'Typical Deployment', desc: 'Support calls are triaged, tickets are opened with full context, and every update syncs back to the CRM automatically.' },
      scene: 'corporate',
    },
    dealership: {
      badge: 'DEALERSHIP MODE',
      eyebrow: 'Automotive · AI Voice Infrastructure',
      bg: '#060606', accent: '#D0D0D0', text: '#FFFFFF',
      headline: '<em>For</em><br>Dealerships.',
      services: ['Lead Capture', 'Inventory Inquiries', 'Service Booking', 'Follow-Up Workflows'],
      cs: { tag: 'Automotive · AI Voice', stat: 'Sales + Service Coverage', name: 'Typical Deployment', desc: 'Inventory questions are answered, service appointments are booked, and every lead gets a structured follow-up.' },
      scene: 'dealership',
    },
  };

  const overlay = document.getElementById('mode-overlay');
  const flash   = document.getElementById('mode-flash');
  const modeBtn = document.getElementById('mode-btn');
  const exitBtn = document.getElementById('mode-exit-btn');

  let THREE_lib, scene, camera, renderer, animId;
  let sceneStartMs = 0, sceneObjs = {}, currentMode = null;
  let mx = 0, my = 0, tmx = 0, tmy = 0; // mouse parallax

  // ── DROPDOWN ──────────────────────────────────────────────────
  modeBtn.addEventListener('click', e => { e.stopPropagation(); modeBtn.classList.toggle('open'); });
  document.addEventListener('click', () => modeBtn.classList.remove('open'));
  document.querySelectorAll('.mode-opt').forEach(opt => {
    opt.addEventListener('click', e => { e.stopPropagation(); modeBtn.classList.remove('open'); activateMode(opt.dataset.mode); });
  });
  // Demo-page cards trigger the same cinematic mode activation
  document.querySelectorAll('[data-mode-trigger]').forEach(el => {
    el.addEventListener('click', e => { e.preventDefault(); activateMode(el.dataset.modeTrigger); });
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activateMode(el.dataset.modeTrigger); } });
  });
  exitBtn.addEventListener('click', deactivateMode);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && currentMode) deactivateMode(); });
  overlay.addEventListener('mousemove', e => {
    mx = (e.clientX / window.innerWidth  - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  });
  overlay.addEventListener('mouseleave', () => { mx = 0; my = 0; });

  // ── CINEMATIC ACTIVATE — black cut ────────────────────────────
  function activateMode(key) {
    const cfg = MODES[key]; if (!cfg || currentMode === key) return;

    // 1. Flash to black
    flash.classList.add('in');

    setTimeout(() => {
      currentMode = key;
      overlay.setAttribute('data-mode', key);
      overlay.style.background = cfg.bg;
      overlay.style.color = cfg.text;

      // Populate HUD
      document.getElementById('mode-badge-lbl').textContent = cfg.badge;
      document.getElementById('mode-badge-lbl').style.color = cfg.accent;
      document.getElementById('mode-eyebrow').textContent = cfg.eyebrow;
      document.getElementById('mode-eyebrow').style.color = cfg.accent;
      document.getElementById('mode-headline').innerHTML = cfg.headline;
      document.getElementById('mode-svcs').innerHTML = cfg.services.map(s => '<li>' + s + '</li>').join('');
      document.getElementById('mode-case-tag').textContent = cfg.cs.tag;
      document.getElementById('mode-case-tag').style.color = cfg.accent;
      document.getElementById('mode-case-stat').textContent = cfg.cs.stat;
      document.getElementById('mode-case-stat').style.color = cfg.accent;
      document.getElementById('mode-case-name').textContent = cfg.cs.name;
      document.getElementById('mode-case-desc').textContent = cfg.cs.desc;
      exitBtn.style.color = cfg.accent; exitBtn.style.borderColor = cfg.accent;

      // Reset HUD visibility
      document.getElementById('mode-hud-hl').classList.remove('vis');
      document.getElementById('mode-hud-case').classList.remove('vis');

      document.body.style.overflow = 'hidden';
      overlay.classList.add('m-open');
      mx = 0; my = 0; tmx = 0; tmy = 0;

      // Init 3D scene
      lazyThree(() => initScene(cfg));

      // 2. Fade flash back out
      setTimeout(() => {
        flash.classList.remove('in');
        flash.classList.add('out');
        setTimeout(() => flash.classList.remove('out'), 400);
      }, 80);

      // 3. HUD reveals after flash clears
      setTimeout(() => {
        document.getElementById('mode-hud-hl').classList.add('vis');
        document.getElementById('mode-hud-case').classList.add('vis');
      }, 700);

    }, 180); // after flash is fully black
  }

  function deactivateMode() {
    document.getElementById('mode-hud-hl').classList.remove('vis');
    document.getElementById('mode-hud-case').classList.remove('vis');

    // Flash to black, then reveal main site
    flash.classList.add('in');
    setTimeout(() => {
      overlay.classList.remove('m-open');
      document.body.style.overflow = '';
      destroyScene();
      currentMode = null;
      setTimeout(() => { flash.classList.remove('in'); flash.classList.add('out'); setTimeout(() => flash.classList.remove('out'), 400); }, 80);
    }, 180);
  }

  // ── THREE.JS INIT (eagerly loaded in <head>) ─────────────────
  function lazyThree(cb) {
    // Three.js is already loaded via <script> in <head>
    if (window.THREE) { THREE_lib = window.THREE; cb(); return; }
    // Fallback: shouldn't happen, but retry once
    setTimeout(() => {
      THREE_lib = window.THREE || null;
      if (THREE_lib) cb(); else console.error('Three.js unavailable');
    }, 800);
  }

  // ── SCENE INIT ────────────────────────────────────────────────
  function initScene(cfg) {
    if (animId) { cancelAnimationFrame(animId); animId = null; }
    if (scene) scene.clear();
    sceneObjs = {}; sceneStartMs = Date.now();
    const T3 = THREE_lib;
    const W = window.innerWidth, H = window.innerHeight;
    // Create renderer ONCE — recreating on same canvas destroys WebGL context for other modes
    if (!renderer) {
      renderer = new T3.WebGLRenderer({ canvas: document.getElementById('mode-canvas'), antialias: true });
      renderer.shadowMap.enabled = true; renderer.shadowMap.type = T3.PCFSoftShadowMap;
      renderer.outputEncoding = T3.sRGBEncoding;
      renderer.toneMapping = T3.ACESFilmicToneMapping;
    }
    renderer.setSize(W, H); renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.toneMappingExposure = 1.6;
    scene = new T3.Scene(); scene.background = new T3.Color(cfg.bg);
    camera = new T3.PerspectiveCamera(50, W / H, 0.1, 800);
    ;({ realtor: buildRealtor, cafe: buildCafe, corporate: buildCorporate, dealership: buildDealership }[cfg.scene])();
    (function loop() {
      animId = requestAnimationFrame(loop);
      tmx += (mx - tmx) * 0.04; tmy += (my - tmy) * 0.04;
      try { ({ realtor: updateRealtor, cafe: updateCafe, corporate: updateCorporate, dealership: updateDealership }[cfg.scene])(); } catch(_) {}
      renderer.render(scene, camera);
    })();
  }

  function destroyScene() {
    if (animId) { cancelAnimationFrame(animId); animId = null; }
    if (scene) { scene.clear(); scene = null; }
    camera = null; sceneObjs = {};
    // Renderer kept alive — prevents WebGL context loss on mode switch
  }

  function T3() { return THREE_lib; }
  function sec() { return (Date.now() - sceneStartMs) / 1000; }

  // ── GLB HELPER ────────────────────────────────────────────────
  function loadGLB(src, size, cb) {
    const T = T3();
    if (!T || !T.GLTFLoader) return; // no loader — procedural fallback already handles scene
    new T.GLTFLoader().load(src, gltf => {
      const m = gltf.scene;
      const box = new T.Box3().setFromObject(m);
      const ctr = box.getCenter(new T.Vector3());
      m.position.sub(ctr);
      m.scale.setScalar(size / Math.max(...box.getSize(new T.Vector3()).toArray()));
      const b2 = new T.Box3().setFromObject(m); m.position.y -= b2.min.y;
      m.traverse(c => { if (c.isMesh) { c.castShadow = c.receiveShadow = true; if (c.material) { c.material.envMapIntensity = 1.3; c.material.needsUpdate = true; } } });
      cb(m);
    }, undefined, e => console.warn('GLB load error:', src, e.message || e));
  }

  // ── PROCEDURAL MODEL HELPERS ───────────────────────────────────
  function makeCar(T, bodyColor) {
    const g = new T.Group();
    const bm = new T.MeshStandardMaterial({color:bodyColor,metalness:0.35,roughness:0.35});
    const gm = new T.MeshStandardMaterial({color:0x0D0D0D,roughness:0.5});
    const wm = new T.MeshStandardMaterial({color:0x111111,roughness:0.85});
    const rm = new T.MeshStandardMaterial({color:0xD4D4D4,metalness:0.95,roughness:0.05});
    const glm = new T.MeshStandardMaterial({color:0x6688AA,transparent:true,opacity:0.55,roughness:0.05,metalness:0.1});
    const hm = new T.MeshStandardMaterial({color:0xFFFFEE,emissive:0xFFFFCC,emissiveIntensity:4});
    const tm = new T.MeshStandardMaterial({color:0xFF1100,emissive:0xFF0000,emissiveIntensity:3});
    // Chassis
    const ch = new T.Mesh(new T.BoxGeometry(4.0,0.36,1.92),bm); ch.position.y=0.21; ch.castShadow=true; g.add(ch);
    // Side sills
    [-0.94,0.94].forEach(z=>{const s=new T.Mesh(new T.BoxGeometry(3.7,0.1,0.1),gm);s.position.set(0,0.05,z);g.add(s);});
    // Cabin
    const cab=new T.Mesh(new T.BoxGeometry(2.15,0.58,1.66),bm);cab.position.set(-0.18,0.69,0);cab.castShadow=true;g.add(cab);
    // Hood slope
    const hood=new T.Mesh(new T.BoxGeometry(1.5,0.1,1.8),bm);hood.position.set(1.18,0.43,0);hood.rotation.z=-0.13;g.add(hood);
    // Windshield
    const fw=new T.Mesh(new T.PlaneGeometry(0.7,0.5),glm);fw.position.set(0.9,0.7,0);fw.rotation.y=-1.05;g.add(fw);
    // Rear glass
    const rw=new T.Mesh(new T.PlaneGeometry(0.62,0.46),glm);rw.position.set(-1.22,0.7,0);rw.rotation.y=1.05;g.add(rw);
    // Side windows
    [-0.83].forEach(z=>{const sw=new T.Mesh(new T.PlaneGeometry(1.6,0.44),glm);sw.position.set(-0.18,0.71,z);g.add(sw);});
    // Wheels
    [[1.42,-0.9],[1.42,0.9],[-1.42,-0.9],[-1.42,0.9]].forEach(([wx,wz])=>{
      const t=new T.Mesh(new T.CylinderGeometry(0.32,0.32,0.22,28),wm);t.position.set(wx,0.32,wz);t.rotation.z=Math.PI/2;t.castShadow=true;g.add(t);
      const r=new T.Mesh(new T.CylinderGeometry(0.19,0.19,0.24,10),rm);r.position.copy(t.position);r.rotation.z=Math.PI/2;g.add(r);
    });
    // Headlights
    [0.62,-0.62].forEach(hz=>{const h=new T.Mesh(new T.BoxGeometry(0.17,0.09,0.32),hm);h.position.set(2.04,0.37,hz);g.add(h);});
    // Taillights
    [0.58,-0.58].forEach(tz=>{const t=new T.Mesh(new T.BoxGeometry(0.09,0.16,0.42),tm);t.position.set(-2.04,0.42,tz);g.add(t);});
    return g;
  }

  function makeProcHouse(T) {
    const g = new T.Group();
    const wm = new T.MeshStandardMaterial({color:0xEEE9E0,roughness:0.75});
    const rm = new T.MeshStandardMaterial({color:0xC8C2BA,roughness:0.7});
    const glm = new T.MeshStandardMaterial({color:0x7AAABB,transparent:true,opacity:0.62,metalness:0.25,roughness:0.06});
    const fm = new T.MeshStandardMaterial({color:0x222222,roughness:0.9});
    const dm = new T.MeshStandardMaterial({color:0x445566,metalness:0.3,roughness:0.6});
    // Main body
    const main=new T.Mesh(new T.BoxGeometry(8,3.6,6),wm);main.position.y=1.8;main.castShadow=true;main.receiveShadow=true;g.add(main);
    // Flat roof overhang
    g.add(Object.assign(new T.Mesh(new T.BoxGeometry(9.6,0.18,7.6),rm),{position:new T.Vector3(0,3.69,0),castShadow:true}));
    // Garage wing
    const gar=new T.Mesh(new T.BoxGeometry(3.2,2.5,5.6),wm);gar.position.set(-5.3,1.25,0.2);gar.castShadow=true;g.add(gar);
    g.add(Object.assign(new T.Mesh(new T.BoxGeometry(3.6,0.14,6.1),rm),{position:new T.Vector3(-5.3,2.57,0.2)}));
    // Garage door (aluminum panel)
    g.add(Object.assign(new T.Mesh(new T.BoxGeometry(2.5,2.05,0.05),new T.MeshStandardMaterial({color:0xCCCCCC,metalness:0.55,roughness:0.28})),{position:new T.Vector3(-5.3,1.1,-2.82)}));
    // Front big glass window (floor-to-ceiling)
    g.add(Object.assign(new T.Mesh(new T.BoxGeometry(3.6,2.9,0.05),glm),{position:new T.Vector3(1.1,1.95,-3.02)}));
    // Window frames
    [-0.7,1.1,2.9].forEach(fx=>g.add(Object.assign(new T.Mesh(new T.BoxGeometry(0.06,3.0,0.08),fm),{position:new T.Vector3(fx,1.95,-2.99)})));
    [3.42,0.44].forEach(fy=>g.add(Object.assign(new T.Mesh(new T.BoxGeometry(3.7,0.07,0.08),fm),{position:new T.Vector3(1.1,fy,-2.99)})));
    // Side windows (2)
    [-1.1,0.9].forEach(wx=>g.add(Object.assign(new T.Mesh(new T.BoxGeometry(0.05,1.25,1.85),glm),{position:new T.Vector3(-4.02,2.3,wx)})));
    // Entry door
    g.add(Object.assign(new T.Mesh(new T.BoxGeometry(1.05,2.35,0.06),dm),{position:new T.Vector3(-0.6,1.24,-3.02)}));
    // Entry steps
    [0,1].forEach(i=>g.add(Object.assign(new T.Mesh(new T.BoxGeometry(2.6-i*0.2,0.1,0.5),new T.MeshStandardMaterial({color:0xD0C8BC})),{position:new T.Vector3(-0.6,i*0.1,-3.02-(1-i)*0.55)})));
    return g;
  }

  function makeProcTree(T, h) {
    const g = new T.Group();
    const trk=new T.MeshStandardMaterial({color:0x3A2010,roughness:0.95});
    const lf=new T.MeshStandardMaterial({color:0x1E4D18,roughness:0.85});
    g.add(Object.assign(new T.Mesh(new T.CylinderGeometry(0.07,0.13,h*0.38,8),trk),{position:new T.Vector3(0,h*0.19,0),castShadow:true}));
    g.add(Object.assign(new T.Mesh(new T.SphereGeometry(h*0.28,8,6),lf),{position:new T.Vector3(0,h*0.55,0),castShadow:true}));
    g.add(Object.assign(new T.Mesh(new T.SphereGeometry(h*0.16,7,5),lf),{position:new T.Vector3(h*0.12,h*0.72,0)}));
    g.add(Object.assign(new T.Mesh(new T.SphereGeometry(h*0.13,7,5),lf),{position:new T.Vector3(-h*0.1,h*0.78,h*0.08)}));
    return g;
  }

  function makeProcBuilding(T, height, bColor) {
    const g = new T.Group();
    const wm=new T.MeshStandardMaterial({color:bColor||0x080E1A,roughness:0.55,metalness:0.4});
    const winM=new T.MeshStandardMaterial({color:0x4A90D9,emissive:0x1A3A6A,emissiveIntensity:0.5,roughness:0.08,metalness:0.1});
    const darkW=new T.MeshStandardMaterial({color:0x0A1830,roughness:0.2,metalness:0.2});
    const tw=4.2, td=4.2;
    g.add(Object.assign(new T.Mesh(new T.BoxGeometry(tw,height,td),wm),{position:new T.Vector3(0,height/2,0),castShadow:true,receiveShadow:true}));
    const rows=Math.floor(height/1.5), cols=3;
    for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
      const lit=Math.random()>0.3;
      const wx=new T.Mesh(new T.BoxGeometry(1.0,0.88,0.06),lit?winM:darkW);
      wx.position.set((c-1)*1.3,0.9+r*1.5,td/2+0.04);g.add(wx);
      const wxb=wx.clone();wxb.position.z=-td/2-0.04;g.add(wxb);
    }
    // Rooftop light
    const rl=new T.Mesh(new T.SphereGeometry(0.1,8,8),new T.MeshStandardMaterial({color:0xFF2200,emissive:0xFF1100,emissiveIntensity:4}));
    rl.position.y=height+0.15;g.add(rl);
    return g;
  }

  function makeProcCoffee(T) {
    const g = new T.Group();
    const chrome=new T.MeshStandardMaterial({color:0xCCCCCC,metalness:0.95,roughness:0.05});
    const blk=new T.MeshStandardMaterial({color:0x111111,roughness:0.4});
    const brass=new T.MeshStandardMaterial({color:0xB8860B,metalness:0.8,roughness:0.2});
    const led=new T.MeshStandardMaterial({color:0xFF8800,emissive:0xFF6600,emissiveIntensity:3});
    // Main body
    g.add(Object.assign(new T.Mesh(new T.BoxGeometry(0.52,0.54,0.4),chrome),{position:new T.Vector3(0,0.27,0),castShadow:true}));
    // Front black panel
    g.add(Object.assign(new T.Mesh(new T.BoxGeometry(0.5,0.4,0.02),blk),{position:new T.Vector3(0,0.27,0.21)}));
    // Boiler dome
    g.add(Object.assign(new T.Mesh(new T.CylinderGeometry(0.15,0.15,0.14,16),chrome),{position:new T.Vector3(0,0.61,0)}));
    g.add(Object.assign(new T.Mesh(new T.SphereGeometry(0.15,16,8,0,Math.PI*2,0,Math.PI/2),chrome),{position:new T.Vector3(0,0.68,0)}));
    // Group head
    const gh=new T.Mesh(new T.CylinderGeometry(0.075,0.075,0.15,12),chrome); gh.position.set(0,0.11,0.23); gh.rotation.x=Math.PI/2; g.add(gh);
    // Portafilter
    const pf=new T.Mesh(new T.CylinderGeometry(0.025,0.025,0.38,8),blk); pf.position.set(0.14,-0.06,0.3); pf.rotation.z=0.5; g.add(pf);
    // Steam wand
    const stw=new T.Mesh(new T.CylinderGeometry(0.018,0.014,0.34,8),chrome); stw.position.set(0.28,0.14,0.1); stw.rotation.z=0.45; g.add(stw);
    // Drip tray
    g.add(Object.assign(new T.Mesh(new T.BoxGeometry(0.46,0.03,0.32),chrome),{position:new T.Vector3(0,0.015,0.06)}));
    // Pressure gauge
    const pg=new T.Mesh(new T.CylinderGeometry(0.065,0.065,0.02,16),chrome); pg.position.set(-0.13,0.36,0.22); pg.rotation.x=Math.PI/2; g.add(pg);
    // Status LED
    g.add(Object.assign(new T.Mesh(new T.SphereGeometry(0.03,8,8),led),{position:new T.Vector3(0.16,0.42,0.22)}));
    // Cups
    [-0.16,0.16].forEach(cx=>{
      const cup=new T.Group();
      cup.add(Object.assign(new T.Mesh(new T.CylinderGeometry(0.055,0.045,0.07,16),new T.MeshStandardMaterial({color:0xFFFFFF,roughness:0.2})),{}));
      cup.add(Object.assign(new T.Mesh(new T.TorusGeometry(0.05,0.008,8,16),new T.MeshStandardMaterial({color:0xFFFFFF,roughness:0.2})),{position:new T.Vector3(0.06,0,0)}));
      cup.position.set(cx,0.56,0.06);g.add(cup);
    });
    return g;
  }

  function fadeIn(model, dur) {
    model.traverse(c => { if (c.isMesh && c.material) { c.material = c.material.clone(); c.material.transparent = true; c.material.opacity = 0; } });
    const s = Date.now();
    const iv = setInterval(() => {
      const p = Math.min(1, (Date.now() - s) / (dur * 1000));
      model.traverse(c => { if (c.isMesh && c.material?.transparent) c.material.opacity = p; });
      if (p >= 1) { clearInterval(iv); model.traverse(c => { if (c.isMesh && c.material) c.material.transparent = false; }); }
    }, 16);
  }

  // ── REALTOR — Luxury house + trees + orbit ────────────────────
  function buildRealtor() {
    const T = T3();
    camera.position.set(8, 5, 14); camera.lookAt(0, 2, 0);
    scene.fog = new T.FogExp2(0xD8D2C6, 0.012);

    // Ground — warm stone
    const ground = new T.Mesh(new T.PlaneGeometry(100,100), new T.MeshStandardMaterial({color:0xD0C8BC,roughness:0.88}));
    ground.rotation.x = -Math.PI/2; ground.receiveShadow = true; scene.add(ground);
    // Lawn area
    const lawn = new T.Mesh(new T.PlaneGeometry(22,18), new T.MeshStandardMaterial({color:0x4A7A38,roughness:0.9}));
    lawn.rotation.x = -Math.PI/2; lawn.position.set(0,0.01,1); scene.add(lawn);
    // Driveway
    const drive = new T.Mesh(new T.PlaneGeometry(3.8,12), new T.MeshStandardMaterial({color:0xB0AAA4,roughness:0.7}));
    drive.rotation.x = -Math.PI/2; drive.position.set(-5.3,0.01,3.5); scene.add(drive);

    // Blueprint grid overlay
    const grid = new T.GridHelper(60,60,0x1E3A88,0x2A5298); grid.material.opacity=0.12; grid.material.transparent=true; scene.add(grid);

    // Lighting — bright daylight
    scene.add(new T.AmbientLight(0xFFFFFF, 2.5));
    const sun = new T.DirectionalLight(0xFFF5E0, 4.5); sun.position.set(18,28,20); sun.castShadow=true;
    sun.shadow.mapSize.set(2048,2048); sun.shadow.camera.left=-30; sun.shadow.camera.right=30;
    sun.shadow.camera.top=30; sun.shadow.camera.bottom=-30; sun.shadow.camera.far=120;
    scene.add(sun);
    const fill = new T.DirectionalLight(0xC0D4F8, 1.5); fill.position.set(-10,14,-8); scene.add(fill);
    const bounce = new T.PointLight(0xFFE8B0, 1.5, 40); bounce.position.set(0, 2, 5); scene.add(bounce);

    // Background silhouette buildings
    const bMat = new T.MeshStandardMaterial({color:0xBCB6AE,roughness:1});
    [[-14,-16,2.2,7,2],[-10,-17,1.6,5,1.6],[12,-14,2.8,10,2.2],[16,-16,2.0,7,2],[-20,-16,3.2,13,3.2]].forEach(([x,z,w,h,d])=>{
      const b=new T.Mesh(new T.BoxGeometry(w,h,d),bMat);b.position.set(x,h/2,z);b.castShadow=true;b.receiveShadow=true;scene.add(b);
    });

    // HOUSE — procedural
    const house = makeProcHouse(T);
    house.position.set(0,0,0); scene.add(house); sceneObjs.house = house;
    // Try GLB enhancement (will replace if loaded)
    loadGLB('/assets/model-house.glb', 9, model => { model.position.set(0,0,0); scene.remove(house); scene.add(model); fadeIn(model,1.2); sceneObjs.house = model; });

    // TREES — procedural scattered
    const treePos = [[-7,3],[-6,-4],[6,2],[7,-3],[-10,0],[9,1],[-4,-7],[5,-6]];
    sceneObjs.trees = [];
    treePos.forEach(([tx,tz],i) => {
      const h = 2.5 + Math.random()*1.8;
      const t = makeProcTree(T, h); t.position.set(tx,0,tz); t.rotation.y=Math.random()*Math.PI*2; scene.add(t); sceneObjs.trees.push(t);
      loadGLB('/assets/model-tree.glb', h, model => { model.position.set(tx,0,tz); model.rotation.y=t.rotation.y; scene.remove(t); scene.add(model); fadeIn(model,0.8); sceneObjs.trees[i]=model; });
    });

    sceneObjs.orbit = 0;
  }

  function updateRealtor() {
    sceneObjs.orbit = (sceneObjs.orbit || 0) + 0.00045;
    const a = sceneObjs.orbit, r = 15;
    const bx = Math.sin(a) * r * 0.6 + tmx * 1.5;
    const by = 5 + Math.sin(a * 0.35) + tmy * -1;
    const bz = Math.cos(a) * r;
    camera.position.set(bx, by, bz); camera.lookAt(0, 2.5, 0);
  }

  // ── CAFE — Espresso machine bar, steam, bokeh ─────────────────
  function buildCafe() {
    const T = T3();
    camera.position.set(0, 2.2, 6); camera.lookAt(0, 1.4, 0);
    scene.fog = new T.FogExp2(0x0E0704, 0.04);

    // Bright warm lighting first — everything must be visible
    scene.add(new T.AmbientLight(0xFFDDB8, 3.0));
    [[-2,3.0,-1.2],[0,3.0,-1.0],[2,3.0,-1.2]].forEach(([x,y,z]) => {
      const pt = new T.PointLight(0xFF8C3A, 15, 10); pt.position.set(x,y,z); pt.castShadow=true; scene.add(pt);
    });
    const topL = new T.PointLight(0xF0A060, 3, 20); topL.position.set(0,5,-3); scene.add(topL);

    // Floor — proper rotation via direct property
    const cafeFloor = new T.Mesh(new T.PlaneGeometry(30,30), new T.MeshStandardMaterial({ color:0x1A0E08, roughness:0.85 }));
    cafeFloor.rotation.x = -Math.PI/2; cafeFloor.receiveShadow=true; scene.add(cafeFloor);

    // Bar counter
    const ctr = new T.Mesh(new T.BoxGeometry(6, 0.14, 1.6), new T.MeshStandardMaterial({ color:0x281A14, roughness:0.25, metalness:0.25 }));
    ctr.position.set(0, 1.02, -1.5); ctr.castShadow=true; scene.add(ctr);

    // Back wall + shelves
    const cafeWall = new T.Mesh(new T.PlaneGeometry(16,8), new T.MeshStandardMaterial({ color:0x100806 }));
    cafeWall.position.set(0,3,-4); scene.add(cafeWall);
    [[-1.8,1.55,-2.8],[1.8,1.55,-2.8]].forEach(([x,y,z]) => {
      const sh = new T.Mesh(new T.BoxGeometry(1.2,0.06,0.3), new T.MeshStandardMaterial({color:0x3A1C0C}));
      sh.position.set(x,y,z); scene.add(sh);
    });

    // Pendant lamps — visible glowing mesh
    [[-2,3.0,-1.2],[0,3.0,-1.0],[2,3.0,-1.2]].forEach(([x,y,z]) => {
      const lamp = new T.Mesh(new T.CylinderGeometry(0.04,0.2,0.28,8), new T.MeshStandardMaterial({color:0x8B5A30,emissive:0xE8802A,emissiveIntensity:4,roughness:0.5}));
      lamp.position.set(x,y,z); scene.add(lamp);
      const cord = new T.Mesh(new T.CylinderGeometry(0.01,0.01,1.8,4), new T.MeshStandardMaterial({color:0x2A1808}));
      cord.position.set(x,y+1.04,z); scene.add(cord);
    });

    // Espresso machine — procedural centrepiece
    const machine = makeProcCoffee(T); machine.position.set(0,1.09,-1.65); scene.add(machine); sceneObjs.machine = machine;
    // Side machine
    const machine2 = makeProcCoffee(T); machine2.position.set(-2.1,1.06,-1.6); machine2.rotation.y=0.3; machine2.scale.setScalar(0.88); scene.add(machine2);
    // Try GLB enhancement
    loadGLB('/assets/model-coffee.glb', 1.5, model => { model.position.set(0,1.09,-1.65); scene.remove(machine); scene.add(model); fadeIn(model,1.0); sceneObjs.machine = model; });
    loadGLB('/assets/model-coffee.glb', 1.0, model => { model.position.set(-2.1,1.06,-1.6); model.rotation.y=0.3; scene.remove(machine2); scene.add(model); fadeIn(model,1.2); });

    // Bokeh atmosphere particles
    const bGeo = new T.SphereGeometry(0.04,4,4);
    sceneObjs.bokeh = Array.from({length:60},() => {
      const p = new T.Mesh(bGeo, new T.MeshBasicMaterial({color:0xE8802A,transparent:true,opacity:0}));
      p.position.set((Math.random()-0.5)*8, Math.random()*4, (Math.random()-0.5)*4 - 2);
      p.userData = { phase: Math.random()*Math.PI*2, spd: 0.15+Math.random()*0.3, base: p.position.clone() };
      scene.add(p); return p;
    });

    // Steam above machine
    const sGeo = new T.SphereGeometry(0.025,5,5);
    sceneObjs.steam = Array.from({length:40},() => {
      const s = new T.Mesh(sGeo, new T.MeshBasicMaterial({color:0xF5E6D3,transparent:true,opacity:0}));
      const ox = (Math.random()-0.5)*0.35;
      s.position.set(ox, 1.28+Math.random()*1.2, -1.4+(Math.random()-0.5)*0.25);
      s.userData = { bx:ox, phase:Math.random()*Math.PI*2, spd:0.22+Math.random()*0.35 };
      scene.add(s); return s;
    });
    sceneObjs.cAngle = 0;
  }

  function updateCafe() {
    const t = sec();
    sceneObjs.cAngle = (sceneObjs.cAngle||0) + 0.0003;
    if (sceneObjs.machine) sceneObjs.machine.rotation.y += 0.002;
    sceneObjs.steam && sceneObjs.steam.forEach(p => {
      const h = p.position.y - 1.28;
      p.position.y += p.userData.spd * 0.006;
      p.position.x += Math.sin(t*0.6+p.userData.phase)*0.001;
      p.material.opacity = 0.30 * Math.sin(Math.min(1,h/1.3)*Math.PI);
      if (p.position.y > 2.6) { p.position.y=1.28; p.position.x=p.userData.bx+(Math.random()-0.5)*0.35; }
    });
    sceneObjs.bokeh && sceneObjs.bokeh.forEach(p => {
      p.position.y = p.userData.base.y + Math.sin(t*p.userData.spd+p.userData.phase)*0.3;
      p.material.opacity = 0.18 * (0.5+0.5*Math.sin(t*p.userData.spd*1.3+p.userData.phase));
    });
    const a = sceneObjs.cAngle;
    camera.position.x = Math.sin(a)*2 + tmx*1.5;
    camera.position.y = 2.2 + Math.sin(a*0.5)*0.2 + tmy*-0.8;
    camera.lookAt(0, 1.4, 0);
  }

  // ── CORPORATE — Skyline + data network ────────────────────────
  function buildCorporate() {
    const T = T3();
    camera.position.set(0, 8, 24); camera.lookAt(0, 6, 0);
    scene.fog = new T.FogExp2(0x030710, 0.011);

    // Floor — proper rotation
    const corpFloor = new T.Mesh(new T.PlaneGeometry(80,80), new T.MeshStandardMaterial({color:0x060D18,roughness:0.85,metalness:0.3}));
    corpFloor.rotation.x = -Math.PI/2; corpFloor.receiveShadow=true; scene.add(corpFloor);
    const grid = new T.GridHelper(70,70,0x0A2050,0x071535); grid.material.opacity=0.65; grid.material.transparent=true; scene.add(grid);

    // Lighting — very bright blue/cyan city glow
    scene.add(new T.AmbientLight(0x2255CC, 5.0));
    const bl = new T.PointLight(0x1A70DD, 20, 60); bl.position.set(-10,18,4); bl.castShadow=true; scene.add(bl);
    const tl = new T.PointLight(0x00CFC0, 14, 50); tl.position.set(10,14,-5); scene.add(tl);
    const fl = new T.PointLight(0x4A9EDB, 8, 35); fl.position.set(0,6,12); scene.add(fl);

    // Main tower — procedural glass skyscraper
    const mainB = makeProcBuilding(T, 28, 0x080F1C); mainB.position.set(0,0,-4); scene.add(mainB); sceneObjs.mainBuilding = mainB;
    const leftB = makeProcBuilding(T, 20, 0x06101E); leftB.position.set(-14,0,-10); leftB.rotation.y=0.18; scene.add(leftB);
    const rightB = makeProcBuilding(T, 24, 0x06101E); rightB.position.set(14,0,-10); rightB.rotation.y=-0.15; scene.add(rightB);
    // Try GLB enhancement
    loadGLB('/assets/model-office.glb', 16, model => {
      model.position.set(0,0,-4); model.traverse(c=>{if(c.isMesh&&c.material){c.material.emissive=new T.Color(0x0A2048);c.material.emissiveIntensity=0.15;}});
      scene.remove(mainB); scene.add(model); fadeIn(model,1.2); sceneObjs.mainBuilding = model;
    });
    // Background box buildings (depth of city)
    [[-22,-18,4,22,4],[22,-20,3,17,3],[0,-24,5,26,5],[-30,-18,2,13,2],[28,-20,2,15,2],
     [-8,-20,3,18,3],[9,-22,4,20,4],[-18,-20,2.5,12,2.5],[20,-18,2.5,16,2.5]].forEach(([x,z,w,h,d])=>{
      const bm=new T.Mesh(new T.BoxGeometry(w,h,d),new T.MeshStandardMaterial({color:0x050D18,roughness:0.9}));
      bm.position.set(x,h/2,z);scene.add(bm);
    });

    // Data nodes
    const nPos = [
      [-5,4,0],[5,5,1],[-3,8,-3],[3,7,2],[-7,6,3],[7,4,-2],
      [-2,11,-4],[2,10,3],[-5,14,0],[5,12,-3],[0,16,-2],[-8,3,2],[8,3,1],
      [-4,2,5],[4,2,-5],[0,2,0],
    ];
    const nGeo = new T.SphereGeometry(0.14,8,8);
    sceneObjs.nodes = nPos.map(([x,y,z]) => {
      const n = new T.Mesh(nGeo, new T.MeshBasicMaterial({color:0x4A9EDB}));
      n.position.set(x,y,z); n.userData={base:[x,y,z],phase:Math.random()*Math.PI*2}; scene.add(n); return n;
    });
    // Lines
    const lpts = [];
    for(let i=0;i<nPos.length;i++) for(let j=i+1;j<nPos.length;j++){
      const [ax,ay,az]=nPos[i],[bx,by,bz]=nPos[j];
      if(Math.hypot(ax-bx,ay-by,az-bz)<7) lpts.push(new T.Vector3(ax,ay,az),new T.Vector3(bx,by,bz));
    }
    scene.add(new T.LineSegments(new T.BufferGeometry().setFromPoints(lpts), new T.LineBasicMaterial({color:0x0A4A8A,transparent:true,opacity:0.4})));
    sceneObjs.packets = [];
    for(let i=0;i<lpts.length-1&&sceneObjs.packets.length<14;i+=2){
      const p = new T.Mesh(new T.SphereGeometry(0.1,5,5), new T.MeshBasicMaterial({color:0x00D4FF}));
      p.userData={a:lpts[i].clone(),b:lpts[i+1].clone(),t:Math.random(),spd:0.004+Math.random()*0.005};
      scene.add(p); sceneObjs.packets.push(p);
    }
    sceneObjs.coAngle = 0;
  }

  function updateCorporate() {
    const t = sec();
    if(sceneObjs.mainBuilding) sceneObjs.mainBuilding.rotation.y += 0.0005;
    sceneObjs.nodes && sceneObjs.nodes.forEach(n => {
      n.scale.setScalar(1+0.14*Math.sin(t*1.3+n.userData.phase));
      n.position.y = n.userData.base[1]+Math.sin(t*0.5+n.userData.phase)*0.14;
    });
    sceneObjs.packets && sceneObjs.packets.forEach(p => {
      p.userData.t += p.userData.spd;
      if(p.userData.t>=1){p.userData.t=0;const tmp=p.userData.a;p.userData.a=p.userData.b;p.userData.b=tmp;}
      p.position.lerpVectors(p.userData.a,p.userData.b,p.userData.t);
    });
    sceneObjs.coAngle = (sceneObjs.coAngle||0) + 0.0005;
    const a = sceneObjs.coAngle;
    camera.position.x = Math.sin(a)*20 + tmx*3;
    camera.position.z = Math.cos(a)*20;
    camera.position.y = 8 + Math.sin(a*0.4)*2 + tmy*-2;
    camera.lookAt(0,6,0);
  }

  // ── DEALERSHIP — premium 3-car showroom ───────────────────────
  function buildDealership() {
    const T = T3();
    camera.position.set(0,2.5,10); camera.lookAt(0,1.2,0);
    scene.fog = new T.FogExp2(0x050508, 0.018);

    // Ultra-glossy showroom floor
    const dlrFloor = new T.Mesh(new T.PlaneGeometry(60,60), new T.MeshStandardMaterial({color:0x080810,roughness:0.06,metalness:0.92}));
    dlrFloor.rotation.x = -Math.PI/2; dlrFloor.receiveShadow=true; scene.add(dlrFloor);
    const gd = new T.GridHelper(60,60,0x1A1A30,0x0D0D20); gd.material.opacity=0.55; gd.material.transparent=true; scene.add(gd);

    // Walls
    const wm = new T.MeshStandardMaterial({color:0x0C0C18,roughness:0.9});
    const wb = new T.Mesh(new T.BoxGeometry(60,14,0.1),wm); wb.position.set(0,7,-22); scene.add(wb);
    const wl = new T.Mesh(new T.BoxGeometry(0.1,14,60),wm); wl.position.set(-22,7,0); scene.add(wl);
    const wr = new T.Mesh(new T.BoxGeometry(0.1,14,60),wm); wr.position.set(22,7,0); scene.add(wr);

    // Premium showroom lighting
    scene.add(new T.AmbientLight(0x222240, 2.5));
    [[-8,0],[0,0],[8,0]].forEach(([lx]) => {
      const sp = new T.SpotLight(0xFFFFFF, 50, 35, Math.PI/10, 0.3, 1.2);
      sp.position.set(lx, 12, 2); sp.castShadow=true; sp.shadow.mapSize.set(1024,1024);
      scene.add(sp); sp.target.position.set(lx,0,0); scene.add(sp.target);
      // LED strip glow
      const strip = new T.Mesh(new T.BoxGeometry(2.2,0.06,0.12), new T.MeshBasicMaterial({color:0xFFFFFF}));
      strip.position.set(lx,12,2); scene.add(strip);
    });
    // Dramatic rim / gel lights
    const rimL = new T.SpotLight(0x3355FF, 30, 50, Math.PI/10, 0.2, 1); rimL.position.set(-20,4,10); scene.add(rimL); rimL.target.position.set(-4,0,0); scene.add(rimL.target);
    const rimR = new T.SpotLight(0xFF3311, 25, 50, Math.PI/10, 0.2, 1); rimR.position.set(20,4,10); scene.add(rimR); rimR.target.position.set(4,0,0); scene.add(rimR.target);
    const rimB = new T.SpotLight(0xFFFFFF, 35, 35, Math.PI/9, 0.15, 1); rimB.position.set(0,6,-18); scene.add(rimB); rimB.target.position.set(0,1,0); scene.add(rimB.target);

    // Platform rings with neon blue edge
    [[-8,0],[0,0],[8,0]].forEach(([px]) => {
      const ring = new T.Mesh(new T.CylinderGeometry(2.8,2.8,0.04,64), new T.MeshStandardMaterial({color:0x050510,roughness:0.04,metalness:0.98}));
      ring.position.set(px,0.02,0); scene.add(ring);
      const glow = new T.Mesh(new T.TorusGeometry(2.8,0.05,8,64), new T.MeshBasicMaterial({color:0x4488FF,transparent:true,opacity:0.7}));
      glow.rotation.x = Math.PI/2; glow.position.set(px,0.05,0); scene.add(glow);
    });

    // Procedural cars as instant fallback
    const car1 = makeCar(T, 0x0A0A1E); car1.position.set(0,0.05,0); scene.add(car1); sceneObjs.car1 = car1;
    const car2 = makeCar(T, 0x1A0608); car2.position.set(-8,0.05,1); car2.rotation.y=0.35; scene.add(car2); sceneObjs.car2 = car2;
    const car3 = makeCar(T, 0x1A1A1C); car3.position.set(8,0.05,1); car3.rotation.y=-0.38; scene.add(car3); sceneObjs.car3 = car3;

    // Override GLB materials with premium metallic paint
    const applyMat = (model, hex) => model.traverse(c => {
      if (!c.isMesh) return;
      c.castShadow = c.receiveShadow = true;
      c.material = new T.MeshStandardMaterial({color:hex, metalness:0.92, roughness:0.08});
    });
    loadGLB('/assets/model-car.glb', 4.8, model => {
      if(!scene) return; model.position.set(0,0.05,0); applyMat(model, 0x0D1224);
      scene.remove(car1); scene.add(model); fadeIn(model,1.2); sceneObjs.car1=model;
    });
    loadGLB('/assets/model-car2.glb', 4.2, model => {
      if(!scene) return; model.position.set(-8,0.05,1); model.rotation.y=0.35; applyMat(model, 0x1C0408);
      scene.remove(car2); scene.add(model); fadeIn(model,1.4); sceneObjs.car2=model;
    });
    loadGLB('/assets/model-car.glb', 3.9, model => {
      if(!scene) return; model.position.set(8,0.05,1); model.rotation.y=-0.38; applyMat(model, 0x141416);
      scene.remove(car3); scene.add(model); fadeIn(model,1.4); sceneObjs.car3=model;
    });
    sceneObjs.dAngle = 0;
  }

  function updateDealership() {
    const t = sec();
    // Centre car slow turntable
    if(sceneObjs.car1) sceneObjs.car1.rotation.y += 0.003;
    // Side cars gentle breathe
    if(sceneObjs.car2) sceneObjs.car2.position.y = 0.05 + Math.sin(t*0.6)*0.025;
    if(sceneObjs.car3) sceneObjs.car3.position.y = 0.05 + Math.sin(t*0.6+1.5)*0.025;
    sceneObjs.dAngle = (sceneObjs.dAngle||0) + 0.0003;
    const a = sceneObjs.dAngle;
    camera.position.set(Math.sin(a)*4+tmx*2.5, 2.5+Math.sin(a*0.6)*0.4+tmy*-1, 9.5+Math.cos(a*0.8)*0.8);
    camera.lookAt(0, 1.2, 0);
  }

  // ── RESIZE ────────────────────────────────────────────────────
  window.addEventListener('resize', () => {
    if (!renderer || !camera) return;
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });

})();
