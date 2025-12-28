import { upsertNotification } from '@/features/admin/notifications/mockNotifications'

export type KycStatus = 'Pending' | 'NeedInfo' | 'Approved' | 'Rejected' | 'Escalated'
export type PartyType = 'Organization' | 'Individual'
export type RiskLevel = 'Low' | 'Medium' | 'High'
export type ScreeningFlag = 'None' | 'PEP' | 'Sanctions' | 'AdverseMedia' | 'NameMismatch'
export type Region = 'AFRICA' | 'EUROPE' | 'AMERICAS' | 'ASIA' | 'MIDDLE_EAST'

export type KycDoc = {
  id: string
  name: string
  type: 'PDF' | 'Image' | 'Other'
  url: string
  required: boolean
  received: boolean
  verified: boolean
}

export type KycEvent = {
  at: string
  actor: string
  action: string
  details: string
}

export type KycCase = {
  id: string
  partyType: PartyType
  status: KycStatus
  risk: RiskLevel
  flags: ScreeningFlag[]
  region: Region
  orgId?: string
  orgName?: string
  applicantName: string
  applicantEmail: string
  applicantPhone: string
  submittedAt: string
  updatedAt: string
  assignedTo: string
  notes: string
  docs: KycDoc[]
  timeline: KycEvent[]
}

export type KycStore = {
  cases: KycCase[]
}

const KEY = 'mock.admin.kyc.v1'

function nowStamp() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`
}

function seed(): KycStore {
  return {
    cases: [
      {
        id: 'KYC-12041',
        partyType: 'Organization',
        status: 'Pending',
        risk: 'Medium',
        flags: ['AdverseMedia'],
        region: 'AFRICA',
        orgId: 'VOLT_MOBILITY',
        orgName: 'Volt Mobility Ltd',
        applicantName: 'Sarah Owner',
        applicantEmail: 'sarah@volt.co',
        applicantPhone: '+256 7xx xxx xxx',
        submittedAt: '2025-12-28 09:20',
        updatedAt: '2025-12-28 09:20',
        assignedTo: 'Compliance L1',
        notes: 'Adverse media flag requires manual review. Validate UBOs and registration certificate.',
        docs: [
          { id: 'DOC-01', name: 'Certificate of Incorporation.pdf', type: 'PDF', url: '#', required: true, received: true, verified: false },
          { id: 'DOC-02', name: 'TIN Certificate.jpg', type: 'Image', url: '#', required: true, received: true, verified: false },
          { id: 'DOC-03', name: 'UBO Declaration.pdf', type: 'PDF', url: '#', required: true, received: false, verified: false },
          { id: 'DOC-04', name: 'Bank Letter.pdf', type: 'PDF', url: '#', required: false, received: false, verified: false },
        ],
        timeline: [{ at: '2025-12-28 09:20', actor: 'System', action: 'Submitted', details: 'Partner submitted KYC application.' }],
      },
      {
        id: 'KYC-12012',
        partyType: 'Individual',
        status: 'NeedInfo',
        risk: 'Low',
        flags: ['None'],
        region: 'EUROPE',
        applicantName: 'Jon Ops',
        applicantEmail: 'jon@sunrun.com',
        applicantPhone: '+256 7xx xxx xxx',
        submittedAt: '2025-12-27 20:14',
        updatedAt: '2025-12-27 21:06',
        assignedTo: 'Compliance L1',
        notes: 'ID image is blurry; request a clearer copy + proof of address.',
        docs: [
          { id: 'DOC-11', name: 'National ID.png', type: 'Image', url: '#', required: true, received: true, verified: false },
          { id: 'DOC-12', name: 'Proof of Address.pdf', type: 'PDF', url: '#', required: true, received: false, verified: false },
        ],
        timeline: [
          { at: '2025-12-27 20:14', actor: 'System', action: 'Submitted', details: 'Individual KYC submitted.' },
          { at: '2025-12-27 21:06', actor: 'Compliance L1', action: 'Requested info', details: 'Need clearer ID + proof of address.' },
        ],
      },
      {
        id: 'KYC-11988',
        partyType: 'Organization',
        status: 'Approved',
        risk: 'Low',
        flags: ['None'],
        region: 'AFRICA',
        orgId: 'MALL_HOLDINGS',
        orgName: 'Mall Holdings',
        applicantName: 'Grace SiteOwner',
        applicantEmail: 'grace@mall.com',
        applicantPhone: '+256 7xx xxx xxx',
        submittedAt: '2025-12-22 10:30',
        updatedAt: '2025-12-22 12:01',
        assignedTo: 'Compliance L2',
        notes: 'All documents validated. Greenlight partnership.',
        docs: [
          { id: 'DOC-21', name: 'Certificate.pdf', type: 'PDF', url: '#', required: true, received: true, verified: true },
          { id: 'DOC-22', name: 'UBO Declaration.pdf', type: 'PDF', url: '#', required: true, received: true, verified: true },
          { id: 'DOC-23', name: 'Lease Draft.pdf', type: 'PDF', url: '#', required: false, received: true, verified: true },
        ],
        timeline: [
          { at: '2025-12-22 10:30', actor: 'System', action: 'Submitted', details: 'Partner submitted KYC.' },
          { at: '2025-12-22 11:40', actor: 'Compliance L2', action: 'Verified docs', details: 'Certificate + UBO validated.' },
          { at: '2025-12-22 12:01', actor: 'Compliance L2', action: 'Approved', details: 'KYC approved.' },
        ],
      },
      {
        id: 'KYC-11961',
        partyType: 'Organization',
        status: 'Escalated',
        risk: 'High',
        flags: ['PEP', 'NameMismatch'],
        region: 'ASIA',
        orgId: 'GRIDCITY',
        orgName: 'GridCity Ltd',
        applicantName: 'Ali',
        applicantEmail: 'ali@grid.city',
        applicantPhone: '+256 7xx xxx xxx',
        submittedAt: '2025-12-20 10:30',
        updatedAt: '2025-12-21 08:18',
        assignedTo: 'Compliance L3',
        notes: 'PEP flag + name mismatch. Escalated for enhanced due diligence.',
        docs: [
          { id: 'DOC-31', name: 'Certificate.pdf', type: 'PDF', url: '#', required: true, received: true, verified: false },
          { id: 'DOC-32', name: 'UBO Declaration.pdf', type: 'PDF', url: '#', required: true, received: true, verified: false },
          { id: 'DOC-33', name: 'Sanctions screening.pdf', type: 'PDF', url: '#', required: true, received: true, verified: true },
        ],
        timeline: [
          { at: '2025-12-20 10:30', actor: 'System', action: 'Submitted', details: 'Partner submitted KYC.' },
          { at: '2025-12-21 08:18', actor: 'Compliance L1', action: 'Escalated', details: 'PEP + name mismatch; EDD required.' },
        ],
      },
    ],
  }
}

function readStore(): KycStore {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as KycStore
  } catch {}
  const s = seed()
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
  } catch {}
  return s
}

function writeStore(next: KycStore) {
  localStorage.setItem(KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent('evzone:mockKyc'))
}

export function loadKyc(): KycStore {
  if (typeof window === 'undefined') return seed()
  return readStore()
}

export function updateCase(id: string, fn: (c: KycCase) => KycCase) {
  const s = loadKyc()
  const next = s.cases.map((c) => (c.id === id ? fn(c) : c))
  writeStore({ ...s, cases: next })
}

export function setCaseStatus(id: string, status: KycStatus, actor: string, note: string) {
  updateCase(id, (c) => ({
    ...c,
    status,
    updatedAt: nowStamp(),
    timeline: [{ at: nowStamp(), actor, action: 'Status changed', details: `→ ${status} • ${note}` }, ...c.timeline],
  }))

  upsertNotification({
    id: `NTF-${Math.floor(10000 + Math.random() * 90000)}`,
    when: 'now',
    kind: 'Compliance',
    severity: status === 'Rejected' ? 'High' : status === 'Escalated' ? 'High' : 'Medium',
    title: `KYC update: ${id}`,
    body: `Status → ${status}. ${note}`,
    status: 'Unread',
    source: 'kyc',
    region: 'GLOBAL',
    tags: ['kyc', 'compliance'],
    link: '/admin/kyc',
  })
}


