import { esc, img, imageDescription } from '../catalog.mjs';

const arrow = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6"/></svg>';
const plus = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
const download = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/></svg>';
const paragraphs = value => esc(value).split('\n').join('<br>');
const asset = p => `/assets/${esc(p.image)}.webp`;
const metricSize = value => {
  const text = String(value).trim();
  if (text.length > 75) return 'long';
  if (text.length > 27) return 'medium';
  // Status words and long tokens need more room than short numeric metrics.
  const hasLongWord = /[a-z]{7,}/i.test(text);
  const isLongToken = !/\s/.test(text) && text.length > 8;
  if (text.length > 14 || hasLongWord || isLongToken) return 'compact';
  return 'short';
};
const specRows = specs => (specs || []).map(spec => `<div class="technical-row"><dt>${esc(spec.label)}</dt><dd>${esc(spec.value)}</dd></div>`).join('');

function highlights(p) {
  const selected = (p.featured || []).map(label => p.specs.find(spec => spec.label === label)).filter(Boolean);
  if (!selected.length) return '';
  return `<section class="product-highlights product-frame" aria-labelledby="highlights-heading">
    <h2 class="product-sr-only" id="highlights-heading">${esc(p.model)} highlights</h2>
    <div class="highlight-mosaic highlights--${selected.length}">
      ${selected.map((spec, index) => `<article class="highlight-tile highlight-tile--${index + 1}${index === 0 && p.outline ? ' product-dark-stage' : ''}">
        <div class="highlight-copy"><h3>${esc(spec.label)}</h3><p class="metric-value metric-value--${metricSize(spec.value)}">${esc(spec.value)}</p></div>
        ${index === 0 ? `<div class="highlight-product">${img(p)}</div>` : ''}
      </article>`).join('')}
    </div>
    <p class="product-summary">${esc(p.description)}</p>
  </section>`;
}

function relatedProducts(p, products) {
  const ordered = [...products.filter(candidate => candidate.slug !== p.slug && candidate.category_slug === p.category_slug), ...products.filter(candidate => candidate.slug !== p.slug && candidate.category_slug !== p.category_slug)];
  return `<section class="product-related product-frame" aria-labelledby="related-heading">
    <div class="related-heading"><h2 id="related-heading">Explore more.</h2><a href="/products/">All products ${arrow}</a></div>
    <div class="product-related-grid">${ordered.slice(0, 3).map(candidate => `<article class="related-product">
      <a class="related-product-photo${candidate.outline ? ' product-dark-stage' : ''}" href="/products/${esc(candidate.slug)}/" aria-label="Explore ${esc(candidate.name)}">${img(candidate)}</a>
      <div class="related-product-copy"><p>${esc(candidate.type || candidate.category)}</p><h3><a href="/products/${esc(candidate.slug)}/">${esc(candidate.model)}</a></h3><a class="related-product-link" href="/products/${esc(candidate.slug)}/">Learn more ${arrow}</a></div>
    </article>`).join('')}</div>
  </section>`;
}

/** Reference-faithful product views, with separate generated editorial scenes. */
export function productPage(p, products) {
  return `<div class="apk-product product-tone-${esc(p.tone || 'pearl')}${p.outline ? ' product-is-outline' : ''}">
    <section class="product-main-hero${p.outline ? ' product-dark-stage' : ''}" id="overview" aria-labelledby="product-title">
      <div class="product-hero-heading"><p class="product-type">${esc(p.type)}</p><h1 id="product-title">${esc(p.model)}</h1><p class="product-tagline">${esc(p.tagline)}</p><a class="product-compare-cta" href="/compare/?products=${encodeURIComponent(p.slug)}" aria-label="Compare ${esc(p.model)} with other products">Compare ${arrow}</a></div>
      <div class="product-hero-photo">${img(p, '', true)}</div>
    </section>
    ${highlights(p)}
    <section class="product-gallery${p.outline ? ' product-dark-stage' : ''}" id="gallery" aria-labelledby="gallery-title">
      <h2 id="gallery-title">A closer look.</h2>
      <button class="product-gallery-photo" type="button" data-zoom="${asset(p)}" data-alt="${esc(p.name)} — ${imageDescription(p)}" aria-label="Enlarge ${esc(p.name)} product view">${img(p)}<span class="product-view-label">View product ${plus}</span></button>
      ${p.limited ? `<p class="product-reference-note">${esc(p.limited)}</p>` : ''}
    </section>
    <section class="product-feature-section" id="features" aria-labelledby="features-title">
      <div class="product-editorial"><h2 id="features-title">${paragraphs(p.headline)}</h2><p class="product-lead">${esc(p.lead)}</p>
        <ul class="product-known-features">${(p.features || []).map(feature => `<li>${esc(feature)}</li>`).join('')}</ul>
      </div>
    </section>
    <section class="product-lifestyle" aria-labelledby="lifestyle-title">
      <div class="product-lifestyle-heading"><p>In your creative space</p><h2 id="lifestyle-title">${esc(p.scene.title)}</h2></div>
      <figure><button class="product-lifestyle-photo" type="button" data-zoom="/assets/${esc(p.scene.image)}.webp" data-alt="${esc(p.scene.alt)}" aria-label="Enlarge ${esc(p.model)} in-use image"><img src="/assets/${esc(p.scene.image)}.webp" alt="${esc(p.scene.alt)}" width="1600" height="900" loading="lazy" decoding="async"><span class="lifestyle-enlarge">${plus}</span></button><figcaption>${esc(p.scene.caption)}</figcaption></figure>
    </section>
    <section class="product-technical" id="specifications" aria-labelledby="specifications-title">
      <div class="technical-heading"><h2 id="specifications-title">Technical specifications.</h2><a href="/assets/specs/${esc(p.slug)}.txt" download>Download specifications ${download}</a></div>
      <dl class="technical-list">${specRows(p.specs)}</dl>
      ${(p.packaging_specs || []).length ? `<details class="technical-packaging"><summary>Packaging &amp; bulk specifications ${plus}</summary><dl class="technical-list">${specRows(p.packaging_specs)}</dl></details>` : ''}
    </section>
    ${relatedProducts(p, products)}
  </div>`;
}
