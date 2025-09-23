"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowRightLeft, 
  Coins, 
  Copy, 
  CheckCircle, 
  AlertCircle, 
  Loader2 
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { formatNumber } from "@/lib/utils"

export default function ExchangePage() {
  const { data: session, update } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [generatedToken, setGeneratedToken] = useState("")
  const [error, setError] = useState("")

  const TOKEN_COST_REQUESTS = 50
  const userRequests = session?.user?.requests || 0

  const onSubmit = async () => {
    const totalNeeded = TOKEN_COST_REQUESTS
    if (totalNeeded > userRequests) {
      setError("Số request không đủ")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/exchange", {
        method: "POST",
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || "Có lỗi xảy ra khi đổi token")
        return
      }

      const tokenDisplay = Array.isArray(result.tokens) ? result.tokens.join("\n") : result.token
      setGeneratedToken(tokenDisplay)
      setShowResult(true)
      
      await update()
      
      toast({
        title: "Đổi token thành công!",
        description: `Bạn đã đổi 1 token (50 requests)`,
      })

    } catch (error) {
      setError("Có lỗi xảy ra khi đổi token")
    } finally {
      setIsLoading(false)
    }
  }

  const copyToken = async () => {
    try {
      await navigator.clipboard.writeText(generatedToken)
      toast({
        title: "Đã sao chép",
        description: "Token đã được sao chép vào clipboard",
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể sao chép token",
        variant: "destructive"
      })
    }
  }

  // No quantity selection; always 1 token per exchange

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Đổi Token</h2>
          <p className="text-muted-foreground">
            Chuyển đổi request của bạn thành token để sử dụng trong các ứng dụng
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Exchange Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5" />
              Thông tin đổi token
            </CardTitle>
            <CardDescription>
              Mỗi lần chỉ đổi được 1 token (50 requests)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label>Số token muốn đổi</Label>
                <div className="text-2xl font-bold">1</div>
                <p className="text-xs text-muted-foreground">
                  Bạn có {formatNumber(userRequests)} request khả dụng
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tỷ lệ đổi:</span>
                  <span className="font-medium">50 Request = 1 Token</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Số token muốn đổi:</span>
                  <span className="font-medium">1</span>
                </div>
                <div className="flex justify-between text-sm font-semibold">
                  <span>Requests cần dùng:</span>
                  <span className="text-primary">{formatNumber(TOKEN_COST_REQUESTS)}</span>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || TOKEN_COST_REQUESTS > userRequests}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Đổi 1 Token
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info & Stats */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5" />
                Thông tin tài khoản
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Request hiện tại:</span>
                <span className="text-2xl font-bold text-primary">
                  {formatNumber(userRequests)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Sau khi đổi:</span>
                <span className="text-lg font-semibold">
                  {formatNumber(userRequests - TOKEN_COST_REQUESTS)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lưu ý quan trọng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm">Token sẽ chỉ hiển thị 1 lần duy nhất</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm">Token có thể sử dụng ngay lập tức</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm">Giao dịch được ghi lại trong lịch sử</p>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm">Hãy sao chép và lưu token cẩn thận</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Result Dialog */}
      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Token đã được tạo thành công!
            </DialogTitle>
            <DialogDescription>
              Hãy sao chép token bên dưới. Token sẽ chỉ hiển thị 1 lần duy nhất.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="token" className="sr-only">
                  Token
                </Label>
                <Input
                  id="token"
                  value={generatedToken}
                  readOnly
                  className="font-mono text-sm"
                />
              </div>
              <Button type="button" size="icon" onClick={copyToken}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm text-muted-foreground">
                <strong>Quan trọng:</strong> Hãy lưu token này ở nơi an toàn. 
                Bạn sẽ không thể xem lại token này sau khi đóng cửa sổ.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
