(function () {
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isFinePointer = window.matchMedia('(pointer: fine)').matches;

  /* ---------- glitch scroll reveal ---------- */
  var revealables = document.querySelectorAll(
    '.project-card, .about-text, .contact-links, .notebook-card, .gallery-item'
  );
  revealables.forEach(function (el) { el.classList.add('reveal-item'); });

  if (!prefersReduced && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealables.forEach(function (el) { observer.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- entry gate (plays once per browser session) ---------- */
  var gateKey = 'ms-gate-opened';
  var alreadyOpened = sessionStorage.getItem(gateKey);

  if (!alreadyOpened && !prefersReduced) {
    var gate = document.createElement('div');
    gate.className = 'gate';
    gate.innerHTML =
      '<div class="gate-noise" aria-hidden="true"></div>' +
      '<p class="gate-label">SYSTEM LOCKED</p>' +
      '<button type="button" class="gate-button" data-text="ENTER">ENTER</button>' +
      '<p class="gate-hint">click, or press enter, to continue</p>';
    document.body.appendChild(gate);
    document.body.classList.add('gate-active');

    var opened = false;
    function openGate() {
      if (opened) return;
      opened = true;
      gate.classList.add('is-hiding');
      document.body.classList.remove('gate-active');
      sessionStorage.setItem(gateKey, '1');
      window.removeEventListener('keydown', onKey);
      setTimeout(function () { gate.remove(); }, 450);
    }
    function onKey(e) {
      if (e.key === 'Enter' || e.key === ' ') openGate();
    }

    gate.querySelector('.gate-button').addEventListener('click', openGate);
    window.addEventListener('keydown', onKey);
  } else {
    sessionStorage.setItem(gateKey, '1');
  }

  /* ---------- custom cursor + ambient light ---------- */
  if (isFinePointer && !prefersReduced) {
    var dot = document.createElement('div');
    dot.className = 'cursor-dot';
    var ring = document.createElement('div');
    ring.className = 'cursor-ring';
    var glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);
    document.body.appendChild(ring);
    document.body.appendChild(dot);
    document.body.classList.add('has-custom-cursor');

    var mx = window.innerWidth / 2;
    var my = window.innerHeight / 2;
    var rx = mx;
    var ry = my;
    var ready = false;

    window.addEventListener('pointermove', function (e) {
      mx = e.clientX;
      my = e.clientY;
      if (!ready) {
        ready = true;
        document.body.classList.add('cursor-ready');
      }
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%, -50%)';
      glow.style.setProperty('--mx', mx + 'px');
      glow.style.setProperty('--my', my + 'px');
    });

    function loop() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%, -50%)';
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    document.addEventListener('mouseleave', function () {
      document.body.classList.remove('cursor-ready');
    });
    document.addEventListener('mouseenter', function () {
      if (mx !== window.innerWidth / 2 || my !== window.innerHeight / 2) {
        document.body.classList.add('cursor-ready');
      }
    });

    var hoverSelector = 'a, button, .project-card, .notebook-card';
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest(hoverSelector)) document.body.classList.add('cursor-hover');
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest(hoverSelector)) document.body.classList.remove('cursor-hover');
    });
  }
})();