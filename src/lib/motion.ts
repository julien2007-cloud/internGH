import { useEffect } from 'react'

/**
 * Page-wide pointer effects, wired once with event delegation so they also
 * apply to elements rendered later:
 * - [data-magnetic="0.3"]  element drifts toward the cursor
 * - [data-spotlight]       sets --mx / --my for a cursor glow
 * - .btn                   click ripple
 */
export function useMotionEffects() {
  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    let magnet: HTMLElement | null = null

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || reduced) return
      const target = e.target as Element | null

      const next = target?.closest<HTMLElement>('[data-magnetic]') ?? null
      if (magnet && magnet !== next) magnet.style.transform = ''
      magnet = next
      if (next) {
        const r = next.getBoundingClientRect()
        const k = Number(next.dataset.magnetic) || 0.3
        const x = (e.clientX - r.left - r.width / 2) * k
        const y = (e.clientY - r.top - r.height / 2) * k * 1.2
        next.style.transform = `translate(${x}px, ${y}px)`
      }

      const spot = target?.closest<HTMLElement>('[data-spotlight]')
      if (spot) {
        const r = spot.getBoundingClientRect()
        spot.style.setProperty('--mx', `${e.clientX - r.left}px`)
        spot.style.setProperty('--my', `${e.clientY - r.top}px`)
      }
    }

    const onLeave = () => {
      if (magnet) magnet.style.transform = ''
      magnet = null
    }

    const onDown = (e: PointerEvent) => {
      const btn = (e.target as Element | null)?.closest<HTMLElement>('.btn')
      if (!btn || reduced) return
      const r = btn.getBoundingClientRect()
      const size = Math.max(r.width, r.height)
      const dot = document.createElement('span')
      dot.className = 'ripple'
      dot.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`
      btn.appendChild(dot)
      setTimeout(() => dot.remove(), 650)
    }

    document.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    document.addEventListener('pointerdown', onDown)
    return () => {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [])
}
