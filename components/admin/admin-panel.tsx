"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export function AdminPanel() {
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedUserId, setSelectedUserId] = useState("")
  const [reason, setReason] = useState("")
  const [amount, setAmount] = useState("")
  const [days, setDays] = useState("")
  const [keyRequests, setKeyRequests] = useState("")
  const [keyDays, setKeyDays] = useState("")
  const [keyDescription, setKeyDescription] = useState("")
  const [customKey, setCustomKey] = useState("")

  const [dailyCode, setDailyCode] = useState("")

  // Change password
  const [newPass, setNewPass] = useState("")
  const [confirmNewPass, setConfirmNewPass] = useState("")

  const searchUsers = async () => {
    const q = (document.getElementById('adm-q') as HTMLInputElement).value
    if (!q.trim()) return
    
    try {
      const res = await fetch(`/api/admin/users/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setSearchResults(data.users || [])
    } catch (error) {
      console.error("Search error:", error)
      alert("Lỗi tìm kiếm")
    }
  }

  const updateDailyCode = async () => {
    if (!dailyCode.trim()) {
      alert('Nhập mã cần cập nhật')
      return
    }
    try {
      const res = await fetch('/api/admin/daily-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: dailyCode.trim() })
      })
      const data = await res.json()
      if (res.ok) {
        alert(`Đã cập nhật mã ngày: ${data.dailyCode}`)
      } else {
        alert(data.error || 'Cập nhật thất bại')
      }
    } catch (error) {
      console.error('Update daily code error:', error)
      alert('Lỗi cập nhật mã ngày')
    }
  }

  const adjustRequests = async () => {
    if (!selectedUserId || !amount) {
      alert("Vui lòng chọn user và nhập số requests")
      return
    }
    
    try {
      const res = await fetch('/api/admin/users/adjust-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUserId, amount: parseInt(amount), reason })
      })
      const data = await res.json()
      if (res.ok) {
        alert(`Đã điều chỉnh requests. Requests mới: ${data.requests ?? 'N/A'}`)
        setAmount("")
      } else {
        alert(data.error || 'Không thể điều chỉnh requests')
      }
    } catch (error) {
      console.error("Adjust requests error:", error)
      alert("Lỗi điều chỉnh requests")
    }
  }

  const adjustExpiry = async () => {
    if (!selectedUserId || !days) {
      alert("Vui lòng chọn user và nhập số ngày")
      return
    }
    
    try {
      const res = await fetch('/api/admin/users/adjust-expiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUserId, days: parseInt(days), reason })
      })
      const data = await res.json()
      if (res.ok) {
        alert(`Đã điều chỉnh hạn dùng. Hạn mới: ${data.expiry_time}`)
        setDays("")
      } else {
        alert(data.error || 'Không thể điều chỉnh hạn dùng')
      }
    } catch (error) {
      console.error("Adjust expiry error:", error)
      alert("Lỗi điều chỉnh hạn dùng")
    }
  }

  const changePassword = async () => {
    if (!selectedUserId || !newPass) {
      alert("Vui lòng chọn user và nhập mật khẩu mới")
      return
    }
    if (newPass.length < 6) {
      alert("Mật khẩu mới phải có ít nhất 6 ký tự")
      return
    }
    if (newPass !== confirmNewPass) {
      alert("Xác nhận mật khẩu không khớp")
      return
    }
    try {
      const res = await fetch('/api/admin/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: parseInt(selectedUserId), newPassword: newPass })
      })
      const data = await res.json()
      if (res.ok) {
        alert('Đã cập nhật mật khẩu mới cho user')
        setNewPass("")
        setConfirmNewPass("")
      } else {
        alert(data.error || 'Không thể đổi mật khẩu')
      }
    } catch (error) {
      console.error('Change password error:', error)
      alert('Lỗi đổi mật khẩu')
    }
  }

  const createKey = async () => {
    if (!keyRequests) {
      alert("Vui lòng nhập số requests")
      return
    }
    
    try {
      const res = await fetch('/api/admin/keys/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: parseInt(keyRequests),
          days: keyDays ? parseInt(keyDays) : undefined,
          description: keyDescription,
          customKey: customKey
        })
      })
      const data = await res.json()
      if (data?.key?.key_value) {
        navigator.clipboard.writeText(data.key.key_value).catch(() => {})
        alert(`Đã tạo key: ${data.key.key_value} (đã copy clipboard)`)
        setKeyRequests("")
        setKeyDays("")
        setKeyDescription("")
        setCustomKey("")
      } else {
        alert(data.error || 'Tạo key thất bại')
      }
    } catch (error) {
      console.error("Create key error:", error)
      alert("Lỗi tạo key")
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Adjust requests / expiry */}
      <Card>
        <CardHeader>
          <CardTitle>Điều chỉnh người dùng</CardTitle>
          <CardDescription>Tìm user rồi cộng/trừ requests, cộng/trừ ngày</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Tìm người dùng (username/email)</Label>
            <div className="flex gap-2">
              <Input id="adm-q" placeholder="VD: khanhdx23" />
              <Button onClick={searchUsers} variant="outline">Tìm</Button>
            </div>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-2">
              <Label>Kết quả tìm kiếm (click để chọn):</Label>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="p-2 border rounded-md flex items-center justify-between gap-4 cursor-pointer hover:bg-muted"
                    onClick={() => setSelectedUserId(String(user.id))}
                  >
                    <div>
                      <div className="font-medium">{user.username}</div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </div>
                    <div className="text-xs">{user.requests} req</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Daily Code */}
          <div className="space-y-2">
            <Label>Mã đăng nhập hàng ngày</Label>
            <div className="flex gap-2">
              <Input 
                value={dailyCode}
                onChange={(e) => setDailyCode(e.target.value)}
                placeholder="Nhập mã (VD: ABC123)" 
              />
              <Button onClick={updateDailyCode}>Cập nhật</Button>
            </div>
            <p className="text-xs text-muted-foreground">Người dùng còn hạn mới xem được mã này.</p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label>User ID</Label>
              <Input 
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                placeholder="Chọn từ danh sách bên trên" 
              />
            </div>
            <div className="space-y-2">
              <Label>Lý do</Label>
              <Input 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ghi chú (tuỳ chọn)" 
              />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Điều chỉnh requests (+/-)</Label>
              <div className="flex gap-2">
                <Input 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  type="number" 
                  placeholder="VD: 100 hoặc -50" 
                />
                <Button onClick={adjustRequests}>Áp dụng</Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Điều chỉnh hạn dùng ngày (+/-)</Label>
              <div className="flex gap-2">
                <Input 
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  type="number" 
                  placeholder="VD: 30 hoặc -10" 
                />
                <Button onClick={adjustExpiry}>Áp dụng</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change password */}
      <Card>
        <CardHeader>
          <CardTitle>Đổi mật khẩu người dùng</CardTitle>
          <CardDescription>Nhập User ID và mật khẩu mới</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-2">
              <Label>User ID</Label>
              <Input 
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                placeholder="VD: 123" 
              />
            </div>
            <div className="space-y-2">
              <Label>Mật khẩu mới</Label>
              <Input 
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                type="password"
                placeholder="Tối thiểu 6 ký tự" 
              />
            </div>
            <div className="space-y-2">
              <Label>Xác nhận mật khẩu</Label>
              <Input 
                value={confirmNewPass}
                onChange={(e) => setConfirmNewPass(e.target.value)}
                type="password"
                placeholder="Nhập lại mật khẩu" 
              />
            </div>
          </div>
          <Button onClick={changePassword}>Đổi mật khẩu</Button>
        </CardContent>
      </Card>

      {/* Create key */}
      <Card>
        <CardHeader>
          <CardTitle>Tạo VIP Key</CardTitle>
          <CardDescription>Tạo key để user redeem nhận requests</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Số requests</Label>
              <Input 
                value={keyRequests}
                onChange={(e) => setKeyRequests(e.target.value)}
                type="number" 
                placeholder="VD: 100" 
              />
            </div>
            <div className="space-y-2">
              <Label>Hết hạn (ngày, tuỳ chọn)</Label>
              <Input 
                value={keyDays}
                onChange={(e) => setKeyDays(e.target.value)}
                type="number" 
                placeholder="VD: 30" 
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Mô tả (tuỳ chọn)</Label>
            <Input 
              value={keyDescription}
              onChange={(e) => setKeyDescription(e.target.value)}
              placeholder="Ghi chú" 
            />
          </div>
          <div className="space-y-2">
            <Label>Custom key (tuỳ chọn)</Label>
            <Input 
              value={customKey}
              onChange={(e) => setCustomKey(e.target.value)}
              placeholder="Để trống sẽ tự sinh" 
            />
          </div>
          <Button onClick={createKey}>Tạo Key</Button>
        </CardContent>
      </Card>
    </div>
  )
}
