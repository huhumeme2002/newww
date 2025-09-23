import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateVipKey } from "@/lib/utils"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const role = String((session.user as any)?.role || "").toLowerCase()
    if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const { requests, days, description, keyType, customKey } = await request.json()
    const reqs = parseInt(requests ?? 0)
    const d = days !== undefined ? parseInt(days) : undefined
    if (!Number.isFinite(reqs) || reqs <= 0) {
      return NextResponse.json({ error: "Requests phải > 0" }, { status: 400 })
    }

    const expires_at = d !== undefined ? new Date(Date.now() + d * 24 * 60 * 60 * 1000) : null
    const key_value = customKey?.toString().trim() || generateVipKey()

    const key = await prisma.keys.create({
      data: {
        key_value,
        requests: reqs,
        expires_at: expires_at || undefined,
        description: description || null,
        key_type: keyType || 'regular',
      },
      select: {
        id: true,
        key_value: true,
        requests: true,
        expires_at: true,
        description: true,
        key_type: true,
      },
    })

    return NextResponse.json({ key }, { status: 200 })
  } catch (error) {
    console.error("Admin create key error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}


