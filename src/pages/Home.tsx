import { Fragment, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ABOUT, AFFILIATE, ALL_SKILLS, BUNDLES, FAQ, FOUNDERS, HOME, SITE, TESTIMONIALS, WHO, WHY } from '../data/site'
import { Count, GrowIn, Orbit, Parallax, Rail, ScrollWords, SplitH, Steps, TiltIn, useHeroScroll } from '../components/motion'
import { BundleCard, Icon, Mark, Seo } from '../components/ui'

const d = (ms: number) => ({ ['--d' as string]: ms + 'ms' })
/* headline words rise one by one from behind a mask */
function Words({ text, start }: { text: string; start: number }) {
  return <>{text.split(' ').map((w, i, a) => <Fragment key={i}><span className="hw"><span style={{ ['--i' as string]: start + i }}>{w}</span></span>{i < a.length - 1 ? ' ' : ''}</Fragment>)}</>
}

function Hero() {
  const [a, b] = HOME.heroTitle.split(' in Kannada ')
  return <section className="hero">
    <div className="wrap hero-grid">
      <div className="hero-copy">
        <span className="kchip kn he" style={d(0)} lang="kn"><i />{SITE.kannadaLine}</span>
        <h1 className="h1 hero-h"><Words text={a} start={0} /> <em className="kmark"><Words text="in Kannada" start={a.split(' ').length} /><svg className="swoosh" viewBox="0 0 300 24" preserveAspectRatio="none" aria-hidden="true"><path pathLength={1} d="M4 17C70 6 190 3 296 11" /></svg></em> <Words text={b} start={a.split(' ').length + 2} /></h1>
        <p className="lead he" style={d(180)}>{HOME.heroIntro}</p>
        <div className="ctas he" style={d(270)}>
          <Link to="/courses" className="btn btn-p">Explore Our Courses <svg className="arrow" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 10h12M11 5l5 5-5 5" /></svg></Link>
          <Link to="/affiliate" className="btn btn-g">Become an Affiliate</Link>
        </div>
        <div className="facts he" style={d(360)}>
          <div><b><Count to={BUNDLES.length} hero /></b><span>course bundles</span></div>
          <div><b className="kn" lang="kn">ಕನ್ನಡ</b><span>classes in Kannada</span></div>
          <div><b><Count to={24} hero /> hr</b><span>refund policy</span></div>
        </div>
      </div>
      <div className="pic">
        <div className="arch arch-in"><img src="img/about-main.webp" alt="A woman learning digital skills on her laptop at home" width="1195" height="991" fetchPriority="high" /></div>
        <div className="lay"><div className="mini m1 he" style={d(700)}><small>My learning</small><SkillTicker /><div className="bar"><i /></div></div></div>
        <div className="lay"><div className="mini m2 he" style={d(860)}><span className="k kn">ಕ</span><b>Learn in Kannada</b></div></div>
      </div>
    </div>
  </section>
}

/* hero card: cycles through every course skill, so it speaks for all bundles */
function SkillTicker() {
  const list = [...new Set(ALL_SKILLS)]
  const [i, setI] = useState(0)
  useEffect(() => { const t = setInterval(() => setI((x) => (x + 1) % list.length), 2200); return () => clearInterval(t) }, [list.length])
  return <b className="tick-w"><span key={i}>{list[i]}</span></b>
}

function Marquee() {
  const list = [...new Set(ALL_SKILLS)]
  return <div className="marq" aria-label="Skills you can learn">
    <div className="track">{[...list, ...list].map((s, i) => <span key={i} aria-hidden={i >= list.length}>{s}</span>)}</div>
  </div>
}

function PlatformPreview() {
  return <TiltIn><div className="frame"><div className="frame-in console">
    <div className="top"><span className="live">My learning</span><span className="pill kn" lang="kn">ಕನ್ನಡ</span></div>
    {BUNDLES.slice(1, 4).map((b, i) => <div className="dp-card" key={b.slug}>
      <img src={b.image} alt="" loading="lazy" width="1200" height="391" />
      <div><b>{b.name}</b><p>{b.courses.length} courses · {['Continue', 'Start', 'Start'][i]}</p><div className="prog"><i style={{ width: [64, 18, 6][i] + '%' }} /></div></div>
    </div>)}
  </div></div></TiltIn>
}

function Console() {
  const bars = [3, 5, 4, 7, 6, 9, 8, 11, 9, 12, 14, 13, 16, 18]
  return <div className="frame rv grow"><div className="frame-in console">
    <div className="top"><span className="live">Affiliate dashboard</span><span className="pill">Sample data</span></div>
    <div className="kpis">
      <div className="kpi"><small>Link clicks</small><b><Count to={248} /></b><em>visits from your link</em></div>
      <div className="kpi"><small>Sign-ups</small><b><Count to={36} /></b><em>people who joined</em></div>
      <div className="kpi"><small>Sales</small><b><Count to={14} /></b><em>bundles bought</em></div>
      <div className="kpi"><small>Sales value</small><b><Count to={58486} prefix="₹" /></b><em>commission to your UPI</em></div>
    </div>
    <div className="chart"><div className="lg"><span><i style={{ background: 'var(--indigo)' }} />Clicks</span><span><i style={{ background: 'var(--vio2)' }} />Sales</span></div>
      <svg viewBox="0 0 280 100" preserveAspectRatio="none">{bars.map((v, i) => <g key={i} className="gbar" style={{ ['--j' as string]: i }}><rect x={i * 20 + 3} y={100 - v * 5.5} width="8" height={v * 5.5} rx="2" fill="#320182" /><rect x={i * 20 + 12} y={100 - v * 2} width="5" height={v * 2} rx="2" fill="#b363f3" /></g>)}</svg>
    </div>
  </div></div>
}

function Testimonials() {
  const [open, setOpen] = useState<number | null>(null)
  const t = open == null ? null : TESTIMONIALS[open]
  return <>
    <Rail stagger count={TESTIMONIALS.length} head={<><span className="eyebrow">Student stories</span><SplitH text="Feedback From Our Students" style={{ marginTop: 10 }} /><p className="lead">Real words from real learners — tap a story to read it in full.</p></>}>
      {TESTIMONIALS.map((x, i) => <button key={x.name} className="card tcard" onClick={() => setOpen(i)} aria-label={`Read ${x.name}'s story`}>
        <div className="who"><img src={x.photo} alt="" loading="lazy" decoding="async" width="112" height="140" /><div><b>{x.name}</b><small>Crafted Skills student</small></div></div>
        <div className="qm" aria-hidden="true">“</div>
        <p lang="kn">{x.text}</p><span className="more">Read full story →</span>
      </button>)}
    </Rail>
    {t && <div className="veil" onClick={(e) => e.target === e.currentTarget && setOpen(null)} role="dialog" aria-modal="true" aria-label={`${t.name}'s story`}>
      <div className="story"><button className="x" onClick={() => setOpen(null)} aria-label="Close">✕</button>
        <div className="who"><img src={t.photo} alt={t.name} decoding="async" width="150" height="188" /><div><b>{t.name}</b><small>Crafted Skills student</small></div></div>
        <p lang="kn">{t.text}</p>
        <div className="story-nav"><button className="btn btn-g btn-sm" onClick={() => setOpen((open! + TESTIMONIALS.length - 1) % TESTIMONIALS.length)}>← Previous</button><button className="btn btn-g btn-sm" onClick={() => setOpen((open! + 1) % TESTIMONIALS.length)}>Next →</button></div>
      </div></div>}
  </>
}

export function Faq() {
  const [o, setO] = useState(0)
  return <div className="faq rv">{FAQ.map((f, i) => <div key={f.q} className={`qa ${o === i ? 'open' : ''}`}>
    <button onClick={() => setO(o === i ? -1 : i)} aria-expanded={o === i}>{f.q}<span className="plus" aria-hidden="true">+</span></button>
    <div className="ans"><div><p>{f.a}</p></div></div>
  </div>)}</div>
}

const whoIcon: Record<string, string> = { home: 'home', cap: 'cap', case: 'case', idea: 'idea' }

export default function Home() {
  useHeroScroll()
  return <>
    <div className="sprog" aria-hidden="true" />
    <Seo title="Crafted Skills (CraftedSkills) | Learn Digital Skills in Kannada" desc="Crafted Skills – learn practical digital skills in Kannada and build your dreams from home. Course bundles, affiliate program and student dashboard. Karnataka." />
    <Hero />
    <Marquee />

    <section className="sec tint orbit-sec">
      <div className="wrap">
        <Orbit head={<><span className="eyebrow">Course bundles</span><SplitH text="Explore Our Course Bundles" style={{ marginTop: 10 }} /><p className="lead">Learn practical digital skills in Kannada and take the next step toward your goals.</p></>}>
          {BUNDLES.map((b) => <BundleCard key={b.slug} b={b} eager />)}
        </Orbit>
        <p className="center" style={{ marginTop: 6 }}><Link to="/courses" className="btn btn-g">Compare all {BUNDLES.length} bundles</Link></p>
      </div>
    </section>

    <section className="sec">
      <div className="wrap split">
        <div className="rv">
          <span className="eyebrow">The platform</span>
          <SplitH text={HOME.introTitle} style={{ margin: '12px 0 16px' }} />
          <p className="lead">{HOME.introText}</p>
          <div className="tiles stg"><div><Icon n="book" />Your own learning dashboard</div><div><Icon n="rupee" />Affiliate dashboard</div><div><Icon n="award" />Certificates</div></div>
          <div className="ctas"><Link to="/signup" className="btn btn-p">Create free account</Link><Link to="/about" className="btn btn-g">About Crafted Skills</Link></div>
        </div>
        <PlatformPreview />
      </div>
    </section>

    <section className="sec tint">
      <div className="wrap">
        <div className="head center rv"><span className="eyebrow">How it works</span><SplitH text="3 steps to get started" /></div>
        <Steps>
          <div className="card step"><span className="no">01</span><div className="ic"><Icon n="user" /></div><h3>Create your account</h3><p>Sign up in a minute and choose the course bundle that fits your goal.</p></div>
          <div className="card step hot"><span className="no">02</span><div className="ic"><Icon n="play" /></div><h3>Learn in Kannada</h3><p>{WHY[2].d} Learn at your own pace from your dashboard.</p></div>
          <div className="card step"><span className="no">03</span><div className="ic"><Icon n="rupee" /></div><h3>Recommend &amp; earn</h3><p>{AFFILIATE.line}</p></div>
        </Steps>
      </div>
    </section>

    <section className="sec">
      <div className="wrap">
        <div className="head center rv"><span className="eyebrow">For everyone</span><SplitH text="Who Can Join Our Courses" /></div>
        <div className="g4 stg">{WHO.map((w) => <div key={w.t} className="card who-card"><div className="ic"><Icon n={whoIcon[w.icon]} /></div><h3>{w.t}</h3><p>{w.d}</p></div>)}</div>
        <div className="head center rv" style={{ marginTop: 'clamp(30px,3.4vw,44px)' }}><span className="eyebrow">Why Crafted Skills?</span></div>
        <div className="g4 stg">{WHY.map((w) => <div key={w.t} className="why-item"><b><Icon n="check" s={18} />{w.t}</b><p>{w.d}</p></div>)}</div>
      </div>
    </section>

    <section className="sec tint">
      <div className="wrap split">
        <div className="photo wipe" style={{ aspectRatio: '3/2' }}><img src="img/hero-collage.webp" alt="Women learning digital skills from home" loading="lazy" width="1200" height="800" /></div>
        <div className="rv">
          <span className="eyebrow">About us</span>
          <SplitH text={HOME.aboutTitle.replace(' :', '')} style={{ margin: '12px 0 16px' }} />
          {HOME.aboutLines.map((l) => <p key={l} className="lead" style={{ marginBottom: 10 }}>{l}</p>)}
          <div className="tiles stg"><div><Icon n="lang" />{HOME.aboutTiles[0]}</div><div><Icon n="bulb" />{HOME.aboutTiles[1]}</div><div><Icon n="sprout" />{HOME.aboutTiles[2]}</div></div>
          <div className="ctas"><Link to="/courses" className="btn btn-p">Explore Our Courses</Link></div>
        </div>
      </div>
    </section>

    <section className="sec">
      <div className="wrap">
        <div className="head center rv"><span className="eyebrow">The people behind Crafted Skills</span><SplitH text="Meet Our Founders" /><p className="lead">A shared mission to make digital skills accessible to everyone, in Kannada.</p></div>
        <div className="founders stg">{FOUNDERS.map((f) => <Parallax key={f.name} className="card fnd">
          <div className="ph para"><img src={f.photo} alt={`${f.name}, ${f.role} of Crafted Skills`} loading="lazy" width="720" height="1292" /></div>
          <div><span className="role">{f.role}</span><h3>{f.name}</h3><div className="pl">{f.place}</div>
            {(f.name === 'Rachana' ? [0, 1, 3] : [0, 3]).map((k) => <p key={k} style={{ marginTop: k ? 10 : 0 }}>{f.bio[k]}</p>)}
            <p style={{ marginTop: 14 }}><Link to={`/founders/${f.name.toLowerCase()}`} className="link">Read her full story →</Link></p></div>
        </Parallax>)}</div>
        <p className="center" style={{ marginTop: 28 }}><Link to="/contact" className="btn btn-g">Get in touch</Link></p>
      </div>
    </section>

    <section className="statement">
      <div className="wrap">
        <ScrollWords className="big" lang="kn" text={SITE.kannadaLine} />
        <ScrollWords className="lead mline" text={ABOUT.missionLine} />
      </div>
    </section>

    <section className="sec">
      <div className="wrap g2" style={{ alignItems: 'center' }}>
        <div className="rv">
          <span className="eyebrow">Affiliate program</span>
          <SplitH text="Share, track and earn from your own dashboard" style={{ margin: '12px 0 16px' }} />
          <p className="lead">{AFFILIATE.line} Every click, sign-up and sale from your link shows up in your dashboard, and payouts go to your UPI or bank account.</p>
          <div className="ctas"><Link to="/signup?role=affiliate" className="btn btn-p">Become an Affiliate</Link><Link to="/affiliate" className="btn btn-g">How it works</Link></div>
        </div>
        <Console />
      </div>
    </section>

    <section className="sec tint">
      <div className="wrap"><Testimonials /></div>
    </section>

    <section className="sec">
      <div className="wrap">
        <div className="head center rv"><span className="eyebrow">FAQ</span><SplitH text="Questions, answered" /></div>
        <Faq />
      </div>
    </section>

    <section className="wrap"><GrowIn>
      <div className="cta">
        <Mark className="bm cta-mark" />
        <SplitH text={HOME.closingTitle} style={{ marginTop: 18 }} />
        <p className="lead" style={{ maxWidth: '34em', margin: '16px auto 0' }}>{HOME.closingText}</p>
        <div className="ctas"><Link to="/courses" className="btn btn-w">Explore Our Courses</Link><Link to="/signup" className="btn btn-o">Create free account</Link></div>
        <div className="trust"><span>Learn in Kannada</span><span>24-hour refund policy</span><span>Secure checkout</span></div>
      </div>
    </GrowIn></section>
  </>
}
