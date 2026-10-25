import { esc, img, imageDescription } from '../catalog.mjs';
import { productPageDesign } from '../product-page-design.mjs';

const withLineBreaks = value => esc(value).split('\n').join('<br>');
const photoURL = product => `/assets/${esc(product.image)}.webp`;
const designFor = product => {
  const design = productPageDesign[product.slug];
  if (!design) throw new Error(`Missing product page design: ${product.slug}`);
  return design;
};
const metricSize = (value, product) => {
  if (product.slug === 'sab234') return 'long';
  const text = String(value).trim();
  if (text.length > 75) return 'long';
  if (text.length > 27) return 'medium';
  return text.length > 14 ? 'compact' : 'short';
};
const specRows = rows => rows.map(({ label, value }) => `<div class="technical-row"><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('');

function highlights(product, design) {
  return `<section class="product-highlights" aria-labelledby="highlights-heading">
    <div class="product-highlights-inner">
      <h2 class="highlights-heading" id="highlights-heading">${esc(design.highlightsHeading)}</h2>
      <div class="highlight-grid highlights--${design.highlights.length}">${design.highlights.map(spec => {
        const size = metricSize(spec.value, product);
        return `<article class="highlight-tile${size === 'medium' || size === 'long' ? ' highlight-tile--long' : ''}"><div class="highlight-copy"><h3>${esc(spec.label)}</h3><p class="metric-value metric-value--${size}">${esc(spec.value)}</p></div></article>`;
      }).join('')}</div>
    </div>
  </section>`;
}

function relatedProducts(product, products, design) {
  const productsBySlug = new Map(products.map(candidate => [candidate.slug, candidate]));
  const related = design.relatedSlugs.map(slug => {
    const candidate = productsBySlug.get(slug);
    if (!candidate) throw new Error(`Unknown related product ${slug} on ${product.slug}`);
    return candidate;
  });
  return `<section class="product-related" aria-labelledby="related-heading-title">
    <div class="related-heading"><h2 id="related-heading-title">Explore more.</h2><a href="/products/">All products</a></div>
    <div class="related-products">${related.map(candidate => {
      const relatedDesign = designFor(candidate);
      return `<a class="related-product" href="/products/${esc(candidate.slug)}/" aria-label="Explore ${esc(relatedDesign.model)}">
        <div class="related-product-photo">${img(candidate)}</div>
        <div class="related-product-copy"><p>${esc(relatedDesign.type)}</p><div class="related-product-heading"><h3>${esc(relatedDesign.model)}</h3><span class="related-product-arrow" aria-hidden="true">↗</span></div><span class="related-product-link">Learn more</span></div>
      </a>`;
    }).join('')}</div>
  </section>`;
}

/** Responsive translation of each product's high-fidelity Figma frame. */
export function productPage(p, products) {
  const design = designFor(p);
  const charger = p.slug === 'np-f970-fast-smart-charger';
  return `<div class="apk-product${charger ? ' product-is-charger' : ''}" data-product-slug="${esc(p.slug)}">
    <section class="product-main-hero" id="overview" aria-labelledby="product-title">
      <div class="product-hero-inner">
        <div class="product-hero-copy"><p class="product-type">${esc(design.type)}</p><h1 id="product-title"${charger ? ' class="product-title--long"' : ''}>${design.modelLines.map(esc).join('<br>')}</h1><p class="product-tagline">${esc(design.tagline)}</p><p class="product-summary">${esc(design.summary)}</p><div class="product-hero-actions"><a class="product-compare-cta" href="/compare/?products=${encodeURIComponent(p.slug)}" aria-label="Compare ${esc(design.model)} with other products">Compare</a></div></div>
        <div class="product-hero-photo">${img(p, '', true)}</div>
      </div>
    </section>
    ${highlights(p, design)}
    <section class="product-feature-section" id="features" aria-labelledby="features-title">
      <div class="product-features-inner">
        <div class="product-gallery"><p class="product-gallery-label">A closer look.</p><button class="product-gallery-photo" id="gallery" type="button" data-zoom="${photoURL(p)}" data-alt="${esc(p.name)} — ${imageDescription(p)}" aria-label="Enlarge ${esc(design.model)} product view">${img(p)}</button>${p.limited ? `<p class="product-reference-note">${esc(p.limited)}</p>` : ''}</div>
        <div class="product-editorial"><h2 id="features-title">${withLineBreaks(p.headline)}</h2><p class="product-lead">${esc(p.lead)}</p><ol class="feature-list">${p.features.map((feature, index) => `<li><span class="feature-number" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span><span class="feature-text">${esc(feature)}</span></li>`).join('')}</ol></div>
      </div>
    </section>
    <section class="product-lifestyle" aria-labelledby="lifestyle-title">
      <div class="product-lifestyle-heading"><p>${esc(design.sceneEyebrow)}</p><h2 id="lifestyle-title">${esc(design.sceneTitle)}</h2></div>
      <figure><button class="product-lifestyle-photo" type="button" data-zoom="/assets/${esc(p.scene.image)}.webp" data-alt="${esc(p.scene.alt)}" aria-label="Enlarge ${esc(design.model)} in-use image"><img src="/assets/${esc(p.scene.image)}.webp" alt="${esc(p.scene.alt)}" width="1600" height="900" loading="lazy" decoding="async"></button><figcaption class="product-lifestyle-caption">${esc(design.sceneCaption)}</figcaption></figure>
    </section>
    <section class="product-technical" id="specifications" aria-labelledby="specifications-title">
      <div class="product-specs-inner">
        <div class="product-specs-intro"><h2 id="specifications-title">Technical<br>specifications.</h2><a class="technical-download product-download" href="/assets/specs/${esc(p.slug)}.txt" download>Download specifications</a></div>
        <div class="product-specs-content"><dl class="technical-list">${specRows(p.specs)}</dl>${p.packaging_specs.length ? `<section class="technical-packaging" aria-labelledby="packaging-heading"><h3 id="packaging-heading">Packaging &amp; bulk specifications</h3><dl class="technical-list">${specRows(p.packaging_specs)}</dl></section>` : ''}</div>
      </div>
    </section>
    ${relatedProducts(p, products, design)}
  </div>`;
}
