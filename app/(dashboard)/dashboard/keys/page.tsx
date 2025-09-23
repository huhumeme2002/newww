"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { 
  Key, 
  Gift, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Loader2 
} from "lucide-react"
import { redeemKeySchema, type RedeemKeyInput } from "@/lib/validations/exchange"
import { toast } from "@/components/ui/use-toast"
import { formatNumber, formatRelativeTime } from "@/lib/utils"

interface RedeemResult {
  requests: number
  description?: string
}

export default function KeysPage() {
  const { data: session, update } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [redeemResult, setRedeemResult] = useState<RedeemResult | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<RedeemKeyInput>({
    resolver: zodResolver(redeemKeySchema)
  })

  const onSubmit = async (data: RedeemKeyInput) => {
    setIsLoading(true)
    setError("")
    setRedeemResult(null)

    try {
      const response = await fetch("/api/keys/redeem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || "Có lỗi xảy ra khi sử dụng key")
        return
      }

      setRedeemResult({
        requests: result.requests,
        description: result.description
      })
      
      // Update session to reflect new request count
      await update()
      
      toast({
        title: "Sử dụng key thành công!",
        description: `Bạn đã nhận ${formatNumber(result.requests)} requests`,
      })

      // Reset form
      reset()

    } catch (error) {
      setError("Có lỗi xảy ra khi sử dụng key")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">VIP Keys</h2>
          <p className="text-muted-foreground">
            Nhập VIP key để nhận thêm requests miễn phí
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Redeem Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Nhập VIP Key
            </CardTitle>
            <CardDescription>
              Nhập mã VIP key để nhận requests miễn phí
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {redeemResult && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Thành công! Bạn đã nhận {formatNumber(redeemResult.requests)} requests
                    {redeemResult.description && ` - ${redeemResult.description}`}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="keyValue">Mã VIP Key</Label>
                <Input
                  id="keyValue"
                  type="text"
                  placeholder="VIP-XXXXXX-XXXXXX"
                  {...register("keyValue")}
                  disabled={isLoading}
                  className="font-mono"
                />
                {errors.keyValue && (
                  <p className="text-sm text-destructive">{errors.keyValue.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Format: VIP-XXXXXX-XXXXXX (12 ký tự, không bao gồm dấu gạch ngang)
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sử dụng VIP Key
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info & Instructions */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Thông tin requests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Requests hiện tại:</span>
                <span className="text-2xl font-bold text-primary">
                  {formatNumber(session?.user?.requests || 0)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cách sử dụng VIP Key</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-primary">1</span>
                </div>
                <p className="text-sm">Nhận VIP key từ admin hoặc các chương trình khuyến mãi</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-primary">2</span>
                </div>
                <p className="text-sm">Nhập mã key vào ô bên trái với format VIP-XXXXXX-XXXXXX</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-primary">3</span>
                </div>
                <p className="text-sm">Nhấn "Sử dụng VIP Key" để nhận requests miễn phí</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-primary">4</span>
                </div>
                <p className="text-sm">Requests sẽ được cộng vào tài khoản ngay lập tức</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lưu ý quan trọng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm">Mỗi VIP key chỉ có thể sử dụng 1 lần</p>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm">Một số key có thể có thời hạn sử dụng</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm">Requests nhận được có thể dùng ngay để đổi token</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
