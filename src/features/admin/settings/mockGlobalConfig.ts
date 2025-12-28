export type MaintenanceWindow = {
  id: string
  title: string
  startUtc: string
  endUtc: string
  scope: 'Global' | 'Region' | 'Service'
  target: string
  notify: boolean
}

export type FeatureFlag = {
  key: string
  label: string
  description: string
  enabled: boolean
  rolloutPct: number // 0..100
  owner: string
}

export type SecurityPolicy = {
  mfaRequiredForAdmins: boolean
  sessionTtlHours: number
  requireTicketForSensitiveActions: boolean
  ipAllowlistEnabled: boolean
  ipAllowlist: string[]
}

export type BillingPolicy = {
  currency: 'USD' | 'EUR' | 'UGX'
  vatPct: number
  settlementDelayDays: number
  disputeAutoCloseDays: number
}

export type OpsLimits = {
  exportExpiryHours: number
  maxExportRows: number
  maxConcurrentExports: number
  incidentUpdateCadenceMins: number
}

export type GlobalConfig = {
  version: number
  env: 'prod' | 'staging' | 'demo'
  defaultRegion: 'AFRICA' | 'EUROPE' | 'AMERICAS' | 'ASIA' | 'MIDDLE_EAST'
  flags: FeatureFlag[]
  security: SecurityPolicy
  billing: BillingPolicy
  limits: OpsLimits
  maintenance: MaintenanceWindow[]
}

export type ConfigAudit = {
  id: string
  when: string
  actor: string
  scope: string
  summary: string
  reason: string
}

const KEY = 'mock.admin.globalConfig.v1'
const AUDIT_KEY = 'mock.admin.globalConfig.audit.v1'

function nowStamp() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`
}

export function defaultGlobalConfig(): GlobalConfig {
  return {
    version: 7,
    env: 'demo',
    defaultRegion: 'AFRICA',
    flags: [
      { key: 'newStationsMap', label: 'New Stations Map', description: 'Enable updated heatmap and clustering for stations', enabled: true, rolloutPct: 100, owner: 'SRE Oncall' },
      { key: 'riskControlsPanel', label: 'Risk controls UI', description: 'Show security/risk summaries in admin views', enabled: true, rolloutPct: 100, owner: 'Delta (Admin)' },
      { key: 'ownerSwapBeta', label: 'Owner Swap beta', description: 'Enable swap dashboards and booking flow for owners', enabled: true, rolloutPct: 40, owner: 'Product' },
      { key: 'smsNotifications', label: 'SMS notifications', description: 'Allow SMS delivery in comms center', enabled: true, rolloutPct: 75, owner: 'Support L2' },
    ],
    security: {
      mfaRequiredForAdmins: true,
      sessionTtlHours: 12,
      requireTicketForSensitiveActions: true,
      ipAllowlistEnabled: false,
      ipAllowlist: ['41.75.0.0/16', '197.155.12.14/32'],
    },
    billing: {
      currency: 'USD',
      vatPct: 18,
      settlementDelayDays: 2,
      disputeAutoCloseDays: 30,
    },
    limits: {
      exportExpiryHours: 24,
      maxExportRows: 250000,
      maxConcurrentExports: 6,
      incidentUpdateCadenceMins: 45,
    },
    maintenance: [
      { id: 'MW-021', title: 'MQTT ingest upgrade', startUtc: '2025-12-29 02:00', endUtc: '2025-12-29 03:00', scope: 'Service', target: 'mqtt-ingest', notify: true },
      { id: 'MW-019', title: 'Database minor patch', startUtc: '2025-12-30 01:00', endUtc: '2025-12-30 01:20', scope: 'Global', target: 'core-db', notify: false },
    ],
  }
}

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function writeJson(key: string, val: unknown) {
  localStorage.setItem(key, JSON.stringify(val))
}

export function loadGlobalConfig(): GlobalConfig {
  if (typeof window === 'undefined') return defaultGlobalConfig()
  const existing = readJson<GlobalConfig>(KEY)
  if (existing) return existing
  const seeded = defaultGlobalConfig()
  writeJson(KEY, seeded)
  return seeded
}

export function saveGlobalConfig(next: GlobalConfig) {
  writeJson(KEY, next)
  window.dispatchEvent(new CustomEvent('evzone:mockGlobalConfig'))
}

export function loadConfigAudit(): ConfigAudit[] {
  if (typeof window === 'undefined') return []
  return readJson<ConfigAudit[]>(AUDIT_KEY) ?? [
    { id: 'AUD-9001', when: '2025-12-26 09:12', actor: 'Delta (Admin)', scope: 'flags.smsNotifications', summary: 'Rollout increased to 75%', reason: 'Support escalation volume' },
    { id: 'AUD-9000', when: '2025-12-22 18:40', actor: 'SRE Oncall', scope: 'limits.exportExpiryHours', summary: 'Expiry set to 24h', reason: 'Compliance requirement' },
  ]
}

export function appendConfigAudit(entry: Omit<ConfigAudit, 'id' | 'when'>) {
  const list = loadConfigAudit()
  const next: ConfigAudit[] = [
    { id: `AUD-${Math.floor(10000 + Math.random() * 90000)}`, when: nowStamp(), ...entry },
    ...list,
  ].slice(0, 30)
  writeJson(AUDIT_KEY, next)
  window.dispatchEvent(new CustomEvent('evzone:mockGlobalConfig'))
  return next
}


