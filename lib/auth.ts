import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { verifyPassword } from "@/lib/utils"
import { users as PrismaUser } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      username: string
      email: string
      role: string
      requests: number
      isActive: boolean
    }
  }

  interface User {
    id: string
    username: string
    email: string
    role: string
    requests: number
    isActive: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    username: string
    role: string
    requests: number
    isActive: boolean
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email và mật khẩu là bắt buộc")
        }

        // Tìm user theo email hoặc username
        const user = await prisma.users.findFirst({
          where: {
            OR: [
              { email: credentials.email.toLowerCase() },
              { username: credentials.email.toLowerCase() }
            ]
          }
        })

        if (!user) {
          throw new Error("Email/Username hoặc mật khẩu không đúng")
        }

        if (!user.is_active) {
          throw new Error("Tài khoản đã bị khóa")
        }

        const isPasswordValid = await verifyPassword(credentials.password, user.password_hash)

        if (!isPasswordValid) {
          throw new Error("Email hoặc mật khẩu không đúng")
        }

        // Update last login
        await prisma.users.update({
          where: { id: user.id },
          data: { last_login: new Date() }
        })

        return {
          id: user.id.toString(),
          username: user.username,
          email: user.email,
          role: user.role || 'user',
          requests: user.requests || 0,
          isActive: user.is_active || false,
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 1 day
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 1 day
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = user.username
        token.role = user.role
        token.requests = user.requests
        token.isActive = user.isActive
        token.lastChecked = Date.now()
      }

      // Refresh user data every 5 minutes or if not checked before
      const now = Date.now()
      const fiveMinutes = 5 * 60 * 1000
      
      if (token.id && (!token.lastChecked || now - (token.lastChecked as number) > fiveMinutes)) {
        const dbUser = await prisma.users.findUnique({
          where: { id: parseInt(token.id) }
        })

        if (dbUser) {
          token.username = dbUser.username
          token.role = dbUser.role || 'user'
          token.requests = dbUser.requests || 0
          token.isActive = dbUser.is_active || false
          token.lastChecked = now
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.username = token.username
        session.user.role = token.role
        session.user.requests = token.requests
        session.user.isActive = token.isActive
      }

      return session
    }
  },
  pages: {
    signIn: '/auth/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
