import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const role = String((session.user as any)?.role || '').toLowerCase()
    if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'File is required' }, { status: 400 })

    const text = await file.text()
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
    if (lines.length === 0) return NextResponse.json({ error: 'No tokens found in file' }, { status: 400 })

    // Insert in batches
    const values = lines.map(token => ({ token_value: token }))
    let inserted = 0
    const batchSize = 500
    for (let i = 0; i < values.length; i += batchSize) {
      const batch = values.slice(i, i + batchSize)
      await prisma.uploaded_tokens.createMany({ data: batch, skipDuplicates: true })
      inserted += batch.length
    }

    return NextResponse.redirect(new URL('/admin/tokens?uploaded=' + inserted, req.url))
  } catch (error) {
    console.error('Upload tokens error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
