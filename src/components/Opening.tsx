import { useEffect, useRef, useState } from 'react'
import { LOGO_PATHS, LOGO_VB } from '../data/logo'

/* Opening: the Crafted Skills mark is drawn stroke by stroke, fills with colour, the
   wordmark rises — then the mark and the wordmark each glide into their exact places in
   the header while the white backdrop clears. No fade-out, no cut: the header brand is
   revealed only when the flying copy sits pixel-for-pixel on top of it. */

export const shouldOpen = () => {
  try {
    const forced = /[?&]intro\b/.test(location.search)
    if (!forced && location.hash && location.hash !== '#/' && location.hash !== '#') return false
    if (!forced && sessionStorage.getItem('cs_open')) return false
    sessionStorage.setItem('cs_open', '1'); return true
  } catch { return false }
}

const GLIDE_AT = 2150, GLIDE_MS = 1350, HERO_DELAY = 2.95

export default function Opening({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null), logo = useRef<SVGSVGElement>(null), word = useRef<HTMLDivElement>(null), tag = useRef<HTMLDivElement>(null)
  const [fast, setFast] = useState(false)
  useEffect(() => {
    document.documentElement.style.setProperty('--hd', HERO_DELAY + 's')
    let gliding = false, done = false
    const timers: number[] = []
    const finish = () => { if (done) return; done = true; document.documentElement.classList.remove('opening-on'); onDone() }
    const glide = (ms: number) => {
      if (gliding) return; gliding = true
      const hb = document.getElementById('hdr-brand'), l = logo.current, w = word.current, r = root.current
      const hm = hb?.querySelector('svg'), hw = hb?.querySelector('b')
      if (!hm || !hw || !l || !w || !r) { finish(); return }
      // swap per-letter wrappers for plain text so kerning matches the header exactly
      w.innerHTML = 'Crafted <span class="s">Skills</span>'; w.style.display = 'block'
      const a = l.getBoundingClientRect(), b = hm.getBoundingClientRect()
      const s1 = b.width / a.width
      const dx1 = b.left + b.width / 2 - (a.left + a.width / 2), dy1 = b.top + b.height / 2 - (a.top + a.height / 2)
      const c = w.getBoundingClientRect(), d = hw.getBoundingClientRect()
      const s2 = parseFloat(getComputedStyle(hw).fontSize) / parseFloat(getComputedStyle(w).fontSize)
      const dx2 = d.left - c.left, dy2 = d.top + d.height / 2 - (c.top + c.height / 2)
      const ease = 'cubic-bezier(.62,.01,.24,1)'
      tag.current?.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(6px)' }], { duration: Math.min(320, ms * .3), fill: 'forwards', easing: 'ease-out' })
      // curved paths: the mark shrinks early and lifts first; the word travels below it and
      // rises late — so the two never cross on the way into the header
      const N = 24, kl: Keyframe[] = [], kw: Keyframe[] = []
      for (let k = 0; k <= N; k++) {
        const p = k / N
        const ls = 1 + (s1 - 1) * (1 - Math.pow(1 - p, 2.2)), ly = 1 - Math.pow(1 - p, 1.35)
        kl.push({ offset: p, transform: `translate(${(dx1 * p).toFixed(2)}px,${(dy1 * ly).toFixed(2)}px) scale(${ls.toFixed(4)})` })
        const wx = 1 - Math.pow(1 - p, 1.6), wy = Math.pow(p, 1.7), ws = 1 + (s2 - 1) * (1 - Math.pow(1 - p, 1.8))
        kw.push({ offset: p, transform: `translate(${(dx2 * wx).toFixed(2)}px,${(dy2 * wy).toFixed(2)}px) scale(${ws.toFixed(4)})` })
      }
      l.animate(kl, { duration: ms, easing: ease, fill: 'forwards' })
      w.animate(kw, { duration: ms, easing: ease, fill: 'forwards' })
      r.animate([{ backgroundColor: 'rgba(255,255,255,1)' }, { backgroundColor: 'rgba(255,255,255,1)', offset: .55 }, { backgroundColor: 'rgba(255,255,255,0)' }], { duration: ms, easing: 'ease-in-out', fill: 'forwards' })
      timers.push(window.setTimeout(finish, ms + 30))
    }
    timers.push(window.setTimeout(() => glide(GLIDE_MS), GLIDE_AT))
    const skip = () => {
      if (gliding) return
      setFast(true); timers.forEach(clearTimeout)
      document.documentElement.style.setProperty('--hd', '.15s')
      requestAnimationFrame(() => requestAnimationFrame(() => glide(700)))
    }
    const ev = ['pointerdown', 'wheel', 'keydown', 'touchmove'] as const
    ev.forEach((e) => addEventListener(e, skip, { passive: true }))
    const lock = (e: Event) => e.preventDefault()
    addEventListener('touchmove', lock, { passive: false }); addEventListener('wheel', lock, { passive: false })
    return () => { timers.forEach(clearTimeout); ev.forEach((e) => removeEventListener(e, skip)); removeEventListener('touchmove', lock); removeEventListener('wheel', lock) }
  }, [onDone])
  return <div ref={root} className={`opening ${fast ? 'fast' : ''}`} aria-hidden="true">
    <div className="lock">
      <svg ref={logo} className="ol" viewBox={LOGO_VB}>{LOGO_PATHS.map((p, i) => <path key={i} className={`lp ${p.c}`} style={{ ['--n' as string]: i }} pathLength={1} d={p.d} fillRule="evenodd" />)}</svg>
      <div ref={word} className="ow">{'Crafted Skills'.split('').map((ch, i) => <i key={i} className={i > 7 ? 's' : ''}><span style={{ ['--i' as string]: i }}>{ch === ' ' ? ' ' : ch}</span></i>)}</div>
      <div ref={tag} className="ot">LEARN · CREATE · GROW</div>
    </div>
  </div>
}
