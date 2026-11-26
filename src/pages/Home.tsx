import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ALL_SKILLS, AFFILIATE, BUNDLES, FAQ, FOUNDERS, HOME, SITE, TESTIMONIALS, WHO, WHY, ABOUT, inr } from '../data/site'
import Ring from '../components/Ring'
import { Count, DriftRows, Logo3D, ScrollStage, ScrollWords } from '../components/motion'
import { Icon, Seo, useTilt } from '../components/ui'

function Hero() {
  const tilt = useTilt<HTMLDivElement>()
  const [a, b] = HOME.heroTitle.split(' in Kannada ')
  return <section className="hero">
    <div className="aurora" /><div className="gridbg" />
    <div className="wrap hero-grid">
      <div>
        <span className="kchip kn he" style={{ ["--d" as string]: "0ms" }} lang="kn"><i />{SITE.kannadaLine}</span>
        <h1 className="h1 he" style={{ ["--d" as string]: "90ms" }}>{a} <em className="grad">in Kannada</em> {b}</h1>
        <p className="lead he" style={{ ["--d" as string]: "220ms" }}>{HOME.heroIntro}</p>
        <div className="ctas he" style={{ ["--d" as string]: "320ms" }}>
          <Link to="/courses" className="btn btn-p">Explore Our Courses <svg className="arrow" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 10h12M11 5l5 5-5 5" /></svg></Link>
          <Link to="/affiliate" className="btn btn-g">Become an Affiliate</Link>
        </div>
      </div>
      <div className="stage he-stage" ref={tilt}>
        <div className="ring" /><div className="ring ring2" /><div className="orb" />
        <div className="mk3"><Logo3D /></div>
        <div className="tag">LEARN <b>·</b> CREATE <b>·</b> GROW</div>
        <div className="fcard fc1" data-d="26"><small>Learner dashboard</small><strong>Continue your course</strong><div className="bar"><i /></div></div>
        <div className="fcard fc2" data-d="-22"><small>Affiliate dashboard</small><strong>Your referral link</strong><div className="lk">craftedskills.in/r/…<em>Copy</em></div></div>
        <div className="fcard fc3" data-d="16"><span className="k kn">ಕ</span><strong>Learn in Kannada</strong></div>
      </div>
    </div>
    <div className="wrap"><div className="why he" style={{ ["--d" as string]: "460ms" }} aria-label="Why Crafted Skills?">{WHY.map((w) => <div key={w.t}><b>{w.t}</b><p>{w.d}</p></div>)}</div></div>
  </section>
}

function Marquee() {
  const list = [...new Set(ALL_SKILLS)]
  return <div className="marq" aria-label="Skills you can learn">
    <div className="lbl">What you can learn in Kannada</div>
    <div className="track">{[...list, ...list].map((s, i) => <span key={i} aria-hidden={i >= list.length}>{s}</span>)}</div>
  </div>
}

function PlatformPreview() {
  return <ScrollStage className="tilt-in"><div className="frame"><div className="frame-in dash-prev">
    <div className="dp-side"><div className="b"><img src="img/mark-light.webp" alt="" />My learning</div>
      {['Overview', 'My bundles', 'Course player', 'Purchases', 'Certificates', 'Affiliate'].map((t, i) => <span key={t} className={i === 1 ? 'on' : ''}>{t}</span>)}</div>
    <div className="dp-main">
      <div className="dp-row"><div className="dp-stat"><small>Bundles</small><b>2</b></div><div className="dp-stat"><small>Courses</small><b>7</b></div><div className="dp-stat"><small>Language</small><b className="kn">ಕನ್ನಡ</b></div></div>
      {BUNDLES.slice(1, 4).map((b, i) => <div className="dp-card" key={b.slug} style={{ ['--j' as string]: i }}><img src={b.image} alt="" loading="lazy" /><div><b>{b.name}</b><p>{b.courses.map((c) => c.name).join(' · ')}</p><div className="prog"><i style={{ width: [64, 28, 8][i] + '%' }} /></div></div><span className="btn btn-g btn-sm">Open</span></div>)}
    </div>
  </div></div></ScrollStage>
}

function Console() {
  const bars = [3, 5, 4, 7, 6, 9, 8, 11, 9, 12, 14, 13, 16, 18]
  return <div className="frame rv grow"><div className="frame-in console">
    <div className="top"><span className="live">Affiliate dashboard</span><span className="pill">Sample data</span></div>
    <div className="kpis">
      <div className="kpi"><small>Link clicks</small><b><Count to={248} /></b><em>every visit from your link</em></div>
      <div className="kpi"><small>Sign-ups</small><b><Count to={36} /></b><em>people who joined</em></div>
      <div className="kpi"><small>Sales</small><b><Count to={14} /></b><em>bundles bought</em></div>
      <div className="kpi"><small>Sales value</small><b><Count to={58486} prefix="₹" /></b><em>commission to your UPI / bank</em></div>
    </div>
    <div className="chart"><div className="lg"><span><i style={{ background: 'var(--violet)' }} />Clicks</span><span><i style={{ background: '#e5c8ff' }} />Sales</span></div>
      <svg viewBox="0 0 280 100" preserveAspectRatio="none">{bars.map((v, i) => <g key={i} className="gbar" style={{ ["--j" as string]: i }}><rect x={i * 20 + 3} y={100 - v * 5.5} width="8" height={v * 5.5} rx="2" fill="#b363f3" opacity=".85" /><rect x={i * 20 + 12} y={100 - v * 2} width="5" height={v * 2} rx="2" fill="#e5c8ff" /></g>)}</svg>
    </div>
    <div className="copyrow"><input className="input" readOnly value="craftedskills.in/#/?ref=YOURCODE" aria-label="Sample referral link" /><span className="btn btn-p btn-sm"><Icon n="copy" s={16} />Copy</span></div>
  </div></div>
}

function Testimonials() {
  const [open, setOpen] = useState<number | null>(null)
  const t = open == null ? null : TESTIMONIALS[open]
  return <>
    <DriftRows items={TESTIMONIALS} render={(x, i) => <button className="card tcard" onClick={() => setOpen(i)} aria-label={`Read ${x.name}'s story`}>
      <div className="who"><img src={x.photo} alt="" loading="lazy" width="56" height="56" /><div><b>{x.name}</b><small>Crafted Skills student</small></div></div>
      <p lang="kn" className="clamp">{x.text}</p><span className="more">Read full story</span>
    </button>} />
    {t && <div className="story-veil" onClick={(e) => e.target === e.currentTarget && setOpen(null)} role="dialog" aria-modal="true" aria-label={`${t.name}'s story`}>
      <div className="story card"><button className="x" onClick={() => setOpen(null)} aria-label="Close">✕</button>
        <div className="who"><img src={t.photo} alt={t.name} width="72" height="72" /><div><b>{t.name}</b><small>Crafted Skills student</small></div></div>
        <p lang="kn">{t.text}</p>
        <div className="story-nav"><button className="btn btn-g btn-sm" onClick={() => setOpen((open! + TESTIMONIALS.length - 1) % TESTIMONIALS.length)}>← Previous</button><button className="btn btn-g btn-sm" onClick={() => setOpen((open! + 1) % TESTIMONIALS.length)}>Next →</button></div>
      </div></div>}
  </>
}

export function Faq() {
  const [o, setO] = useState(0)
  return <div className="chat rv">
    <div className="hd"><img src="img/mark-light.webp" alt="" /><div><b>Crafted Skills</b>Questions, answered</div></div>
    {FAQ.map((f, i) => <div key={f.q} className={`qa ${o === i ? 'open' : ''}`}>
      <button onClick={() => setO(o === i ? -1 : i)} aria-expanded={o === i}>{f.q}<span className="plus" aria-hidden="true">+</span></button>
      <div className="ans"><div><div className="bubble">{f.a}</div></div></div>
    </div>)}
  </div>
}

const whoIcon: Record<string, string> = { home: 'home', cap: 'cap', case: 'case', idea: 'idea' }

export default function Home() {
  return <>
    <Seo title="Crafted Skills (CraftedSkills) | Learn Digital Skills in Kannada" desc="Crafted Skills – learn practical digital skills in Kannada and build your dreams from home. Course bundles, affiliate program and student dashboard. Karnataka." />
    <Hero />
    <Marquee />

    <section className="sec">
      <div className="wrap">
        <div className="head center rv"><span className="eyebrow">The platform</span><h2 className="h2">{HOME.introTitle}</h2><p className="lead">{HOME.introText}</p></div>
        <PlatformPreview />
        <p className="center" style={{ marginTop: 26 }}><Link to="/about" className="link">About Crafted Skills</Link></p>
      </div>
    </section>

    <section className="sec" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="head center rv"><span className="eyebrow">Course bundles</span><h2 className="h2">Explore Our Course Bundles</h2><p className="lead">Learn practical digital skills in Kannada and take the next step toward your goals.</p></div>
        <Ring />
        <p className="center" style={{ marginTop: 22 }}><Link to="/courses" className="btn btn-g">See all 7 bundles · from {inr(BUNDLES[0].price)}</Link></p>
      </div>
    </section>

    <section className="sec" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="head center rv"><span className="eyebrow">How it works</span><h2 className="h2">3 steps to get started</h2></div>
        <ScrollStage className="g3 steps3d"><i className="steps-line" aria-hidden="true" />
          <div className="card step" style={{ ['--j' as string]: 0 }}><span className="no">01</span><div className="ic"><Icon n="user" /></div><h3>Create your account</h3><p>Sign up in a minute and choose the course bundle that fits your goal.</p></div>
          <div className="card step hot" style={{ ['--j' as string]: 1 }}><span className="no">02</span><div className="ic"><Icon n="play" /></div><h3>Learn in Kannada</h3><p>{WHY[2].d} Learn at your own pace from your dashboard.</p></div>
          <div className="card step" style={{ ['--j' as string]: 2 }}><span className="no">03</span><div className="ic"><Icon n="rupee" /></div><h3>Recommend &amp; earn</h3><p>{AFFILIATE.line}</p></div>
        </ScrollStage>
      </div>
    </section>

    <section className="sec" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="head center rv"><span className="eyebrow">For everyone</span><h2 className="h2">Who Can Join Our Courses</h2></div>
        <div className="g4">{WHO.map((w) => <div key={w.t} className="card glowy rv"><div className="ic"><Icon n={whoIcon[w.icon]} /></div><h3>{w.t}</h3><p>{w.d}</p></div>)}</div>
      </div>
    </section>

    <section className="sec" style={{ paddingTop: 0 }}>
      <div className="wrap split">
        <div className="photo rv" style={{ aspectRatio: '6/5' }}><img src="img/about-main.webp" alt="A woman learning digital skills on her laptop at home" loading="lazy" width="1195" height="991" /></div>
        <div className="rv">
          <span className="eyebrow">About us</span>
          <h2 className="h2" style={{ margin: '14px 0 18px' }}>{HOME.aboutTitle.replace(' :', '')}</h2>
          {HOME.aboutLines.map((l) => <p key={l} className="lead" style={{ marginBottom: 10 }}>{l}</p>)}
          <div className="tiles"><div><Icon n="lang" />{HOME.aboutTiles[0]}</div><div><Icon n="bulb" />{HOME.aboutTiles[1]}</div><div><Icon n="sprout" />{HOME.aboutTiles[2]}</div></div>
          <div className="ctas"><Link to="/courses" className="btn btn-p">Explore Our Courses</Link></div>
        </div>
      </div>
    </section>

    <section className="sec" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="head center rv"><span className="eyebrow">The people behind Crafted Skills</span><h2 className="h2">Meet Our Founders</h2><p className="lead">A shared mission to make digital skills accessible to everyone, in Kannada.</p></div>
        <div className="founders">{FOUNDERS.map((f) => <ScrollStage key={f.name} className="card fnd rv">
          <div className="ph para"><img src={f.photo} alt={`${f.name}, ${f.role} of Crafted Skills`} loading="lazy" width="720" height="1292" /></div>
          <div><span className="role">{f.role}</span><h3>{f.name}</h3><div className="pl">{f.place}</div>{(f.name === 'Rachana' ? [0, 1, 3, 5] : [0, 3]).map((k) => <p key={k} style={{ marginTop: k ? 10 : 0 }}>{f.bio[k]}</p>)}<p style={{ marginTop: 14 }}><Link to="/about" className="link">Read her story</Link></p></div>
        </ScrollStage>)}</div>
        <p className="center" style={{ marginTop: 26 }}><Link to="/contact" className="btn btn-g">Get in touch</Link></p>
      </div>
    </section>

    <section className="statement">
      <div className="wrap">
        <ScrollWords className="big" lang="kn" text={SITE.kannadaLine} />
        <ScrollWords className="lead mline" text={ABOUT.missionLine} />
      </div>
    </section>

    <section className="sec" style={{ paddingTop: 0 }}>
      <div className="wrap g2" style={{ alignItems: 'center' }}>
        <div className="rv">
          <span className="eyebrow">Affiliate program</span>
          <h2 className="h2" style={{ margin: '14px 0 18px' }}>Your own dashboard to share, track and earn</h2>
          <p className="lead">{AFFILIATE.line} Every click, sign-up and sale from your link shows up live, and payouts go straight to your UPI or bank account.</p>
          <div className="ctas"><Link to="/signup?role=affiliate" className="btn btn-p">Become an Affiliate</Link><Link to="/affiliate" className="btn btn-g">How it works</Link></div>
        </div>
        <Console />
      </div>
    </section>

    <section className="sec" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="head center rv"><span className="eyebrow">Student stories</span><h2 className="h2">Feedback From Our Students</h2><p className="lead">Real words from real learners — tap any story to read it in full.</p></div>
        <Testimonials />
      </div>
    </section>

    <section className="sec" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="head center rv"><span className="eyebrow">FAQ</span><h2 className="h2">Everything you're wondering</h2></div>
        <Faq />
      </div>
    </section>

    <section className="wrap">
      <div className="cta rv">
        <h2 className="h2">{HOME.closingTitle}</h2>
        <p className="lead" style={{ maxWidth: 34 + 'em', margin: '16px auto 0' }}>{HOME.closingText}</p>
        <div className="ctas"><Link to="/courses" className="btn btn-w">Explore Our Courses</Link><Link to="/signup" className="btn btn-g">Create free account</Link></div>
        <div className="trust"><span>Learn in Kannada</span><span>24-hour refund policy</span><span>Secure checkout</span></div>
      </div>
    </section>
  </>
}
