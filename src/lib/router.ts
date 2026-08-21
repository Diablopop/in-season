import { useEffect, useState } from 'react'

/**
 * Hash routing, deliberately dependency-free.
 *
 * A hash route needs no server rewrite rule, which keeps the app deployable to
 * any static host and, more importantly, keeps deep links working offline once
 * the service worker is serving from cache.
 */
export function useRoute(): string {
  const read = () => window.location.hash.replace(/^#\/?/, '')
  const [route, setRoute] = useState(read)

  useEffect(() => {
    const onChange = () => setRoute(read())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return route
}

/** Restores the top of the page on navigation, which the hash alone will not do. */
export function useScrollReset(key: string) {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [key])
}
