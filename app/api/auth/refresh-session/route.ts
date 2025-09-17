import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: 'No session found' 
      }, { status: 401 })
    }

    // Get fresh user data from database
    const userId = parseInt(session.user.id)
    const freshUser = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        requests: true,
        is_active: true
      }
    })

    if (!freshUser) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: freshUser.id.toString(),
        username: freshUser.username,
        email: freshUser.email,
        role: freshUser.role,
        requests: freshUser.requests,
        isActive: freshUser.is_active,
      },
      message: 'Session refreshed successfully'
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to refresh session',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
