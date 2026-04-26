/* ============================================================
   DARUL ARQAM — MAIN SCRIPT
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ── 1. NAVBAR SCROLL EFFECT ─────────────────────────────────
  const nav = document.getElementById('mainNav');
  const backToTop = document.getElementById('backToTop');

  function updateVh() {
    document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
  }
  updateVh();
  window.addEventListener('resize', updateVh);

  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
      backToTop.classList.add('show');
    } else {
      nav.classList.remove('scrolled');
      backToTop.classList.remove('show');
    }

    // Active nav link by section
    highlightNavLink();
  }, { passive: true });

  // ── 2. SMOOTH ACTIVE NAV LINK ────────────────────────────────
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function highlightNavLink() {
    let current = 'home';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  }

  // Close mobile menu on link click
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      const collapse = document.getElementById('navMenu');
      if (collapse.classList.contains('show')) {
        const bsCollapse = new bootstrap.Collapse(collapse, { toggle: false });
        bsCollapse.hide();
      }
    });
  });

  // ── 3. SCROLL REVEAL ─────────────────────────────────────────
  const revealEls = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => observer.observe(el));

  // ── 4. ANIMATED COUNTER ──────────────────────────────────────
  const counters = document.querySelectorAll('.stat-number');
  let counterStarted = false;

  const statsSection = document.getElementById('stats');

  const statsObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !counterStarted) {
      counterStarted = true;
      counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const suffix = counter.getAttribute('data-suffix') || '';
        const duration = 1800;
        const startTime = performance.now();

        function updateCounter(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Ease out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.floor(eased * target);
          counter.textContent = current + suffix;
          if (progress < 1) requestAnimationFrame(updateCounter);
          else counter.textContent = target + suffix;
        }
        requestAnimationFrame(updateCounter);
      });
    }
  }, { threshold: 0.3 });

  if (statsSection) statsObserver.observe(statsSection);

  // ── 5. THREE.JS GLOBE ────────────────────────────────────────
  initGlobe();

  // ── 6. CONTACT FORM ──────────────────────────────────────────
  window.handleContactForm = function(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const original = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check me-2"></i>Message Sent!';
    btn.style.background = '#28a745';
    btn.disabled = true;
    setTimeout(() => {
      btn.innerHTML = original;
      btn.style.background = '';
      btn.disabled = false;
      e.target.reset();
    }, 3000);
  };
});

// ── THREE.JS GLOBE INIT ────────────────────────────────────────
function initGlobe() {
  const canvas = document.getElementById('globeCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const W = 320, H = 320;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W, H);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
  camera.position.set(0, 0, 3);

  // ── Sphere / Globe ──
  const globeGeo = new THREE.SphereGeometry(1, 64, 64);
  const globeMat = new THREE.MeshPhongMaterial({
    color: 0x0056b3,
    emissive: 0x001840,
    specular: 0x88aaff,
    shininess: 40,
    transparent: true,
    opacity: 0.92,
    wireframe: false
  });
  const globe = new THREE.Mesh(globeGeo, globeMat);
  scene.add(globe);

  // ── Wireframe overlay ──
  const wireGeo = new THREE.SphereGeometry(1.005, 24, 24);
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0x4488ff,
    wireframe: true,
    transparent: true,
    opacity: 0.08
  });
  const wire = new THREE.Mesh(wireGeo, wireMat);
  scene.add(wire);

  // ── Glowing ring ──
  const ringGeo = new THREE.TorusGeometry(1.22, 0.012, 8, 120);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xc9a84c, transparent: true, opacity: 0.6 });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2.2;
  scene.add(ring);

  // Second ring tilted
  const ring2 = ring.clone();
  ring2.rotation.z = Math.PI / 3;
  ring2.material = ringMat.clone();
  ring2.material.opacity = 0.3;
  scene.add(ring2);

  // ── Floating particles ──
  const particleCount = 200;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 1.05 + Math.random() * 0.5;
    positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({ color: 0xaaccff, size: 0.018, transparent: true, opacity: 0.5 });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // ── Dot grid on sphere surface ──
  const dotPositions = [];
  for (let lat = -80; lat <= 80; lat += 20) {
    for (let lon = 0; lon < 360; lon += 20) {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = lon * (Math.PI / 180);
      dotPositions.push(
        1.02 * Math.sin(phi) * Math.cos(theta),
        1.02 * Math.cos(phi),
        1.02 * Math.sin(phi) * Math.sin(theta)
      );
    }
  }
  const dotGeo = new THREE.BufferGeometry();
  dotGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(dotPositions), 3));
  const dotMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.025, transparent: true, opacity: 0.35 });
  scene.add(new THREE.Points(dotGeo, dotMat));

  // ── Lighting ──
  const ambient = new THREE.AmbientLight(0x4466aa, 0.6);
  scene.add(ambient);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
  dirLight.position.set(5, 3, 5);
  scene.add(dirLight);

  const rimLight = new THREE.DirectionalLight(0xc9a84c, 0.4);
  rimLight.position.set(-3, -2, -3);
  scene.add(rimLight);

  // ── Mouse drag interaction ──
  let isDragging = false;
  let prevX = 0, prevY = 0;
  let velX = 0, velY = 0;
  let autoRotate = true;

  canvas.addEventListener('mousedown', e => {
    isDragging = true;
    autoRotate = false;
    prevX = e.clientX;
    prevY = e.clientY;
  });

  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const dx = e.clientX - prevX;
    const dy = e.clientY - prevY;
    velX = dx * 0.008;
    velY = dy * 0.008;
    globe.rotation.y += velX;
    globe.rotation.x += velY;
    wire.rotation.y += velX;
    wire.rotation.x += velY;
    particles.rotation.y += velX * 0.3;
    prevX = e.clientX;
    prevY = e.clientY;
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
    setTimeout(() => autoRotate = true, 2000);
  });

  // Touch support
  canvas.addEventListener('touchstart', e => {
    isDragging = true;
    autoRotate = false;
    prevX = e.touches[0].clientX;
    prevY = e.touches[0].clientY;
  }, { passive: true });

  canvas.addEventListener('touchmove', e => {
    if (!isDragging) return;
    const dx = e.touches[0].clientX - prevX;
    const dy = e.touches[0].clientY - prevY;
    velX = dx * 0.008;
    velY = dy * 0.008;
    globe.rotation.y += velX;
    globe.rotation.x += velY;
    wire.rotation.y += velX;
    wire.rotation.x += velY;
    prevX = e.touches[0].clientX;
    prevY = e.touches[0].clientY;
  }, { passive: true });

  canvas.addEventListener('touchend', () => {
    isDragging = false;
    setTimeout(() => autoRotate = true, 2000);
  });

  // ── Animation loop ──
  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.005;

    if (autoRotate) {
      globe.rotation.y += 0.003;
      wire.rotation.y += 0.003;
      ring.rotation.y += 0.005;
    }

    // Apply inertia
    if (!isDragging) {
      velX *= 0.92;
      velY *= 0.92;
      if (Math.abs(velX) > 0.001 || Math.abs(velY) > 0.001) {
        globe.rotation.y += velX;
        globe.rotation.x += velY;
        wire.rotation.y += velX;
        wire.rotation.x += velY;
      }
    }

    // Pulse glow
    globeMat.emissiveIntensity = 0.3 + Math.sin(t * 1.5) * 0.1;
    ring.material.opacity = 0.4 + Math.sin(t * 2) * 0.2;

    particles.rotation.y += 0.001;
    ring2.rotation.y += 0.002;

    renderer.render(scene, camera);
  }
  animate();
}
