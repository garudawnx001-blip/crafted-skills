import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { SITE, TESTIMONIALS } from '../data/site'
import { Brand, Icon, Mark, PasswordInput, Seo } from '../components/ui'
import { emailExists, logIn, resetPassword, signUp, type Role, type User } from '../lib/store'

const ROLES: { r: Exclude<Role, 'admin'>; t: string; s: string }[] = [
  { r: 'learner', t: 'Learner', s: 'Buy & learn' },
  { r: 'affiliate', t: 'Affiliate', s: 'Share & earn' },
  { r: 'seller', t: 'Trainer', s: 'Sell courses' },
]
export const homeFor = (u: User) => u.roles.includes('admin') ? '/admin' : u.roles.includes('seller') ? '/studio' : u.roles.includes('affiliate') ? '/partner' : '/dashboard'
const okEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim())

function Art() {
  const t = TESTIMONIALS[1]
  return <aside className="auth-art">
    <Brand />
    <div>
      <Mark className="bm bigm" />
      <p className="q">Learn in Kannada.<br />Grow with Skills.<br /><span>Build Your Dreams from Home.</span></p>
    </div>
    <figure>
      <img src={t.photo} alt="" />
      <figcaption><b>“I understood my own value.” ❤️</b><div>{t.name}, Crafted Skills student</div></figcaption>
    </figure>
  </aside>
}

function Seg({ role, set }: { role: string; set: (r: Exclude<Role, 'admin'>) => void }) {
  return <div className="seg" role="tablist" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>{ROLES.map((x) => <button type="button" role="tab" aria-selected={role === x.r} key={x.r} className={role === x.r ? 'on' : ''} onClick={() => set(x.r)}>{x.t}<small>{x.s}</small></button>)}</div>
}

export function Login() {
  const [q] = useSearchParams(); const nav = useNavigate()
  const [email, setEmail] = useState(''); const [pw, setPw] = useState('')
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false)
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setErr('')
    if (!okEmail(email) || !pw) { setErr('Enter your email and password.'); return }
    setBusy(true)
    try { const u = await logIn(email, pw); nav(q.get('next') || homeFor(u), { replace: true }) } catch (x) { setErr((x as Error).message) } finally { setBusy(false) }
  }
  return <div className="auth">
    <Seo title="Log in | Crafted Skills" />
    <Art />
    <div className="auth-box"><form className="auth-card form" onSubmit={submit} noValidate>
      <div className="auth-mbrand"><Brand /></div><h1>Welcome back</h1><p className="muted">Log in to your learner, affiliate or trainer dashboard.</p>
      <div style={{ height: 10 }} />
      {err && <div className="alert bad" role="alert">{err}</div>}
      <div className="field"><label htmlFor="le">Email</label><input id="le" className="input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></div>
      <div className="field"><label htmlFor="lp" style={{ display: 'flex', justifyContent: 'space-between' }}>Password <Link to="/forgot" className="link" style={{ fontWeight: 500 }}>Forgot password?</Link></label><PasswordInput id="lp" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Your password" /></div>
      <button className="btn btn-p btn-block" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
      <div className="or">New to Crafted Skills?</div>
      <Link to={`/signup${q.get('next') ? '?next=' + encodeURIComponent(q.get('next')!) : ''}`} className="btn btn-g btn-block">Create an account</Link>
      <p className="dim" style={{ fontSize: 13, textAlign: 'center' }}>Need help? <a className="link" href={`mailto:${SITE.email}`}>{SITE.email}</a></p>
    </form></div>
  </div>
}

export function Signup() {
  const [q] = useSearchParams(); const nav = useNavigate()
  const init = (q.get('role') as Exclude<Role, 'admin'>) || 'learner'
  const [role, setRole] = useState<Exclude<Role, 'admin'>>(ROLES.some((r) => r.r === init) ? init : 'learner')
  const [f, setF] = useState({ name: '', email: '', phone: '', pw: '', agree: false })
  const [errs, setErrs] = useState<Record<string, string>>({}); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false)
  const set = (k: string, v: string | boolean) => setF({ ...f, [k]: v })
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setErr('')
    const x: Record<string, string> = {}
    if (f.name.trim().length < 2) x.name = 'Please enter your full name.'
    if (!okEmail(f.email)) x.email = 'Please enter a valid email.'
    else if (emailExists(f.email)) x.email = 'This email already has an account. Please log in.'
    if (!/^[6-9]\d{9}$/.test(f.phone.replace(/\D/g, '').slice(-10))) x.phone = 'Enter a 10-digit Indian mobile number.'
    if (f.pw.length < 8) x.pw = 'Use at least 8 characters.'
    if (!f.agree) x.agree = 'Please accept the Terms and Conditions.'
    setErrs(x); if (Object.keys(x).length) return
    setBusy(true)
    try { const u = await signUp({ name: f.name, email: f.email, phone: '+91' + f.phone.replace(/\D/g, '').slice(-10), password: f.pw, role }); nav(q.get('next') || homeFor(u) + '?welcome=1', { replace: true }) }
    catch (y) { setErr((y as Error).message) } finally { setBusy(false) }
  }
  const head = { learner: ['Start learning in Kannada', 'Create your free account. Buy a bundle when you are ready.'], affiliate: ['Join the affiliate program', 'Recommend Crafted Skills and earn exciting commissions for every successful signup!'], seller: ['Teach with Crafted Skills', 'Create your trainer account, add your course and send it to Crafted Skills for review.'] }[role]
  return <div className="auth">
    <Seo title="Sign up | Crafted Skills" />
    <Art />
    <div className="auth-box"><form className="auth-card form" onSubmit={submit} noValidate>
      <div className="auth-mbrand"><Brand /></div><h1>{head[0]}</h1><p className="muted">{head[1]}</p>
      <Seg role={role} set={setRole} />
      {err && <div className="alert bad" role="alert">{err}</div>}
      <div className="field"><label htmlFor="sn">Full name</label><input id="sn" className={`input ${errs.name ? 'err' : ''}`} autoComplete="name" value={f.name} onChange={(e) => set('name', e.target.value)} />{errs.name && <span className="ferr">{errs.name}</span>}</div>
      <div className="field"><label htmlFor="se">Email</label><input id="se" type="email" className={`input ${errs.email ? 'err' : ''}`} autoComplete="email" value={f.email} onChange={(e) => set('email', e.target.value)} />{errs.email && <span className="ferr">{errs.email} {errs.email.includes('log in') && <Link className="link" to="/login">Log in</Link>}</span>}</div>
      <div className="field"><label htmlFor="sp">Mobile number (WhatsApp)</label><input id="sp" type="tel" inputMode="numeric" className={`input ${errs.phone ? 'err' : ''}`} autoComplete="tel-national" value={f.phone} onChange={(e) => set('phone', e.target.value)} placeholder="98765 43210" />{errs.phone && <span className="ferr">{errs.phone}</span>}</div>
      <div className="field"><label htmlFor="sw">Create password</label><PasswordInput id="sw" autoComplete="new-password" value={f.pw} onChange={(e) => set('pw', e.target.value)} placeholder="At least 8 characters" />{errs.pw && <span className="ferr">{errs.pw}</span>}</div>
      <label className="check"><input type="checkbox" checked={f.agree} onChange={(e) => set('agree', e.target.checked)} /><span>I agree to the <Link className="link" to="/terms" target="_blank">Terms and Conditions</Link>, including the 24-hour refund policy.</span></label>
      {errs.agree && <span className="ferr">{errs.agree}</span>}
      <button className="btn btn-p btn-block" disabled={busy}>{busy ? 'Creating your account…' : 'Create account'}</button>
      <p className="muted center" style={{ fontSize: 14.5 }}>Already have an account? <Link className="link" to={`/login${q.get('next') ? '?next=' + encodeURIComponent(q.get('next')!) : ''}`}>Log in</Link></p>
    </form></div>
  </div>
}

export function Forgot() {
  const [step, setStep] = useState<1 | 2 | 3>(1); const [email, setEmail] = useState(''); const [pw, setPw] = useState(''); const [err, setErr] = useState('')
  const s1 = (e: FormEvent) => { e.preventDefault(); setErr(''); if (!okEmail(email)) return setErr('Enter a valid email.'); if (!emailExists(email)) return setErr('No account found with this email.'); setStep(2) }
  const s2 = async (e: FormEvent) => { e.preventDefault(); setErr(''); if (pw.length < 8) return setErr('Use at least 8 characters.'); try { await resetPassword(email, pw); setStep(3) } catch (x) { setErr((x as Error).message) } }
  return <div className="auth"><Seo title="Reset password | Crafted Skills" /><Art />
    <div className="auth-box"><div className="auth-card">
      {step === 1 && <form className="form" onSubmit={s1} noValidate><div className="auth-mbrand"><Brand /></div><h1>Reset password</h1><p className="muted">Enter the email you signed up with.</p>{err && <div className="alert bad">{err}</div>}
        <div className="field"><label htmlFor="fe">Email</label><input id="fe" className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div><button className="btn btn-p btn-block">Continue</button><Link to="/login" className="btn btn-g btn-block">Back to log in</Link></form>}
      {step === 2 && <form className="form" onSubmit={s2} noValidate><h1>New password</h1><div className="alert info">Preview mode: once the database is connected, a secure reset link is emailed to {email} instead of this step.</div>{err && <div className="alert bad">{err}</div>}
        <div className="field"><label htmlFor="fp">New password</label><PasswordInput id="fp" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" /></div><button className="btn btn-p btn-block">Save new password</button></form>}
      {step === 3 && <div className="empty"><div className="ei"><Icon n="check" /></div><h3>Password updated</h3><p>You can now log in with your new password.</p><Link to="/login" className="btn btn-p" style={{ marginTop: 18 }}>Log in</Link></div>}
    </div></div></div>
}
