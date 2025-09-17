import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username') || 'khanhdx23'
    
    const user = await prisma.users.findFirst({
      where: {
        OR: [
          { username: username.toLowerCase() },
          { email: username.toLowerCase() }
        ]
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        requests: true,
        is_active: true,
        created_at: true
      }
    })

    if (!user) {
      return NextResponse.json({ 
        error: 'User not found',
        username 
      })
    }

    return NextResponse.json({ 
      user,
      isAdmin: user.role.toLowerCase() === 'admin'
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to check user',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
