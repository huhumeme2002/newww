import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UsersManager } from "@/components/admin/users-manager"

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth/login")
  if ((session.user as any)?.role?.toLowerCase() !== 'admin') redirect("/dashboard")

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quản lý Users</CardTitle>
          <CardDescription>Tìm kiếm và xem chi tiết người dùng</CardDescription>
        </CardHeader>
        <CardContent>
          <UsersManager />
        </CardContent>
      </Card>
    </div>
  )
}
