# Deploy Apkina to Vercel

The project includes editable source, all product photography, fonts, styles, scripts, and the complete generated website. It has no external package dependencies and no ecommerce functionality.

## Deployment

1. Unzip the project and upload its contents to a GitHub repository. Keep `package.json` and `vercel.json` at the repository root.
2. Import that repository as a new Vercel project.
3. The included `vercel.json` sets the framework to **Other**, the build command to **npm run build**, and the output directory to **dist**.
4. Deploy the project. No API keys or required environment variables are needed.

Canonical links and the sitemap automatically use Vercel's production domain. If you want a specific custom domain, set `PUBLIC_SITE_URL` to its complete URL, such as `https://www.your-domain.com`, and redeploy.

## Editing and rebuilding

- Page templates: `source/templates/`
- Product content: `catalog-source.json` and `source/catalog.mjs`
- Photography, fonts, CSS, and JavaScript: `dist/assets/`
- Black footer and shared layout: `dist/assets/site.css` and `dist/assets/site-layout.css`
- Homepage hero and creator section: `dist/assets/hero.css` and `dist/assets/creator.css`

Run `npm run build` after editing templates or product content. Run `npm run check` after the build to check local links, images, product specifications, and generated page contracts.

Retain `dist/assets/`: the build regenerates pages, metadata, and specification downloads, while the supplied photography, fonts, styles, and browser scripts remain in that directory. Do not delete `dist/` before building.

Browser visual testing was unavailable in the original build environment. Static release checks and product-image reviews were completed.

Configuration reference: https://vercel.com/docs/project-configuration/vercel-json

Production-domain variables: https://vercel.com/docs/environment-variables/system-environment-variables
