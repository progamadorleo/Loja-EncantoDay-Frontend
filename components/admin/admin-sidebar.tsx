"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  Package,
  Tags,
  LogOut,
  ChevronLeft,
  Menu,
  Store,
  Settings,
  Bell,
  Search,
  X,
  Image,
  ShoppingBag,
  Ticket,
} from "lucide-react"
import { useState, useEffect } from "react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag, badge: "pendingOrders" },
  { href: "/admin/produtos", label: "Produtos", icon: Package },
  { href: "/admin/categorias", label: "Categorias", icon: Tags },
  { href: "/admin/cupons", label: "Cupons", icon: Ticket },
  { href: "/admin/banners", label: "Banners", icon: Image },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { user, logout, accessToken } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [pendingOrders, setPendingOrders] = useState(0)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Buscar quantidade de pedidos pendentes
  useEffect(() => {
    async function fetchPendingOrders() {
      if (!accessToken) return
      
      try {
        const response = await fetch(`${API_URL}/api/orders/admin/all?status=pending&limit=1`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        const result = await response.json()
        if (result.pagination) {
          setPendingOrders(result.pagination.total)
        }
      } catch (error) {
        console.error("Erro ao buscar pedidos pendentes:", error)
      }
    }

    fetchPendingOrders()
    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchPendingOrders, 30000)
    return () => clearInterval(interval)
  }, [accessToken])

  return (
    <>
      {/* Top bar for mobile */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border z-50 lg:hidden flex items-center justify-between px-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link href="/admin" className="font-semibold text-lg flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Store className="h-4 w-4 text-primary-foreground" />
          </div>
          <span>Loja da Day</span>
        </Link>
        <div className="w-9" /> {/* Spacer para centralizar logo */}
      </header>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen bg-card border-r border-border transition-all duration-300 ease-in-out",
          "flex flex-col shadow-xl lg:shadow-none",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          collapsed ? "lg:w-[72px]" : "w-72 lg:w-64"
        )}
      >
        {/* Header */}
        <div className="flex items-center h-16 px-4 border-b border-border">
          <Link href="/admin" className={cn("flex items-center gap-3", collapsed && "lg:justify-center")}>
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25">
              <Store className="h-5 w-5 text-primary-foreground" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-base">Loja da Day</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Admin</span>
              </div>
            )}
          </Link>
          
          {/* Close button mobile */}
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto p-2 rounded-lg hover:bg-muted transition-colors lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
          
          {/* Collapse button desktop */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "hidden lg:flex p-2 rounded-lg hover:bg-muted transition-colors",
              collapsed ? "mx-auto" : "ml-auto"
            )}
          >
            <ChevronLeft
              className={cn(
                "h-4 w-4 transition-transform duration-300",
                collapsed && "rotate-180"
              )}
            />
          </button>
        </div>

        {/* Search bar - only when expanded */}
        {!collapsed && (
          <div className="px-3 py-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar..."
                className="w-full h-9 pl-9 pr-3 text-sm bg-muted/50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/60"
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {!collapsed && (
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-3 py-2 block">
              Menu principal
            </span>
          )}
          {navItems.map((item) => {
            const isActive = item.exact 
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + "/")
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative",
                  collapsed && "lg:justify-center lg:px-2",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                onClick={() => setMobileOpen(false)}
              >
                <item.icon className={cn("h-5 w-5 shrink-0", isActive && "drop-shadow")} />
                {!collapsed && <span className="font-medium">{item.label}</span>}
                {item.badge === "pendingOrders" && pendingOrders > 0 && (
                  <span className={cn(
                    "absolute flex items-center justify-center text-xs font-bold text-white bg-red-500 rounded-full min-w-[20px] h-5 px-1",
                    collapsed ? "top-0 right-0" : "right-3"
                  )}>
                    {pendingOrders > 99 ? "99+" : pendingOrders}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Quick actions - only when expanded */}
        {!collapsed && (
          <div className="px-3 py-3 border-t border-border">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-3 py-2 block">
              Acesso rápido
            </span>
            <Link 
              href="/" 
              target="_blank"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Store className="h-5 w-5" />
              <span className="font-medium">Ver Loja</span>
            </Link>
          </div>
        )}

        {/* User section */}
        <div className={cn("p-3 border-t border-border", collapsed && "lg:px-2")}>
          <div className={cn(
            "flex items-center gap-3 p-2 rounded-xl bg-muted/50",
            collapsed && "lg:justify-center lg:p-2"
          )}>
            <Avatar className="h-9 w-9 border-2 border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                {user ? getInitials(user.name) : "AD"}
              </AvatarFallback>
            </Avatar>
            {!collapsed && user && (
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            )}
            {!collapsed && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                onClick={logout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
          {collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="w-full mt-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </aside>
    </>
  )
}
