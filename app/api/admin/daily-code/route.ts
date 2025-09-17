import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const role = String((session.user as any)?.role || '').toLowerCase()
    if (role !== 'admin') return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const { code } = await request.json()
    const trimmed = String(code || '').trim()
    if (!trimmed) return NextResponse.json({ error: 'Code is required' }, { status: 400 })

    // Ensure table exists
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS daily_codes (
      id integer PRIMARY KEY,
      code text NOT NULL,
      updated_at timestamptz NOT NULL DEFAULT NOW()
    )`

    // Upsert using SQL to avoid Prisma model dependency
    const rows = await prisma.$queryRaw<{ code: string; updated_at: Date }[]>`
      INSERT INTO daily_codes (id, code, updated_at)
      VALUES (1, ${trimmed}, NOW())
      ON CONFLICT (id)
      DO UPDATE SET code = EXCLUDED.code, updated_at = EXCLUDED.updated_at
      RETURNING code, updated_at
    `

    const row = rows?.[0]
    return NextResponse.json({ success: true, dailyCode: row?.code, updatedAt: row?.updated_at })
  } catch (error) {
    console.error('Set daily code error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
