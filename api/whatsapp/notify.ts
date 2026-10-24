// POST /api/whatsapp/notify — sends one listing to a student's WhatsApp.
// Free-form text works within 24 hours of the student messaging InternGH. Outside
// that window it falls back to WHATSAPP_ALERT_TEMPLATE if set ({{1}} role,
// {{2}} organisation, {{3}} closes, {{4}} link); otherwise it asks the student to say hi first.
import type { IncomingMessage, ServerResponse } from 'node:http'
import { env, explain, isConfigured, normalizePhone, rateLimited, readJson, send, sendTemplate, sendText, WhatsAppError, WINDOW_CLOSED } from '../_lib/whatsapp.js'

interface Body {
  phone?: string
  listing?: { title?: string; org?: string; pay?: string; closes?: string; url?: string }
}

const clip = (s: unknown, n: number) => String(s ?? '').replace(/\s+/g, ' ').trim().slice(0, n)

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') return send(res, 405, { error: 'method_not_allowed' })
  if (!isConfigured()) return send(res, 503, { error: 'not_configured', message: 'WhatsApp is not connected on this deployment.' })
  if (rateLimited(req, 10)) return send(res, 429, { error: 'rate_limited', message: 'Too many requests. Try again in a minute.' })

  const body = await readJson<Body>(req)
  const to = normalizePhone(body?.phone ?? '')
  if (!to) return send(res, 400, { error: 'bad_phone', message: 'Add a valid phone number in Get alerts first.' })
  const l = body?.listing ?? {}
  const title = clip(l.title, 90)
  const org = clip(l.org, 80)
  if (!title || !org) return send(res, 400, { error: 'bad_listing' })
  const pay = clip(l.pay, 60)
  const closes = clip(l.closes, 40)
  // Only link back to this app, never to an arbitrary URL from the request.
  const base = env.appUrl() || `https://${req.headers['x-forwarded-host'] ?? req.headers.host ?? ''}`
  const path = /^\/#\/app\/[\w-]+$/.test(clip(l.url, 120)) ? clip(l.url, 120) : '/#/app'
  const link = base.replace(/\/$/, '') + path

  const lines = [`*${title}*`, org]
  if (pay) lines.push(`Pay: ${pay}`)
  if (closes) lines.push(`Closes ${closes}`)
  lines.push('', `View and apply: ${link}`, '', '— InternGH')
  const text = lines.join('\n')

  try {
    const id = await sendText(to, text)
    return send(res, 200, { ok: true, id })
  } catch (e) {
    if (e instanceof WhatsAppError && e.code === WINDOW_CLOSED && env.alertTemplate()) {
      try {
        const id = await sendTemplate(to, env.alertTemplate(), [title, org, closes || 'soon', link])
        return send(res, 200, { ok: true, id, template: true })
      } catch (e2) {
        const { status, ...err } = explain(e2)
        return send(res, status, err)
      }
    }
    const { status, ...err } = explain(e)
    send(res, status, err)
  }
}
