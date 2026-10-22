import { useEffect } from 'react'
import './App.css'
import './pages.css'
import { Ambient } from './components/Ambient'
import { Toaster } from './components/Bits'
import MainApp from './MainApp'
import { About } from './pages/About'
import { Apply } from './pages/Apply'
import { Post } from './pages/Post'
import { SignIn } from './pages/SignIn'
import { Welcome } from './pages/Welcome'
import { useMotionEffects } from './lib/motion'
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
        {route === 'signin' && (
          <SignIn
            existing={user}
            onDone={u => {
              setUser(u)
              go('app')
              toast(`Welcome, ${firstName(u.name)}`)
            }}
          />
        )}
        {route === 'app' && user && <MainApp user={user} onUser={setUser} onLogOut={logOut} initialOpen={param} />}
        {route === 'apply' && <Apply oppId={param} user={user} />}
        {route === 'post' && <Post mode={param === 'tip' ? 'tip' : 'employer'} user={user} />}
      </div>
      <Toaster />
    </>
  )
}
