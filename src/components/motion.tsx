import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

const reduce = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion:reduce)').matches

/* One shared scroll loop. Each registered element gets --p (0 when its top meets the
   viewport bottom, 1 when its bottom leaves the viewport top) and --pc (0 → 1 while it
   travels from the bottom edge to the centre). Only elements near the screen are touched. */
type Entry = { el: HTMLElement; cb?: (p: number, pc: number) => void }
const entries = new Set<Entry>()
let ticking = false
function frame() {
  ticking = false
  const vh = innerHeight
  entries.forEach((e) => {
    const r = e.el.getBoundingClientRect()
    if (r.bottom < -vh * 0.5 || r.top > vh * 1.5) return
    const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)))
    const pc = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.55 + r.height * 0.2)))
    e.el.style.setProperty('--p', p.toFixed(4)); e.el.style.setProperty('--pc', pc.toFixed(4))
    e.cb?.(p, pc)
  })
}
function kick() { if (!ticking) { ticking = true; requestAnimationFrame(frame) } }
if (typeof window !== 'undefined') { addEventListener('scroll', kick, { passive: true }); addEventListener('resize', kick) }

export function useScrollVar<T extends HTMLElement>(cb?: (p: number, pc: number) => void) {
  const ref = useRef<T>(null)
  const cbRef = useRef(cb); cbRef.current = cb
  useEffect(() => {
    const el = ref.current; if (!el) return
    if (reduce()) { el.style.setProperty('--p', '.5'); el.style.setProperty('--pc', '1'); cbRef.current?.(0.5, 1); return }
    const e: Entry = { el, cb: (p, pc) => cbRef.current?.(p, pc) }
    entries.add(e); kick()
    return () => { entries.delete(e) }
  }, [])
  return ref
}

/* 1. Real 3D logo: the mark is stacked into a solid with depth, turns with pointer/finger and scroll. */
export function Logo3D({ size = '100%' }: { size?: string }) {
  const host = useRef<HTMLDivElement>(null), obj = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = host.current, o = obj.current; if (!h || !o) return
    if (reduce()) { o.style.transform = 'rotateY(-18deg) rotateX(6deg)'; return }
    let tx = 0, ty = 0, x = -14, y = 6, drag = false, sx = 0, sy = 0, bx = 0, by = 0, raf = 0, idle = 0
    const fine = matchMedia('(hover:hover) and (pointer:fine)').matches
    const loop = (t: number) => {
      const r = h.getBoundingClientRect()
      const scrollTurn = Math.min(1, Math.max(-1, (innerHeight / 2 - (r.top + r.height / 2)) / innerHeight)) * 40
      const sway = drag ? 0 : Math.sin(t / 2600) * 10 * Math.min(1, (t - idle) / 1500)
      x += (tx + sway + scrollTurn - x) * 0.07; y += (ty - y) * 0.07
      o.style.transform = `rotateY(${x - 14}deg) rotateX(${y + 6}deg)`
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    const io = new IntersectionObserver(([e]) => { cancelAnimationFrame(raf); if (e.isIntersecting) raf = requestAnimationFrame(loop) })
    io.observe(h)
    const parent = h.closest('.stage') as HTMLElement || h
    const move = (e: PointerEvent) => {
      if (drag) { tx = bx + (e.clientX - sx) * 0.35; ty = Math.max(-35, Math.min(35, by - (e.clientY - sy) * 0.25)); return }
      if (!fine) return
      const r = parent.getBoundingClientRect(); tx = ((e.clientX - r.left) / r.width - 0.5) * 50; ty = -((e.clientY - r.top) / r.height - 0.5) * 30
    }
    const down = (e: PointerEvent) => { drag = true; sx = e.clientX; sy = e.clientY; bx = tx; by = ty }
    const up = () => { if (drag) { drag = false; idle = performance.now(); if (!fine) { tx = 0; ty = 0 } } }
    const leave = () => { if (!drag) { tx = 0; ty = 0 } }
    h.addEventListener('pointerdown', down); addEventListener('pointermove', move, { passive: true }); addEventListener('pointerup', up); parent.addEventListener('pointerleave', leave)
    return () => { cancelAnimationFrame(raf); io.disconnect(); h.removeEventListener('pointerdown', down); removeEventListener('pointermove', move); removeEventListener('pointerup', up); parent.removeEventListener('pointerleave', leave) }
  }, [])
  const L = 16
  return <div ref={host} className="logo3d" style={{ width: size }} aria-hidden="true">
    <div ref={obj} className="logo3d-obj">
      {Array.from({ length: L }, (_, i) => <span key={i} className={`l3 ${i === L - 1 ? 'face' : i === 0 ? 'back' : ''}`} style={{ transform: `translateZ(${(i - L / 2) * 1.6}px)`, ['--k' as string]: (i / (L - 1)).toFixed(3) } as CSSProperties} />)}
      <span className="l3 shine" style={{ transform: `translateZ(${(L / 2) * 1.6 + 0.4}px)` }} />
    </div>
    <div className="logo3d-shadow" />
  </div>
}

/* 5. Words light up one by one while scrolling through. */
export function ScrollWords({ text, className, lang }: { text: string; className?: string; lang?: string }) {
  const ref = useScrollVar<HTMLDivElement>()
  const words = text.split(' ')
  return <div ref={ref} className={`swords ${className || ''}`} lang={lang} style={{ ['--n' as string]: words.length } as CSSProperties}>
    {words.map((w, i) => <span key={i} style={{ ['--i' as string]: i } as CSSProperties}>{w}{i < words.length - 1 ? ' ' : ''}</span>)}
  </div>
}

/* Generic scroll stage: renders children with --p / --pc on the wrapper. */
export function ScrollStage({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  const ref = useScrollVar<HTMLDivElement>()
  return <div ref={ref} className={className} style={style}>{children}</div>
}

/* 8. Count-up when visible */
export function Count({ to, prefix = '' }: { to: number; prefix?: string }) {
  const [v, setV] = useState(0); const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = ref.current; if (!el) return
    if (reduce()) { setV(to); return }
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; io.disconnect()
      const t0 = performance.now(); const f = (t: number) => { const k = Math.min(1, (t - t0) / 1500); setV(Math.round(to * (1 - Math.pow(1 - k, 3)))); if (k < 1) requestAnimationFrame(f) }
      requestAnimationFrame(f)
    }, { threshold: 0.4 })
    io.observe(el); return () => io.disconnect()
  }, [to])
  return <span ref={ref}>{prefix}{v.toLocaleString('en-IN')}</span>
}

/* 7. Two drifting rows; speed follows scroll velocity; direction alternates. */
export function DriftRows<T>({ items, render, gap = 16 }: { items: T[]; render: (t: T, i: number) => ReactNode; gap?: number }) {
  const r1 = useRef<HTMLDivElement>(null), r2 = useRef<HTMLDivElement>(null), wrap = useRef<HTMLDivElement>(null)
  const half = Math.ceil(items.length / 2)
  const rows = [items.slice(0, half), items.slice(half)]
  useEffect(() => {
    if (reduce()) return
    const rs = [r1.current!, r2.current!]; const off = [0, 0]; let vel = 0, lastY = scrollY, raf = 0, paused = false, vis = false
    const loop = () => {
      const y = scrollY; vel = vel * 0.9 + (y - lastY) * 0.12; lastY = y
      if (!paused) rs.forEach((el, k) => {
        const w = el.scrollWidth / 2; const dir = k === 0 ? -1 : 1
        off[k] += dir * (0.45 + Math.min(6, Math.abs(vel)))
        if (off[k] <= -w) off[k] += w; if (off[k] > 0) off[k] -= w
        el.style.transform = `translate3d(${off[k]}px,0,0)`
      })
      if (vis) raf = requestAnimationFrame(loop)
    }
    rs[1] && (off[1] = -rs[1].scrollWidth / 4)
    const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; cancelAnimationFrame(raf); if (vis) { lastY = scrollY; raf = requestAnimationFrame(loop) } })
    io.observe(wrap.current!)
    const w = wrap.current!; const pe = () => (paused = true), pl = () => (paused = false)
    w.addEventListener('pointerenter', pe); w.addEventListener('pointerleave', pl)
    return () => { cancelAnimationFrame(raf); io.disconnect(); w.removeEventListener('pointerenter', pe); w.removeEventListener('pointerleave', pl) }
  }, [items.length])
  return <div ref={wrap} className="drift">
    {rows.map((row, k) => <div key={k} className="drift-row" ref={k === 0 ? r1 : r2} style={{ gap }}>
      {[...row, ...row].map((t, i) => <div key={i} className="drift-item" aria-hidden={i >= row.length}>{render(t, i % row.length + (k ? half : 0))}</div>)}
    </div>)}
  </div>
}
