// Shared helpers for the WhatsApp Cloud API functions. Files under api/_lib are
// not routes on Vercel. Secrets come from environment variables only; nothing
// here is ever sent to the browser.
import { createHmac, timingSafeEqual } from 'node:crypto'
import type { IncomingMessage, ServerResponse } from 'node:http'

export const env = {
  token: () => process.env.WHATSAPP_TOKEN ?? '',
  phoneNumberId: () => process.env.WHATSAPP_PHONE_NUMBER_ID ?? '',
  verifyToken: () => process.env.WHATSAPP_VERIFY_TOKEN ?? '',
  appSecret: () => process.env.WHATSAPP_APP_SECRET ?? '',
  // v25.0 is supported until July 2028; override when Meta deprecates it.
  apiVersion: () => process.env.WHATSAPP_API_VERSION || 'v25.0',
  welcomeTemplate: () => process.env.WHATSAPP_WELCOME_TEMPLATE || 'hello_world',
  alertTemplate: () => process.env.WHATSAPP_ALERT_TEMPLATE || '',
  // Approved templates for business-initiated alerts (see README). Without them,
  // alerts fall back to free-form text, which only reaches students who messaged in the last 24h.
  matchTemplate: () => process.env.WHATSAPP_MATCH_TEMPLATE || '',
  deadlineTemplate: () => process.env.WHATSAPP_DEADLINE_TEMPLATE || '',
  templateLang: () => process.env.WHATSAPP_TEMPLATE_LANG || 'en_US',
  appUrl: () => process.env.APP_URL || '',
  publisherCode: () => process.env.PUBLISHER_CODE || '',
  cronSecret: () => process.env.CRON_SECRET || '',
  reminderDays: () => (process.env.REMINDER_DAYS || '3,1').split(',').map(Number).filter(n => n > 0),
}

/** Constant-time string comparison for codes and secrets. */
export function sameSecret(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b)
  return x.length === y.length && x.length > 0 && timingSafeEqual(x, y)
}

export const baseUrl = (req: IncomingMessage) =>
  (env.appUrl() || `https://${req.headers['x-forwarded-host'] ?? req.headers.host ?? ''}`).replace(/\/$/, '')

export const isConfigured = () => Boolean(env.token() && env.phoneNumberId())

// ---------- HTTP helpers (work on Vercel and in the Vite dev server) ----------

export function send(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(body))
}

export async function readRaw(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = []
  for await (const c of req) chunks.push(typeof c === 'string' ? Buffer.from(c) : (c as Buffer))
  return Buffer.concat(chunks).toString('utf8')
}

export async function readJson<T>(req: IncomingMessage): Promise<T | null> {
  try {
    const raw = await readRaw(req)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export const queryOf = (req: IncomingMessage) => new URL(req.url ?? '/', 'http://localhost').searchParams

// Best-effort rate limit per IP and endpoint (in memory, per function instance).
const hits = new Map<string, number[]>()
export function rateLimited(req: IncomingMessage, max = 5, windowMs = 60_000) {
  const ip = String(req.headers['x-forwarded-for'] ?? req.socket?.remoteAddress ?? 'unknown').split(',')[0].trim()
  const key = `${ip} ${new URL(req.url ?? '/', 'http://localhost').pathname}`
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter(t => now - t < windowMs)
  recent.push(now)
  hits.set(key, recent)
  return recent.length > max
}

// ---------- phone numbers ----------

/** "024 123 4567", "241234567", "+233 24 123 4567" -> "+233241234567". Other countries need a leading +. */
export function normalizePhone(input: string): string | null {
  const trimmed = input.trim()
  const digits = trimmed.replace(/\D/g, '')
  if (trimmed.startsWith('+')) return /^\d{8,15}$/.test(digits) ? `+${digits}` : null
  if (digits.startsWith('233') && digits.length === 12) return `+${digits}`
  const local = digits.replace(/^0/, '')
  return local.length === 9 ? `+233${local}` : null
}

// ---------- Cloud API ----------

export class WhatsAppError extends Error {
  status: number
  code: number | undefined
  constructor(message: string, status: number, code?: number) {
    super(message)
    this.status = status
    this.code = code
  }
}

async function post(payload: Record<string, unknown>) {
  const url = `https://graph.facebook.com/${env.apiVersion()}/${env.phoneNumberId()}/messages`
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.token()}` },
    body: JSON.stringify({ messaging_product: 'whatsapp', recipient_type: 'individual', ...payload }),
  })
  const data = (await r.json().catch(() => ({}))) as { error?: { message?: string; code?: number }; messages?: { id: string }[] }
  if (!r.ok || data.error) throw new WhatsAppError(data.error?.message ?? `WhatsApp API error ${r.status}`, r.status, data.error?.code)
  return data.messages?.[0]?.id ?? ''
}

export const sendText = (to: string, body: string) => post({ to, type: 'text', text: { preview_url: true, body } })

export function sendTemplate(to: string, name: string, params: string[] = []) {
  return post({
    to,
    type: 'template',
    template: {
      name,
      language: { code: env.templateLang() },
      ...(params.length ? { components: [{ type: 'body', parameters: params.map(text => ({ type: 'text', text })) }] } : {}),
    },
  })
}

/** Error code 131047: the 24-hour customer service window is closed, so only templates can be sent. */
export const WINDOW_CLOSED = 131047

/** Turn a Cloud API failure into a short message a student can act on. */
export function explain(e: unknown) {
  if (!(e instanceof WhatsAppError)) return { status: 502, error: 'send_failed', message: 'Could not reach WhatsApp. Try again in a minute.' }
  if (e.code === WINDOW_CLOSED)
    return { status: 409, error: 'window_closed', message: 'Say hi to InternGH on WhatsApp first, then try again.' }
  if (e.code === 190 || e.status === 401)
    return { status: 503, error: 'not_configured', message: 'WhatsApp access token is invalid or expired.' }
  if (/allowed list|not in allowed/i.test(e.message))
    return { status: 403, error: 'not_allowed', message: 'This number is not on the test list in your Meta dashboard yet.' }
  return { status: 502, error: 'send_failed', message: e.message }
}

// ---------- webhook signature ----------

/** Validate X-Hub-Signature-256 (HMAC-SHA256 of the raw body with the app secret). */
export function validSignature(raw: string, header: string | string[] | undefined) {
  const secret = env.appSecret()
  if (!secret) return true // not configured: allowed for local testing only (see README)
  const sig = String(header ?? '').replace(/^sha256=/, '')
  const expected = createHmac('sha256', secret).update(raw, 'utf8').digest('hex')
  return sig.length === expected.length && timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
}
