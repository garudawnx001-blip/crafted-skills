import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ABOUT, AFFILIATE, BUNDLES, CONTACT, FOUNDERS, HOME, SITE, TERMS, inr } from '../data/site'
import { BundleCard, FbIcon, Icon, IgIcon, Seo, WaIcon, waLink } from '../components/ui'
import { getProduct, ownsBundle, saveMessage, useStore } from '../lib/store'
import { Faq } from './Home'

export function PageHero({ eyebrow, title, lead, children, crumbs }: { eyebrow?: string; title: ReactNode; lead?: ReactNode; children?: ReactNode; crumbs?: ReactNode }) {
  return <section className="phero"><div className="aurora" /><div className="gridbg" />
    <div className="wrap">{crumbs && <div className="crumbs">{crumbs}</div>}{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h1 className="h1" style={{ marginTop: 14 }}>{title}</h1>{lead && <p className="lead">{lead}</p>}{children}</div>
  </section>
}

export function About() {
  return <>
    <Seo title="About Crafted Skills (CraftedSkills) | Digital Skills in Kannada, Karnataka" desc={ABOUT.intro[0]} />
    <PageHero eyebrow="About us" title={<>Crafted Skills <span className="kn grad" lang="kn" style={{ display: 'block', fontSize: '.62em', marginTop: 8 }}>– {SITE.kannadaLine}</span></>} />
    <section className="sec tight"><div className="wrap split">
      <div className="photo rv" style={{ aspectRatio: '3/2' }}><img src="img/hero-collage.webp" alt="Women learning digital skills from home" width="1200" height="800" /></div>
      <div className="rv">{ABOUT.intro.map((p) => <p key={p} className="lead" style={{ marginBottom: 14 }}>{p}</p>)}</div>
    </div></section>
    <section className="sec tight"><div className="wrap"><div className="card glowy rv" style={{ padding: 'clamp(24px,4vw,48px)' }}>
      <span className="eyebrow">Our Mission</span>
      {ABOUT.mission.map((p) => <p key={p} className="lead" style={{ marginTop: 16 }}>{p}</p>)}
      <p className="h3" style={{ marginTop: 22 }}>“{ABOUT.missionLine.replace('Our mission is simple: ', '')}”</p>
    </div></div></section>
    <section className="sec tight"><div className="wrap">
      <div className="head center rv"><span className="eyebrow">The people behind Crafted Skills</span><h2 className="h2">Meet Our Founders</h2><p className="lead">A shared mission to make digital skills accessible to everyone, in Kannada.</p></div>
      <div className="founders">{FOUNDERS.map((f) => <article key={f.name} className="card fnd rv">
        <div className="ph"><img src={f.photo} alt={`${f.name}, ${f.role} of Crafted Skills`} loading="lazy" width="720" height="1292" /></div>
        <div><span className="role">{f.role}</span><h3>{f.name}</h3><div className="pl">{f.place}</div>{f.bio.map((b) => <p key={b} style={{ marginBottom: 10 }}>{b}</p>)}</div>
      </article>)}</div>
    </div></section>
    <section className="wrap"><div className="cta rv">
      <h2 className="h2">Your Dreams Deserve a Chance ❤️</h2>
      {ABOUT.dreams.map((d) => <p key={d} className="lead" style={{ maxWidth: '36em', margin: '14px auto 0' }}>{d}</p>)}
      <div className="ctas"><Link to="/courses" className="btn btn-w">Explore Our Courses</Link><Link to="/contact" className="btn btn-g">Get in touch</Link></div>
    </div></section>
  </>
}

export function Courses() {
  const { db } = useStore()
  const trainer = db.courses.filter((c) => c.status === 'published')
  return <>
    <Seo title="Course Bundles in Kannada | Crafted Skills (CraftedSkills)" desc="Explore Crafted Skills course bundles – Digital Commerce, Creators Studio, Handmade Business, Venture, Career and Finance, Passion, Beauty and Creation. Learn in Kannada." />
    <PageHero eyebrow="Courses" title="Explore Our Course Bundles" lead="Learn practical digital skills in Kannada and take the next step toward your goals." />
    <section className="sec tight"><div className="wrap"><div className="bgrid">{BUNDLES.map((b) => <div key={b.slug} className="rv"><BundleCard b={b} /></div>)}</div>
      {trainer.length > 0 && <><div className="head rv" style={{ marginTop: 60 }}><span className="eyebrow">From our trainers</span><h2 className="h2">More courses</h2></div>
        <div className="bgrid">{trainer.map((c) => { const p = getProduct('c-' + c.id)!; return <div key={c.id} className="rv"><BundleCard b={p} /></div> })}</div></>}
    </div></section>
    <section className="wrap"><div className="cta rv"><h2 className="h2">Not sure which bundle fits you?</h2><p className="lead" style={{ margin: '14px auto 0', maxWidth: '32em' }}>{CONTACT.text}</p>
      <div className="ctas"><a className="btn btn-w" href={waLink('Hi Crafted Skills, please help me choose a course bundle.')} target="_blank" rel="noopener">Ask on WhatsApp</a><a className="btn btn-g" href={`tel:+${SITE.phoneRaw}`}>Call {SITE.phone}</a></div></div></section>
  </>
}

export function BundleDetail() {
  const { slug = '' } = useParams(); const { user } = useStore()
  const b = getProduct(slug)
  if (!b) return <NotFound />
  const owned = ownsBundle(slug, user)
  const live = b.courses.filter((c) => c.status === 'Available now').length
  return <>
    <Seo title={`${b.name} – ${inr(b.price)} | Crafted Skills`} desc={`${b.name}: ${b.courses.map((c) => c.name).join(', ')}. Learn in Kannada with Crafted Skills.`} />
    <PageHero crumbs={<><Link to="/">Home</Link> / <Link to="/courses">Courses</Link> / {b.name}</>} eyebrow={b.seller ? `By ${b.seller}` : 'Course bundle'} title={b.name} lead={`Learn practical digital skills in Kannada and take the next step toward your goals.`} />
    <section className="sec tight"><div className="wrap co">
      <div className="rv">
        <div className="photo" style={{ aspectRatio: '3/1' }}><img src={b.image} alt={b.name} width="1200" height="391" /></div>
        <div className="panel" style={{ marginTop: 20 }}>
          <h2>What's inside</h2>
          <div className="tscroll"><table className="table"><tbody>{b.courses.map((c, i) => <tr key={c.name}><td style={{ width: 40 }}>{String(i + 1).padStart(2, '0')}</td><td><b>{c.name}</b></td><td style={{ textAlign: 'right' }}><span className={`st ${c.status === 'Available now' ? 'live' : 'soon'}`}>{c.status}</span></td></tr>)}</tbody></table></div>
          <p className="dim" style={{ marginTop: 14, fontSize: 14 }}>{live} available now · {b.courses.length - live} coming soon. New courses unlock in your dashboard as soon as they're released.</p>
        </div>
      </div>
      <aside className="panel rv" style={{ position: 'sticky', top: 96 }}>
        <span className="eyebrow">One-time price</span>
        <div className="price" style={{ fontSize: 46, margin: '8px 0 4px' }}>{inr(b.price)}</div>
        <ul style={{ listStyle: 'none', display: 'grid', gap: 10, margin: '18px 0 22px', color: 'var(--muted)' }}>
          {['Learn in Kannada', 'Beginner-Friendly', 'Practical Learning', 'Access from your own dashboard', '24-hour refund policy'].map((x) => <li key={x} style={{ display: 'flex', gap: 10 }}><span style={{ color: 'var(--ok)' }}><Icon n="check" s={18} /></span>{x}</li>)}
        </ul>
        {owned ? <Link to="/dashboard/learning" className="btn btn-p btn-block">Go to my learning</Link>
          : <Link to={`/checkout/${b.slug}`} className="btn btn-p btn-block">Enroll now · {inr(b.price)}</Link>}
        <a href={waLink(`Hi Crafted Skills, I have a question about ${b.name}.`)} target="_blank" rel="noopener" className="btn btn-g btn-block" style={{ marginTop: 10 }}>Ask a question on WhatsApp</a>
        <p className="dim" style={{ fontSize: 13, marginTop: 14 }}>By enrolling you agree to our <Link to="/terms" className="link">Terms and Conditions</Link>.</p>
      </aside>
    </div></section>
  </>
}

export function Affiliate() {
  const { user } = useStore()
  return <>
    <Seo title="Affiliate Program | Crafted Skills (CraftedSkills)" desc={AFFILIATE.line} />
    <PageHero eyebrow="Crafted Skills" title={AFFILIATE.title} lead={AFFILIATE.line}>
      <div className="ctas">
        <Link to={user ? '/partner' : '/signup?role=affiliate'} className="btn btn-p">Become an Affiliate</Link>
        <Link to={user ? '/partner' : '/login?next=/partner'} className="btn btn-g">My Affiliate Dashboard</Link>
      </div>
      <p className="dim" style={{ marginTop: 14 }}>{AFFILIATE.cta}</p>
    </PageHero>
    <section className="sec tight"><div className="wrap">
      <div className="g3">
        {[['user', 'Sign up as an affiliate', 'Create your free account and choose “Affiliate”. Already a learner? Switch on affiliate mode from your dashboard.'],
          ['link', 'Share your link', 'Copy your personal link for any bundle, or share it straight to WhatsApp, Instagram or Facebook.'],
          ['wallet', 'Track & get paid', 'See every click, sign-up and sale in your dashboard. Add your UPI or bank details for payouts.']].map(([i, t, d], k) =>
          <div key={t} className={`card step rv ${k === 1 ? 'hot' : ''}`}><span className="no">0{k + 1}</span><div className="ic"><Icon n={i} /></div><h3>{t}</h3><p>{d}</p></div>)}
      </div>
    </div></section>
    <section className="sec tight"><div className="wrap"><div className="head center rv"><span className="eyebrow">Bundles you can recommend</span><h2 className="h2">7 bundles, one link each</h2></div>
      <div className="bgrid">{BUNDLES.map((b) => <div key={b.slug} className="rv"><BundleCard b={b} /></div>)}</div></div></section>
  </>
}

export function Contact() {
  const [f, setF] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false); const [err, setErr] = useState('')
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!f.name.trim() || !/^\S+@\S+\.\S+$/.test(f.email) || !f.message.trim()) { setErr('Please fill your name, a valid email and your message.'); return }
    saveMessage(f); setSent(true); setErr('')
  }
  return <>
    <Seo title="Contact Crafted Skills | Call or WhatsApp +91 9008017290" desc={CONTACT.text} />
    <PageHero eyebrow={CONTACT.eyebrow} title={CONTACT.title} lead={CONTACT.text} />
    <section className="sec tight"><div className="wrap co">
      <div className="grid rv" style={{ display: 'grid', gap: 16 }}>
        <a className="card" href={`mailto:${SITE.email}`}><div className="ic"><Icon n="mail" /></div><h3>Email Us</h3><p>{CONTACT.emailNote}</p><p style={{ color: '#fff', fontWeight: 600, marginTop: 8 }}>{SITE.email}</p></a>
        <div className="card"><div className="ic"><Icon n="phone" /></div><h3>Call Us</h3><p>{CONTACT.callNote}</p><p style={{ color: '#fff', fontWeight: 600, margin: '8px 0 14px' }}>{SITE.phone}</p>
          <div className="ctas" style={{ marginTop: 0 }}><a className="btn btn-p btn-sm" href={`tel:+${SITE.phoneRaw}`}><Icon n="phone" s={16} />Call now</a><a className="btn btn-g btn-sm" href={waLink()} target="_blank" rel="noopener"><span style={{ width: 16, display: 'inline-flex', fill: '#25d366' }}><WaIcon /></span>WhatsApp</a></div></div>
        <div className="card"><h3>{CONTACT.followTitle}</h3><p>{CONTACT.followText}</p><div className="soc"><a href={SITE.facebook} target="_blank" rel="noopener" aria-label="Facebook"><FbIcon /></a><a href={SITE.instagram} target="_blank" rel="noopener" aria-label="Instagram"><IgIcon /></a></div></div>
      </div>
      <div className="panel rv">
        {sent ? <div className="empty"><div className="ei"><Icon n="check" /></div><h3>Message sent</h3><p>Thank you, {f.name.split(' ')[0]}. We'll get back to you soon. For a faster reply, message us on WhatsApp.</p>
          <a className="btn btn-p" style={{ marginTop: 18 }} href={waLink(`Hi Crafted Skills, I'm ${f.name}. ${f.message}`)} target="_blank" rel="noopener">Continue on WhatsApp</a></div>
          : <form className="form" onSubmit={submit} noValidate>
            <h2>{CONTACT.formNote}</h2>
            {err && <div className="alert bad">{err}</div>}
            <div className="field"><label htmlFor="cn">First name</label><input id="cn" className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="given-name" /></div>
            <div className="field"><label htmlFor="ce">Email</label><input id="ce" type="email" className="input" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" /></div>
            <div className="field"><label htmlFor="cs">Subject</label><input id="cs" className="input" value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} /></div>
            <div className="field"><label htmlFor="cm">Message</label><textarea id="cm" className="input" value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} /></div>
            <button className="btn btn-p btn-block">Send Message</button>
          </form>}
      </div>
    </div></section>
    <section className="sec tight"><div className="wrap"><Faq /></div></section>
  </>
}

export function Terms() {
  return <>
    <Seo title="Terms and Conditions | Crafted Skills" desc="Crafted Skills Terms and Conditions, including the 24-hour refund policy." />
    <PageHero eyebrow="Legal" title="Terms and Conditions" lead={TERMS.updated} />
    <section className="sec tight"><div className="wrap" style={{ maxWidth: 900 }}>
      <div className="panel">
        <h2 style={{ fontSize: 22 }}>Welcome to Crafted Skills</h2>
        {TERMS.intro.map((p) => <p key={p} className="muted" style={{ marginTop: 12 }}>{p}</p>)}
        {TERMS.sections.map((s) => <div key={s.h} style={{ marginTop: 30 }}>
          <h3 style={{ fontSize: 19, marginBottom: 10 }}>{s.h}</h3>
          {s.list && <ul style={{ paddingLeft: 20, display: 'grid', gap: 8, color: 'var(--muted)' }}>{s.list.map((l) => <li key={l}>{l}</li>)}</ul>}
          {s.text && <p className="muted">{s.text}</p>}
          {s.note && <div className="alert info" style={{ marginTop: 14 }}>{s.note}</div>}
        </div>)}
        <p className="muted" style={{ marginTop: 30 }}>{TERMS.outro}</p>
        <p className="dim" style={{ marginTop: 8 }}>{TERMS.updated}</p>
      </div>
    </div></section>
  </>
}

export function NotFound() {
  return <><Seo title="Page not found | Crafted Skills" /><PageHero eyebrow="404" title="This page took a different path." lead={HOME.closingText}><div className="ctas"><Link to="/" className="btn btn-p">Go home</Link><Link to="/courses" className="btn btn-g">Explore Our Courses</Link></div></PageHero></>
}
