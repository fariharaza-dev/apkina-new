# Apkina — Vercel project

This is the complete current Apkina website: editable source, full-resolution photography, local fonts, styles, scripts, product specification downloads, and the generated static site.

It includes nine product pages, Explore and its three guides, the revised homepage cards, the uploaded favicon, shared full-width footer, contact links, and the latest navbar spacing. There are 19 routes plus a custom 404 page. About and Support pages have been removed.

## Deploy

Unzip this archive, open the `apkina-vercel` folder, and follow [VERCEL-DEPLOYMENT.md](VERCEL-DEPLOYMENT.md). The included `vercel.json` already configures the build and output directory.

## Build and check

Use Node.js and run these commands from the folder containing `package.json`:

```sh
npm run build
npm run check
```

The project has no external npm dependencies. The build generates HTML pages, product data, specification downloads, and the sitemap in `dist/`.

Keep `dist/assets/` in the project and in your Git repository. It contains the photography, fonts, CSS, and browser scripts used by the build; those files are supplied assets and are not regenerated.

## Edit

- Page templates: `source/templates/`
- Product presentation: `source/catalog.mjs`
- Supplied product specifications: `catalog-source.json`
- Product page design data: `source/product-page-design.mjs`
- Images, fonts, CSS, and JavaScript: `dist/assets/`
- Logo and favicon sources: `source/brand/`
- Site origin and canonical URL configuration: `source/site-origin.mjs`
- Font licenses and image provenance: `source/font-licenses/` and the JSON manifests in `source/`

The website is a static catalogue with search, filtering, comparison, image enlargement, specification downloads, and direct contact links. It has no ecommerce checkout, server, database, or required API keys.

Exported from source commit `5d49334c8e8d2fbadb35dc2f4278c8dc1d1714e3` on 25 October 2026.
