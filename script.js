document.getElementById('year').textContent = new Date().getFullYear();

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReduced && 'IntersectionObserver' in window) {
  const revealables = document.querySelectorAll('.project-card, .about-text, .contact-links');

  revealables.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(10px)';
    el.style.transition = 'opacity .5s ease, transform .5s ease';
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealables.forEach(el => observer.observe(el));
}
