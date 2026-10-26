import { useEffect, useState } from 'react'
import './App.css'
import './pages.css'
import { Ambient } from './components/Ambient'
import { Toaster } from './components/Bits'
import MainApp from './MainApp'
import { About } from './pages/About'
import { Apply } from './pages/Apply'
import { Post } from './pages/Post'
import { Privacy } from './pages/Privacy'
import { SignIn } from './pages/SignIn'
import { Welcome } from './pages/Welcome'
import { mergeShared } from './data/posted'
import { useMotionEffects } from './lib/motion'
import { fetchServerListings, subscribeWhatsApp } from './lib/whatsapp'
import { go, useRoute } from './lib/router'
import { useLocalStorage } from './lib/store'
import { toast } from './lib/toast'
import type { User } from './lib/user'
import { firstName } from './lib/user'

export default function App() {
  useMotionEffects()
  const { route, param } = useRoute()
  const [user, setUser] = useLocalStorage<User | null>('igh.user', null)

  // The app itself is behind sign-in.
  const blocked = route === 'app' && !user
  useEffect(() => {
    if (blocked) go('signin')
  }, [blocked])

  // Postings published to everyone live on the server; merge them in when entering the app.
  const [shared, setShared] = useState(0)
  useEffect(() => {
    if (route !== 'app' && route !== 'apply') return
    let live = true
    fetchServerListings().then(list => {
      if (live && mergeShared(list)) setShared(v => v + 1)
    })
    return () => {
      live = false
    }
  }, [route])

  const signedUp = async (u: User) => {
    if (!u.whatsapp || !u.phone) return
    const res = await subscribeWhatsApp(u.phone, u.name, [u.major], u.level)
    if (res.ok && res.welcomed) toast('WhatsApp alerts on: check your phone')
    else if (res.ok && res.stored) toast(res.warning ? `Alerts saved, but WhatsApp said: ${res.warning}` : 'WhatsApp alerts saved for your major')
    else if (!res.ok && res.error !== 'not_configured') toast(`WhatsApp: ${res.message}`)
  }

  const logOut = () => {
    // Clear the user only once we've left the app route, or the sign-in redirect wins.
    addEventListener('hashchange', () => setUser(null), { once: true })
    go('welcome')
    toast("You've been logged out")
  }

  return (
    <>
      {/* The apply page stands in for an outside company site, so it skips InternGH's backdrop. */}
      {route !== 'apply' && <Ambient />}
      <div className="route" key={`${route}/${param}`}>
        {route === 'welcome' && <Welcome user={user} />}
        {route === 'about' && <About user={user} />}
        {route === 'privacy' && <Privacy user={user} />}
        {route === 'signin' && (
          <SignIn
            existing={user}
            onDone={u => {
              const isNew = user?.email !== u.email
              setUser(u)
              go('app')
              toast(`Welcome, ${firstName(u.name)}`)
              if (isNew) void signedUp(u)
            }}
          />
        )}
        {route === 'app' && user && <MainApp user={user} onUser={setUser} onLogOut={logOut} initialOpen={param} sharedVersion={shared} />}
        {route === 'apply' && <Apply oppId={param} user={user} />}
        {route === 'post' && <Post mode={param === 'tip' ? 'tip' : 'employer'} user={user} />}
      </div>
      <Toaster />
    </>
  )
}
