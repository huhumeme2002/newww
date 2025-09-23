import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { exchangeRequestSchema } from "@/lib/validations/exchange"
import { prisma } from "@/lib/prisma"
import { generateToken } from "@/lib/utils"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    if (!session.user.isActive) {
      return NextResponse.json(
        { error: "Tài khoản đã bị khóa" },
        { status: 403 }
      )
    }

    // Luôn cấp đúng 1 token mỗi lần
    const userId = parseInt(session.user.id)
    const TOKEN_COST_REQUESTS = 50

    // Get current user to check requests
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { requests: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: "Người dùng không tồn tại" },
        { status: 404 }
      )
    }

    const tokensRequested = 1
    const totalRequestsNeeded = tokensRequested * TOKEN_COST_REQUESTS

    if ((user.requests || 0) < totalRequestsNeeded) {
      return NextResponse.json(
        { error: "Số request không đủ" },
        { status: 400 }
      )
    }

    // Use transaction to ensure consistency
    const result = await prisma.$transaction(async (tx) => {
      // Find available uploaded tokens
      const availableTokens = await tx.uploaded_tokens.findMany({
        where: {
          is_used: false,
          OR: [{ expires_at: null }, { expires_at: { gt: new Date() } }],
        },
        orderBy: { created_at: 'asc' },
        take: tokensRequested,
        select: { id: true, token_value: true },
      })

      if (availableTokens.length < tokensRequested) {
        throw new Error('Không đủ token khả dụng. Vui lòng thử lại sau.')
      }

      // Deduct requests from user
      await tx.users.update({
        where: { id: userId },
        data: {
          requests: { decrement: totalRequestsNeeded },
        },
      })

      // Mark tokens as used by this user
      const tokenValues: string[] = []
      for (const t of availableTokens) {
        await tx.uploaded_tokens.update({
          where: { id: t.id },
          data: { is_used: true, used_by: userId, used_at: new Date() },
        })
        tokenValues.push(t.token_value)
      }

      // Log transaction once with total requests used
      await tx.request_transactions.create({
        data: {
          user_id: userId,
          requests_amount: -totalRequestsNeeded,
          description: `Đổi ${tokensRequested} token(s)`,
        },
      })

      return tokenValues
    })

    return NextResponse.json(
      {
        message: "Đổi token thành công",
        token: result[0],
        tokens: result,
        requestsCost: totalRequestsNeeded,
      },
      { status: 200 }
    )

  } catch (error) {
    console.error("Exchange error:", error)
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi đổi token" },
      { status: 500 }
    )
  }
}
