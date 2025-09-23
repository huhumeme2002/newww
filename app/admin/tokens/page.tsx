import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

async function getTokens() {
  const tokens = await prisma.uploaded_tokens.findMany({
    orderBy: { created_at: 'desc' },
    take: 200,
    select: { id: true, token_value: true, is_used: true, used_by: true, used_at: true, created_at: true }
  })
  return tokens
}

export default async function AdminTokensPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth/login")
  if ((session.user as any)?.role?.toLowerCase() !== 'admin') redirect("/dashboard")

  const tokens = await getTokens()

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quản lý Tokens</CardTitle>
          <CardDescription>Tải lên file .txt/.csv (mỗi dòng một token) hoặc xem danh sách gần đây</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form action="/api/admin/tokens/upload" method="post" encType="multipart/form-data" className="flex items-center gap-2">
            <input type="file" name="file" accept=".txt,.csv" className="text-sm" />
            <Button type="submit">Upload</Button>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr>
                  <th className="py-2">Token</th>
                  <th className="py-2">Trạng thái</th>
                  <th className="py-2">User</th>
                  <th className="py-2">Dùng lúc</th>
                  <th className="py-2">Tạo lúc</th>
                </tr>
              </thead>
              <tbody>
                {tokens.map((t) => (
                  <tr key={t.id} className="border-t">
                    <td className="py-2 font-mono">{t.token_value}</td>
                    <td className="py-2">{t.is_used ? 'Đã cấp' : 'Chưa cấp'}</td>
                    <td className="py-2">{t.used_by ?? '-'}</td>
                    <td className="py-2">{t.used_at ? new Date(t.used_at as any).toLocaleString() : '-'}</td>
                    <td className="py-2">{new Date(t.created_at as any).toLocaleString()}</td>
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
