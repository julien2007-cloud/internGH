import { OPP_TYPES } from '../data/opportunities'
import type { Filters } from '../lib/match'
import { DEFAULT_FILTERS, activeFilterCount } from '../lib/match'
import { Toggle } from './Bits'
import { Icon } from './Icon'

interface Props {
  filters: Filters
  onChange: (f: Filters) => void
}

export function FilterBar({ filters: f, onChange }: Props) {
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => onChange({ ...f, [k]: v })
  const active = activeFilterCount(f)

  return (
    <div className="filterbar glass">
      <div className="seg" role="group" aria-label="Type">
        <button className={f.types.length === 0 ? 'on' : ''} onClick={() => set('types', [])}>All</button>
        {OPP_TYPES.map(t => (
          <button
            key={t}
            className={f.types.includes(t) ? 'on' : ''}
            onClick={() => set('types', f.types.includes(t) ? f.types.filter(x => x !== t) : [...f.types, t])}
          >
            {t}s
          </button>
        ))}
      </div>

      <select className="pill-select" aria-label="Pay" value={f.pay} onChange={e => set('pay', e.target.value as Filters['pay'])}>
        <option value="any">Paid or unpaid</option>
        <option value="paid">Paid only</option>
        <option value="unpaid">Unpaid / free</option>
      </select>
      <select className="pill-select" aria-label="Location" value={f.location} onChange={e => set('location', e.target.value as Filters['location'])}>
        <option value="any">Any location</option>
        <option value="accra">Accra and Legon</option>
        <option value="remote">Remote</option>
        <option value="outside">Outside Accra</option>
      </select>
      <select className="pill-select" aria-label="Duration" value={f.duration} onChange={e => set('duration', e.target.value as Filters['duration'])}>
        <option value="any">Any duration</option>
        <option value="short">Under a month</option>
        <option value="medium">1 to 3 months</option>
        <option value="long">Over 3 months</option>
      </select>
      <Toggle on={f.levelOnly} onChange={v => set('levelOnly', v)}>My level only</Toggle>
      <Toggle on={f.scope === 'all'} onChange={v => set('scope', v ? 'all' : 'major')}>All majors</Toggle>
      <select className="pill-select" aria-label="Sort" value={f.sort} onChange={e => set('sort', e.target.value as Filters['sort'])}>
        <option value="match">Best match</option>
        <option value="deadline">Closing soonest</option>
        <option value="new">Newest</option>
      </select>

      {(active > 0 || f.q) && (
        <button className="reset" onClick={() => onChange({ ...DEFAULT_FILTERS, sort: f.sort })}>
          <Icon name="refresh" size={14} /> Reset
        </button>
      )}
    </div>
  )
}
