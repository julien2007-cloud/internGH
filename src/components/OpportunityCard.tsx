import type { Opportunity } from '../data/opportunities'
import { applyHref } from '../lib/apply'
import type { Profile } from '../lib/match'
import { fitsLevel, fitsMajor } from '../lib/match'
import { shortLeft, timeLeft, useNow } from '../lib/time'
import { Avatar } from './Bits'
import { Icon } from './Icon'

interface Props {
  opp: Opportunity
  index: number
  profile: Profile
  saved: boolean
  applied: boolean
  onSave: () => void
  onOpen: () => void
  onApply: () => void
}

export function OpportunityCard({ opp: o, index, profile, saved, applied, onSave, onOpen, onApply }: Props) {
  const now = useNow(1000)
  const t = timeLeft(o.deadline, now)
  const elapsed = Math.min(1, Math.max(0.04, (now - o.posted) / (o.deadline - o.posted)))
  const match = fitsMajor(o, profile.major) && fitsLevel(o, profile.level)

  return (
    <article
      className="card glass rise"
      style={{ '--i': index } as React.CSSProperties}
      data-spotlight
      onClick={onOpen}
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onOpen()}
      aria-label={`${o.title} at ${o.org}`}
    >
      <div className="top">
        <Avatar initials={o.initials} color={o.color} />
        <div className="badges" style={{ marginLeft: 'auto' }}>
          {o.featured && <span className="badge featured"><Icon name="star" size={11} fill /> Featured</span>}
          {!o.featured && match && <span className="badge match">For you</span>}
          <span className="badge">{o.type}</span>
        </div>
        <button
          className={`icon-btn ${saved ? 'on' : ''}`}
          aria-label={saved ? 'Remove from saved' : 'Save'}
          aria-pressed={saved}
          onClick={e => {
            e.stopPropagation()
            onSave()
          }}
        >
          <Icon name="bookmark" size={17} fill={saved} />
        </button>
      </div>

      <h3>{o.title}</h3>
      <div className="org">
        {o.org}
        {o.verified ? <Icon name="shield" size={14} /> : <span className="badge tip">{o.source === 'Student tip' ? 'Student tip' : 'Pending review'}</span>}
      </div>

      <div className="tags">
        <span className={o.paid ? 'paid' : ''}>{o.paid ? 'Paid' : o.stipend.startsWith('Free') ? 'Free' : 'Unpaid'}</span>
        <span><Icon name="pin" size={12} />{o.location}</span>
        <span>{o.duration}</span>
        <span>L{Math.min(...o.levels)}+</span>
      </div>

      <div className={`closes ${t.urgent ? 'urgent' : ''}`}>
        <div className="row">
          <span>{t.urgent ? 'Closing soon' : 'Closes in'}</span>
          <b>{shortLeft(t)}</b>
        </div>
        <div className="bar"><i style={{ width: `${elapsed * 100}%` }} /></div>
      </div>

      <div className="actions" onClick={e => e.stopPropagation()}>
        <button className="btn ghost sm" onClick={onOpen}>Details</button>
        <a
          className={`btn sm ${applied ? 'ghost' : ''}`}
          data-magnetic="0.15"
          href={applyHref(o)}
          target="_blank"
          rel="noopener"
          onClick={onApply}
        >
          {applied ? <><Icon name="check" size={14} /> Applied</> : <>Apply <Icon name="external" size={14} /></>}
        </a>
      </div>
    </article>
  )
}
