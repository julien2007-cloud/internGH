import { useState } from 'react'
import { Toggle } from '../components/Bits'
import { Icon } from '../components/Icon'
import { OpportunityCard } from '../components/OpportunityCard'
import { ThemeToggle } from '../components/ThemeToggle'
import type { OppDetails, WorkMode } from '../data/details'
import type { Level, MajorId } from '../data/majors'
import { LEVELS, MAJORS } from '../data/majors'
import type { Opportunity, OppType } from '../data/opportunities'
import { OPP_TYPES } from '../data/opportunities'
import { mergeShared, publish } from '../data/posted'
import type { AlertReport } from '../lib/whatsapp'
import { publishListing } from '../lib/whatsapp'
import { DAY } from '../lib/time'
import type { User } from '../lib/user'
import { initialsOf } from '../lib/user'

type Mode = 'employer' | 'tip'
type Step = 'org' | 'role' | 'pay' | 'review'

const STEPS: { id: Step; label: string }[] = [
  { id: 'org', label: 'Organisation' },
  { id: 'role', label: 'Role' },
  { id: 'pay', label: 'Pay and dates' },
  { id: 'review', label: 'Review' },
]
const LOCATIONS = ['Accra', 'Legon campus', 'Tema', 'Kumasi', 'Cape Coast', 'Takoradi', 'Tamale', 'Ho', 'Remote']
const SWATCHES = ['#4f46e5', '#db2777', '#0891b2', '#16a34a', '#ca8a04', '#dc2626', '#7c3aed', '#0f172a']
const SCHEDULES = ['Full-time, Mon–Fri, 8am–5pm', 'Part-time, 20 hours a week', 'Weekends only', 'Flexible hours']
const HEARD = ['WhatsApp group', 'LinkedIn', 'Department notice board', 'Company website', 'A friend', 'Other']
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const lines = (s: string) => s.split('\n').map(x => x.replace(/^[-•*]\s*/, '').trim()).filter(Boolean)
const toDateInput = (ts: number) => new Date(ts - new Date(ts).getTimezoneOffset() * 60_000).toISOString().slice(0, 10)

interface Props {
  mode: Mode
  user: User | null
}

export function Post({ mode, user }: Props) {
  const tip = mode === 'tip'
  const [step, setStep] = useState<Step>('org')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [done, setDone] = useState<Opportunity | null>(null)

  // Organisation
  const [org, setOrg] = useState('')
  const [contact, setContact] = useState(tip ? user?.email ?? '' : '')
  const [website, setWebsite] = useState('')
  const [about, setAbout] = useState('')
  const [color, setColor] = useState(SWATCHES[0])
  const [heard, setHeard] = useState(HEARD[0])
  // Role
  const [title, setTitle] = useState('')
  const [type, setType] = useState<OppType>('Internship')
  const [majors, setMajors] = useState<MajorId[]>(user ? [user.major] : [])
  const [levels, setLevels] = useState<Level[]>([300, 400])
  const [location, setLocation] = useState('Accra')
  const [workMode, setWorkMode] = useState<WorkMode>('On-site')
  const [summary, setSummary] = useState('')
  const [does, setDoes] = useState('')
  const [reqs, setReqs] = useState('')
  const [perks, setPerks] = useState('')
  // Pay and dates
  const [paid, setPaid] = useState(true)
  const [amount, setAmount] = useState('')
  const [per, setPer] = useState<'month' | 'total'>('month')
  const [unpaidNote, setUnpaidNote] = useState('')
  const [durN, setDurN] = useState('3')
  const [durUnit, setDurUnit] = useState<'days' | 'weeks' | 'months'>('months')
  const [start, setStart] = useState('')
  const [schedule, setSchedule] = useState('')
  const [openings, setOpenings] = useState('2')
  const [deadline, setDeadline] = useState('')
  // Review
  const [featured, setFeatured] = useState(false)
  const [authorised, setAuthorised] = useState(false)
  // Publishing to everyone (matching students are always alerted on WhatsApp)
  const [code, setCode] = useState('')
  const [publishing, setPublishing] = useState(false)
  const [outcome, setOutcome] = useState<{ shared: boolean; alerts?: AlertReport; note?: string } | null>(null)
  // Stable per page load so the draft id doesn't change while typing.
  const [today] = useState(() => Date.now())

  const stepIndex = STEPS.findIndex(s => s.id === step)
  const clear = (k: string) => {
    if (!errors[k]) return
    setErrors(e => {
      const next = { ...e }
      delete next[k]
      return next
    })
  }

  // ---------- Build the listing from the form ----------
  const n = Math.max(1, Number(durN) || 1)
  const unitLabel = n === 1 ? durUnit.slice(0, -1) : durUnit
  const months = durUnit === 'months' ? n : durUnit === 'weeks' ? n / 4.33 : n / 30
  const amountNum = Number(amount.replace(/[^\d.]/g, ''))
  const free = type === 'Workshop' || type === 'Training'
  const stipend = paid
    ? `GH₵ ${amountNum ? amountNum.toLocaleString('en-GH') : '—'}${per === 'month' ? ' / month' : ' total'}`
    : `${free ? 'Free' : 'Unpaid'}${unpaidNote.trim() ? ` · ${unpaidNote.trim()}` : ''}`
  const deadlineTs = deadline ? new Date(`${deadline}T23:59:00`).getTime() : today + 14 * DAY
  const orgName = org.trim() || 'Your organisation'

  const draft: Opportunity = {
    id: `post-${today}`,
    title: title.trim() || 'Your role title',
    org: orgName,
    initials: initialsOf(orgName) || 'IG',
    color,
    type,
    majors: majors.length ? majors : ['cs'],
    levels: levels.length ? [...levels].sort() : [300],
    location,
    remote: location === 'Remote',
    paid,
    stipend,
    duration: `${n} ${unitLabel}`,
    months,
    deadline: deadlineTs,
    posted: today,
    summary: summary.trim() || 'A short description of the role will appear here.',
    requirements: lines(reqs),
    perks: lines(perks),
    source: tip ? 'Student tip' : 'Partner company',
    verified: false,
    featured: !tip && featured,
  }
  const details: OppDetails = {
    does: lines(does),
    about: about.trim(),
    start: start.trim() || 'To be confirmed',
    schedule: schedule.trim() || 'To be confirmed',
    mode: location === 'Remote' ? 'Remote' : workMode,
    openings: Math.max(1, Number(openings) || 1),
  }

  // ---------- Validation per step ----------
  const validate = (s: Step) => {
    const e: Record<string, string> = {}
    if (s === 'org') {
      if (org.trim().length < 2) e.org = 'Enter the organisation name.'
      if (!tip && !EMAIL.test(contact.trim())) e.contact = 'Enter a contact email so we can verify the listing.'
      if (tip && contact.trim() && !EMAIL.test(contact.trim())) e.contact = 'Check this email address.'
      if (!tip && about.trim().length < 20) e.about = 'Add a sentence or two about the organisation.'
    }
    if (s === 'role') {
      if (title.trim().length < 4) e.title = 'Enter a role title.'
      if (!majors.length) e.majors = 'Pick at least one major.'
      if (!levels.length) e.levels = 'Pick at least one level.'
      if (summary.trim().length < 40) e.summary = 'Describe the role in at least a couple of sentences.'
      if (lines(does).length < 2) e.does = "List at least two things they'll do, one per line."
      if (lines(reqs).length < 1) e.reqs = 'List at least one requirement.'
    }
    if (s === 'pay') {
      if (paid && !(amountNum > 0)) e.amount = 'Enter the expected pay in cedis.'
      if (!(Number(durN) > 0)) e.dur = 'Enter how long it runs.'
      if (!start.trim()) e.start = 'Enter a start date, like January 2027.'
      if (!schedule.trim()) e.schedule = 'Describe the working hours.'
      if (!(Number(openings) > 0)) e.openings = 'Enter how many places are open.'
      if (!deadline) e.deadline = 'Pick an application deadline.'
      else if (deadlineTs <= today) e.deadline = 'The deadline must be in the future.'
      else if (deadlineTs - today > 365 * DAY) e.deadline = 'Deadlines can be up to a year away.'
    }
    if (s === 'review' && !authorised) e.authorised = tip ? 'Confirm the details are accurate.' : 'Confirm you can post for this organisation.'
    setErrors(e)
    if (Object.keys(e).length) {
      requestAnimationFrame(() => document.querySelector('.post-card .bad, .post-card .error')?.scrollIntoView({ behavior: 'smooth', block: 'center' }))
      return false
    }
    return true
  }

  const finish = async () => {
    // With the publisher code: publish to every student (server) and optionally WhatsApp matches.
    if (!tip && code.trim()) {
      setPublishing(true)
      const res = await publishListing(code.trim(), { opp: draft, details })
      setPublishing(false)
      if (res.ok) {
        mergeShared([res.listing])
        setDone(res.listing.opp)
        setOutcome({ shared: true, alerts: res.alerts })
        return
      }
      if (['bad_code', 'publishing_disabled', 'bad_listing', 'rate_limited'].includes(res.error)) {
        setErrors({ code: res.message })
        return
      }
      // Server not set up: fall back to this device so the work isn't lost.
      publish({ opp: draft, details })
      setDone(draft)
      setOutcome({ shared: false, note: res.message })
      return
    }
    publish({ opp: draft, details })
    setDone(draft)
    setOutcome({ shared: false })
  }

  const next = async () => {
    if (!validate(step)) return
    if (step === 'review') await finish()
    else setStep(STEPS[stepIndex + 1].id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const back = () => {
    setErrors({})
    setStep(STEPS[stepIndex - 1].id)
  }

  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter(x => x !== v) : [...list, v])
  const backHref = user ? '#/app' : '#/'

  return (
    <div className="post">
      <header className="post-bar">
        <a className="logo" href={backHref}>
          <span className="logo-mark"><Icon name="cap" size={15} /></span>
          InternGH <span className="for">{tip ? 'Student tips' : 'For employers'}</span>
        </a>
        <div className="post-bar-actions">
          <ThemeToggle />
          <a className="btn ghost sm" href={backHref}><Icon name="arrowLeft" size={14} /> Back</a>
        </div>
      </header>

      {done ? (
        <main className="post-done rise">
          <div className="success-icon"><Icon name="check" size={32} /></div>
          <h1>{tip ? 'Thanks for the tip' : outcome?.shared ? 'Live for every student' : 'Your listing is live'}</h1>
          {outcome?.shared ? (
            <p>
              <b>{done.title}</b> at {done.org} is now in the feed of every {majorList(done.majors)} student at {done.levels.join(', ')}-level.
            </p>
          ) : (
            <p>
              <b>{done.title}</b> at {done.org} now shows on this device for {done.majors.length === 1 ? 'one major' : `${done.majors.length} majors`} with a live countdown.
              It's marked <b>Pending review</b> until an InternGH moderator verifies it{tip ? '' : ` using ${contact.trim()}`}.
              {outcome?.note && <><br /><small>Not shared with everyone: {outcome.note}</small></>}
            </p>
          )}
          {outcome?.shared && outcome.alerts && <AlertSummary alerts={outcome.alerts} deadline={done.deadline} />}
          <div className="post-done-card">
            <OpportunityCard opp={done} index={0} profile={{ major: done.majors[0], level: done.levels[0] }} saved={false} applied={false} onSave={() => {}} onOpen={() => {}} onApply={() => {}} />
          </div>
          <div className="post-done-actions">
            <a className="btn" data-magnetic="0.2" href={user ? `#/app/${done.id}` : '#/signin'}>
              {user ? 'View it in the app' : 'Sign in to view it'} <Icon name="arrow" size={16} />
            </a>
            <button className="btn ghost" onClick={() => window.location.reload()}>Post another</button>
          </div>
          <p className="fine">Demo only — saved in this browser, nothing is sent to a server.</p>
        </main>
      ) : (
        <div className="post-grid">
          <section className="post-card glass">
            <div className="post-intro">
              <span className="kicker">{tip ? 'Share a student tip' : 'Post an opportunity'}</span>
              <h1>{tip ? 'Seen an opportunity? Share it' : 'Reach UG students in the right major'}</h1>
              <p>
                {tip
                  ? 'Spotted something in a WhatsApp group or on a notice board? Add it here. A moderator checks every tip before it is verified.'
                  : 'Your listing goes straight to students whose major and level match, with deadline reminders built in.'}
              </p>
            </div>

            <div className="stepper four" aria-label={`Step ${stepIndex + 1} of 4`}>
              {STEPS.map((s, i) => (
                <div key={s.id} className={`st ${i < stepIndex ? 'done' : i === stepIndex ? 'on' : ''}`}>
                  <span>{i < stepIndex ? <Icon name="check" size={12} /> : i + 1}</span>
                  {s.label}
                </div>
              ))}
              <i className="st-line" style={{ transform: `scaleX(${stepIndex / 3})` }} />
            </div>

            <form
              key={step}
              className="auth-step post-form"
              noValidate
              onSubmit={e => {
                e.preventDefault()
                next()
              }}
            >
              {step === 'org' && (
                <>
                  <F label="Organisation name" error={errors.org}>
                    <input value={org} onChange={e => { setOrg(e.target.value); clear('org') }} placeholder="Nkosuo Tech" autoFocus />
                  </F>
                  {tip ? (
                    <>
                      <F label="Where did you see it?">
                        <select value={heard} onChange={e => setHeard(e.target.value)}>
                          {HEARD.map(h => <option key={h}>{h}</option>)}
                        </select>
                      </F>
                      <F label="Your email (optional)" error={errors.contact} hint="So a moderator can follow up if needed.">
                        <input type="email" value={contact} onChange={e => { setContact(e.target.value); clear('contact') }} placeholder="kmensah123@st.ug.edu.gh" />
                      </F>
                    </>
                  ) : (
                    <>
                      <div className="two">
                        <F label="Contact email" error={errors.contact} hint="Used to verify the listing. Not shown to students.">
                          <input type="email" value={contact} onChange={e => { setContact(e.target.value); clear('contact') }} placeholder="careers@company.com.gh" />
                        </F>
                        <F label="Website (optional)">
                          <input value={website} onChange={e => setWebsite(e.target.value)} placeholder="company.com.gh" />
                        </F>
                      </div>
                      <F label="About the organisation" error={errors.about}>
                        <textarea rows={3} value={about} onChange={e => { setAbout(e.target.value); clear('about') }} placeholder="What you do, who you serve, and where you're based." />
                      </F>
                    </>
                  )}
                  <div className="af">
                    <span>Logo colour</span>
                    <div className="swatches">
                      {SWATCHES.map(c => (
                        <button type="button" key={c} className={`swatch ${color === c ? 'on' : ''}`} style={{ background: c }} aria-label={`Colour ${c}`} onClick={() => setColor(c)} />
                      ))}
                    </div>
                  </div>
                </>
              )}

              {step === 'role' && (
                <>
                  <F label="Role title" error={errors.title}>
                    <input value={title} onChange={e => { setTitle(e.target.value); clear('title') }} placeholder="Data Analyst Intern" autoFocus />
                  </F>
                  <div className="af">
                    <span>Type</span>
                    <div className="seg wrap">
                      {OPP_TYPES.map(t => (
                        <button type="button" key={t} className={type === t ? 'on' : ''} onClick={() => setType(t)}>{t}</button>
                      ))}
                    </div>
                  </div>
                  <div className={`af ${errors.majors ? 'bad' : ''}`}>
                    <span>Majors it's for</span>
                    <div className="mini-chips">
                      {MAJORS.map(m => (
                        <button type="button" key={m.id} className={majors.includes(m.id) ? 'on' : ''} onClick={() => { setMajors(toggle(majors, m.id)); clear('majors') }}>
                          {m.name}
                        </button>
                      ))}
                    </div>
                    {errors.majors && <em className="error">{errors.majors}</em>}
                  </div>
                  <div className={`af ${errors.levels ? 'bad' : ''}`}>
                    <span>Eligible levels</span>
                    <div className="mini-chips">
                      {LEVELS.map(l => (
                        <button type="button" key={l} className={levels.includes(l) ? 'on' : ''} onClick={() => { setLevels(toggle(levels, l)); clear('levels') }}>
                          {l}-level
                        </button>
                      ))}
                    </div>
                    {errors.levels && <em className="error">{errors.levels}</em>}
                  </div>
                  <div className="two">
                    <F label="Location">
                      <select value={location} onChange={e => setLocation(e.target.value)}>
                        {LOCATIONS.map(l => <option key={l}>{l}</option>)}
                      </select>
                    </F>
                    <div className="af">
                      <span>Work mode</span>
                      <div className="seg">
                        {(['On-site', 'Hybrid', 'Remote'] as const).map(m => (
                          <button type="button" key={m} className={(location === 'Remote' ? 'Remote' : workMode) === m ? 'on' : ''}
                            onClick={() => { setWorkMode(m); if (m === 'Remote') setLocation('Remote'); else if (location === 'Remote') setLocation('Accra') }}>
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <F label="About the role" error={errors.summary}>
                    <textarea rows={3} value={summary} onChange={e => { setSummary(e.target.value); clear('summary') }} placeholder="What the role is and why it's a great opportunity for students." />
                  </F>
                  <F label="What they'll do" error={errors.does} hint="One task per line.">
                    <textarea rows={4} value={does} onChange={e => { setDoes(e.target.value); clear('does') }} placeholder={'Clean and analyse survey data\nBuild weekly dashboards\nPresent findings to the team'} />
                  </F>
                  <div className="two">
                    <F label="Requirements" error={errors.reqs} hint="One per line.">
                      <textarea rows={3} value={reqs} onChange={e => { setReqs(e.target.value); clear('reqs') }} placeholder={'Excel or Google Sheets\nAvailable for the full period'} />
                    </F>
                    <F label="Perks (optional)" hint="One per line.">
                      <textarea rows={3} value={perks} onChange={e => setPerks(e.target.value)} placeholder={'Transport allowance\nCertificate'} />
                    </F>
                  </div>
                </>
              )}

              {step === 'pay' && (
                <>
                  <div className="af">
                    <span>Pay</span>
                    <Toggle on={paid} onChange={setPaid}>{paid ? 'This role is paid' : free ? 'Free to attend' : 'Unpaid'}</Toggle>
                  </div>
                  {paid ? (
                    <div className="two">
                      <F label="Expected pay (GH₵)" error={errors.amount}>
                        <input inputMode="numeric" value={amount} onChange={e => { setAmount(e.target.value); clear('amount') }} placeholder="1,200" autoFocus />
                      </F>
                      <div className="af">
                        <span>Paid</span>
                        <div className="seg">
                          <button type="button" className={per === 'month' ? 'on' : ''} onClick={() => setPer('month')}>Per month</button>
                          <button type="button" className={per === 'total' ? 'on' : ''} onClick={() => setPer('total')}>In total</button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <F label="Anything provided instead? (optional)">
                      <input value={unpaidNote} onChange={e => setUnpaidNote(e.target.value)} placeholder="Transport refund, meals, certificate" />
                    </F>
                  )}
                  <div className="two">
                    <div className={`af ${errors.dur ? 'bad' : ''}`}>
                      <span>Duration</span>
                      <div className="dur">
                        <input inputMode="numeric" value={durN} onChange={e => { setDurN(e.target.value.replace(/\D/g, '')); clear('dur') }} />
                        <select value={durUnit} onChange={e => setDurUnit(e.target.value as typeof durUnit)}>
                          <option value="days">days</option>
                          <option value="weeks">weeks</option>
                          <option value="months">months</option>
                        </select>
                      </div>
                      {errors.dur && <em className="error">{errors.dur}</em>}
                    </div>
                    <F label="Openings" error={errors.openings}>
                      <input inputMode="numeric" value={openings} onChange={e => { setOpenings(e.target.value.replace(/\D/g, '')); clear('openings') }} />
                    </F>
                  </div>
                  <div className="two">
                    <F label="Start date" error={errors.start}>
                      <input value={start} onChange={e => { setStart(e.target.value); clear('start') }} placeholder="January 2027" />
                    </F>
                    <F label="Application deadline" error={errors.deadline}>
                      <input type="date" value={deadline} min={toDateInput(today + DAY)} onChange={e => { setDeadline(e.target.value); clear('deadline') }} />
                    </F>
                  </div>
                  <F label="Schedule" error={errors.schedule}>
                    <input value={schedule} onChange={e => { setSchedule(e.target.value); clear('schedule') }} placeholder="Full-time, Mon–Fri, 8am–5pm" />
                  </F>
                  <div className="mini-chips suggest-chips">
                    {SCHEDULES.map(s => (
                      <button type="button" key={s} className={schedule === s ? 'on' : ''} onClick={() => { setSchedule(s); clear('schedule') }}>{s}</button>
                    ))}
                  </div>
                </>
              )}

              {step === 'review' && (
                <>
                  <dl className="review">
                    <div><dt>Organisation</dt><dd>{draft.org}{website.trim() && ` · ${website.trim()}`}</dd></div>
                    <div><dt>Role</dt><dd>{draft.title} · {draft.type}</dd></div>
                    <div><dt>For</dt><dd>{draft.majors.map(m => MAJORS.find(x => x.id === m)!.short).join(', ')} · {draft.levels.join(', ')}-level</dd></div>
                    <div><dt>Pay</dt><dd>{draft.stipend}</dd></div>
                    <div><dt>Duration</dt><dd>{draft.duration} · starts {details.start}</dd></div>
                    <div><dt>Where</dt><dd>{draft.location} · {details.mode} · {details.openings} {details.openings === 1 ? 'place' : 'places'}</dd></div>
                    <div><dt>Schedule</dt><dd>{details.schedule}</dd></div>
                    <div><dt>Deadline</dt><dd>{new Date(deadlineTs).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}</dd></div>
                    <div><dt>They'll do</dt><dd>{details.does.join(' · ')}</dd></div>
                    {tip && <div><dt>Seen on</dt><dd>{heard}</dd></div>}
                  </dl>
                  {!tip && (
                    <label className="feature-opt">
                      <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} />
                      <span>
                        <b><Icon name="star" size={14} /> Feature this listing</b>
                        <small>Featured listings sit at the top of matching feeds. Paid add-on — no payment is taken in this demo.</small>
                      </span>
                    </label>
                  )}
                  {!tip && (
                    <div className="publish-box">
                      <b><Icon name="users" size={15} /> Publish to all students</b>
                      <F label="Publisher code" error={errors.code} hint="Given to verified partners by the InternGH team. Leave blank to save on this device only.">
                        <input type="password" autoComplete="off" value={code} onChange={e => { setCode(e.target.value); clear('code') }} placeholder="Publisher code" />
                      </F>
                      <small>
                        <Icon name="chat" size={13} /> Every student subscribed for {majorList(draft.majors)} at {draft.levels.join(', ')}-level
                        automatically gets a WhatsApp alert when this goes live, and reminders 3 days and 1 day before the deadline.
                      </small>
                    </div>
                  )}
                  <label className={`consent ${errors.authorised ? 'bad' : ''}`}>
                    <input type="checkbox" checked={authorised} onChange={e => { setAuthorised(e.target.checked); clear('authorised') }} />
                    <span>{tip ? 'To the best of my knowledge these details are accurate.' : `I'm authorised to post this opportunity on behalf of ${draft.org}.`}</span>
                  </label>
                  {errors.authorised && <p className="error">{errors.authorised}</p>}
                </>
              )}

              <div className="post-nav">
                {stepIndex > 0 && (
                  <button type="button" className="btn ghost" onClick={back}><Icon name="arrowLeft" size={16} /> Back</button>
                )}
                <button type="submit" className="btn" data-magnetic="0.12" disabled={publishing}>
                  {publishing ? <span className="spinner" /> : step === 'review'
                    ? <>{tip ? 'Share tip' : code.trim() ? 'Publish and alert students' : 'Publish listing'} <Icon name="send" size={16} /></>
                    : <>Continue <Icon name="arrow" size={16} /></>}
                </button>
              </div>
            </form>
          </section>

          <aside className="post-preview">
            <span className="kicker">Live preview</span>
            <p>This is how students will see it.</p>
            <div className="post-preview-card">
              <OpportunityCard
                opp={{ ...draft, featured: !tip && featured }}
                index={0}
                profile={{ major: draft.majors[0], level: draft.levels[0] }}
                saved={false}
                applied={false}
                onSave={() => {}}
                onOpen={() => {}}
                onApply={() => {}}
              />
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}

const majorList = (ids: MajorId[]) => ids.map(id => MAJORS.find(m => m.id === id)?.short ?? id).join(', ')

/** What happened with WhatsApp after publishing to everyone. */
function AlertSummary({ alerts, deadline }: { alerts: AlertReport; deadline: number }) {
  const when = new Date(deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  const notConnected = alerts.errors.some(e => /not connected/i.test(e))
  return (
    <div className={`alert-summary ${alerts.failed || notConnected ? 'warn' : 'ok'}`}>
      <Icon name="chat" size={18} />
      <span>
        {alerts.matched === 0
          ? 'No subscribed students match this posting yet. New subscribers will still get the deadline reminders.'
          : notConnected
            ? `${alerts.matched} subscribed ${alerts.matched === 1 ? 'student matches' : 'students match'}, but WhatsApp isn't connected yet, so nothing was sent.`
            : `WhatsApp alert sent to ${alerts.sent} of ${alerts.matched} matching ${alerts.matched === 1 ? 'student' : 'students'}${alerts.failed ? ` (${alerts.failed} failed: ${alerts.errors[0]})` : ''}.`}
        <small>Reminders go out 3 days and 1 day before it closes on {when}.</small>
      </span>
    </div>
  )
}

function F({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className={`af ${error ? 'bad' : ''}`}>
      <span>{label}</span>
      {children}
      {error ? <em className="error">{error}</em> : hint && <small className="hint">{hint}</small>}
    </label>
  )
}
