import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Coins, Key, ListChecks } from "lucide-react"
import { formatNumber } from "@/lib/utils"
import { AdminPanel } from "@/components/admin/admin-panel"

async function getAdminStats() {
  const [usersCount, totalRequests, keysAvailable, tokensAvailable] = await Promise.all([
    prisma.users.count(),
    prisma.users.aggregate({ _sum: { requests: true } }),
    prisma.keys.count({ where: { is_used: false, is_expired: false } }),
    prisma.uploaded_tokens.count({ where: { is_used: false } }),
  ])
  return {
    usersCount,
    totalRequests: totalRequests._sum.requests || 0,
    keysAvailable,
    tokensAvailable,
  }
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth/login")
  
  // Debug: Log the actual role
  console.log('Admin page - User role:', (session.user as any)?.role)
  
  if ((session.user as any)?.role?.toLowerCase() !== 'admin') redirect("/dashboard")

  const stats = await getAdminStats()

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Bảng điều khiển quản trị</h2>
          <p className="text-muted-foreground">Tổng quan nhanh hệ thống</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Người dùng</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.usersCount)}</div>
            <CardDescription>Tổng số tài khoản</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng requests</CardTitle>
            <Coins className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalRequests)}</div>
            <CardDescription>Tổng requests đang có</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Keys khả dụng</CardTitle>
            <Key className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.keysAvailable)}</div>
            <CardDescription>Key chưa sử dụng</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Token khả dụng</CardTitle>
            <ListChecks className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.tokensAvailable)}</div>
            <CardDescription>Token chưa cấp cho người dùng</CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Admin Panel */}
      <AdminPanel />
    </div>
  )
}
