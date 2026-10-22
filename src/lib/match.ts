import type { Level, MajorId } from '../data/majors'
import { majorById } from '../data/majors'
import type { Opportunity, OppType } from '../data/opportunities'
import { DAY } from './time'

export interface Profile {
  major: MajorId
  level: Level
}

export interface Filters {
  q: string
  scope: 'major' | 'all'
  types: OppType[]
  pay: 'any' | 'paid' | 'unpaid'
  location: 'any' | 'accra' | 'remote' | 'outside'
  duration: 'any' | 'short' | 'medium' | 'long'
  levelOnly: boolean
  sort: 'match' | 'deadline' | 'new'
}

export const DEFAULT_FILTERS: Filters = {
  q: '',
  scope: 'major',
  types: [],
  pay: 'any',
  location: 'any',
  duration: 'any',
  levelOnly: true,
  sort: 'match',
}

export const isOpen = (o: Opportunity, now: number) => o.deadline > now
export const fitsLevel = (o: Opportunity, level: Level) => o.levels.includes(level)
export const fitsMajor = (o: Opportunity, major: MajorId) => o.majors.includes(major)

/** Relevance: major fit first, then level, then how soon it closes. */
export function score(o: Opportunity, p: Profile, now: number) {
  const majorFit = o.majors[0] === p.major ? 1 : fitsMajor(o, p.major) ? 0.8 : 0
  const daysLeft = (o.deadline - now) / DAY
  const urgency = 1 - Math.min(Math.max(daysLeft, 0), 30) / 30
  return majorFit * 60 + (fitsLevel(o, p.level) ? 20 : 0) + urgency * 15 + (o.featured ? 5 : 0)
}

function matchesText(o: Opportunity, q: string) {
  const hay = [o.title, o.org, o.summary, o.location, o.type, ...o.majors.map(m => majorById(m).name)]
    .join(' ')
    .toLowerCase()
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every(word => hay.includes(word))
}

export function applyFilters(all: Opportunity[], p: Profile, f: Filters, now: number) {
  const items = all.filter(o => {
    if (!isOpen(o, now)) return false
    if (f.scope === 'major' && !fitsMajor(o, p.major)) return false
    if (f.levelOnly && !fitsLevel(o, p.level)) return false
    if (f.types.length && !f.types.includes(o.type)) return false
    if (f.pay === 'paid' && !o.paid) return false
    if (f.pay === 'unpaid' && o.paid) return false
    if (f.location === 'accra' && !/accra|legon|tema/i.test(o.location)) return false
    if (f.location === 'remote' && !o.remote) return false
    if (f.location === 'outside' && (o.remote || /accra|legon|tema/i.test(o.location))) return false
    if (f.duration === 'short' && o.months > 1) return false
    if (f.duration === 'medium' && (o.months <= 1 || o.months > 3)) return false
    if (f.duration === 'long' && o.months <= 3) return false
    if (f.q && !matchesText(o, f.q)) return false
    return true
  })
  const by = {
    match: (a: Opportunity, b: Opportunity) => score(b, p, now) - score(a, p, now),
    deadline: (a: Opportunity, b: Opportunity) => a.deadline - b.deadline,
    new: (a: Opportunity, b: Opportunity) => b.posted - a.posted,
  }[f.sort]
  return items.sort(by)
}

export const activeFilterCount = (f: Filters) =>
  (f.types.length ? 1 : 0) +
  (f.pay !== 'any' ? 1 : 0) +
  (f.location !== 'any' ? 1 : 0) +
  (f.duration !== 'any' ? 1 : 0) +
  (f.levelOnly ? 0 : 1) +
  (f.scope === 'all' ? 1 : 0)
