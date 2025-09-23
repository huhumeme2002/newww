import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    NODE_ENV: process.env.NODE_ENV,
    HAS_DATABASE_URL: Boolean(process.env.DATABASE_URL),
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || null,
    HAS_NEXTAUTH_SECRET: Boolean(process.env.NEXTAUTH_SECRET),
  })
}


