import { useState } from 'react'
import { Avatar } from '../components/Bits'
import { Icon } from '../components/Icon'
import { detailsFor } from '../data/details'
import type { Level, MajorId } from '../data/majors'
import { LEVELS, MAJORS } from '../data/majors'
import { OPPORTUNITIES } from '../data/opportunities'
import { useLocalStorage } from '../lib/store'
import { formatDate, shortLeft, timeLeft, useNow } from '../lib/time'
import type { User } from '../lib/user'

interface Props {
  oppId: string
  user: User | null
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Stand-in for an organisation's own careers page. In the live app the
 * Apply button links out to the real site instead.
 */
export function Apply({ oppId, user }: Props) {
  const o = OPPORTUNITIES.find(x => x.id === oppId)
  const now = useNow(1000)
  const [applied, setApplied] = useLocalStorage<string[]>('igh.applied', [])

  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [major, setMajor] = useState<MajorId>(user?.major ?? 'cs')
  const [level, setLevel] = useState<Level>(user?.level ?? 300)
  const [studentId, setStudentId] = useState(user?.studentId ?? '')
  const [cv, setCv] = useState<File | null>(null)
  const [extra, setExtra] = useState<File | null>(null)
  const [letter, setLetter] = useState('')
  const [canStart, setCanStart] = useState<'yes' | 'no' | ''>('')
  const [consent, setConsent] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [sending, setSending] = useState(false)
  const [ref, setRef] = useState('')

  if (!o) {
    return (
      <div className="apply-missing">
        <h1>We couldn't find that listing</h1>
        <p>It may have been removed by the organisation.</p>
        <a className="btn" href="#/app">Back to InternGH</a>
      </div>
    )
  }

  const d = detailsFor(o)
  const t = timeLeft(o.deadline, now)
  const isFellowship = o.type === 'Fellowship'
  const isWorkshop = o.type === 'Workshop'
  const needsCv = !isWorkshop
  const letterLabel = isFellowship ? 'Motivation statement' : isWorkshop ? 'Why do you want to join? (optional)' : 'Cover letter'

  const clear = (k: string) => {
    if (!errors[k]) return
    setErrors(e => {
      const next = { ...e }
      delete next[k]
      return next
    })
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (name.trim().split(/\s+/).length < 2) next.name = 'Enter your first and last name.'
    if (!EMAIL.test(email.trim())) next.email = 'Enter a valid email address.'
    if (phone.replace(/\D/g, '').replace(/^(233|0)/, '').length !== 9) next.phone = 'Enter a 9-digit Ghana number.'
    if (!/^\d{8}$/.test(studentId)) next.studentId = 'Your student ID has 8 digits.'
    if (needsCv && !cv) next.cv = 'Upload your CV.'
    if (isFellowship && letter.trim().length < 80) next.letter = 'Write at least a few sentences (80+ characters).'
    if (!isWorkshop && !canStart) next.canStart = 'Let us know if you can start on time.'
    if (!consent) next.consent = 'Confirm the information is accurate to continue.'
    setErrors(next)
    if (Object.keys(next).length) {
      document.querySelector('.apply-form .bad, .apply-form .error')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setSending(true)
    setTimeout(() => {
      setSending(false)
      setRef(`${o.initials}-${new Date().getFullYear()}-${String(Math.floor(10000 + Math.random() * 90000))}`)
      if (!applied.includes(o.id)) setApplied([...applied, o.id])
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 1100)
  }

  const brand = { '--brand': o.color } as React.CSSProperties

  return (
    <div className="apply" style={brand}>
      <div className="demo-strip">
        <Icon name="sparkles" size={14} />
        Demo application page. In the live app, Apply opens {o.org}'s own careers website.
        <a href="#/app">Back to InternGH</a>
      </div>

      <header className="co-bar">
        <div className="co-brand">
          <Avatar initials={o.initials} color={o.color} />
          <div>
            <b>{o.org}</b>
            <small>Careers</small>
          </div>
        </div>
        <a className="btn ghost sm" href="#/app"><Icon name="arrowLeft" size={14} /> InternGH</a>
      </header>

      {ref ? (
        <main className="apply-done rise">
          <div className="success-icon"><Icon name="check" size={32} /></div>
          <h1>Application sent</h1>
          <p>
            Thanks, {name.split(' ')[0]}. {o.org} has received your application for the <b>{o.title}</b>.
            A confirmation has been sent to {email}.
          </p>
          <div className="ref-box">
            <small>Reference number</small>
            <b>{ref}</b>
          </div>
          <div className="apply-next">
            <h4>What happens next</h4>
            <ol className="steps-list">
              {d.selection.map((s, i) => <li key={s}><span>{i + 1}</span>{s}</li>)}
            </ol>
          </div>
          <div className="apply-done-actions">
            <a className="btn" href="#/app" data-magnetic="0.2">Back to InternGH <Icon name="arrow" size={16} /></a>
          </div>
          <p className="fine">Demo only — nothing was sent and no files left your device.</p>
        </main>
      ) : (
        <>
          <section className="apply-hero">
            <span className="badge brand-badge">{o.type}</span>
            <h1>{o.title}</h1>
            <div className="apply-meta">
              <span><Icon name="pin" size={15} /> {o.location} · {d.mode}</span>
              <span><Icon name="wallet" size={15} /> {o.stipend}</span>
              <span><Icon name="hourglass" size={15} /> {o.duration}</span>
              <span className={t.urgent ? 'hot' : ''}><Icon name="clock" size={15} /> Closes in {shortLeft(t)}</span>
            </div>
          </section>

          <div className="apply-grid">
            <form className="apply-form" onSubmit={submit} noValidate>
              {applied.includes(o.id) && (
                <div className="already"><Icon name="check" size={16} /> You've already applied. Sending again will replace your earlier application.</div>
              )}

              <fieldset>
                <legend>Your details</legend>
                <div className="two">
                  <Field label="Full name" error={errors.name}>
                    <input value={name} autoComplete="name" onChange={e => { setName(e.target.value); clear('name') }} placeholder="Kofi Mensah" />
                  </Field>
                  <Field label="Email" error={errors.email}>
                    <input type="email" value={email} autoComplete="email" onChange={e => { setEmail(e.target.value); clear('email') }} placeholder="kmensah123@st.ug.edu.gh" />
                  </Field>
                  <Field label="Phone" error={errors.phone}>
                    <input inputMode="tel" value={phone} autoComplete="tel" onChange={e => { setPhone(e.target.value); clear('phone') }} placeholder="024 123 4567" />
                  </Field>
                  <Field label="Student ID" error={errors.studentId}>
                    <input inputMode="numeric" maxLength={8} value={studentId} onChange={e => { setStudentId(e.target.value.replace(/\D/g, '')); clear('studentId') }} placeholder="10987654" />
                  </Field>
                </div>
              </fieldset>

              <fieldset>
                <legend>Education</legend>
                <div className="two">
                  <Field label="University">
                    <input value="University of Ghana, Legon" readOnly />
                  </Field>
                  <Field label="Programme">
                    <select value={major} onChange={e => setMajor(e.target.value as MajorId)}>
                      {MAJORS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </Field>
                  <Field label="Current level">
                    <select value={level} onChange={e => setLevel(Number(e.target.value) as Level)}>
                      {LEVELS.map(l => <option key={l} value={l}>{l}-level</option>)}
                    </select>
                  </Field>
                </div>
              </fieldset>

              <fieldset>
                <legend>Documents</legend>
                {needsCv && (
                  <FileDrop label="CV (PDF or Word)" file={cv} error={errors.cv} onFile={f => { setCv(f); clear('cv') }} />
                )}
                <FileDrop label={isFellowship ? 'Transcript' : 'Transcript or results slip (optional)'} file={extra} onFile={setExtra} />
                <Field label={letterLabel} error={errors.letter}>
                  <textarea
                    rows={7}
                    value={letter}
                    onChange={e => { setLetter(e.target.value); clear('letter') }}
                    placeholder={`Tell ${o.org} why you're a great fit. Tip: InternGH's AI can draft this for you.`}
                  />
                  <small className="count-note">{letter.trim().length} characters</small>
                </Field>
              </fieldset>

              {!isWorkshop && (
                <fieldset>
                  <legend>Availability</legend>
                  <p className="q">This role starts <b>{d.start}</b> ({d.schedule.toLowerCase()}). Can you start then?</p>
                  <div className="choice-row">
                    {(['yes', 'no'] as const).map(v => (
                      <button type="button" key={v} className={`choice ${canStart === v ? 'on' : ''}`} onClick={() => { setCanStart(v); clear('canStart') }}>
                        {v === 'yes' ? 'Yes, I can start' : "No, I'd need a later date"}
                      </button>
                    ))}
                  </div>
                  {errors.canStart && <p className="error">{errors.canStart}</p>}
                </fieldset>
              )}

              <label className={`consent ${errors.consent ? 'bad' : ''}`}>
                <input type="checkbox" checked={consent} onChange={e => { setConsent(e.target.checked); clear('consent') }} />
                <span>I confirm the information above is accurate and agree to {o.org} contacting me about this application.</span>
              </label>
              {errors.consent && <p className="error">{errors.consent}</p>}

              <button className="btn brand block lg" type="submit" disabled={sending} data-magnetic="0.08">
                {sending ? <span className="spinner" /> : <>Submit application <Icon name="send" size={16} /></>}
              </button>
            </form>

            <aside className="apply-side">
              <div className="side-card">
                <h4>Role summary</h4>
                <p>{o.summary}</p>
                <h4>You'll</h4>
                <ul className="checklist does">
                  {d.does.slice(0, 3).map(x => <li key={x}><Icon name="target" size={14} />{x}</li>)}
                </ul>
                <h4>Have ready</h4>
                <ul className="checklist docs">
                  {d.documents.map(x => <li key={x}><Icon name="file" size={14} />{x}</li>)}
                </ul>
                <div className={`side-deadline ${t.urgent ? 'hot' : ''}`}>
                  <Icon name="calendar" size={16} />
                  <div><small>Deadline</small>{formatDate(o.deadline)}</div>
                </div>
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className={`af ${error ? 'bad' : ''}`}>
      <span>{label}</span>
      {children}
      {error && <em className="error">{error}</em>}
    </label>
  )
}

function FileDrop({ label, file, error, onFile }: { label: string; file: File | null; error?: string; onFile: (f: File | null) => void }) {
  const [over, setOver] = useState(false)
  return (
    <div className="af">
      <span>{label}</span>
      <label
        className={`drop ${over ? 'over' : ''} ${file ? 'has' : ''} ${error ? 'bad' : ''}`}
        onDragOver={e => { e.preventDefault(); setOver(true) }}
        onDragLeave={() => setOver(false)}
        onDrop={e => {
          e.preventDefault()
          setOver(false)
          const f = e.dataTransfer.files[0]
          if (f) onFile(f)
        }}
      >
        <input type="file" accept=".pdf,.doc,.docx" onChange={e => onFile(e.target.files?.[0] ?? null)} />
        {file ? (
          <>
            <span className="drop-ic"><Icon name="file" size={18} /></span>
            <span className="drop-text"><b>{file.name}</b><small>{Math.max(1, Math.round(file.size / 1024))} KB · stays on your device</small></span>
            <button type="button" className="drop-x" aria-label="Remove file" onClick={e => { e.preventDefault(); onFile(null) }}><Icon name="x" size={14} /></button>
          </>
        ) : (
          <>
            <span className="drop-ic"><Icon name="upload" size={18} /></span>
            <span className="drop-text"><b>Choose a file or drag it here</b><small>PDF or Word, up to 5 MB</small></span>
          </>
        )}
      </label>
      {error && <em className="error">{error}</em>}
    </div>
  )
}
