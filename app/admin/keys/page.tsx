import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatNumber, formatRelativeTime } from "@/lib/utils"

async function getKeys() {
  const keys = await prisma.keys.findMany({
    orderBy: { created_at: 'desc' },
    take: 100,
    select: {
      id: true,
      key_value: true,
      requests: true,
      is_used: true,
      used_by: true,
      used_at: true,
      expires_at: true,
      is_expired: true,
      description: true,
      created_at: true,
    }
  })
  return keys
}

export default async function AdminKeysPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth/login")
  if ((session.user as any)?.role?.toLowerCase() !== 'admin') redirect("/dashboard")

  const keys = await getKeys()

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quản lý Keys</CardTitle>
          <CardDescription>Danh sách 100 key gần nhất</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr>
                  <th className="py-2">Key</th>
                  <th className="py-2">Requests</th>
                  <th className="py-2">Trạng thái</th>
                  <th className="py-2">Người dùng</th>
                  <th className="py-2">Hạn</th>
                  <th className="py-2">Tạo lúc</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((k) => (
                  <tr key={k.id} className="border-t">
                    <td className="py-2 font-mono">{k.key_value}</td>
                    <td className="py-2">{formatNumber(k.requests)}</td>
                    <td className="py-2">{k.is_used ? 'Đã dùng' : (k.is_expired ? 'Hết hạn' : 'Chưa dùng')}</td>
                    <td className="py-2">{k.used_by ?? '-'}</td>
                    <td className="py-2">{k.expires_at ? formatRelativeTime(k.expires_at) : '-'}</td>
                    <td className="py-2">{formatRelativeTime(k.created_at as any)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
