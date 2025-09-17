import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function AdminDebugPage() {
  const session = await getServerSession(authOptions)
  
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Admin Debug Info</CardTitle>
          <CardDescription>Thông tin session và quyền truy cập admin</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Session Status:</h3>
              <p className="text-sm text-muted-foreground">
                {session ? "✅ Có session" : "❌ Không có session"}
              </p>
            </div>
            
            {session && (
              <>
                <div>
                  <h3 className="font-semibold">User Info:</h3>
                  <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                    {JSON.stringify(session.user, null, 2)}
                  </pre>
                </div>
                
                <div>
                  <h3 className="font-semibold">Role Check:</h3>
                  <p className="text-sm">
                    Role: <code>{(session.user as any)?.role}</code>
                  </p>
                  <p className="text-sm">
                    Is Admin: <code>{(session.user as any)?.role?.toLowerCase() === 'admin' ? '✅ YES' : '❌ NO'}</code>
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold">Admin Access:</h3>
                  <p className="text-sm">
                    {(session.user as any)?.role?.toLowerCase() === 'admin' 
                      ? "✅ Có thể truy cập admin panel" 
                      : "❌ Không thể truy cập admin panel"
                    }
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
