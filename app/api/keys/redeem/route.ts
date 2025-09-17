import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redeemKeySchema } from "@/lib/validations/exchange"
import { prisma } from "@/lib/prisma"

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

    const body = await request.json()
    
    // Validate input
    const validation = redeemKeySchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: "Format key không đúng", details: validation.error.issues },
        { status: 400 }
      )
    }

    const { keyValue } = validation.data
    const userId = parseInt(session.user.id)

    // Find the key
    const key = await prisma.keys.findUnique({
      where: { key_value: keyValue }
    })

    if (!key) {
      return NextResponse.json(
        { error: "Key không tồn tại hoặc không hợp lệ" },
        { status: 404 }
      )
    }

    if (key.is_used) {
      return NextResponse.json(
        { error: "Key đã được sử dụng" },
        { status: 400 }
      )
    }

    if (key.is_expired) {
      return NextResponse.json(
        { error: "Key đã hết hạn" },
        { status: 400 }
      )
    }

    // Check if key has expiry date and is expired
    if (key.expires_at && key.expires_at < new Date()) {
      // Mark as expired
      await prisma.keys.update({
        where: { id: key.id },
        data: { is_expired: true }
      })

      return NextResponse.json(
        { error: "Key đã hết hạn" },
        { status: 400 }
      )
    }

    // Use transaction to ensure consistency
    const result = await prisma.$transaction(async (tx) => {
      // Mark key as used
      await tx.keys.update({
        where: { id: key.id },
        data: {
          is_used: true,
          used_by: userId,
          used_at: new Date()
        }
      })

      // Add requests to user
      const updatedUser = await tx.users.update({
        where: { id: userId },
        data: {
          requests: {
            increment: key.requests
          }
        },
        select: {
          requests: true
        }
      })

      // Log transaction
      await tx.request_transactions.create({
        data: {
          user_id: userId,
          requests_amount: key.requests,
          description: `Sử dụng VIP key: ${keyValue} - ${key.description || 'Không có mô tả'}`
        }
      })

      return {
        requests: key.requests,
        description: key.description,
        newTotal: updatedUser.requests
      }
    })

    return NextResponse.json(
      { 
        message: "Sử dụng key thành công",
        requests: result.requests,
        description: result.description,
        newTotal: result.newTotal
      },
      { status: 200 }
    )

  } catch (error) {
    console.error("Key redeem error:", error)
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi sử dụng key" },
      { status: 500 }
    )
  }
}
