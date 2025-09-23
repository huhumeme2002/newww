import NextAuth from "next-auth"
export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0
import { authOptions } from "@/lib/auth"

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
