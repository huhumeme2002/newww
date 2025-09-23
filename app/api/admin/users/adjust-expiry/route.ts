import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const role = String((session.user as any)?.role || "").toLowerCase()
    if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const { userId, days, reason } = await request.json()
    const id = parseInt(userId)
    const d = parseInt(days)
    if (!id || !Number.isFinite(d)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    const user = await prisma.users.findUnique({ where: { id }, select: { expiry_time: true } })
    const base = user?.expiry_time || new Date()
    const newExpiry = new Date(base)
    newExpiry.setDate(newExpiry.getDate() + d)

    await prisma.users.update({
      where: { id },
      data: { expiry_time: newExpiry, is_expired: false },
    })

    await prisma.request_transactions.create({
      data: {
        user_id: id,
        requests_amount: 0,
        description: reason || `Admin điều chỉnh hạn dùng ${d > 0 ? '+' : ''}${d} ngày`,
      },
    })

    return NextResponse.json({ ok: true, expiry_time: newExpiry.toISOString() })
  } catch (error) {
    console.error("Admin adjust expiry error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}


