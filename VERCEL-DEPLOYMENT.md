# Deploy Apkina to Vercel

Extract the ZIP first. The project root is the `apkina-vercel` folder containing `package.json` and `vercel.json`.

## Option 1: GitHub and the Vercel dashboard

1. Upload the contents of `apkina-vercel` to a GitHub repository, including `dist/assets/`.
2. Import that repository into Vercel as a new project.
3. Use the repository folder containing `package.json` as the Root Directory.
4. Confirm these settings, which are already specified in `vercel.json`:

| Setting | Value |
| --- | --- |
| Framework Preset | Other |
| Build Command | `npm run build` |
| Output Directory | `dist` |

5. Deploy.

## Option 2: Deploy the extracted folder with the CLI

Open a terminal in `apkina-vercel` and run:

```sh
npx vercel --prod
```

Follow the sign-in and project setup prompts. The CLI uploads the project and uses its included configuration to build it on Vercel.

## Domain and canonical URLs

For automatic canonical URLs and sitemap URLs, enable access to Vercel's System Environment Variables. The build uses `VERCEL_PROJECT_PRODUCTION_URL`, falling back to `VERCEL_URL`.

For a custom domain, set `PUBLIC_SITE_URL` to your complete production URL in Vercel's environment settings and redeploy. `PUBLIC_SITE_URL` takes precedence over Vercel's automatic domain values.

No API keys are required to render or use the catalogue.

## Local verification

```sh
npm run build
npm run check
```

To preview the generated site locally, serve `dist/` with a static HTTP server. For example, if Python is installed:

```sh
python3 -m http.server 8000 --directory dist
```

Open `http://localhost:8000/` in your browser.

The source and all static assets are included. Keep `dist/assets/` when editing or committing the project; the build reuses those assets.

## References

- [Vercel CLI deployment](https://vercel.com/docs/cli/deploy)
- [Vercel build configuration](https://vercel.com/docs/builds/configure-a-build)
- [Vercel system environment variables](https://vercel.com/docs/environment-variables/system-environment-variables)
