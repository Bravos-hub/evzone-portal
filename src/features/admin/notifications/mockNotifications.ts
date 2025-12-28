export type NotificationKind = 'Incident' | 'Security' | 'Billing' | 'System' | 'Ops' | 'Compliance'
export type NotificationSeverity = 'Info' | 'Low' | 'Medium' | 'High' | 'Critical'
export type NotificationStatus = 'Unread' | 'Read' | 'Muted'

export type NotificationRow = {
  id: string
  when: string
  kind: NotificationKind
  severity: NotificationSeverity
  title: string
  body: string
  status: NotificationStatus
  source: string
  region?: 'AFRICA' | 'EUROPE' | 'AMERICAS' | 'ASIA' | 'MIDDLE_EAST' | 'GLOBAL'
  tags: string[]
  link?: string
}

export type NotificationChannelPrefs = {
  inApp: boolean
  email: boolean
  sms: boolean
  ops: boolean
  emailAddress: string
  phone: string
  quietHoursEnabled: boolean
  quietStart: string
  quietEnd: string
}

export type NotificationRule = {
  id: string
  name: string
  enabled: boolean
  match: {
    kinds: NotificationKind[]
    minSeverity: NotificationSeverity
    region: 'ANY' | NotificationRow['region']
  }
  route: {
    to: Array<'inApp' | 'email' | 'sms' | 'ops'>
    opsChannel?: string
  }
}

export type NotificationsStore = {
  rows: NotificationRow[]
  prefs: NotificationChannelPrefs
  rules: NotificationRule[]
}

const KEY = 'mock.admin.notifications.v1'

function seed(): NotificationsStore {
  return {
    prefs: {
      inApp: true,
      email: true,
      sms: false,
      ops: true,
      emailAddress: 'ops-admin@evzone.app',
      phone: '+256 7xx xxx xxx',
      quietHoursEnabled: true,
      quietStart: '22:00',
      quietEnd: '06:00',
    },
    rules: [
      {
        id: 'RULE-001',
        name: 'SEV1/SEV2 incidents → Ops + Email',
        enabled: true,
        match: { kinds: ['Incident'], minSeverity: 'High', region: 'ANY' },
        route: { to: ['ops', 'email', 'inApp'], opsChannel: '#ops-oncall' },
      },
      {
        id: 'RULE-002',
        name: 'Security events → In-app only (admins)',
        enabled: true,
        match: { kinds: ['Security', 'Compliance'], minSeverity: 'Medium', region: 'ANY' },
        route: { to: ['inApp'] },
      },
      {
        id: 'RULE-003',
        name: 'Billing anomalies (EU) → Email',
        enabled: true,
        match: { kinds: ['Billing'], minSeverity: 'Medium', region: 'EUROPE' },
        route: { to: ['email'] },
      },
    ],
    rows: [
      {
        id: 'NTF-31021',
        when: 'now',
        kind: 'Incident',
        severity: 'Critical',
        title: 'SEV1: Payments webhook backlog growing',
        body: 'Queue depth > 48k. Top-ups delayed for a subset of users. Runbook PB-PAY-001 recommended.',
        status: 'Unread',
        source: 'payments-webhooks',
        region: 'AFRICA',
        tags: ['sev1', 'payments', 'backlog'],
        link: '/admin/incidents',
      },
      {
        id: 'NTF-30988',
        when: 'Today 09:03',
        kind: 'Ops',
        severity: 'High',
        title: 'Mitigation applied: charging config rollout',
        body: 'Staged rollout 25% → 75% completed. Monitor session start failures and OCPP errors.',
        status: 'Unread',
        source: 'operator-ops',
        region: 'AFRICA',
        tags: ['charging', 'rollout'],
        link: '/admin/ocpp',
      },
      {
        id: 'NTF-30961',
        when: 'Yesterday 20:14',
        kind: 'Security',
        severity: 'Medium',
        title: 'Privileged action: token rotation',
        body: 'Refresh tokens rotated for U-0042 (EVZONE_OPERATOR). Actor: Delta (Admin).',
        status: 'Read',
        source: 'auth',
        region: 'GLOBAL',
        tags: ['auth', 'tokens', 'audit'],
        link: '/admin/users/U-0042',
      },
      {
        id: 'NTF-30912',
        when: '2025-12-27 16:13',
        kind: 'System',
        severity: 'Low',
        title: 'Maintenance window published',
        body: 'MQTT ingest upgrade scheduled 2025-12-29 02:00–03:00 UTC. Notifications queued.',
        status: 'Read',
        source: 'global-config',
        region: 'GLOBAL',
        tags: ['maintenance', 'mqtt'],
        link: '/admin/settings',
      },
      {
        id: 'NTF-30841',
        when: '2025-12-26 09:12',
        kind: 'Compliance',
        severity: 'Medium',
        title: 'Sensitive export requested (audit logs)',
        body: 'Export EXP-22012 contains PII. Ticket: Compliance quarterly review. Link expiry: 24h.',
        status: 'Unread',
        source: 'reports',
        region: 'EUROPE',
        tags: ['export', 'pii', 'ticket'],
        link: '/admin/reports',
      },
    ],
  }
}

function readStore(): NotificationsStore {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as NotificationsStore
  } catch {}
  const s = seed()
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
  } catch {}
  return s
}

function writeStore(next: NotificationsStore) {
  localStorage.setItem(KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent('evzone:mockNotifications'))
}

export function loadNotifications(): NotificationsStore {
  if (typeof window === 'undefined') return seed()
  return readStore()
}

export function saveNotifications(next: NotificationsStore) {
  writeStore(next)
  return next
}

export function upsertNotification(row: NotificationRow) {
  const s = loadNotifications()
  const idx = s.rows.findIndex((r) => r.id === row.id)
  const nextRows = idx >= 0 ? s.rows.map((r) => (r.id === row.id ? row : r)) : [row, ...s.rows]
  return saveNotifications({ ...s, rows: nextRows })
}

export function setNotificationStatus(ids: string[], status: NotificationStatus) {
  const s = loadNotifications()
  const set = new Set(ids)
  const nextRows = s.rows.map((r) => (set.has(r.id) ? { ...r, status } : r))
  return saveNotifications({ ...s, rows: nextRows })
}

export function deleteNotifications(ids: string[]) {
  const s = loadNotifications()
  const set = new Set(ids)
  return saveNotifications({ ...s, rows: s.rows.filter((r) => !set.has(r.id)) })
}

export function updatePrefs(prefs: Partial<NotificationChannelPrefs>) {
  const s = loadNotifications()
  return saveNotifications({ ...s, prefs: { ...s.prefs, ...prefs } })
}

export function upsertRule(rule: NotificationRule) {
  const s = loadNotifications()
  const idx = s.rules.findIndex((r) => r.id === rule.id)
  const next = idx >= 0 ? s.rules.map((r) => (r.id === rule.id ? rule : r)) : [rule, ...s.rules]
  return saveNotifications({ ...s, rules: next })
}

export function genId(prefix: string) {
  const n = Math.floor(10000 + Math.random() * 90000)
  return `${prefix}-${n}`
}

export function sevRank(s: NotificationSeverity) {
  return s === 'Critical' ? 5 : s === 'High' ? 4 : s === 'Medium' ? 3 : s === 'Low' ? 2 : 1
}


