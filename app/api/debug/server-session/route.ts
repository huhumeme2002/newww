import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ 
        error: 'No server session found',
        hasSession: false 
      })
    }

    return NextResponse.json({
      hasSession: true,
      user: session.user,
      role: (session.user as any)?.role,
      roleType: typeof (session.user as any)?.role,
      isAdmin: (session.user as any)?.role?.toLowerCase() === 'admin',
      adminCheck: {
        originalRole: (session.user as any)?.role,
        lowercaseRole: (session.user as any)?.role?.toLowerCase(),
        comparison: (session.user as any)?.role?.toLowerCase() === 'admin'
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Server session check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
