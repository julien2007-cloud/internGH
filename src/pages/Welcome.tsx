import { useRef } from 'react'
import { Avatar } from '../components/Bits'
import type { IconName } from '../components/Icon'
import { Icon } from '../components/Icon'
import { PublicFooter, PublicNav } from '../components/PublicNav'
import { MAJORS } from '../data/majors'
import { OPPORTUNITIES } from '../data/opportunities'
import { useParallax, useReveal } from '../lib/reveal'
import { go } from '../lib/router'
import { shortLeft, timeLeft, useNow } from '../lib/time'
import type { User } from '../lib/user'

const SOURCES = ['WhatsApp groups', 'LinkedIn posts', 'Company pages', 'Notice boards', 'Email chains', 'Word of mouth']

const STEPS: { icon: IconName; title: string; body: string }[] = [
  { icon: 'cap', title: 'Sign in with UG mail', body: 'Verify your student email, then tell us your major and level.' },
  { icon: 'briefcase', title: 'We gather the listings', body: 'Partners, departments, the career office and verified student tips feed one database.' },
  { icon: 'sliders', title: 'Matched and ranked', body: 'Your feed is sorted by how well each opportunity fits you and how soon it closes.' },
  { icon: 'bell', title: 'Reminded in time', body: 'WhatsApp or SMS nudges before saved deadlines, so nothing slips past.' },
]

const FEATURES: { icon: IconName; title: string; body: string }[] = [
  { icon: 'compass', title: 'Major-based feed', body: 'Only what fits your department and level. No scrolling past nursing jobs when you study law.' },
  { icon: 'clock', title: 'Deadline tracker', body: 'Live countdowns on every listing and a timeline of what closes this week.' },
  { icon: 'bookmark', title: 'One-tap save and apply', body: 'Shortlist in a tap and jump straight to the application page.' },
  { icon: 'sliders', title: 'Filters that matter', body: 'Paid or unpaid, Accra or remote, duration and eligibility.' },
  { icon: 'chat', title: 'WhatsApp and SMS alerts', body: 'Data-light alerts for new matches, built for how students actually use their phones.' },
]

export function Welcome({ user }: { user: User | null }) {
  useReveal()
  const visual = useRef<HTMLDivElement>(null)
  useParallax(visual)
  const now = useNow(1000)
  const preview = OPPORTUNITIES.filter(o => o.majors.includes('stats') && o.levels.includes(200))
    .sort((a, b) => a.deadline - b.deadline)
    .slice(0, 3)
  const start = () => go(user ? 'app' : 'signin')

  return (
    <>
      <PublicNav user={user} active="welcome" />
      <main className="page pub">
        {/* ---------- Hero ---------- */}
        <section className="w-hero">
          <div className="w-copy">
            <span className="eyebrow rise"><span className="live-dot" /> Built for University of Ghana students</span>
            <h1 className="rise" style={{ '--i': 1 } as React.CSSProperties}>
              Never hear about an opportunity <span className="grad-text">after the deadline</span> again.
            </h1>
            <p className="rise" style={{ '--i': 2 } as React.CSSProperties}>
              InternGH puts every internship, fellowship, workshop and training program in one place, matched to your major and level.
            </p>
            <div className="w-cta rise" style={{ '--i': 3 } as React.CSSProperties}>
              <button className="btn lg" data-magnetic="0.25" onClick={start}>
                {user ? 'Open InternGH' : 'Get started with UG mail'} <Icon name="arrow" size={18} />
              </button>
              <a className="btn ghost lg" href="#how" onClick={e => {
                e.preventDefault()
                document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })
              }}>
                How it works
              </a>
            </div>
            <ul className="w-trust rise" style={{ '--i': 4 } as React.CSSProperties}>
              <li><Icon name="check" size={15} /> Free for students</li>
              <li><Icon name="check" size={15} /> Low-data friendly</li>
              <li><Icon name="check" size={15} /> 10 majors at launch</li>
            </ul>
          </div>

          <div className="w-visual" ref={visual} aria-hidden="true">
            <div className="w-screen glass" data-depth="18">
              <div className="w-screen-head">
                <span className="dotrow"><i /><i /><i /></span>
                <b>For Statistics students</b>
                <small>200-level</small>
              </div>
              {preview.map((o, i) => {
                const t = timeLeft(o.deadline, now)
                return (
                  <div className="w-row" key={o.id} style={{ '--i': 6 + i } as React.CSSProperties}>
                    <Avatar initials={o.initials} color={o.color} />
                    <div>
                      <b>{o.title}</b>
                      <small>{o.org}</small>
                    </div>
                    <span className={t.urgent ? 'hot' : ''}>{shortLeft(t)}</span>
                  </div>
                )
              })}
            </div>
            <div className="w-float f1 glass" data-depth="46">
              <span className="ic hot"><Icon name="bell" size={16} /></span>
              <div><b>Reminder sent</b><small>Survey Intern closes tomorrow</small></div>
            </div>
            <div className="w-float f2 glass" data-depth="-34">
              <span className="ic"><Icon name="sparkles" size={16} /></span>
              <div><b>Cover letter drafted</b><small>Ready to edit and send</small></div>
            </div>
            <div className="w-float f3 glass" data-depth="60">
              <span className="ic ok"><Icon name="check" size={16} /></span>
              <div><b>+12 new matches</b><small>this week</small></div>
            </div>
          </div>
        </section>

        {/* ---------- Problem ---------- */}
        <section className="w-problem reveal">
          <div className="w-scatter">
            {SOURCES.map((s, i) => (
              <span key={s} className="scatter-chip" style={{ '--i': i } as React.CSSProperties}>{s}</span>
            ))}
          </div>
          <div className="w-arrow"><Icon name="arrow" size={28} /></div>
          <div className="w-one glass">
            <span className="logo-mark big"><Icon name="cap" size={22} /></span>
            <b>One feed, sorted by your major</b>
            <small>No more finding out the day after it closed.</small>
          </div>
        </section>
        <p className="w-problem-text reveal">
          Listings are scattered across WhatsApp groups, LinkedIn, company pages and departmental notice boards. Students outside well-connected circles hear about them late, if at all.
        </p>

        {/* ---------- How it works ---------- */}
        <section id="how" className="w-section">
          <div className="w-head reveal">
            <span className="kicker">How it works</span>
            <h2>From sign-in to shortlist in under a minute</h2>
          </div>
          <div className="w-steps">
            {STEPS.map((s, i) => (
              <div key={s.title} className="w-step glass reveal" style={{ '--i': i } as React.CSSProperties} data-spotlight>
                <span className="step-n">{i + 1}</span>
                <span className="step-ic"><Icon name={s.icon} size={20} /></span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- Features ---------- */}
        <section className="w-section">
          <div className="w-head reveal">
            <span className="kicker">Features</span>
            <h2>Everything you need to apply on time</h2>
          </div>
          <div className="w-features">
            <div className="w-ai glass reveal" data-spotlight>
              <div>
                <span className="kicker grad-text">Standout feature</span>
                <h3>An AI assistant that knows the listings</h3>
                <p>Ask in plain English and get answers straight from the database, then let it draft a short cover letter for the one you pick.</p>
                <button className="btn" data-magnetic="0.2" onClick={start}>
                  Try the assistant <Icon name="sparkles" size={16} />
                </button>
              </div>
              <div className="w-chat">
                <div className="msg user">What can a 200-level Statistics student apply to this semester?</div>
                <div className="msg ai"><div className="text">I found 7 opportunities. Heads up: the Data Storytelling Workshop closes tomorrow. Want a cover letter for one?</div></div>
                <div className="msg user">Draft one for the Household Survey Field Intern</div>
                <div className="msg ai"><div className="typing"><i /><i /><i /></div></div>
              </div>
            </div>
            {FEATURES.map((f, i) => (
              <div key={f.title} className="w-feature glass reveal" style={{ '--i': i } as React.CSSProperties} data-spotlight>
                <span className="step-ic"><Icon name={f.icon} size={20} /></span>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- Majors marquee ---------- */}
        <section className="w-section">
          <div className="w-head reveal">
            <span className="kicker">Phase 1</span>
            <h2>Launching at Legon with 10 popular majors</h2>
          </div>
        </section>
      </main>

      <div className="marquee reveal" aria-label="Supported majors">
        <div className="marquee-track">
          {[...MAJORS, ...MAJORS].map((m, i) => (
            <span key={i} className="major-chip" aria-hidden={i >= MAJORS.length}>
              <span className="tag" style={{ background: m.tint, color: m.color }}>{m.short.slice(0, 2)}</span>
              {m.name}
            </span>
          ))}
        </div>
      </div>

      <main className="page pub" style={{ paddingTop: 0 }}>
        <section className="w-final glass reveal" data-spotlight>
          <h2>Your next opportunity is already posted.</h2>
          <p>Sign in with your UG student email and see what fits you today.</p>
          <button className="btn lg" data-magnetic="0.25" onClick={start}>
            {user ? 'Open InternGH' : 'Get started'} <Icon name="arrow" size={18} />
          </button>
        </section>
        <PublicFooter />
      </main>
    </>
  )
}
