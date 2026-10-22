import { useSyncExternalStore } from 'react'

export type ThemePref = 'light' | 'dark' | 'system'
export type Theme = 'light' | 'dark'

// Same key the inline script in index.html reads, so the first paint is already themed.
const KEY = 'igh.theme'
const media = matchMedia('(prefers-color-scheme: dark)')
const listeners = new Set<() => void>()

function readPref(): ThemePref {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'light' || v === 'dark' ? v : 'system'
  } catch {
    return 'system'
  }
}

let pref = readPref()

const resolve = (): Theme => (pref === 'system' ? (media.matches ? 'dark' : 'light') : pref)

function apply() {
  const theme = resolve()
  document.documentElement.dataset.theme = theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0a0a0a' : '#ffffff')
}

function emit() {
  apply()
  listeners.forEach(l => l())
}

media.addEventListener('change', () => {
  if (pref === 'system') emit()
})
apply()

export function setThemePref(next: ThemePref) {
  pref = next
  try {
    if (next === 'system') localStorage.removeItem(KEY)
    else localStorage.setItem(KEY, next)
  } catch {
    // storage blocked: the choice lasts until reload
  }
  emit()
}

type ViewTransitionDoc = Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } }

/**
 * Switch to `next`, revealing the new theme as a circle growing from (x, y).
 * Falls back to an instant switch where View Transitions aren't supported.
 */
export function switchTheme(next: ThemePref, x = innerWidth / 2, y = 0) {
  const doc = document as ViewTransitionDoc
  const target: Theme = next === 'system' ? (media.matches ? 'dark' : 'light') : next
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!doc.startViewTransition || reduced || target === resolve()) {
    setThemePref(next)
    return
  }
  const t = doc.startViewTransition(() => setThemePref(next))
  const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
  t.ready.then(() => {
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
      { duration: 650, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', pseudoElement: '::view-transition-new(root)' },
    )
  })
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}

export function useTheme() {
  const snap = useSyncExternalStore(subscribe, () => `${pref}:${resolve()}`)
  const [p, theme] = snap.split(':') as [ThemePref, Theme]
  return { pref: p, theme }
}
