# InternGH

Find your next opportunity by major. A demo web app that puts internships, fellowships, workshops and training programs for University of Ghana students in one place, matched to each student's major and level.

All companies, listings and people in the app are fictional demo data.

## Run locally

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

## Host on Replit

The project is already set up for Replit (`.replit` and `vite.config.ts`).

1. Sign in at [replit.com](https://replit.com) and create a new Replit App (choose the **Node.js** template, or import this folder from GitHub if you've pushed it there).
2. Upload the project files into the app (drag the folder contents into the Files panel). Don't upload `node_modules` or `dist`.
3. Press **Run**. Replit installs dependencies and starts the dev server on port 5000; the preview opens in the Webview.
4. To get a public link, open **Publish** (Deploy), choose **Static**, and check:
   - Build command: `npm install && npm run build`
   - Public directory: `dist`
5. Publish. Replit gives you a `*.replit.app` URL.

The app uses hash routes (`#/app`, `#/about`, `#/signin`...), so no rewrite rules are needed on a static host.

If the build fails with a Node.js version error, change the first line of `.replit` to `modules = ["nodejs-22", "web"]` (Vite needs Node 20.19+ or 22.12+).

## Project layout

- `src/pages` — welcome, about, sign-in, demo apply page, post an opportunity
- `src/MainApp.tsx` — the signed-in app (explore, deadlines, saved)
- `src/components` — cards, details panel, filters, AI assistant, alerts
- `src/data` — majors, opportunities and job details (demo data)
- `src/lib` — matching, the demo assistant, routing, motion effects

## Scripts

- `npm run dev` — dev server
- `npm run build` — type-check and build to `dist/`
- `npm run preview` — serve the built `dist/` locally
- `npm run lint` — ESLint
