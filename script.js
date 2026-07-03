'use strict';

/* ==========================================================================
   ORBITLY — script.js
   Vanilla JS only. Organized as small modules (IIFE) that each check for
   the DOM nodes they need before running, so this single file works safely
   across index.html, auth.html, dashboard.html and 404.html.
   ========================================================================== */

/* ---------- Utilities ---------- */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/** Escape any string before inserting into HTML — basic XSS guard. */
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = String(str ?? '');
  return div.innerHTML;
}

/** Read/write JSON safely to localStorage. */
const store = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch { return false; }
  },
  remove(key) { localStorage.removeItem(key); }
};

/** SHA-256 hash (Web Crypto) — used only to avoid storing raw passwords
 *  in localStorage for the demo. This is NOT equivalent to a real,
 *  server-side authentication system. */
async function sha256(text) {
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

/* ---------- Toast Notifications ---------- */
function toast(message, type = 'info', duration = 3800) {
  const stack = $('#toastStack');
  if (!stack) return;
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.setAttribute('role', 'status');
  el.textContent = message;
  stack.appendChild(el);
  setTimeout(() => {
    el.classList.add('leaving');
    setTimeout(() => el.remove(), 320);
  }, duration);
}

/* ---------- Loading Screen ---------- */
(function loadingScreen() {
  const screen = $('#loading-screen');
  if (!screen) return;
  const hide = () => screen.classList.add('hidden');
  window.addEventListener('load', () => setTimeout(hide, 350));
  // Safety net in case 'load' already fired or takes too long.
  setTimeout(hide, 2500);
})();

/* ---------- Theme (Dark / Light) ---------- */
const Theme = (function themeModule() {
  const KEY = 'orbitly:theme';

  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#f5f4fb' : '#0b0e1a');
  }

  function get() {
    return store.get(KEY) || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  }

  function toggle() {
    const next = get() === 'dark' ? 'light' : 'dark';
    store.set(KEY, next);
    apply(next);
    syncSettingsCheckbox(next);
    return next;
  }

  function syncSettingsCheckbox(theme) {
    const box = $('#settingDarkMode');
    if (box) box.checked = theme === 'dark';
  }

  apply(get());

  document.addEventListener('DOMContentLoaded', () => {
    syncSettingsCheckbox(get());
    ['#themeToggle', '#themeToggleDash'].forEach(sel => {
      const btn = $(sel);
      if (btn) btn.addEventListener('click', toggle);
    });
    const settingBox = $('#settingDarkMode');
    if (settingBox) {
      settingBox.addEventListener('change', () => {
        const next = settingBox.checked ? 'dark' : 'light';
        store.set(KEY, next);
        apply(next);
      });
    }
  });

  return { get, toggle, apply };
})();

/* ---------- Mobile Navbar ---------- */
(function mobileNav() {
  const btn = $('#hamburger');
  const navbar = $('#navbar');
  if (!btn || !navbar) return;
  btn.addEventListener('click', () => {
    const open = navbar.classList.toggle('menu-open');
    btn.setAttribute('aria-expanded', String(open));
  });
  $$('.nav-links a').forEach(a => a.addEventListener('click', () => {
    navbar.classList.remove('menu-open');
    btn.setAttribute('aria-expanded', 'false');
  }));
})();

/* ---------- Cursor Glow ---------- */
(function cursorGlow() {
  const glow = $('#cursorGlow');
  if (!glow || window.matchMedia('(hover: none)').matches) return;
  window.addEventListener('pointermove', (e) => {
    glow.style.left = `${e.clientX}px`;
    glow.style.top = `${e.clientY}px`;
    glow.classList.add('active');
  });
  window.addEventListener('pointerleave', () => glow.classList.remove('active'));
})();

/* ---------- Scroll Reveal ---------- */
(function scrollReveal() {
  const items = $$('.reveal');
  if (!items.length) return;
  if (!('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('in-view'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  items.forEach(el => io.observe(el));
})();

/* ---------- Ripple Effect on .ripple buttons ---------- */
(function rippleEffect() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.ripple');
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const circle = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    circle.className = 'ripple-circle';
    circle.style.width = circle.style.height = `${size}px`;
    circle.style.left = `${e.clientX - rect.left - size / 2}px`;
    circle.style.top = `${e.clientY - rect.top - size / 2}px`;
    btn.appendChild(circle);
    setTimeout(() => circle.remove(), 650);
  });
})();

/* ---------- Animated Stat Counters ---------- */
(function statCounters() {
  const nums = $$('.stat-num[data-count]');
  if (!nums.length) return;
  const animate = (el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    const duration = 1400;
    const start = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target).toLocaleString('id-ID');
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { animate(entry.target); io.unobserve(entry.target); }
    });
  }, { threshold: 0.6 });
  nums.forEach(el => io.observe(el));
})();

/* ---------- Live Hero Stat ---------- */
(function liveStat() {
  const el = $('#liveStat');
  if (!el) return;
  let val = 128;
  setInterval(() => {
    val += Math.floor(Math.random() * 3);
    el.textContent = val.toLocaleString('id-ID');
  }, 4000);
})();

/* ---------- FAQ Accordion ---------- */
(function faqAccordion() {
  $$('.faq-question').forEach(btn => {
    const answer = btn.nextElementSibling;
    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      // Close all others (single-open accordion)
      $$('.faq-question').forEach(other => {
        other.setAttribute('aria-expanded', 'false');
        other.nextElementSibling.style.maxHeight = '';
      });
      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = `${answer.scrollHeight}px`;
      }
    });
  });
})();

/* ---------- Contact Form (validated, XSS-safe) ---------- */
(function contactForm() {
  const form = $('#contactForm');
  if (!form) return;

  function showError(input, message) {
    input.classList.toggle('invalid', Boolean(message));
    const err = $(`.field-error[data-for="${input.id}"]`);
    if (err) err.textContent = message || '';
  }

  function validate() {
    let ok = true;
    const name = $('#cf-name', form);
    const email = $('#cf-email', form);
    const message = $('#cf-message', form);

    if (!name.value.trim() || name.value.trim().length < 2) {
      showError(name, 'Nama minimal 2 karakter.'); ok = false;
    } else showError(name, '');

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.value.trim())) {
      showError(email, 'Masukkan email yang valid.'); ok = false;
    } else showError(email, '');

    if (!message.value.trim() || message.value.trim().length < 10) {
      showError(message, 'Pesan minimal 10 karakter.'); ok = false;
    } else showError(message, '');

    return ok;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // Honeypot anti-bot field — if filled, silently drop.
    const honeypot = $('input[name="website"]', form);
    if (honeypot && honeypot.value) return;

    if (!validate()) {
      toast('Periksa kembali isian formulir.', 'error');
      return;
    }
    // No paid backend: store message locally as a working demo of the flow.
    const messages = store.get('orbitly:contact-messages', []);
    messages.push({
      name: escapeHTML($('#cf-name', form).value.trim()),
      email: escapeHTML($('#cf-email', form).value.trim()),
      message: escapeHTML($('#cf-message', form).value.trim()),
      date: new Date().toISOString()
    });
    store.set('orbitly:contact-messages', messages);
    form.reset();
    toast('Pesan terkirim! Kami akan segera menghubungi Anda.', 'success');
  });

  $$('input, textarea', form).forEach(input => {
    input.addEventListener('blur', validate);
  });
})();

/* ---------- Back To Top ---------- */
(function backToTop() {
  const btn = $('#backToTop');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 500);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

/* ---------- Share & Copy Link ---------- */
(function shareLink() {
  const shareBtn = $('#shareBtn');
  const copyBtn = $('#copyLinkBtn');

  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      const shareData = { title: document.title, text: 'Lihat Orbitly — atur alur kerja timmu.', url: location.href };
      if (navigator.share) {
        try { await navigator.share(shareData); }
        catch { /* user cancelled — no action needed */ }
      } else {
        toast('Berbagi langsung tidak didukung di perangkat ini. Tautan disalin sebagai gantinya.', 'info');
        copyToClipboard(location.href);
      }
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', () => copyToClipboard(location.href));
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      toast('Tautan disalin ke clipboard.', 'success');
    } catch {
      toast('Gagal menyalin tautan.', 'error');
    }
  }
})();

/* ---------- Keyboard Shortcuts ---------- */
(function keyboardShortcuts() {
  const hint = $('#kbdHint');
  if (hint) {
    setTimeout(() => hint.classList.add('show'), 1500);
    setTimeout(() => hint.classList.remove('show'), 6000);
  }

  let lastKey = '';
  let lastKeyTime = 0;

  document.addEventListener('keydown', (e) => {
    const tag = document.activeElement?.tagName;
    const typing = tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable;

    if (e.key === 'Escape') {
      $$('.notif-panel:not([hidden])').forEach(p => p.hidden = true);
      $('#navbar')?.classList.remove('menu-open');
      $('#dashSidebar')?.classList.remove('open');
      return;
    }

    if (typing) return;

    if (e.key === '/') {
      const search = $('#taskSearch');
      if (search) { e.preventDefault(); search.focus(); }
    }

    const now = Date.now();
    if (lastKey === 'g' && (now - lastKeyTime) < 700) {
      if (e.key.toLowerCase() === 'h') { location.href = '/'; }
      if (e.key.toLowerCase() === 'd') { location.href = '/dashboard.html'; }
    }
    lastKey = e.key.toLowerCase();
    lastKeyTime = now;
  });
})();

/* ---------- PWA: Install Prompt + Service Worker ---------- */
(function pwa() {
  let deferredPrompt = null;
  const installBtn = $('#installBtn');

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) installBtn.hidden = false;
  });

  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (!deferredPrompt) {
        toast('Aplikasi sudah terpasang atau tidak tersedia untuk diinstal di browser ini.', 'info');
        return;
      }
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') toast('Orbitly berhasil diinstal!', 'success');
      deferredPrompt = null;
      installBtn.hidden = true;
    });
  }

  window.addEventListener('appinstalled', () => {
    if (installBtn) installBtn.hidden = true;
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js').catch(() => {
        /* offline support degrades gracefully if registration fails */
      });
    });
  }

  if (!navigator.onLine) {
    toast('Kamu sedang offline. Beberapa data mungkin tidak terbaru.', 'info', 5000);
  }
  window.addEventListener('offline', () => toast('Koneksi terputus — mode offline aktif.', 'info'));
  window.addEventListener('online', () => toast('Koneksi kembali tersambung.', 'success'));
})();

/* ==========================================================================
   AUTH MODULE (demo only — client-side, not production security)
   ========================================================================== */
const Auth = (function authModule() {
  const USERS_KEY = 'orbitly:users';
  const SESSION_KEY = 'orbitly:session';

  function getUsers() { return store.get(USERS_KEY, []); }
  function saveUsers(users) { store.set(USERS_KEY, users); }

  function currentUser() {
    const session = store.get(SESSION_KEY);
    if (!session) return null;
    return getUsers().find(u => u.email === session.email) || null;
  }

  async function register(name, email, password) {
    const users = getUsers();
    if (users.some(u => u.email === email)) {
      throw new Error('Email ini sudah terdaftar. Silakan masuk.');
    }
    const passwordHash = await sha256(password);
    const user = { name, email, passwordHash, createdAt: new Date().toISOString(), role: 'member' };
    users.push(user);
    saveUsers(users);
    store.set(SESSION_KEY, { email });
    return user;
  }

  async function login(email, password) {
    const users = getUsers();
    const user = users.find(u => u.email === email);
    if (!user) throw new Error('Akun tidak ditemukan. Silakan daftar terlebih dahulu.');
    const hash = await sha256(password);
    if (hash !== user.passwordHash) throw new Error('Kata sandi salah.');
    store.set(SESSION_KEY, { email });
    return user;
  }

  function logout() {
    store.remove(SESSION_KEY);
  }

  function updateProfile(updates) {
    const session = store.get(SESSION_KEY);
    if (!session) return null;
    const users = getUsers();
    const idx = users.findIndex(u => u.email === session.email);
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...updates };
    saveUsers(users);
    return users[idx];
  }

  function clearAllData() {
    store.remove(USERS_KEY);
    store.remove(SESSION_KEY);
    store.remove('orbitly:tasks');
    store.remove('orbitly:contact-messages');
  }

  return { register, login, logout, currentUser, updateProfile, clearAllData };
})();

/* ---------- Nav auth-state visibility (index.html) ---------- */
(function navAuthState() {
  const hideIfAuth = $$('[data-nav-hide-if-auth]');
  const showIfAuth = $$('[data-nav-show-if-auth]');
  if (!hideIfAuth.length && !showIfAuth.length) return;
  const user = Auth.currentUser();
  hideIfAuth.forEach(el => el.hidden = Boolean(user));
  showIfAuth.forEach(el => el.hidden = !user);
})();

/* ---------- Auth Page Logic ---------- */
(function authPage() {
  const loginForm = $('#loginForm');
  const registerForm = $('#registerForm');
  if (!loginForm || !registerForm) return;

  const tabLogin = $('#tabLogin');
  const tabRegister = $('#tabRegister');

  function showLogin() {
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    tabLogin.classList.add('active'); tabLogin.setAttribute('aria-selected', 'true');
    tabRegister.classList.remove('active'); tabRegister.setAttribute('aria-selected', 'false');
  }
  function showRegister() {
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    tabRegister.classList.add('active'); tabRegister.setAttribute('aria-selected', 'true');
    tabLogin.classList.remove('active'); tabLogin.setAttribute('aria-selected', 'false');
  }

  tabLogin.addEventListener('click', showLogin);
  tabRegister.addEventListener('click', showRegister);
  $('#goRegister')?.addEventListener('click', showRegister);
  $('#goLogin')?.addEventListener('click', showLogin);

  if (new URLSearchParams(location.search).get('mode') === 'register') showRegister();

  // Password visibility toggles
  $$('.pass-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = $(`#${btn.dataset.target}`);
      if (!target) return;
      target.type = target.type === 'password' ? 'text' : 'password';
      btn.textContent = target.type === 'password' ? '👁' : '🙈';
    });
  });

  // Password strength meter
  const rePass = $('#re-pass');
  const strengthBar = $('#passStrength span');
  if (rePass && strengthBar) {
    rePass.addEventListener('input', () => {
      const v = rePass.value;
      let score = 0;
      if (v.length >= 6) score += 25;
      if (v.length >= 10) score += 25;
      if (/[A-Z]/.test(v)) score += 25;
      if (/[0-9]/.test(v) || /[^A-Za-z0-9]/.test(v)) score += 25;
      strengthBar.style.width = `${score}%`;
      strengthBar.style.background = score < 50 ? 'var(--danger)' : score < 100 ? 'var(--gold)' : 'var(--success)';
    });
  }

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = $('#li-email').value.trim();
    const password = $('#li-pass').value;
    try {
      await Auth.login(email, password);
      toast('Berhasil masuk. Mengarahkan ke dashboard...', 'success');
      setTimeout(() => location.href = 'dashboard.html', 700);
    } catch (err) {
      toast(err.message, 'error');
    }
  });

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = $('#re-name').value.trim();
    const email = $('#re-email').value.trim();
    const password = $('#re-pass').value;
    if (password.length < 6) {
      toast('Kata sandi minimal 6 karakter.', 'error');
      return;
    }
    try {
      await Auth.register(name, email, password);
      toast('Akun berhasil dibuat. Mengarahkan ke dashboard...', 'success');
      setTimeout(() => location.href = 'dashboard.html', 700);
    } catch (err) {
      toast(err.message, 'error');
    }
  });
})();

/* ==========================================================================
   DASHBOARD MODULE
   ========================================================================== */
(function dashboard() {
  const shell = $('.dash-shell');
  if (!shell) return;

  const user = Auth.currentUser();
  if (!user) {
    location.href = 'auth.html';
    return;
  }

  /* ---- Header / greeting ---- */
  const initials = user.name.trim().split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase();
  $('#userAvatar').textContent = initials || '?';
  $('#userChipName').textContent = user.name;
  $('#greetName').textContent = user.name.split(' ')[0];

  /* ---- Sidebar panel navigation ---- */
  const navItems = $$('.dash-nav-item');
  const panels = $$('.dash-panel');
  navItems.forEach(btn => {
    btn.addEventListener('click', () => {
      navItems.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      $(`#panel-${btn.dataset.panel}`)?.classList.add('active');
      $('#dashSidebar')?.classList.remove('open');
    });
  });

  $('#dashHamburger')?.addEventListener('click', () => {
    $('#dashSidebar')?.classList.toggle('open');
  });

  $('#logoutBtn')?.addEventListener('click', () => {
    Auth.logout();
    toast('Berhasil keluar.', 'success');
    setTimeout(() => location.href = '/', 500);
  });

  /* ---- Notifications (demo/simulated) ---- */
  const NOTIFS_KEY = `orbitly:notifs:${user.email}`;
  function seedNotifs() {
    if (store.get(NOTIFS_KEY)) return;
    store.set(NOTIFS_KEY, [
      { title: 'Selamat datang di Orbitly!', detail: 'Mulai dengan menambahkan tugas pertamamu.', time: 'Baru saja', read: false },
      { title: 'Tip: gunakan pintasan "/"', detail: 'Tekan / kapan saja untuk mencari tugas dengan cepat.', time: '1 hari lalu', read: false }
    ]);
  }
  seedNotifs();

  function renderNotifs() {
    const notifs = store.get(NOTIFS_KEY, []);
    const panel = $('#notifPanel');
    const dot = $('#notifDot');
    if (!panel) return;
    panel.innerHTML = '';
    if (!notifs.length) {
      panel.innerHTML = '<p class="notif-empty">Tidak ada notifikasi.</p>';
    } else {
      notifs.forEach(n => {
        const item = document.createElement('div');
        item.className = 'notif-item';
        const strong = document.createElement('strong');
        strong.textContent = n.title;
        const p = document.createElement('p');
        p.textContent = n.detail;
        p.style.margin = '0 0 4px';
        p.style.color = 'var(--text-muted)';
        p.style.fontSize = '0.82rem';
        const span = document.createElement('span');
        span.textContent = n.time;
        item.append(strong, p, span);
        panel.appendChild(item);
      });
    }
    const hasUnread = notifs.some(n => !n.read);
    if (dot) dot.hidden = !hasUnread;
  }
  renderNotifs();

  $('#notifBtn')?.addEventListener('click', () => {
    const panel = $('#notifPanel');
    const btn = $('#notifBtn');
    const open = panel.hidden;
    panel.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    if (open) {
      const notifs = store.get(NOTIFS_KEY, []).map(n => ({ ...n, read: true }));
      store.set(NOTIFS_KEY, notifs);
      $('#notifDot').hidden = true;
    }
  });
  document.addEventListener('click', (e) => {
    const wrap = $('.notif-wrap');
    if (wrap && !wrap.contains(e.target)) $('#notifPanel')?.setAttribute('hidden', '');
  });

  /* ---- Tasks: state, seed data ---- */
  const TASKS_KEY = `orbitly:tasks:${user.email}`;
  function seedTasks() {
    if (store.get(TASKS_KEY)) return;
    store.set(TASKS_KEY, [
      { id: crypto.randomUUID(), title: 'Rancang alur onboarding baru', status: 'doing' },
      { id: crypto.randomUUID(), title: 'Review otomatisasi notifikasi', status: 'todo' },
      { id: crypto.randomUUID(), title: 'Sinkronkan statistik mingguan', status: 'done' },
      { id: crypto.randomUUID(), title: 'Siapkan materi demo klien', status: 'todo' }
    ]);
  }
  seedTasks();

  function getTasks() { return store.get(TASKS_KEY, []); }
  function setTasks(tasks) { store.set(TASKS_KEY, tasks); renderTasks(); renderKPIs(); renderChart(); }

  let activeFilter = 'all';
  let searchQuery = '';

  function renderTasks() {
    const list = $('#taskList');
    const empty = $('#taskEmptyState');
    if (!list) return;
    const tasks = getTasks().filter(t => {
      const matchesFilter = activeFilter === 'all' || t.status === activeFilter;
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });

    list.innerHTML = '';
    empty.hidden = tasks.length !== 0;

    const statusLabel = { todo: 'Belum Dikerjakan', doing: 'Berjalan', done: 'Selesai' };

    tasks.forEach(t => {
      const li = document.createElement('li');
      li.className = `task-item${t.status === 'done' ? ' done' : ''}`;
      li.dataset.id = t.id;

      const check = document.createElement('button');
      check.className = 'task-check';
      check.setAttribute('aria-label', 'Tandai selesai');
      check.innerHTML = t.status === 'done'
        ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        : '';

      const title = document.createElement('span');
      title.className = 'task-title';
      title.textContent = t.title; // textContent — safe from XSS

      const status = document.createElement('span');
      status.className = `task-status ${t.status}`;
      status.textContent = statusLabel[t.status];

      const del = document.createElement('button');
      del.className = 'task-del';
      del.setAttribute('aria-label', 'Hapus tugas');
      del.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

      check.addEventListener('click', () => {
        const tasks2 = getTasks();
        const idx = tasks2.findIndex(x => x.id === t.id);
        if (idx === -1) return;
        const order = ['todo', 'doing', 'done'];
        tasks2[idx].status = order[(order.indexOf(tasks2[idx].status) + 1) % order.length];
        setTasks(tasks2);
      });

      del.addEventListener('click', () => {
        setTasks(getTasks().filter(x => x.id !== t.id));
        toast('Tugas dihapus.', 'info');
      });

      li.append(check, title, status, del);
      list.appendChild(li);
    });
  }

  function renderKPIs() {
    const tasks = getTasks();
    const active = tasks.filter(t => t.status !== 'done').length;
    const done = tasks.filter(t => t.status === 'done').length;
    const score = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
    $('#kpiActive') && ($('#kpiActive').textContent = active);
    $('#kpiDone') && ($('#kpiDone').textContent = done);
    $('#kpiDue') && ($('#kpiDue').textContent = Math.min(active, 3));
    $('#kpiScore') && ($('#kpiScore').textContent = `${score}%`);
  }

  function renderChart() {
    const svg = $('#lineChart');
    if (!svg) return;
    // Deterministic-ish demo series derived from current done-task count
    // so the chart visibly reacts to what the user does.
    const doneCount = getTasks().filter(t => t.status === 'done').length;
    const base = [3, 5, 4, 6, 5, 7, 4 + doneCount];
    const w = 560, h = 200, pad = 24;
    const max = Math.max(...base, 6);
    const points = base.map((v, i) => {
      const x = pad + (i * (w - pad * 2)) / (base.length - 1);
      const y = h - pad - (v / max) * (h - pad * 2);
      return [x, y];
    });
    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
    const areaD = `${pathD} L${points[points.length - 1][0]},${h - pad} L${points[0][0]},${h - pad} Z`;

    svg.innerHTML = `
      <defs>
        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#8b7cf6" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="#8b7cf6" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <path d="${areaD}" fill="url(#chartFill)"></path>
      <path d="${pathD}" fill="none" stroke="#8b7cf6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path>
      ${points.map(p => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="4" fill="#f5c56b"></circle>`).join('')}
    `;
  }

  renderTasks(); renderKPIs(); renderChart();

  /* ---- Filters + search ---- */
  $$('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      $$('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeFilter = chip.dataset.filter;
      renderTasks();
    });
  });
  $('#taskSearch')?.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderTasks();
  });

  /* ---- Add task ---- */
  $('#addTaskForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = $('#newTaskInput');
    const value = input.value.trim();
    if (!value) { toast('Nama tugas tidak boleh kosong.', 'error'); return; }
    const tasks = getTasks();
    tasks.unshift({ id: crypto.randomUUID(), title: value.slice(0, 120), status: 'todo' });
    setTasks(tasks);
    input.value = '';
    toast('Tugas ditambahkan.', 'success');
  });

  /* ---- Profile ---- */
  const profileForm = $('#profileForm');
  if (profileForm) {
    $('#pf-name').value = user.name;
    $('#pf-email').value = user.email;
    $('#pf-role').value = user.role || 'member';
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = $('#pf-name').value.trim();
      if (name.length < 2) { toast('Nama minimal 2 karakter.', 'error'); return; }
      Auth.updateProfile({ name, role: $('#pf-role').value });
      $('#userChipName').textContent = name;
      $('#greetName').textContent = name.split(' ')[0];
      toast('Profil tersimpan.', 'success');
    });
  }

  /* ---- Settings ---- */
  $('#clearDataBtn')?.addEventListener('click', () => {
    if (!confirm('Ini akan menghapus semua tugas dan akun demo dari perangkat ini. Lanjutkan?')) return;
    Auth.clearAllData();
    toast('Data dihapus. Mengarahkan ke beranda...', 'success');
    setTimeout(() => location.href = '/', 700);
  });
})();
