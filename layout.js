/* Shared layout behaviour — nav, scroll-to-top, parallax, fade-up observer */
const _hamburger  = document.getElementById('nav-hamburger');
const _mobileMenu = document.getElementById('mobile-menu');
const _mainNav    = document.getElementById('main-nav');
const _scrollBtn  = document.getElementById('scroll-top-btn');

/* ── MOBILE MENU ──────────────────────────────── */
function toggleMenu() {
  if (!_hamburger || !_mobileMenu) return;
  const isOpen = _mobileMenu.classList.toggle('open');
  _hamburger.classList.toggle('open', isOpen);
  _hamburger.setAttribute('aria-expanded', isOpen);
  document.body.classList.toggle('menu-open', isOpen);
}
function closeMenu() {
  if (!_hamburger || !_mobileMenu) return;
  _mobileMenu.classList.remove('open');
  _hamburger.classList.remove('open');
  _hamburger.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('menu-open');
}

if (_mobileMenu) {
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  _mobileMenu.addEventListener('click', e => { if (e.target === _mobileMenu) closeMenu(); });
}

/* ── NAV SCROLL STATE + SCROLL-TO-TOP ────────── */
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (_mainNav)   _mainNav.classList.toggle('scrolled', y > 20);
  if (_scrollBtn) _scrollBtn.classList.toggle('visible', y > 400);
}, { passive: true });

if (_scrollBtn) {
  _scrollBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ── PARALLAX (only when hero exists) ────────── */
const _heroBg      = document.getElementById('hero-bg');
const _heroContent = document.getElementById('hero-content');
const _heroVisual  = document.querySelector('.hero-visual');
const _heroEl      = document.querySelector('.hero');
const _orbs        = document.querySelectorAll('.hero-orb');
let _ticking = false;

function updateParallax() {
  const y = window.scrollY;
  const heroH = _heroEl.offsetHeight;
  if (y > heroH) { _ticking = false; return; }

  const fade = `${Math.max(0, 1 - (y / heroH) * 1.4)}`;
  _heroBg.style.transform      = `translateY(${y * 0.38}px)`;
  _heroContent.style.transform = `translateY(${y * 0.08}px)`;
  _heroContent.style.opacity   = fade;
  if (_heroVisual) {
    _heroVisual.style.transform = `translateY(${y * 0.04}px)`;
    _heroVisual.style.opacity   = fade;
  }
  _orbs.forEach((orb, i) => {
    orb.style.transform = `translateY(${y * (0.12 + i * 0.1)}px)`;
  });
  _ticking = false;
}

if (_heroBg && _heroContent && _heroEl) {
  window.addEventListener('scroll', () => {
    if (!_ticking) { requestAnimationFrame(updateParallax); _ticking = true; }
  }, { passive: true });
}

/* ── SCROLL OBSERVER ──────────────────────────── */
const _io = new IntersectionObserver(
  entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
  { threshold: 0.1 }
);
function observeFadeUps() {
  document.querySelectorAll('.fade-up:not(.visible)').forEach(el => _io.observe(el));
}

observeFadeUps();
