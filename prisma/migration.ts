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

function normalizeKeyType(keyType: string): 'REGULAR' | 'CUSTOM' {
  return keyType.toLowerCase() === 'custom' ? 'CUSTOM' : 'REGULAR'
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
      await prisma.user.upsert({
        where: { id: jsonUser.id },
        update: {
          username: jsonUser.username,
          email: jsonUser.email,
          passwordHash: jsonUser.password_hash,
          requests: jsonUser.requests,
          role: normalizeRole(jsonUser.role),
          isActive: jsonUser.is_active,
          lastLogin: parseDate(jsonUser.last_login),
          expiryTime: parseDate(jsonUser.expiry_time),
          isExpired: jsonUser.is_expired,
          createdAt: parseDate(jsonUser.created_at) || new Date(),
          updatedAt: parseDate(jsonUser.updated_at) || new Date(),
        },
        create: {
          id: jsonUser.id,
          username: jsonUser.username,
          email: jsonUser.email,
          passwordHash: jsonUser.password_hash,
          requests: jsonUser.requests,
          role: normalizeRole(jsonUser.role),
          isActive: jsonUser.is_active,
          lastLogin: parseDate(jsonUser.last_login),
          expiryTime: parseDate(jsonUser.expiry_time),
          isExpired: jsonUser.is_expired,
          createdAt: parseDate(jsonUser.created_at) || new Date(),
          updatedAt: parseDate(jsonUser.updated_at) || new Date(),
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
      await prisma.key.upsert({
        where: { id: jsonKey.id },
        update: {
          keyValue: jsonKey.key_value,
          requests: jsonKey.requests,
          isUsed: jsonKey.is_used,
          usedBy: jsonKey.used_by,
          usedAt: parseDate(jsonKey.used_at),
          expiresAt: parseDate(jsonKey.expires_at),
          isExpired: jsonKey.is_expired,
          description: jsonKey.description,
          keyType: normalizeKeyType(jsonKey.key_type),
          createdAt: parseDate(jsonKey.created_at) || new Date(),
        },
        create: {
          id: jsonKey.id,
          keyValue: jsonKey.key_value,
          requests: jsonKey.requests,
          isUsed: jsonKey.is_used,
          usedBy: jsonKey.used_by,
          usedAt: parseDate(jsonKey.used_at),
          expiresAt: parseDate(jsonKey.expires_at),
          isExpired: jsonKey.is_expired,
          description: jsonKey.description,
          keyType: normalizeKeyType(jsonKey.key_type),
          createdAt: parseDate(jsonKey.created_at) || new Date(),
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
      await prisma.generatedToken.upsert({
        where: { id: jsonToken.id },
        update: {
          userId: jsonToken.user_id,
          tokenValue: jsonToken.token_value,
          requestsCost: jsonToken.requests_cost,
          isActive: jsonToken.is_active,
          lastUsedAt: parseDate(jsonToken.last_used_at),
          usageCount: jsonToken.usage_count,
          createdAt: parseDate(jsonToken.created_at) || new Date(),
        },
        create: {
          id: jsonToken.id,
          userId: jsonToken.user_id,
          tokenValue: jsonToken.token_value,
          requestsCost: jsonToken.requests_cost,
          isActive: jsonToken.is_active,
          lastUsedAt: parseDate(jsonToken.last_used_at),
          usageCount: jsonToken.usage_count,
          createdAt: parseDate(jsonToken.created_at) || new Date(),
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
      await prisma.tokenUsageLog.upsert({
        where: { id: jsonUsage.id },
        update: {
          tokenValue: jsonUsage.token_value,
          usedBy: jsonUsage.used_by,
          usedAt: parseDate(jsonUsage.used_at) || new Date(),
          ipAddress: jsonUsage.ip_address,
        },
        create: {
          id: jsonUsage.id,
          tokenValue: jsonUsage.token_value,
          usedBy: jsonUsage.used_by,
          usedAt: parseDate(jsonUsage.used_at) || new Date(),
          ipAddress: jsonUsage.ip_address,
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
      await prisma.requestTransaction.upsert({
        where: { id: jsonTransaction.id },
        update: {
          userId: jsonTransaction.user_id,
          type: normalizeTransactionType(jsonTransaction.type),
          amount: jsonTransaction.amount,
          description: jsonTransaction.description,
          createdAt: parseDate(jsonTransaction.created_at) || new Date(),
        },
        create: {
          id: jsonTransaction.id,
          userId: jsonTransaction.user_id,
          type: normalizeTransactionType(jsonTransaction.type),
          amount: jsonTransaction.amount,
          description: jsonTransaction.description,
          createdAt: parseDate(jsonTransaction.created_at) || new Date(),
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
    prisma.user.count(),
    prisma.key.count(),
    prisma.generatedToken.count(),
    prisma.tokenUsageLog.count(),
    prisma.requestTransaction.count(),
  ])
  
  console.log('📊 Migration Summary:')
  console.log(`  Users: ${stats[0]}`)
  console.log(`  Keys: ${stats[1]}`)
  console.log(`  Generated Tokens: ${stats[2]}`)
  console.log(`  Token Usage Logs: ${stats[3]}`)
  console.log(`  Request Transactions: ${stats[4]}`)
  
  // Check for data integrity
  const usersWithInvalidKeys = await prisma.key.count({
    where: {
      usedBy: { not: null },
      user: null
    }
  })
  
  if (usersWithInvalidKeys > 0) {
    console.warn(`⚠️  Warning: ${usersWithInvalidKeys} keys reference non-existent users`)
  }
  
  const tokensWithInvalidUsers = await prisma.generatedToken.count({
    where: {
      user: null
    }
  })
  
  if (tokensWithInvalidUsers > 0) {
    console.warn(`⚠️  Warning: ${tokensWithInvalidUsers} tokens reference non-existent users`)
  }
  
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
