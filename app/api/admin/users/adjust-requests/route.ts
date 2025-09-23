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

    const { userId, amount, reason } = await request.json()
    const id = parseInt(userId)
    const delta = parseInt(amount)
    if (!id || !Number.isFinite(delta) || delta === 0) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    const updatedRequests = await prisma.$transaction(async (tx) => {
      await tx.users.update({
        where: { id },
        data: { requests: { increment: delta } },
      })

      await tx.request_transactions.create({
        data: {
          user_id: id,
          requests_amount: delta,
          description: reason || `Admin điều chỉnh ${delta > 0 ? '+' : ''}${delta} requests`,
        },
      })

      const u = await tx.users.findUnique({ where: { id }, select: { requests: true } })
      return u?.requests ?? null
    })

    return NextResponse.json({ ok: true, requests: updatedRequests })
  } catch (error) {
    console.error("Admin adjust requests error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}


