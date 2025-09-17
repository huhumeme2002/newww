"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { LogoutButton } from "@/components/logout-button"
import { Menu, X, Coins } from "lucide-react"
import { useSession } from "next-auth/react"

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { data } = useSession()
  const isLoggedIn = Boolean(data?.user?.id)
  const isAdmin = String((data?.user as any)?.role || '').toLowerCase() === 'admin'

  return (
    <nav className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <Coins className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">Token Exchange</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/features" className="text-muted-foreground hover:text-primary transition-colors">
              Tính năng
            </Link>
            <Link href="/pricing" className="text-muted-foreground hover:text-primary transition-colors">
              Bảng giá
            </Link>
            <Link href="/docs" className="text-muted-foreground hover:text-primary transition-colors">
              API Docs
            </Link>
            <Link href="/help" className="text-muted-foreground hover:text-primary transition-colors">
              Hỗ trợ
            </Link>
            <a
              href="https://docs.google.com/document/d/1R5bhNDH_4RBaOCNIJSHxwe3Sv6dENtAJAmoOyzIrsPs/edit?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Hướng dẫn
            </a>
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            {isLoggedIn ? (
              <>
                {isAdmin && (
                  <Button variant="outline" asChild>
                    <Link href="/admin">Quản trị</Link>
                  </Button>
                )}
                <Button asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <LogoutButton />
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">Đăng nhập</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/register">Đăng ký</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-4">
            <Link 
              href="/features" 
              className="block text-muted-foreground hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Tính năng
            </Link>
            <Link 
              href="/pricing" 
              className="block text-muted-foreground hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Bảng giá
            </Link>
            <Link 
              href="/docs" 
              className="block text-muted-foreground hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              API Docs
            </Link>
            <Link 
              href="/help" 
              className="block text-muted-foreground hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Hỗ trợ
            </Link>
            <a 
              href="https://docs.google.com/document/d/1R5bhNDH_4RBaOCNIJSHxwe3Sv6dENtAJAmoOyzIrsPs/edit?usp=sharing" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="block text-muted-foreground hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Hướng dẫn
            </a>
            <div className="pt-4 border-t space-y-2">
              {isLoggedIn ? (
                <>
                  {isAdmin && (
                    <Button variant="outline" asChild className="w-full">
                      <Link href="/admin" onClick={() => setIsMenuOpen(false)}>
                        Quản trị
                      </Link>
                    </Button>
                  )}
                  <Button asChild className="w-full">
                    <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                      Dashboard
                    </Link>
                  </Button>
                  <LogoutButton fullWidth />
                </>
              ) : (
                <>
                  <Button variant="ghost" asChild className="w-full justify-start">
                    <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                      Đăng nhập
                    </Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link href="/auth/register" onClick={() => setIsMenuOpen(false)}>
                      Đăng ký
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
