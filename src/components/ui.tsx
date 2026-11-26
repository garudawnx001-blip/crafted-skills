import { useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { SITE, type Bundle, inr } from '../data/site'
import { LOGO_PATHS, LOGO_VB } from '../data/logo'
import { logOut, useStore } from '../lib/store'

const P = (d: string) => <path d={d} />
const icons: Record<string, ReactNode> = {
  arrow: P('M4 10h12M11 5l5 5-5 5'),
  home: <>{P('M3 11l9-7 9 7')}{P('M5 10v10h14V10')}{P('M10 20v-6h4v6')}</>,
  cap: <>{P('M2 9l10-5 10 5-10 5z')}{P('M6 11v5c3 2 9 2 12 0v-5')}</>,
  case: <><rect x="3" y="7" width="18" height="13" rx="2" />{P('M9 7V5h6v2M3 13h18')}</>,
  idea: <>{P('M9 18h6M10 21h4')}{P('M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z')}</>,
  pin: <>{P('M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z')}<circle cx="12" cy="9.5" r="2.6" /></>,
  lang: <>{P('M4 5h8M8 3v2M6 5c0 4 3 7 6 8M10 5c-1 4-4 7-7 8')}{P('M13 21l4-9 4 9M14.5 18h5')}</>,
  bulb: <>{P('M9 18h6M10 21h4')}{P('M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z')}</>,
  sprout: <>{P('M12 21v-8')}{P('M12 13c0-4 3-7 8-7 0 5-3 7-8 7z')}{P('M12 15c0-3-2-6-7-6 0 4 2 6 7 6z')}</>,
  user: <><circle cx="12" cy="8" r="4" />{P('M4 21c1-4 4-6 8-6s7 2 8 6')}</>,
  play: <>{P('M8 5v14l11-7z')}</>,
  rupee: <>{P('M6 4h12M6 9h12M9 4c5 0 7 2 7 5s-3 5-7 5H6l8 7')}</>,
  share: <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />{P('M8.6 13.5l6.8 4M15.4 6.5l-6.8 4')}</>,
  grid: <><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /></>,
  book: <>{P('M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z')}{P('M4 21a2 2 0 0 1 2-2h13')}</>,
  receipt: <>{P('M6 3h12v18l-3-2-3 2-3-2-3 2z')}{P('M9 8h6M9 12h6')}</>,
  award: <><circle cx="12" cy="9" r="6" />{P('M8.5 14L7 21l5-3 5 3-1.5-7')}</>,
  cog: <><circle cx="12" cy="12" r="3" />{P('M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z')}</>,
  link: <>{P('M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1')}{P('M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1')}</>,
  users: <><circle cx="9" cy="8" r="4" />{P('M2 21c1-4 4-6 7-6s6 2 7 6')}{P('M16 4a4 4 0 0 1 0 8M22 21c-.5-3-2-5-4-5.6')}</>,
  trophy: <>{P('M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z')}{P('M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3')}</>,
  wallet: <><rect x="3" y="6" width="18" height="14" rx="3" />{P('M3 10h18M16 15h2')}</>,
  logout: <>{P('M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h11')}</>,
  copy: <><rect x="8" y="8" width="12" height="12" rx="2" />{P('M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2')}</>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" />{P('M3 7l9 6 9-6')}</>,
  phone: P('M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2'),
  search: <><circle cx="11" cy="11" r="7" />{P('M20 20l-3.5-3.5')}</>,
  left: P('M15 5l-7 7 7 7'), right: P('M9 5l7 7-7 7'), check: P('M5 12l5 5 9-10'), lock: <><rect x="4" y="10" width="16" height="11" rx="2" />{P('M8 10V7a4 4 0 0 1 8 0v3')}</>,
}
export function Icon({ n, s = 20 }: { n: string; s?: number }) {
  return <svg viewBox="0 0 24 24" width={s} height={s} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icons[n]}</svg>
}
export const WaIcon = () => <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3zm0 23.7c-2 0-4-.5-5.7-1.6l-.4-.2-3.9 1 1-3.8-.3-.4A10.7 10.7 0 1 1 16 26.7zm5.9-8c-.3-.2-1.9-1-2.2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7 0a8.8 8.8 0 0 1-4.4-3.8c-.3-.6.3-.5 1-1.7.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6a1.2 1.2 0 0 0-.9.4 3.7 3.7 0 0 0-1.1 2.7 6.4 6.4 0 0 0 1.3 3.4 14.7 14.7 0 0 0 5.7 5c2.1.9 2.9 1 4 .8a3.4 3.4 0 0 0 2.2-1.6 2.8 2.8 0 0 0 .2-1.6c-.1-.2-.3-.3-.6-.5z" /></svg>
export const IgIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></svg>
export const FbIcon = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H7v4h3v8h4v-8h3l1-4h-4V8.5c0-.3.2-.5.5-.5z" /></svg>

export const waLink = (msg = 'Hi Crafted Skills, I would like to know more about your courses.') => `https://wa.me/${SITE.phoneRaw}?text=${encodeURIComponent(msg)}`

export function Mark({ className = 'bm' }: { className?: string }) {
  return <svg className={className} viewBox={LOGO_VB} aria-hidden="true">{LOGO_PATHS.map((p, i) => <path key={i} className={p.c} d={p.d} fillRule="evenodd" />)}</svg>
}
export function Brand({ id }: { id?: string }) {
  return <Link to="/" className="brand" id={id} aria-label="Crafted Skills home"><Mark /><b>Crafted <span>Skills</span></b></Link>
}

const REVEAL = '.rv:not(.in),.stg:not(.in),.sh:not(.in),.wipe:not(.in)'
export function useReveal() {
  useEffect(() => {
    if (!('IntersectionObserver' in window)) { const t = setInterval(() => document.querySelectorAll(REVEAL).forEach((e) => e.classList.add('in')), 300); return () => clearInterval(t) }
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }), { rootMargin: '0px 0px -12% 0px', threshold: 0.01 })
    const seen = new WeakSet<Element>()
    // Chrome 146+: plain section reveals run as native scroll-triggered CSS animations (off the main thread)
    const tt = typeof CSS !== 'undefined' && !!CSS.supports?.('timeline-trigger', '--t view() entry 20% exit 0%')
    if (tt) document.documentElement.classList.add('tt')
    const scan = () => document.querySelectorAll<HTMLElement>(tt ? REVEAL.replace('.rv:not(.in),', '') : REVEAL).forEach((el) => {
      if (seen.has(el)) return; seen.add(el)
      if (el.classList.contains('stg')) [...el.children].forEach((c, i) => (c as HTMLElement).style.setProperty('--i', String(Math.min(i, 8))))
      io.observe(el)
    })
    scan()
    let q = 0; const mo = new MutationObserver(() => { if (!q) q = requestAnimationFrame(() => { q = 0; scan() }) })
    mo.observe(document.body, { childList: true, subtree: true })
    return () => { io.disconnect(); mo.disconnect(); cancelAnimationFrame(q) }
  }, [])
}

const NAV = [['/courses', 'Courses'], ['/affiliate', 'Affiliate'], ['/about', 'About us'], ['/contact', 'Contact us']] as const

export function Header() {
  const { user } = useStore()
  const [scrolled, setScrolled] = useState(false)
  const [hide, setHide] = useState(false)
  const [open, setOpen] = useState(false)
  const [menu, setMenu] = useState(false)
  const loc = useLocation(); const nav = useNavigate()
  useEffect(() => { setOpen(false); setMenu(false) }, [loc.pathname])
  useEffect(() => {
    // Hidden while scrolling down; it returns only after a deliberate upward scroll (~70px),
    // so small finger jitters and momentum never bring it back. Always shown near the top.
    let last = window.scrollY, tick = false, up = 0, down = 0, hidden = false
    const on = () => { if (tick) return; tick = true; requestAnimationFrame(() => {
      const y = window.scrollY, d = y - last; last = y; tick = false
      setScrolled(y > 10)
      if (y < 120) { up = down = 0; if (hidden) { hidden = false; setHide(false) } return }
      if (d > 0) { down += d; up = 0; if (!hidden && down > 40) { hidden = true; setHide(true) } }
      else if (d < 0) { up -= d; down = 0; if (hidden && up > 70) { hidden = false; setHide(false) } } }) }
    on(); window.addEventListener('scroll', on, { passive: true }); return () => window.removeEventListener('scroll', on)
  }, [])
  useEffect(() => { document.documentElement.style.overflow = open ? 'hidden' : ''; return () => { document.documentElement.style.overflow = '' } }, [open])
  const dash = user?.roles.includes('affiliate') ? '/partner' : '/dashboard'
  return <>
    <header className={`hdr ${scrolled || open ? 'scrolled' : ''} ${hide && !open ? 'hide' : ''}`}>
      <div className="wrap hdr-in">
        <Brand id="hdr-brand" />
        <nav className="nav" aria-label="Main">{NAV.map(([to, l]) => <NavLink key={to} to={to} className={({ isActive }) => isActive ? 'on' : ''}>{l}</NavLink>)}</nav>
        <div className="acts">
          {user ? <div className="menu">
            <button className="avatar" onClick={() => setMenu(!menu)} aria-label="Account menu" aria-expanded={menu}>{user.name.slice(0, 1).toUpperCase()}</button>
            {menu && <div className="drop" role="menu">
              <div className="who"><b>{user.name}</b><small>{user.email}</small></div>
              <Link to="/dashboard">My learning</Link>
              {user.roles.includes('affiliate') && <Link to="/partner">Affiliate dashboard</Link>}
              <Link to="/dashboard/profile">Profile</Link>
              <button onClick={() => { logOut(); nav('/') }}>Log out</button>
            </div>}
          </div> : <>
            <Link to="/login" className="btn btn-g btn-sm hide-m">Log in</Link>
            <Link to="/signup" className="btn btn-p btn-sm hide-m">Sign up</Link>
          </>}
          {user && <Link to={dash} className="btn btn-p btn-sm hide-m">Dashboard</Link>}
          <button className={`burger ${open ? 'x' : ''}`} onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}><i /></button>
        </div>
      </div>
    </header>
    <div className={`mnav ${open ? 'open' : ''}`} aria-hidden={!open}>
      {[['/', 'Home'], ...NAV].map(([to, l], i) => <Link key={to} className="m" to={to} style={{ transitionDelay: open ? `${60 + i * 45}ms` : '0ms' }} tabIndex={open ? 0 : -1}>{l}</Link>)}
      <div className="acts">{user ? <><Link className="btn btn-g" to={dash} tabIndex={open ? 0 : -1}>Dashboard</Link><button className="btn btn-p" onClick={() => { logOut(); nav('/') }} tabIndex={open ? 0 : -1}>Log out</button></> : <><Link className="btn btn-g" to="/login" tabIndex={open ? 0 : -1}>Log in</Link><Link className="btn btn-p" to="/signup" tabIndex={open ? 0 : -1}>Sign up</Link></>}</div>
    </div>
  </>
}

export function Footer() {
  return <footer className="ftr">
    <div className="wrap">
      <div className="ftr-g">
        <div>
          <Brand />
          <p className="muted" style={{ marginTop: 16, maxWidth: 320 }}>Crafted Skills – Learn in Kannada. Grow with Skills. Build Your Dreams from Home.</p>
          <div className="soc"><a href={SITE.instagram} target="_blank" rel="noopener" aria-label="Instagram"><IgIcon /></a><a href={SITE.facebook} target="_blank" rel="noopener" aria-label="Facebook"><FbIcon /></a><a href={waLink()} target="_blank" rel="noopener" aria-label="WhatsApp" style={{ color: '#25d366' }}><svg viewBox="0 0 32 32" fill="currentColor" width="19" height="19"><path d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3z" /></svg></a></div>
        </div>
        <div><h4>Platform</h4><ul><li><Link to="/courses">Course bundles</Link></li><li><Link to="/affiliate">Affiliate program</Link></li><li><Link to="/dashboard">My learning</Link></li><li><Link to="/partner">Affiliate dashboard</Link></li></ul></div>
        <div><h4>Company</h4><ul><li><Link to="/about">About us</Link></li><li><Link to="/contact">Contact us</Link></li><li><Link to="/terms">Terms and Conditions</Link></li></ul></div>
        <div><h4>Contact</h4><ul><li><a href={`mailto:${SITE.email}`}>{SITE.email}</a></li><li><a href={`tel:+${SITE.phoneRaw}`}>{SITE.phone}</a></li><li><a href={waLink()} target="_blank" rel="noopener">WhatsApp us</a></li></ul></div>
      </div>
      <div className="bot"><span>© {new Date().getFullYear()} Crafted Skills. All rights reserved.</span><span>Crafted Skills, also written CraftedSkills · Karnataka, India</span></div>
    </div>
  </footer>
}

export function WhatsAppFab() { return <a className="wa" href={waLink()} target="_blank" rel="noopener" aria-label="Chat on WhatsApp"><WaIcon /></a> }

export function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 2200); return () => clearTimeout(t) }, [msg, onDone])
  return <div className="toast" role="status">{msg}</div>
}

export function BundleCard({ b, eager }: { b: Bundle; eager?: boolean }) {
  const live = b.courses.filter((c) => c.status === 'Available now').length
  return <article className="bcard" data-slug={b.slug}>
    <Link to={`/courses/${b.slug}`} className="im" tabIndex={-1} aria-hidden="true"><img src={b.image} alt="" loading={eager ? 'eager' : 'lazy'} decoding="async" width="1200" height="391" draggable={false} /></Link>
    <div className="bd">
      <h3><Link to={`/courses/${b.slug}`}>{b.name}</Link></h3>
      <ul>{b.courses.map((c) => <li key={c.name}><span>{c.name}</span><span className={`st ${c.status === 'Available now' ? 'live' : 'soon'}`}>{c.status}</span></li>)}</ul>
      <div className="ft"><div><div className="price">{inr(b.price)}</div><div className="dim" style={{ fontSize: 13 }}>{b.courses.length} courses · {live ? `${live} available now` : 'launching soon'}</div></div>
        <Link className="btn btn-p btn-sm" to={`/courses/${b.slug}`}>View bundle</Link>
      </div>
    </div>
  </article>
}

export function PasswordInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false)
  return <div className="pw"><input {...props} type={show ? 'text' : 'password'} className="input" /><button type="button" className="eye" onClick={() => setShow(!show)}>{show ? 'Hide' : 'Show'}</button></div>
}

export function Seo({ title, desc }: { title: string; desc?: string }) {
  useEffect(() => {
    document.title = title
    if (desc) document.querySelector('meta[name=description]')?.setAttribute('content', desc)
  }, [title, desc])
  return null
}
