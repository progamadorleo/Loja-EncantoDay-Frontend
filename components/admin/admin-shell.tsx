"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { AdminSidebar } from "./admin-sidebar"
import { Loader2, Store } from "lucide-react"

interface AdminShellProps {
  children: React.ReactNode
}

export function AdminShell({ children }: AdminShellProps) {
  const router = useRouter()
  const { isLoading, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/admin/login")
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-2xl shadow-primary/30 mb-6">
          <Store className="h-8 w-8 text-primary-foreground" />
        </div>
        <Loader2 className="h-6 w-6 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-2xl shadow-primary/30 mb-6">
          <Store className="h-8 w-8 text-primary-foreground" />
        </div>
        <Loader2 className="h-6 w-6 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">Redirecionando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <AdminSidebar />
      {/* Main content area */}
      <main className="lg:pl-64 transition-all duration-300 min-h-screen">
        {/* Content wrapper with proper padding for mobile header */}
        <div className="pt-14 lg:pt-0">
          <div className="p-4 lg:p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
