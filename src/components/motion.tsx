import { useEffect, useRef, useState, type ReactNode } from 'react'

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
export function Count({ to, prefix = '' }: { to: number; prefix?: string }) {
  const [v, setV] = useState(0); const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = ref.current; if (!el) return
    if (reduceMotion()) { setV(to); return }
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; io.disconnect()
      const t0 = performance.now(); const f = (t: number) => { const k = Math.min(1, (t - t0) / 1400); setV(Math.round(to * ease(k))); if (k < 1) requestAnimationFrame(f) }
      requestAnimationFrame(f)
    }, { threshold: 0.4 })
    io.observe(el); return () => io.disconnect()
  }, [to])
  return <span ref={ref}>{prefix}{v.toLocaleString('en-IN')}</span>
}

/* Native swipe rail: scroll-snap (smooth on every phone), arrows on PC, dots on phone. */
export function Rail({ head, children, count }: { head: ReactNode; children: ReactNode; count: number }) {
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
    <div className="rail" ref={ref} tabIndex={0} onKeyDown={(e) => { if (e.key === 'ArrowRight') { e.preventDefault(); go(1) } if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1) } }}>{children}</div>
    <div className="dots" aria-hidden="true">{Array.from({ length: count }, (_, i) => <i key={i} className={i === idx ? 'on' : ''} />)}</div>
  </div>
}
