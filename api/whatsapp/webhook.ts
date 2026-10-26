// GET  /api/whatsapp/webhook — Meta's verification handshake.
// POST /api/whatsapp/webhook — incoming messages. Replying opens the 24-hour
// window, so /notify can then send free-form listing messages to that student.
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Subscriber } from '../_lib/catalog.js'
import { MAJOR_NAMES } from '../_lib/catalog.js'
import { db, keys, storeReady } from '../_lib/store.js'
import { env, isConfigured, queryOf, readRaw, send, sendText, validSignature } from '../_lib/whatsapp.js'

interface Status {
  id: string
  status: string // sent | delivered | read | failed
  recipient_id?: string
  errors?: { code?: number; title?: string; message?: string; error_data?: { details?: string } }[]
}

interface Incoming {
  entry?: { changes?: { field?: string; value?: { messages?: { id: string; from: string; type: string; text?: { body?: string } }[]; contacts?: { profile?: { name?: string } }[]; statuses?: Status[] } }[] }[]
}

// Meta retries failed deliveries, so ignore message ids we've already answered.
const seen = new Set<string>()

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method === 'GET') {
    const q = queryOf(req)
    const ok = q.get('hub.mode') === 'subscribe' && env.verifyToken() && q.get('hub.verify_token') === env.verifyToken()
    res.statusCode = ok ? 200 : 403
    res.setHeader('Content-Type', 'text/plain')
    return res.end(ok ? q.get('hub.challenge') ?? '' : 'Forbidden')
  }
  if (req.method !== 'POST') return send(res, 405, { error: 'method_not_allowed' })

  const raw = await readRaw(req)
  if (!validSignature(raw, req.headers['x-hub-signature-256'])) return send(res, 401, { error: 'bad_signature' })

  let payload: Incoming
  try {
    payload = JSON.parse(raw) as Incoming
  } catch {
    return send(res, 400, { error: 'bad_json' })
  }

  const app = env.appUrl() || `https://${req.headers['x-forwarded-host'] ?? req.headers.host ?? ''}`
  const replies: Promise<unknown>[] = []
  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (change.field !== 'messages') continue
      // Delivery reports: log failures with Meta's reason (visible in Vercel → Logs).
      for (const s of change.value?.statuses ?? []) {
        const to = s.recipient_id ? `+${s.recipient_id.slice(0, 3)}…${s.recipient_id.slice(-3)}` : '?'
        if (s.status === 'failed') {
          const err = s.errors?.[0]
          console.error('delivery failed', { to, code: err?.code, reason: err?.title, details: err?.error_data?.details ?? err?.message })
        } else {
          console.log('delivery status', { to, status: s.status })
        }
      }
      const name = change.value?.contacts?.[0]?.profile?.name?.split(' ')[0]
      for (const m of change.value?.messages ?? []) {
        if (seen.has(m.id)) continue
        seen.add(m.id)
        if (!isConfigured()) continue
        const text = (m.text?.body ?? '').trim()
        const phone = `+${m.from}`
        console.log('incoming message', { from: `${phone.slice(0, 4)}…${phone.slice(-3)}`, type: m.type })
        const sub = storeReady() ? await db.get<Subscriber>(keys.subscriber(phone)) : null
        let reply: string
        if (/^stop\b/i.test(text)) {
          if (sub) await db.set(keys.subscriber(phone), { ...sub, active: false })
          reply = "You've stopped InternGH alerts. Send START any time to turn them back on."
        } else if (/^start\b/i.test(text) && sub) {
          await db.set(keys.subscriber(phone), { ...sub, active: true })
          reply = `Alerts are back on for ${sub.majors.map(x => MAJOR_NAMES[x] ?? x).join(', ')} (${sub.level}-level).`
        } else {
          reply = [
            `Hi${name ? ` ${name}` : ''}! You're connected to *InternGH*.`,
            sub?.active
              ? `You'll get alerts here for new ${sub.majors.map(x => MAJOR_NAMES[x] ?? x).join(', ')} opportunities (${sub.level}-level) and before deadlines close.`
              : 'Turn on WhatsApp alerts in the app to hear about new opportunities for your major.',
            '',
            `Browse your matches: ${app.replace(/\/$/, '')}/#/app`,
            '',
            'Reply STOP to stop alerts.',
          ].join('\n')
        }
        replies.push(sendText(phone, reply).catch(e => console.error('webhook reply failed', e)))
      }
    }
  }
  await Promise.all(replies)
  // Always 200 so Meta doesn't retry; failures are logged above.
  send(res, 200, { ok: true })
}
