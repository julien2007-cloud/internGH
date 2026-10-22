import { useEffect, useRef, useState } from 'react'
import { majorById } from '../data/majors'
import type { Opportunity } from '../data/opportunities'
import { OPPORTUNITIES } from '../data/opportunities'
import type { CoverLetter } from '../lib/assistant'
import type { Profile } from '../lib/match'
import { relativeDay, useNow } from '../lib/time'
import { toast } from '../lib/toast'
import { Avatar } from './Bits'
import { Icon } from './Icon'

export interface ChatMessage {
  id: number
  role: 'user' | 'ai'
  text: string
  items?: Opportunity[]
  letter?: CoverLetter
  pending?: boolean
}

interface Props {
  profile: Profile
  messages: ChatMessage[]
  onSend: (text: string) => void
  onClose: () => void
  onOpenOpp: (id: string) => void
  onDraft: (o: Opportunity) => void
}

export function Assistant({ profile, messages, onSend, onClose, onOpenOpp, onDraft }: Props) {
  const [input, setInput] = useState('')
  const list = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const major = majorById(profile.major)

  const scrollDown = () => {
    const el = list.current
    if (el) el.scrollTop = el.scrollHeight
  }
  useEffect(scrollDown, [messages])
  useEffect(() => {
    inputRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const suggestions = [
    `What can a ${profile.level}-level ${major.name} student apply to this semester?`,
    'Paid remote opportunities closing this week',
    'Fellowships for final-year Economics students',
    `Draft a cover letter for the ${OPPORTUNITIES.find(o => o.majors.includes(profile.major))?.title ?? 'Junior Data Analyst Program'}`,
  ]

  const send = (text: string) => {
    if (!text.trim()) return
    onSend(text.trim())
    setInput('')
  }

  return (
    <div className="ai-panel glass" role="dialog" aria-label="InternGH assistant">
      <div className="ai-head">
        <div className="orb"><Icon name="sparkles" size={20} /></div>
        <div>
          <b>InternGH Assistant</b>
          <small>Answers from the InternGH database</small>
        </div>
        <button className="icon-btn" onClick={onClose} aria-label="Close assistant"><Icon name="x" /></button>
      </div>

      <div className="ai-msgs" ref={list}>
        {messages.length === 0 && (
          <div className="ai-intro">
            <div className="orb"><Icon name="sparkles" size={24} /></div>
            <h3>Ask me anything about opportunities</h3>
            <p>I can find listings for your major and level, and draft a cover letter for one.</p>
            <div className="suggest">
              {suggestions.map((s, i) => (
                <button key={s} style={{ '--i': i } as React.CSSProperties} onClick={() => send(s)}>{s}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map(m =>
          m.role === 'user' ? (
            <div key={m.id} className="msg user">{m.text}</div>
          ) : (
            <AiMessage key={m.id} msg={m} onGrow={scrollDown} onOpenOpp={onOpenOpp} onDraft={onDraft} />
          ),
        )}
      </div>

      <form
        className="ai-input"
        onSubmit={e => {
          e.preventDefault()
          send(input)
        }}
      >
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask about internships, deadlines…"
          aria-label="Message"
        />
        <button className="btn" type="submit" aria-label="Send" data-magnetic="0.3"><Icon name="send" size={16} /></button>
      </form>
    </div>
  )
}

function AiMessage({ msg, onGrow, onOpenOpp, onDraft }: {
  msg: ChatMessage
  onGrow: () => void
  onOpenOpp: (id: string) => void
  onDraft: (o: Opportunity) => void
}) {
  const [n, setN] = useState(0)
  const now = useNow(60_000)
  const done = !msg.pending && n >= msg.text.length

  // Type the reply out a few characters per frame.
  useEffect(() => {
    if (msg.pending) return
    const id = setInterval(() => {
      setN(v => {
        if (v >= msg.text.length) {
          clearInterval(id)
          return v
        }
        return v + 3
      })
    }, 16)
    return () => clearInterval(id)
  }, [msg.pending, msg.text])

  useEffect(onGrow, [n, done, onGrow])

  if (msg.pending) {
    return (
      <div className="msg ai">
        <div className="typing" aria-label="Assistant is typing"><i /><i /><i /></div>
      </div>
    )
  }

  const letterOpp = msg.letter && OPPORTUNITIES.find(o => o.id === msg.letter!.oppId)

  return (
    <div className="msg ai">
      <div className="text">
        {msg.text.slice(0, n)}
        {!done && <span className="caret" />}
      </div>
      {done && msg.items && msg.items.length > 0 && (
        <div className="ai-items">
          {msg.items.map((o, i) => (
            <div key={o.id} className="ai-item" style={{ '--i': i } as React.CSSProperties}>
              <Avatar initials={o.initials} color={o.color} />
              <div>
                <b onClick={() => onOpenOpp(o.id)}>{o.title}</b>
                <small>{o.org} · {o.paid ? 'Paid' : o.stipend.startsWith('Free') ? 'Free' : 'Unpaid'} · closes {relativeDay(o.deadline, now)}</small>
              </div>
              <div className="acts">
                <button onClick={() => onOpenOpp(o.id)}><Icon name="arrow" size={12} /> View</button>
                <button onClick={() => onDraft(o)}><Icon name="sparkles" size={12} /> Draft letter</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {done && msg.letter && <Letter body={msg.letter.body} onOpen={letterOpp ? () => onOpenOpp(letterOpp.id) : undefined} />}
    </div>
  )
}

function Letter({ body, onOpen }: { body: string; onOpen?: () => void }) {
  const [text, setText] = useState(body)
  return (
    <div className="letter">
      <textarea value={text} onChange={e => setText(e.target.value)} aria-label="Cover letter draft" />
      <div className="bar-row">
        <button
          className="btn sm"
          onClick={() => {
            navigator.clipboard?.writeText(text).then(
              () => toast('Cover letter copied'),
              () => toast('Select the text to copy it'),
            )
          }}
        >
          <Icon name="copy" size={14} /> Copy
        </button>
        {onOpen && <button className="btn ghost sm" onClick={onOpen}>Open listing</button>}
      </div>
    </div>
  )
}
