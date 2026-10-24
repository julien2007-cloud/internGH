import { useEffect } from 'react'
import { detailsFor } from '../data/details'
import { majorById } from '../data/majors'
import type { Opportunity } from '../data/opportunities'
import { applyHref } from '../lib/apply'
import { formatDate, pad, timeLeft, useNow } from '../lib/time'
import { Avatar } from './Bits'
import type { IconName } from './Icon'
import { Icon } from './Icon'

export interface Reminder {
  d3: boolean
  d1: boolean
}

interface Props {
  opp: Opportunity
  saved: boolean
  applied: boolean
  reminder: Reminder
  onClose: () => void
  onSave: () => void
  onApply: () => void
  onReminder: (r: Reminder) => void
  onDraft: () => void
  onWhatsApp: () => void
}

export function DetailDrawer({ opp: o, saved, applied, reminder, onClose, onSave, onApply, onReminder, onDraft, onWhatsApp }: Props) {
  const now = useNow(1000)
  const t = timeLeft(o.deadline, now)
  const d = detailsFor(o)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  const facts: { icon: IconName; label: string; value: string; strong?: boolean }[] = [
    { icon: 'wallet', label: o.paid ? 'Expected pay' : 'Pay', value: o.stipend, strong: o.paid },
    { icon: 'hourglass', label: 'Duration', value: o.duration },
    { icon: 'calendar', label: 'Start date', value: d.start },
    { icon: 'clock', label: 'Schedule', value: d.schedule },
    { icon: 'pin', label: 'Location', value: o.location },
    { icon: 'laptop', label: 'Work mode', value: d.mode },
    { icon: 'users', label: 'Openings', value: `${d.openings} ${d.openings === 1 ? 'place' : 'places'}` },
    { icon: 'cap', label: 'Eligible levels', value: o.levels.map(l => `${l}`).join(', ') },
  ]

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <aside className="drawer glass" role="dialog" aria-modal="true" aria-label={o.title}>
        <div className="drawer-body">
          <div className="drawer-head">
            <Avatar initials={o.initials} color={o.color} size={56} />
            <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="x" /></button>
          </div>
          <div className="badges" style={{ marginTop: 16 }}>
            {o.featured && <span className="badge featured"><Icon name="star" size={11} fill /> Featured</span>}
            <span className="badge">{o.type}</span>
            <span className={`badge ${o.paid ? 'paid-badge' : ''}`}>{o.paid ? 'Paid' : o.stipend.startsWith('Free') ? 'Free' : 'Unpaid'}</span>
            <span className="badge">{d.mode}</span>
            {!o.verified && <span className="badge tip">{o.source === 'Student tip' ? 'Unverified student tip' : 'Pending review'}</span>}
          </div>
          <h2>{o.title}</h2>
          <div className="org">{o.org}{o.verified && <Icon name="shield" size={15} />} · {o.location}</div>

          {/* Pay + deadline summary */}
          <div className="pay-hero">
            <div>
              <small>{o.paid ? 'Expected pay' : 'Pay'}</small>
              <b>{o.stipend}</b>
            </div>
            <div>
              <small>Duration</small>
              <b>{o.duration}</b>
            </div>
          </div>

          <div className={`blocks ${t.urgent ? 'urgent' : ''}`} aria-label="Time left to apply">
            {[[t.days, 'days'], [t.hours, 'hrs'], [t.minutes, 'min'], [t.seconds, 'sec']].map(([v, l]) => (
              <div key={l}><b>{pad(v as number)}</b><span>{l}</span></div>
            ))}
          </div>
          <p className="due-note">
            Applications close {formatDate(o.deadline)} at {new Date(o.deadline).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </p>

          <div className="section">
            <h4>Remind me</h4>
            <div className="remind-row">
              <button className={`mini-toggle ${reminder.d3 ? 'on' : ''}`} onClick={() => onReminder({ ...reminder, d3: !reminder.d3 })}>
                <Icon name="bell" size={12} /> 3 days before
              </button>
              <button className={`mini-toggle ${reminder.d1 ? 'on' : ''}`} onClick={() => onReminder({ ...reminder, d1: !reminder.d1 })}>
                <Icon name="bell" size={12} /> 1 day before
              </button>
              <button className="mini-toggle wa" onClick={onWhatsApp}>
                <Icon name="chat" size={12} /> WhatsApp me this
              </button>
            </div>
          </div>

          <div className="section">
            <h4>About the role</h4>
            <p>{o.summary}</p>
          </div>

          {d.does.length > 0 && (
            <div className="section">
              <h4>What you'll do</h4>
              <ul className="checklist does">
                {d.does.map(r => <li key={r}><Icon name="target" size={15} />{r}</li>)}
              </ul>
            </div>
          )}

          <div className="section">
            <h4>Key details</h4>
            <div className="facts">
              {facts.map(f => (
                <div key={f.label} className={`fact ${f.strong ? 'strong' : ''}`}>
                  <Icon name={f.icon} />
                  <div><small>{f.label}</small>{f.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="section">
            <h4>Who can apply</h4>
            <div className="chips-row" style={{ marginBottom: 12 }}>
              {o.majors.map(id => {
                const m = majorById(id)
                return <span key={id} className="badge" style={{ background: m.tint, color: m.color }}>{m.name}</span>
              })}
              {o.levels.map(l => <span key={l} className="badge">{l}-level</span>)}
            </div>
            <ul className="checklist">
              {o.requirements.map(r => <li key={r}><Icon name="check" size={15} />{r}</li>)}
            </ul>
          </div>

          <div className="section">
            <h4>What you'll get</h4>
            <ul className="checklist perks">
              {o.perks.map(r => <li key={r}><Icon name="star" size={15} />{r}</li>)}
            </ul>
          </div>

          <div className="section">
            <h4>What to prepare</h4>
            <ul className="checklist docs">
              {d.documents.map(r => <li key={r}><Icon name="file" size={15} />{r}</li>)}
            </ul>
          </div>

          <div className="section">
            <h4>How selection works</h4>
            <ol className="steps-list">
              {d.selection.map((s, i) => <li key={s}><span>{i + 1}</span>{s}</li>)}
            </ol>
          </div>

          {d.about && (
            <div className="section">
              <h4>About {o.org}</h4>
              <div className="org-card">
                <Avatar initials={o.initials} color={o.color} />
                <p>{d.about}</p>
              </div>
            </div>
          )}

          <p className="source-note">
            <Icon name="shield" size={14} />
            Source: {o.source}. Posted {Math.max(1, Math.round((now - o.posted) / 86_400_000))} days ago.
            {o.verified ? ' Checked by InternGH moderators.' : ' Not yet verified — check details with the organisation.'}
          </p>
        </div>

        <div className="drawer-foot">
          <a
            className={`btn ${applied ? 'ghost' : ''}`}
            data-magnetic="0.12"
            href={applyHref(o)}
            target="_blank"
            rel="noopener"
            onClick={onApply}
          >
            {applied ? <><Icon name="check" size={16} /> Applied · view</> : <>Apply on {o.org.split(' ')[0]}'s site <Icon name="external" size={16} /></>}
          </a>
          <button className="btn ghost" onClick={onDraft} data-magnetic="0.2">
            <Icon name="sparkles" size={16} /> Cover letter
          </button>
          <button className={`icon-btn ${saved ? 'on' : ''}`} style={{ width: 46, height: 46, borderRadius: 999 }} onClick={onSave} aria-label={saved ? 'Remove from saved' : 'Save'} aria-pressed={saved}>
            <Icon name="bookmark" fill={saved} />
          </button>
        </div>
      </aside>
    </>
  )
}
