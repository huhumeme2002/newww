import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/utils'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()
    
    if (!username || !password) {
      return NextResponse.json({ 
        error: 'Username and password are required' 
      })
    }

    // Find user
    const user = await prisma.users.findFirst({
      where: {
        OR: [
          { username: username.toLowerCase() },
          { email: username.toLowerCase() }
        ]
      }
    })

    if (!user) {
      return NextResponse.json({ 
        error: 'User not found' 
      })
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password_hash)
    
    if (!isPasswordValid) {
      return NextResponse.json({ 
        error: 'Invalid password' 
      })
    }

    // Update last login
    await prisma.users.update({
      where: { id: user.id },
      data: { last_login: new Date() }
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
        requests: user.requests,
        isActive: user.is_active,
      },
      message: 'User verified successfully. Please login through the normal login page.'
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Force login failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
