import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ABOUT, AFFILIATE, BUNDLES, CONTACT, FOUNDERS, HOME, SITE, TERMS, inr } from '../data/site'
import { BundleCard, FbIcon, Icon, IgIcon, Mark, Seo, WaIcon, waLink } from '../components/ui'
import { useMemo } from 'react'
import { Showcase, SplitH } from '../components/motion'
import { getProduct, ownsBundle, saveMessage, useStore } from '../lib/store'
import { Faq } from './Home'

export function PageHero({ eyebrow, title, lead, children, crumbs }: { eyebrow?: string; title: ReactNode; lead?: ReactNode; children?: ReactNode; crumbs?: ReactNode }) {
  return <section className="phero">
    <div className="wrap">{crumbs && <div className="crumbs">{crumbs}</div>}{eyebrow && <span className="eyebrow">{eyebrow}</span>}{typeof title === 'string' ? <SplitH as="h1" className="h1" text={title} style={{ marginTop: 14 }} /> : <h1 className="h1" style={{ marginTop: 14 }}>{title}</h1>}{lead && <p className="lead">{lead}</p>}{children}</div>
  </section>
}

export function About() {
  return <>
    <Seo title="About Crafted Skills (CraftedSkills) | Digital Skills in Kannada, Karnataka" desc={ABOUT.intro[0]} />
    <PageHero eyebrow="About us" title={<>Crafted Skills <span className="kn grad" lang="kn" style={{ display: 'block', fontSize: '.62em', marginTop: 8 }}>– {SITE.kannadaLine}</span></>} />
    <section className="sec tight"><div className="wrap split">
      <div className="photo rv" style={{ aspectRatio: '984/655' }}><img src="img/hero-collage.webp" alt="Women learning digital skills from home" width="984" height="655" /></div>
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
        <div className="ph"><img src={f.photo} alt={`${f.name}, ${f.role} of Crafted Skills`} loading="lazy" width="720" height="1279" /></div>
        <div><span className="role">{f.role}</span><h3>{f.name}</h3><div className="pl">{f.place}</div>{f.bio.slice(0, 2).map((b) => <p key={b} style={{ marginBottom: 10 }}>{b}</p>)}<Link to={`/founders/${f.name.toLowerCase()}`} className="link">Read her full story →</Link></div>
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
  const [q, setQ] = useState(''); const [f, setF] = useState<'all' | 'live' | 'u5' | 'p5'>('all')
  const pick = (k: typeof f) => setF(k)
  const trainer = db.courses.filter((c) => c.status === 'published').map((c) => getProduct('c-' + c.id)!).filter(Boolean)
  const list = useMemo(() => [...BUNDLES, ...trainer].filter((b) => {
    const t = q.trim().toLowerCase()
    const hit = !t || b.name.toLowerCase().includes(t) || b.courses.some((c) => c.name.toLowerCase().includes(t))
    const ok = f === 'all' || (f === 'live' && b.courses.some((c) => c.status === 'Available now')) || (f === 'u5' && b.price <= 5999) || (f === 'p5' && b.price > 5999)
    return hit && ok
  }), [q, f, trainer])
  return <>
    <Seo title="Course Bundles in Kannada | Crafted Skills (CraftedSkills)" desc="Explore Crafted Skills course bundles – Digital Commerce, Creators Studio, Handmade Business, Venture, Career and Finance, Passion, Beauty and Creation. Learn in Kannada." />
    <PageHero eyebrow="Courses" title="Explore Our Course Bundles" lead="Learn practical digital skills in Kannada and take the next step toward your goals." />
    <section className="sec tight" style={{ paddingTop: 8 }}><div className="wrap">
      <div className="toolbar">
        <label className="search"><Icon n="search" s={19} /><input className="input" placeholder="Search a skill, e.g. Graphic Designing" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search courses" /></label>
        <div className="pills" role="group" aria-label="Filter">{([['all', 'All bundles'], ['live', 'Available now'], ['u5', 'Up to ₹5,999'], ['p5', 'Above ₹5,999']] as const).map(([k, l]) => <button key={k} className={f === k ? 'on' : ''} onClick={() => pick(k)}>{l}</button>)}</div>
      </div>
      {list.length ? <div className="crs-show"><Showcase key={q.trim().toLowerCase() + f} count={list.length} head={<p className="muted" style={{ fontSize: 15 }}>{list.length === BUNDLES.length && !q ? 'All bundles' : `${list.length} bundle${list.length > 1 ? 's' : ''} found`} · swipe or use the arrows</p>}>{list.map((b, i) => <BundleCard key={b.slug} b={b} eager={i < 3} />)}</Showcase></div>
        : <div className="panel"><div className="empty"><div className="ei"><Icon n="search" /></div><h3>No bundle matches “{q}”</h3><p>Try another skill, or ask us on WhatsApp which bundle fits you.</p></div></div>}
    </div></section>
    <section className="wrap"><div className="cta rv"><h2 className="h2">Not sure which bundle fits you?</h2><p className="lead" style={{ margin: '14px auto 0', maxWidth: '32em' }}>{CONTACT.text}</p>
      <div className="ctas"><a className="btn btn-w" href={waLink('Hi Crafted Skills, please help me choose a course bundle.')} target="_blank" rel="noopener">Ask on WhatsApp</a><a className="btn btn-o" href={`tel:+${SITE.phoneRaw}`}>Call {SITE.phone}</a></div></div></section>
  </>
}

export function FounderPage() {
  const { slug } = useParams()
  const f = FOUNDERS.find((x) => x.name.toLowerCase() === slug)
  if (!f) return <NotFound />
  const other = FOUNDERS.find((x) => x !== f)!
  return <>
    <Seo title={`${f.name}, ${f.role} of Crafted Skills | Crafted Skills (CraftedSkills)`} desc={f.bio[0]} />
    <section className="fhero"><div className="wrap fgrid">
      <div className="fphoto"><div className="fframe"><img src={f.photo} alt={`${f.name}, ${f.role} of Crafted Skills`} width="720" height="1279" fetchPriority="high" /></div>
        <div className="fbadge"><Mark className="bm" /><div><b>{f.role}</b><span>Crafted Skills</span></div></div></div>
      <div className="fcopy">
        <div className="crumbs"><Link to="/">Home</Link> / <Link to="/about">About us</Link> / {f.name}</div>
        <span className="eyebrow">{f.role}</span>
        <SplitH as="h1" className="h1" text={f.name} style={{ marginTop: 10 }} />
        <div className="fplace"><Icon n="pin" s={18} />{f.place}</div>
        <div className="fbio">{f.bio.map((b, i) => <p key={i} className={i === 0 ? 'lead' : ''}>{b}</p>)}</div>
        <div className="ctas"><Link to="/courses" className="btn btn-p">Explore Our Courses</Link><a className="btn btn-g" href={waLink(`Hi ${f.name}, I would like to know more about Crafted Skills.`)} target="_blank" rel="noopener">Message on WhatsApp</a></div>
      </div>
    </div></section>
    <section className="sec tint"><div className="wrap">
      <Link to={`/founders/${other.name.toLowerCase()}`} className="fnext rv"><img src={other.photo} alt="" loading="lazy" /><div><span className="eyebrow">Meet the {other.role.toLowerCase()}</span><b>{other.name}</b><span className="dim">{other.place}</span></div><span className="arr">→</span></Link>
    </div></section>
  </>
}

export function BundleDetail() {
  const { slug = '' } = useParams(); const { user } = useStore()
  const b = getProduct(slug)
  if (!b) return <NotFound />
  const owned = ownsBundle(slug, user)
  const live = b.courses.filter((c) => c.status === 'Available now').length
  const buy = owned ? <Link to="/dashboard/learning" className="btn btn-p btn-block">Go to my learning</Link> : <Link to={`/checkout/${b.slug}`} className="btn btn-p btn-block">Enroll now</Link>
  const includes = ['Learn in Kannada', 'Beginner-Friendly', 'Practical Learning', 'Your own learning dashboard', 'Certificate on completion', '24-hour refund policy']
  return <div className="has-mbuy">
    <Seo title={`${b.name} – ${inr(b.price)} | Crafted Skills`} desc={`${b.name}: ${b.courses.map((c) => c.name).join(', ')}. Learn in Kannada with Crafted Skills.`} />
    <section className="dhero"><div className="wrap dgrid"><div>
      <div className="crumbs"><Link to="/">Home</Link> / <Link to="/courses">Courses</Link> / {b.name}</div>
      <span className="eyebrow">{b.slug.startsWith('c-') ? 'Course' : 'Course bundle'}</span>
      <h1 className="h1">{b.name}</h1>
      <p className="lead">Learn practical digital skills in Kannada and take the next step toward your goals.</p>
      <div className="meta"><span><Icon n="book" s={18} />{b.courses.length} courses</span><span><Icon n="check" s={18} />{live ? `${live} available now` : 'Launching soon'}</span><span><Icon n="lang" s={18} />Kannada</span><span><Icon n="user" s={18} />By Vaishnavi &amp; Rachana</span></div>
    </div><div /></div></section>
    <section className="sec tight"><div className="wrap dgrid">
      <div className="dmain">
        <div><h2>What you'll learn</h2><div className="learn">{b.courses.map((c) => <div key={c.name}><Icon n="check" s={18} /><span>{c.name}{c.status !== 'Available now' ? ' (coming soon)' : ''}</span></div>)}</div></div>
        <div><h2>Courses in this bundle</h2><div className="curr">{b.courses.map((c, i) => <div className="row" key={c.name}><span className="n">{String(i + 1).padStart(2, '0')}</span><b>{c.name}</b><span className={`st ${c.status === 'Available now' ? 'live' : 'soon'}`}>{c.status}</span></div>)}</div>
          <p className="dim" style={{ marginTop: 12, fontSize: 14 }}>New courses unlock in your dashboard as soon as they're released.</p></div>
        <div><h2>This bundle includes</h2><div className="learn">{includes.map((x) => <div key={x}><Icon n="check" s={18} /><span>{x}</span></div>)}</div></div>
        <div><h2>Your mentors</h2><div className="mentors">{FOUNDERS.map((f) => <Link to={`/founders/${f.name.toLowerCase()}`} className="mentor" key={f.name}><img src={f.photo} alt={f.name} loading="lazy" /><div><b>{f.name}</b><span>{f.role} · {f.place}</span></div></Link>)}</div></div>
        <div><h2>Refund policy</h2><div className="alert info">{TERMS.sections[1].list!.slice(0, 2).join(' ')} <Link to="/terms" className="link">Read terms</Link></div></div>
      </div>
      <aside className="buybox">
        <img src={b.image} alt="" width="1200" height="391" />
        <div className="in">
          <div className="price" style={{ fontSize: 40 }}>{inr(b.price)}</div>
          <div className="dim" style={{ fontSize: 14 }}>One-time payment · learn at your own pace</div>
          <ul>{includes.slice(0, 5).map((x) => <li key={x}><Icon n="check" s={18} />{x}</li>)}</ul>
          {buy}
          <a href={waLink(`Hi Crafted Skills, I have a question about ${b.name}.`)} target="_blank" rel="noopener" className="btn btn-g btn-block" style={{ marginTop: 10 }}>Ask on WhatsApp</a>
          <p className="dim center" style={{ fontSize: 13, marginTop: 14 }}>24-hour refund policy · Secure checkout</p>
        </div>
      </aside>
    </div></section>
    <div className="mbuy"><div><div className="price" style={{ fontSize: 26 }}>{inr(b.price)}</div><div className="dim" style={{ fontSize: 12.5 }}>{b.courses.length} courses · Kannada</div></div><div style={{ minWidth: 170 }}>{buy}</div></div>
  </div>
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
      <div className="bgrid stg">{BUNDLES.map((b) => <div key={b.slug} className="rv"><BundleCard b={b} /></div>)}</div></div></section>
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
        <a className="card" href={`mailto:${SITE.email}`}><div className="ic"><Icon n="mail" /></div><h3>Email Us</h3><p>{CONTACT.emailNote}</p><p style={{ color: 'var(--indigo)', fontWeight: 600, marginTop: 8 }}>{SITE.email}</p></a>
        <div className="card"><div className="ic"><Icon n="phone" /></div><h3>Call Us</h3><p>{CONTACT.callNote}</p><p style={{ color: 'var(--indigo)', fontWeight: 600, margin: '8px 0 14px' }}>{SITE.phone}</p>
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
