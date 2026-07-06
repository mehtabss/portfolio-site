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
      '<p class="gate-hint">press enter to continue</p>';
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

  /* ---------- twinkling star field ---------- */
  if (!prefersReduced && !document.querySelector('.stars-bg')) {
    var starsContainer = document.createElement('div');
    starsContainer.className = 'stars-bg';
    starsContainer.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(starsContainer, document.body.firstChild);

    var starPath = 'M12 0 C12.8 6.5 13.5 9.5 24 12 C13.5 14.5 12.8 17.5 12 24 ' +
      'C11.2 17.5 10.5 14.5 0 12 C10.5 9.5 11.2 6.5 12 0 Z';
    var starCount = window.innerWidth < 640 ? 30 : 55;
    var svgNS = 'http://www.w3.org/2000/svg';

    for (var i = 0; i < starCount; i++) {
      var star = document.createElementNS(svgNS, 'svg');
      star.setAttribute('viewBox', '0 0 24 24');
      star.classList.add('twinkle-star');

      var size = (Math.random() * 6 + 4).toFixed(1);
      star.style.width = size + 'px';
      star.style.height = size + 'px';
      star.style.left = (Math.random() * 100).toFixed(2) + '%';
      star.style.top = (Math.random() * 100).toFixed(2) + '%';
      star.style.animationDelay = (Math.random() * 6).toFixed(2) + 's';
      star.style.animationDuration = (Math.random() * 3 + 2.5).toFixed(2) + 's';

      var path = document.createElementNS(svgNS, 'path');
      path.setAttribute('d', starPath);
      path.setAttribute('fill', 'currentColor');
      star.appendChild(path);
      starsContainer.appendChild(star);
    }
  }

  /* ---------- copy email on click ---------- */
  var emailLink = document.getElementById('email-link');
  if (emailLink) {
    emailLink.addEventListener('click', function (e) {
      var email = emailLink.getAttribute('data-email');
      if (navigator.clipboard && email) {
        e.preventDefault();
        navigator.clipboard.writeText(email).then(function () {
          var original = emailLink.textContent;
          emailLink.textContent = 'Copied to clipboard!';
          emailLink.classList.add('is-copied');
          setTimeout(function () {
            emailLink.textContent = original;
            emailLink.classList.remove('is-copied');
          }, 1600);
        });
      }
      /* if clipboard API isn't available, the mailto: link still fires normally */
    });
  }
})();