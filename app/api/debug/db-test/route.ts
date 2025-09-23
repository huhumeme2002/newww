import { NextResponse } from "next/server"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const dbUrl = process.env.DATABASE_URL
    
    return NextResponse.json({
      hasDbUrl: Boolean(dbUrl),
      dbUrlLength: dbUrl?.length || 0,
      dbUrlStart: dbUrl?.substring(0, 20) || 'undefined',
      dbUrlValid: dbUrl?.startsWith('postgresql://') || dbUrl?.startsWith('postgres://'),
      allEnvVars: Object.keys(process.env).filter(key => 
        key.includes('DATABASE') || 
        key.includes('POSTGRES') || 
        key.includes('NEXTAUTH')
      ),
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to check environment',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
