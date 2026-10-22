import { useEffect } from 'react'

/** Adds .in to every .reveal element as it scrolls into view. */
export function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.reveal:not(.in)')
    if (!('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('in'))
      return
    }
    const io = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          // Also reveal anything scrolled past in one jump (e.g. an anchor link).
          if (e.isIntersecting || e.boundingClientRect.top < 0) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    )
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])
}

/** Moves [data-depth] children inside `root` against the cursor for a parallax feel. */
export function useParallax(root: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = root.current
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const layers = [...el.querySelectorAll<HTMLElement>('[data-depth]')]
    let tx = 0
    let ty = 0
    let x = 0
    let y = 0
    let raf = 0
    const onMove = (e: PointerEvent) => {
      tx = e.clientX / innerWidth - 0.5
      ty = e.clientY / innerHeight - 0.5
    }
    const loop = () => {
      x += (tx - x) * 0.08
      y += (ty - y) * 0.08
      for (const l of layers) {
        const d = Number(l.dataset.depth)
        l.style.translate = `${-x * d}px ${-y * d}px`
      }
      raf = requestAnimationFrame(loop)
    }
    addEventListener('pointermove', onMove, { passive: true })
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('pointermove', onMove)
    }
  }, [root])
}
