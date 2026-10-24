// GET /api/cron/deadlines — run daily by Vercel Cron (see vercel.json, 08:00 Ghana time).
// For each open posting closing in REMINDER_DAYS days (default 3 and 1), sends a
// WhatsApp reminder to every matching subscriber. Each reminder goes out at most once.
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { FanOutResult } from '../_lib/alerts.js'
import { fanOut } from '../_lib/alerts.js'
import type { StoredListing } from '../_lib/catalog.js'
import { daysUntil } from '../_lib/catalog.js'
import { db, keys, storeReady } from '../_lib/store.js'
import { baseUrl, env, queryOf, sameSecret, send } from '../_lib/whatsapp.js'

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  // Vercel Cron sends "Authorization: Bearer <CRON_SECRET>". Locally (not on Vercel) it may run without one.
  const auth = String(req.headers.authorization ?? '').replace(/^Bearer /, '')
  if (env.cronSecret() ? !sameSecret(auth, env.cronSecret()) : Boolean(process.env.VERCEL))
    return send(res, 401, { error: 'unauthorized' })
  if (!storeReady()) return send(res, 503, { error: 'no_database' })

  // ?now=<ms> lets you simulate another day when testing locally.
  const testNow = Number(queryOf(req).get('now'))
  const now = !process.env.VERCEL && testNow > 0 ? testNow : Date.now()
  const reminderDays = env.reminderDays()
  const ids = await db.smembers(keys.listings)
  const listings = (await db.mget<StoredListing>(ids.map(keys.listing))).filter((l): l is StoredListing => Boolean(l && l.opp.deadline > now))

  const report: { id: string; title: string; daysLeft: number; result: FanOutResult }[] = []
  for (const { opp } of listings) {
    const daysLeft = daysUntil(opp.deadline, now)
    if (!reminderDays.includes(daysLeft)) continue
    const when = daysLeft === 0 ? 'today' : daysLeft === 1 ? 'tomorrow' : `in ${daysLeft} days`
    const result = await fanOut(opp, 'deadline', baseUrl(req), when, `deadline:d${daysLeft}`)
    report.push({ id: opp.id, title: opp.title, daysLeft, result })
  }
  send(res, 200, { ok: true, checked: listings.length, reminders: report })
}
