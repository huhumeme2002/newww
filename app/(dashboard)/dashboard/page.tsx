import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Coins, ArrowRightLeft, Key, Clock, Users, TrendingUp, Calendar, Lock } from "lucide-react"
import Link from "next/link"
import { formatNumber, formatRelativeTime, formatDate } from "@/lib/utils"

async function getDashboardData(userId: number) {
  const [user, tokensCount] = await Promise.all([
    prisma.users.findUnique({
      where: { id: userId },
      select: {
        requests: true,
        created_at: true,
        last_login: true,
        expiry_time: true,
        is_expired: true,
      }
    }),
    prisma.generated_tokens.count({ where: { user_id: userId } })
  ])

  // Ensure daily code table exists and read code (single row id=1)
  await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS daily_codes (
    id integer PRIMARY KEY,
    code text NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT NOW()
  )`
  const dailyRows = await prisma.$queryRaw<{ code: string }[]>`SELECT code FROM daily_codes WHERE id = 1`
  const dailyCode = dailyRows?.[0]?.code || null

  return { user, tokensCount, dailyCode }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const { user, tokensCount, dailyCode } = await getDashboardData(parseInt(session.user.id))

  const isExpired = Boolean(user?.expiry_time && (user.is_expired || user.expiry_time <= new Date()))
  const hasExpiryDate = Boolean(user?.expiry_time)

  const stats = [
    {
      title: "Requests có sẵn",
      value: formatNumber(user?.requests ?? session.user.requests),
      description: "Số request hiện tại trong tài khoản",
      icon: Coins,
      color: "text-blue-600"
    },
    {
      title: "Tokens đã tạo",
      value: formatNumber(tokensCount),
      description: "Tổng số token đã được tạo",
      icon: ArrowRightLeft,
      color: "text-green-600"
    },
    {
      title: "Lần đăng nhập cuối",
      value: user?.last_login ? formatRelativeTime(user.last_login) : "Chưa xác định",
      description: "Thời gian đăng nhập gần nhất",
      icon: Clock,
      color: "text-orange-600"
    },
    {
      title: "Hết hạn tài khoản",
      value: user?.expiry_time ? formatDate(user.expiry_time) : "Không thiết lập",
      description: user?.expiry_time ? (isExpired ? "Đã hết hạn" : "Ngày hết hạn") : "Ngày hết hạn (nếu có)",
      icon: Calendar,
      color: isExpired ? "text-red-600" : "text-purple-600"
    }
  ]

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Chào mừng trở lại, {session.user.username}!
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions & Daily Code */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5 text-primary" />
              Đổi Request thành Token
            </CardTitle>
            <CardDescription>
              Chuyển đổi request của bạn thành token để sử dụng
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/dashboard/exchange">
                Bắt đầu đổi
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Daily Login Code */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Mã đăng nhập hàng ngày
            </CardTitle>
            <CardDescription>
              Chỉ hiển thị khi tài khoản còn hạn sử dụng
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!hasExpiryDate ? (
              <p className="text-sm text-muted-foreground">Tài khoản chưa có ngày hết hạn, không thể xem mã.</p>
            ) : isExpired ? (
              <p className="text-sm text-muted-foreground">Tài khoản đã hết hạn, không thể xem mã.</p>
            ) : dailyCode ? (
              <p className="font-mono text-lg select-all">{dailyCode}</p>
            ) : (
              <p className="text-sm text-muted-foreground">Chưa có mã hoặc không thể tải mã lúc này.</p>
            )}
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              Sử dụng VIP Key
            </CardTitle>
            <CardDescription>
              Nhập VIP key để nhận thêm requests miễn phí
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/keys">
                Nhập key
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Hướng dẫn sử dụng
            </CardTitle>
            <CardDescription>
              Tài liệu hướng dẫn chi tiết cách dùng hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <a
                href="https://docs.google.com/document/d/1R5bhNDH_4RBaOCNIJSHxwe3Sv6dENtAJAmoOyzIrsPs/edit?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
              >
                Mở hướng dẫn
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Xem thống kê
            </CardTitle>
            <CardDescription>
              Theo dõi lịch sử giao dịch và hoạt động
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/history">
                Xem lịch sử
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
