import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"

export default async function AdminAnalyticsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth/login")
  if ((session.user as any)?.role?.toLowerCase() !== 'admin') redirect("/dashboard")

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Thống kê</h1>
      <p className="text-muted-foreground">Trang đang được phát triển.</p>
    </div>
  )
}
