import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { changePasswordSchema } from "@/lib/validations/auth"
import { prisma } from "@/lib/prisma"
import { hashPassword, verifyPassword } from "@/lib/utils"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validate input
    const validation = changePasswordSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ", details: validation.error.issues },
        { status: 400 }
      )
    }

    const { currentPassword, newPassword } = validation.data
    const userId = parseInt(session.user.id)

    // Get user with current password hash
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { password_hash: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: "Người dùng không tồn tại" },
        { status: 404 }
      )
    }

    // Verify current password
    const isCurrentPasswordValid = await verifyPassword(currentPassword, user.password_hash as unknown as string)
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: "Mật khẩu hiện tại không đúng" },
        { status: 400 }
      )
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword)

    // Update password
    await prisma.users.update({
      where: { id: userId },
      data: { password_hash: newPasswordHash }
    })

    return NextResponse.json(
      { message: "Đổi mật khẩu thành công" },
      { status: 200 }
    )

  } catch (error) {
    console.error("Change password error:", error)
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi đổi mật khẩu" },
      { status: 500 }
    )
  }
}
