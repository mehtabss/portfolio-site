(function () {
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isFinePointer = window.matchMedia('(pointer: fine)').matches;

  /* ---------- scroll reveal ---------- */
  if (!prefersReduced && 'IntersectionObserver' in window) {
    var revealables = document.querySelectorAll(
      '.project-card, .about-text, .contact-links, .notebook-card, .gallery-item'
    );
    revealables.forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(14px)';
      el.style.transition = 'opacity .6s ease, transform .6s ease';
    });
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealables.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- intro sequence (plays once per browser session) ---------- */
  var introKey = 'ms-intro-played';
  var alreadyPlayed = sessionStorage.getItem(introKey);

  if (!alreadyPlayed && !prefersReduced) {
    var loader = document.createElement('div');
    loader.className = 'intro-loader';
    loader.innerHTML =
      '<div class="intro-mark">MS</div>' +
      '<div class="intro-line"></div>' +
      '<button class="intro-skip" type="button">Skip</button>';
    document.body.appendChild(loader);
    document.body.classList.add('intro-active');

    var finished = false;
    function finishIntro() {
      if (finished) return;
      finished = true;
      loader.classList.add('is-hiding');
      document.body.classList.remove('intro-active');
      sessionStorage.setItem(introKey, '1');
      window.removeEventListener('keydown', finishIntro);
      setTimeout(function () { loader.remove(); }, 500);
    }

    loader.querySelector('.intro-skip').addEventListener('click', finishIntro);
    window.addEventListener('keydown', finishIntro);
    setTimeout(finishIntro, 1500);
  } else {
    sessionStorage.setItem(introKey, '1');
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
      dot.style.transform = 'translate(' + (mx - 4) + 'px,' + (my - 4) + 'px)';
      glow.style.setProperty('--mx', mx + 'px');
      glow.style.setProperty('--my', my + 'px');
    });

    function loop() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = 'translate(' + (rx - 16) + 'px,' + (ry - 16) + 'px)';
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