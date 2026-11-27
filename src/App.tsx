import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import Opening, { shouldOpen } from './components/Opening'
import { HashRouter, Route, Routes, useLocation, useNavigate, useNavigationType } from 'react-router-dom'
import { flushSync } from 'react-dom'
import { Footer, Header, WhatsAppFab, useReveal } from './components/ui'
import Home from './pages/Home'
import { About, Affiliate, BundleDetail, Contact, Courses, FounderPage, NotFound, Terms } from './pages/Public'
import { Forgot, Login, Signup } from './pages/Auth'
import Checkout from './pages/Checkout'
import Dashboard from './pages/Dashboard'
import { captureRef } from './lib/store'

const APP = /^\/(dashboard|partner|studio|manage)(\/|$)/
const AUTH = /^\/(login|signup|forgot)(\/|$)/

try { history.scrollRestoration = 'manual' } catch { /* */ }
const OPEN_FIRST = shouldOpen()
if (OPEN_FIRST) document.documentElement.classList.add('opening-on')

function Frame() {
  const loc = useLocation(); const navigate = useNavigate()
  const [opening, setOpening] = useState(OPEN_FIRST)
  const done = useCallback(() => setOpening(false), [])
  useReveal()
  useEffect(() => {
    const ref = new URLSearchParams(loc.search).get('ref') || new URLSearchParams(window.location.search).get('ref')
    if (ref) captureRef(ref, loc.pathname)
  }, [loc.search, loc.pathname])
  // page-to-page view transitions for every in-site link (Chrome, Edge, Safari 18+); others just navigate
  useEffect(() => {
    const doc = document as Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void> } }
    if (!doc.startViewTransition) return
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = (e.target as Element).closest?.('a'); if (!a || a.target || a.hasAttribute('download')) return
      const href = a.getAttribute('href'); if (!href || !href.startsWith('#/')) return
      if (a.closest('.showcase:not(.sc-start) .sc-item:not(.on)') || (a.closest('.sc-track') as HTMLElement | null)?.dataset.moved) return // carousel handles its own taps
      const to = href.slice(1), cur = location.hash.slice(1) || '/'
      if (to === cur) return
      e.preventDefault()
      const img = /^\/courses\/[^/?]+/.test(to) && matchMedia('(min-width: 1101px)').matches ? a.closest('.bcard')?.querySelector<HTMLElement>('img') : null
      if (img) img.style.viewTransitionName = 'bundle-art'
      const h = document.documentElement; h.classList.add('vt-nav')
      doc.startViewTransition(() => flushSync(() => navigate(to))).finished.finally(() => { if (img) img.style.viewTransitionName = ''; h.classList.remove('vt-nav') })
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [navigate])
  // Back / forward: return to exactly where you were; the same entrance animations play, just quicker (nav-back).
  // A normal click opens the new page from the very top at normal pace.
  const navType = useNavigationType(), spots = useRef(new Map<string, number>()), spot = `${loc.key}|${loc.pathname}`, key = useRef(spot)
  useEffect(() => { let q = 0
    const save = () => { if (!q) q = requestAnimationFrame(() => { q = 0; spots.current.set(key.current, scrollY) }) }
    addEventListener('scroll', save, { passive: true }); return () => { removeEventListener('scroll', save); cancelAnimationFrame(q) } }, [])
  const first = useRef(true)
  useLayoutEffect(() => {
    // the opening intro holds the first hero back while the logo plays; any later visit to a page starts right away
    if (first.current) first.current = false; else document.documentElement.style.removeProperty('--hd')
    key.current = spot
    const h = document.documentElement, prev = h.style.scrollBehavior, back = navType === 'POP' && spots.current.has(spot)
    h.classList.toggle('nav-back', back)
    const y = back ? spots.current.get(spot)! : 0
    spots.current.set(spot, y)
    h.style.scrollBehavior = 'auto'; window.scrollTo({ top: y, left: 0, behavior: 'instant' as ScrollBehavior })
    if (!back) { h.style.scrollBehavior = prev; return }
    // the page may still be settling its height (images, the course deck's hold) for a moment: keep the spot
    let n = 0, raf = 0; const keep = () => { if (Math.abs(scrollY - y) > 2) window.scrollTo({ top: y, left: 0, behavior: 'instant' as ScrollBehavior }); if (++n < 12) raf = requestAnimationFrame(keep); else h.style.scrollBehavior = prev }
    const stop = () => { n = 99 }; addEventListener('wheel', stop, { passive: true, once: true }); addEventListener('touchstart', stop, { passive: true, once: true })
    raf = requestAnimationFrame(keep)
    return () => { cancelAnimationFrame(raf); removeEventListener('wheel', stop); removeEventListener('touchstart', stop) }
  }, [spot, navType])
  const app = APP.test(loc.pathname), auth = AUTH.test(loc.pathname)
  return <>
    {opening && <Opening onDone={done} />}
    {!app && !auth && <Header />}
    <div className="page" key={loc.pathname}><Routes location={loc}>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/founders/:slug" element={<FounderPage />} />
      <Route path="/courses" element={<Courses />} />
      <Route path="/courses/:slug" element={<BundleDetail />} />
      <Route path="/affiliate" element={<Affiliate />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot" element={<Forgot />} />
      <Route path="/checkout/:slug" element={<Checkout />} />
      <Route path="/dashboard/*" element={<Dashboard />} />
      <Route path="/partner/*" element={<Dashboard />} />
      <Route path="/studio/*" element={<Dashboard />} />
      <Route path="/manage/*" element={<Dashboard />} />
      <Route path="*" element={<NotFound />} />
    </Routes></div>
    {!app && !auth && <Footer />}
    {!app && !auth && !loc.pathname.startsWith('/checkout') && <WhatsAppFab />}
  </>
}

export default function App() { return <HashRouter><Frame /></HashRouter> }
