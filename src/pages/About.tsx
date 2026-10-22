import type { IconName } from '../components/Icon'
import { Icon } from '../components/Icon'
import { PublicFooter, PublicNav } from '../components/PublicNav'
import { MAJORS } from '../data/majors'
import { useReveal } from '../lib/reveal'
import { go } from '../lib/router'
import type { User } from '../lib/user'

const PROBLEMS: { icon: IconName; title: string; body: string }[] = [
  { icon: 'chat', title: 'Scattered', body: 'Listings live in WhatsApp groups, LinkedIn, company pages and departmental notice boards.' },
  { icon: 'clock', title: 'Too late', body: 'Many students hear about an opportunity only after the deadline has passed.' },
  { icon: 'compass', title: 'Hard to match', body: 'Few students know which programs actually fit their major and level.' },
]

const SOURCES: { icon: IconName; title: string; body: string }[] = [
  { icon: 'briefcase', title: 'Partner companies and departments', body: 'Listings submitted directly by employers and University of Ghana departments.' },
  { icon: 'users', title: 'Career office and alumni', body: 'Contributions from the career office and the alumni network.' },
  { icon: 'search', title: 'Public job boards', body: 'Postings scraped or fed in by API from public job boards.' },
  { icon: 'shield', title: 'Student tips, verified', body: 'Tips shared by students, checked by moderators before they go live.' },
]

const IMPACT: { icon: IconName; title: string; body: string }[] = [
  { icon: 'flame', title: 'Faster access', body: 'Relevant opportunities reach students the day they are posted, not after they close.' },
  { icon: 'users', title: 'Fairer access', body: 'Students outside well-connected circles see the same listings as everyone else.' },
  { icon: 'briefcase', title: 'A direct pipeline', body: 'Employers reach UG talent in exactly the majors and levels they need.' },
]

export function About({ user }: { user: User | null }) {
  useReveal()

  return (
    <>
      <PublicNav user={user} active="about" />
      <main className="page pub about">
        <section className="a-hero">
          <span className="eyebrow rise">About InternGH</span>
          <h1 className="rise" style={{ '--i': 1 } as React.CSSProperties}>
            Find your next opportunity <span className="grad-text">by major</span>
          </h1>
          <p className="rise" style={{ '--i': 2 } as React.CSSProperties}>
            InternGH is a web app that puts every relevant internship, fellowship, workshop and training program for University of Ghana students in one place. Pick your major, and see what fits you instantly.
          </p>
        </section>

        <section className="w-section">
          <div className="w-head reveal">
            <span className="kicker">The problem</span>
            <h2>Great opportunities, found too late</h2>
          </div>
          <div className="a-grid three">
            {PROBLEMS.map((p, i) => (
              <div key={p.title} className="w-feature glass reveal" style={{ '--i': i } as React.CSSProperties} data-spotlight>
                <span className="step-ic hot"><Icon name={p.icon} size={20} /></span>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="a-split reveal">
          <div>
            <span className="kicker">Our solution</span>
            <h2>One feed, built around UG majors</h2>
            <p>
              A student opens the app, selects their major — Computer Science, Economics, Nursing, Law and more — and instantly sees matching opportunities. A deadline tracker, one-tap save and apply, useful filters and WhatsApp or SMS alerts make sure nothing is missed.
            </p>
            <p>
              Our AI assistant answers questions like “What can a 200-level Statistics student apply to this semester?” straight from the database, and helps draft a short cover letter for a chosen listing.
            </p>
          </div>
          <ol className="a-flow">
            {['Student picks major and level', 'Backend pulls from a curated database', 'Listings are matched and ranked by relevance and deadline', 'Reminders go out before closing dates'].map((s, i) => (
              <li key={s} className="reveal" style={{ '--i': i } as React.CSSProperties}>
                <span>{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
        </section>

        <section className="w-section">
          <div className="w-head reveal">
            <span className="kicker">Data sources</span>
            <h2>Where the listings come from</h2>
          </div>
          <div className="a-grid two">
            {SOURCES.map((s, i) => (
              <div key={s.title} className="a-source glass reveal" style={{ '--i': i } as React.CSSProperties} data-spotlight>
                <span className="step-ic"><Icon name={s.icon} size={20} /></span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="a-different glass reveal" data-spotlight>
          <span className="kicker">Why it's different</span>
          <h2>Local by design</h2>
          <p>
            Existing job boards are generic and global. InternGH is built around Ghanaian students, local employers and university majors, with a mobile-first, low-data design that fits how students actually use their phones.
          </p>
          <div className="a-pills">
            <span><Icon name="cap" size={15} /> Built for UG majors</span>
            <span><Icon name="briefcase" size={15} /> Local employers</span>
            <span><Icon name="phone" size={15} /> Mobile-first</span>
            <span><Icon name="chat" size={15} /> Low-data alerts</span>
          </div>
        </section>

        <section className="w-section">
          <div className="w-head reveal">
            <span className="kicker">Impact</span>
            <h2>What changes for students and employers</h2>
          </div>
          <div className="a-grid three">
            {IMPACT.map((p, i) => (
              <div key={p.title} className="w-feature glass reveal" style={{ '--i': i } as React.CSSProperties} data-spotlight>
                <span className="step-ic ok"><Icon name={p.icon} size={20} /></span>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="a-split reveal">
          <div>
            <span className="kicker">Sustainability</span>
            <h2>Free for students. Always.</h2>
            <p>Revenue comes from employers paying for featured listings, and from partnerships with the university career office.</p>
          </div>
          <div className="a-money">
            <div className="glass"><b>GH₵ 0</b><span>for students</span></div>
            <div className="glass"><Icon name="star" size={18} /><span>Featured employer listings</span></div>
            <div className="glass"><Icon name="cap" size={18} /><span>Career office partnerships</span></div>
          </div>
        </section>

        <section className="w-section">
          <div className="w-head reveal">
            <span className="kicker">Roadmap</span>
            <h2>Phase 1: University of Ghana, 10 popular majors</h2>
          </div>
          <div className="a-roadmap glass reveal">
            <div className="a-phase">
              <span className="badge match">Now</span>
              <b>Phase 1 · Legon</b>
              <small>Launching with these majors</small>
            </div>
            <div className="mini-chips">
              {MAJORS.map(m => (
                <span key={m.id} className="major-chip">
                  <span className="tag" style={{ background: m.tint, color: m.color }}>{m.short.slice(0, 2)}</span>
                  {m.name}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="w-final glass reveal" data-spotlight>
          <h2>Ready to find your next opportunity?</h2>
          <p>Sign in with your UG student email to see what matches your major.</p>
          <button className="btn lg" data-magnetic="0.25" onClick={() => go(user ? 'app' : 'signin')}>
            {user ? 'Open InternGH' : 'Get started'} <Icon name="arrow" size={18} />
          </button>
        </section>
        <PublicFooter />
      </main>
    </>
  )
}
