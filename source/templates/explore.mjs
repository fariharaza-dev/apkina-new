import { bySlug, esc } from '../catalog.mjs';

const guideVisuals = {
  'colour-temperature': {
    src: '/assets/explore/colour-temperature.webp',
    alt: 'Warm and cool studio lights illuminate a ceramic vase while a camera records the still life.',
  },
  'rgb-lighting': {
    src: '/assets/home/news-2-3x.webp',
    alt: 'A male portrait subject lit with magenta and cyan light beside an RGB handheld light.',
  },
  'portable-lighting': {
    src: '/assets/home/news-3-3x.webp',
    alt: 'A camera, compact lighting panels and tripod packed in a portable camera bag.',
  },
};

const productSummaries = {
  '300w': 'A 300W bi-colour video light with app control, a TFT display and six lighting effects.',
  'ap620': 'Explore colour, effects and adjustable barndoors. AP620 brings 24W output, app control and an OLED display into a handheld format.',
  'ap3150': 'Take adjustable white light and full RGB colour into a compact setup. AP3150 is 11mm deep and includes a built-in 4000mAh battery.',
};

const guideURL = guide => `/explore/${encodeURIComponent(guide.slug)}/`;
const sectionID = index => `guide-section-${index + 1}`;
const guideImage = (guide, { eager = false, width = 636, height = 360 } = {}) => {
  const visual = guideVisuals[guide.slug];
  if (!visual) throw new Error(`Missing editorial image for ${guide.slug}`);
  return `<img src="${visual.src}" alt="${esc(visual.alt)}" width="${width}" height="${height}" loading="${eager ? 'eager' : 'lazy'}"${eager ? ' fetchpriority="high"' : ''} decoding="async">`;
};

function hero({ category, title, subtitle, guide }) {
  return `<section class="editorial-hero" aria-labelledby="editorial-title">
    <div class="editorial-hero-copy">
      <p class="editorial-eyebrow">${esc(category)}</p>
      <h1 id="editorial-title">${esc(title)}</h1>
      <p>${esc(subtitle)}</p>
    </div>${guide ? `\n    <div class="editorial-hero-photo">${guideImage(guide, { eager: true, width: 1304, height: 560 })}</div>` : ''}
  </section>`;
}

function guideCard(guide, related = false) {
  return `<a class="editorial-card" href="${guideURL(guide)}">
    <div class="editorial-card-photo">${guideImage(guide, { height: related ? 320 : 360 })}</div>
    <p class="editorial-card-category editorial-eyebrow">${esc(guide.category)}</p>
    <div class="editorial-card-heading"><h2>${esc(guide.title)}</h2><span aria-hidden="true">↗</span></div>
  </a>`;
}

/** Explore and guide layouts translated from Figma page 88:106. */
export function explorePage(articles) {
  const [featured, ...otherGuides] = articles;
  return `<div class="editorial-page explore-ui">
    ${hero({ category: 'Explore', title: 'Explore Apkina', subtitle: 'Ideas for light, colour and your next creative setup.' })}
    <section class="explore-feature editorial-container" aria-labelledby="featured-guide-title">
      <a class="explore-feature-photo" href="${guideURL(featured)}" aria-label="Read ${esc(featured.title)}">${guideImage(featured, { eager: true, width: 760, height: 510 })}</a>
      <div class="explore-feature-copy">
        <p class="editorial-eyebrow">${esc(featured.category)}</p>
        <h2 id="featured-guide-title">${esc(featured.title)}</h2>
        <p>${esc(featured.subtitle)}</p>
        <a class="editorial-cta" href="${guideURL(featured)}">Read the guide</a>
      </div>
    </section>
    <section class="explore-guides editorial-container" aria-label="Creative guides">
      <div class="editorial-grid">${otherGuides.map(guide => guideCard(guide)).join('')}</div>
    </section>
    <section class="explore-collection editorial-container" aria-labelledby="explore-collection-title">
      <h2 id="explore-collection-title">Explore Apkina</h2>
      <p>Discover lighting, supports and accessories for your next creative setup.</p>
      <a class="editorial-cta" href="/products/">Explore the Collection</a>
    </section>
  </div>`;
}

export function guidePage(guide, articles) {
  const product = bySlug[guide.product];
  if (!product || !productSummaries[guide.product]) throw new Error(`Missing related product for ${guide.slug}`);
  const related = articles.filter(candidate => candidate.slug !== guide.slug);
  return `<div class="editorial-page guide-ui">
    ${hero({ category: guide.category, title: guide.title, subtitle: guide.subtitle, guide })}
    <section class="guide-reading editorial-container" aria-label="Guide content">
      <a class="guide-back editorial-text-link" href="/explore/"><span aria-hidden="true">←</span> Explore Apkina</a>
      <div class="guide-columns">
        <nav class="guide-toc" aria-labelledby="guide-toc-title"><h2 class="editorial-eyebrow" id="guide-toc-title">In this guide</h2><ol>${guide.sections.map(([heading], index) => `<li><a href="#${sectionID(index)}"><span aria-hidden="true">${String(index + 1).padStart(2, '0')}</span><span>${esc(heading)}</span></a></li>`).join('')}</ol></nav>
        <article class="guide-sections" aria-label="${esc(guide.title)}">${guide.sections.map(([heading, copy], index) => `<section id="${sectionID(index)}" aria-labelledby="guide-heading-${index + 1}"><div class="guide-section-head"><span class="guide-section-index" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span><h2 id="guide-heading-${index + 1}">${esc(heading)}</h2></div><p class="guide-section-copy">${esc(copy)}</p></section>`).join('')}</article>
      </div>
    </section>
    <section class="guide-product editorial-container" aria-labelledby="guide-product-title">
      <a class="guide-product-photo" href="/products/${esc(product.slug)}/" aria-label="Explore ${esc(product.model)}"><img src="/assets/${esc(product.image)}.webp" alt="${esc(product.model)} product photograph" width="480" height="360" loading="lazy" decoding="async"></a>
      <div class="guide-product-copy"><p class="editorial-eyebrow">Explore the light</p><h2 id="guide-product-title">${esc(product.model)}</h2><h3>${esc(product.tagline)}</h3><p class="guide-product-summary">${esc(productSummaries[guide.product])}</p><a class="editorial-cta" href="/products/${esc(product.slug)}/">Explore ${esc(product.model)}</a></div>
    </section>
    <section class="guide-related editorial-container" aria-labelledby="related-guides-title">
      <div class="guide-related-heading"><h2 id="related-guides-title">Explore more ideas.</h2><a class="editorial-text-link" href="/explore/">All guides <span aria-hidden="true">↗</span></a></div>
      <div class="editorial-grid">${related.map(candidate => guideCard(candidate, true)).join('')}</div>
    </section>
  </div>`;
}
