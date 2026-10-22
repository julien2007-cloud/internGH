import { useEffect, useRef, useState } from 'react'
import { Toggle } from '../components/Bits'
import { Icon } from '../components/Icon'
import type { Level, MajorId } from '../data/majors'
import { LEVELS, MAJORS } from '../data/majors'
import { go } from '../lib/router'
import type { User } from '../lib/user'
import { UG_EMAIL, firstName, nameFromEmail } from '../lib/user'

type Step = 'email' | 'code' | 'details' | 'done'
const STEPS: { id: Step; label: string }[] = [
  { id: 'email', label: 'UG mail' },
  { id: 'code', label: 'Verify' },
  { id: 'details', label: 'Your details' },
]

const makeCode = () => String(Math.floor(100000 + Math.random() * 900000))

interface Props {
  existing: User | null
  onDone: (u: User) => void
}

export function SignIn({ existing, onDone }: Props) {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [sentCode, setSentCode] = useState('')
  const [code, setCode] = useState<string[]>(Array(6).fill(''))
  const [name, setName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [major, setMajor] = useState<MajorId | null>(null)
  const [level, setLevel] = useState<Level | null>(null)
  const [phone, setPhone] = useState('')
  const [whatsapp, setWhatsapp] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const boxes = useRef<(HTMLInputElement | null)[]>([])
  const [finalUser, setFinalUser] = useState<User | null>(null)

  const stepIndex = STEPS.findIndex(s => s.id === step)
  const clear = (k: string) => {
    if (!errors[k]) return
    setErrors(e => {
      const next = { ...e }
      delete next[k]
      return next
    })
  }
  const finish = (u: User) => {
    setFinalUser(u)
    setStep('done')
  }

  useEffect(() => {
    if (step === 'code') boxes.current[0]?.focus()
  }, [step])

  useEffect(() => {
    if (!finalUser) return
    const id = setTimeout(() => onDone(finalUser), 1400)
    return () => clearTimeout(id)
  }, [finalUser, onDone])

  const sendCode = (e: React.FormEvent) => {
    e.preventDefault()
    const v = email.trim().toLowerCase()
    if (!UG_EMAIL.test(v)) {
      setErrors({ email: 'Use your UG student email, ending in @st.ug.edu.gh.' })
      return
    }
    setEmail(v)
    setBusy(true)
    setTimeout(() => {
      setBusy(false)
      setSentCode(makeCode())
      setCode(Array(6).fill(''))
      setStep('code')
    }, 700)
  }

  const setDigit = (i: number, raw: string) => {
    const digits = raw.replace(/\D/g, '')
    if (!digits) {
      setCode(c => c.map((d, j) => (j === i ? '' : d)))
      return
    }
    // Typing or pasting fills forward from this box.
    setCode(c => {
      const next = [...c]
      digits.slice(0, 6 - i).split('').forEach((d, k) => (next[i + k] = d))
      return next
    })
    boxes.current[Math.min(i + digits.length, 5)]?.focus()
    clear('code')
  }

  const verify = (e: React.FormEvent) => {
    e.preventDefault()
    const entered = code.join('')
    if (entered.length < 6) return setErrors({ code: 'Enter all 6 digits.' })
    if (entered !== sentCode) return setErrors({ code: "That code doesn't match. Check your UG mail and try again." })
    setBusy(true)
    setTimeout(() => {
      setBusy(false)
      if (existing && existing.email === email) {
        finish(existing)
        return
      }
      setName(n => n || nameFromEmail(email))
      setStep('details')
    }, 600)
  }

  const submitDetails = (e: React.FormEvent) => {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (name.trim().split(/\s+/).length < 2) next.name = 'Enter your first and last name.'
    if (!/^\d{8}$/.test(studentId)) next.studentId = 'Your student ID has 8 digits, like 10987654.'
    if (!major) next.major = 'Pick your major.'
    if (!level) next.level = 'Pick your level.'
    const digits = phone.replace(/\D/g, '').replace(/^0/, '')
    if (phone && digits.length !== 9) next.phone = 'Enter a 9-digit Ghana number, or leave it blank.'
    setErrors(next)
    if (Object.keys(next).length) return
    finish({ name: name.trim(), email, studentId, major: major!, level: level!, phone: digits, whatsapp: whatsapp && !!digits })
  }

  return (
    <div className="auth">
      <a className="btn ghost sm auth-back" href="#/" data-magnetic="0.2">
        <Icon name="arrowLeft" size={15} /> Back to home
      </a>
      <a className="logo auth-logo" href="#/">
        <span className="logo-mark"><Icon name="cap" size={15} /></span>
        InternGH
      </a>

      <div className="auth-card glass rise">
        {step !== 'done' && (
          <div className="stepper" aria-label={`Step ${stepIndex + 1} of 3`}>
            {STEPS.map((s, i) => (
              <div key={s.id} className={`st ${i < stepIndex ? 'done' : i === stepIndex ? 'on' : ''}`}>
                <span>{i < stepIndex ? <Icon name="check" size={12} /> : i + 1}</span>
                {s.label}
              </div>
            ))}
            <i className="st-line" style={{ transform: `scaleX(${stepIndex / 2})` }} />
          </div>
        )}

        {step === 'email' && (
          <form key="email" className="auth-step" onSubmit={sendCode} noValidate>
            {existing && (
              <button type="button" className="resume" onClick={() => go('app')}>
                <span className="me-btn">{existing.name.split(' ').map(p => p[0]).slice(0, 2).join('')}</span>
                <span><b>Continue as {firstName(existing.name)}</b><small>{existing.email}</small></span>
                <Icon name="arrow" size={16} />
              </button>
            )}
            <h1>Sign in with your UG mail</h1>
            <p>We'll send a 6-digit code to your student email to confirm you're at Legon.</p>
            <div className="field">
              <label htmlFor="email">Student email</label>
              <div className={`input ${errors.email ? 'bad' : ''}`}>
                <Icon name="cap" size={18} />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="kmensah123@st.ug.edu.gh"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value)
                    clear('email')
                  }}
                />
              </div>
              {errors.email && <p className="error">{errors.email}</p>}
            </div>
            <button className="btn block lg" data-magnetic="0.1" disabled={busy} type="submit">
              {busy ? <span className="spinner" /> : <>Send code <Icon name="send" size={16} /></>}
            </button>
            <p className="fine">
              New to InternGH? The same step creates your account. <a href="#/about">What is InternGH?</a>
            </p>
          </form>
        )}

        {step === 'code' && (
          <form key="code" className="auth-step" onSubmit={verify} noValidate>
            <h1>Check your UG mail</h1>
            <p>Enter the 6-digit code we sent to <b>{email}</b>.</p>
            <div className="demo-code">
              <Icon name="sparkles" size={14} /> Demo build — your code is <b>{sentCode}</b>
              <button type="button" onClick={() => { setCode(sentCode.split('')); clear('code') }}>Fill it in</button>
            </div>
            <div className={`otp ${errors.code ? 'bad' : ''}`}>
              {code.map((d, i) => (
                <input
                  key={i}
                  ref={el => { boxes.current[i] = el }}
                  inputMode="numeric"
                  autoComplete={i === 0 ? 'one-time-code' : 'off'}
                  aria-label={`Digit ${i + 1}`}
                  maxLength={6}
                  value={d}
                  className={d ? 'filled' : ''}
                  onChange={e => setDigit(i, e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Backspace' && !d && i > 0) boxes.current[i - 1]?.focus()
                  }}
                />
              ))}
            </div>
            {errors.code && <p className="error">{errors.code}</p>}
            <button className="btn block lg" data-magnetic="0.1" disabled={busy} type="submit">
              {busy ? <span className="spinner" /> : <>Verify <Icon name="check" size={16} /></>}
            </button>
            <div className="auth-links">
              <button type="button" onClick={() => setStep('email')}>Use a different email</button>
              <button type="button" onClick={() => { setSentCode(makeCode()); setCode(Array(6).fill('')) }}>Resend code</button>
            </div>
          </form>
        )}

        {step === 'details' && (
          <form key="details" className="auth-step" onSubmit={submitDetails} noValidate>
            <h1>Tell us about you</h1>
            <p>We use this to match opportunities to your major and level.</p>

            <div className="two">
              <div className="field">
                <label htmlFor="name">Full name</label>
                <div className={`input ${errors.name ? 'bad' : ''}`}>
                  <input id="name" autoComplete="name" value={name} onChange={e => { setName(e.target.value); clear('name') }} placeholder="Kofi Mensah" />
                </div>
                {errors.name && <p className="error">{errors.name}</p>}
              </div>
              <div className="field">
                <label htmlFor="sid">Student ID</label>
                <div className={`input ${errors.studentId ? 'bad' : ''}`}>
                  <input id="sid" inputMode="numeric" maxLength={8} value={studentId}
                    onChange={e => { setStudentId(e.target.value.replace(/\D/g, '')); clear('studentId') }} placeholder="10987654" />
                </div>
                {errors.studentId && <p className="error">{errors.studentId}</p>}
              </div>
            </div>

            <div className="field">
              <span>Major</span>
              <div className="major-grid" role="radiogroup" aria-label="Major">
                {MAJORS.map(m => (
                  <button type="button" key={m.id} role="radio" aria-checked={major === m.id}
                    className={`major-pick ${major === m.id ? 'on' : ''}`}
                    onClick={() => { setMajor(m.id); clear('major') }}>
                    <span className="tag" style={{ background: m.tint, color: m.color }}>{m.short.slice(0, 2)}</span>
                    {m.name}
                  </button>
                ))}
              </div>
              {errors.major && <p className="error">{errors.major}</p>}
            </div>

            <div className="field">
              <span>Level</span>
              <div className="seg level-seg" role="radiogroup" aria-label="Level">
                {LEVELS.map(l => (
                  <button type="button" key={l} role="radio" aria-checked={level === l} className={level === l ? 'on' : ''}
                    onClick={() => { setLevel(l); clear('level') }}>
                    {l}
                  </button>
                ))}
              </div>
              {errors.level && <p className="error">{errors.level}</p>}
            </div>

            <div className="field">
              <label htmlFor="ph">Phone for alerts <small>(optional)</small></label>
              <div className={`phone ${errors.phone ? 'bad' : ''}`}>
                <span>+233</span>
                <input id="ph" inputMode="tel" value={phone} placeholder="24 123 4567" onChange={e => { setPhone(e.target.value); clear('phone') }} />
              </div>
              {errors.phone && <p className="error">{errors.phone}</p>}
              <div style={{ marginTop: 10 }}>
                <Toggle on={whatsapp} onChange={setWhatsapp}>Send new matches on WhatsApp</Toggle>
              </div>
            </div>

            <button className="btn block lg" data-magnetic="0.1" type="submit">
              Enter InternGH <Icon name="arrow" size={16} />
            </button>
          </form>
        )}

        {step === 'done' && finalUser && (
          <div className="auth-step auth-done">
            <div className="success-icon"><Icon name="check" size={32} /></div>
            <h1>You're in, {firstName(finalUser.name)}</h1>
            <p>Finding opportunities for {finalUser.level}-level {MAJORS.find(m => m.id === finalUser.major)?.name} students…</p>
            <div className="loading-bar"><i /></div>
          </div>
        )}
      </div>

      <p className="auth-foot">Demo build — no emails are sent and nothing leaves your browser.</p>
    </div>
  )
}
