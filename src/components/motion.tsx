import React, { useEffect, useRef, useState, type ReactNode } from 'react'

export const reduceMotion = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion:reduce)').matches

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
export function Showcase({ head, children, count }: { head: ReactNode; children: ReactNode[]; count: number }) {
  const track = useRef<HTMLDivElement>(null), bar = useRef<HTMLSpanElement>(null)
  const [idx, setIdx] = useState(0)
  const touched = useRef(false), hover = useRef(false)
  const centreOf = (i: number) => { const t = track.current!, c = t.children[i] as HTMLElement; return c.offsetLeft + c.offsetWidth / 2 - t.clientWidth / 2 }
  const nearest = () => { const t = track.current!; let b = 0, bd = 1e9; for (let i = 0; i < t.children.length; i++) { const d = Math.abs(centreOf(i) - t.scrollLeft); if (d < bd) { bd = d; b = i } } return b }
  const snapTo = (i: number) => { const t = track.current; if (!t) return; i = Math.max(0, Math.min(count - 1, i)); t.scrollTo({ left: centreOf(i), behavior: reduceMotion() ? 'auto' : 'smooth' }) }
  useEffect(() => {
    const t = track.current; if (!t) return
    const red = reduceMotion()
    let raf = 0
    const paint = () => { raf = 0
      const n = nearest(); setIdx((p) => (p === n ? p : n))
      if (!CSS_SCROLL) {
        if (bar.current) { const max = t.scrollWidth - t.clientWidth; bar.current.style.transform = `scaleX(${max > 0 ? Math.max(.08, t.scrollLeft / max) : 1})` }
        if (red) return
        for (let i = 0; i < t.children.length; i++) {
          const el = t.children[i] as HTMLElement, w = el.offsetWidth || 1
          const f = Math.max(0, 1 - Math.abs(centreOf(i) - t.scrollLeft) / w * .7)
          el.style.transform = `translate3d(0,${((1 - f) * 22).toFixed(1)}px,0) scale(${(.88 + f * .12).toFixed(4)})`
          el.style.opacity = (.5 + f * .5).toFixed(3)
        }
      }
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(paint) }
    paint(); t.addEventListener('scroll', on, { passive: true }); addEventListener('resize', on)
    // mouse drag with momentum: release direction + speed decides the next card
    let down = false, sx = 0, sl = 0, moved = 0, lx = 0, lt = 0, v = 0, start = 0
    const pd = (e: PointerEvent) => { touched.current = true; delete t.dataset.moved; if (e.pointerType !== 'mouse' || e.button) return
      down = true; moved = 0; sx = lx = e.clientX; lt = performance.now(); v = 0; sl = t.scrollLeft; start = nearest(); t.classList.add('dragging') }
    const pm = (e: PointerEvent) => { if (!down) return; const now = performance.now(), dx = e.clientX - sx
      moved = Math.max(moved, Math.abs(dx)); if (moved > 6) t.dataset.moved = '1'; t.scrollLeft = sl - dx
      const dt = now - lt; if (dt > 0) v = .8 * ((e.clientX - lx) / dt) + .2 * v; lx = e.clientX; lt = now }
    const pu = () => { if (!down) return; down = false; t.classList.remove('dragging')
      let n = nearest(); if (Math.abs(v) > .35 && n === start) n = start + (v < 0 ? 1 : -1); snapTo(n) }
    const click = (e: MouseEvent) => { if (moved > 6) { e.preventDefault(); e.stopPropagation(); moved = 0; return }
      const card = (e.target as HTMLElement).closest('.sc-item'); if (!card) return
      const i = [...t.children].indexOf(card); if (i !== nearest()) { e.preventDefault(); e.stopPropagation(); touched.current = true; snapTo(i) } }
    const he = () => { hover.current = true }, hl = () => { hover.current = false }
    t.addEventListener('pointerdown', pd); addEventListener('pointermove', pm); addEventListener('pointerup', pu); t.addEventListener('click', click, true)
    t.addEventListener('mouseenter', he); t.addEventListener('mouseleave', hl); t.addEventListener('wheel', () => { touched.current = true }, { passive: true })
    // cards sweep in from the right the first time the carousel is seen; autoplay starts soon after
    let vis = false, auto = 0
    const tick = () => { if (vis && !touched.current && !hover.current && !red && !document.hidden) { const n = nearest(); snapTo(n + 1 >= count ? 0 : n + 1) } auto = window.setTimeout(tick, 4600) }
    const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting
      if (vis && !t.parentElement!.classList.contains('sc-on')) { t.parentElement!.classList.add('sc-on'); clearTimeout(auto); auto = window.setTimeout(tick, 2600) } }, { threshold: .35 })
    io.observe(t)
    return () => { cancelAnimationFrame(raf); t.removeEventListener('scroll', on); removeEventListener('resize', on); t.removeEventListener('pointerdown', pd); removeEventListener('pointermove', pm); removeEventListener('pointerup', pu); t.removeEventListener('click', click, true); t.removeEventListener('mouseenter', he); t.removeEventListener('mouseleave', hl); io.disconnect(); clearTimeout(auto) }
  }, [count])
  const go = (d: number) => { touched.current = true; snapTo(nearest() + d) }
  const arrow = (d: string) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
  return <div className={`showcase ${CSS_SCROLL ? 'css-sd' : ''}`}>
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
