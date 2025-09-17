"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Search, User } from "lucide-react"

interface AdminUser {
  id: number
  username: string
  email: string
  role: string
  requests: number
  is_active: boolean
  expiry_time: string | null
  is_expired: boolean
  created_at: string
  last_login?: string | null
}

export function UsersManager() {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<AdminUser[]>([])
  const [selected, setSelected] = useState<AdminUser | null>(null)
  const [error, setError] = useState<string | null>(null)

  const runSearch = async () => {
    setLoading(true)
    setError(null)
    setSelected(null)
    try {
      const res = await fetch(`/api/admin/users/search?q=${encodeURIComponent(query.trim())}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Search failed")
      setResults(data.users || [])
    } catch (e: any) {
      setError(e.message)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const loadDetail = async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/users/${id}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Load user failed")
      setSelected(data.user)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // optional: auto search when query length >= 3
    // if (query.trim().length >= 3) runSearch()
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Username hoặc Email"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && runSearch()}
        />
        <Button onClick={runSearch} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
          Tìm
        </Button>
      </div>

      {error && (
        <div className="text-sm text-destructive">{error}</div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Kết quả</CardTitle>
            <CardDescription>Chọn một user để xem chi tiết</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-[380px] overflow-auto divide-y">
              {results.length === 0 && (
                <div className="text-sm text-muted-foreground">Không có kết quả</div>
              )}
              {results.map((u) => (
                <button
                  key={u.id}
                  className={`w-full text-left p-2 hover:bg-accent rounded ${selected?.id === u.id ? 'bg-muted' : ''}`}
                  onClick={() => loadDetail(u.id)}
                >
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <div>
                      <div className="font-medium">{u.username}</div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Chi tiết</CardTitle>
            <CardDescription>Thông tin tài khoản</CardDescription>
          </CardHeader>
          <CardContent>
            {!selected ? (
              <div className="text-sm text-muted-foreground">Chọn một user để xem chi tiết</div>
            ) : (
              <div className="grid gap-2 text-sm">
                <div><span className="text-muted-foreground">ID:</span> {selected.id}</div>
                <div><span className="text-muted-foreground">Username:</span> {selected.username}</div>
                <div><span className="text-muted-foreground">Email:</span> {selected.email}</div>
                <div><span className="text-muted-foreground">Role:</span> {selected.role}</div>
                <div><span className="text-muted-foreground">Requests:</span> {selected.requests}</div>
                <div><span className="text-muted-foreground">Hạn dùng:</span> {selected.expiry_time ?? 'Không'}</div>
                <div><span className="text-muted-foreground">Trạng thái:</span> {selected.is_active ? 'Hoạt động' : 'Khóa'}</div>
                <div><span className="text-muted-foreground">Đăng nhập cuối:</span> {selected.last_login ?? '-'}</div>
                <div><span className="text-muted-foreground">Tạo lúc:</span> {selected.created_at}</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
