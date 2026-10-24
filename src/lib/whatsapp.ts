// Browser side of the WhatsApp alerts and shared postings. Talks only to our own
// /api functions; the Meta access token and publisher code check stay on the server.
import type { OppDetails } from '../data/details'
import type { MajorId } from '../data/majors'
import type { Opportunity } from '../data/opportunities'
import { relativeDay } from './time'

export type ApiError = { ok: false; error: string; message: string }
export type WaResult = { ok: true; welcomed?: boolean; stored?: boolean; warning?: string } | ApiError

const NOT_CONNECTED: ApiError = { ok: false, error: 'not_configured', message: 'WhatsApp isn’t connected on this site yet.' }

async function call<T extends object>(path: string, body?: unknown): Promise<({ ok: true } & T) | ApiError> {
  try {
    const r = await fetch(`/api/${path}`, body === undefined ? undefined : {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    // A static host without the functions returns 404 or HTML.
    if (r.status === 404 || !(r.headers.get('content-type') ?? '').includes('json')) return NOT_CONNECTED
    const data = (await r.json()) as { ok?: boolean; error?: string; message?: string } & T
    if (r.ok && (data.ok || body === undefined)) return { ...data, ok: true }
    return { ok: false, error: data.error ?? 'send_failed', message: data.message ?? 'Something went wrong. Try again.' }
  } catch {
    return NOT_CONNECTED
  }
}

/** Save the student's WhatsApp number and criteria, and send the welcome message. */
export const subscribeWhatsApp = (phone: string, name: string, majors: MajorId[], level: number) =>
  call<{ welcomed?: boolean; stored?: boolean; warning?: string }>('whatsapp/subscribe', { phone, name, majors, level }) as Promise<WaResult>

export function sendListingToWhatsApp(phone: string, o: Opportunity, now: number) {
  return call('whatsapp/notify', {
    phone,
    listing: { title: o.title, org: o.org, pay: o.stipend, closes: relativeDay(o.deadline, now), url: `/#/app/${o.id}` },
  })
}

export interface ServerListing {
  opp: Opportunity
  details: OppDetails
}

export interface AlertReport {
  matched: number
  sent: number
  failed: number
  skipped: number
  errors: string[]
}

/** Publish a posting to every student; matching subscribers always get a WhatsApp alert. */
export const publishListing = (code: string, listing: ServerListing) =>
  call<{ listing: ServerListing; alerts: AlertReport }>('listings', { code, listing })

/** Postings published to everyone (empty when the server isn't set up). */
export async function fetchServerListings(): Promise<ServerListing[]> {
  const res = await call<{ listings: ServerListing[] }>('listings')
  return res.ok ? res.listings ?? [] : []
}

/** wa.me link that opens a chat with the InternGH business number (opens the 24-hour window). */
export function chatLink(text = 'Hi InternGH') {
  const n = (import.meta.env.VITE_WHATSAPP_NUMBER ?? '').replace(/\D/g, '')
  return n ? `https://wa.me/${n}?text=${encodeURIComponent(text)}` : null
}
