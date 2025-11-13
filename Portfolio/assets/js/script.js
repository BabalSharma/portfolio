/* ===========================================================
   assets/js/script.js
   Interactivity for the neon data science portfolio
   - Typing effect
   - Hero sparkline
   - Animated counters
   - Intersection animations & reveals
   - Skill bar fills
   - Project filters + modal
   - Dashboard charts (canvas)
   - Certificates download (fake)
   - Testimonials carousel
   - Contact form validation + faux submit
   =========================================================== */

(function () {
  'use strict';

  /* -------------------------
     Helper selectors & utils
     ------------------------- */
  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => Array.from((ctx || document).querySelectorAll(s));
  const on = (el, evt, fn) => el && el.addEventListener(evt, fn);
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));

  /* -------------------------
     Boot: run on DOM ready
     ------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    initYear();
    initMenu();
    initTyping();
    initHeroSpark();
    initCounters();
    initReveals();
    initSkillBars();
    initFilters();
    initProjectModal();
    initDashboards();
    initCertDownloads();
    initTestimonials();
    initContactForm();
    initThemeToggle();
  });

  /* -------------------------
     Year
     ------------------------- */
  function initYear() {
    const y = new Date().getFullYear();
    $('#site-year') && ($('#site-year').textContent = y);
  }

  /* -------------------------
     Mobile menu toggle
     ------------------------- */
  function initMenu() {
    const menuBtn = $('#menu-toggle');
    const nav = $('#main-nav');
    if (!menuBtn) return;
    menuBtn.addEventListener('click', () => {
      const open = menuBtn.getAttribute('aria-expanded') === 'true';
      menuBtn.setAttribute('aria-expanded', String(!open));
      nav.style.display = open ? 'none' : 'flex';
    });
    // close nav on link click (mobile)
    $$('.main-nav .nav-link').forEach(a => {
      a.addEventListener('click', () => {
        if (window.innerWidth < 800 && nav) nav.style.display = 'none';
      });
    });
  }

  /* -------------------------
     Typing effect (hero)
     ------------------------- */
  function initTyping() {
    const el = $('#typed');
    if (!el) return;
    const phrases = ['data into insights', 'numbers into stories', 'models into production', 'metrics into decisions'];
    let p = 0, i = 0, forward = true;
    const tick = () => {
      const str = phrases[p];
      if (forward) {
        i++;
        el.textContent = str.slice(0, i);
        if (i >= str.length) {
          forward = false;
          setTimeout(tick, 1000);
          return;
        }
      } else {
        i--;
        el.textContent = str.slice(0, i);
        if (i <= 0) {
          forward = true;
          p = (p + 1) % phrases.length;
        }
      }
      setTimeout(tick, forward ? 90 : 40);
    };
    tick();
  }

  /* -------------------------
     Hero sparkline (canvas)
     ------------------------- */
  function initHeroSpark() {
    const canvas = $('#hero-spark');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    const points = [];
    for (let i = 0; i < 36; i++) {
      points.push({ x: (i / 35) * w, y: h * (0.3 + Math.random() * 0.6) });
    }

    // draw once, then animate stroke reveal
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = '#06f2f3';
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();

    // glow overlay (pink)
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = 'rgba(255,102,204,0.08)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
  }

  /* -------------------------
     Animated numeric counters
     ------------------------- */
  function initCounters() {
    const nodes = $$('.meta-value');
    nodes.forEach(node => {
      const target = parseInt(node.getAttribute('data-target') || '0', 10);
      animateNumber(node, target, 1200);
    });

    // big stat counters
    $$('.stat-value').forEach(el => {
      const target = parseInt(el.getAttribute('data-count') || '0', 10);
      animateNumber(el, target, 1400, (v) => `${v}%`);
    });
  }

  function animateNumber(el, target, duration = 1000, format = v => v) {
    const start = performance.now();
    const from = 0;
    const to = target;
    function step(now) {
      const t = clamp((now - start) / duration, 0, 1);
      const eased = easeOutCubic(t);
      const value = Math.round(from + (to - from) * eased);
      el.textContent = format(value);
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function easeOutCubic(t) { return (--t) * t * t + 1; }

  /* -------------------------
     Intersection reveal (fade/slide)
     ------------------------- */
  function initReveals() {
    const reveals = $$('.card, .section, .project, .skill-card, .neon-card, .dash-card');
    reveals.forEach(r => {
      r.style.opacity = 0;
      r.style.transform = 'translateY(18px)';
      r.style.transition = 'opacity .8s cubic-bezier(.2,.9,.25,1), transform .8s cubic-bezier(.2,.9,.25,1)';
    });

    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.style.opacity = 1;
          en.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.12 });

    reveals.forEach(r => io.observe(r));
  }

  /* -------------------------
     Skills bar animation
     ------------------------- */
  function initSkillBars() {
    const skills = $$('.skill-card');
    skills.forEach(sc => {
      const pct = parseInt(sc.getAttribute('data-percent') || '0', 10);
      const fill = sc.querySelector('.skill-fill');
      const percentText = sc.querySelector('.skill-percent');
      // observe and animate
      const io = new IntersectionObserver(entries => {
        entries.forEach(en => {
          if (en.isIntersecting) {
            fill.style.width = pct + '%';
            if (percentText) percentText.textContent = pct + '%';
            io.unobserve(sc);
          }
        });
      }, { threshold: 0.2 });
      io.observe(sc);
    });
  }

  /* -------------------------
     Project filters
     ------------------------- */
  function initFilters() {
    const filterBtns = $$('.filter-btn');
    const cards = $$('.project');

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter');
        cards.forEach(c => {
          const type = c.getAttribute('data-type');
          if (filter === 'all' || filter === type) {
            c.style.display = '';
            setTimeout(() => { c.style.opacity = 1; c.style.transform = 'translateY(0)'; }, 40);
          } else {
            c.style.opacity = 0;
            c.style.transform = 'translateY(10px)';
            setTimeout(() => { c.style.display = 'none'; }, 300);
          }
        });
      });
    });
  }

  /* -------------------------
     Project modal
     ------------------------- */
  function initProjectModal() {
    const modal = $('#modal');
    const modalTitle = $('#modal-title');
    const modalDesc = $('#modal-desc');
    const modalRepo = $('#modal-repo');
    const modalLive = $('#modal-live');
    const modalClose = $('#modal-close');

    $$('.view-project').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const t = e.currentTarget;
        const title = t.dataset.title;
        const desc = t.dataset.desc;
        modalTitle.textContent = title;
        modalDesc.textContent = desc;
        modalRepo.href = '#';
        modalLive.href = '#';
        modal.setAttribute('aria-hidden', 'false');
        setTimeout(() => modal.querySelector('.modal-panel').style.transform = 'translateY(0)', 20);
      });
    });

    modalClose && modalClose.addEventListener('click', () => modal.setAttribute('aria-hidden', 'true'));
    modal.addEventListener('click', (ev) => { if (ev.target === modal) modal.setAttribute('aria-hidden', 'true'); });
    document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') modal.setAttribute('aria-hidden', 'true'); });
  }

  /* -------------------------
     Dashboard charts (vanilla canvas)
     - Line chart
     - Bar chart
     - Sparkline
     ------------------------- */
  function initDashboards() {
    // generate some synthetic but realistic timeseries
    const now = Date.now();
    const timestamps = [];
    for (let i = 0; i < 30; i++) timestamps.push(now - (29 - i) * 24 * 3600 * 1000);

    const perf = timestamps.map((t, i) => 70 + Math.round(10 * Math.sin(i / 3) + Math.random() * 6));
    const importance = [12, 8, 5, 20, 6, 4, 18, 9, 11, 7];
    const spark = new Array(64).fill(0).map((_, i) => 40 + Math.round(18 * Math.sin(i / 5) + Math.random() * 6));

    drawLineChart('lineChart', perf, timestamps);
    drawBarChart('barChart', importance, ['feat_a', 'feat_b', 'feat_c', 'feat_d', 'feat_e', 'feat_f', 'feat_g', 'feat_h', 'feat_i', 'feat_j']);
    drawSparkline('sparkChart', spark);

    // animate updates every few seconds to show live feel
    setInterval(() => {
      // roll perf and push new point
      perf.shift();
      perf.push(70 + Math.round(10 * Math.sin(perf.length / 3) + Math.random() * 6));
      drawLineChart('lineChart', perf, timestamps);
      // mutate spark
      for (let i = 0; i < spark.length; i++) spark[i] = 40 + Math.round(18 * Math.sin((i + Math.random()) / 5) + Math.random() * 6);
      drawSparkline('sparkChart', spark);
    }, 4200);
  }

  // draw a simple line chart on canvas id
  function drawLineChart(id, data, labels) {
    const canvas = document.getElementById(id);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // padding
    const pad = 32;
    const min = Math.min(...data) - 6;
    const max = Math.max(...data) + 6;
    const range = max - min;

    // compute positions
    const stepX = (w - pad * 2) / (data.length - 1);
    const pts = data.map((v, i) => ({ x: pad + i * stepX, y: pad + (1 - (v - min) / range) * (h - pad * 2) }));

    // gradient fill
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, 'rgba(155,92,255,0.14)');
    grad.addColorStop(1, 'rgba(6,182,212,0.02)');

    // area
    ctx.beginPath();
    ctx.moveTo(pts[0].x, h - pad);
    pts.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(pts[pts.length - 1].x, h - pad);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // line
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.strokeStyle = '#06f2f3';
    ctx.lineWidth = 2.6;
    ctx.stroke();

    // points
    for (let p of pts) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.closePath();
    }

    // labels / axes (minimal)
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText(Math.round(min) + '', 6, h - pad + 8);
    ctx.fillText(Math.round(max) + '', 6, pad + 6);
  }

  // draw bar chart
  function drawBarChart(id, data, labels) {
    const canvas = document.getElementById(id);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const pad = 32;
    const max = Math.max(...data) + 6;
    const barW = (w - pad * 2) / data.length - 12;

    data.forEach((v, i) => {
      const x = pad + i * (barW + 12);
      const barH = ((v / max) * (h - pad * 2));
      ctx.fillStyle = `rgba(155,92,255,0.12)`;
      ctx.fillRect(x, h - pad - barH, barW, barH);
      // neon outline
      ctx.strokeStyle = '#06f2f3';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, h - pad - barH, barW, barH);
      // label
      ctx.fillStyle = '#dfe9ff';
      ctx.font = '11px Inter, sans-serif';
      ctx.fillText(labels[i] || `f${i}`, x, h - pad + 14);
    });
  }

  // sparkline (small)
  function drawSparkline(id, arr) {
    const canvas = document.getElementById(id);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const pad = 6;
    const min = Math.min(...arr);
    const max = Math.max(...arr);
    const range = max - min || 1;
    const stepX = (w - pad * 2) / (arr.length - 1);
    ctx.beginPath();
    for (let i = 0; i < arr.length; i++) {
      const x = pad + i * stepX;
      const y = pad + (1 - (arr[i] - min) / range) * (h - pad * 2);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#ff66cc';
    ctx.lineWidth = 1.8;
    ctx.stroke();
  }

  /* -------------------------
     Certificate download (fake)
     ------------------------- */
  function initCertDownloads() {
    $$('.download-cert').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const file = e.currentTarget.getAttribute('data-file') || 'certificate.pdf';
        // create a tiny blob to simulate download
        const blob = new Blob([`Certificate: ${file}\nIssued to Your Name\nThis is a placeholder.`], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = file;
        document.body.appendChild(link);
        link.click();
        link.remove();
      });
    });
  }

  /* -------------------------
     Testimonials carousel
     ------------------------- */
  function initTestimonials() {
    const cards = $$('#test-carousel .test-card');
    let idx = 0;
    const show = (i) => {
      cards.forEach((c, j) => c.classList.toggle('active', i === j));
    };
    show(idx);
    $('#test-next').addEventListener('click', () => { idx = (idx + 1) % cards.length; show(idx); });
    $('#test-prev').addEventListener('click', () => { idx = (idx - 1 + cards.length) % cards.length; show(idx); });
    // auto cycle
    setInterval(() => { idx = (idx + 1) % cards.length; show(idx); }, 6000);
  }

  /* -------------------------
     Contact form (client-side)
     ------------------------- */
  function initContactForm() {
    const form = $('#contact-form');
    if (!form) return;
    const status = $('#form-status');

    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      // honeypot anti-bot
      const honeypot = $('#honeypot').value;
      if (honeypot) {
        status.textContent = 'Spam detected.';
        return;
      }
      const name = $('#cf-name').value.trim();
      const email = $('#cf-email').value.trim();
      const message = $('#cf-message').value.trim();
      if (!name || !email || !message) {
        status.textContent = 'Please fill all fields.';
        return;
      }
      status.textContent = 'Sending...';
      setTimeout(() => {
        status.textContent = 'Message sent — I will get back to you soon!';
        form.reset();
      }, 900);
    });
  }

  /* -------------------------
     Theme toggle (persistence)
     ------------------------- */
  function initThemeToggle() {
    const btn = $('#theme-toggle');
    if (!btn) return;
    const root = document.documentElement;
    const stored = localStorage.getItem('theme') || 'dark';
    setTheme(stored);

    btn.addEventListener('click', () => {
      const current = localStorage.getItem('theme') || 'dark';
      setTheme(current === 'dark' ? 'light' : 'dark');
    });

    function setTheme(t) {
      localStorage.setItem('theme', t);
      if (t === 'dark') {
        document.body.classList.add('theme-dark');
        btn.textContent = '🖤';
      } else {
        document.body.classList.remove('theme-dark');
        btn.textContent = '☀️';
      }
    }
  }

  /* --------------------------------------------------
     Small utilities & polyfills (if needed)
     -------------------------------------------------- */
  // No polyfills required for modern browsers; keep minimal.

})();
