import { useRef, useState } from 'react'
import { AlertsModal } from './components/AlertsModal'
import type { ChatMessage } from './components/Assistant'
import { Assistant } from './components/Assistant'
import { Deadlines } from './components/Deadlines'
import type { Reminder } from './components/DetailDrawer'
import { DetailDrawer } from './components/DetailDrawer'
import { FilterBar } from './components/FilterBar'
import { Hero } from './components/Hero'
import { Icon } from './components/Icon'
import type { View } from './components/Nav'
import { Nav } from './components/Nav'
import { OpportunityCard } from './components/OpportunityCard'
import { majorById } from './data/majors'
import type { Opportunity } from './data/opportunities'
import { OPPORTUNITIES } from './data/opportunities'
import { answer } from './lib/assistant'
import type { Filters, Profile } from './lib/match'
import { DEFAULT_FILTERS, applyFilters, fitsLevel, fitsMajor, isOpen } from './lib/match'
import { useLocalStorage } from './lib/store'
import { DAY, useNow } from './lib/time'
import { toast } from './lib/toast'
import type { User } from './lib/user'

const byId = (id: string) => OPPORTUNITIES.find(o => o.id === id)

interface Props {
  user: User
  onUser: (u: User) => void
  onLogOut: () => void
  /** Listing to open on arrival, from #/app/<id>. */
  initialOpen?: string
}

export default function MainApp({ user, onUser, onLogOut, initialOpen }: Props) {
  const now = useNow(30_000)

  const profile: Profile = { major: user.major, level: user.level }
  const setProfile = (p: Profile) => onUser({ ...user, ...p })
  const [saved, setSaved] = useLocalStorage<string[]>('igh.saved', [])
  const [applied] = useLocalStorage<string[]>('igh.applied', [])
  const [reminders, setReminders] = useLocalStorage<Record<string, Reminder>>('igh.reminders', {})
  const [view, setView] = useState<View>('explore')
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [openId, setOpenId] = useState<string | null>(initialOpen && byId(initialOpen) ? initialOpen : null)
  const [alertsOpen, setAlertsOpen] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const msgId = useRef(1)
  const feedRef = useRef<HTMLDivElement>(null)

  const open = OPPORTUNITIES.filter(o => isOpen(o, now))
  const mine = open.filter(o => fitsMajor(o, profile.major) && fitsLevel(o, profile.level))
  const feed = applyFilters(OPPORTUNITIES, profile, filters, now)
  const savedOpps = saved.map(byId).filter((o): o is Opportunity => !!o)
  const current = openId ? byId(openId) : undefined
  const major = majorById(profile.major)

  const toggleSave = (id: string) => {
    if (saved.includes(id)) {
      setSaved(s => s.filter(x => x !== id))
      toast('Removed from saved')
    } else {
      setSaved(s => (s.includes(id) ? s : [...s, id]))
      setReminders(r => ({ ...r, [id]: r[id] ?? { d3: false, d1: true } }))
      toast("Saved — we'll remind you 1 day before it closes")
    }
  }

  // The apply page opens in a new tab; it marks the listing applied once the form is sent.
  const apply = (o: Opportunity) => {
    toast(`Opening ${o.org}'s application page`)
  }

  const setReminder = (id: string, r: Reminder) => {
    setReminders(all => ({ ...all, [id]: r }))
    if (r.d1 || r.d3) toast(`Reminder set: ${[r.d3 && '3 days', r.d1 && '1 day'].filter(Boolean).join(' and ')} before`)
  }

  const ask = (text: string, focus?: Opportunity) => {
    setAiOpen(true)
    const userMsg: ChatMessage = { id: msgId.current++, role: 'user', text }
    const aiId = msgId.current++
    setMessages(m => [...m, userMsg, { id: aiId, role: 'ai', text: '', pending: true }])
    setTimeout(() => {
      const reply = answer(text, { profile, now: Date.now(), focus, name: user.name })
      setMessages(m => m.map(x => (x.id === aiId ? { ...x, ...reply, pending: false } : x)))
    }, 650 + (text.length % 5) * 80)
  }

  const draftFor = (o: Opportunity) => {
    setOpenId(null)
    ask(`Draft a cover letter for the ${o.title} at ${o.org}`, o)
  }

  // React Compiler memoizes these, so effects keyed on them don't re-run each render.
  const closeDrawer = () => setOpenId(null)
  const closeAlerts = () => setAlertsOpen(false)
  const closeAi = () => setAiOpen(false)

  const search = (q: string) => {
    setFilters({ ...filters, q, scope: q ? 'all' : filters.scope })
    feedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const renderCards = (list: Opportunity[]) => (
    <div className="grid" key={`${profile.major}-${profile.level}-${JSON.stringify(filters)}-${view}`}>
      {list.map((o, i) => (
        <OpportunityCard
          key={o.id}
          opp={o}
          index={Math.min(i, 8)}
          profile={profile}
          saved={saved.includes(o.id)}
          applied={applied.includes(o.id)}
          onSave={() => toggleSave(o.id)}
          onOpen={() => setOpenId(o.id)}
          onApply={() => apply(o)}
        />
      ))}
    </div>
  )

  return (
    <>
      <Nav
        view={view}
        onView={setView}
        savedCount={saved.length}
        user={user}
        onAlerts={() => setAlertsOpen(true)}
        onAsk={() => setAiOpen(true)}
        onLogOut={onLogOut}
      />

      <main className="page">
        {view === 'explore' && (
          <>
            <Hero
              profile={profile}
              onProfile={setProfile}
              totalOpen={open.length}
              stats={{
                matches: mine.length,
                thisWeek: mine.filter(o => o.deadline - now < 7 * DAY).length,
                paid: mine.filter(o => o.paid).length,
              }}
              onSearch={search}
              onAsk={q => ask(q)}
            />

            <div ref={feedRef} style={{ scrollMarginTop: 90 }}>
              <div className="feed-head">
                <div>
                  <h2>{filters.q ? `Results for “${filters.q}”` : filters.scope === 'all' ? 'All opportunities' : `For ${major.name} students`}</h2>
                  <p>{feed.length} {feed.length === 1 ? 'opportunity' : 'opportunities'} · ranked by {filters.sort === 'match' ? 'relevance and deadline' : filters.sort === 'deadline' ? 'closing date' : 'newest first'}</p>
                </div>
              </div>
              <FilterBar filters={filters} onChange={setFilters} />
              {feed.length ? (
                renderCards(feed)
              ) : (
                <div className="empty glass rise">
                  <div className="em-icon"><Icon name="search" size={24} /></div>
                  <h3>No matches with these filters</h3>
                  <p>Try widening your filters, or let us alert you when something fits.</p>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button className="btn ghost" onClick={() => setFilters(DEFAULT_FILTERS)}>Reset filters</button>
                    <button className="btn" data-magnetic="0.2" onClick={() => setAlertsOpen(true)}><Icon name="bell" size={16} /> Get alerts</button>
                  </div>
                </div>
              )}
            </div>

            <section className="employer glass" data-spotlight>
              <div>
                <h3>Hiring UG talent?</h3>
                <p>Post internships and fellowships straight to students in the right major and level. Featured listings sit at the top of matching feeds.</p>
              </div>
              <div className="cta">
                <a className="btn ghost" href="#/post/tip">Share a student tip</a>
                <a className="btn" data-magnetic="0.2" href="#/post">
                  Post an opportunity <Icon name="arrow" size={16} />
                </a>
              </div>
            </section>
          </>
        )}

        {view === 'deadlines' && (
          <Deadlines
            profile={profile}
            saved={savedOpps}
            upcoming={[...mine].sort((a, b) => a.deadline - b.deadline)}
            reminders={reminders}
            onReminder={setReminder}
            onOpen={setOpenId}
            onExplore={() => setView('explore')}
          />
        )}

        {view === 'saved' && (
          <section>
            <div className="view-head rise">
              <h1>Saved opportunities</h1>
              <p>Your shortlist. Apply in one tap, or ask the assistant for a cover letter.</p>
            </div>
            {savedOpps.length ? (
              renderCards(savedOpps)
            ) : (
              <div className="empty glass rise">
                <div className="em-icon"><Icon name="bookmark" size={24} /></div>
                <h3>Start your shortlist</h3>
                <p>Tap the bookmark on any opportunity to keep it here with a live countdown.</p>
                <button className="btn" data-magnetic="0.2" onClick={() => setView('explore')}>Explore opportunities</button>
              </div>
            )}
          </section>
        )}

        <footer className="footer">
          InternGH demo · Phase 1: University of Ghana, 10 majors · All companies and listings are fictional
        </footer>
      </main>

      {!aiOpen && (
        <button className="btn ai-launch" data-magnetic="0.3" onClick={() => setAiOpen(true)} aria-label="Ask the AI assistant">
          <span className="spark"><Icon name="sparkles" size={20} /></span>
          <span className="label">Ask InternGH AI</span>
        </button>
      )}

      {aiOpen && (
        <Assistant
          profile={profile}
          messages={messages}
          onSend={t => ask(t, current)}
          onClose={closeAi}
          onOpenOpp={setOpenId}
          onDraft={draftFor}
        />
      )}

      {current && (
        <DetailDrawer
          opp={current}
          saved={saved.includes(current.id)}
          applied={applied.includes(current.id)}
          reminder={reminders[current.id] ?? { d3: false, d1: false }}
          onClose={closeDrawer}
          onSave={() => toggleSave(current.id)}
          onApply={() => apply(current)}
          onReminder={r => setReminder(current.id, r)}
          onDraft={() => draftFor(current)}
        />
      )}

      {alertsOpen && <AlertsModal profile={profile} sample={mine[0]} defaultPhone={user.phone} onClose={closeAlerts} />}
    </>
  )
}
