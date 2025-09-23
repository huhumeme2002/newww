import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { AdminNav } from "@/components/admin/admin-nav"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  if ((session.user as any)?.role?.toLowerCase() !== 'admin') {
    redirect("/dashboard")
  }

  if (!session.user.isActive) {
    redirect("/auth/suspended")
  }

  return (
    <div className="flex min-h-screen">
      <AdminNav user={session.user} />
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  )
}
