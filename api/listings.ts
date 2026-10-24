// GET  /api/listings — postings published to everyone (still open).
// POST /api/listings — publish a posting. Requires the publisher code (PUBLISHER_CODE)
// so random visitors can't post to every student or trigger WhatsApp messages.
// Every new posting always alerts each subscriber whose majors and level match;
// publishers can't turn this off.
import type { IncomingMessage, ServerResponse } from 'node:http'
import { fanOut } from './_lib/alerts.js'
import type { StoredListing } from './_lib/catalog.js'
import { cleanListing } from './_lib/catalog.js'
import { db, keys, storeReady } from './_lib/store.js'
import { baseUrl, env, rateLimited, readJson, sameSecret, send } from './_lib/whatsapp.js'

interface Body {
  code?: string
  listing?: unknown
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (!storeReady()) return send(res, 503, { error: 'no_database', message: 'Publishing needs a database. See the README.' })

  if (req.method === 'GET') {
    const now = Date.now()
    const ids = await db.smembers(keys.listings)
    const all = await db.mget<StoredListing>(ids.map(keys.listing))
    const open = all.filter((l): l is StoredListing => Boolean(l && l.opp.deadline > now)).sort((a, b) => b.opp.posted - a.opp.posted)
    return send(res, 200, { listings: open })
  }
  if (req.method !== 'POST') return send(res, 405, { error: 'method_not_allowed' })
  if (rateLimited(req, 10)) return send(res, 429, { error: 'rate_limited', message: 'Too many requests. Try again in a minute.' })

  const body = await readJson<Body>(req)
  if (!env.publisherCode()) return send(res, 403, { error: 'publishing_disabled', message: 'Set PUBLISHER_CODE on the server to enable publishing.' })
  if (!sameSecret(String(body?.code ?? ''), env.publisherCode())) return send(res, 403, { error: 'bad_code', message: 'That publisher code is not right.' })

  const listing = cleanListing(body?.listing, Date.now())
  if (typeof listing === 'string') return send(res, 400, { error: 'bad_listing', message: listing })
  await db.set(keys.listing(listing.opp.id), listing)
  await db.sadd(keys.listings, listing.opp.id)

  // Always alert matching students. Without a WhatsApp token, fanOut still reports how many matched.
  const alerts = await fanOut(listing.opp, 'new', baseUrl(req))
  send(res, 200, { ok: true, listing, alerts })
}
