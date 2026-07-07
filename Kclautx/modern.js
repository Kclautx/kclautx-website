// ============ KclautX MODERN LAYER ============
(function(){
  // ---- Google Tag Manager ----
  // Set GTM_ID to your container (e.g. 'GTM-XXXXXXX') to enable site-wide tracking.
  // GA4 is configured inside the GTM container — no extra code needed here.
  // Left blank so nothing loads until a real container ID is provided.
  var GTM_ID = '';
  window.dataLayer = window.dataLayer || [];
  if (GTM_ID) {
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
      var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
      j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer',GTM_ID);
  }
  // Push a dataLayer event for any element with data-gtm-event (e.g. app store buttons).
  document.addEventListener('click', function(e){
    var t = e.target && e.target.closest ? e.target.closest('[data-gtm-event]') : null;
    if (!t) return;
    window.dataLayer.push({ event: t.getAttribute('data-gtm-event'), store: t.getAttribute('data-store') || undefined });
  });

  // ---- Google Analytics 4 (gtag.js) ----
  // Loaded here so every page that includes modern.js is tracked from one place.
  // NOTE: if you later enable GTM above, configure GA4 inside the container and
  // clear GA4_ID here to avoid double-counting.
  var GA4_ID = 'G-EEDTGED9H1';
  if (GA4_ID) {
    var ga = document.createElement('script');
    ga.async = true;
    ga.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_ID;
    document.head.appendChild(ga);
    window.gtag = window.gtag || function(){ dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', GA4_ID);
  }

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

// ============ Cursor glow (site-wide, matches landing page) ============
(function(){
  if (matchMedia('(hover:none)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Inject the glow styles once, so every page behaves the same even if it
  // doesn't link the shared stylesheet.
  if (!document.getElementById('kx-cursor-glow-css')) {
    var st = document.createElement('style');
    st.id = 'kx-cursor-glow-css';
    st.textContent =
      '.cursor-glow{position:fixed;left:0;top:0;pointer-events:none;z-index:9999;' +
      'width:520px;height:520px;border-radius:50%;' +
      'background:radial-gradient(circle, rgba(47,125,251,.18) 0%, rgba(47,125,251,.06) 35%, transparent 70%);' +
      'transform:translate(-50%,-50%);transition:opacity .3s, transform .15s ease-out;' +
      'mix-blend-mode:multiply;opacity:0}' +
      '.cursor-glow.on{opacity:1}' +
      '@media (hover:none){.cursor-glow{display:none}}';
    document.head.appendChild(st);
  }

  // If a page already created its own glow (e.g. the homepage inline script),
  // don't add a second one.
  if (document.querySelector('.cursor-glow')) return;

  var g = document.createElement('div');
  g.className = 'cursor-glow';
  document.body.appendChild(g);
  var x = 0, y = 0, tx = 0, ty = 0;
  document.addEventListener('mousemove', function(e){ tx = e.clientX; ty = e.clientY; g.classList.add('on'); });
  document.addEventListener('mouseleave', function(){ g.classList.remove('on'); });
  (function loop(){
    x += (tx - x) * 0.15; y += (ty - y) * 0.15;
    g.style.transform = 'translate(' + x + 'px,' + y + 'px) translate(-50%,-50%)';
    requestAnimationFrame(loop);
  })();
})();

// ============ Cookie consent ============
(function(){
  const KEY = 'kx_cookie_consent', VER = 1;

  // Load any prior choice
  let saved = null;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw){ const d = JSON.parse(raw); if (d && d.v === VER && d.categories) saved = d; }
  } catch(e){}

  // Current consent state (essential is always on and cannot be turned off)
  const state = Object.assign(
    { essential: true, analytics: false, functional: false },
    saved ? saved.categories : {}
  );
  state.essential = true;

  // Expose current consent + notify listeners (analytics scripts can gate on this)
  function broadcast(){
    window.kxConsent = Object.assign({}, state);
    try { document.dispatchEvent(new CustomEvent('kx:cookie-consent', { detail: window.kxConsent })); } catch(e){}
  }
  function persist(){
    try { localStorage.setItem(KEY, JSON.stringify({ v: VER, ts: new Date().toISOString(), categories: state })); } catch(e){}
    broadcast();
  }
  broadcast(); // before consent this is essential-only

  // ---- Banner UI ----
  let banner = null;

  const cookieIcon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a9 9 0 1 0 9 9 4 4 0 0 1-5-5 4 4 0 0 1-4-4Z"/><circle cx="9" cy="11" r="1" fill="currentColor" stroke="none"/><circle cx="13.5" cy="14.5" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="9" r="1" fill="currentColor" stroke="none"/></svg>';

  function sw(cat, checked, disabled){
    return '<button type="button" class="kx-sw" role="switch" data-cat="' + cat + '" aria-checked="'
      + (checked ? 'true' : 'false') + '"' + (disabled ? ' disabled aria-disabled="true"' : '')
      + ' aria-label="' + cat + ' cookies"></button>';
  }
  function row(cat, title, desc, disabled){
    return '<div class="kx-cc__row"><div><h6>' + title + '</h6><p>' + desc + '</p></div>'
      + sw(cat, !!state[cat], !!disabled) + '</div>';
  }

  function ensureBanner(){
    if (banner) return banner;
    banner = document.createElement('section');
    banner.className = 'kx-cc';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.innerHTML =
        '<h2 class="kx-cc__title">' + cookieIcon + ' We use cookies</h2>'
      + '<p class="kx-cc__text">We use cookies to keep KclautX secure, remember your preferences, and understand how the platform is used. Non-essential cookies are only set with your consent. Read our <a href="/cookie">Cookie Policy</a>.</p>'
      + '<div class="kx-cc__prefs">'
        + row('essential', 'Strictly necessary', 'Required for security, authentication, and core platform functionality. Always on.', true)
        + row('analytics', 'Analytics &amp; Performance', 'Help us understand how the platform is used and improve reliability.', false)
        + row('functional', 'Functional', 'Remember preferences such as language, region, and display settings.', false)
      + '</div>'
      + '<div class="kx-cc__actions">'
        + '<button type="button" class="kx-cc__btn kx-cc__btn--primary" data-act="accept">Accept all</button>'
        + '<button type="button" class="kx-cc__btn kx-cc__btn--ghost" data-act="reject">Reject non-essential</button>'
        + '<button type="button" class="kx-cc__btn kx-cc__btn--text" data-act="customize">Customize</button>'
        + '<button type="button" class="kx-cc__btn kx-cc__btn--primary" data-act="save" style="display:none">Save preferences</button>'
      + '</div>';
    banner.addEventListener('click', onClick);
    document.body.appendChild(banner);
    return banner;
  }

  function saveMode(on){
    banner.querySelector('[data-act="save"]').style.display = on ? '' : 'none';
    banner.querySelector('[data-act="customize"]').style.display = on ? 'none' : '';
  }
  function syncSwitches(){
    banner.querySelectorAll('.kx-sw[data-cat]').forEach(s => {
      const cat = s.getAttribute('data-cat');
      if (cat === 'essential') return;
      s.setAttribute('aria-checked', state[cat] ? 'true' : 'false');
    });
  }
  function open(prefs){
    ensureBanner();
    syncSwitches();
    banner.classList.toggle('show-prefs', !!prefs);
    saveMode(!!prefs);
    requestAnimationFrame(() => banner.classList.add('in'));
  }
  function close(){ if (banner) banner.classList.remove('in'); }

  function onClick(e){
    const toggle = e.target.closest('.kx-sw');
    if (toggle && !toggle.disabled){
      toggle.setAttribute('aria-checked', toggle.getAttribute('aria-checked') === 'true' ? 'false' : 'true');
      return;
    }
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const act = btn.getAttribute('data-act');
    if (act === 'accept'){ state.analytics = true; state.functional = true; persist(); close(); }
    else if (act === 'reject'){ state.analytics = false; state.functional = false; persist(); close(); }
    else if (act === 'customize'){ banner.classList.add('show-prefs'); saveMode(true); }
    else if (act === 'save'){
      banner.querySelectorAll('.kx-sw[data-cat]').forEach(s => {
        const cat = s.getAttribute('data-cat');
        if (cat === 'essential') return;
        state[cat] = s.getAttribute('aria-checked') === 'true';
      });
      persist(); close();
    }
  }

  // Public hook so a footer link (or future UI) can reopen the manager
  window.kxOpenCookieSettings = () => open(true);

  // Add a "Cookie Preferences" link into every footer bottom bar
  document.querySelectorAll('.foot-bottom-links').forEach(c => {
    if (c.querySelector('.kx-cookie-prefs')) return;
    const a = document.createElement('a');
    a.href = '#'; a.className = 'kx-cookie-prefs'; a.textContent = 'Cookie Preferences';
    a.addEventListener('click', (e) => { e.preventDefault(); open(true); });
    c.appendChild(a);
  });

  // Show to first-time visitors only, after the page-load curtain clears
  if (!saved) setTimeout(() => open(false), 1250);
})();

// ============ Gleap support widget ============
// Loads the Gleap SDK site-wide (floating support / feedback button).
(function(){
  if (!(window.Gleap = window.Gleap || []).invoked){
    window.GleapActions = [];
    const proxy = new Proxy({ invoked: true }, {
      get: function(e, n){
        return n === 'invoked' ? e.invoked : function(){
          window.GleapActions.push({ e: n, a: Array.prototype.slice.call(arguments) });
        };
      },
      set: function(e, n, t){ e[n] = t; return true; }
    });
    window.Gleap = proxy;
    const head = document.getElementsByTagName('head')[0];
    const t = document.createElement('script');
    t.type = 'text/javascript'; t.async = true; t.src = 'https://sdk.gleap.io/latest/index.js';
    head.appendChild(t);
    window.Gleap.initialize('0WaVq9QFBzKICtBBUiNs2HnFgLZzpVcW');
  }
})();
