# web

React + Vite + Tailwind CSS frontend. Backend lives in `../api` (GoFrame).

## Development

```powershell
pnpm install
pnpm dev
```

Dev server runs on `http://localhost:5173`. Requests to `/api/*` are proxied to the backend at `http://127.0.0.1:8000`.

## Project Structure

- `src/main.tsx` - React entrypoint; imports `src/index.css` and mounts `src/App.tsx` into the `#root` element
- `src/App.tsx` - Primary application component and the usual starting point for UI work
- `src/index.css` - Global CSS entrypoint and Tailwind CSS v4 import
- `index.html` - Vite HTML shell containing the `#root` element and loading `src/main.tsx`
- `package.json` - Dependencies and the dev, build, preview, and format scripts
- `vite.config.ts` - React, Tailwind CSS v4, the `@` alias for `src`, and the `/api` dev proxy

## Styling

Tailwind CSS v4 is wired through the `@tailwindcss/vite` plugin; `src/index.css` imports it with `@import 'tailwindcss';`. Use Tailwind utility classes directly in JSX. Global CSS and theme customization belong in `src/index.css`. No Tailwind or PostCSS config file is needed.

Put global element styles (resets, defaults for `body`, headings, `button`, `input`) inside `@layer base { ... }` so utility classes still win. Tailwind Preflight already handles `box-sizing`, default margins, and `font: inherit` on form controls — do not repeat those rules.
