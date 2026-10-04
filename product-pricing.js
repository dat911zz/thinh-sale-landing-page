/* Product-page pricing — fetches pricing.json and renders the plan table for the current product.
   Requires: <body data-product="easyinvoice|easyca|easybooks|easyhrm|easypos|easydocs">
   and layout.js (planTableHTML, setYear) loaded first. */

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
        return '<button type="button" class="year-tab' + (i === 0 ? ' active' : '') +
          '" role="tab" aria-selected="' + (i === 0) +
          '" onclick="setYear(' + yr + ', this)">' + yr + ' năm</button>';
      }).join('');
    }

    /* All plans side by side (planTableHTML lives in layout.js) */
    grid.innerHTML = planTableHTML(pd.plans, isCA);

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
  })
  .catch(function(err) { console.error('product-pricing.js: cannot load pricing.json', err); });
