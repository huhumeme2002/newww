import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ 
        error: 'No session found',
        isLoggedIn: false 
      })
    }

    return NextResponse.json({
      isLoggedIn: true,
      user: session.user,
      role: (session.user as any)?.role,
      roleType: typeof (session.user as any)?.role,
      allUserData: session.user,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Session check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
