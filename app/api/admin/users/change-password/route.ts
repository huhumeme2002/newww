import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/utils"

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const role = String((session.user as any)?.role || '').toLowerCase()
    if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { userId, newPassword } = await req.json()
    const id = parseInt(userId as any)

    if (!id || !newPassword || typeof newPassword !== 'string') {
      return NextResponse.json({ error: 'userId and newPassword are required' }, { status: 400 })
    }
    if (newPassword.length < 6 || newPassword.length > 100) {
      return NextResponse.json({ error: 'Password length must be between 6 and 100 characters' }, { status: 400 })
    }

    const user = await prisma.users.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const password_hash = await hashPassword(newPassword)
    await prisma.users.update({ where: { id }, data: { password_hash } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin change password error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
