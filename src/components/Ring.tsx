import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BUNDLES } from '../data/site'
import { BundleCard, Icon } from './ui'

// Smooth 3D bundle ring: one transform per frame, spring snapping, drag with inertia.
export default function Ring() {
  const N = BUNDLES.length, A = 360 / N
  const host = useRef<HTMLDivElement>(null), spin = useRef<HTMLDivElement>(null)
  const scr = useRef(0)
  const st = useRef({ rot: 0, target: 0, vel: 0, drag: false, x0: 0, r0: 0, moved: 0, lastX: 0, lastT: 0, user: false })
  const [front, setFront] = useState(0)
  const [dims, setDims] = useState({ cw: 300, ch: 410, r: 480 })
  const nav = useNavigate()

  useEffect(() => {
    const size = () => {
      const w = host.current?.clientWidth || 1000
      const cw = w < 520 ? Math.min(260, w * 0.68) : 300
      const ch = cw < 280 ? 330 : 350
      const r = Math.round(cw / 2 / Math.tan(Math.PI / N) + (w < 520 ? 10 : 40))
      setDims({ cw, ch, r })
    }
    size(); const ro = new ResizeObserver(size); if (host.current) ro.observe(host.current); return () => ro.disconnect()
  }, [N])

  useEffect(() => {
    const s = st.current; let raf = 0
    const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches
    const cards = () => spin.current?.querySelectorAll<HTMLElement>('.slot') || []
    const frame = () => {
      if (!s.drag) {
        const d = s.target - s.rot
        s.vel = s.vel * 0.82 + d * 0.06
        s.rot += reduce ? d : s.vel
        if (Math.abs(d) < 0.01 && Math.abs(s.vel) < 0.01) s.rot = s.target
      }
      // scroll turns the ring by up to ±1 bundle as the section passes
      if (host.current && !reduce) { const r = host.current.getBoundingClientRect(); const c = (innerHeight / 2 - (r.top + r.height / 2)) / innerHeight; const t = Math.max(-1, Math.min(1, c)) * -A * 1.2; scr.current += (t - scr.current) * 0.12 }
      const shown = s.rot + scr.current
      if (spin.current) spin.current.style.transform = `translateZ(${-dims.r}px) rotateY(${shown}deg)`
      cards().forEach((el, i) => {
        const ang = ((i * A + shown) % 360 + 540) % 360 - 180
        const f = Math.cos((ang * Math.PI) / 180)
        el.style.opacity = String(Math.max(0, 0.25 + f * 0.75))
        el.style.filter = f > 0.97 ? 'none' : `brightness(${0.55 + f * 0.4})`
      })
      const fi = ((Math.round(-(s.drag ? shown : s.target + scr.current) / A) % N) + N) % N
      setFront((p) => (p === fi ? p : fi))
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    const auto = setInterval(() => { if (!s.user && !document.hidden && !reduce) s.target -= A }, 4200)
    return () => { cancelAnimationFrame(raf); clearInterval(auto) }
  }, [A, N, dims.r])

  const go = (dir: number) => { const s = st.current; s.user = true; s.target = Math.round(s.target / A) * A - dir * A }
  const down = (e: React.PointerEvent) => {
    const s = st.current; s.drag = true; s.user = true; s.x0 = e.clientX; s.r0 = s.rot; s.moved = 0; s.lastX = e.clientX; s.lastT = performance.now(); s.vel = 0
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const move = (e: React.PointerEvent) => {
    const s = st.current; if (!s.drag) return
    const dx = e.clientX - s.x0; s.moved = Math.max(s.moved, Math.abs(dx))
    s.rot = s.r0 + dx * 0.32
    const now = performance.now(); s.vel = ((e.clientX - s.lastX) * 0.32) / Math.max(1, now - s.lastT) * 16; s.lastX = e.clientX; s.lastT = now
  }
  const up = (e: React.PointerEvent) => {
    const s = st.current; if (!s.drag) return; s.drag = false
    if (s.moved < 6) {
      const el = (document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null)?.closest<HTMLElement>('.slot')
      if (el) { const i = +el.dataset.i!; if (i === front) { nav(`/courses/${BUNDLES[i].slug}`); return } s.target = Math.round((s.rot) / 360) * 360 - i * A - Math.round(scr.current / A) * A; const opts = [s.target, s.target + 360, s.target - 360]; s.target = opts.sort((a, b) => Math.abs(a - s.rot) - Math.abs(b - s.rot))[0] }
      s.vel = 0; return
    }
    s.target = Math.round((s.rot + s.vel * 6) / A) * A
  }

  return <div>
    <div ref={host} className="ring3d" style={{ ['--cw' as string]: dims.cw + 'px', ['--ch' as string]: dims.ch + 'px' }}
      onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
      tabIndex={0} role="listbox" aria-label="Course bundles, use arrow keys to browse"
      onKeyDown={(e) => { if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); if (e.key === 'Enter') nav(`/courses/${BUNDLES[front].slug}`) }}>
      <div ref={spin} className="spinner">
        {BUNDLES.map((b, i) => <div key={b.slug} className="slot" data-i={i} role="option" aria-selected={i === front}
          style={{ position: 'absolute', inset: 0, transform: `rotateY(${i * A}deg) translateZ(${dims.r}px)`, backfaceVisibility: 'hidden' }}>
          <BundleCard b={b} front={i === front} onOpen={() => {}} eager />
        </div>)}
      </div>
    </div>
    <div className="ring-ui">
      <button onClick={() => go(-1)} aria-label="Previous bundle"><Icon n="left" /></button>
      <span className="hint">Drag to spin · Tap a bundle</span>
      <button onClick={() => go(1)} aria-label="Next bundle"><Icon n="right" /></button>
    </div>
  </div>
}
