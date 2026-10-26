import { useEffect, useState } from 'react'

export type Route = 'welcome' | 'about' | 'signin' | 'app' | 'apply' | 'post' | 'privacy'

const ROUTES: Route[] = ['about', 'signin', 'app', 'apply', 'post', 'privacy']

export interface Location {
  route: Route
  /** Extra path segment, e.g. the opportunity id in #/apply/<id>. */
  param: string
}

function parse(): Location {
  const [head = '', param = ''] = location.hash.replace(/^#\/?/, '').split('/')
  const route = ROUTES.includes(head as Route) ? (head as Route) : 'welcome'
  return { route, param: decodeURIComponent(param) }
}

export function go(to: Route) {
  location.hash = to === 'welcome' ? '/' : `/${to}`
}

/** Tiny hash router so the back button works without a routing library. */
export function useRoute() {
  const [loc, setLoc] = useState<Location>(parse)
  useEffect(() => {
    const onChange = () => {
      setLoc(parse())
      window.scrollTo({ top: 0 })
    }
    addEventListener('hashchange', onChange)
    return () => removeEventListener('hashchange', onChange)
  }, [])
  return loc
}
