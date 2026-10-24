// Server-side shapes for postings and subscribers. Kept separate from src/ so the
// functions bundle without the browser code; field names match src/data/opportunities.ts.

export const MAJOR_NAMES: Record<string, string> = {
  cs: 'Computer Science', econ: 'Economics', nursing: 'Nursing', law: 'Law', stats: 'Statistics',
  business: 'Business Administration', psych: 'Psychology', polisci: 'Political Science', agric: 'Agriculture', comms: 'Communication Studies',
}
export const LEVELS = [100, 200, 300, 400]
const TYPES = ['Internship', 'Fellowship', 'Workshop', 'Training']
const MODES = ['On-site', 'Hybrid', 'Remote']
export const DAY = 86_400_000

export interface Listing {
  id: string
  title: string
  org: string
  initials: string
  color: string
  type: string
  majors: string[]
  levels: number[]
  location: string
  remote: boolean
  paid: boolean
  stipend: string
  duration: string
  months: number
  deadline: number
  posted: number
  summary: string
  requirements: string[]
  perks: string[]
  source: string
  verified: boolean
  featured?: boolean
}

export interface ListingDetails {
  does: string[]
  about: string
  start: string
  schedule: string
  mode: string
  openings: number
}

export interface StoredListing {
  opp: Listing
  details: ListingDetails
}

export interface Subscriber {
  phone: string // E.164, e.g. +233241234567
  name: string
  majors: string[]
  level: number
  active: boolean
  createdAt: number
}

export const matches = (l: Listing, s: Subscriber) =>
  s.active && l.majors.some(m => s.majors.includes(m)) && l.levels.includes(s.level)

const str = (v: unknown, n: number) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, n)
const list = (v: unknown, n: number, each: number) => (Array.isArray(v) ? v : []).map(x => str(x, each)).filter(Boolean).slice(0, n)

/** Validate and clip a posting sent by the browser. Returns an error message instead when invalid. */
export function cleanListing(input: unknown, now: number): StoredListing | string {
  const raw = (input ?? {}) as { opp?: Record<string, unknown>; details?: Record<string, unknown> }
  const o = raw.opp ?? {}
  const d = raw.details ?? {}
  const title = str(o.title, 90)
  const org = str(o.org, 80)
  if (title.length < 4 || org.length < 2) return 'Add a role title and organisation.'
  const majors = list(o.majors, 10, 20).filter(m => m in MAJOR_NAMES)
  const levels = (Array.isArray(o.levels) ? o.levels : []).map(Number).filter(l => LEVELS.includes(l))
  if (!majors.length || !levels.length) return 'Pick at least one major and level.'
  const deadline = Number(o.deadline)
  if (!(deadline > now) || deadline - now > 366 * DAY) return 'The deadline must be within the next year.'
  const color = /^#[0-9a-f]{6}$/i.test(String(o.color)) ? String(o.color) : '#4f46e5'
  return {
    opp: {
      id: `post-${now}-${Math.random().toString(36).slice(2, 7)}`,
      title, org,
      initials: str(o.initials, 3).toUpperCase() || org.slice(0, 2).toUpperCase(),
      color,
      type: TYPES.includes(String(o.type)) ? String(o.type) : 'Internship',
      majors, levels: [...new Set(levels)].sort(),
      location: str(o.location, 40) || 'Accra',
      remote: str(o.location, 40) === 'Remote',
      paid: Boolean(o.paid),
      stipend: str(o.stipend, 60),
      duration: str(o.duration, 30),
      months: Math.max(0, Math.min(24, Number(o.months) || 0)),
      deadline, posted: now,
      summary: str(o.summary, 600),
      requirements: list(o.requirements, 8, 160),
      perks: list(o.perks, 8, 160),
      source: 'Partner company',
      verified: true, // published with the publisher code
      featured: Boolean(o.featured),
    },
    details: {
      does: list(d.does, 8, 160),
      about: str(d.about, 400),
      start: str(d.start, 40) || 'To be confirmed',
      schedule: str(d.schedule, 80) || 'To be confirmed',
      mode: MODES.includes(String(d.mode)) ? String(d.mode) : 'On-site',
      openings: Math.max(1, Math.min(999, Number(d.openings) || 1)),
    },
  }
}

/** Whole-day difference between two timestamps in Ghana time (UTC+0). */
export function daysUntil(deadline: number, now: number) {
  const day = (t: number) => Math.floor(t / DAY)
  return day(deadline) - day(now)
}

export const formatDay = (t: number) =>
  new Date(t).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })
