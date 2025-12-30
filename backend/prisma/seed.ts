import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

if (process.env.DIRECT_URL) {
  process.env.DATABASE_URL = process.env.DIRECT_URL
}

const prisma = new PrismaClient()

function env(name: string, fallback?: string) {
  const value = process.env[name]
  if (value && value.trim()) return value.trim()
  if (fallback !== undefined) return fallback
  throw new Error(`Missing required env: ${name}`)
}

async function main() {
  const email = env('SEED_ADMIN_EMAIL', 'admin@evzone.local')
  const password = env('SEED_ADMIN_PASSWORD', 'ChangeMe123!')
  const name = env('SEED_ADMIN_NAME', 'EVzone Admin')
  const tenantName = env('SEED_TENANT_NAME', 'EVzone Default Tenant')
  const orgName = env('SEED_ORG_NAME', 'EVzone Default Org')

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    console.log(`Seed: admin user already exists (${email})`)
    return
  }

  const tenant = await prisma.tenant.create({ data: { name: tenantName } })
  const org = await prisma.organization.create({
    data: { name: orgName, tenantId: tenant.id },
  })

  const passwordHash = await bcrypt.hash(password, 10)
  await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      role: 'EVZONE_ADMIN',
      tenantId: tenant.id,
      orgId: org.id,
    },
  })

  console.log(`Seed: created admin user (${email})`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
