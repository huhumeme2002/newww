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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  Settings, 
  User, 
  Lock, 
  Eye, 
  EyeOff,
  CheckCircle,
  AlertCircle,
  Loader2,
  Shield
} from "lucide-react"
import { changePasswordSchema, type ChangePasswordInput } from "@/lib/validations/auth"
import { toast } from "@/components/ui/use-toast"
import { formatDate, formatNumber } from "@/lib/utils"

export default function SettingsPage() {
  const { data: session } = useSession()
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema)
  })

  const onSubmitPassword = async (data: ChangePasswordInput) => {
    setIsChangingPassword(true)
    setPasswordError("")
    setPasswordSuccess(false)

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        setPasswordError(result.error || "Có lỗi xảy ra khi đổi mật khẩu")
        return
      }

      setPasswordSuccess(true)
      toast({
        title: "Đổi mật khẩu thành công!",
        description: "Mật khẩu của bạn đã được cập nhật",
      })

      // Reset form
      reset()

    } catch (error) {
      setPasswordError("Có lỗi xảy ra khi đổi mật khẩu")
    } finally {
      setIsChangingPassword(false)
    }
  }

  if (!session) return null

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Cài đặt tài khoản</h2>
          <p className="text-muted-foreground">
            Quản lý thông tin cá nhân và bảo mật tài khoản
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Info */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Thông tin cá nhân
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="text-lg">
                    {session.user.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="font-semibold">{session.user.username}</h3>
                  <p className="text-sm text-muted-foreground">{session.user.email}</p>
                  <Badge variant={session.user.role?.toLowerCase() === 'admin' ? 'destructive' : 'default'}>
                    {session.user.role?.toLowerCase() === 'admin' ? 'Admin' : 'User'}
                  </Badge>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Requests hiện tại:</span>
                  <span className="font-medium">{formatNumber(session.user.requests)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Trạng thái:</span>
                  <Badge variant={session.user.isActive ? 'default' : 'destructive'}>
                    {session.user.isActive ? 'Hoạt động' : 'Bị khóa'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Bảo mật
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Đăng nhập bảo mật</p>
                  <p className="text-xs text-muted-foreground">Tài khoản được bảo vệ bằng mật khẩu</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Mã hóa dữ liệu</p>
                  <p className="text-xs text-muted-foreground">Thông tin được mã hóa an toàn</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Đổi mật khẩu
              </CardTitle>
              <CardDescription>
                Cập nhật mật khẩu để bảo vệ tài khoản của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-4">
                {passwordError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{passwordError}</AlertDescription>
                  </Alert>
                )}

                {passwordSuccess && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>Mật khẩu đã được thay đổi thành công!</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Nhập mật khẩu hiện tại"
                      {...register("currentPassword")}
                      disabled={isChangingPassword}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      disabled={isChangingPassword}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {errors.currentPassword && (
                    <p className="text-sm text-destructive">{errors.currentPassword.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Mật khẩu mới</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Nhập mật khẩu mới"
                      {...register("newPassword")}
                      disabled={isChangingPassword}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      disabled={isChangingPassword}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-sm text-destructive">{errors.newPassword.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmNewPassword">Xác nhận mật khẩu mới</Label>
                  <div className="relative">
                    <Input
                      id="confirmNewPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Nhập lại mật khẩu mới"
                      {...register("confirmNewPassword")}
                      disabled={isChangingPassword}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isChangingPassword}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {errors.confirmNewPassword && (
                    <p className="text-sm text-destructive">{errors.confirmNewPassword.message}</p>
                  )}
                </div>

                <Button type="submit" disabled={isChangingPassword}>
                  {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Đổi mật khẩu
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Account Info (Read-only) */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin tài khoản</CardTitle>
              <CardDescription>
                Các thông tin cơ bản về tài khoản của bạn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input value={session.user.username} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={session.user.email} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Vai trò</Label>
                  <Input value={session.user.role?.toLowerCase() === 'admin' ? 'Quản trị viên' : 'Người dùng'} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Requests hiện tại</Label>
                  <Input value={formatNumber(session.user.requests)} disabled />
                </div>
              </div>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Để thay đổi username hoặc email, vui lòng liên hệ với quản trị viên.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
