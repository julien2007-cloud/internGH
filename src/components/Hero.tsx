import { useState } from 'react'
import type { Level, MajorId } from '../data/majors'
import { LEVELS, MAJORS, majorById } from '../data/majors'
import type { Profile } from '../lib/match'
import { CountUp } from './Bits'
import { Icon } from './Icon'

interface Props {
  profile: Profile
  onProfile: (p: Profile) => void
  totalOpen: number
  stats: { matches: number; thisWeek: number; paid: number }
  onSearch: (q: string) => void
  onAsk: (q: string) => void
}

export function Hero({ profile, onProfile, totalOpen, stats, onSearch, onAsk }: Props) {
  const [q, setQ] = useState('')
  const major = majorById(profile.major)
  const sample = `What can a ${profile.level}-level ${major.name} student apply to this semester?`

  return (
    <section className="hero">
      <span className="eyebrow rise">
        <span className="live-dot" />
        {totalOpen} open opportunities for UG students
      </span>
      <h1 className="rise" style={{ '--i': 1 } as React.CSSProperties}>
        Your next opportunity, <span className="grad-text">matched to your major</span>
      </h1>

      <div className="profile-line rise" style={{ '--i': 2 } as React.CSSProperties}>
        <span>I'm a</span>
        <label className="sr-only" htmlFor="lvl">Level</label>
        <select id="lvl" className="pill-select" value={profile.level}
          onChange={e => onProfile({ ...profile, level: Number(e.target.value) as Level })}>
          {LEVELS.map(l => <option key={l} value={l}>{l}-level</option>)}
        </select>
        <label className="sr-only" htmlFor="maj">Major</label>
        <select id="maj" className="pill-select" value={profile.major}
          onChange={e => onProfile({ ...profile, major: e.target.value as MajorId })}>
          {MAJORS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <span>student at Legon</span>
      </div>

      <form
        className="search rise"
        style={{ '--i': 3 } as React.CSSProperties}
        onSubmit={e => {
          e.preventDefault()
          onSearch(q)
        }}
      >
        <span className="s-icon"><Icon name="search" /></span>
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search roles, companies or skills"
          aria-label="Search opportunities"
        />
        <button className="btn" data-magnetic="0.2" type="submit">Search</button>
      </form>

      <button className="ask-hint rise" style={{ '--i': 4 } as React.CSSProperties} onClick={() => onAsk(sample)}>
        <Icon name="sparkles" size={15} />
        Ask AI: “{sample}”
        <Icon name="arrow" size={14} />
      </button>

      <div className="majors" role="radiogroup" aria-label="Choose your major">
        {MAJORS.map((m, i) => (
          <button
            key={m.id}
            role="radio"
            aria-checked={m.id === profile.major}
            className={`major-chip rise ${m.id === profile.major ? 'on' : ''}`}
            style={{ '--i': 5 + i * 0.6 } as React.CSSProperties}
            onClick={() => onProfile({ ...profile, major: m.id })}
          >
            <span className="tag" style={{ background: m.tint, color: m.color }}>{m.short.slice(0, 2)}</span>
            {m.name}
          </button>
        ))}
      </div>

      <div className="stats">
        {[
          { v: stats.matches, l: `Match ${major.short} ${profile.level}L` },
          { v: stats.thisWeek, l: 'Close in 7 days' },
          { v: stats.paid, l: 'Paid roles for you' },
        ].map((s, i) => (
          <div key={s.l} className="stat glass rise" style={{ '--i': 10 + i } as React.CSSProperties}>
            <b><CountUp value={s.v} /></b>
            <span>{s.l}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
