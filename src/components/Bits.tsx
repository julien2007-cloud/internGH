import { useEffect, useRef, useState } from 'react'
import type { ToastItem } from '../lib/toast'
import { onToast } from '../lib/toast'
import { Icon } from './Icon'

/** Animates a number from 0 to `value` when it first appears or changes. */
export function CountUp({ value, duration = 900 }: { value: number; duration?: number }) {
  const [shown, setShown] = useState(0)
  const from = useRef(0)
  useEffect(() => {
    const start = performance.now()
    const begin = from.current
    let raf = 0
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      const v = Math.round(begin + (value - begin) * eased)
      setShown(v)
      from.current = v
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])
  return <>{shown}</>
}

export function Toggle({ on, onChange, children }: { on: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <button type="button" className={`toggle ${on ? 'on' : ''}`} role="switch" aria-checked={on} onClick={() => onChange(!on)}>
      <span className="knob" />
      {children}
    </button>
  )
}

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([])
  useEffect(
    () =>
      onToast(t => {
        setItems(list => [...list.slice(-2), t])
        setTimeout(() => setItems(list => list.filter(x => x.id !== t.id)), 3200)
      }),
    [],
  )
  return (
    <div className="toasts" role="status" aria-live="polite">
      {items.map(t => (
        <div className="toast" key={t.id}>
          <Icon name="check" size={16} />
          {t.text}
        </div>
      ))}
    </div>
  )
}

export function Avatar({ initials, color, size }: { initials: string; color: string; size?: number }) {
  return (
    <div className="av" style={{ background: color, ...(size ? { width: size, height: size } : {}) }}>
      {initials}
    </div>
  )
}
