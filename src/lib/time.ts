import { useEffect, useState } from 'react'

export const HOUR = 3_600_000
export const DAY = 24 * HOUR

export function useNow(interval = 1000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), interval)
    return () => clearInterval(id)
  }, [interval])
  return now
}

export interface TimeLeft {
  ms: number
  days: number
  hours: number
  minutes: number
  seconds: number
  closed: boolean
  urgent: boolean
}

export function timeLeft(deadline: number, now: number): TimeLeft {
  const ms = Math.max(0, deadline - now)
  return {
    ms,
    days: Math.floor(ms / DAY),
    hours: Math.floor((ms % DAY) / HOUR),
    minutes: Math.floor((ms % HOUR) / 60_000),
    seconds: Math.floor((ms % 60_000) / 1000),
    closed: ms === 0,
    urgent: ms < 3 * DAY,
  }
}

export const pad = (n: number) => String(n).padStart(2, '0')

export function shortLeft(t: TimeLeft) {
  if (t.closed) return 'Closed'
  if (t.days >= 1) return `${t.days}d ${t.hours}h ${pad(t.minutes)}m`
  return `${t.hours}h ${pad(t.minutes)}m ${pad(t.seconds)}s`
}

export function relativeDay(deadline: number, now: number) {
  const days = Math.floor((deadline - now) / DAY)
  if (deadline <= now) return 'closed'
  if (days < 1) return 'today'
  if (days < 2) return 'tomorrow'
  return `in ${days} days`
}

export const formatDate = (ts: number) =>
  new Date(ts).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
