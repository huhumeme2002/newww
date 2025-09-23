import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const userId = parseInt(session.user.id)
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { expiry_time: true, is_expired: true }
    })

    const now = new Date()
    const isExpired = Boolean(user?.expiry_time && (user.is_expired || user.expiry_time <= now))
    if (isExpired) return NextResponse.json({ error: 'Tài khoản đã hết hạn' }, { status: 403 })

    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS daily_codes (
      id integer PRIMARY KEY,
      code text NOT NULL,
      updated_at timestamptz NOT NULL DEFAULT NOW()
    )`

    const rows = await prisma.$queryRaw<{ code: string; updated_at: Date }[]>`
      SELECT code, updated_at FROM daily_codes WHERE id = 1
    `

    const row = rows?.[0]
    if (!row?.code) return NextResponse.json({ error: 'Chưa thiết lập mã' }, { status: 404 })
    return NextResponse.json({ code: row.code, updatedAt: row.updated_at })
  } catch (error) {
    console.error('Get daily code error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
