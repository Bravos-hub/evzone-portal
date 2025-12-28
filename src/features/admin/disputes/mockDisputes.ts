import { upsertNotification } from '@/features/admin/notifications/mockNotifications'

export type Region = 'AFRICA' | 'EUROPE' | 'AMERICAS' | 'ASIA' | 'MIDDLE_EAST'
export type CaseType = 'Refund' | 'Chargeback' | 'Reversal'
export type CaseStatus = 'Open' | 'UnderReview' | 'NeedInfo' | 'Won' | 'Lost' | 'Refunded' | 'Closed'
export type Severity = 'Low' | 'Medium' | 'High'

export type EvidenceItem = {
  id: string
  type: 'Receipt' | 'ProviderDoc' | 'SessionLog' | 'Telemetry' | 'EmailThread' | 'Other'
  name: string
  url: string
  addedAt: string
  addedBy: string
}

export type CaseEvent = {
  at: string
  actor: string
  action: string
  details: string
}

export type DisputeCase = {
  id: string
  type: CaseType
  status: CaseStatus
  severity: Severity
  region: Region
  org: string
  station?: string
  provider: 'MTN' | 'Airtel' | 'Stripe' | 'Flutterwave' | 'Visa' | 'Mastercard'
  originalTxId: string
  amount: number
  currency: 'USD' | 'EUR' | 'UGX'
  reason: string
  customer: { name: string; email: string; phone: string }
  openedAt: string
  deadlineAt?: string
  updatedAt: string
  assignedTo: string
  notes: string
  evidence: EvidenceItem[]
  timeline: CaseEvent[]
}

export type DisputesStore = {
  cases: DisputeCase[]
}

const KEY = 'mock.admin.disputes.v1'

function nowStamp() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`
}

function seed(): DisputesStore {
  return {
    cases: [
      {
        id: 'DSP-31021',
        type: 'Chargeback',
        status: 'UnderReview',
        severity: 'High',
        region: 'AFRICA',
        org: 'VOLT_MOBILITY',
        station: 'ST-0001',
        provider: 'Visa',
        originalTxId: 'TX-882140',
        amount: 18.5,
        currency: 'USD',
        reason: 'Customer claims service not delivered (session failed).',
        customer: { name: 'Sarah N.', email: 'sarah@volt.co', phone: '+256 7xx xxx xxx' },
        openedAt: '2025-12-28 09:14',
        deadlineAt: '2026-01-03 23:59',
        updatedAt: '2025-12-28 09:44',
        assignedTo: 'Billing Ops',
        notes: 'Gather session logs + station telemetry for evidence package.',
        evidence: [
          { id: 'EV-01', type: 'Receipt', name: 'Receipt_TX-882140.pdf', url: '#', addedAt: '2025-12-28 09:20', addedBy: 'Billing Ops' },
          { id: 'EV-02', type: 'SessionLog', name: 'SessionLog_ST-0001_2025-12-28.txt', url: '#', addedAt: '2025-12-28 09:28', addedBy: 'Operator EA' },
        ],
        timeline: [
          { at: '2025-12-28 09:14', actor: 'Provider', action: 'Chargeback opened', details: 'Visa chargeback case created.' },
          { at: '2025-12-28 09:20', actor: 'Billing Ops', action: 'Evidence attached', details: 'Receipt uploaded.' },
          { at: '2025-12-28 09:28', actor: 'Operator EA', action: 'Evidence attached', details: 'Session log exported.' },
          { at: '2025-12-28 09:44', actor: 'Billing Ops', action: 'Marked under review', details: 'Preparing response package.' },
        ],
      },
      {
        id: 'DSP-30988',
        type: 'Refund',
        status: 'Open',
        severity: 'Medium',
        region: 'EUROPE',
        org: 'MALL_HOLDINGS',
        station: 'ST-1011',
        provider: 'Stripe',
        originalTxId: 'TX-881712',
        amount: 9.99,
        currency: 'EUR',
        reason: 'Duplicate charge (user tapped twice).',
        customer: { name: 'Jon K.', email: 'jon@sunrun.com', phone: '+256 7xx xxx xxx' },
        openedAt: '2025-12-27 20:14',
        deadlineAt: '2025-12-31 23:59',
        updatedAt: '2025-12-27 20:14',
        assignedTo: 'Helpdesk',
        notes: '',
        evidence: [{ id: 'EV-11', type: 'ProviderDoc', name: 'Stripe_event_8821.json', url: '#', addedAt: '2025-12-27 20:14', addedBy: 'System' }],
        timeline: [{ at: '2025-12-27 20:14', actor: 'Helpdesk', action: 'Refund request created', details: 'Waiting for approval.' }],
      },
      {
        id: 'DSP-30841',
        type: 'Reversal',
        status: 'NeedInfo',
        severity: 'Low',
        region: 'AFRICA',
        org: 'VOLT_MOBILITY',
        station: 'ST-0017',
        provider: 'MTN',
        originalTxId: 'TX-880042',
        amount: 25000,
        currency: 'UGX',
        reason: 'Payment confirmed late; session already cancelled.',
        customer: { name: 'Asha M.', email: 'asha@volt.co', phone: '+256 7xx xxx xxx' },
        openedAt: '2025-12-26 09:12',
        deadlineAt: '2025-12-30 23:59',
        updatedAt: '2025-12-27 08:10',
        assignedTo: 'Operator EA',
        notes: 'Need customer receipt screenshot + device info.',
        evidence: [],
        timeline: [
          { at: '2025-12-26 09:12', actor: 'System', action: 'Reversal flagged', details: 'Late confirmation detected during reconciliation.' },
          { at: '2025-12-27 08:10', actor: 'Operator EA', action: 'Requested info', details: 'Asked for receipt screenshot.' },
        ],
      },
      {
        id: 'DSP-30777',
        type: 'Refund',
        status: 'Refunded',
        severity: 'Low',
        region: 'AMERICAS',
        org: 'SUNRUN_OPS',
        provider: 'Flutterwave',
        originalTxId: 'TX-879110',
        amount: 12.0,
        currency: 'USD',
        reason: 'Session interrupted due to power outage.',
        customer: { name: 'Allan T.', email: 'allan@tech.me', phone: '+256 7xx xxx xxx' },
        openedAt: '2025-12-22 10:30',
        updatedAt: '2025-12-22 12:01',
        assignedTo: 'Billing Ops',
        notes: 'Refund issued as downtime credit.',
        evidence: [{ id: 'EV-21', type: 'Telemetry', name: 'Station_outage_ST-778.csv', url: '#', addedAt: '2025-12-22 10:50', addedBy: 'SRE Oncall' }],
        timeline: [
          { at: '2025-12-22 10:30', actor: 'Helpdesk', action: 'Refund request created', details: 'Customer requested refund.' },
          { at: '2025-12-22 10:50', actor: 'SRE Oncall', action: 'Evidence attached', details: 'Outage telemetry confirms interruption.' },
          { at: '2025-12-22 12:01', actor: 'Billing Ops', action: 'Refund approved', details: 'Refund processed by provider.' },
        ],
      },
    ],
  }
}

function readStore(): DisputesStore {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as DisputesStore
  } catch {}
  const s = seed()
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
  } catch {}
  return s
}

function writeStore(next: DisputesStore) {
  localStorage.setItem(KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent('evzone:mockDisputes'))
}

export function loadDisputes(): DisputesStore {
  if (typeof window === 'undefined') return seed()
  return readStore()
}

export function saveDisputes(next: DisputesStore) {
  return writeStore(next)
}

export function updateCase(id: string, fn: (c: DisputeCase) => DisputeCase) {
  const s = loadDisputes()
  const nextCases = s.cases.map((c) => (c.id === id ? fn(c) : c))
  writeStore({ ...s, cases: nextCases })
}

export function addTimeline(id: string, ev: CaseEvent, notify?: { title: string; body: string; link?: string }) {
  updateCase(id, (c) => ({ ...c, updatedAt: nowStamp(), timeline: [ev, ...c.timeline] }))
  if (notify) {
    upsertNotification({
      id: `NTF-${Math.floor(10000 + Math.random() * 90000)}`,
      when: 'now',
      kind: 'Billing',
      severity: 'Medium',
      title: notify.title,
      body: notify.body,
      status: 'Unread',
      source: 'disputes',
      region: 'GLOBAL',
      tags: ['refunds', 'disputes'],
      link: notify.link,
    })
  }
}

export function setCaseStatus(id: string, status: CaseStatus, actor: string, reason: string) {
  updateCase(id, (c) => ({ ...c, status, updatedAt: nowStamp(), timeline: [{ at: nowStamp(), actor, action: 'Status changed', details: `→ ${status} • ${reason}` }, ...c.timeline] }))
}

export function genId(prefix: string) {
  return `${prefix}-${Math.floor(10000 + Math.random() * 90000)}`
}

export function now() {
  return nowStamp()
}


