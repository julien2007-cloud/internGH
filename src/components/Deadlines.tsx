import { majorById } from '../data/majors'
import type { Opportunity } from '../data/opportunities'
import type { Profile } from '../lib/match'
import { DAY, formatDate, pad, relativeDay, timeLeft, useNow } from '../lib/time'
import { Avatar, CountUp } from './Bits'
import type { Reminder } from './DetailDrawer'
import { Icon } from './Icon'

interface Props {
  profile: Profile
  saved: Opportunity[]
  upcoming: Opportunity[]
  reminders: Record<string, Reminder>
  onReminder: (id: string, r: Reminder) => void
  onOpen: (id: string) => void
  onExplore: () => void
}

const NO_REMINDER: Reminder = { d3: false, d1: false }

export function Deadlines({ profile, saved, upcoming, reminders, onReminder, onOpen, onExplore }: Props) {
  const now = useNow(1000)
  const major = majorById(profile.major)
  const sorted = [...saved].sort((a, b) => a.deadline - b.deadline)
  const remindersOn = saved.filter(o => reminders[o.id]?.d1 || reminders[o.id]?.d3).length
  const week = upcoming.filter(o => o.deadline - now < 7 * DAY)

  const groups = [
    { label: 'Next 48 hours', items: upcoming.filter(o => o.deadline - now < 2 * DAY) },
    { label: 'This week', items: upcoming.filter(o => o.deadline - now >= 2 * DAY && o.deadline - now < 7 * DAY) },
    { label: 'Next week', items: upcoming.filter(o => o.deadline - now >= 7 * DAY && o.deadline - now < 14 * DAY) },
    { label: 'Later', items: upcoming.filter(o => o.deadline - now >= 14 * DAY) },
  ].filter(g => g.items.length)

  return (
    <section>
      <div className="view-head rise">
        <h1>Deadline tracker</h1>
        <p>Live countdowns for everything you saved, and what's closing soon for {major.name} students.</p>
      </div>

      <div className="tiles">
        {[
          { icon: 'bookmark' as const, v: saved.length, l: 'Saved' },
          { icon: 'flame' as const, v: week.length, l: `Closing this week for ${major.short}` },
          { icon: 'bell' as const, v: remindersOn, l: 'Reminders on' },
        ].map((s, i) => (
          <div key={s.l} className="tile glass rise" style={{ '--i': i + 1 } as React.CSSProperties}>
            <div className="ti"><Icon name={s.icon} size={20} /></div>
            <div><b><CountUp value={s.v} /></b><span>{s.l}</span></div>
          </div>
        ))}
      </div>

      <div className="dl-cols">
        <div className="panel glass rise" style={{ '--i': 4 } as React.CSSProperties}>
          <h3>Your saved deadlines</h3>
          <p>Reminders go to your WhatsApp or SMS so you never hear about it too late.</p>
          {sorted.length === 0 && (
            <div className="empty" style={{ padding: '32px 12px' }}>
              <div className="em-icon"><Icon name="bookmark" size={24} /></div>
              <h3>Start your shortlist</h3>
              <p>Save opportunities and their countdowns will show up here.</p>
              <button className="btn" data-magnetic="0.2" onClick={onExplore}>Explore opportunities</button>
            </div>
          )}
          {sorted.map(o => {
            const t = timeLeft(o.deadline, now)
            const r = reminders[o.id] ?? NO_REMINDER
            return (
              <div key={o.id} className="dl-row" onClick={() => onOpen(o.id)}>
                <Avatar initials={o.initials} color={o.color} />
                <div>
                  <h4>{o.title}</h4>
                  <small>{o.org} · {formatDate(o.deadline)}</small>
                  <div className="remind-row" onClick={e => e.stopPropagation()}>
                    <button className={`mini-toggle ${r.d3 ? 'on' : ''}`} onClick={() => onReminder(o.id, { ...r, d3: !r.d3 })}>
                      <Icon name="bell" size={11} /> 3 days
                    </button>
                    <button className={`mini-toggle ${r.d1 ? 'on' : ''}`} onClick={() => onReminder(o.id, { ...r, d1: !r.d1 })}>
                      <Icon name="bell" size={11} /> 1 day
                    </button>
                  </div>
                </div>
                <div className={`clock ${t.urgent ? 'urgent' : ''}`}>
                  <b>{t.closed ? 'Closed' : `${pad(t.days)}:${pad(t.hours)}:${pad(t.minutes)}:${pad(t.seconds)}`}</b>
                  <span>days : hrs : min : sec</span>
                </div>
              </div>
            )
          })}
        </div>

        <div className="panel glass rise" style={{ '--i': 5 } as React.CSSProperties}>
          <h3>Closing soon for {major.name}</h3>
          <p>{profile.level}-level eligible, ordered by deadline.</p>
          <div className="timeline">
            {groups.map(g => (
              <div key={g.label} className="tl-group">
                <h5>{g.label}</h5>
                {g.items.map(o => (
                  <div key={o.id} className="tl-item" onClick={() => onOpen(o.id)}>
                    <div>
                      <b>{o.title}</b>
                      <small>{o.org}</small>
                    </div>
                    <span className={`when ${o.deadline - now < 3 * DAY ? 'urgent' : ''}`}>{relativeDay(o.deadline, now)}</span>
                  </div>
                ))}
              </div>
            ))}
            {groups.length === 0 && <p style={{ color: 'var(--mute)' }}>Nothing open for your level right now.</p>}
          </div>
        </div>
      </div>
    </section>
  )
}
