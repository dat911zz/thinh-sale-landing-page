/* Shared layout behaviour — nav, scroll-to-top, fade-up observer */
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

/* ── SCROLL OBSERVER ──────────────────────────── */
const _io = new IntersectionObserver(
  entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
  { threshold: 0.1 }
);
function observeFadeUps() {
  document.querySelectorAll('.fade-up:not(.visible)').forEach(el => _io.observe(el));
}

observeFadeUps();

/* Footer year — always current */
document.querySelectorAll('.footer-year').forEach(el => el.textContent = new Date().getFullYear());
