// Fan-out: send a WhatsApp alert about one posting to every matching subscriber.
import type { Listing, Subscriber } from './catalog.js'
import { formatDay, matches, MAJOR_NAMES } from './catalog.js'
import { db, keys } from './store.js'
import { env, isConfigured, sendTemplate, sendText } from './whatsapp.js'

export interface FanOutResult {
  matched: number
  sent: number
  failed: number
  skipped: number // already alerted about this posting
  errors: string[]
}

export async function activeSubscribers(): Promise<Subscriber[]> {
  const phones = await db.smembers(keys.subscribers)
  const subs = await db.mget<Subscriber>(phones.map(keys.subscriber))
  return subs.filter((s): s is Subscriber => Boolean(s?.active))
}

// Template variables can't contain newlines, so keep them single-line.
const one = (s: string) => s.replace(/\s+/g, ' ').trim()

function message(kind: 'new' | 'deadline', l: Listing, link: string, when: string) {
  const majors = l.majors.map(m => MAJOR_NAMES[m] ?? m).join(', ')
  if (kind === 'new') {
    return {
      template: env.matchTemplate(),
      params: [one(l.title), one(l.org), one(l.stipend || 'See listing'), formatDay(l.deadline), link],
      text: [
        '*New opportunity for you*',
        `*${l.title}*`,
        l.org,
        `For: ${majors} · ${l.levels.join(', ')}-level`,
        l.stipend ? `Pay: ${l.stipend}` : null,
        `Closes ${formatDay(l.deadline)}`,
        '',
        `View and apply: ${link}`,
        '',
        'Reply STOP to stop alerts.',
      ].filter(x => x !== null).join('\n'),
    }
  }
  return {
    template: env.deadlineTemplate(),
    params: [one(l.title), one(l.org), when, link],
    text: [
      '*Deadline reminder*',
      `*${l.title}* at ${l.org} closes *${when}* (${formatDay(l.deadline)}).`,
      '',
      `Apply now: ${link}`,
      '',
      'Reply STOP to stop alerts.',
    ].join('\n'),
  }
}

/**
 * Alert every active subscriber matching the posting. `kind` + `tag` identify the alert
 * (e.g. 'deadline:d3'), so each student gets each alert at most once.
 */
export async function fanOut(l: Listing, kind: 'new' | 'deadline', base: string, when = '', tag: string = kind): Promise<FanOutResult> {
  const subs = (await activeSubscribers()).filter(s => matches(l, s))
  const result: FanOutResult = { matched: subs.length, sent: 0, failed: 0, skipped: 0, errors: [] }
  if (!isConfigured()) return { ...result, errors: ['WhatsApp is not connected (no access token).'] }

  const link = `${base}/#/app/${l.id}`
  const m = message(kind, l, link, when)
  // Small batches keep us well inside WhatsApp's per-second limits.
  for (let i = 0; i < subs.length; i += 5) {
    await Promise.all(
      subs.slice(i, i + 5).map(async s => {
        if (!(await db.sadd(keys.sent(l.id, tag), s.phone))) return void result.skipped++
        try {
          if (m.template) await sendTemplate(s.phone, m.template, m.params)
          else await sendText(s.phone, m.text)
          result.sent++
        } catch (e) {
          result.failed++
          // Let a later run retry this student.
          await db.srem(keys.sent(l.id, tag), s.phone)
          if (result.errors.length < 5) result.errors.push(e instanceof Error ? e.message : String(e))
        }
      }),
    )
  }
  return result
}
