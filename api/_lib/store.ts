// Tiny key-value store for subscribers and published postings.
// Production: Upstash Redis over its REST API (add it from the Vercel Marketplace;
// it sets KV_REST_API_URL / KV_REST_API_TOKEN or UPSTASH_REDIS_REST_URL / _TOKEN).
// Local dev without those variables: an in-memory store that resets on restart.

const url = () => process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || ''
const token = () => process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || ''

export const hasDatabase = () => Boolean(url() && token())
/** On Vercel, an in-memory store would silently lose data between requests, so require Redis there. */
export const storeReady = () => hasDatabase() || !process.env.VERCEL

const mem = { kv: new Map<string, string>(), sets: new Map<string, Set<string>>() }

async function cmd<T>(...args: (string | number)[]): Promise<T> {
  const r = await fetch(url(), {
    method: 'POST',
    headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  })
  const data = (await r.json().catch(() => ({}))) as { result?: T; error?: string }
  if (!r.ok || data.error) throw new Error(`Database error: ${data.error ?? r.status}`)
  return data.result as T
}

const setOf = (key: string) => {
  let s = mem.sets.get(key)
  if (!s) mem.sets.set(key, (s = new Set()))
  return s
}

export const db = {
  async get<T>(key: string): Promise<T | null> {
    const v = hasDatabase() ? await cmd<string | null>('GET', key) : mem.kv.get(key) ?? null
    return v ? (JSON.parse(v) as T) : null
  },
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    if (!keys.length) return []
    const vals = hasDatabase() ? await cmd<(string | null)[]>('MGET', ...keys) : keys.map(k => mem.kv.get(k) ?? null)
    return vals.map(v => (v ? (JSON.parse(v) as T) : null))
  },
  async set(key: string, value: unknown) {
    const v = JSON.stringify(value)
    if (hasDatabase()) await cmd('SET', key, v)
    else mem.kv.set(key, v)
  },
  /** Returns true if the member was newly added (used to avoid sending duplicates). */
  async sadd(key: string, member: string): Promise<boolean> {
    if (hasDatabase()) return (await cmd<number>('SADD', key, member)) > 0
    const s = setOf(key)
    const added = !s.has(member)
    s.add(member)
    return added
  },
  async srem(key: string, member: string) {
    if (hasDatabase()) await cmd('SREM', key, member)
    else setOf(key).delete(member)
  },
  async smembers(key: string): Promise<string[]> {
    return hasDatabase() ? await cmd<string[]>('SMEMBERS', key) : [...setOf(key)]
  },
}

export const keys = {
  subscribers: 'igh:subs',
  subscriber: (phone: string) => `igh:sub:${phone}`,
  listings: 'igh:listings',
  listing: (id: string) => `igh:listing:${id}`,
  sent: (listingId: string, kind: string) => `igh:sent:${listingId}:${kind}`,
}
