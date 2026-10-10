# Apkina catalogue — rebuilt from scratch

Static, responsive catalogue for nine products, with dedicated product pages, product comparison, creative guides and support information. There is no ecommerce functionality.

## Build

Run `node build.mjs` to generate the pages, catalogue JSON, specification downloads and sitemap. Run `node check.mjs` for the static delivery checks. Site assets and styles live in `dist/assets`; page templates live in `source/templates`.

## Reference and layout

The public Hollyland homepage and a representative product page were inspected on 10 October 2026. The layout uses a floating dark header, cinematic homepage hero, responsive container widths, campaign block, four-product grid, creator story section, editorial blocks, support tiles and black footer. Product pages use a large centred hero with Compare CTA, highlights mosaic, gallery, editorial typography and borderless specifications.

Review and customer-story regions contain product spotlights and original educational guides because no Apkina customer reviews or stories were supplied. Shopping links are replaced by catalogue links; there is no cart, checkout, pricing, payment or ordering flow.

HarmonyOS Sans regular, medium and bold font files are served locally. Their source is the Hollyland theme's publicly served `wp-content/themes/understrap-child/fonts/` assets, obtained during reference inspection.

## Product source and image fidelity

`catalog-source.json` was transcribed from the supplied **Apkina Product Images and Specs.docx**. The nine extracted source images are retained under `source/reference-images/`. `source/catalog.mjs` supplies presentation text without changing the source specifications.

Generated product assets were edited from the corresponding supplied images, with explicit instructions to preserve geometry, visible faces, controls, proportions and accessories while removing branding, packaging and extraneous diagrams. The previous freely interpreted product renders are not used. Prompts and source mappings are recorded in `source/prompts-*.json`.

AP1000 now uses the exact original 1024 × 1536 image supplied in the Apkina Figma design (node 25:9), replacing the packaging-derived image. The PNG source is preserved under `source/brand/`; its SHA-1 matches the Figma image hash and its lossless WebP has identical RGBA pixels. SAB234 has a limited source reference: only its packaging drawing was provided. At the user’s explicit request, SAB234 uses an unbranded photorealistic product render developed from the source outline. Its three leg clasps and distinctive head/handle are retained; material finish and unseen geometry are inferred. It is labelled as a product visualisation rather than a verified photograph.

The charger photograph has one visible charging slot. Its published content avoids a slot-count claim because the supplied description and photograph do not agree on that detail. Variant-dependent tripod dimensions, head and carry-bag information are retained as supplied.

The three environmental images are generated backgrounds. Each product page now also has a professional in-use scene generated with the matching product reference, available at `dist/assets/*-in-use.webp`. Exact built-in ImageGen prompts, references and QA notes are preserved in `source/prompts-inuse-*.json`. These are illustrative commercial scenes, not customer testimonials. Product images are unbranded and contain no orange or blue packaging. Functional display symbols are retained where visible.

The uploaded `APKINA LOGO(2).svg` is preserved without path changes in `source/brand/apkina-logo.svg` and copied to `dist/assets/apkina-logo.svg` during builds. It replaces the text-only logo in navigation, footer, campaigns and About. The white-header version uses a black CSS filter; the favicon uses the supplied emblem path. Products remain unbranded.

## Interactions and verification

The site includes product filtering, search, comparison of up to three products, image enlargement, carousel controls, responsive navigation, specification downloads and support filtering. Comparison choices are stored only in the visitor's browser.

Validation covers generated routes, local links and assets, fragment targets, catalogue completeness and source specifications. Product images were visually reviewed against the source; limited-reference transparent images were checked on both pale and dark backgrounds. JavaScript syntax is checked with Node.

Browser-level rendering and interaction QA could not run because the required browser-control capability is unavailable in the managed environment. Desktop and mobile visual parity is therefore not claimed as browser-verified.

## Animated hero update

The homepage hero follows the supplied Figma hero’s black/violet stage, silver display title, rounded frame, floating dark navigation and centred product composition. It uses the original AP1000 Figma asset and latest uploaded logo. The Figma frame has no exported motion tracks; slow ambient light, gentle product float and bounded desktop pointer response were authored for this request. Motion can be paused, respects reduced-motion preferences, and stops while offscreen or the page is hidden. Other pages retain their existing layout.

Hero code lives in `dist/assets/hero.css`, `dist/assets/hero-motion.js` and the homepage template. Design provenance and export limitations are recorded in `source/hero-figma-reference.json`.

## Full photography refresh — 10 October 2026

All 21 live photographic assets were refreshed: nine product views, nine product-in-use scenes and three shared editorial backgrounds. AP1000 uses the supplied Figma source unchanged; the other views and scenes were produced with built-in ImageGen using the product references. All people are adult men; remaining scenes use inanimate objects. Light-emitting faces and camera lenses point toward their subjects, with consistent illumination, credible mounts, power connections and contact shadows. Products, props and clothing remain unbranded, with no packaging. Captions and alt text describe the new scenes. Full prompts, source mappings, output paths and photo QA are recorded in `source/prompts-photo-refresh-*.json` and `source/image-generation-manifest.json`.

All 21 photographic assets passed image review. The 19 non-AP1000 assets passed independent review; the AP1000 original is hash- and pixel-verified, and its final side/rear usage scene clearly aims the emitting face at the male subject. Browser rendering remains untested because the managed environment lacks its required browser-control capability.

## Shared header and section corners

The floating dark navigation is shared across all 22 rendered pages, with fixed-header clearance on inner pages. Shared layout styles live in `dist/assets/site-layout.css`. Visible section panels, product imagery cards, editorial banners, product galleries, related product tiles, About hero and footer follow the homepage hero’s 30px desktop / 24px mobile radius. Circular controls and pill buttons retain their intended shapes. Product navigation bars have been removed; each product hero has a Compare CTA that preserves current-product preselection. Global scroll padding and a small product section margin clear the shared header for anchor links.

## Creator story section

The homepage creator section uses an editorial split with a dark violet text panel, larger heading, supporting copy and direct product/setup links. The studio photo preserves its complete aspect ratio and both male subjects. The section stacks on smaller screens and retains the shared section radius. Its stylesheet is `dist/assets/creator.css`; no new imagery or interaction dependencies are introduced.

Product highlight values now wrap at word boundaries. Status words and longer tokens use compact sizing, and the mosaic reflows on tablets and narrow phones to keep complete words and ranges readable. Actual local-font measurements were checked against the smallest card widths; browser rendering remains untested.

## Vercel deployment

The supplied `vercel.json` configures the static build and `dist` output. See `VERCEL-DEPLOYMENT.md` for deployment and editing instructions. Canonical URLs and the sitemap use a configurable site origin, with automatic Vercel production-domain detection. The footer background is pure black across all pages.
