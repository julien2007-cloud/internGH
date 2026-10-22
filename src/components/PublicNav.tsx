import type { Route } from '../lib/router'
import { go } from '../lib/router'
import type { User } from '../lib/user'
import { firstName } from '../lib/user'
import { Icon } from './Icon'

export function PublicNav({ user, active }: { user: User | null; active: Route }) {
  return (
    <div className="nav-wrap">
      <nav className="nav glass pub-nav" aria-label="Main">
        <a className="logo" href="#/">
          <span className="logo-mark"><Icon name="cap" size={15} /></span>
          InternGH
        </a>
        <div className="pub-links">
          <a href="#/" className={`tab ${active === 'welcome' ? 'on' : ''}`}>Home</a>
          <a href="#/about" className={`tab ${active === 'about' ? 'on' : ''}`}>About</a>
        </div>
        {user ? (
          <button className="btn" data-magnetic="0.25" onClick={() => go('app')}>
            Continue as {firstName(user.name)} <Icon name="arrow" size={16} />
          </button>
        ) : (
          <>
            <button className="btn ghost signin-link" onClick={() => go('signin')}>Sign in</button>
            <button className="btn" data-magnetic="0.25" onClick={() => go('signin')}>
              Get started <Icon name="arrow" size={16} />
            </button>
          </>
        )}
      </nav>
    </div>
  )
}

export function PublicFooter() {
  return (
    <footer className="pub-footer">
      <div className="logo">
        <span className="logo-mark"><Icon name="cap" size={15} /></span>
        InternGH
      </div>
      <p>Every opportunity for University of Ghana students, sorted by major.</p>
      <div className="pub-footer-links">
        <a href="#/">Home</a>
        <a href="#/about">About</a>
        <a href="#/signin">Sign in</a>
        <a href="#/post">Post an opportunity</a>
      </div>
      <small>Demo build · All companies and listings are fictional</small>
    </footer>
  )
}
