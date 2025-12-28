import { upsertNotification } from '@/features/admin/notifications/mockNotifications'

export type KeyStatus = 'Active' | 'Revoked' | 'Expired'
export type KeyScope = 'read' | 'write' | 'admin'
export type WebhookStatus = 'Active' | 'Paused' | 'Failing'
export type SecretStatus = 'Active' | 'Rotated' | 'Retired'

export type ApiKey = {
  id: string
  name: string
  owner: string
  org: string | 'GLOBAL'
  createdAt: string
  lastUsedAt: string
  status: KeyStatus
  scopes: KeyScope[]
  maskedKey: string
  // only stored at creation time in demo
  plainKey?: string
}

export type WebhookEndpoint = {
  id: string
  org: string
  url: string
  status: WebhookStatus
  secretMasked: string
  secretPlain?: string
  events: string[]
  createdAt: string
  lastDeliveryAt: string
  successRate: number // 0..1
  p95ms: number
  retries24h: number
}

export type Secret = {
  id: string
  name: string
  kind: 'OAuth client secret' | 'Provider token' | 'Signing key'
  status: SecretStatus
  owner: string
  updatedAt: string
  lastRotatedAt: string
  masked: string
  plain?: string
  notes: string
}

export type IntegrationsAudit = {
  id: string
  when: string
  actor: string
  action: string
  target: string
  reason?: string
}

export type IntegrationsStore = {
  keys: ApiKey[]
  webhooks: WebhookEndpoint[]
  secrets: Secret[]
  audit: IntegrationsAudit[]
}

const KEY = 'mock.admin.integrations.v1'

function nowStamp() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`
}

function gen(prefix: string) {
  return `${prefix}-${Math.floor(10000 + Math.random() * 90000)}`
}

function genToken(prefix: string) {
  const part = () => Math.random().toString(16).slice(2, 10).toUpperCase()
  return `${prefix}_${part()}${part()}`
}

function mask(token: string) {
  if (!token) return '—'
  const a = token.slice(0, 6)
  const b = token.slice(-4)
  return `${a}••••••••${b}`
}

function seed(): IntegrationsStore {
  const k1 = genToken('evz')
  const k2 = genToken('evz')
  const wh1 = genToken('whsec')
  const wh2 = genToken('whsec')
  const s1 = genToken('sec')
  const s2 = genToken('sec')

  return {
    keys: [
      { id: 'KEY-1001', name: 'Billing exporter', owner: 'Finance Bot', org: 'GLOBAL', createdAt: '2025-12-20 10:30', lastUsedAt: 'Today 09:41', status: 'Active', scopes: ['read'], maskedKey: mask(k1) },
      { id: 'KEY-1002', name: 'Partner API — Volt', owner: 'Volt Mobility', org: 'VOLT_MOBILITY', createdAt: '2025-12-18 16:10', lastUsedAt: 'Today 08:12', status: 'Active', scopes: ['read', 'write'], maskedKey: mask(k2) },
      { id: 'KEY-0991', name: 'Old staging key', owner: 'SRE', org: 'GLOBAL', createdAt: '2025-10-10 09:20', lastUsedAt: '2025-11-01 12:05', status: 'Revoked', scopes: ['read'], maskedKey: 'evz_••••••••C2A1' },
    ],
    webhooks: [
      {
        id: 'WH-1001',
        org: 'VOLT_MOBILITY',
        url: 'https://hooks.company.com/evzone',
        status: 'Failing',
        secretMasked: mask(wh1),
        events: ['evz.session.completed', 'evz.payment.failed', 'evz.swap.completed'],
        createdAt: '2025-12-18 16:10',
        lastDeliveryAt: 'Today 09:41',
        successRate: 0.72,
        p95ms: 412,
        retries24h: 38,
      },
      {
        id: 'WH-0999',
        org: 'MALL_HOLDINGS',
        url: 'https://hooks.ops.example/webhook',
        status: 'Active',
        secretMasked: mask(wh2),
        events: ['evz.session.completed', 'evz.swap.completed'],
        createdAt: '2025-12-20 10:30',
        lastDeliveryAt: 'Today 09:03',
        successRate: 0.96,
        p95ms: 180,
        retries24h: 4,
      },
    ],
    secrets: [
      { id: 'SEC-2001', name: 'Stripe secret', kind: 'Provider token', status: 'Active', owner: 'Billing Ops', updatedAt: '2025-12-22 12:01', lastRotatedAt: '2025-12-22 12:01', masked: mask(s1), notes: 'Used for payments reconciliation.' },
      { id: 'SEC-2002', name: 'OAuth client (Operator)', kind: 'OAuth client secret', status: 'Rotated', owner: 'SRE Oncall', updatedAt: '2025-12-26 09:12', lastRotatedAt: '2025-12-26 09:12', masked: mask(s2), notes: 'Rotated after key leakage drill.' },
    ],
    audit: [
      { id: 'AUD-9002', when: '2025-12-26 09:12', actor: 'SRE Oncall', action: 'Rotate secret', target: 'SEC-2002', reason: 'Leakage drill' },
      { id: 'AUD-9001', when: '2025-12-22 12:01', actor: 'Billing Ops', action: 'Create provider token', target: 'SEC-2001' },
      { id: 'AUD-9000', when: '2025-12-20 10:30', actor: 'Delta (Admin)', action: 'Create API key', target: 'KEY-1001' },
    ],
  }
}

function readStore(): IntegrationsStore {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as IntegrationsStore
  } catch {}
  const s = seed()
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
  } catch {}
  return s
}

function writeStore(next: IntegrationsStore) {
  localStorage.setItem(KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent('evzone:mockIntegrations'))
}

export function loadIntegrations(): IntegrationsStore {
  if (typeof window === 'undefined') return seed()
  return readStore()
}

export function appendAudit(entry: Omit<IntegrationsAudit, 'id' | 'when'>) {
  const s = loadIntegrations()
  const next: IntegrationsAudit = { id: gen('AUD'), when: nowStamp(), ...entry }
  writeStore({ ...s, audit: [next, ...s.audit].slice(0, 40) })
  return next
}

export function createApiKey(input: { name: string; owner: string; org: string | 'GLOBAL'; scopes: KeyScope[] }, actor: string) {
  const s = loadIntegrations()
  const plain = genToken('evz')
  const row: ApiKey = {
    id: gen('KEY'),
    name: input.name,
    owner: input.owner,
    org: input.org,
    createdAt: nowStamp(),
    lastUsedAt: '—',
    status: 'Active',
    scopes: input.scopes,
    maskedKey: mask(plain),
    plainKey: plain,
  }
  writeStore({ ...s, keys: [row, ...s.keys] })
  appendAudit({ actor, action: 'Create API key', target: row.id, reason: `Scopes: ${input.scopes.join(', ')}` })
  upsertNotification({
    id: gen('NTF'),
    when: 'now',
    kind: 'Security',
    severity: 'Medium',
    title: 'API key created',
    body: `${row.id} • ${row.name} (${row.org})`,
    status: 'Unread',
    source: 'integrations',
    region: 'GLOBAL',
    tags: ['api-key'],
    link: '/admin/integrations',
  })
  return row
}

export function revokeApiKey(id: string, actor: string, reason: string) {
  const s = loadIntegrations()
  writeStore({ ...s, keys: s.keys.map((k) => (k.id === id ? { ...k, status: 'Revoked' } : k)) })
  appendAudit({ actor, action: 'Revoke API key', target: id, reason })
}

export function rotateWebhookSecret(id: string, actor: string) {
  const s = loadIntegrations()
  const plain = genToken('whsec')
  writeStore({
    ...s,
    webhooks: s.webhooks.map((w) => (w.id === id ? { ...w, secretMasked: mask(plain), secretPlain: plain, updatedAt: nowStamp() as any } : w)),
  } as any)
  appendAudit({ actor, action: 'Rotate webhook secret', target: id })
  return plain
}

export function toggleWebhook(id: string, actor: string) {
  const s = loadIntegrations()
  const w = s.webhooks.find((x) => x.id === id)
  if (!w) return
  const nextStatus: WebhookStatus = w.status === 'Paused' ? 'Active' : 'Paused'
  writeStore({ ...s, webhooks: s.webhooks.map((x) => (x.id === id ? { ...x, status: nextStatus } : x)) })
  appendAudit({ actor, action: nextStatus === 'Paused' ? 'Pause webhook' : 'Resume webhook', target: id })
}

export function createSecret(input: { name: string; kind: Secret['kind']; owner: string; notes: string }, actor: string) {
  const s = loadIntegrations()
  const plain = genToken('sec')
  const row: Secret = {
    id: gen('SEC'),
    name: input.name,
    kind: input.kind,
    status: 'Active',
    owner: input.owner,
    updatedAt: nowStamp(),
    lastRotatedAt: nowStamp(),
    masked: mask(plain),
    plain,
    notes: input.notes,
  }
  writeStore({ ...s, secrets: [row, ...s.secrets] })
  appendAudit({ actor, action: 'Create secret', target: row.id, reason: row.kind })
  return row
}

export function rotateSecret(id: string, actor: string) {
  const s = loadIntegrations()
  const plain = genToken('sec')
  writeStore({
    ...s,
    secrets: s.secrets.map((x) =>
      x.id === id ? { ...x, status: 'Rotated', lastRotatedAt: nowStamp(), updatedAt: nowStamp(), masked: mask(plain), plain } : x,
    ),
  })
  appendAudit({ actor, action: 'Rotate secret', target: id })
  return plain
}

export function retireSecret(id: string, actor: string) {
  const s = loadIntegrations()
  writeStore({ ...s, secrets: s.secrets.map((x) => (x.id === id ? { ...x, status: 'Retired' } : x)) })
  appendAudit({ actor, action: 'Retire secret', target: id })
}


