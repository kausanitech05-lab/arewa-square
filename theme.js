/**
 * ═══════════════════════════════════════════════════════
 *   AREWA SQUARE — Theme Engine (Light / Dark Mode)
 *   Include this file in every HTML page BEFORE closing </body>:
 *   <script src="./theme.js"></script>
 *
 *   Usage:
 *   - AS_THEME.init()        → call on page load (auto-called)
 *   - AS_THEME.toggle()      → toggle between light and dark
 *   - AS_THEME.getCurrent()  → returns 'dark' or 'light'
 *
 *   Built by KAUSANITECH | © AREWA SQUARE 2026
 * ═══════════════════════════════════════════════════════
 */

const AS_THEME = (function () {

  // ── Light Mode CSS Variables ──
  const LIGHT = {
    '--green-deep':   '#f0ece0',
    '--green-mid':    '#e8e2d0',
    '--green-light':  '#d4ccb4',
    '--gold':         '#9a6e1a',
    '--gold-light':   '#7a5210',
    '--gold-dim':     '#b8860b',
    '--emerald':      '#1a7a3c',
    '--emerald-dim':  '#145c2d',
    '--white':        '#1a1a0f',
    '--white-dim':    '#3a3520',
    '--dark':         '#f5f0e8',
    '--bg':           '#faf7ef',
    '--danger':       '#c0392b',
    '--warn':         '#d68910',
    '--whatsapp':     '#1a9e4c',
    '--card-bg':      'rgba(0,0,0,0.04)',
    '--border':       'rgba(154,110,26,0.2)',
    '--input-bg':     'rgba(0,0,0,0.04)',
    '--input-border': 'rgba(154,110,26,0.25)',
    '--sidebar-w':    '240px',
  };

  // ── Dark Mode CSS Variables (original) ──
  const DARK = {
    '--green-deep':   '#0d2b1f',
    '--green-mid':    '#1a4a30',
    '--green-light':  '#2a6645',
    '--gold':         '#c9a84c',
    '--gold-light':   '#e8c97a',
    '--gold-dim':     '#8a6e2f',
    '--emerald':      '#2ecc71',
    '--emerald-dim':  '#1a7a45',
    '--white':        '#f5f0e8',
    '--white-dim':    '#c8bfa8',
    '--dark':         '#080f0b',
    '--bg':           '#070d0a',
    '--danger':       '#e74c3c',
    '--warn':         '#f39c12',
    '--whatsapp':     '#25D366',
    '--card-bg':      'rgba(255,255,255,0.04)',
    '--border':       'rgba(201,168,76,0.15)',
    '--input-bg':     'rgba(255,255,255,0.05)',
    '--input-border': 'rgba(201,168,76,0.2)',
    '--sidebar-w':    '240px',
  };

  // ── Apply theme variables to document root ──
  function applyTheme(theme) {
    const vars = theme === 'light' ? LIGHT : DARK;
    const root = document.documentElement;
    Object.entries(vars).forEach(([key, val]) => {
      root.style.setProperty(key, val);
    });

    // Body background
    document.body.style.backgroundColor = theme === 'light' ? '#faf7ef' : '#0d2b1f';

    // Background pattern opacity
    const patternEl = document.querySelector('body::before');

    // Update toggle button icon on all pages
    document.querySelectorAll('.as-theme-toggle').forEach(btn => {
      btn.textContent  = theme === 'light' ? '🌙' : '☀️';
      btn.title        = theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode';
      btn.setAttribute('aria-label', theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode');
    });

    // Update data-theme on html element
    document.documentElement.setAttribute('data-theme', theme);

    // Light mode extra overrides
    if (theme === 'light') {
      injectLightOverrides();
    } else {
      removeLightOverrides();
    }
  }

  // ── Light mode overrides that can't be done via CSS variables ──
  function injectLightOverrides() {
    if (document.getElementById('as-light-overrides')) return;
    const style = document.createElement('style');
    style.id = 'as-light-overrides';
    style.textContent = `
      /* ── LIGHT MODE OVERRIDES ── */
      [data-theme="light"] body {
        background-color: #faf7ef !important;
        color: #1a1a0f !important;
      }
      [data-theme="light"] body::before {
        background-image:
          repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(154,110,26,0.06) 40px, rgba(154,110,26,0.06) 41px),
          repeating-linear-gradient(-45deg, transparent, transparent 40px, rgba(154,110,26,0.06) 40px, rgba(154,110,26,0.06) 41px) !important;
      }
      [data-theme="light"] nav {
        background: rgba(240,236,224,0.97) !important;
        border-bottom: 1px solid rgba(154,110,26,0.2) !important;
      }
      [data-theme="light"] .sidebar {
        background: rgba(240,236,224,0.99) !important;
        border-right: 1px solid rgba(154,110,26,0.2) !important;
      }
      [data-theme="light"] .topbar {
        background: rgba(240,236,224,0.97) !important;
        border-bottom: 1px solid rgba(154,110,26,0.2) !important;
      }
      [data-theme="light"] .as-card,
      [data-theme="light"] .stat-card,
      [data-theme="light"] .table-wrap,
      [data-theme="light"] .highlight-box {
        background: rgba(0,0,0,0.04) !important;
        border-color: rgba(154,110,26,0.15) !important;
      }
      [data-theme="light"] .modal {
        background: #f0ece0 !important;
      }
      [data-theme="light"] input,
      [data-theme="light"] select,
      [data-theme="light"] textarea {
        background: rgba(0,0,0,0.05) !important;
        color: #1a1a0f !important;
        border-color: rgba(154,110,26,0.25) !important;
      }
      [data-theme="light"] input::placeholder,
      [data-theme="light"] textarea::placeholder {
        color: rgba(26,26,15,0.35) !important;
      }
      [data-theme="light"] .hero {
        background: linear-gradient(135deg, #e8e2d0 0%, #f0ece0 50%, #e0d8c4 100%) !important;
      }
      [data-theme="light"] .section {
        background: transparent !important;
      }
      [data-theme="light"] .section-alt {
        background: rgba(0,0,0,0.03) !important;
      }
      [data-theme="light"] .footer,
      [data-theme="light"] footer {
        background: #e8e2d0 !important;
        border-top: 1px solid rgba(154,110,26,0.15) !important;
      }
      [data-theme="light"] .shop-num-pill {
        background: rgba(154,110,26,0.1) !important;
        border-color: rgba(154,110,26,0.3) !important;
      }
      [data-theme="light"] .badge.approved,
      [data-theme="light"] .badge.active {
        background: rgba(26,122,60,0.1) !important;
        color: #1a7a3c !important;
      }
      [data-theme="light"] .badge.pending {
        background: rgba(214,137,16,0.1) !important;
        color: #d68910 !important;
      }
      [data-theme="light"] .badge.rejected,
      [data-theme="light"] .badge.suspended {
        background: rgba(192,57,43,0.1) !important;
        color: #c0392b !important;
      }
      [data-theme="light"] .nav-item {
        color: #3a3520 !important;
      }
      [data-theme="light"] .nav-item:hover,
      [data-theme="light"] .nav-item.active {
        color: #9a6e1a !important;
        background: rgba(154,110,26,0.08) !important;
      }
      [data-theme="light"] .nav-item.active {
        border-left-color: #9a6e1a !important;
      }
      [data-theme="light"] tbody td {
        color: #3a3520 !important;
      }
      [data-theme="light"] .as-toast {
        background: #f0ece0 !important;
        color: #1a1a0f !important;
        box-shadow: 0 4px 24px rgba(0,0,0,0.15) !important;
      }
      [data-theme="light"] .step-card,
      [data-theme="light"] .feature-card,
      [data-theme="light"] .trust-card,
      [data-theme="light"] .shop-card,
      [data-theme="light"] .product-card {
        background: rgba(0,0,0,0.04) !important;
        border-color: rgba(154,110,26,0.15) !important;
      }
      [data-theme="light"] .auth-card,
      [data-theme="light"] .auth-box {
        background: #f0ece0 !important;
        border-color: rgba(154,110,26,0.2) !important;
      }
      /* Hamburger spans in light mode */
      [data-theme="light"] .hamburger span,
      [data-theme="light"] .hamburger-btn span {
        background: #9a6e1a !important;
      }
    `;
    document.head.appendChild(style);
  }

  function removeLightOverrides() {
    const el = document.getElementById('as-light-overrides');
    if (el) el.remove();
  }

  // ── Save and load preference ──
  function save(theme) {
    localStorage.setItem('as_theme', theme);
  }

  function load() {
    return localStorage.getItem('as_theme') || 'dark';
  }

  // ── Toggle between light and dark ──
  function toggle() {
    const current = load();
    const next    = current === 'dark' ? 'light' : 'dark';
    save(next);
    applyTheme(next);
  }

  // ── Get current theme ──
  function getCurrent() {
    return load();
  }

  // ── Create toggle button HTML ──
  function createToggleButton(extraClasses = '') {
    const theme = load();
    const btn   = document.createElement('button');
    btn.className   = `as-theme-toggle ${extraClasses}`.trim();
    btn.textContent = theme === 'light' ? '🌙' : '☀️';
    btn.title       = theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode';
    btn.setAttribute('aria-label', btn.title);
    btn.setAttribute('onclick', 'AS_THEME.toggle()');
    btn.style.cssText = `
      width: 36px; height: 36px;
      border-radius: 6px;
      background: transparent;
      border: 1px solid rgba(201,168,76,0.25);
      cursor: pointer;
      font-size: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s;
      flex-shrink: 0;
    `;
    btn.addEventListener('click', toggle);
    return btn;
  }

  // ── Auto-inject toggle button into nav/topbar ──
  function injectToggleButton() {
    // For index, auth, legal pages → inject into nav-buttons
    const navButtons = document.querySelector('.nav-buttons');
    if (navButtons && !navButtons.querySelector('.as-theme-toggle')) {
      const btn = createToggleButton();
      navButtons.insertBefore(btn, navButtons.firstChild);
    }

    // For dashboard pages → inject into topbar-right
    const topbarRight = document.querySelector('.topbar-right');
    if (topbarRight && !topbarRight.querySelector('.as-theme-toggle')) {
      const btn = createToggleButton('topbar-btn');
      topbarRight.insertBefore(btn, topbarRight.firstChild);
    }

    // For pages with no nav (legal pages, 404, offline) → inject floating btn
    const hasNav = document.querySelector('.nav-buttons, .topbar-right');
    if (!hasNav) {
      const btn = createToggleButton();
      btn.style.cssText += `
        position: fixed;
        top: 18px;
        right: 18px;
        z-index: 9999;
        box-shadow: 0 2px 12px rgba(0,0,0,0.3);
      `;
      document.body.appendChild(btn);
    }
  }

  // ── Init — call automatically on load ──
  function init() {
    const theme = load();
    applyTheme(theme);
    // Inject button after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', injectToggleButton);
    } else {
      injectToggleButton();
    }
  }

  // Auto-init
  init();

  return { init, toggle, getCurrent, applyTheme };

})();
