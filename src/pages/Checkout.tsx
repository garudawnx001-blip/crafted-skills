import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { SITE, TERMS, inr } from '../data/site'
import { Icon, Seo } from '../components/ui'
import { getProduct, ownsBundle, placeOrder, useStore, type Order } from '../lib/store'
import { NotFound, PageHero } from './Public'

const METHODS = ['UPI', 'Card', 'Netbanking', 'Wallet'] as const
type M = (typeof METHODS)[number]

function PaySheet({ amount, name, onClose, onPaid }: { amount: number; name: string; onClose: () => void; onPaid: (m: string) => Order }) {
  const [m, setM] = useState<M>('UPI'); const [stage, setStage] = useState<'form' | 'proc' | 'done'>('form')
  const [upi, setUpi] = useState(''); const [app, setApp] = useState('')
  const [card, setCard] = useState({ no: '', exp: '', cvv: '', name: '' }); const [bank, setBank] = useState(''); const [wallet, setWallet] = useState('')
  const [err, setErr] = useState(''); const [order, setOrder] = useState<Order | null>(null); const nav = useNavigate()
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === 'Escape' && stage === 'form') onClose() }; addEventListener('keydown', k); return () => removeEventListener('keydown', k) }, [stage, onClose])
  const pay = () => {
    setErr('')
    if (m === 'UPI' && !app && !/^[\w.-]{2,}@[a-z]{2,}$/i.test(upi)) return setErr('Choose a UPI app or enter a valid UPI ID (e.g. name@okaxis).')
    if (m === 'Card' && (card.no.replace(/\s/g, '').length < 12 || !/^\d{2}\/\d{2}$/.test(card.exp) || card.cvv.length < 3)) return setErr('Enter the card number, expiry (MM/YY) and CVV.')
    if (m === 'Netbanking' && !bank) return setErr('Choose your bank.')
    if (m === 'Wallet' && !wallet) return setErr('Choose a wallet.')
    setStage('proc')
    setTimeout(() => { const o = onPaid(m === 'UPI' ? `UPI${app ? ' · ' + app : ''}` : m); setOrder(o); setStage('done') }, 1700)
  }
  const fmtCard = (v: string) => v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ')
  const fmtExp = (v: string) => { const d = v.replace(/\D/g, '').slice(0, 4); return d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d }
  return <div className="pay-veil" onClick={(e) => { if (e.target === e.currentTarget && stage === 'form') onClose() }} role="dialog" aria-modal="true" aria-label="Payment">
    <div className="pay">
      <div className="pay-h"><img src="img/mark.webp" alt="" /><div><b>Crafted Skills</b><small>{name}</small></div><div className="amt"><small>Amount</small><b>{inr(amount)}</b></div></div>
      <div className="testbar">TEST MODE · No money will be charged. Live Razorpay payments start after launch.</div>
      {stage === 'form' && <>
        <div className="pay-b">
          <div className="pm" role="tablist">{METHODS.map((x) => <button key={x} role="tab" aria-selected={m === x} className={m === x ? 'on' : ''} onClick={() => { setM(x); setErr('') }}>{x}</button>)}</div>
          <div className="pay-c">
            {m === 'UPI' && <><label>Pay with a UPI app</label><div className="apps">{['Google Pay', 'PhonePe', 'Paytm', 'BHIM'].map((a) => <button key={a} className={app === a ? 'on' : ''} onClick={() => { setApp(a); setUpi('') }}>{a}</button>)}</div>
              <label htmlFor="upi">Or enter UPI ID</label><input id="upi" className="pi" placeholder="yourname@okaxis" value={upi} onChange={(e) => { setUpi(e.target.value); setApp('') }} /></>}
            {m === 'Card' && <><label htmlFor="cno">Card number</label><input id="cno" className="pi" inputMode="numeric" placeholder="4111 1111 1111 1111" value={card.no} onChange={(e) => setCard({ ...card, no: fmtCard(e.target.value) })} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}><div><label htmlFor="cex">Expiry</label><input id="cex" className="pi" placeholder="MM/YY" inputMode="numeric" value={card.exp} onChange={(e) => setCard({ ...card, exp: fmtExp(e.target.value) })} /></div><div><label htmlFor="ccv">CVV</label><input id="ccv" className="pi" placeholder="123" inputMode="numeric" type="password" value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })} /></div></div>
              <label htmlFor="cnm">Name on card</label><input id="cnm" className="pi" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} />
              <small style={{ color: '#8a7fa0' }}>Test card: 4111 1111 1111 1111 · any future date · any CVV</small></>}
            {m === 'Netbanking' && <><label>Popular banks</label><div className="apps">{['SBI', 'HDFC', 'ICICI', 'Axis', 'Canara', 'Kotak'].map((b) => <button key={b} className={bank === b ? 'on' : ''} onClick={() => setBank(b)}>{b}</button>)}</div></>}
            {m === 'Wallet' && <><label>Wallets</label><div className="apps">{['Paytm', 'PhonePe', 'Amazon Pay', 'Mobikwik'].map((b) => <button key={b} className={wallet === b ? 'on' : ''} onClick={() => setWallet(b)}>{b}</button>)}</div></>}
            {err && <div style={{ color: '#c3243c', fontSize: 13, fontWeight: 600 }} role="alert">{err}</div>}
          </div>
        </div>
        <div className="pay-f"><button className="btn btn-p" onClick={pay}><Icon n="lock" s={16} />Pay {inr(amount)}</button><small>Secured checkout · Razorpay connects at launch</small></div>
      </>}
      {stage === 'proc' && <div className="pay-done"><div className="spin" /><b>Processing your payment…</b><p style={{ color: '#6b5e86', marginTop: 6, fontSize: 14 }}>Please don't close this window.</p></div>}
      {stage === 'done' && order && <div className="pay-done">
        <div className="tick"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
        <h3 style={{ fontSize: 22 }}>Payment successful</h3>
        <p style={{ color: '#6b5e86', margin: '6px 0 4px' }}>{inr(order.amount)} · Order {order.id}</p>
        <p style={{ color: '#8a7fa0', fontSize: 13 }}>Payment ID {order.paymentId}</p>
        <button className="btn btn-p" style={{ width: '100%', marginTop: 20 }} onClick={() => nav('/dashboard/learning?new=' + order.bundle)}>Start learning</button>
        <button className="btn" style={{ width: '100%', marginTop: 8, color: '#5a17c4' }} onClick={() => nav('/dashboard/purchases')}>View receipt</button>
      </div>}
    </div>
  </div>
}

export default function Checkout() {
  const { slug = '' } = useParams(); const { user } = useStore()
  const [open, setOpen] = useState(false)
  const b = getProduct(slug)
  if (!b) return <NotFound />
  const owned = ownsBundle(slug, user)
  return <>
    <Seo title={`Checkout – ${b.name} | Crafted Skills`} />
    <PageHero crumbs={<><Link to="/courses">Courses</Link> / <Link to={`/courses/${b.slug}`}>{b.name}</Link> / Checkout</>} eyebrow="Secure checkout" title="Complete your enrollment" />
    <section className="sec tight"><div className="wrap co">
      <div className="panel">
        <h2>Your details</h2>
        {!user ? <div className="form">
          <p className="muted">Log in or create a free account so your course appears in your dashboard right after payment.</p>
          <Link to={`/signup?next=/checkout/${b.slug}`} className="btn btn-p btn-block">Create account &amp; continue</Link>
          <Link to={`/login?next=/checkout/${b.slug}`} className="btn btn-g btn-block">I already have an account</Link>
        </div> : owned ? <div className="empty"><div className="ei"><Icon n="check" /></div><h3>You already own this bundle</h3><Link to="/dashboard/learning" className="btn btn-p" style={{ marginTop: 14 }}>Go to my learning</Link></div>
          : <div className="form">
            <div className="g2" style={{ gap: 12 }}>
              <div className="field"><label>Name</label><input className="input" value={user.name} readOnly /></div>
              <div className="field"><label>Mobile</label><input className="input" value={user.phone} readOnly /></div>
            </div>
            <div className="field"><label>Email (receipt is sent here)</label><input className="input" value={user.email} readOnly /></div>
            <div className="alert info">{TERMS.sections[1].list![0]}</div>
            <button className="btn btn-p btn-block" onClick={() => setOpen(true)}><Icon n="lock" s={16} />Pay {inr(b.price)}</button>
            <p className="dim" style={{ fontSize: 13 }}>Questions before paying? Call or WhatsApp {SITE.phone}.</p>
          </div>}
      </div>
      <aside className="panel sum">
        <img src={b.image} alt="" width="1200" height="391" />
        <h2 style={{ fontFamily: 'var(--display)', fontWeight: 400, fontSize: 26 }}>{b.name}</h2>
        <div className="chips" style={{ margin: '10px 0 16px' }}>{b.courses.map((c) => <span key={c.name} className={`chip ${c.status === 'Available now' ? 'live' : ''}`}>{c.name}</span>)}</div>
        <div className="ln"><span>Bundle price</span><span>{inr(b.price)}</span></div>
        <div className="ln t"><span>Total</span><span>{inr(b.price)}</span></div>
      </aside>
    </div></section>
    {open && user && <PaySheet amount={b.price} name={b.name} onClose={() => setOpen(false)} onPaid={(m) => placeOrder(b.slug, m)} />}
  </>
}
