// Preview backend: everything is stored in this browser (localStorage).
// The same function names will be backed by Supabase (Auth + Postgres) once the database is connected,
// so pages don't change. See supabase/schema.sql.
import { useSyncExternalStore } from 'react'
import { bundleBySlug, type Bundle } from '../data/site'

export type Role = 'learner' | 'affiliate' | 'admin'
export type User = {
  id: string; name: string; email: string; phone: string; roles: Role[]
  refCode: string; referredBy?: string; createdAt: number
  salt: string; hash: string
  payout?: { upi?: string; holder?: string; bank?: string; ifsc?: string; account?: string }
  started?: string[] // course names started
  done?: { name: string; at: number }[] // completed courses (for certificates)
  days?: string[] // yyyy-mm-dd days with learning activity
  notes?: Record<string, string>
}
export type Order = {
  id: string; userId: string; bundle: string; amount: number; method: string
  refCode?: string; status: 'paid' | 'refund-requested' | 'refunded'; createdAt: number; paymentId: string
}
export type Click = { code: string; at: number; path: string }
export type Message = { name: string; email: string; subject: string; message: string; at: number }
export type Lesson = { title: string; url: string }
export type SellerCourse = { id: string; sellerId: string; sellerName: string; title: string; category: string; price: number; description: string; lessons: Lesson[]; status: 'draft' | 'review' | 'published' | 'rejected'; createdAt: number }
type DB = { users: User[]; orders: Order[]; clicks: Click[]; messages: Message[]; courses: SellerCourse[] }

const KEY = 'cs_db_v1', SKEY = 'cs_session', RKEY = 'cs_ref'
const empty: DB = { users: [], orders: [], clicks: [], messages: [], courses: [] }
// Preview only: accounts with these emails get the admin panel. In Supabase this is a server-side role.
export const ADMIN_EMAILS = ['hello.craftedskills@gmail.com']

function safeGet(k: string) { try { return localStorage.getItem(k) } catch { return null } }
function safeSet(k: string, v: string) { try { localStorage.setItem(k, v) } catch { /* storage blocked */ } }
function safeDel(k: string) { try { localStorage.removeItem(k) } catch { /* */ } }

let db: DB = (() => { try { return { ...empty, ...JSON.parse(safeGet(KEY) || '{}') } } catch { return { ...empty } } })()
let session: string | null = safeGet(SKEY)
const subs = new Set<() => void>()
let version = 0
function commit() { safeSet(KEY, JSON.stringify(db)); version++; subs.forEach((f) => f()) }
export function useStore() {
  useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f) }, () => version)
  return { db, user: currentUser() }
}

const rid = (p: string) => p + '_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
const enc = new TextEncoder()
const hex = (b: ArrayBuffer) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('')
async function hashPw(pw: string, salt: string) {
  const key = await crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: enc.encode(salt), iterations: 120000, hash: 'SHA-256' }, key, 256)
  return hex(bits)
}
function makeRefCode(name: string) {
  const base = name.replace(/[^a-z]/gi, '').slice(0, 5).toUpperCase() || 'CS'
  let code = ''
  do { code = base + Math.floor(100 + Math.random() * 900) } while (db.users.some((u) => u.refCode === code))
  return code
}

export function currentUser(): User | null { return db.users.find((u) => u.id === session) || null }
export const normEmail = (e: string) => e.trim().toLowerCase()

export async function signUp(input: { name: string; email: string; phone: string; password: string; role: Role }) {
  const email = normEmail(input.email)
  if (db.users.some((u) => u.email === email)) throw new Error('An account with this email already exists. Please log in.')
  const salt = rid('s')
  const ref = getStoredRef()
  const user: User = {
    id: rid('u'), name: input.name.trim(), email, phone: input.phone.trim(),
    roles: ['learner', ...(input.role !== 'learner' ? [input.role] : []), ...(ADMIN_EMAILS.includes(email) ? ['admin' as Role] : [])],
    refCode: makeRefCode(input.name), referredBy: ref && db.users.some((u) => u.refCode === ref) ? ref : undefined,
    createdAt: Date.now(), salt, hash: await hashPw(input.password, salt), started: [],
  }
  db.users.push(user); session = user.id; safeSet(SKEY, user.id); commit()
  return user
}
export async function logIn(emailIn: string, password: string) {
  const u = db.users.find((x) => x.email === normEmail(emailIn))
  if (!u || (await hashPw(password, u.salt)) !== u.hash) throw new Error('Email or password is incorrect.')
  session = u.id; safeSet(SKEY, u.id); commit(); return u
}
export function logOut() { session = null; safeDel(SKEY); commit() }
export function emailExists(e: string) { return db.users.some((u) => u.email === normEmail(e)) }
export async function resetPassword(emailIn: string, newPw: string) {
  const u = db.users.find((x) => x.email === normEmail(emailIn)); if (!u) throw new Error('No account found with this email.')
  u.salt = rid('s'); u.hash = await hashPw(newPw, u.salt); commit()
}
export async function changePassword(oldPw: string, newPw: string) {
  const u = currentUser(); if (!u) throw new Error('Please log in again.')
  if ((await hashPw(oldPw, u.salt)) !== u.hash) throw new Error('Current password is incorrect.')
  u.salt = rid('s'); u.hash = await hashPw(newPw, u.salt); commit()
}
export function updateProfile(p: Partial<Pick<User, 'name' | 'phone' | 'payout'>>) {
  const u = currentUser(); if (!u) return; Object.assign(u, p); commit()
}
export function addRole(r: Role) { const u = currentUser(); if (u && r !== 'admin' && !u.roles.includes(r)) { u.roles.push(r); commit() } }
export const becomeAffiliate = () => addRole('affiliate')
const today = () => new Date().toISOString().slice(0, 10)
function touchDay(u: User) { u.days = [...new Set([...(u.days || []), today()])].slice(-60) }
export function startCourse(name: string) { const u = currentUser(); if (u) { u.started = [...new Set([...(u.started || []), name])]; touchDay(u); commit() } }
export function completeCourse(name: string) { const u = currentUser(); if (!u) return; if (!u.started?.includes(name)) u.started = [...(u.started || []), name]; if (!u.done?.some((d) => d.name === name)) u.done = [...(u.done || []), { name, at: Date.now() }]; touchDay(u); commit() }
export function saveNote(course: string, text: string) { const u = currentUser(); if (!u) return; u.notes = { ...(u.notes || {}), [course]: text }; commit() }

// Referral tracking
export function captureRef(code: string, path: string) {
  const c = code.trim().toUpperCase(); if (!/^[A-Z0-9]{3,12}$/.test(c)) return
  safeSet(RKEY, JSON.stringify({ code: c, at: Date.now() }))
  const last = db.clicks[db.clicks.length - 1]
  if (!(last && last.code === c && Date.now() - last.at < 30000)) { db.clicks.push({ code: c, at: Date.now(), path }); commit() }
}
export function getStoredRef(): string | undefined {
  try { const r = JSON.parse(safeGet(RKEY) || 'null'); if (r && Date.now() - r.at < 30 * 864e5) return r.code } catch { /* */ }
  return undefined
}

// Orders (test-mode payments)
export function ownsBundle(slug: string, u = currentUser()) { return !!u && db.orders.some((o) => o.userId === u.id && o.bundle === slug && o.status === 'paid') }
// A product is either a Crafted Skills bundle or a course the founders published from admin
export function getProduct(slug: string): (Bundle & { seller?: string }) | undefined {
  const b = bundleBySlug(slug); if (b) return b
  const c = db.courses.find((x) => 'c-' + x.id === slug && x.status === 'published')
  return c ? { slug, name: c.title, price: c.price, image: 'img/hero-collage.webp', tint: '#cbb8ff', courses: c.lessons.map((l) => ({ name: l.title, status: 'Available now' as const })) } : undefined
}
export function placeOrder(slug: string, method: string): Order {
  const u = currentUser(); const b = getProduct(slug)
  if (!u || !b) throw new Error('Please log in to continue.')
  const own = u.refCode
  let ref = u.referredBy || getStoredRef()
  if (ref === own) ref = undefined
  const o: Order = { id: 'CS' + Date.now().toString().slice(-8), userId: u.id, bundle: slug, amount: b.price, method, refCode: ref, status: 'paid', createdAt: Date.now(), paymentId: 'pay_test_' + Math.random().toString(36).slice(2, 12) }
  db.orders.push(o); commit(); return o
}
export function requestRefund(id: string) { const o = db.orders.find((x) => x.id === id); if (o) { o.status = 'refund-requested'; commit() } }
export function saveMessage(m: Omit<Message, 'at'>) { db.messages.push({ ...m, at: Date.now() }); commit() }

export function affiliateStats(code: string) {
  const clicks = db.clicks.filter((c) => c.code === code)
  const signups = db.users.filter((u) => u.referredBy === code)
  const sales = db.orders.filter((o) => o.refCode === code && o.status === 'paid')
  const value = sales.reduce((s, o) => s + o.amount, 0)
  return { clicks, signups, sales, value }
}
export function leaderboard() {
  return db.users.filter((u) => u.roles.includes('affiliate')).map((u) => {
    const s = affiliateStats(u.refCode); return { name: u.name, code: u.refCode, sales: s.sales.length, value: s.value }
  }).sort((a, b) => b.value - a.value || b.sales - a.sales).slice(0, 10)
}

// Courses the founders add from the admin panel
export function saveCourse(c: Omit<SellerCourse, 'id' | 'sellerId' | 'sellerName' | 'createdAt'> & { id?: string }) {
  const u = currentUser(); if (!u) throw new Error('Please log in again.')
  if (!u.roles.includes('admin')) throw new Error('Only Crafted Skills admins can add courses.')
  if (c.id) { const x = db.courses.find((y) => y.id === c.id); if (x) Object.assign(x, c) }
  else db.courses.push({ ...c, id: rid('c'), sellerId: u.id, sellerName: 'Crafted Skills', createdAt: Date.now() })
  commit()
}
export function setCourseStatus(id: string, status: SellerCourse['status']) { const x = db.courses.find((y) => y.id === id); if (x) { x.status = status; commit() } }
export function deleteCourse(id: string) { const u = currentUser(); if (!u?.roles.includes('admin')) return; db.courses = db.courses.filter((c) => c.id !== id); commit() }
export function resolveRefund(id: string, approve: boolean) { const o = db.orders.find((x) => x.id === id); if (o) { o.status = approve ? 'refunded' as Order['status'] : 'paid'; commit() } }
