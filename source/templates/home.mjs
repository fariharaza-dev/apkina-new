import {esc,bySlug} from '../catalog.mjs';
import {homeSupport,homeNews} from './home-lower.mjs';

function cinematicHero(){return `<section class="cinematic-hero" data-hero-motion aria-labelledby="hero-model">
  <div class="hero-atmosphere" aria-hidden="true"><div class="hero-colour-field hero-animate"></div><img class="hero-vignette-image" src="/assets/home/hero-ellipse.svg" alt=""><div class="hero-edge-light hero-animate"></div></div>
  <div class="cinematic-copy"><p class="cinematic-eyebrow">Professional RGB Light</p><h1 id="hero-model">AP1000</h1><p class="cinematic-tagline">Make every colour count</p><a class="cinematic-cta" href="/products/">View Collection</a></div>
  <div class="cinematic-product-position"><div class="cinematic-parallax" data-hero-parallax><a class="cinematic-product hero-animate" href="/products/ap1000/" aria-label="Discover the AP1000 RGB video light"><img class="cinematic-product-image" src="/assets/ap1000.webp" alt="AP1000 RGB video light" width="408" height="613" fetchpriority="high" decoding="async"></a></div></div>
</section>`;}

function productTile(slug,type,tagline){const p=bySlug[slug];return `<article class="figma-product" aria-labelledby="tile-${slug}">
  <img class="figma-product-art" src="/assets/home/tile-${slug}-2x.webp" alt="${esc(p.model)} product photograph" width="690" height="651" loading="lazy" decoding="async">
  <div class="figma-product-copy"><div class="figma-product-details"><p class="figma-product-type">${esc(type)}</p><div class="figma-product-title"><h2 id="tile-${slug}">${esc(p.model)}</h2><p class="figma-product-tagline">${esc(tagline)}</p></div></div><a class="figma-outline-cta" href="/products/${slug}/">Learn More</a></div>
</article>`;}

function upcomingProduct(){return `<section class="figma-upcoming" aria-labelledby="upcoming-title">
  <img class="figma-upcoming-art" src="/assets/home/ap200-banner-2x.webp" alt="AP200 professional video light with a circular RGB emitter" width="1400" height="651" loading="lazy" decoding="async">
  <img class="figma-upcoming-backdrop" src="/assets/home/ap200-backdrop.webp" alt="" width="1400" height="651" loading="lazy" decoding="async">
  <img class="figma-upcoming-mobile" src="/assets/home/ap200-product-2x.webp" alt="" width="588" height="563" loading="lazy" decoding="async">
  <div class="figma-product-copy"><div class="figma-product-details"><p class="figma-product-type">Bi-Colour &amp; RGB Light</p><div class="figma-product-title"><h2 id="upcoming-title">AP200</h2><p class="figma-product-tagline">Professional Video Light</p></div></div><span class="figma-outline-cta upcoming-status">Coming Soon</span></div>
</section>`;}

export function home(){return `${cinematicHero()}<div class="home-collection" id="collection"><div class="figma-product-grid">${productTile('300w','Bi-Colour Video Light','Shape Your Vision')}${productTile('ap620','RGB Handheld Light','Paint Your Story')}${productTile('ap3250','RGB LED Panel','Your Colour. Your Creation.')}${productTile('ap336','LED Video Light','Light Every Detail')}</div>${upcomingProduct()}</div>${homeSupport()}${homeNews()}`;}
