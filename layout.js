/* Shared layout behaviour — nav, scroll-to-top, fade-up observer */

/* Cache-busting token. Bump it (here AND in the ?v= of every <link>/<script>
   tag in the HTML pages) on each deploy, so browsers never mix a fresh page
   with stale CSS/JS/pricing data. */
const ASSET_VERSION = '2026100504';
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

/* ── PRICING TABLE ────────────────────────────────
   All plans side by side so they can be compared at a glance
   (stacked on mobile). Shared by index.html and product pages. */
const ZALO_URL = 'https://zalo.me/0986633426';

function planTableHTML(plans, isCA) {
  const cols = plans.map(plan => {
    const price = isCA ? plan.prices[0] : plan.price;
    const unit  = isCA ? '/ 1 năm' : (plan.unit || '');
    const priceAttr = isCA ? ` data-prices='${JSON.stringify(plan.prices)}'` : '';
    const askOnly = price === 'Liên hệ';
    const cta = askOnly ? 'Hỏi giá qua Zalo' : 'Đăng ký qua Zalo';
    return `
      <div class="plan-col" role="listitem">
        <div class="plan-col-name">${plan.label}</div>
        ${plan.planName.includes(plan.label) ? '' : `<div class="plan-col-tier">${plan.planName}</div>`}
        <div class="plan-col-price">
          <span class="pricing-price-amount"${priceAttr}>${price}</span>
          ${unit ? `<span class="pricing-price-unit${isCA ? ' ca-unit' : ''}">${unit}</span>` : ''}
        </div>
        <p class="plan-col-note">${plan.note}</p>
        <ul class="plan-col-features">${plan.features.map(f => `<li>${f}</li>`).join('')}</ul>
        <a href="${ZALO_URL}" target="_blank" rel="noopener" class="plan-col-cta">${cta}</a>
      </div>`;
  }).join('');
  return `<div class="plan-table plan-table--${plans.length}" role="list">${cols}</div>`;
}

/* EasyCA term switcher: swaps every [data-prices] value to the chosen year */
function setYear(yr, tabEl) {
  document.querySelectorAll('.year-tab').forEach(t => {
    t.classList.toggle('active', t === tabEl);
    t.setAttribute('aria-selected', t === tabEl ? 'true' : 'false');
  });
  document.querySelectorAll('[data-prices]').forEach(el => {
    el.textContent = JSON.parse(el.dataset.prices)[yr - 1];
  });
  document.querySelectorAll('.ca-unit').forEach(el => { el.textContent = `/ ${yr} năm`; });
}
