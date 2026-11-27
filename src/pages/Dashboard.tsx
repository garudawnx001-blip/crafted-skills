import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { Link, Navigate, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { BUNDLES, SITE, inr, type Bundle } from '../data/site'
import { Brand, Icon, Mark, PasswordInput, Seo, Toast, waLink } from '../components/ui'
import { Count } from '../components/motion'
import {
  addRole, affiliateStats, changePassword, deleteCourse, getProduct, leaderboard, logOut, requestRefund, resolveRefund,
  saveCourse, setCourseStatus, startCourse, completeCourse, saveNote, updateProfile, useStore, type SellerCourse, type User,
} from '../lib/store'

const fmtDate = (t: number) => new Date(t).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
const fmtTime = (t: number) => new Date(t).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
const roleName = (r: string) => ({ admin: 'Founder', affiliate: 'Affiliate', learner: 'Learner' } as Record<string, string>)[r] || r
const siteUrl = () => location.origin + location.pathname.replace(/index\.html$/, '')
const refLink = (code: string, slug?: string) => `${siteUrl()}#/${slug ? 'courses/' + slug : ''}?ref=${code}`

type Item = { to: string; label: string; icon: string; end?: boolean }
function navFor(u: User): { title: string; items: Item[] }[] {
  const g = [{ title: 'Learning', items: [
    { to: '/dashboard', label: 'Overview', icon: 'grid', end: true }, { to: '/dashboard/learning', label: 'My learning', icon: 'book' },
    { to: '/dashboard/purchases', label: 'Purchases', icon: 'receipt' }, { to: '/dashboard/certificates', label: 'Certificates', icon: 'award' },
    { to: '/courses', label: 'Browse bundles', icon: 'cap' }] }]
  if (u.roles.includes('affiliate')) g.push({ title: 'Affiliate', items: [
    { to: '/partner', label: 'Earnings', icon: 'rupee', end: true }, { to: '/partner/links', label: 'My links', icon: 'link' },
    { to: '/partner/referrals', label: 'Referrals', icon: 'users' }, { to: '/partner/leaderboard', label: 'Leaderboard', icon: 'trophy' }, { to: '/partner/payouts', label: 'Payouts', icon: 'wallet' }] })
  if (u.roles.includes('admin')) g.push({ title: 'Manage', items: [
    { to: '/manage', label: 'Business', icon: 'grid', end: true }, { to: '/manage/orders', label: 'Orders & refunds', icon: 'receipt' },
    { to: '/manage/people', label: 'Students & affiliates', icon: 'users' }, { to: '/manage/courses', label: 'Courses', icon: 'play' }, { to: '/manage/courses/new', label: 'Add a course', icon: 'idea' }, { to: '/manage/messages', label: 'Messages', icon: 'mail' }] })
  g.push({ title: 'Account', items: [{ to: '/dashboard/profile', label: 'Profile & security', icon: 'cog' }] })
  return g
}

function Shell({ user, children }: { user: User; children: ReactNode }) {
  const nav = useNavigate(); const groups = navFor(user); const loc = useLocation()
  // phone tab strip: slide so the section you're on is always in view
  useEffect(() => { const strip = document.querySelector<HTMLElement>('.app-tabs'), a = strip?.querySelector<HTMLElement>('a.on')
    if (!strip || !a || strip.scrollWidth <= strip.clientWidth) return
    strip.scrollTo({ left: a.offsetLeft - (strip.clientWidth - a.offsetWidth) / 2, behavior: 'smooth' }) }, [loc.pathname])
  return <div className="app">
    <aside className="side" aria-label="Dashboard">
      <Brand />
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {groups.map((g) => <div key={g.title}><div className="sl">{g.title}</div>{g.items.map((i) => <NavLink key={i.to} to={i.to} end={i.end} className={({ isActive }) => isActive ? 'on' : ''}><Icon n={i.icon} />{i.label}</NavLink>)}</div>)}
        {!user.roles.includes('affiliate') && <><div className="sl">Earn</div><button className="it" onClick={() => { addRole('affiliate'); nav('/partner?welcome=1') }}><Icon n="rupee" />Become an affiliate</button></>}
      </div>
      <div className="me"><span className="avatar">{user.name[0].toUpperCase()}</span><div style={{ minWidth: 0 }}><b>{user.name}</b><small>{user.roles.filter((r) => r !== 'learner').map(roleName).join(' · ') || 'Learner'}</small></div>
        <button aria-label="Log out" style={{ marginLeft: 'auto', color: 'var(--muted)' }} onClick={() => { logOut(); nav('/') }}><Icon n="logout" /></button></div>
    </aside>
    <div style={{ minWidth: 0 }}>
      <nav className="app-tabs" aria-label="Dashboard sections">
        <Link to="/" aria-label="Home" style={{ padding: '4px 8px', border: 0 }}><Mark className="bm" /></Link>
        {groups.flatMap((g) => g.items).filter((i) => i.to !== '/courses').map((i) => <NavLink key={i.to} to={i.to} end={i.end} className={({ isActive }) => isActive ? 'on' : ''}>{i.label}</NavLink>)}
        <a onClick={() => { logOut(); nav('/') }} role="button" tabIndex={0}>Log out</a>
      </nav>
      <main className="main">
        <div className="preview-note">Preview mode · accounts, orders and links are saved on this device until the Crafted Skills database is connected. Payments are in test mode.</div>
        {children}
      </main>
    </div>
  </div>
}

const Top = ({ title, sub, right }: { title: ReactNode; sub?: ReactNode; right?: ReactNode }) => <div className="topbar"><div><h1>{title}</h1>{sub && <p>{sub}</p>}</div>{right}</div>
const Empty = ({ icon, title, text, children }: { icon: string; title: string; text: string; children?: ReactNode }) => <div className="empty"><div className="ei"><Icon n={icon} /></div><h3>{title}</h3><p>{text}</p>{children && <div style={{ marginTop: 18, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>{children}</div>}</div>
const Kpi = ({ l, v, e }: { l: string; v: ReactNode; e?: ReactNode }) => <div className="kpi"><small>{l}</small><b>{typeof v === 'number' ? <Count to={v} /> : v}</b>{e && <em>{e}</em>}</div>

function useMine(u: User) {
  const { db } = useStore()
  return useMemo(() => {
    const orders = db.orders.filter((o) => o.userId === u.id)
    const owned = orders.filter((o) => o.status !== 'refunded').map((o) => getProduct(o.bundle)).filter(Boolean) as Bundle[]
    return { orders, owned }
  }, [db.orders, u.id, db])
}

function progressOf(u: User, b: Bundle) { const n = b.courses.length; const s = b.courses.reduce((a, c) => a + (u.done?.some((d) => d.name === c.name) ? 1 : u.started?.includes(c.name) ? .4 : 0), 0); return Math.round((s / n) * 100) }

/* ---------------- learner ---------------- */
function Overview({ u }: { u: User }) {
  const { owned, orders } = useMine(u); const [q] = useSearchParams()
  const live = owned.flatMap((b) => b.courses.filter((c) => c.status === 'Available now'))
  return <>
    <div className="hello"><Mark className="bm hello-mark" />
      <div><span className="hello-k kn" lang="kn">{SITE.kannadaLine}</span><h1>{q.get('welcome') ? 'Welcome' : 'Hi'}, {u.name.split(' ')[0]} 👋</h1>
        <p>{owned.length ? `You have ${owned.length} bundle${owned.length > 1 ? 's' : ''} and ${live.length} course${live.length === 1 ? '' : 's'} ready to learn.` : 'Your learning space is ready. Pick a bundle to unlock your first lessons.'}</p></div>
      <Link to={owned.length ? '/dashboard/learning' : '/courses'} className="btn btn-w btn-sm">{owned.length ? 'Continue learning' : 'Browse bundles'}</Link></div>
    <div className="kpis" style={{ marginBottom: 18 }}>
      <Kpi l="My bundles" v={owned.length} /><Kpi l="Courses unlocked" v={owned.reduce((s, b) => s + b.courses.length, 0)} e={`${live.length} available now`} />
      <Kpi l="Started" v={u.started?.length || 0} /><Kpi l="Total invested" v={inr(orders.filter((o) => o.status !== 'refunded').reduce((s, o) => s + o.amount, 0))} />
    </div>
    <div className="g2" style={{ gap: 18, marginBottom: 18 }}>
      <div className="panel"><h2>This week</h2><p className="muted" style={{ fontSize: 14.5 }}>Learn a little every day. Days you learn light up.</p>
        <div className="week">{Array.from({ length: 7 }, (_, i) => { const dt = new Date(); dt.setDate(dt.getDate() - dt.getDay() + i); const k = dt.toISOString().slice(0, 10); return <span key={i} className={`${u.days?.includes(k) ? 'on' : ''} ${i === new Date().getDay() ? 'today' : ''}`}>{'SMTWTFS'[i]}</span> })}</div></div>
      <div className="panel" style={{ display: 'flex', gap: 18, alignItems: 'center' }}>{(() => { const total = owned.reduce((a, b) => a + b.courses.filter((c) => c.status === 'Available now').length, 0); const dn = (u.done || []).length; const v = total ? Math.round((dn / total) * 100) : 0
        return <><div className="pring" style={{ ['--pv' as string]: v, background: 'conic-gradient(var(--indigo) calc(var(--pv) * 1%), var(--lav) 0)' }}><b>{v}%</b></div><div><h2 style={{ marginBottom: 4 }}>Overall progress</h2><p className="muted" style={{ fontSize: 14.5 }}>{dn} of {total} available courses completed{dn ? ` · ${dn} certificate${dn > 1 ? 's' : ''} earned` : ''}.</p></div></> })()}</div>
    </div>
    {owned.length ? <div className="panel"><h2>Continue learning</h2><div style={{ display: 'grid', gap: 12 }}>{owned.map((b) => <BundleRow key={b.slug} u={u} b={b} />)}</div></div>
      : <div className="panel"><Empty icon="book" title="Your learning space is ready" text="Choose a course bundle to unlock your first Kannada lessons. They'll appear here right after payment."><Link to="/courses" className="btn btn-p">Explore Our Courses</Link><a className="btn btn-g" href={waLink('Hi Crafted Skills, please help me choose a bundle.')} target="_blank" rel="noopener">Ask which bundle fits</a></Empty></div>}
    {(u.roles.includes('admin') || u.roles.includes('affiliate')) && <div className="g2 jump" style={{ gap: 18, marginTop: 18 }}>
      {u.roles.includes('admin') && <div className="panel jump-p"><div><h2 style={{ marginBottom: 4 }}>Your business</h2><p className="muted">Orders, students, affiliates and your courses.</p></div>
        <div className="jump-a"><Link to="/manage" className="btn btn-p btn-sm">Open business</Link><Link to="/manage/courses/new" className="btn btn-g btn-sm">Add a course</Link></div></div>}
      {u.roles.includes('affiliate') && <div className="panel jump-p"><div><h2 style={{ marginBottom: 4 }}>Affiliate earnings</h2><p className="muted">Your links, clicks, sales and payouts.</p></div>
        <div className="jump-a"><Link to="/partner" className="btn btn-p btn-sm">Open earnings</Link><Link to="/partner/links" className="btn btn-g btn-sm">My links</Link></div></div>}
    </div>}
    {!u.roles.includes('affiliate') && <div className="panel" style={{ marginTop: 18, display: 'flex', gap: 18, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
      <div><h2 style={{ marginBottom: 4 }}>Recommend &amp; earn</h2><p className="muted">Recommend Crafted Skills and earn exciting commissions for every successful signup!</p></div>
      <AffBtn /></div>}
  </>
}
function AffBtn() { const nav = useNavigate(); return <button className="btn btn-p" onClick={() => { addRole('affiliate'); nav('/partner?welcome=1') }}>Switch on affiliate mode</button> }

function BundleRow({ u, b }: { u: User; b: Bundle }) {
  const p = progressOf(u, b)
  return <div className="lrow"><img src={b.image} alt="" loading="lazy" />
    <div><h3>{b.name}</h3><div className="chips">{b.courses.map((c) => <span key={c.name} className={`chip ${c.status === 'Available now' ? 'live' : ''}`}>{c.name}{c.status !== 'Available now' ? ' · soon' : ''}</span>)}</div>
      <div className="prog" aria-label={`${p}% started`}><i style={{ width: Math.max(p, 2) + '%' }} /></div></div>
    <Link to={`/dashboard/learn/${b.slug}`} className="btn btn-p btn-sm">{p ? 'Continue' : 'Start'}</Link></div>
}

function Learning({ u }: { u: User }) {
  const { owned } = useMine(u); const [q] = useSearchParams()
  return <>
    <Top title="My learning" sub="All your bundles and courses in one place." />
    {q.get('new') && <div className="alert ok" style={{ marginBottom: 16 }}>Payment successful — {getProduct(q.get('new')!)?.name} is unlocked. Enjoy learning!</div>}
    {owned.length ? <div style={{ display: 'grid', gap: 12 }}>{owned.map((b) => <BundleRow key={b.slug} u={u} b={b} />)}</div>
      : <div className="panel"><Empty icon="book" title="No bundles yet" text="When you enroll in a bundle, its courses appear here."><Link to="/courses" className="btn btn-p">Explore Our Courses</Link></Empty></div>}
  </>
}

function Player({ u, slug }: { u: User; slug: string }) {
  const { owned } = useMine(u); const b = owned.find((x) => x.slug === slug)
  const [cur, setCur] = useState(() => b?.courses.find((c) => c.status === 'Available now')?.name || b?.courses[0]?.name || '')
  const [tab, setTab] = useState<'overview' | 'notes' | 'help'>('overview')
  const [note, setNote] = useState(u.notes?.[cur] || ''); const [toast, setToast] = useState('')
  useEffect(() => { setNote(u.notes?.[cur] || '') }, [cur]) // eslint-disable-line
  if (!b) return <Navigate to="/dashboard/learning" replace />
  const c = b.courses.find((x) => x.name === cur)!
  const isLive = c.status === 'Available now'
  const done = (n: string) => !!u.done?.some((d) => d.name === n)
  const p = progressOf(u, b)
  return <>
    <Top title={b.name} sub={<Link to="/dashboard/learning" className="link">← My learning</Link>} right={<div style={{ display: 'flex', gap: 12, alignItems: 'center' }}><div className="pring" style={{ width: 52, height: 52, ['--pv' as string]: p, background: 'conic-gradient(var(--indigo) calc(var(--pv) * 1%), var(--lav) 0)' }}><b style={{ width: 40, height: 40, fontSize: 12 }}>{p}%</b></div><span className="muted" style={{ fontSize: 14 }}>bundle progress</span></div>} />
    <div className="player">
      <div>
        <div className="screen"><div><Mark /><h3 className="h3">{c.name}</h3>
          <p style={{ maxWidth: 440, margin: '10px auto 0' }}>{isLive ? 'Lesson videos for this course will play here as soon as Crafted Skills uploads them.' : 'This course is coming soon. It unlocks here automatically on release.'}</p>
          {isLive && <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 18, flexWrap: 'wrap' }}>
            {!u.started?.includes(c.name) && <button className="btn btn-w btn-sm" onClick={() => startCourse(c.name)}>Start course</button>}
            <button className="btn btn-o btn-sm" disabled={done(c.name)} onClick={() => { completeCourse(c.name); setToast('Course completed — certificate unlocked 🎉') }}>{done(c.name) ? 'Completed ✓' : 'Mark as complete'}</button></div>}</div></div>
        <div className="ptabs" role="tablist">{([['overview', 'Overview'], ['notes', 'My notes'], ['help', 'Ask mentor']] as const).map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>)}</div>
        {tab === 'overview' && <div><h2 className="h3" style={{ fontSize: 24 }}>{c.name}</h2><p className="muted" style={{ marginTop: 8 }}>Learn {c.name} in Kannada — beginner-friendly and practical, at your own pace. Part of {b.name}.</p>
          <div className="chips" style={{ marginTop: 14 }}><span className="chip">Kannada</span><span className="chip">Beginner-Friendly</span><span className={`chip ${isLive ? 'live' : ''}`}>{c.status}</span></div></div>}
        {tab === 'notes' && <div className="form"><textarea className="input" placeholder={`Write notes for ${c.name}…`} value={note} onChange={(e) => setNote(e.target.value)} /><button className="btn btn-p btn-sm" style={{ justifySelf: 'start' }} onClick={() => { saveNote(c.name, note); setToast('Notes saved') }}>Save notes</button></div>}
        {tab === 'help' && <div className="panel"><p className="muted">Stuck on something in {c.name}? Message your mentors Vaishnavi and Rachana on WhatsApp — in Kannada or English.</p><a className="btn btn-p btn-sm" style={{ marginTop: 14 }} href={waLink(`Hi, I'm ${u.name}. I have a question about ${c.name} (${b.name}).`)} target="_blank" rel="noopener">Ask on WhatsApp</a></div>}
      </div>
      <div className="panel" style={{ alignSelf: 'start' }}><h2>Course content</h2>
        <div style={{ display: 'grid', gap: 8 }}>{b.courses.map((x, i) => <button key={x.name} className={`lesson ${x.name === cur ? 'on' : ''}`} onClick={() => setCur(x.name)}>
          <span className={`n ${done(x.name) ? 'done' : ''}`}>{done(x.name) ? '✓' : i + 1}</span>
          <span style={{ flex: 1 }}><b style={{ display: 'block', fontSize: 14.5, color: 'var(--ink)' }}>{x.name}</b><span className={`st ${x.status === 'Available now' ? 'live' : 'soon'}`} style={{ display: 'inline-block', marginTop: 4 }}>{x.status}</span></span></button>)}</div>
      </div>
    </div>
    {toast && <Toast msg={toast} onDone={() => setToast('')} />}
  </>
}

function Purchases({ u }: { u: User }) {
  const { orders } = useMine(u); const [rec, setRec] = useState<string | null>(null); const [toast, setToast] = useState('')
  const within24 = (t: number) => Date.now() - t < 24 * 3600e3
  const o = orders.find((x) => x.id === rec)
  return <>
    <Top title="Purchases" sub="Receipts and refund requests." />
    {orders.length ? <div className="panel tscroll"><table className="table"><thead><tr><th>Order</th><th>Bundle</th><th>Date</th><th>Amount</th><th>Status</th><th /></tr></thead><tbody>
      {[...orders].reverse().map((x) => <tr key={x.id}><td><b>{x.id}</b></td><td>{getProduct(x.bundle)?.name}</td><td>{fmtDate(x.createdAt)}</td><td><b>{inr(x.amount)}</b></td>
        <td><span className={`badge ${x.status === 'paid' ? 'ok' : 'warn'}`}>{x.status === 'paid' ? 'Paid' : x.status === 'refunded' ? 'Refunded' : 'Refund requested'}</span></td>
        <td style={{ whiteSpace: 'nowrap', textAlign: 'right' }}><button className="link" onClick={() => setRec(x.id)}>Receipt</button>
          {x.status === 'paid' && within24(x.createdAt) && <button className="link" style={{ marginLeft: 14 }} onClick={() => { requestRefund(x.id); setToast('Refund request sent to Crafted Skills') }}>Request refund</button>}</td></tr>)}
    </tbody></table></div> : <div className="panel"><Empty icon="receipt" title="No purchases yet" text="Your receipts will appear here."><Link to="/courses" className="btn btn-p">Explore Our Courses</Link></Empty></div>}
    {o && <div className="pay-veil" onClick={(e) => e.target === e.currentTarget && setRec(null)}><div className="pay" style={{ padding: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}><Mark className="bm" /><div><b style={{ fontSize: 18 }}>Crafted Skills</b><div style={{ color: '#6b5e86', fontSize: 13 }}>Payment receipt · test mode</div></div></div>
      {[['Order', o.id], ['Bundle', getProduct(o.bundle)?.name], ['Billed to', `${u.name} · ${u.email}`], ['Date', fmtTime(o.createdAt)], ['Method', o.method], ['Payment ID', o.paymentId], ['Amount', inr(o.amount)]].map(([k, v]) =>
        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 14, padding: '9px 0', borderBottom: '1px solid #eee', fontSize: 14.5 }}><span style={{ color: '#6b5e86' }}>{k}</span><b style={{ textAlign: 'right' }}>{v}</b></div>)}
      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}><button className="btn btn-p" style={{ flex: 1 }} onClick={() => { try { window.print() } catch { /* blocked in preview frame */ } }}>Print / save PDF</button><button className="btn" style={{ color: '#5a17c4' }} onClick={() => setRec(null)}>Close</button></div>
    </div></div>}
    {toast && <Toast msg={toast} onDone={() => setToast('')} />}
  </>
}

function Certificates({ u }: { u: User }) {
  const { owned } = useMine(u); const list = u.done || []
  return <><Top title="Certificates" sub="Earned when you complete a course." />
    {list.length ? <div className="g2" style={{ gap: 18 }}>{list.map((d) => <div key={d.name} className="panel">
      <div className="cert"><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Mark /><b style={{ fontFamily: 'var(--display)', fontWeight: 400, fontSize: 18, color: 'var(--indigo)' }}>Crafted Skills</b></div>
        <div><div className="dim" style={{ fontSize: 12, letterSpacing: '.16em', textTransform: 'uppercase' }}>Certificate of completion</div><h4>{u.name}</h4><div className="muted" style={{ fontSize: 14 }}>has completed <b style={{ color: 'var(--ink)' }}>{d.name}</b></div></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)' }}><span>{fmtDate(d.at)}</span><span>Vaishnavi · Rachana</span></div></div>
      <a className="btn btn-g btn-sm" style={{ marginTop: 14 }} target="_blank" rel="noopener" href={`https://wa.me/?text=${encodeURIComponent(`I completed ${d.name} with Crafted Skills 🎉`)}`}>Share on WhatsApp</a>
    </div>)}</div>
      : <div className="panel"><Empty icon="award" title="No certificates yet" text={owned.length ? 'Open a course and mark it complete — your Crafted Skills certificate appears here, ready to share.' : 'Enroll in a bundle and complete a course to earn your first certificate.'}>{owned.length ? <Link to="/dashboard/learning" className="btn btn-p">Go to my learning</Link> : <Link to="/courses" className="btn btn-p">Explore Our Courses</Link>}</Empty></div>}</>
}

function Profile({ u }: { u: User }) {
  const [f, setF] = useState({ name: u.name, phone: u.phone }); const [pw, setPw] = useState({ old: '', nw: '' })
  const [toast, setToast] = useState(''); const [err, setErr] = useState('')
  const save = (e: FormEvent) => { e.preventDefault(); if (f.name.trim().length < 2) return setErr('Please enter your name.'); updateProfile({ name: f.name.trim(), phone: f.phone.trim() }); setErr(''); setToast('Profile saved') }
  const savePw = async (e: FormEvent) => { e.preventDefault(); setErr(''); if (pw.nw.length < 8) return setErr('New password needs at least 8 characters.'); try { await changePassword(pw.old, pw.nw); setPw({ old: '', nw: '' }); setToast('Password changed') } catch (x) { setErr((x as Error).message) } }
  return <><Top title="Profile & security" sub={u.email} />
    {err && <div className="alert bad" style={{ marginBottom: 14 }}>{err}</div>}
    <div className="g2">
      <form className="panel form" onSubmit={save}><h2>Your details</h2>
        <div className="field"><label htmlFor="pn">Full name</label><input id="pn" className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
        <div className="field"><label htmlFor="pp">Mobile (WhatsApp)</label><input id="pp" className="input" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div>
        <div className="field"><label>Email</label><input className="input" value={u.email} readOnly /></div>
        <button className="btn btn-p">Save changes</button></form>
      <form className="panel form" onSubmit={savePw}><h2>Change password</h2>
        <div className="field"><label htmlFor="po">Current password</label><PasswordInput id="po" value={pw.old} onChange={(e) => setPw({ ...pw, old: e.target.value })} autoComplete="current-password" /></div>
        <div className="field"><label htmlFor="pw2">New password</label><PasswordInput id="pw2" value={pw.nw} onChange={(e) => setPw({ ...pw, nw: e.target.value })} autoComplete="new-password" /></div>
        <button className="btn btn-g">Update password</button>
        <div style={{ borderTop: '1px solid var(--line)', paddingTop: 16, marginTop: 6 }}><h2 style={{ marginBottom: 6 }}>Roles</h2><p className="muted" style={{ marginBottom: 12 }}>One account for learning, earning and teaching.</p>
          <div className="chips">{u.roles.map((r) => <span className="chip live" key={r}>{roleName(r)}</span>)}</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>{!u.roles.includes('affiliate') && <button type="button" className="btn btn-g btn-sm" onClick={() => { addRole('affiliate'); setToast('Affiliate mode on') }}>Add affiliate</button>}</div></div>
      </form>
    </div>
    {toast && <Toast msg={toast} onDone={() => setToast('')} />}</>
}

/* ---------------- affiliate ---------------- */
function Bars({ data }: { data: { a: number; b: number; l: string }[] }) {
  const max = Math.max(1, ...data.map((d) => d.a))
  return <svg viewBox={`0 0 ${data.length * 20} 110`} preserveAspectRatio="none" role="img" aria-label="Clicks and sales for the last 14 days">
    {data.map((d, i) => <g key={i}><rect x={i * 20 + 3} y={100 - (d.a / max) * 92} width="8" height={Math.max(1.5, (d.a / max) * 92)} rx="2" fill="#320182" /><rect x={i * 20 + 12} y={100 - (d.b / max) * 92} width="5" height={Math.max(1.5, (d.b / max) * 92)} rx="2" fill="#b363f3" /></g>)}
    <line x1="0" x2={data.length * 20} y1="100.5" y2="100.5" stroke="rgba(214,186,255,.2)" />
  </svg>
}
function Partner({ u }: { u: User }) {
  const s = affiliateStats(u.refCode); const [q] = useSearchParams(); const [toast, setToast] = useState('')
  const rate = SITE.commissionPercent
  const days = Array.from({ length: 14 }, (_, i) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - 13 + i); return d.getTime() })
  const data = days.map((t) => ({ l: '', a: s.clicks.filter((c) => c.at >= t && c.at < t + 864e5).length, b: s.sales.filter((c) => c.createdAt >= t && c.createdAt < t + 864e5).length }))
  const conv = s.clicks.length ? ((s.sales.length / s.clicks.length) * 100).toFixed(1) + '%' : '—'
  const copy = (t: string) => { navigator.clipboard?.writeText(t).then(() => setToast('Link copied'), () => setToast('Copy failed — select and copy manually')) }
  return <>
    <Top title={q.get('welcome') ? 'Welcome to the affiliate program 🎉' : 'Affiliate earnings'} sub={<>Your code <b style={{ color: 'var(--indigo)' }}>{u.refCode}</b></>} right={<Link to="/partner/links" className="btn btn-p btn-sm">Get my links</Link>} />
    <div className="kpis" style={{ marginBottom: 18 }}>
      <Kpi l="Link clicks" v={s.clicks.length} e="all time" /><Kpi l="Sign-ups" v={s.signups.length} e="joined with your link" />
      <Kpi l="Sales" v={s.sales.length} e={`conversion ${conv}`} /><Kpi l="Commission" v={rate != null ? inr(Math.round((s.value * rate) / 100)) : inr(0)} e={rate != null ? `${rate}% of ${inr(s.value)} sales` : `on ${inr(s.value)} sales · rate set by Crafted Skills`} />
    </div>
    <div className="g2" style={{ gap: 18 }}>
      <div className="chart"><div className="lg"><span><i style={{ background: 'var(--indigo)' }} />Clicks</span><span><i style={{ background: 'var(--vio2)' }} />Sales</span><span style={{ marginLeft: 'auto' }}>Last 14 days</span></div><Bars data={data} /></div>
      <div className="panel"><h2>Your main link</h2><div className="copyrow"><input className="input" readOnly value={refLink(u.refCode)} onFocus={(e) => e.target.select()} aria-label="Your referral link" /><button className="btn btn-p btn-sm" onClick={() => copy(refLink(u.refCode))}><Icon n="copy" s={16} />Copy</button></div>
        <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}><a className="btn btn-g btn-sm" target="_blank" rel="noopener" href={`https://wa.me/?text=${encodeURIComponent('Learn digital skills in Kannada with Crafted Skills 💜 ' + refLink(u.refCode))}`}>Share on WhatsApp</a><Link to="/partner/links" className="btn btn-g btn-sm">Links for each bundle</Link></div>
        <p className="dim" style={{ fontSize: 13, marginTop: 12 }}>Anyone who opens your link is linked to you for 30 days.</p></div>
    </div>
    {toast && <Toast msg={toast} onDone={() => setToast('')} />}
  </>
}
function Links({ u }: { u: User }) {
  const [toast, setToast] = useState('')
  const copy = (t: string) => navigator.clipboard?.writeText(t).then(() => setToast('Link copied'), () => setToast('Copy failed'))
  return <><Top title="My links" sub="One link per bundle. Share where your audience is." />
    <div style={{ display: 'grid', gap: 12 }}>{BUNDLES.map((b) => { const l = refLink(u.refCode, b.slug); return <div key={b.slug} className="lrow"><img src={b.image} alt="" loading="lazy" />
      <div><h3>{b.name}</h3><p className="muted" style={{ fontSize: 14 }}>{inr(b.price)} · {b.courses.length} courses</p><div className="copyrow" style={{ marginTop: 10 }}><input className="input" readOnly value={l} onFocus={(e) => e.target.select()} aria-label={`Referral link for ${b.name}`} /></div></div>
      <div style={{ display: 'grid', gap: 8 }}><button className="btn btn-p btn-sm" onClick={() => copy(l)}><Icon n="copy" s={16} />Copy</button><a className="btn btn-g btn-sm" target="_blank" rel="noopener" href={`https://wa.me/?text=${encodeURIComponent(`${b.name} – learn in Kannada with Crafted Skills 💜 ${l}`)}`}>WhatsApp</a></div></div> })}</div>
    {toast && <Toast msg={toast} onDone={() => setToast('')} />}</>
}
function Referrals({ u }: { u: User }) {
  const { db } = useStore(); const s = affiliateStats(u.refCode)
  return <><Top title="Referrals" sub="People who joined and bought through your link." />
    <div className="panel tscroll">{s.signups.length || s.sales.length ? <table className="table"><thead><tr><th>Name</th><th>Joined</th><th>Purchases</th><th>Value</th></tr></thead><tbody>
      {s.signups.map((x) => { const o = s.sales.filter((y) => y.userId === x.id); return <tr key={x.id}><td><b>{x.name.split(' ')[0]} {x.name.split(' ')[1]?.[0] || ''}.</b></td><td>{fmtDate(x.createdAt)}</td><td>{o.map((y) => getProduct(y.bundle)?.name).join(', ') || '—'}</td><td><b>{inr(o.reduce((a, y) => a + y.amount, 0))}</b></td></tr> })}
      {s.sales.filter((o) => !s.signups.some((x) => x.id === o.userId)).map((o) => <tr key={o.id}><td><b>{db.users.find((x) => x.id === o.userId)?.name.split(' ')[0] || 'Customer'}</b></td><td>{fmtDate(o.createdAt)}</td><td>{getProduct(o.bundle)?.name}</td><td><b>{inr(o.amount)}</b></td></tr>)}
    </tbody></table> : <Empty icon="users" title="No referrals yet" text="Share your link on WhatsApp, Instagram or Facebook. Every sign-up and sale shows up here."><Link to="/partner/links" className="btn btn-p">Get my links</Link></Empty>}</div></>
}
function Board({ u }: { u: User }) {
  const rows = leaderboard()
  return <><Top title="Leaderboard" sub="Top affiliates by sales value." />
    <div className="panel tscroll">{rows.length ? <table className="table"><thead><tr><th>#</th><th>Affiliate</th><th>Sales</th><th>Value</th></tr></thead><tbody>
      {rows.map((r, i) => <tr key={r.code} style={r.code === u.refCode ? { background: 'rgba(179,99,243,.1)' } : undefined}><td><b>{['🥇', '🥈', '🥉'][i] || i + 1}</b></td><td><b>{r.name.split(' ')[0]}</b>{r.code === u.refCode && ' (you)'}</td><td>{r.sales}</td><td><b>{inr(r.value)}</b></td></tr>)}
    </tbody></table> : <Empty icon="trophy" title="The board is waiting" text="Make your first sale to appear here." />}</div></>
}
function Payouts({ u }: { u: User }) {
  const [f, setF] = useState({ upi: u.payout?.upi || '', holder: u.payout?.holder || '', bank: u.payout?.bank || '', ifsc: u.payout?.ifsc || '', account: u.payout?.account || '' })
  const [toast, setToast] = useState(''); const [err, setErr] = useState('')
  const save = (e: FormEvent) => { e.preventDefault(); setErr('')
    if (!f.upi && !f.account) return setErr('Add a UPI ID or bank account.')
    if (f.upi && !/^[\w.-]{2,}@[a-z]{2,}$/i.test(f.upi)) return setErr('That UPI ID doesn’t look right (e.g. name@okaxis).')
    if (f.ifsc && !/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(f.ifsc)) return setErr('IFSC should look like SBIN0001234.')
    updateProfile({ payout: { ...f, ifsc: f.ifsc.toUpperCase() } }); setToast('Payout details saved') }
  const s = affiliateStats(u.refCode)
  return <><Top title="Payouts" sub="Where Crafted Skills sends your commission." />
    <div className="g2">
      <form className="panel form" onSubmit={save}><h2>Payout details</h2>{err && <div className="alert bad">{err}</div>}
        <div className="field"><label htmlFor="up">UPI ID</label><input id="up" className="input" value={f.upi} onChange={(e) => setF({ ...f, upi: e.target.value })} placeholder="name@okaxis" /></div>
        <div className="or">or bank account</div>
        <div className="field"><label htmlFor="bh">Account holder name</label><input id="bh" className="input" value={f.holder} onChange={(e) => setF({ ...f, holder: e.target.value })} /></div>
        <div className="g2" style={{ gap: 12 }}><div className="field"><label htmlFor="bb">Bank</label><input id="bb" className="input" value={f.bank} onChange={(e) => setF({ ...f, bank: e.target.value })} /></div><div className="field"><label htmlFor="bi">IFSC</label><input id="bi" className="input" value={f.ifsc} onChange={(e) => setF({ ...f, ifsc: e.target.value })} /></div></div>
        <div className="field"><label htmlFor="ba">Account number</label><input id="ba" className="input" inputMode="numeric" value={f.account} onChange={(e) => setF({ ...f, account: e.target.value.replace(/\D/g, '') })} /></div>
        <button className="btn btn-p">Save payout details</button></form>
      <div className="panel"><h2>Payout history</h2><div className="kpis" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: 16 }}><Kpi l="Sales value" v={inr(s.value)} /><Kpi l="Paid out" v={inr(0)} /></div>
        <Empty icon="wallet" title="No payouts yet" text="Crafted Skills confirms each sale and pays commission to the details on the left." /></div>
    </div>
    {toast && <Toast msg={toast} onDone={() => setToast('')} />}</>
}

/* ---------------- courses (founders add them from admin) ---------------- */
const stLabel: Record<SellerCourse['status'], [string, string]> = { draft: ['Draft', 'warn'], review: ['Draft', 'warn'], published: ['Live', 'ok'], rejected: ['Hidden', 'warn'] }
function DelBtn({ onYes }: { onYes: () => void }) {
  const [ask, setAsk] = useState(false)
  useEffect(() => { if (!ask) return; const t = setTimeout(() => setAsk(false), 3500); return () => clearTimeout(t) }, [ask])
  return <button className="link" style={{ marginLeft: 14, color: ask ? 'var(--bad)' : undefined }} onClick={() => ask ? onYes() : setAsk(true)}>{ask ? 'Tap again to delete' : 'Delete'}</button>
}
function CourseList() {
  const { db } = useStore(); const [toast, setToast] = useState('')
  const paid = db.orders.filter((o) => o.status === 'paid')
  const list = [...db.courses].sort((a, b) => b.createdAt - a.createdAt)
  return <><div className="kpis" style={{ marginBottom: 18 }}><Kpi l="Bundles" v={BUNDLES.length} e="from the website" /><Kpi l="Added courses" v={list.length} /><Kpi l="Live" v={list.filter((c) => c.status === 'published').length} /><Kpi l="Course sales" v={inr(paid.filter((o) => o.bundle.startsWith('c-')).reduce((a, o) => a + o.amount, 0))} /></div>
    <div className="panel tscroll">{list.length ? <table className="table"><thead><tr><th>Course</th><th>Price</th><th>Lessons</th><th>Students</th><th>Status</th><th /></tr></thead><tbody>
    {list.map((c) => <tr key={c.id}><td><b>{c.title}</b><div className="dim" style={{ fontSize: 13 }}>{c.category}</div></td><td>{inr(c.price)}</td><td>{c.lessons.length}</td><td>{new Set(paid.filter((o) => o.bundle === 'c-' + c.id).map((o) => o.userId)).size}</td><td><span className={`badge ${stLabel[c.status][1]}`}>{stLabel[c.status][0]}</span></td>
      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        {c.status === 'published' ? <button className="link" onClick={() => { setCourseStatus(c.id, 'draft'); setToast('Course hidden from the website') }}>Unpublish</button> : <button className="link" onClick={() => { setCourseStatus(c.id, 'published'); setToast('Course is live') }}>Publish</button>}
        <Link className="link" style={{ marginLeft: 14 }} to={`/manage/courses/edit/${c.id}`}>Edit</Link>{c.status === 'published' && <Link className="link" style={{ marginLeft: 14 }} to={`/courses/c-${c.id}`}>View</Link>}<DelBtn onYes={() => deleteCourse(c.id)} /></td></tr>)}
  </tbody></table> : <Empty icon="play" title="Add your first course" text="Give it a title, price and lessons. Publish it and it shows on the Courses page."><Link to="/manage/courses/new" className="btn btn-p">Add a course</Link></Empty>}</div>
  {toast && <Toast msg={toast} onDone={() => setToast('')} />}</>
}
function CourseEditor({ id }: { id?: string }) {
  const { db } = useStore(); const nav = useNavigate(); const ex = db.courses.find((c) => c.id === id)
  const [f, setF] = useState({ title: ex?.title || '', category: ex?.category || '', price: ex ? String(ex.price) : '', description: ex?.description || '' })
  const [lessons, setLessons] = useState(ex?.lessons.length ? ex.lessons : [{ title: '', url: '' }]); const [err, setErr] = useState('')
  if (id && !ex) return <Navigate to="/manage/courses" replace />
  const save = (status: SellerCourse['status']) => {
    setErr(''); const price = Number(f.price)
    if (f.title.trim().length < 4) return setErr('Give the course a clear title.')
    if (!price || price < 99) return setErr('Set a price of at least ₹99.')
    const ls = lessons.filter((l) => l.title.trim())
    if (status === 'published' && !ls.length) return setErr('Add at least one lesson before publishing.')
    try { saveCourse({ id: ex?.id, title: f.title.trim(), category: f.category.trim() || 'General', price, description: f.description.trim(), lessons: ls, status }); nav('/manage/courses') } catch (y) { setErr((y as Error).message) }
  }
  return <><Top title={ex ? 'Edit course' : 'Add a course'} sub="Published courses appear on the Courses page straight away." />
    {err && <div className="alert bad" style={{ marginBottom: 14 }}>{err}</div>}
    <div className="g2" style={{ alignItems: 'start' }}>
      <div className="panel form"><h2>Course details</h2>
        <div className="field"><label htmlFor="ct">Title</label><input id="ct" className="input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="e.g. Canva for beginners in Kannada" /></div>
        <div className="g2" style={{ gap: 12 }}><div className="field"><label htmlFor="cc">Category</label><input id="cc" className="input" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} placeholder="Design" /></div><div className="field"><label htmlFor="cp">Price (₹)</label><input id="cp" className="input" inputMode="numeric" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value.replace(/\D/g, '') })} /></div></div>
        <div className="field"><label htmlFor="cd">Description</label><textarea id="cd" className="input" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></div></div>
      <div className="panel form"><h2>Lessons</h2>
        {lessons.map((l, i) => <div key={i} style={{ display: 'grid', gap: 8, paddingBottom: 12, borderBottom: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><b className="dim" style={{ width: 24 }}>{i + 1}</b><input className="input" placeholder="Lesson title" value={l.title} onChange={(e) => setLessons(lessons.map((x, k) => k === i ? { ...x, title: e.target.value } : x))} />{lessons.length > 1 && <button className="btn btn-g btn-sm" onClick={() => setLessons(lessons.filter((_, k) => k !== i))} aria-label="Remove lesson">✕</button>}</div>
          <input className="input" placeholder="Video link (YouTube unlisted, Vimeo or Drive)" value={l.url} onChange={(e) => setLessons(lessons.map((x, k) => k === i ? { ...x, url: e.target.value } : x))} style={{ marginLeft: 32, width: 'calc(100% - 32px)' }} /></div>)}
        <button className="btn btn-g btn-sm" onClick={() => setLessons([...lessons, { title: '', url: '' }])}>+ Add lesson</button>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}><button className="btn btn-p" onClick={() => save('published')}>Publish course</button><button className="btn btn-g" onClick={() => save('draft')}>Save draft</button></div>
      </div>
    </div></>
}

/* ---------------- admin ---------------- */
function Admin({ sec, arg, id }: { sec: string; arg?: string; id?: string }) {
  const { db } = useStore(); const [toast, setToast] = useState('')
  const paid = db.orders.filter((o) => o.status === 'paid'); const rev = paid.reduce((a, o) => a + o.amount, 0)
  const name = (id: string) => db.users.find((u) => u.id === id)?.name || '—'
  if (sec === 'orders') return <><Top title="Orders & refunds" sub="Approve refund requests within the 24-hour policy." />
    <div className="panel tscroll">{db.orders.length ? <table className="table"><thead><tr><th>Order</th><th>Student</th><th>Bundle</th><th>Affiliate</th><th>Amount</th><th>Status</th><th /></tr></thead><tbody>
      {[...db.orders].reverse().map((o) => <tr key={o.id}><td><b>{o.id}</b><div className="dim" style={{ fontSize: 12 }}>{fmtTime(o.createdAt)}</div></td><td>{name(o.userId)}</td><td>{getProduct(o.bundle)?.name}</td><td>{o.refCode || '—'}</td><td><b>{inr(o.amount)}</b></td>
        <td><span className={`badge ${o.status === 'paid' ? 'ok' : 'warn'}`}>{o.status}</span></td>
        <td style={{ whiteSpace: 'nowrap' }}>{o.status === 'refund-requested' && <><button className="link" onClick={() => { resolveRefund(o.id, true); setToast('Refund approved') }}>Approve</button><button className="link" style={{ marginLeft: 12 }} onClick={() => resolveRefund(o.id, false)}>Decline</button></>}</td></tr>)}
    </tbody></table> : <Empty icon="receipt" title="No orders yet" text="Orders appear here the moment a student pays." />}</div>{toast && <Toast msg={toast} onDone={() => setToast('')} />}</>
  if (sec === 'people') return <><Top title="Students & affiliates" sub={`${db.users.length} accounts`} />
    <div className="panel tscroll">{db.users.length ? <table className="table"><thead><tr><th>Name</th><th>Contact</th><th>Roles</th><th>Joined</th><th>Referred by</th><th>Spent</th></tr></thead><tbody>
      {db.users.map((u) => <tr key={u.id}><td><b>{u.name}</b>{u.roles.includes('affiliate') && <div className="dim" style={{ fontSize: 12 }}>code {u.refCode}</div>}</td><td>{u.email}<div className="dim" style={{ fontSize: 12 }}>{u.phone}</div></td><td>{u.roles.map(roleName).join(', ')}</td><td>{fmtDate(u.createdAt)}</td><td>{u.referredBy || '—'}</td><td><b>{inr(paid.filter((o) => o.userId === u.id).reduce((a, o) => a + o.amount, 0))}</b></td></tr>)}
    </tbody></table> : <Empty icon="users" title="No accounts yet" text="Sign-ups appear here." />}</div></>
  if (sec === 'courses') return arg === 'new' ? <CourseEditor /> : arg === 'edit' && id ? <CourseEditor key={id} id={id} /> : <><Top title="Courses" sub="Add, publish and edit the courses learners can buy." right={<Link to="/manage/courses/new" className="btn btn-p btn-sm">Add a course</Link>} /><CourseList /></>
  if (sec === 'messages') return <><Top title="Messages" sub="From the contact form." />
    <div style={{ display: 'grid', gap: 12 }}>{db.messages.length ? [...db.messages].reverse().map((m, i) => <div key={i} className="panel"><div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}><b>{m.name} · <a className="link" href={`mailto:${m.email}`}>{m.email}</a></b><span className="dim">{fmtTime(m.at)}</span></div>{m.subject && <p style={{ marginTop: 6, fontWeight: 600 }}>{m.subject}</p>}<p className="muted" style={{ marginTop: 6 }}>{m.message}</p></div>) : <div className="panel"><Empty icon="mail" title="No messages" text="Contact form messages appear here." /></div>}</div></>
  const affs = db.users.filter((u) => u.roles.includes('affiliate'))
  const byBundle = BUNDLES.map((b) => ({ b, n: paid.filter((o) => o.bundle === b.slug).length })).sort((a, c) => c.n - a.n)
  return <><Top title="Business overview" sub="Crafted Skills" />
    <div className="kpis" style={{ marginBottom: 18 }}><Kpi l="Revenue" v={inr(rev)} e={`${paid.length} paid orders`} /><Kpi l="Students" v={db.users.length} /><Kpi l="Affiliates" v={affs.length} e={`${paid.filter((o) => o.refCode).length} referred sales`} /><Kpi l="Refund requests" v={db.orders.filter((o) => o.status === 'refund-requested').length} /></div>
    <div className="g2"><div className="panel"><h2>Bundles sold</h2><div style={{ display: 'grid', gap: 10 }}>{byBundle.map(({ b, n }) => <div key={b.slug}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}><span>{b.name}</span><b>{n}</b></div><div className="prog"><i style={{ width: (paid.length ? (n / paid.length) * 100 : 0) + '%' }} /></div></div>)}</div></div>
      <div className="panel"><h2>Top affiliates</h2>{leaderboard().length ? <table className="table"><tbody>{leaderboard().slice(0, 6).map((r) => <tr key={r.code}><td><b>{r.name}</b><div className="dim" style={{ fontSize: 12 }}>{r.code}</div></td><td>{r.sales} sales</td><td><b>{inr(r.value)}</b></td></tr>)}</tbody></table> : <Empty icon="trophy" title="No affiliates yet" text="Affiliate sign-ups appear here." />}</div></div></>
}

/* ---------------- router ---------------- */
export default function Dashboard() {
  const { user } = useStore(); const loc = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [loc.pathname])
  if (!user) return <Navigate to={loc.pathname.startsWith('/manage') ? '/login' : `/login?next=${encodeURIComponent(loc.pathname)}`} replace />
  const p = loc.pathname.split('/').filter(Boolean)
  const [area, sec = '', arg, arg2] = p
  let body: ReactNode = null, title = 'Dashboard'
  if (area === 'dashboard') {
    title = 'My learning'
    body = sec === '' ? <Overview u={user} /> : sec === 'learning' ? <Learning u={user} /> : sec === 'learn' && arg ? <Player key={arg} u={user} slug={arg} /> : sec === 'purchases' ? <Purchases u={user} /> : sec === 'certificates' ? <Certificates u={user} /> : sec === 'profile' ? <Profile u={user} /> : <Navigate to="/dashboard" replace />
  } else if (area === 'partner') {
    if (!user.roles.includes('affiliate')) return <Shell user={user}><Top title="Affiliate program" sub="Recommend Crafted Skills and earn exciting commissions for every successful signup!" /><div className="panel"><Empty icon="rupee" title="Switch on affiliate mode" text="Get your personal links, track clicks and sales, and add your payout details."><AffBtn /></Empty></div></Shell>
    title = 'Affiliate'
    body = sec === '' ? <Partner u={user} /> : sec === 'links' ? <Links u={user} /> : sec === 'referrals' ? <Referrals u={user} /> : sec === 'leaderboard' ? <Board u={user} /> : sec === 'payouts' ? <Payouts u={user} /> : <Navigate to="/partner" replace />
  } else if (area === 'studio') {
    return <Navigate to={user.roles.includes('admin') ? '/manage/courses' : '/dashboard'} replace />
  } else if (area === 'manage') {
    if (!user.roles.includes('admin')) return <Navigate to="/dashboard" replace />
    title = 'Manage'; body = <Admin sec={sec} arg={arg} id={arg2} />
  }
  return <Shell user={user}><Seo title={`${title} | Crafted Skills`} />{body}</Shell>
}
