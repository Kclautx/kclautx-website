/* KclautX service-page interactions (shared by crypto / giftcards / bills) */
(function () {
  // current year in footer
  document.querySelectorAll('.footYear').forEach(function (e) { e.textContent = new Date().getFullYear(); });

  var nav = document.getElementById('nav');

  // sticky glass border on scroll
  function onScroll() { if (nav) nav.classList.toggle('scrolled', window.scrollY > 8); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // mobile nav toggle
  (function () {
    var toggle = document.getElementById('navToggle');
    var links = document.getElementById('navLinks');
    if (!toggle || !links || !nav) return;
    function close() { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', close); });
    document.addEventListener('click', function (e) { if (!nav.contains(e.target)) close(); });
  })();

  // scroll-reveal
  (function () {
    var els = document.querySelectorAll('[data-reveal]');
    els.forEach(function (el, i) { if (!el.style.getPropertyValue('--rd')) el.style.setProperty('--rd', (i % 4) * 80 + 'ms'); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { io.observe(el); });
  })();

  // section-head gradient sweep
  (function () {
    var heads = document.querySelectorAll('.section-head');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.3 });
    heads.forEach(function (h) { io.observe(h); });
  })();

  // steps: active step follows scroll (mobile timeline)
  (function () {
    var mobileMq = window.matchMedia('(max-width: 520px)');
    var steps = Array.prototype.slice.call(document.querySelectorAll('.steps-grid .step'));
    if (!steps.length) return;
    function update() {
      if (!mobileMq.matches) { steps.forEach(function (s) { s.classList.remove('active'); }); return; }
      var target = window.innerHeight * 0.48, best = -1, bestDist = Infinity;
      steps.forEach(function (s, i) {
        var r = s.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        var d = Math.abs((r.top + r.height / 2) - target);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      steps.forEach(function (s, i) { s.classList.toggle('active', i === best); });
    }
    var raf = null;
    function schedule() { if (raf) return; raf = requestAnimationFrame(function () { update(); raf = null; }); }
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    update();
  })();

  // testimonial carousel (reads global KX_QUOTES)
  (function () {
    var quotes = window.KX_QUOTES;
    if (!quotes || !quotes.length) return;
    var qi = 0;
    var qText = document.getElementById('quoteText');
    var qName = document.getElementById('quoteName');
    var qRole = document.getElementById('quoteRole');
    var qAvatar = document.getElementById('quoteAvatar');
    var prev = document.getElementById('prevQuote');
    var next = document.getElementById('nextQuote');
    if (!qText) return;
    function paintAvatar(q) {
      if (!qAvatar) return;
      if (q.img) { qAvatar.style.backgroundImage = 'url("' + q.img + '")'; qAvatar.style.backgroundSize = 'cover'; qAvatar.style.backgroundPosition = 'center'; }
      else { qAvatar.style.backgroundImage = ''; qAvatar.style.background = q.grad || 'linear-gradient(135deg,#c8a085,#7a5a45)'; }
    }
    paintAvatar(quotes[0]);
    function show(i) {
      qText.classList.add('fade');
      setTimeout(function () {
        var q = quotes[i];
        qText.textContent = q.text;
        if (qName) qName.textContent = q.name;
        if (qRole) qRole.textContent = q.role;
        paintAvatar(q);
        qText.classList.remove('fade');
      }, 200);
    }
    if (prev) prev.addEventListener('click', function () { qi = (qi - 1 + quotes.length) % quotes.length; show(qi); });
    if (next) next.addEventListener('click', function () { qi = (qi + 1) % quotes.length; show(qi); });
  })();

  // magnetic primary buttons
  (function () {
    if (matchMedia('(hover:none)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.querySelectorAll('.btn-primary, .cta-btn').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        btn.style.transform = 'translate(' + (e.clientX - (r.left + r.width / 2)) * 0.18 + 'px,' + (e.clientY - (r.top + r.height / 2)) * 0.25 + 'px)';
      });
      btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
    });
  })();

  // smooth scroll for in-page anchors
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length > 1) {
        var el = document.querySelector(id);
        if (el) { e.preventDefault(); window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' }); }
      }
    });
  });
})();
