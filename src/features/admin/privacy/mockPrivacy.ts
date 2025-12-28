import { upsertNotification } from '@/features/admin/notifications/mockNotifications'

export type PrivacyRequestType = 'Access' | 'Deletion' | 'Correction' | 'Consent' | 'Restriction' | 'Portability'
export type PrivacyStatus = 'Open' | 'NeedInfo' | 'Approved' | 'InProgress' | 'Fulfilled' | 'Rejected' | 'Closed'
export type RiskLevel = 'Low' | 'Medium' | 'High'
export type Region = 'AFRICA' | 'EUROPE' | 'AMERICAS' | 'ASIA' | 'MIDDLE_EAST'

export type IdentityMethod = 'Email' | 'Phone' | 'KYC' | 'SupportTicket'

export type PrivacyEvidence = {
  id: string
  name: string
  type: 'PDF' | 'Image' | 'Other'
  url: string
  addedAt: string
  addedBy: string
}

export type PrivacyEvent = {
  at: string
  actor: string
  action: string
  details: string
}

export type PrivacyRequest = {
  id: string
  type: PrivacyRequestType
  status: PrivacyStatus
  risk: RiskLevel
  region: Region
  jurisdiction: 'GDPR' | 'Local' | 'Other'
  requester: { name: string; email: string; phone: string; userId?: string }
  identityMethod: IdentityMethod
  verified: boolean
  submittedAt: string
  dueAt: string
  updatedAt: string
  assignedTo: string
  scope: {
    orgId?: string
    stations?: string[]
    dataCategories: Array<'Profile' | 'Sessions' | 'Payments' | 'Support' | 'Location' | 'Audit'>
  }
  reason: string
  notes: string
  evidence: PrivacyEvidence[]
  timeline: PrivacyEvent[]
}

export type PrivacyStore = { requests: PrivacyRequest[] }

const KEY = 'mock.admin.privacy.v1'

function nowStamp() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`
}

function seed(): PrivacyStore {
  return {
    requests: [
      {
        id: 'PRV-8821',
        type: 'Access',
        status: 'Open',
        risk: 'Medium',
        region: 'EUROPE',
        jurisdiction: 'GDPR',
        requester: { name: 'Jon K.', email: 'jon@sunrun.com', phone: '+256 7xx xxx xxx', userId: 'U-0042' },
        identityMethod: 'Email',
        verified: false,
        submittedAt: '2025-12-28 09:10',
        dueAt: '2026-01-27 23:59',
        updatedAt: '2025-12-28 09:10',
        assignedTo: 'Privacy Ops',
        scope: { orgId: 'SUNRUN_OPS', stations: ['ST-0002'], dataCategories: ['Profile', 'Sessions', 'Payments', 'Support'] },
        reason: 'GDPR access request (DSAR).',
        notes: 'Verify identity via email challenge before exporting.',
        evidence: [],
        timeline: [{ at: '2025-12-28 09:10', actor: 'System', action: 'Submitted', details: 'Access request created from portal form.' }],
      },
      {
        id: 'PRV-8803',
        type: 'Deletion',
        status: 'NeedInfo',
        risk: 'High',
        region: 'AFRICA',
        jurisdiction: 'Local',
        requester: { name: 'Asha M.', email: 'asha@volt.co', phone: '+256 7xx xxx xxx', userId: 'U-0261' },
        identityMethod: 'SupportTicket',
        verified: true,
        submittedAt: '2025-12-27 20:14',
        dueAt: '2026-01-10 23:59',
        updatedAt: '2025-12-27 21:06',
        assignedTo: 'Compliance L1',
        scope: { orgId: 'VOLT_MOBILITY', dataCategories: ['Profile', 'Location', 'Support'] },
        reason: 'Account deletion request after contract termination.',
        notes: 'Must preserve audit logs and financial records (retention policy). Need confirmation of outstanding disputes.',
        evidence: [{ id: 'EV-11', name: 'Ticket_TCK-10021.pdf', type: 'PDF', url: '#', addedAt: '2025-12-27 21:06', addedBy: 'Compliance L1' }],
        timeline: [
          { at: '2025-12-27 20:14', actor: 'Helpdesk', action: 'Submitted', details: 'Created from support desk.' },
          { at: '2025-12-27 21:06', actor: 'Compliance L1', action: 'Requested info', details: 'Need confirmation of disputes/retention constraints.' },
        ],
      },
      {
        id: 'PRV-8720',
        type: 'Correction',
        status: 'Approved',
        risk: 'Low',
        region: 'AFRICA',
        jurisdiction: 'Local',
        requester: { name: 'Grace SiteOwner', email: 'grace@mall.com', phone: '+256 7xx xxx xxx', userId: 'U-0180' },
        identityMethod: 'KYC',
        verified: true,
        submittedAt: '2025-12-22 10:30',
        dueAt: '2026-01-05 23:59',
        updatedAt: '2025-12-22 12:01',
        assignedTo: 'Privacy Ops',
        scope: { dataCategories: ['Profile'] },
        reason: 'Correct name spelling and phone number.',
        notes: 'Approved for profile correction.',
        evidence: [{ id: 'EV-21', name: 'ID_card.png', type: 'Image', url: '#', addedAt: '2025-12-22 11:40', addedBy: 'Privacy Ops' }],
        timeline: [
          { at: '2025-12-22 10:30', actor: 'System', action: 'Submitted', details: 'Correction request submitted.' },
          { at: '2025-12-22 12:01', actor: 'Privacy Ops', action: 'Approved', details: 'Approved profile correction.' },
        ],
      },
      {
        id: 'PRV-8655',
        type: 'Portability',
        status: 'Fulfilled',
        risk: 'Medium',
        region: 'AMERICAS',
        jurisdiction: 'Other',
        requester: { name: 'Allan T.', email: 'allan@tech.me', phone: '+256 7xx xxx xxx' },
        identityMethod: 'Phone',
        verified: true,
        submittedAt: '2025-12-18 16:10',
        dueAt: '2026-01-17 23:59',
        updatedAt: '2025-12-20 09:12',
        assignedTo: 'Privacy Ops',
        scope: { dataCategories: ['Profile', 'Sessions'] },
        reason: 'Download a portable copy of account data.',
        notes: 'Export delivered via secure link (mock).',
        evidence: [{ id: 'EV-31', name: 'Export_PRV-8655.zip', type: 'Other', url: '#', addedAt: '2025-12-20 09:12', addedBy: 'System' }],
        timeline: [
          { at: '2025-12-18 16:10', actor: 'System', action: 'Submitted', details: 'Portability request created.' },
          { at: '2025-12-19 08:10', actor: 'Privacy Ops', action: 'Approved', details: 'Approved portability export.' },
          { at: '2025-12-20 09:12', actor: 'System', action: 'Fulfilled', details: 'Export generated and delivered.' },
        ],
      },
    ],
  }
}

function readStore(): PrivacyStore {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as PrivacyStore
  } catch {}
  const s = seed()
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
  } catch {}
  return s
}

function writeStore(next: PrivacyStore) {
  localStorage.setItem(KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent('evzone:mockPrivacy'))
}

export function loadPrivacy(): PrivacyStore {
  if (typeof window === 'undefined') return seed()
  return readStore()
}

export function updateRequest(id: string, fn: (r: PrivacyRequest) => PrivacyRequest) {
  const s = loadPrivacy()
  const next = s.requests.map((r) => (r.id === id ? fn(r) : r))
  writeStore({ ...s, requests: next })
}

export function addEvent(id: string, ev: PrivacyEvent, notify?: { title: string; body: string }) {
  updateRequest(id, (r) => ({ ...r, updatedAt: nowStamp(), timeline: [ev, ...r.timeline] }))
  if (notify) {
    upsertNotification({
      id: `NTF-${Math.floor(10000 + Math.random() * 90000)}`,
      when: 'now',
      kind: 'Compliance',
      severity: 'Medium',
      title: notify.title,
      body: notify.body,
      status: 'Unread',
      source: 'privacy',
      region: 'GLOBAL',
      tags: ['privacy', 'dsar'],
      link: '/admin/privacy',
    })
  }
}

export function setStatus(id: string, status: PrivacyStatus, actor: string, note: string) {
  updateRequest(id, (r) => ({
    ...r,
    status,
    updatedAt: nowStamp(),
    timeline: [{ at: nowStamp(), actor, action: 'Status changed', details: `→ ${status} • ${note}` }, ...r.timeline],
  }))
  upsertNotification({
    id: `NTF-${Math.floor(10000 + Math.random() * 90000)}`,
    when: 'now',
    kind: 'Compliance',
    severity: status === 'Rejected' ? 'High' : status === 'Fulfilled' ? 'Info' : 'Medium',
    title: `Privacy request update: ${id}`,
    body: `Status → ${status}. ${note}`,
    status: 'Unread',
    source: 'privacy',
    region: 'GLOBAL',
    tags: ['privacy', 'governance'],
    link: '/admin/privacy',
  })
}

export function verifyIdentity(id: string, actor: string) {
  updateRequest(id, (r) => ({
    ...r,
    verified: true,
    updatedAt: nowStamp(),
    timeline: [{ at: nowStamp(), actor, action: 'Identity verified', details: `Method: ${r.identityMethod}` }, ...r.timeline],
  }))
}

export function attachEvidence(id: string, ev: PrivacyEvidence, actor: string) {
  updateRequest(id, (r) => ({
    ...r,
    updatedAt: nowStamp(),
    evidence: [ev, ...r.evidence],
    timeline: [{ at: nowStamp(), actor, action: 'Evidence attached', details: ev.name }, ...r.timeline],
  }))
}


