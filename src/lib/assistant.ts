// Demo assistant: answers questions by querying the local opportunity database.
// It mimics what an LLM-backed assistant would return so the UI can be swapped
// to a real model later without changing the components.
import type { Level, Major } from '../data/majors'
import { MAJORS, majorById } from '../data/majors'
import type { Opportunity, OppType } from '../data/opportunities'
import { OPPORTUNITIES } from '../data/opportunities'
import type { Profile } from './match'
import { fitsLevel, fitsMajor, isOpen } from './match'
import { DAY, relativeDay } from './time'

export interface CoverLetter {
  oppId: string
  body: string
}

export interface AssistantReply {
  text: string
  items?: Opportunity[]
  letter?: CoverLetter
}

interface Context {
  profile: Profile
  now: number
  focus?: Opportunity | null
  name?: string
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const has = (q: string, word: string) => new RegExp(`\\b${escape(word)}\\b`, 'i').test(q)

function findMajor(q: string): Major | undefined {
  // Longest alias first so "political science" beats "science".
  const pairs = MAJORS.flatMap(m => m.aliases.map(a => [a, m] as const)).sort((a, b) => b[0].length - a[0].length)
  return pairs.find(([alias]) => has(q, alias))?.[1]
}

function findLevel(q: string): Level | undefined {
  const m = q.match(/\b([1-4])00\s*-?\s*(?:level|l)\b|\blevel\s*([1-4])00\b|\bl\s?([1-4])00\b/i)
  const d = m?.[1] ?? m?.[2] ?? m?.[3]
  return d ? (Number(d) * 100) as Level : undefined
}

function findWindow(q: string): { days: number; label: string } | undefined {
  if (/\btoday\b/i.test(q)) return { days: 1, label: ' today' }
  if (/this week|next 7 days|closing soon|urgent|soon/i.test(q)) return { days: 7, label: ' this week' }
  if (/this month|next month|30 days/i.test(q)) return { days: 31, label: ' this month' }
  if (/semester/i.test(q)) return { days: 120, label: ' this semester' }
  return undefined
}

function findType(q: string): OppType | undefined {
  if (/fellowship/i.test(q)) return 'Fellowship'
  if (/workshop|summer school/i.test(q)) return 'Workshop'
  if (/training|bootcamp|programme|program\b/i.test(q)) return 'Training'
  if (/internship|intern\b|attachment/i.test(q)) return 'Internship'
  return undefined
}

function findListing(q: string): Opportunity | undefined {
  const lower = q.toLowerCase()
  let best: Opportunity | undefined
  let bestScore = 1
  for (const o of OPPORTUNITIES) {
    let s = lower.includes(o.org.toLowerCase()) ? 5 : 0
    for (const w of o.title.toLowerCase().split(/\W+/)) if (w.length > 3 && lower.includes(w)) s += 1
    for (const w of o.org.toLowerCase().split(/\W+/)) if (w.length > 3 && lower.includes(w)) s += 1.5
    if (s > bestScore) {
      best = o
      bestScore = s
    }
  }
  return best
}

export function draftCoverLetter(o: Opportunity, p: Profile, name?: string): string {
  const m = majorById(p.major)
  const studies = fitsMajor(o, p.major)
    ? `${m.name} student`
    : `${m.name} student with a strong interest in ${majorById(o.majors[0]).name.toLowerCase()}`
  const firstSentence = o.summary.split('. ')[0].replace(/\.$/, '')
  const why = firstSentence.charAt(0).toLowerCase() + firstSentence.slice(1)
  return [
    `Dear Hiring Team at ${o.org},`,
    `I am a ${p.level}-level ${studies} at the University of Ghana, and I am excited to apply for the ${o.title} with ${o.org}.`,
    `Through my coursework in ${m.courses}, I have developed a strong foundation and enjoy ${m.skills}. The chance to ${why} is exactly the kind of practical experience I am looking for at this stage of my degree.`,
    `I meet the key requirements you listed — ${o.requirements.slice(0, 2).map(r => r.charAt(0).toLowerCase() + r.slice(1)).join(' and ')} — and I am available for the full ${o.duration}. I learn quickly, take feedback well and would bring real energy to your team.`,
    `Thank you for considering my application. I would welcome the opportunity to discuss how I can contribute to ${o.org}.`,
    `Yours sincerely,\n${name?.trim() || '[Your name]'}\n${p.level}-level ${m.name}, University of Ghana, Legon`,
  ].join('\n\n')
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

export function answer(input: string, ctx: Context): AssistantReply {
  const q = input.trim()
  const { profile, now } = ctx

  if (!q || /^(hi|hello|hey|help|good (morning|afternoon|evening))\b/i.test(q)) {
    const m = majorById(profile.major)
    return {
      text: `Hi! I search the InternGH database for you. Ask me things like "What can a ${profile.level}-level ${m.name} student apply to this semester?", "Paid remote internships closing this week", or "Draft a cover letter for the ${OPPORTUNITIES.find(o => fitsMajor(o, profile.major))?.title ?? 'first listing'}".`,
    }
  }

  // Cover letter intent
  if (/cover letter|motivation letter|application letter|\bdraft\b|write (me )?a letter/i.test(q)) {
    const target = findListing(q) ?? ctx.focus ?? undefined
    if (!target) {
      const picks = OPPORTUNITIES.filter(o => isOpen(o, now) && fitsMajor(o, profile.major))
        .sort((a, b) => a.deadline - b.deadline)
        .slice(0, 3)
      return {
        text: 'Happy to draft one. Which listing is it for? Here are a few that fit your profile — tap "Draft letter" on any of them.',
        items: picks,
      }
    }
    return {
      text: `Here's a short cover letter for the ${target.title} at ${target.org}, based on your profile. Edit the placeholders, keep it to one page, and send it before it closes ${relativeDay(target.deadline, now)}.`,
      letter: { oppId: target.id, body: draftCoverLetter(target, profile, ctx.name) },
    }
  }

  // Search intent
  const explicitMajor = findMajor(q)
  const anyMajor = /any major|all majors|everyone|anybody/i.test(q)
  const major = anyMajor ? undefined : explicitMajor ?? majorById(profile.major)
  const level = findLevel(q) ?? (explicitMajor ? undefined : profile.level)
  const window = findWindow(q)
  const type = findType(q)
  const pay = /\bunpaid\b|volunteer/i.test(q) ? 'unpaid' : /\bpaid\b|stipend|salary|money/i.test(q) ? 'paid' : undefined
  const remote = /remote|online|from home/i.test(q)
  const place = ['Accra', 'Kumasi', 'Tema', 'Tamale', 'Ho', 'Legon'].find(c => has(q, c))
  const closingFirst = /deadline|clos|soon|urgent|first/i.test(q)

  const base = OPPORTUNITIES.filter(
    o => isOpen(o, now) && (!major || fitsMajor(o, major.id)) && (!level || fitsLevel(o, level)),
  )
  const strict = base.filter(
    o =>
      (!window || o.deadline - now <= window.days * DAY) &&
      (!type || o.type === type) &&
      (!pay || (pay === 'paid' ? o.paid : !o.paid)) &&
      (!remote || o.remote) &&
      (!place || o.location.includes(place)),
  )

  const who = [level ? `${level}-level` : '', major ? `${major.name} student` : 'student'].filter(Boolean).join(' ')
  const extras = [pay, remote ? 'remote' : '', place ? `in ${place}` : '', type ? type.toLowerCase() + 's' : '']
    .filter(Boolean)
    .join(', ')
  const sorted = (list: Opportunity[]) => [...list].sort((a, b) => a.deadline - b.deadline).slice(0, 5)

  if (strict.length) {
    const items = sorted(strict)
    const first = items[0]
    const usedProfile = !explicitMajor && !anyMajor ? ' (from your profile)' : ''
    return {
      text:
        `I found ${plural(strict.length, 'opportunity', 'opportunities')} a ${who}${usedProfile} can apply to${window?.label ?? ''}${extras ? ` — ${extras}` : ''}. ` +
        `${strict.length > 5 ? 'Here are the 5 closing soonest. ' : 'Sorted by deadline. '}` +
        `${closingFirst || first.deadline - now < 3 * DAY ? `Heads up: ${first.title} closes ${relativeDay(first.deadline, now)}.` : `Want a cover letter for one? Tap "Draft letter".`}`,
      items,
    }
  }

  if (base.length) {
    return {
      text: `Nothing matches every condition right now, but here ${base.length === 1 ? 'is 1 opportunity' : `are ${Math.min(base.length, 5)} opportunities`} a ${who} can apply to. Try turning on alerts so you hear the moment a closer match is posted.`,
      items: sorted(base),
    }
  }

  return {
    text: `I couldn't find open listings for a ${who} yet. Phase 1 covers 10 majors — try asking about Computer Science, Economics, Nursing, Law, Statistics, Business, Psychology, Political Science, Agriculture or Communication Studies.`,
  }
}
