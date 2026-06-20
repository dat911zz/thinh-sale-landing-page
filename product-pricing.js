/* Product-page pricing table — fetches pricing.json, renders carousel for the current product.
   Requires: <body data-product="easyinvoice|easyca|easybooks|easyhrm|easypos|easydocs"> */

function ppFeaturesHTML(features) {
  return features.map(f => `
    <li class="pricing-feature">
      <span class="pricing-feature-icon check" aria-hidden="true"></span>
      <span>${f}</span>
    </li>`).join('');
}

function ppCardHTML(plan, isCA, yearIdx) {
  const cls        = plan.variant ? ` ${plan.variant}` : '';
  const price      = isCA ? plan.prices[yearIdx] : plan.price;
  const unit       = isCA ? `/ ${yearIdx + 1} năm` : (plan.unit || '');
  const priceAttr  = isCA ? `data-prices='${JSON.stringify(plan.prices)}'` : '';
  const badge      = plan.variant === 'featured'
    ? '<div class="plan-featured-badge">Phổ biến nhất</div>' : '';
  return `
    <article class="pricing-card${cls} fade-up" aria-label="${plan.label} – ${plan.planName}">
      ${badge}
      <div class="pricing-plan-name">${plan.planName}</div>
      <div class="pricing-plan-label">${plan.label}</div>
      <div class="pricing-price">
        <span class="pricing-price-amount" ${priceAttr}>${price}</span>
        ${unit ? `<span class="pricing-price-unit${isCA ? ' ca-unit' : ''}">${unit}</span>` : ''}
      </div>
      <div class="pricing-note">${plan.note}</div>
      <ul class="pricing-features">${ppFeaturesHTML(plan.features)}</ul>
      <a href="index.html#contact" class="btn-plan btn-plan-${plan.cta.style}">${plan.cta.text}</a>
    </article>`;
}

function ppCarouselHTML(cardsHTML, count, key) {
  const dots = Array.from({ length: count }, (_, i) =>
    `<button class="plan-dot${i === 0 ? ' plan-dot--active' : ''}" data-idx="${i}" aria-label="Gói ${i + 1}"></button>`
  ).join('');
  return `
    <div class="plan-body">
      <button class="plan-arrow plan-arrow--prev" aria-label="Gói trước">&#8249;</button>
      <div class="plan-outer">
        <div class="plan-track" id="plan-track-${key}">${cardsHTML}</div>
      </div>
      <button class="plan-arrow plan-arrow--next" aria-label="Gói sau">&#8250;</button>
    </div>
    <div class="plan-dots">${dots}</div>
    <div class="plan-bar" aria-hidden="true"><div class="plan-fill" id="plan-fill-${key}"></div></div>`;
}

function ppInitCarousel(el, delay) {
  delay = delay || 6000;
  const track = el.querySelector('.plan-track');
  const fill  = el.querySelector('.plan-fill');
  const dots  = el.querySelectorAll('.plan-dot');
  const cards = track.querySelectorAll('.pricing-card');
  const total = cards.length;
  let current = 0, timer = null;

  cards.forEach(function(c) { c.classList.add('visible'); });

  function triggerFill() {
    if (!fill) return;
    fill.style.animation = 'none';
    fill.offsetHeight;
    fill.style.animation = 'planFill ' + delay + 'ms linear forwards';
  }

  function goTo(n) {
    n = ((n % total) + total) % total;
    current = n;
    track.style.transform = 'translateX(-' + (n * cards[0].offsetWidth) + 'px)';
    dots.forEach(function(d, i) { d.classList.toggle('plan-dot--active', i === n); });
    clearInterval(timer);
    triggerFill();
    timer = setInterval(function() { goTo(current + 1); }, delay);
  }

  function stopAuto() {
    clearInterval(timer);
    timer = null;
    if (fill) {
      var w = getComputedStyle(fill).width;
      fill.style.animation = 'none';
      fill.style.width = w;
    }
  }

  function startAuto() {
    triggerFill();
    timer = setInterval(function() { goTo(current + 1); }, delay);
  }

  dots.forEach(function(d, i) { d.addEventListener('click', function() { goTo(i); }); });
  var prev = el.querySelector('.plan-arrow--prev');
  var next = el.querySelector('.plan-arrow--next');
  if (prev) prev.addEventListener('click', function() { goTo(current - 1); });
  if (next) next.addEventListener('click', function() { goTo(current + 1); });

  el.addEventListener('mouseenter', stopAuto);
  el.addEventListener('mouseleave', startAuto);

  var touchX = 0;
  el.addEventListener('touchstart', function(e) { touchX = e.touches[0].clientX; }, { passive: true });
  el.addEventListener('touchend', function(e) {
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) goTo(current + (dx > 0 ? -1 : 1));
  }, { passive: true });

  el.setAttribute('tabindex', '0');
  el.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft')  { e.preventDefault(); goTo(current - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current + 1); }
  });

  window.addEventListener('resize', function() {
    track.style.transition = 'none';
    track.style.transform = 'translateX(-' + (current * cards[0].offsetWidth) + 'px)';
    requestAnimationFrame(function() { track.style.transition = ''; });
  }, { passive: true });

  triggerFill();
  timer = setInterval(function() { goTo(current + 1); }, delay);
}

function ppSetYear(yr, tabEl) {
  document.querySelectorAll('.year-tab').forEach(function(t) {
    t.classList.remove('active');
    t.setAttribute('aria-selected', 'false');
  });
  tabEl.classList.add('active');
  tabEl.setAttribute('aria-selected', 'true');
  document.querySelectorAll('[data-prices]').forEach(function(el) {
    el.textContent = JSON.parse(el.dataset.prices)[yr - 1];
  });
  document.querySelectorAll('.ca-unit').forEach(function(el) {
    el.textContent = '/ ' + yr + ' năm';
  });
}

window.setYear = ppSetYear;

fetch('pricing.json')
  .then(function(r) { if (!r.ok) throw new Error(r.status); return r.json(); })
  .then(function(data) {
    var slug = document.body.dataset.product;
    var pd   = data[slug];
    if (!pd || !pd.plans) return;

    var isCA = slug === 'easyca';
    var grid = document.getElementById('pp-grid');
    if (!grid) return;

    /* Section header */
    var eyebrow = document.getElementById('pp-eyebrow');
    var title   = document.getElementById('pp-title');
    var desc    = document.getElementById('pp-desc');
    if (eyebrow) eyebrow.textContent = pd.eyebrow || pd.title;
    if (title)   title.textContent   = pd.title;
    if (desc)    desc.textContent    = pd.desc;

    /* Year tabs for EasyCA */
    var yearTabsEl = document.getElementById('pp-year-tabs');
    if (isCA && yearTabsEl && pd.yearOptions) {
      yearTabsEl.removeAttribute('hidden');
      yearTabsEl.innerHTML = pd.yearOptions.map(function(yr, i) {
        return '<div class="year-tab' + (i === 0 ? ' active' : '') +
          '" role="tab" aria-selected="' + (i === 0) +
          '" onclick="setYear(' + yr + ', this)">' + yr + ' năm</div>';
      }).join('');
    }

    /* Plan carousel — defer init one frame so layout is painted before measuring offsetWidth */
    var cardsHTML = pd.plans.map(function(p) { return ppCardHTML(p, isCA, 0); }).join('');
    grid.className = 'plan-carousel';
    grid.innerHTML = ppCarouselHTML(cardsHTML, pd.plans.length, slug);
    requestAnimationFrame(function() { ppInitCarousel(grid); });

    /* Setup fee */
    var setupEl = document.getElementById('pp-setup-fee');
    if (setupEl && pd.setupFee) {
      setupEl.removeAttribute('hidden');
      setupEl.querySelector('span').innerHTML =
        pd.setupFeeLabel + ': <strong>' + pd.setupFee + ' ' + pd.setupFeeSuffix + '</strong>';
    }

    /* Disclaimer */
    var disclaimerEl = document.getElementById('pp-disclaimer');
    if (disclaimerEl && pd.disclaimer) {
      disclaimerEl.textContent = pd.disclaimer;
    }

    /* Trigger fade-up observer for newly rendered cards */
    if (typeof observeFadeUps === 'function') observeFadeUps();
  })
  .catch(function(err) { console.error('product-pricing.js: cannot load pricing.json', err); });
