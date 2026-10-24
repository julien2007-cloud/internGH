import { useEffect, useState } from 'react'
import type { MajorId } from '../data/majors'
import { MAJORS, majorById } from '../data/majors'
import type { Opportunity } from '../data/opportunities'
import type { Profile } from '../lib/match'
import { relativeDay, useNow } from '../lib/time'
import { chatLink, subscribeWhatsApp } from '../lib/whatsapp'
import { Icon } from './Icon'

interface Props {
  profile: Profile
  sample?: Opportunity
  defaultPhone?: string
  name?: string
  /** Called with the 9 local digits once the number is valid, so it can be saved to the profile. */
  onSaved?: (phone: string) => void
  onClose: () => void
}

type Channel = 'whatsapp' | 'sms'

export function AlertsModal({ profile, sample, defaultPhone = '', name = '', onSaved, onClose }: Props) {
  const [channel, setChannel] = useState<Channel>('whatsapp')
  const [phone, setPhone] = useState(defaultPhone)
  const [majors, setMajors] = useState<MajorId[]>([profile.major])
  const [freq, setFreq] = useState<'instant' | 'daily' | 'weekly'>('instant')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  // 'live' = welcome WhatsApp sent; 'saved' = criteria saved, WhatsApp not sending yet; 'demo' = preview only
  const [done, setDone] = useState<'live' | 'saved' | 'demo' | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const digits = phone.replace(/\D/g, '').replace(/^0/, '')
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (digits.length !== 9) return setError('Enter a 9-digit Ghana number, like 24 123 4567.')
    if (!majors.length) return setError('Pick at least one major.')
    onSaved?.(digits)
    if (channel === 'sms') return setDone('demo')
    setSending(true)
    const res = await subscribeWhatsApp(digits, name, majors, profile.level)
    setSending(false)
    if (res.ok && res.welcomed) setDone('live')
    else if (res.ok && res.stored) setDone('saved')
    else if (!res.ok && res.error === 'not_configured') setDone('demo')
    else if (!res.ok) setError(res.message)
    else setDone('demo')
  }
  const chat = chatLink(`Hi InternGH, I'd like alerts for ${majors.map(id => majorById(id).name).join(', ')}`)

  const now = useNow(60_000)
  const m = majorById(profile.major)
  // Mirrors the message format sent by api/whatsapp/notify.
  const preview = sample
    ? `New ${m.short} ${profile.level}L match: ${sample.title}\n${sample.org}\nPay: ${sample.stipend}\nCloses ${relativeDay(sample.deadline, now)}\n\nView and apply in InternGH`
    : 'New match for you — view and apply in InternGH'

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="modal glass" role="dialog" aria-modal="true" aria-label="Get alerts">
        <button className="icon-btn close" onClick={onClose} aria-label="Close"><Icon name="x" /></button>
        {done === 'live' ? (
          <div style={{ textAlign: 'center', paddingTop: 8 }}>
            <div className="success-icon" style={{ margin: '0 auto' }}><Icon name="chat" size={30} /></div>
            <h2>Check your WhatsApp</h2>
            <p style={{ color: 'var(--mute)' }}>
              We just sent a message from InternGH to +233 {digits.slice(0, 2)} {digits.slice(2, 5)} {digits.slice(5)}.
              You'll get a WhatsApp whenever a new {majors.map(id => majorById(id).short).join(' / ')} {profile.level}-level opportunity is posted, and reminders before its deadline.
            </p>
            {chat && (
              <a className="btn block" style={{ marginTop: 20 }} href={chat} target="_blank" rel="noopener">
                <Icon name="chat" size={16} /> Open the InternGH chat
              </a>
            )}
            <button className={`btn block ${chat ? 'ghost' : ''}`} style={{ marginTop: 10 }} onClick={onClose}>Done</button>
          </div>
        ) : done === 'saved' ? (
          <div style={{ textAlign: 'center', paddingTop: 8 }}>
            <div className="success-icon" style={{ margin: '0 auto' }}><Icon name="check" size={30} /></div>
            <h2>Alerts saved</h2>
            <p style={{ color: 'var(--mute)' }}>
              +233 {digits.slice(0, 2)} {digits.slice(2, 5)} {digits.slice(5)} will get WhatsApp alerts for new {majors.map(id => majorById(id).short).join(' / ')} {profile.level}-level opportunities and their deadlines,
              as soon as WhatsApp sending is switched on for this site.
            </p>
            <button className="btn block" style={{ marginTop: 20 }} onClick={onClose}>Done</button>
          </div>
        ) : done === 'demo' ? (
          <div style={{ textAlign: 'center', paddingTop: 8 }}>
            <div className="success-icon" style={{ margin: '0 auto' }}><Icon name="check" size={30} /></div>
            <h2>You're on the list</h2>
            <p style={{ color: 'var(--mute)' }}>
              {freq === 'instant' ? 'New matches' : freq === 'daily' ? 'A daily digest' : 'A weekly digest'} will go to +233 {digits.slice(0, 2)} {digits.slice(2, 5)} {digits.slice(5)} by {channel === 'whatsapp' ? 'WhatsApp' : 'SMS'}. Here's what one looks like:
            </p>
            <div className={`sms-preview ${channel}`} style={{ textAlign: 'left' }}>
              <small>{channel === 'whatsapp' ? 'WhatsApp · InternGH' : 'SMS · INTERNGH'}</small>
              <div className="bubble" style={{ whiteSpace: 'pre-line' }}>{preview}</div>
            </div>
            <p style={{ fontSize: 12, color: 'var(--faint)', marginTop: 12 }}>
              Preview only — {channel === 'sms' ? 'SMS sending isn’t connected yet.' : 'WhatsApp isn’t connected on this site yet.'}
            </p>
            <button className="btn block" style={{ marginTop: 14 }} onClick={onClose}>Done</button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <div className="success-icon" style={{ background: 'var(--acc-soft)', color: 'var(--acc)', width: 52, height: 52, borderRadius: 18 }}>
              <Icon name="bell" size={24} />
            </div>
            <h2>Get alerts for new matches</h2>
            <p>Low-data alerts the moment something fits your major, plus reminders before saved deadlines.</p>

            <div className="field">
              <span>Send alerts by</span>
              <div className="channel">
                <button type="button" className={channel === 'whatsapp' ? 'on' : ''} onClick={() => setChannel('whatsapp')}>
                  <b><Icon name="chat" size={17} /> WhatsApp</b>
                  <small>Free on most data bundles</small>
                </button>
                <button type="button" className={channel === 'sms' ? 'on' : ''} onClick={() => setChannel('sms')}>
                  <b><Icon name="phone" size={17} /> SMS</b>
                  <small>Works without data</small>
                </button>
              </div>
            </div>

            <div className="field">
              <label htmlFor="phone">Phone number</label>
              <div className="phone">
                <span>+233</span>
                <input
                  id="phone"
                  inputMode="tel"
                  placeholder="24 123 4567"
                  value={phone}
                  onChange={e => {
                    setPhone(e.target.value)
                    setError('')
                  }}
                />
              </div>
            </div>

            <div className="field">
              <span>Majors to watch</span>
              <div className="mini-chips">
                {MAJORS.map(x => (
                  <button
                    type="button"
                    key={x.id}
                    className={majors.includes(x.id) ? 'on' : ''}
                    onClick={() => {
                      setMajors(majors.includes(x.id) ? majors.filter(y => y !== x.id) : [...majors, x.id])
                      setError('')
                    }}
                  >
                    {x.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <span>How often</span>
              <div className="seg" style={{ display: 'inline-flex' }}>
                {(['instant', 'daily', 'weekly'] as const).map(f => (
                  <button type="button" key={f} className={freq === f ? 'on' : ''} onClick={() => setFreq(f)}>
                    {f === 'instant' ? 'As they come' : f === 'daily' ? 'Daily digest' : 'Weekly digest'}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="error">{error}</p>}
            <button className="btn block" style={{ marginTop: 22 }} data-magnetic="0.1" type="submit" disabled={sending}>
              {sending ? <span className="spinner" /> : 'Turn on alerts'}
            </button>
            <p style={{ fontSize: 12, color: 'var(--faint)', marginTop: 10, textAlign: 'center' }}>
              {channel === 'whatsapp' ? 'We’ll send a WhatsApp message to confirm.' : 'SMS is a preview for now — no texts are sent.'}
            </p>
          </form>
        )}
      </div>
    </>
  )
}
