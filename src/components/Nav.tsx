import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { majorById } from '../data/majors'
import { go } from '../lib/router'
import type { User } from '../lib/user'
import { initialsOf } from '../lib/user'
import type { IconName } from './Icon'
import { Icon } from './Icon'

export type View = 'explore' | 'deadlines' | 'saved'

const TABS: { id: View; label: string; icon: IconName }[] = [
  { id: 'explore', label: 'Explore', icon: 'compass' },
  { id: 'deadlines', label: 'Deadlines', icon: 'calendar' },
  { id: 'saved', label: 'Saved', icon: 'bookmark' },
]

interface Props {
  view: View
  onView: (v: View) => void
  savedCount: number
  user: User
  onAlerts: () => void
  onAsk: () => void
  onLogOut: () => void
}

export function Nav({ view, onView, savedCount, user, onAlerts, onAsk, onLogOut }: Props) {
  const tabsRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [pill, setPill] = useState({ x: 0, w: 0 })
  const [menuOpen, setMenuOpen] = useState(false)

  // Slide the active-tab pill under whichever tab is selected.
  useLayoutEffect(() => {
    const el = tabsRef.current?.querySelector<HTMLElement>(`[data-tab="${view}"]`)
    if (el) setPill({ x: el.offsetLeft, w: el.offsetWidth })
  }, [view, savedCount])

  useEffect(() => {
    if (!menuOpen) return
    const close = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false)
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  const switchView = (v: View) => {
    onView(v)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <div className="nav-wrap">
        <nav className="nav glass" aria-label="Main">
          <button className="logo" onClick={() => switchView('explore')}>
            <span className="logo-mark"><Icon name="cap" size={15} /></span>
            InternGH
          </button>
          <div className="tabs" ref={tabsRef}>
            <span className="tab-indicator" style={{ width: pill.w, transform: `translateX(${pill.x}px)` }} />
            {TABS.map(t => (
              <button key={t.id} data-tab={t.id} className={`tab ${view === t.id ? 'on' : ''}`} onClick={() => switchView(t.id)}>
                {t.label}
                {t.id === 'saved' && savedCount > 0 && <span className="count" key={savedCount}>{savedCount}</span>}
              </button>
            ))}
            <button className="tab ask-tab" onClick={onAsk}>
              <Icon name="sparkles" size={15} /> Ask AI
            </button>
          </div>
          <button className="btn alerts-btn" data-magnetic="0.25" onClick={onAlerts}>
            <Icon name="bell" size={16} /> <span className="lbl">Get alerts</span>
          </button>

          <div className="me" ref={menuRef}>
            <button
              className="me-btn"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="Account menu"
              onClick={() => setMenuOpen(o => !o)}
            >
              {initialsOf(user.name)}
            </button>
            {menuOpen && (
              <div className="me-menu glass" role="menu">
                <div className="me-head">
                  <b>{user.name}</b>
                  <small>{user.email}</small>
                  <span className="badge match" style={{ marginTop: 8 }}>
                    {user.level}-level · {majorById(user.major).name}
                  </span>
                </div>
                <button role="menuitem" onClick={() => go('about')}>
                  <Icon name="users" size={16} /> About InternGH
                </button>
                <button role="menuitem" onClick={() => go('welcome')}>
                  <Icon name="compass" size={16} /> Welcome page
                </button>
                <button role="menuitem" className="danger" onClick={onLogOut}>
                  <Icon name="logout" size={16} /> Log out
                </button>
              </div>
            )}
          </div>
          <button className="logout-btn" onClick={onLogOut} aria-label="Log out" title="Log out">
            <Icon name="logout" size={17} />
            <span>Log out</span>
          </button>
        </nav>
      </div>

      <nav className="bottom-bar glass" aria-label="Mobile">
        {TABS.map(t => (
          <button key={t.id} className={view === t.id ? 'on' : ''} onClick={() => switchView(t.id)}>
            <Icon name={t.icon} size={20} />
            {t.label}
            {t.id === 'saved' && savedCount > 0 && <span className="count">{savedCount}</span>}
          </button>
        ))}
        <button onClick={onAlerts}>
          <Icon name="bell" size={20} />
          Alerts
        </button>
      </nav>
    </>
  )
}
