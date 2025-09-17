import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

interface JsonUser {
  id: number
  username: string
  email: string
  password_hash: string
  requests: number
  role: string
  is_active: boolean
  last_login?: string | null
  created_at: string
  updated_at: string
  expiry_time?: string | null
  is_expired: boolean
}

interface JsonKey {
  id: number
  key_value: string
  requests: number
  is_used: boolean
  used_by?: number | null
  used_at?: string | null
  created_at: string
  expires_at?: string | null
  is_expired: boolean
  description?: string | null
  key_type: string
}

interface JsonToken {
  id: number
  user_id: number
  token_value: string
  requests_cost: number
  is_active: boolean
  last_used_at?: string | null
  usage_count: number
  created_at: string
}

interface JsonTokenUsage {
  id: number
  token_value: string
  used_by: number
  used_at: string
  ip_address: string
}

interface JsonTransaction {
  id: number
  user_id: number
  type: string
  amount: number
  description?: string | null
  created_at: string
}

function parseDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null
  
  try {
    // Handle different date formats from JSON
    if (dateStr.includes('.')) {
      // Format: "2025-08-27 08:08:30.709168"
      return new Date(dateStr.replace(' ', 'T') + 'Z')
    } else if (dateStr.includes('+')) {
      // Format: "2025-09-07 05:51:43.173+00"
      return new Date(dateStr)
    } else {
      // Standard ISO format
      return new Date(dateStr)
    }
  } catch (error) {
    console.warn(`Failed to parse date: ${dateStr}`)
    return null
  }
}

function normalizeRole(role: string): 'USER' | 'ADMIN' {
  return role.toLowerCase() === 'admin' ? 'ADMIN' : 'USER'
}

function normalizeKeyType(key_type: string): 'REGULAR' | 'CUSTOM' {
  return key_type.toLowerCase() === 'custom' ? 'CUSTOM' : 'REGULAR'
}

function normalizeTransactionType(type: string): 'REQUEST_TO_TOKEN' | 'KEY_REDEEM' | 'ADMIN_ADJUSTMENT' {
  switch (type.toLowerCase()) {
    case 'request_to_token':
      return 'REQUEST_TO_TOKEN'
    case 'key_redeem':
      return 'KEY_REDEEM'
    case 'admin_adjustment':
      return 'ADMIN_ADJUSTMENT'
    default:
      return 'ADMIN_ADJUSTMENT'
  }
}

async function loadJsonFile<T>(filename: string): Promise<T[]> {
  try {
    const filePath = path.join(process.cwd(), filename)
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(fileContent)
  } catch (error) {
    console.warn(`Warning: Could not load ${filename}:`, error)
    return []
  }
}

async function migrateUsers() {
  console.log('🔄 Migrating users...')
  
  const jsonUsers = await loadJsonFile<JsonUser>('users.json')
  
  for (const jsonUser of jsonUsers) {
    try {
      await prisma.users.upsert({
        where: { id: jsonUser.id },
        update: {
          username: jsonUser.username,
          email: jsonUser.email,
          password_hash: jsonUser.password_hash,
          requests: jsonUser.requests,
          role: normalizeRole(jsonUser.role),
          is_active: jsonUser.is_active,
          last_login: parseDate(jsonUser.last_login),
          expiry_time: parseDate(jsonUser.expiry_time),
          is_expired: jsonUser.is_expired,
          created_at: parseDate(jsonUser.created_at) || new Date(),
          updated_at: parseDate(jsonUser.updated_at) || new Date(),
        },
        create: {
          id: jsonUser.id,
          username: jsonUser.username,
          email: jsonUser.email,
          password_hash: jsonUser.password_hash,
          requests: jsonUser.requests,
          role: normalizeRole(jsonUser.role),
          is_active: jsonUser.is_active,
          last_login: parseDate(jsonUser.last_login),
          expiry_time: parseDate(jsonUser.expiry_time),
          is_expired: jsonUser.is_expired,
          created_at: parseDate(jsonUser.created_at) || new Date(),
          updated_at: parseDate(jsonUser.updated_at) || new Date(),
        },
      })
    } catch (error) {
      console.error(`Failed to migrate user ${jsonUser.id}:`, error)
    }
  }
  
  console.log(`✅ Migrated ${jsonUsers.length} users`)
}

async function migrateKeys() {
  console.log('🔄 Migrating keys...')
  
  const jsonKeys = await loadJsonFile<JsonKey>('keys.json')
  
  for (const jsonKey of jsonKeys) {
    try {
      await prisma.keys.upsert({
        where: { id: jsonKey.id },
        update: {
          key_value: jsonKey.key_value,
          requests: jsonKey.requests,
          is_used: jsonKey.is_used,
          used_by: jsonKey.used_by,
          used_at: parseDate(jsonKey.used_at),
          expires_at: parseDate(jsonKey.expires_at),
          is_expired: jsonKey.is_expired,
          description: jsonKey.description,
          key_type: normalizeKeyType(jsonKey.key_type),
          created_at: parseDate(jsonKey.created_at) || new Date(),
        },
        create: {
          id: jsonKey.id,
          key_value: jsonKey.key_value,
          requests: jsonKey.requests,
          is_used: jsonKey.is_used,
          used_by: jsonKey.used_by,
          used_at: parseDate(jsonKey.used_at),
          expires_at: parseDate(jsonKey.expires_at),
          is_expired: jsonKey.is_expired,
          description: jsonKey.description,
          key_type: normalizeKeyType(jsonKey.key_type),
          created_at: parseDate(jsonKey.created_at) || new Date(),
        },
      })
    } catch (error) {
      console.error(`Failed to migrate key ${jsonKey.id}:`, error)
    }
  }
  
  console.log(`✅ Migrated ${jsonKeys.length} keys`)
}

async function migrateTokens() {
  console.log('🔄 Migrating generated tokens...')
  
  const jsonTokens = await loadJsonFile<JsonToken>('generated_tokens.json')
  
  for (const jsonToken of jsonTokens) {
    try {
      await prisma.generated_tokens.upsert({
        where: { id: jsonToken.id },
        update: {
          user_id: jsonToken.user_id,
          token_value: jsonToken.token_value,
          requests_cost: jsonToken.requests_cost,
          is_active: jsonToken.is_active,
          last_used_at: parseDate(jsonToken.last_used_at),
          usage_count: jsonToken.usage_count,
          created_at: parseDate(jsonToken.created_at) || new Date(),
        },
        create: {
          id: jsonToken.id,
          user_id: jsonToken.user_id,
          token_value: jsonToken.token_value,
          requests_cost: jsonToken.requests_cost,
          is_active: jsonToken.is_active,
          last_used_at: parseDate(jsonToken.last_used_at),
          usage_count: jsonToken.usage_count,
          created_at: parseDate(jsonToken.created_at) || new Date(),
        },
      })
    } catch (error) {
      console.error(`Failed to migrate token ${jsonToken.id}:`, error)
    }
  }
  
  console.log(`✅ Migrated ${jsonTokens.length} generated tokens`)
}

async function migrateTokenUsage() {
  console.log('🔄 Migrating token usage logs...')
  
  const jsonUsages = await loadJsonFile<JsonTokenUsage>('token_usage_log.json')
  
  for (const jsonUsage of jsonUsages) {
    try {
      await prisma.token_usage_log.upsert({
        where: { id: jsonUsage.id },
        update: {
          token_value: jsonUsage.token_value,
          used_by: jsonUsage.used_by,
          used_at: parseDate(jsonUsage.used_at) || new Date(),
          ip_address: jsonUsage.ip_address,
        },
        create: {
          id: jsonUsage.id,
          token_value: jsonUsage.token_value,
          used_by: jsonUsage.used_by,
          used_at: parseDate(jsonUsage.used_at) || new Date(),
          ip_address: jsonUsage.ip_address,
        },
      })
    } catch (error) {
      console.error(`Failed to migrate token usage ${jsonUsage.id}:`, error)
    }
  }
  
  console.log(`✅ Migrated ${jsonUsages.length} token usage logs`)
}

async function migrateTransactions() {
  console.log('🔄 Migrating request transactions...')
  
  const jsonTransactions = await loadJsonFile<JsonTransaction>('request_transactions.json')
  
  for (const jsonTransaction of jsonTransactions) {
    try {
      await prisma.request_transactions.upsert({
        where: { id: jsonTransaction.id },
        update: {
          user_id: jsonTransaction.user_id,
          requests_amount: jsonTransaction.amount,
          description: jsonTransaction.description,
          created_at: parseDate(jsonTransaction.created_at) || new Date(),
        },
        create: {
          id: jsonTransaction.id,
          user_id: jsonTransaction.user_id,
          requests_amount: jsonTransaction.amount,
          description: jsonTransaction.description,
          created_at: parseDate(jsonTransaction.created_at) || new Date(),
        },
      })
    } catch (error) {
      console.error(`Failed to migrate transaction ${jsonTransaction.id}:`, error)
    }
  }
  
  console.log(`✅ Migrated ${jsonTransactions.length} request transactions`)
}

async function validateMigration() {
  console.log('🔍 Validating migration...')
  
  const stats = await prisma.$transaction([
    prisma.users.count(),
    prisma.keys.count(),
    prisma.generated_tokens.count(),
    prisma.token_usage_log.count(),
    prisma.request_transactions.count(),
  ])
  
  console.log('📊 Migration Summary:')
  console.log(`  Users: ${stats[0]}`)
  console.log(`  Keys: ${stats[1]}`)
  console.log(`  Generated Tokens: ${stats[2]}`)
  console.log(`  Token Usage Logs: ${stats[3]}`)
  console.log(`  Request Transactions: ${stats[4]}`)
  
  console.log('✅ Migration validation completed')
}

async function main() {
  console.log('🚀 Starting JSON to PostgreSQL migration...')
  console.log('📄 Make sure your JSON files are in the project root directory')
  
  try {
    // Run migrations in order (respecting foreign key constraints)
    await migrateUsers()
    await migrateKeys()
    await migrateTokens()
    await migrateTokenUsage()
    await migrateTransactions()
    
    // Validate the migration
    await validateMigration()
    
    console.log('🎉 Migration completed successfully!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the migration
if (require.main === module) {
  main()
}

export { main as runMigration }
