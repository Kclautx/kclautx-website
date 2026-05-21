// ============ KclautX MODERN LAYER ============
(function(){
  // Curtain on load
  const curtain = document.createElement('div');
  curtain.className = 'curtain';
  curtain.innerHTML = '<div class="mark"></div>';
  document.body.appendChild(curtain);
  setTimeout(() => curtain.remove(), 1100);

  // Scroll progress bar
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.appendChild(bar);
  const updateBar = () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = h ? Math.min(100, (window.scrollY / h) * 100) + '%' : '0%';
  };
  window.addEventListener('scroll', updateBar, { passive: true });
  updateBar();

  // Spotlight cursor for [data-spotlight] elements
  document.querySelectorAll('[data-spotlight]').forEach(el => {
    el.classList.add('spotlight');
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      el.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
    });
  });

  // 3D tilt for [data-tilt]
  if (!matchMedia('(hover:none)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('[data-tilt]').forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(800px) rotateY(${px * 8}deg) rotateX(${-py * 8}deg) translateZ(0)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }
})();
