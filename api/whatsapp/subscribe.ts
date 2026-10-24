// POST /api/whatsapp/subscribe — saves a student's WhatsApp number and criteria
// (majors + level) so matching postings and deadline reminders reach them, then
// sends the welcome message. Business-initiated messages must be approved
// templates: the default is Meta's `hello_world`; set WHATSAPP_WELCOME_TEMPLATE to
// your own with two body variables: {{1}} first name, {{2}} majors.
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Subscriber } from '../_lib/catalog.js'
import { LEVELS, MAJOR_NAMES } from '../_lib/catalog.js'
import { db, keys, storeReady } from '../_lib/store.js'
import { env, explain, isConfigured, normalizePhone, rateLimited, readJson, send, sendTemplate } from '../_lib/whatsapp.js'

interface Body {
  phone?: string
  name?: string
  majors?: string[]
  level?: number
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') return send(res, 405, { error: 'method_not_allowed' })
  if (!storeReady() && !isConfigured()) return send(res, 503, { error: 'not_configured', message: 'WhatsApp alerts are not connected on this deployment.' })
  if (rateLimited(req)) return send(res, 429, { error: 'rate_limited', message: 'Too many requests. Try again in a minute.' })

  const body = await readJson<Body>(req)
  const phone = normalizePhone(body?.phone ?? '')
  if (!phone) return send(res, 400, { error: 'bad_phone', message: 'Enter a valid phone number.' })
  const majors = (body?.majors ?? []).filter(m => m in MAJOR_NAMES).slice(0, 10)
  const level = Number(body?.level)
  if (!majors.length || !LEVELS.includes(level)) return send(res, 400, { error: 'bad_criteria', message: 'Pick at least one major and your level.' })
  const name = String(body?.name ?? '').trim().slice(0, 60)

  // 1. Save the criteria (re-subscribing updates them).
  let stored = false
  if (storeReady()) {
    const prev = await db.get<Subscriber>(keys.subscriber(phone))
    const sub: Subscriber = { phone, name: name || prev?.name || '', majors, level, active: true, createdAt: prev?.createdAt ?? Date.now() }
    await db.set(keys.subscriber(phone), sub)
    await db.sadd(keys.subscribers, phone)
    stored = true
  }

  // 2. Welcome message.
  if (!isConfigured()) return send(res, 200, { ok: true, stored, welcomed: false })
  const first = name.split(/\s+/)[0]?.slice(0, 40) || 'there'
  const template = env.welcomeTemplate()
  try {
    const id = await sendTemplate(phone, template, template === 'hello_world' ? [] : [first, majors.map(m => MAJOR_NAMES[m]).join(', ')])
    send(res, 200, { ok: true, stored, welcomed: true, id })
  } catch (e) {
    const { status, ...err } = explain(e)
    // Saved but the welcome failed: still a successful sign-up, report why.
    if (stored) return send(res, 200, { ok: true, stored, welcomed: false, warning: err.message })
    send(res, status, err)
  }
}
