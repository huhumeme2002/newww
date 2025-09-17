import { NextRequest, NextResponse } from "next/server"
import { registerSchema } from "@/lib/validations/auth"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/utils"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validation = registerSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ", details: validation.error.issues },
        { status: 400 }
      )
    }

    const { username, email, password } = validation.data

    // Check if user already exists
    const existingUser = await prisma.users.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: username.toLowerCase() }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: existingUser.email === email.toLowerCase() 
          ? "Email đã được sử dụng" 
          : "Username đã được sử dụng" 
        },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create user
    const user = await prisma.users.create({
      data: {
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password_hash: passwordHash,
        requests: 0,
      },
      select: {
        id: true,
        username: true,
        email: true,
        requests: true,
        role: true,
        created_at: true,
      }
    })

    // Log the registration transaction
    // No initial bonus requests

    return NextResponse.json(
      {
        message: "Đăng ký thành công! Bạn nhận được 100 requests miễn phí.",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          requests: user.requests,
          role: user.role,
          createdAt: user.created_at,
        },
      },
      { status: 201 }
    )

  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi đăng ký" },
      { status: 500 }
    )
  }
}
