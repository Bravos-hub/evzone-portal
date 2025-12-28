export type CommsChannel = 'Status page' | 'Ops' | 'In-app' | 'Email' | 'SMS'
export type CommsStatus = 'Draft' | 'Scheduled' | 'Sending' | 'Sent' | 'Failed'

export type AudienceSegment = {
  id: string
  label: string
  description: string
  estimate: number
  filters: Record<string, string>
}

export type CommsTemplate = {
  id: string
  name: string
  channel: CommsChannel
  subject?: string
  body: string
  tags: string[]
  updatedAt: string
  owner: string
}

export type CommsMessage = {
  id: string
  title: string
  channel: CommsChannel
  status: CommsStatus
  audienceId: string
  audienceLabel: string
  createdAt: string
  scheduledFor?: string
  sentAt?: string
  owner: string
  subject?: string
  body: string
  metrics?: {
    attempted: number
    delivered: number
    failed: number
    openRate?: number // 0..1
    clickRate?: number // 0..1
  }
}

const KEY = 'mock.comms.center.v1'

type Store = {
  messages: CommsMessage[]
  templates: CommsTemplate[]
  audiences: AudienceSegment[]
}

function nowIso() {
  return new Date().toISOString()
}

function seed(): Store {
  const audiences: AudienceSegment[] = [
    { id: 'AUD-ALL', label: 'All users', description: 'All roles, all regions', estimate: 24820, filters: { scope: 'global' } },
    { id: 'AUD-OPS-AFR', label: 'Ops (AFRICA)', description: 'Operator + Admin users in AFRICA', estimate: 214, filters: { region: 'AFRICA', roles: 'EVZONE_ADMIN,EVZONE_OPERATOR' } },
    { id: 'AUD-OWN-AFR', label: 'Owners (AFRICA)', description: 'Station owners and site owners in AFRICA', estimate: 1320, filters: { region: 'AFRICA', roles: 'OWNER,SITE_OWNER' } },
    { id: 'AUD-STA-AFR', label: 'Station staff (AFRICA)', description: 'Managers / attendants / station admins', estimate: 860, filters: { region: 'AFRICA', roles: 'MANAGER,ATTENDANT,STATION_ADMIN' } },
  ]

  const templates: CommsTemplate[] = [
    {
      id: 'TPL-STAT-001',
      name: 'Status page — Incident update',
      channel: 'Status page',
      body:
        'We are investigating reports of degraded service.\n\nImpact: Intermittent delays for a subset of users.\nMitigation: Engineers are applying staged fixes and monitoring recovery.\nNext update: within 30–60 minutes.\n\n— EVzone Operations',
      tags: ['status', 'incident', 'public'],
      updatedAt: '2025-12-26 09:12',
      owner: 'Delta (Admin)',
    },
    {
      id: 'TPL-OPS-001',
      name: 'Ops broadcast — On-call heads-up',
      channel: 'Ops',
      body:
        'Heads up: elevated errors detected.\n\nAction:\n- Check dashboards\n- Confirm mitigation owner\n- Post update in #ops-oncall\n\nRunbook: PB-PAY-001',
      tags: ['ops', 'internal'],
      updatedAt: '2025-12-20 18:41',
      owner: 'SRE Oncall',
    },
    {
      id: 'TPL-EMAIL-001',
      name: 'Customer email — Service advisory',
      channel: 'Email',
      subject: 'Service advisory: intermittent delays',
      body:
        'Hello,\n\nWe are currently investigating intermittent delays affecting some sessions.\n\nWhat you can expect:\n- We are applying mitigations\n- We will share another update within 60 minutes\n\nThanks,\nEVzone Support',
      tags: ['customer', 'email'],
      updatedAt: '2025-12-22 12:05',
      owner: 'Support L2',
    },
    {
      id: 'TPL-SMS-001',
      name: 'SMS — Short outage note',
      channel: 'SMS',
      body: 'EVzone update: We are investigating intermittent service delays. Next update within 60 minutes.',
      tags: ['sms', 'short'],
      updatedAt: '2025-12-21 08:18',
      owner: 'Support L2',
    },
    {
      id: 'TPL-INAPP-001',
      name: 'In-app banner — Maintenance window',
      channel: 'In-app',
      body: 'Maintenance scheduled tomorrow 02:00–03:00 UTC. Expect brief interruptions.',
      tags: ['banner', 'maintenance'],
      updatedAt: '2025-12-27 16:10',
      owner: 'Delta (Admin)',
    },
  ]

  const messages: CommsMessage[] = [
    {
      id: 'MSG-12041',
      title: 'Public incident update — payments delays',
      channel: 'Status page',
      status: 'Scheduled',
      audienceId: 'AUD-ALL',
      audienceLabel: 'All users',
      createdAt: '2025-12-28 09:40',
      scheduledFor: 'Today 10:10',
      owner: 'Delta (Admin)',
      body: templates[0].body,
    },
    {
      id: 'MSG-12012',
      title: 'Ops channel notify — charging mitigation steps',
      channel: 'Ops',
      status: 'Sent',
      audienceId: 'AUD-OPS-AFR',
      audienceLabel: 'Ops (AFRICA)',
      createdAt: '2025-12-28 08:55',
      sentAt: 'Today 09:03',
      owner: 'Operator EA',
      body: templates[1].body,
      metrics: { attempted: 1, delivered: 1, failed: 0 },
    },
    {
      id: 'MSG-11988',
      title: 'Customer email — service advisory (EA)',
      channel: 'Email',
      status: 'Draft',
      audienceId: 'AUD-OWN-AFR',
      audienceLabel: 'Owners (AFRICA)',
      createdAt: '2025-12-27 20:14',
      owner: 'Support L2',
      subject: templates[2].subject,
      body: templates[2].body,
      metrics: { attempted: 1320, delivered: 1298, failed: 22, openRate: 0.61, clickRate: 0.08 },
    },
    {
      id: 'MSG-11961',
      title: 'In-app banner — planned maintenance',
      channel: 'In-app',
      status: 'Sent',
      audienceId: 'AUD-ALL',
      audienceLabel: 'All users',
      createdAt: '2025-12-27 16:12',
      sentAt: '2025-12-27 16:13',
      owner: 'Delta (Admin)',
      body: templates[4].body,
      metrics: { attempted: 24820, delivered: 24820, failed: 0, openRate: 0.34, clickRate: 0.02 },
    },
  ]

  return { messages, templates, audiences }
}

function readStore(): Store {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as Store
  } catch {}
  const s = seed()
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
  } catch {}
  return s
}

function writeStore(next: Store) {
  localStorage.setItem(KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent('evzone:mockComms'))
}

export function loadCommsStore(): Store {
  if (typeof window === 'undefined') return seed()
  return readStore()
}

export function saveCommsStore(patch: Partial<Store>) {
  const prev = loadCommsStore()
  const next: Store = { ...prev, ...patch }
  writeStore(next)
  return next
}

export function upsertMessage(msg: CommsMessage) {
  const s = loadCommsStore()
  const idx = s.messages.findIndex((m) => m.id === msg.id)
  const next = idx >= 0 ? s.messages.map((m) => (m.id === msg.id ? msg : m)) : [msg, ...s.messages]
  return saveCommsStore({ messages: next })
}

export function upsertTemplate(tpl: CommsTemplate) {
  const s = loadCommsStore()
  const idx = s.templates.findIndex((t) => t.id === tpl.id)
  const next = idx >= 0 ? s.templates.map((t) => (t.id === tpl.id ? tpl : t)) : [tpl, ...s.templates]
  return saveCommsStore({ templates: next })
}

export function upsertAudience(aud: AudienceSegment) {
  const s = loadCommsStore()
  const idx = s.audiences.findIndex((a) => a.id === aud.id)
  const next = idx >= 0 ? s.audiences.map((a) => (a.id === aud.id ? aud : a)) : [aud, ...s.audiences]
  return saveCommsStore({ audiences: next })
}

export function genId(prefix: string) {
  const n = Math.floor(10000 + Math.random() * 90000)
  return `${prefix}-${n}`
}

export function simulateSend(msg: CommsMessage): CommsMessage {
  const estimate = Math.max(1, msg.metrics?.attempted ?? 1)
  const fail = msg.channel === 'SMS' ? Math.round(estimate * 0.03) : msg.channel === 'Email' ? Math.round(estimate * 0.02) : 0
  const delivered = estimate - fail
  const openRate = msg.channel === 'Email' || msg.channel === 'In-app' ? 0.25 + Math.random() * 0.5 : undefined
  const clickRate = msg.channel === 'Email' || msg.channel === 'In-app' ? 0.01 + Math.random() * 0.12 : undefined
  return {
    ...msg,
    status: 'Sent',
    scheduledFor: undefined,
    sentAt: 'now',
    metrics: {
      attempted: estimate,
      delivered,
      failed: fail,
      openRate,
      clickRate,
    },
  }
}


