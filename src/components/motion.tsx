import React, { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

// The full experience runs on every phone (many Android phones switch animations off to save battery).
// Phones that ask for less motion only lose the endless ambient loops (see the 'lite' class in main.tsx).
export const reduceMotion = () => false

/* One shared, passive scroll loop. Each subscriber gets progress values and writes
   transform/opacity straight onto its own elements (compositor-only, no CSS-variable
   cascades, no React renders). Off-screen subscribers are skipped. */
type Sub = { el: HTMLElement; fn: (p: number, pc: number) => void; last: number }
const subs = new Set<Sub>()
let queued = false
function run() {
  queued = false
  const vh = innerHeight
  subs.forEach((s) => {
    const r = s.el.getBoundingClientRect()
    if (r.bottom < -vh * 0.3 || r.top > vh * 1.3) return
    const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)))
    const pc = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.6 + r.height * 0.15)))
    const key = Math.round(p * 1000) + Math.round(pc * 1000) * 1001
    if (key === s.last) return
    s.last = key; s.fn(p, pc)
  })
}
const queue = () => { if (!queued) { queued = true; requestAnimationFrame(run) } }
if (typeof window !== 'undefined') { addEventListener('scroll', queue, { passive: true }); addEventListener('resize', queue) }

export function useScroll<T extends HTMLElement>(fn: (el: T, p: number, pc: number) => void) {
  const ref = useRef<T>(null); const f = useRef(fn); f.current = fn
  useEffect(() => {
    const el = ref.current; if (!el) return
    if (reduceMotion()) { f.current(el, 0.5, 1); return }
    const s: Sub = { el, fn: (p, pc) => f.current(el, p, pc), last: -1 }
    subs.add(s); queue()
    return () => { subs.delete(s) }
  }, [])
  return ref
}
const ease = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3)

/* Words light up one by one while scrolling through. */
export function ScrollWords({ text, className, lang }: { text: string; className?: string; lang?: string }) {
  const words = text.split(' ')
  const ref = useScroll<HTMLDivElement>((el, p) => {
    const n = words.length, spans = el.children
    for (let i = 0; i < spans.length; i++) {
      const v = Math.min(1, Math.max(0.16, (p * 2.4 - 0.5) * n - i))
      ;(spans[i] as HTMLElement).style.opacity = v.toFixed(2)
    }
  })
  return <div ref={ref} className={`swords ${className || ''}`} lang={lang}>
    {words.map((w, i) => <span key={i}>{w}{i < words.length - 1 ? ' ' : ''}</span>)}
  </div>
}

/* Dashboard preview swings up from a tilted plane to face the reader. */
export function TiltIn({ children }: { children: ReactNode }) {
  const ref = useScroll<HTMLDivElement>((el, _p, pc) => {
    const k = ease(pc), f = el.firstElementChild as HTMLElement
    f.style.transform = `perspective(1600px) rotateX(${((1 - k) * 30).toFixed(2)}deg) scale(${(0.88 + k * 0.12).toFixed(3)}) translateY(${((1 - k) * 36).toFixed(1)}px)`
    f.style.opacity = (0.3 + k * 0.7).toFixed(2)
    el.querySelectorAll<HTMLElement>('.dp-card').forEach((c, j) => { const q = ease(pc * 1.35 - j * 0.12); c.style.transform = `translate3d(${((1 - q) * 50).toFixed(1)}px,0,0)`; c.style.opacity = q.toFixed(2) })
  })
  return <div ref={ref} className="tilt-in">{children}</div>
}

/* 3 steps rise in depth one after another; the connector draws between them. */
export function Steps({ children }: { children: ReactNode }) {
  const ref = useScroll<HTMLDivElement>((el, _p, pc) => {
    el.querySelectorAll<HTMLElement>('.step').forEach((c, j) => { const q = ease(pc * 1.45 - j * 0.2); c.style.transform = `perspective(1200px) translate3d(0,${((1 - q) * 60).toFixed(1)}px,0) rotateX(${((1 - q) * 18).toFixed(1)}deg)`; c.style.opacity = q.toFixed(2) })
    const line = el.querySelector<HTMLElement>('.steps-line'); if (line) line.style.transform = (innerWidth > 900 ? 'scaleX(' : 'scaleY(') + ease(pc * 1.2).toFixed(3) + ')'
  })
  return <div ref={ref} className="g3 steps3d"><i className="steps-line" aria-hidden="true" />{children}</div>
}

/* Founder photos drift inside their frame. */
export function Parallax({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useScroll<HTMLDivElement>((el, p) => {
    const img = el.querySelector<HTMLElement>('.para img'); if (img) img.style.transform = `translate3d(0,${((p - 0.5) * -40).toFixed(1)}px,0) scale(1.12)`
  })
  return <div ref={ref} className={className}>{children}</div>
}

/* Count-up when visible */
export function Count({ to, prefix = '', hero }: { to: number; prefix?: string; hero?: boolean }) {
  const [v, setV] = useState(0); const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = ref.current; if (!el) return
    if (reduceMotion()) { setV(to); return }
    let raf = 0, tm = 0
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; io.disconnect()
      const wait = hero ? (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hd')) || 0) * 1000 + 450 : 0
      tm = window.setTimeout(() => { const t0 = performance.now(); const f = (t: number) => { const k = Math.min(1, (t - t0) / 1400); setV(Math.round(to * ease(k))); if (k < 1) raf = requestAnimationFrame(f) }; raf = requestAnimationFrame(f) }, wait)
    }, { threshold: 0.2 })
    io.observe(el)
    return () => { io.disconnect(); clearTimeout(tm); cancelAnimationFrame(raf) }
  }, [to, hero])
  return <span ref={ref}>{prefix}{v}</span>
}

/* Native swipe rail: scroll-snap (smooth on every phone), arrows on PC, dots on phone. */
export function Rail({ head, children, count, stagger }: { head: ReactNode; children: ReactNode; count: number; stagger?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const [idx, setIdx] = useState(0); const [edge, setEdge] = useState({ s: true, e: false })
  useEffect(() => {
    const el = ref.current; if (!el) return
    let raf = 0
    const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => {
      const first = el.firstElementChild as HTMLElement | null; if (!first) return
      const step = first.getBoundingClientRect().width + parseFloat(getComputedStyle(el).columnGap || '0')
      setIdx(Math.min(count - 1, Math.round(el.scrollLeft / step)))
      setEdge({ s: el.scrollLeft < 4, e: el.scrollLeft + el.clientWidth > el.scrollWidth - 4 })
    }) }
    on(); el.addEventListener('scroll', on, { passive: true }); addEventListener('resize', on)
    return () => { el.removeEventListener('scroll', on); removeEventListener('resize', on); cancelAnimationFrame(raf) }
  }, [count])
  const go = (d: number) => { const el = ref.current; if (!el) return; const first = el.firstElementChild as HTMLElement; const step = first.getBoundingClientRect().width + parseFloat(getComputedStyle(el).columnGap || '0'); el.scrollBy({ left: d * step, behavior: reduceMotion() ? 'auto' : 'smooth' }) }
  return <div>
    <div className="head-row"><div>{head}</div>
      <div className="rail-ui"><button onClick={() => go(-1)} disabled={edge.s} aria-label="Previous"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg></button>
        <button onClick={() => go(1)} disabled={edge.e} aria-label="Next"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7" /></svg></button></div></div>
    <div className={`rail ${stagger ? 'stg' : ''}`} ref={ref} tabIndex={0} onKeyDown={(e) => { if (e.key === 'ArrowRight') { e.preventDefault(); go(1) } if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1) } }}>{children}</div>
    <div className="dots" aria-hidden="true">{Array.from({ length: count }, (_, i) => <i key={i} className={i === idx ? 'on' : ''} />)}</div>
  </div>
}

/* Section headings: each word slides up out of a mask. */
export function SplitH({ text, as = 'h2', className = 'h2', style }: { text: string; as?: 'h1' | 'h2'; className?: string; style?: React.CSSProperties }) {
  const T = as
  return <T className={`${className} sh`} style={style} aria-label={text}>{text.split(' ').map((w, i, a) => <React.Fragment key={i}><span className="w" aria-hidden="true"><span style={{ ['--i' as string]: i }}>{w}</span></span>{i < a.length - 1 ? ' ' : ''}</React.Fragment>)}</T>
}

/* Hero scroll-out + page progress bar: one passive rAF listener, transforms only. */
export function useHeroScroll() {
  useEffect(() => {
    const red = reduceMotion()
    const sd = typeof CSS !== 'undefined' && !!CSS.supports?.('animation-timeline: scroll()')
    const hero = document.querySelector<HTMLElement>('.hero'), pic = document.querySelector<HTMLElement>('.hero .pic'), bar = document.querySelector<HTMLElement>('.sprog')
    const arch = document.querySelector<HTMLElement>('.hero .arch'), lays = [...document.querySelectorAll<HTMLElement>('.hero .lay')]
    // scroll: native CSS scroll-driven animation where supported; this is only the fallback. The text never fades.
    let raf = 0
    const run = () => { raf = 0
      const vh = innerHeight, y = scrollY
      if (!sd && !red && pic) { const k = Math.min(1, y / vh); pic.style.translate = `0 ${(k * (innerWidth < 900 ? 12 : 60)).toFixed(1)}px`; pic.style.scale = String(1 - k * .06) }
      if (!sd && bar) { const h = document.documentElement.scrollHeight - vh; bar.style.transform = `scaleX(${h > 0 ? (y / h).toFixed(4) : 0})` }
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(run) }
    if (!sd) { run(); addEventListener('scroll', on, { passive: true }); addEventListener('resize', on) }
    // PC: the photo and the floating cards sit at different depths and follow the pointer softly
    const fine = matchMedia('(hover:hover) and (pointer:fine)').matches
    let tx = 0, ty = 0, cx = 0, cy = 0, praf = 0
    const step = () => { praf = 0
      cx += (tx - cx) * .07; cy += (ty - cy) * .07
      if (arch) arch.style.transform = `translate3d(${(cx * -10).toFixed(2)}px,${(cy * -8).toFixed(2)}px,0)`
      lays.forEach((l, i) => { l.style.transform = `translate3d(${(cx * (20 + i * 12)).toFixed(2)}px,${(cy * (16 + i * 10)).toFixed(2)}px,0)` })
      if (Math.abs(tx - cx) + Math.abs(ty - cy) > .0008) praf = requestAnimationFrame(step)
    }
    const pm = (e: PointerEvent) => { if (!hero) return; const r = hero.getBoundingClientRect(); tx = e.clientX / r.width - .5; ty = (e.clientY - r.top) / r.height - .5; if (!praf) praf = requestAnimationFrame(step) }
    const pl = () => { tx = 0; ty = 0; if (!praf) praf = requestAnimationFrame(step) }
    if (fine && !red && hero) { hero.addEventListener('pointermove', pm); hero.addEventListener('pointerleave', pl) }
    return () => { removeEventListener('scroll', on); removeEventListener('resize', on); cancelAnimationFrame(raf); cancelAnimationFrame(praf); hero?.removeEventListener('pointermove', pm); hero?.removeEventListener('pointerleave', pl) }
  }, [])
}

/* Closing banner grows to full size as it scrolls in. */
export function GrowIn({ children }: { children: ReactNode }) {
  const ref = useScroll<HTMLDivElement>((el, _p, pc) => { const k = ease(pc); const c = el.firstElementChild as HTMLElement; c.style.transform = `scale(${(0.86 + k * 0.14).toFixed(4)})`; c.style.borderRadius = `${(60 - k * 26).toFixed(1)}px` })
  return <div ref={ref}>{children}</div>
}

/* Premium course showcase. The focus effect (scale, lift, fade) is a CSS scroll-driven animation,
   so it runs on the compositor in step with the finger: no JS per frame, no lag on phones.
   JS only tracks which card is centred (for the counter + shadow), drag with momentum on PC,
   and a calm autoplay that pauses on hover and stops for good once the visitor takes over. */
const CSS_SCROLL = typeof CSS !== 'undefined' && CSS.supports?.('animation-timeline: view()')
export function Showcase({ head, children, count, float }: { head: ReactNode; children: ReactNode[]; count: number; float?: boolean }) {
  const track = useRef<HTMLDivElement>(null), bar = useRef<HTMLSpanElement>(null)
  const [idx, setIdx] = useState(0)
  const touched = useRef(0), hover = useRef(false)
  // PC: cards line up from the left edge of the page (no empty space beside the first card).
  // Phone/tablet: centre-focused with neighbours peeking.
  const startQ = '(min-width: 1000px)'
  const [start, setStart] = useState(() => !float && typeof matchMedia !== 'undefined' && matchMedia(startQ).matches)
  useEffect(() => { if (float) return; const m = matchMedia(startQ); const f = () => setStart(m.matches); m.addEventListener('change', f); return () => m.removeEventListener('change', f) }, [float])
  // floating mode opens on the middle card, so cards sit on both sides from the first frame
  useEffect(() => { if (!float) return; const t = track.current; if (!t) return; const mid = Math.floor(count / 2); const c = t.children[mid] as HTMLElement; if (c) { t.scrollLeft = c.offsetLeft + c.offsetWidth / 2 - t.clientWidth / 2; setIdx(mid) } }, [float, count])
  const pos = (i: number) => { const t = track.current!, c = t.children[i] as HTMLElement
    return start ? c.offsetLeft - parseFloat(getComputedStyle(t).paddingLeft) : c.offsetLeft + c.offsetWidth / 2 - t.clientWidth / 2 }
  const atEnd = () => { const t = track.current!; return start && t.scrollLeft >= t.scrollWidth - t.clientWidth - 4 }
  const nearest = () => { const t = track.current!; let b = 0, bd = 1e9; for (let i = 0; i < t.children.length; i++) { const d = Math.abs(pos(i) - t.scrollLeft); if (d < bd) { bd = d; b = i } } return b }
  const shown = () => atEnd() ? count - 1 : nearest()
  const snapTo = (i: number) => { const t = track.current; if (!t) return; i = Math.max(0, Math.min(count - 1, i)); t.scrollTo({ left: Math.min(pos(i), t.scrollWidth - t.clientWidth), behavior: reduceMotion() ? 'auto' : 'smooth' }) }
  useEffect(() => {
    const t = track.current; if (!t) return
    const red = reduceMotion()
    let raf = 0
    const paint = () => { raf = 0
      const n = shown(); setIdx((p) => (p === n ? p : n))
      if (!CSS_SCROLL && !start) {
        if (bar.current) { const max = t.scrollWidth - t.clientWidth; bar.current.style.transform = `scaleX(${max > 0 ? Math.max(.08, t.scrollLeft / max) : 1})` }
        if (red) return
        for (let i = 0; i < t.children.length; i++) {
          const el = t.children[i] as HTMLElement, w = el.offsetWidth || 1
          const f = Math.max(0, 1 - Math.abs(pos(i) - t.scrollLeft) / w * .7)
          el.style.transform = `translate3d(0,${((1 - f) * 22).toFixed(1)}px,0) scale(${(.88 + f * .12).toFixed(4)})`
          el.style.opacity = (.5 + f * .5).toFixed(3)
        }
      }
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(paint) }
    paint(); t.addEventListener('scroll', on, { passive: true }); addEventListener('resize', on)
    // mouse drag with momentum: release direction + speed decides the next card
    let down = false, sx = 0, sl = 0, moved = 0, lx = 0, lt = 0, v = 0, start = 0
    const pd = (e: PointerEvent) => { touched.current = performance.now(); delete t.dataset.moved; if (e.pointerType !== 'mouse' || e.button) return
      down = true; moved = 0; sx = lx = e.clientX; lt = performance.now(); v = 0; sl = t.scrollLeft; start = nearest(); t.classList.add('dragging') }
    const pm = (e: PointerEvent) => { if (!down) return; const now = performance.now(), dx = e.clientX - sx
      moved = Math.max(moved, Math.abs(dx)); if (moved > 6) t.dataset.moved = '1'; t.scrollLeft = sl - dx
      const dt = now - lt; if (dt > 0) v = .8 * ((e.clientX - lx) / dt) + .2 * v; lx = e.clientX; lt = now }
    const pu = () => { if (!down) return; down = false; t.classList.remove('dragging')
      let n = nearest(); if (Math.abs(v) > .35 && n === start) n = start + (v < 0 ? 1 : -1); snapTo(n) }
    const click = (e: MouseEvent) => { if (moved > 6) { e.preventDefault(); e.stopPropagation(); moved = 0; return }
      const card = (e.target as HTMLElement).closest('.sc-item'); if (!card) return
      const i = [...t.children].indexOf(card); if (!start && i !== nearest()) { e.preventDefault(); e.stopPropagation(); touched.current = performance.now(); snapTo(i) } }
    const he = () => { hover.current = true }, hl = () => { hover.current = false }
    t.addEventListener('pointerdown', pd); addEventListener('pointermove', pm); addEventListener('pointerup', pu); t.addEventListener('click', click, true)
    t.addEventListener('mouseenter', he); t.addEventListener('mouseleave', hl); t.addEventListener('wheel', () => { touched.current = performance.now() }, { passive: true })
    // cards sweep in from the right the first time the carousel is seen; autoplay starts soon after
    let vis = false, auto = 0
    const tick = () => { if (vis && performance.now() - touched.current > 4500 && !hover.current && !red && !document.hidden) { const n = nearest(); snapTo(atEnd() || n + 1 >= count ? 0 : n + 1) } auto = window.setTimeout(tick, float ? 3200 : 4600) }
    const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting
      if (vis && !t.parentElement!.classList.contains('sc-on')) { t.parentElement!.classList.add('sc-on'); clearTimeout(auto); auto = window.setTimeout(tick, float ? 1600 : 2600) } }, { threshold: .35 })
    io.observe(t)
    return () => { cancelAnimationFrame(raf); t.removeEventListener('scroll', on); removeEventListener('resize', on); t.removeEventListener('pointerdown', pd); removeEventListener('pointermove', pm); removeEventListener('pointerup', pu); t.removeEventListener('click', click, true); t.removeEventListener('mouseenter', he); t.removeEventListener('mouseleave', hl); io.disconnect(); clearTimeout(auto) }
  }, [count, start, float])
  const go = (d: number) => { touched.current = performance.now(); snapTo(nearest() + d) }
  const arrow = (d: string) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
  return <div className={`showcase ${CSS_SCROLL ? 'css-sd' : ''} ${start ? 'sc-start' : ''} ${float ? 'sc-float' : ''}`}>
    <div className="head-row"><div>{head}</div>
      <div className="sc-ui"><span className="sc-count" aria-live="polite"><b key={idx}>{String(idx + 1).padStart(2, '0')}</b> / {String(count).padStart(2, '0')}</span>
        <div className="rail-ui"><button onClick={() => go(-1)} disabled={idx === 0} aria-label="Previous bundle">{arrow('M15 5l-7 7 7 7')}</button>
          <button onClick={() => go(1)} disabled={idx === count - 1} aria-label="Next bundle">{arrow('M9 5l7 7-7 7')}</button></div></div></div>
    <div className="sc-track" ref={track} tabIndex={0} aria-label="Course bundles" onKeyDown={(e) => { if (e.key === 'ArrowRight') { e.preventDefault(); go(1) } if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1) } }}>
      {children.map((c, i) => <div className={`sc-item ${i === idx ? 'on' : ''}`} key={i} style={{ ['--k' as string]: i }}>{c}</div>)}
    </div>
    <div className="sc-prog" aria-hidden="true"><span ref={bar} /></div>
  </div>
}

/* Scroll deck: the section pins while you scroll and the course cards glide sideways, each card
   lifting into focus as it reaches the spotlight. Driven by a CSS view-timeline on the compositor
   (no JS per frame), so it stays smooth on phones. Fallback: one rAF loop. Reduced motion: plain carousel. */
export function ScrollDeck({ head, children, after }: { head: ReactNode; children: ReactNode[]; after?: ReactNode }) {
  const n = children.length
  const sec = useRef<HTMLDivElement>(null), track = useRef<HTMLDivElement>(null), bar = useRef<HTMLSpanElement>(null)
  const [idx, setIdx] = useState(0)
  const red = reduceMotion()
  const sd = typeof CSS !== 'undefined' && !!CSS.supports?.('animation-timeline: view()')
  useEffect(() => {
    if (red) return
    const s = sec.current, t = track.current; if (!s || !t) return
    let raf = 0
    const run = () => { raf = 0
      const r = s.getBoundingClientRect(), span = r.height - innerHeight
      const k = Math.max(0, Math.min(1, span > 0 ? -r.top / span : 0))
      const i = Math.round(k * (n - 1)); setIdx((p) => (p === i ? p : i))
      if (!sd) { // fallback for browsers without scroll-driven animations
        const items = [...t.children] as HTMLElement[]; if (items.length < 2) return
        const step = items[1].offsetLeft - items[0].offsetLeft
        t.style.transform = `translate3d(${(-k * step * (n - 1)).toFixed(1)}px,0,0)`
        items.forEach((el, j) => { const f = Math.max(0, 1 - Math.abs(k * (n - 1) - j)); el.style.transform = `translate3d(0,${((1 - f) * 24).toFixed(1)}px,0) scale(${(.87 + .13 * f).toFixed(4)})`; el.style.opacity = (.45 + .55 * f).toFixed(3) })
        if (bar.current) bar.current.style.transform = `scaleX(${Math.max(.06, k)})`
      }
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(run) }
    run(); addEventListener('scroll', on, { passive: true }); addEventListener('resize', on)
    return () => { removeEventListener('scroll', on); removeEventListener('resize', on); cancelAnimationFrame(raf) }
  }, [n, red, sd])
  if (red) return <><Showcase count={n} head={head}>{children}</Showcase>{after}</>
  // per-card focus keyframes: card j peaks exactly when it reaches the spotlight
  const h = 100 / (n - 1), S = 'transform:translate3d(40px,46px,-120px) rotateY(-24deg) rotateZ(2.5deg) scale(.86);opacity:.5', B = 'transform:translate3d(0,0,0) rotateY(0) rotateZ(0) scale(1);opacity:1', G = 'transform:translate3d(-110px,-40px,-160px) rotateY(32deg) rotateZ(-4deg) scale(.82);opacity:0'
  const kf = (j: number, gone: boolean) => { const p = j * h, st = new Map<number, string>()
    st.set(0, S); st.set(100, gone && p < 100 ? G : S)
    if (p - h > 0) st.set(+(p - h).toFixed(3), S)
    if (gone && p + h * .8 < 100) st.set(+(p + h * .8).toFixed(3), G)
    else if (!gone && p + h < 100) st.set(+(p + h).toFixed(3), S)
    st.set(+p.toFixed(3), B)
    return [...st.entries()].sort((a, b) => a[0] - b[0]).map(([o, v]) => `${o}%{${v}}`).join('') }
  const css = Array.from({ length: n }, (_, j) => `@keyframes dk${j}{${kf(j, false)}}@keyframes dkp${j}{${kf(j, true)}}`).join('')
  return <div className={`deck ${sd ? 'deck-sd' : ''}`} ref={sec} style={{ ['--n' as string]: n }}>
    <style>{css}</style>
    <div className="deck-pin">
      <div className="deck-head wrap"><div className="deck-copy">{head}</div>
        <div className="deck-ui"><span className="sc-count" aria-live="polite"><b key={idx}>{String(idx + 1).padStart(2, '0')}</b> / {String(n).padStart(2, '0')}</span>
          <div className="sc-prog deck-prog" aria-hidden="true"><span ref={bar} /></div>{after}</div></div>
      <div className="deck-track" ref={track}>{children.map((c, j) => <div className="deck-item" key={j} style={{ ['--j' as string]: j, ['--pc-anim' as string]: `dkp${j}`, animationName: `dk${j}` }} data-j={j}>{c}</div>)}</div>
    </div>
  </div>
}

function Mark3() { return <span className="ob-logo"><img src="img/mark.webp" alt="" loading="lazy" /><b>Crafted Skills</b></span> }

/* Orbit: the course cards sit around a 3D ring that turns by itself, pausing a moment on each card.
   The turning is a Web Animation on transform only, so it runs on the graphics card (no main-thread work
   per frame). Hover or touch pauses it; drag spins it; tapping a side card brings it to the front. */
export function Orbit({ head, children }: { head: ReactNode; children: ReactNode[] }) {
  const n = children.length, th = 360 / n, TILT = -7
  const stage = useRef<HTMLDivElement>(null), ring = useRef<HTMLDivElement>(null)
  const ctl = useRef<{ go: (d: number) => void } | null>(null)
  const [idx, setIdx] = useState(0), [r, setR] = useState(380)
  useEffect(() => {
    const f = () => { const el = stage.current; if (!el) return; const cw = (el.querySelector('.orbit-item') as HTMLElement | null)?.offsetWidth || 320
      setR(Math.round(cw / 2 / Math.tan(Math.PI / n) + Math.min(70, cw * .2))) }
    f(); addEventListener('resize', f); return () => removeEventListener('resize', f)
  }, [n])
  // Motion is driven by the ring's angle: one transform per frame, and the loop sleeps when nothing moves.
  useEffect(() => {
    const g = ring.current, st = stage.current; if (!g || !st) return
    let ang = 0, raf = 0, anim: { from: number; to: number; t0: number; dur: number; ease: (k: number) => number } | null = null
    let dragging = false, sx = 0, sy = 0, sa = 0, horiz = false, moved = 0, lastX = 0, lastT = 0, vel = 0
    let vis = false, lastUser = -1e9, autoT = 0
    const apply = () => { g.style.transform = `translate3d(0,0,${-r}px) rotateX(${TILT}deg) rotateY(${ang.toFixed(3)}deg)` }
    const front = () => ((Math.round(-ang / th) % n) + n) % n
    let shownI = -1
    const sync = () => { const i = front(); if (i === shownI) return; shownI = i
      g.querySelectorAll<HTMLElement>('.orbit-item').forEach((el, j) => { el.classList.toggle('on', j === i); el.setAttribute('aria-hidden', String(j !== i)) })
      setIdx(i) }
    // a soft, unhurried glide (gentle start and landing)
    const inOut = (k: number) => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2
    const glide = (k: number) => -(Math.cos(Math.PI * k) - 1) / 2
    const out = (k: number) => 1 - Math.pow(1 - k, 3)
    const loop = (t: number) => { raf = 0
      if (anim) { const k = Math.min(1, (t - anim.t0) / anim.dur); ang = anim.from + (anim.to - anim.from) * anim.ease(k); if (k >= 1) anim = null }
      apply(); sync(); if (anim) raf = requestAnimationFrame(loop) }
    const kick = () => { if (!raf) raf = requestAnimationFrame(loop) }
    const tween = (to: number, dur: number, ease = inOut) => { anim = { from: ang, to, t0: performance.now(), dur, ease }; kick() }
    const snapStop = (a: number) => Math.round(a / th) * th
    const go = (d: number) => { lastUser = performance.now(); tween(snapStop(ang) - d * th, 1000) }
    ctl.current = { go }
    // gentle autoplay: glide to the next card every few seconds while visible and untouched
    const auto = () => { autoT = window.setTimeout(auto, 3400)
      if (!vis || dragging || anim || document.hidden || performance.now() - lastUser < 4500) return
      tween(snapStop(ang) - th, 1500, glide) }
    autoT = window.setTimeout(auto, 2600)
    const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting }, { threshold: .4 }); io.observe(st)
    // swipe/drag: the ring follows the finger 1:1, then glides on with the flick and settles on a card
    const pxPerDeg = () => Math.max(2.2, (r * Math.PI * 2) / 360 * .9)
    const pd = (e: PointerEvent) => { dragging = true; horiz = false; moved = 0; sx = lastX = e.clientX; sy = e.clientY; lastT = performance.now(); vel = 0; sa = ang; anim = null; lastUser = performance.now() }
    const pm = (e: PointerEvent) => { if (!dragging) return; const dx = e.clientX - sx, dy = e.clientY - sy
      if (!horiz) { if (Math.abs(dx) > 7 && Math.abs(dx) > Math.abs(dy) * 1.1) horiz = true; else if (Math.abs(dy) > 10) { dragging = false; return } else return }
      moved = Math.max(moved, Math.abs(dx)); const now = performance.now(), dt = Math.max(1, now - lastT)
      vel = .75 * ((e.clientX - lastX) / dt) + .25 * vel; lastX = e.clientX; lastT = now
      ang = sa + dx / pxPerDeg(); kick() }
    const pu = () => { if (!dragging) return; dragging = false; lastUser = performance.now(); if (!horiz) return
      const fling = Math.max(-th * 2.2, Math.min(th * 2.2, (vel * 260) / pxPerDeg()))
      const to = snapStop(ang + fling), dist = Math.abs(to - ang)
      tween(to, Math.max(420, Math.min(1100, 380 + dist * 9)), out) }
    const click = (e: MouseEvent) => { if (horiz && moved > 7) { e.preventDefault(); e.stopPropagation(); horiz = false; return }
      const it = (e.target as HTMLElement).closest('.orbit-item') as HTMLElement | null; if (!it) return
      const j = Number(it.dataset.j), cur = front(); if (j === cur) return
      e.preventDefault(); e.stopPropagation(); let d = j - cur; if (d > n / 2) d -= n; if (d < -n / 2) d += n; go(d) }
    const he = (e: PointerEvent) => { if (e.pointerType === 'mouse') lastUser = performance.now() + 1e6 }, hl = (e: PointerEvent) => { if (e.pointerType === 'mouse') lastUser = performance.now() - 2500 }
    st.addEventListener('pointerdown', pd); addEventListener('pointermove', pm, { passive: true }); addEventListener('pointerup', pu); addEventListener('pointercancel', pu)
    st.addEventListener('click', click, true); st.addEventListener('pointerenter', he); st.addEventListener('pointerleave', hl)
    // decode every card image ahead of time (off the main thread), so nothing stalls when the ring arrives
    const warm = () => st.querySelectorAll('img').forEach((im) => { (im as HTMLImageElement).decode?.().catch(() => {}) })
    const ric = (window as Window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback
    if (ric) ric(warm); else setTimeout(warm, 800)
    apply(); sync()
    return () => { cancelAnimationFrame(raf); clearTimeout(autoT); io.disconnect(); st.removeEventListener('pointerdown', pd); removeEventListener('pointermove', pm); removeEventListener('pointerup', pu); removeEventListener('pointercancel', pu); st.removeEventListener('click', click, true); st.removeEventListener('pointerenter', he); st.removeEventListener('pointerleave', hl) }
  }, [n, r, th])
  // the cards render once; the front-card highlight is switched directly, so turning never re-renders them
  const items = useMemo(() => children.map((c, j) => <div className="orbit-item" key={j} data-j={j} style={{ transform: `rotateY(${j * th}deg) translate3d(0,0,${r}px)` }}>
    <div className="orbit-face"><div className="orbit-glow" aria-hidden="true" />{c}</div>
    <div className="orbit-back" aria-hidden="true"><Mark3 /></div>
  </div>), [children, r, th])
  const arrow = (d: string) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
  return <div className="orbit">
    <div className="head-row"><div>{head}</div>
      <div className="sc-ui"><span className="sc-count" aria-live="polite"><b key={idx}>{String(idx + 1).padStart(2, '0')}</b> / {String(n).padStart(2, '0')}</span>
        <div className="rail-ui"><button onClick={() => ctl.current?.go(-1)} aria-label="Previous bundle">{arrow('M15 5l-7 7 7 7')}</button><button onClick={() => ctl.current?.go(1)} aria-label="Next bundle">{arrow('M9 5l7 7-7 7')}</button></div></div></div>
    <div className="orbit-stage" ref={stage}>
      <div className="orbit-spot" aria-hidden="true" />
      <div className="orbit-floor" aria-hidden="true" />
      <div className="orbit-rise">
        <div className="orbit-ring" ref={ring} style={{ transform: `translate3d(0,0,${-r}px) rotateX(${TILT}deg)` }}>
          {items}
        </div>
      </div>
    </div>
    <div className="orbit-dots" aria-hidden="true">{children.map((_, j) => <i key={j} className={j === idx ? 'on' : ''} />)}</div>
  </div>
}
