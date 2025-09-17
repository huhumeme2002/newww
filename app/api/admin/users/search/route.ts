import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const role = String((session.user as any)?.role || "").toLowerCase()
    if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const q = (searchParams.get("q") || "").trim()
    if (!q) {
      return NextResponse.json({ users: [] }, { status: 200 })
    }

    const users = await prisma.users.findMany({
      where: {
        OR: [
          { username: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: { created_at: "desc" },
      take: 20,
      select: {
        id: true,
        username: true,
        email: true,
        requests: true,
        role: true,
        is_active: true,
        expiry_time: true,
        is_expired: true,
        created_at: true,
      },
    })

    return NextResponse.json({ users }, { status: 200 })
  } catch (error) {
    console.error("Admin search users error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}


