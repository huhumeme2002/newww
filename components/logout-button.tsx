"use client"

import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

interface LogoutButtonProps {
  className?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  fullWidth?: boolean
}

export function LogoutButton({ 
  className, 
  variant = "ghost", 
  size = "sm",
  fullWidth = false 
}: LogoutButtonProps) {
  const handleLogout = () => {
    signOut({ callbackUrl: "/" })
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      className={cn(
        "text-muted-foreground hover:text-primary transition-colors",
        fullWidth && "w-full",
        className
      )}
    >
      <LogOut className="h-4 w-4 mr-2" />
      Đăng xuất
    </Button>
  )
}
