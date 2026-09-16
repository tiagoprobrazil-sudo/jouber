# Atelier Saint Sebastian

React + TypeScript + Vite storefront, backed by Supabase (DB, auth, edge
functions) and Stripe. Live at [ateliersaintsebastian.com](https://ateliersaintsebastian.com).

## Deployment

**Production (`ateliersaintsebastian.com`) is Cloudflare Pages/Workers,
connected to this repo's GitHub remote.** Deploying is just:

```sh
git push origin master
```

Cloudflare builds and publishes automatically on push. Environment variables
(`VITE_SUPABASE_URL`, `VITE_STRIPE_PUBLISHABLE_KEY`, `VITE_EXUCAVEIRA_PARTNER_KEY`,
etc.) live in the Cloudflare dashboard under the `jouber` project's
**Settings → Environment variables** — changing one there requires a fresh
deployment to take effect (a plain env-var save does not rebuild; push a
commit, even an empty one with `git commit --allow-empty`, to force a
rebuild).

Supabase migrations and edge functions are separate from the site build and
need their own deploy step (from a machine with `npx supabase login` done,
or `SUPABASE_ACCESS_TOKEN` set):

```sh
npx supabase db push
npx supabase functions deploy <function-name>
```

**`npm run deploy` (`scripts/deploy.mjs`) is NOT the production deploy** —
it FTP-uploads `dist/` to a staging path (`artbit.com.br/jouber/`, an old
addon-domain leftover from before the Cloudflare Pages migration). It's
only useful for eyeballing a build before pushing; it prints a warning
every time to avoid confusion. `.env` (local, git-ignored) only matters for
`npm run dev` / local builds — it has no effect on the real Cloudflare
deploy.

## React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
