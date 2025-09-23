"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { 
  LayoutDashboard, 
  Users, 
  Key, 
  Coins, 
  BarChart3,
  Settings, 
  LogOut, 
  User, 
  Shield,
  Menu,
  X,
  Home
} from "lucide-react"
import { cn } from "@/lib/utils"

interface AdminNavProps {
  user: {
    id: string
    username: string
    email: string
    role: string
    requests: number
  }
}

const navItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Quản lý Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Quản lý Keys",
    href: "/admin/keys",
    icon: Key,
  },
  {
    title: "Quản lý Tokens",
    href: "/admin/tokens",
    icon: Coins,
  },
  {
    title: "Thống kê",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "Cài đặt hệ thống",
    href: "/admin/settings",
    icon: Settings,
  },
]

export function AdminNav({ user }: AdminNavProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" })
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-card border-r">
        {/* Logo */}
        <div className="p-6 border-b">
          <Link href="/admin" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-destructive rounded-md flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">Admin Panel</span>
          </Link>
        </div>

        {/* User Info */}
        <div className="p-4 border-b bg-muted/30">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback className="bg-destructive text-white">
                {user.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.username}</p>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-md text-sm transition-colors",
                    pathname === item.href
                      ? "bg-destructive text-destructive-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t space-y-2">
          <Button variant="outline" asChild className="w-full justify-start">
            <Link href="/dashboard">
              <Home className="mr-2 h-4 w-4" />
              User Dashboard
            </Link>
          </Button>
          <ThemeToggle />
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Đăng xuất
          </Button>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden">
        <div className="bg-card border-b px-4 py-3 flex items-center justify-between">
          <Link href="/admin" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-destructive rounded-md flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold">Admin Panel</span>
          </Link>
          
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-medium">{user.username}</p>
                    <p className="text-xs text-muted-foreground">Administrator</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <Home className="mr-2 h-4 w-4" />
                    User Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Cài đặt
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="bg-card border-b p-4">
            <nav>
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center space-x-3 px-3 py-2 rounded-md text-sm transition-colors",
                        pathname === item.href
                          ? "bg-destructive text-destructive-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        )}
      </div>
    </>
  )
}
