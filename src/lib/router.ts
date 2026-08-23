import { useEffect, useLayoutEffect, useRef, useState } from 'react'

const read = () => window.location.hash.replace(/^#\/?/, '')

/**
 * Hash routing with scroll memory, deliberately dependency-free.
 *
 * A hash route needs no server rewrite rule: the fragment never reaches the
 * server, so every URL is a request for index.html and the app deploys to any
 * static host as-is. Clean URLs would need the host told to serve index.html
 * for unknown paths, which is a few lines of vercel.json and the only thing
 * standing between this and /apple instead of /#/apple.
 *
 * That is the whole argument. An earlier version of this comment also claimed
 * hash routing was what kept deep links working offline; it is not. The
 * generated service worker registers a navigation route bound to index.html,
 * so a clean URL would be served from precache offline just as well.
 *
 * Opening a fruit jumps to the top; coming back restores where the list was.
 * Dumping the shopper at the top after every fruit would make them re-scroll
 * past everything they had already dismissed, which is the opposite of what a
 * one-glance app should do while someone is pushing a cart.
 */
export function useRoute(): string {
  const [route, setRoute] = useState(read)
  const listScroll = useRef(0)
  const leaving = useRef(route)

  useEffect(() => {
    // Take over from the browser, which restores hash navigation on its own.
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'

    const onChange = () => {
      // hashchange fires before React re-renders, so the scroll position still
      // belongs to the view being left. Reading it here avoids racing the
      // programmatic scroll that follows.
      if (leaving.current === '') listScroll.current = window.scrollY
      const next = read()
      leaving.current = next
      setRoute(next)
    }

    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  // Layout effect, not effect: scrolling after paint shows a frame at the wrong
  // position first.
  useLayoutEffect(() => {
    window.scrollTo(0, route === '' ? listScroll.current : 0)
  }, [route])

  return route
}
