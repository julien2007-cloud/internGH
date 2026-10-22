import { useEffect, useRef } from 'react'

/** Fixed pastel blobs that drift with the cursor, plus a soft halo that trails it. */
export function Ambient() {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = root.current
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const blobs = [...el.querySelectorAll<HTMLElement>('.blob')].map((node, i) => ({
      node,
      x: 0,
      y: 0,
      ease: [0.05, 0.035, 0.025][i],
      pull: [0.08, -0.06, 0.05][i],
    }))
    const halo = el.querySelector<HTMLElement>('.halo')!
    let mx = innerWidth / 2
    let my = innerHeight / 3
    let hx = mx
    let hy = my
    let raf = 0

    const onMove = (e: PointerEvent) => {
      mx = e.clientX
      my = e.clientY
      halo.style.opacity = '1'
    }
    const onOut = () => (halo.style.opacity = '0')
    const loop = () => {
      const cx = mx - innerWidth / 2
      const cy = my - innerHeight / 2
      for (const b of blobs) {
        b.x += (cx * b.pull * 4 - b.x) * b.ease
        b.y += (cy * b.pull * 4 - b.y) * b.ease
        b.node.style.transform = `translate(${b.x}px, ${b.y}px)`
      }
      hx += (mx - hx) * 0.12
      hy += (my - hy) * 0.12
      halo.style.transform = `translate(${hx}px, ${hy}px)`
      raf = requestAnimationFrame(loop)
    }
    addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onOut)
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onOut)
    }
  }, [])

  return (
    <div className="ambient" ref={root} aria-hidden="true">
      <div className="blob b1" />
      <div className="blob b2" />
      <div className="blob b3" />
      <div className="halo" style={{ opacity: 0 }} />
    </div>
  )
}
