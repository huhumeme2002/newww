import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const role = String((session.user as any)?.role || '').toLowerCase()
    if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const id = parseInt(params.id)
    const user = await prisma.users.findUnique({
      where: { id },
      select: {
        id: true, username: true, email: true, role: true, requests: true,
        is_active: true, expiry_time: true, is_expired: true, created_at: true, last_login: true
      }
    })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    return NextResponse.json({ user })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
