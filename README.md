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

## WhatsApp alerts (Meta WhatsApp Cloud API)

Real WhatsApp messages are sent by small serverless functions in `api/whatsapp/` so the Meta access token never reaches the browser. Without the keys below, the app falls back to a preview and nothing is sent.

| Function | What it does |
| --- | --- |
| `POST /api/whatsapp/subscribe` | Sends the welcome message when a student turns on alerts (an approved template) |
| `POST /api/whatsapp/notify` | Sends one listing ("WhatsApp me this" in a job's details) |
| `GET/POST /api/whatsapp/webhook` | Meta's webhook: verifies the handshake and replies when a student messages InternGH |
| `GET /api/whatsapp/status` | Tells the site whether WhatsApp is configured |
| `GET/POST /api/listings` | Shared postings. Publishing (with the publisher code) WhatsApps every matching subscriber |
| `GET /api/cron/deadlines` | Runs daily at 08:00 (Vercel Cron) and sends deadline reminders 3 days and 1 day before |

**How matching works:** when a student signs up with their WhatsApp number (or turns on alerts), their majors and level are saved. Every posting published with the publisher code **always** sends a WhatsApp to every active subscriber whose major is in the posting's majors **and** whose level is eligible. Publishers can't turn this off. The daily job then reminds the same students before the deadline. Each student gets each alert once. Students can reply STOP or START in WhatsApp.

### 1. Get your Meta keys (free test setup)

1. Go to [developers.facebook.com](https://developers.facebook.com), create an app (type **Business**) and add the **WhatsApp** product.
2. In **WhatsApp → API Setup** you get a free **test phone number**. Copy the **Phone number ID** and a **temporary access token**.
3. Under **To**, add and verify the phone numbers you'll test with. In test mode, messages only go to numbers on this list.
4. For anything longer than a demo, create a **permanent token**: Business Settings → System users → add a system user → generate a token with `whatsapp_business_messaging`.
5. Copy your **App secret** from **App settings → Basic**.

### 2. Add the keys

Copy `.env.example` to `.env.local` for local development, and add the same variables in **Vercel → Project → Settings → Environment Variables**:

```
WHATSAPP_TOKEN=...            # access token
WHATSAPP_PHONE_NUMBER_ID=...  # from API Setup
WHATSAPP_VERIFY_TOKEN=...     # any random string you choose
WHATSAPP_APP_SECRET=...       # verifies webhook signatures
APP_URL=https://your-project.vercel.app
VITE_WHATSAPP_NUMBER=...      # the business number, digits with country code (for the "Open chat" button)
```

`.env.local` is ignored by Git. Never commit tokens. Redeploy on Vercel after changing variables.

### 3. Add the database and publisher code

1. In Vercel, open your project → **Storage** (or **Marketplace**) → add **Upstash for Redis** (free tier) and connect it to the project. This adds `KV_REST_API_URL` and `KV_REST_API_TOKEN`.
2. Add `PUBLISHER_CODE` (a secret code you give to trusted publishers) and `CRON_SECRET` (any long random string).
3. Redeploy. `vercel.json` schedules the reminder job daily at 08:00 Ghana time.

Locally, without Redis, `npm run dev` keeps subscribers and postings in memory. You can trigger reminders by hand with `http://localhost:5173/api/cron/deadlines`, or pretend it's another day with `?now=<timestamp in ms>`.

### 4. Connect the webhook (after deploying)

In **WhatsApp → Configuration → Webhook**, set:
- Callback URL: `https://your-project.vercel.app/api/whatsapp/webhook`
- Verify token: the same value as `WHATSAPP_VERIFY_TOKEN`

Then subscribe to the **messages** field.

### 5. Try it

1. Sign up (or open **Get alerts**) with a number from your test list, for example Statistics, 200-level. The `hello_world` template arrives on that phone.
2. Reply to it. This opens WhatsApp's 24-hour window, so InternGH can send normal messages without templates.
3. Go to **Post an opportunity**, pick Statistics and 200-level, enter your publisher code, and publish. The phone gets the new-posting alert.
4. Reminders arrive automatically 3 days and 1 day before the deadline.

### How WhatsApp's rules affect the app

- **Business-started messages must be approved templates.** The welcome message uses Meta's built-in `hello_world` until you create your own in **WhatsApp Manager → Message templates**, then set `WHATSAPP_WELCOME_TEMPLATE` (body variables: `{{1}}` first name, `{{2}}` majors).
- **Normal messages only work for 24 hours after the student last messaged you.** Outside that window, "WhatsApp me this" asks the student to say hi first, or uses `WHATSAPP_ALERT_TEMPLATE` if you set one (`{{1}}` role, `{{2}}` organisation, `{{3}}` closes, `{{4}}` link).
- **Matching and deadline alerts reach students days later**, so in production they need approved templates. Create two **Utility** templates in WhatsApp Manager and set them:
  - `WHATSAPP_MATCH_TEMPLATE`, e.g. *"New opportunity for you: {{1}} at {{2}}. Pay: {{3}}. Closes {{4}}. View and apply: {{5}}"*
  - `WHATSAPP_DEADLINE_TEMPLATE`, e.g. *"Reminder: {{1}} at {{2}} closes {{3}}. Apply here: {{4}}"*

  Until then, alerts are sent as normal messages, which only reach students who messaged InternGH in the last 24 hours. Failed sends are retried on the next run.

## Project layout

- `src/pages` — welcome, about, sign-in, demo apply page, post an opportunity
- `src/MainApp.tsx` — the signed-in app (explore, deadlines, saved)
- `src/components` — cards, details panel, filters, AI assistant, alerts
- `src/data` — majors, opportunities and job details (demo data)
- `src/lib` — matching, the demo assistant, routing, motion effects
- `api/whatsapp` — serverless functions for WhatsApp (Vercel); also served by `npm run dev`

## Scripts

- `npm run dev` — dev server
- `npm run build` — type-check and build to `dist/`
- `npm run preview` — serve the built `dist/` locally
- `npm run lint` — ESLint
