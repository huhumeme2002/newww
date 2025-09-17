import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { History, TrendingUp, TrendingDown, Calendar } from "lucide-react"
import { formatNumber, formatRelativeTime, formatDate } from "@/lib/utils"

async function getTransactionHistory(userId: number) {
  const transactions = await prisma.request_transactions.findMany({
    where: { user_id: userId },
    orderBy: { created_at: 'desc' },
    take: 50,
    select: {
      id: true,
      requests_amount: true,
      description: true,
      created_at: true,
    }
  })

  const stats = await prisma.request_transactions.aggregate({
    where: { user_id: userId },
    _sum: { requests_amount: true },
    _count: { id: true }
  })

  return { transactions, stats }
}

const getAmountMeta = (amount: number) => ({
  isPositive: amount > 0,
  label: amount > 0 ? 'Cộng requests' : 'Trừ requests',
})

export default async function HistoryPage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const { transactions, stats } = await getTransactionHistory(parseInt(session.user.id))
  const tokens = await prisma.uploaded_tokens.findMany({
    where: { used_by: parseInt(session.user.id) },
    orderBy: { used_at: 'desc' },
    select: { token_value: true, used_at: true },
  })
  const total = stats._sum.requests_amount || 0
  const totalEarned = Math.max(0, total)
  const totalSpent = Math.max(0, -total)

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Lịch sử giao dịch</h2>
          <p className="text-muted-foreground">
            Theo dõi tất cả các giao dịch request của bạn
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng giao dịch
            </CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats._count.id || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Số lần giao dịch
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Requests nhận được
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{formatNumber(totalEarned)}</div>
            <p className="text-xs text-muted-foreground">
              Từ keys và điều chỉnh
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Requests đã đổi
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">-{formatNumber(totalSpent)}</div>
            <p className="text-xs text-muted-foreground">
              Đổi thành tokens
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Hiện tại
            </CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatNumber(session.user.requests)}</div>
            <p className="text-xs text-muted-foreground">
              Requests có sẵn
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction List */}
      <Card>
        <CardHeader>
          <CardTitle>Chi tiết giao dịch</CardTitle>
          <CardDescription>
            Danh sách các giao dịch gần đây (50 giao dịch cuối)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <div className="space-y-4">
              {transactions.map((transaction) => {
                const { isPositive, label } = getAmountMeta(transaction.requests_amount)
                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isPositive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        <History className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{label}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {transaction.description || (transaction.created_at ? formatDate(transaction.created_at) : 'N/A')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right space-y-1">
                      <p className={`font-semibold ${
                        isPositive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {isPositive ? '+' : ''}{formatNumber(transaction.requests_amount)} requests
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {transaction.created_at ? formatRelativeTime(transaction.created_at) : 'N/A'}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Chưa có giao dịch nào</h3>
              <p className="text-muted-foreground mb-4">
                Bạn chưa thực hiện giao dịch nào. Hãy bắt đầu bằng cách đổi requests thành tokens hoặc sử dụng VIP keys.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Issued Tokens */}
      <Card>
        <CardHeader>
          <CardTitle>Token đã nhận</CardTitle>
          <CardDescription>Tất cả token bạn đã đổi từ requests</CardDescription>
        </CardHeader>
        <CardContent>
          {tokens.length > 0 ? (
            <div className="space-y-2">
              {tokens.map((t, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg border">
                  <code className="text-xs break-all">{t.token_value}</code>
                  <span className="text-xs text-muted-foreground">{t.used_at ? formatRelativeTime(t.used_at as unknown as Date) : ''}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Bạn chưa nhận token nào.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
