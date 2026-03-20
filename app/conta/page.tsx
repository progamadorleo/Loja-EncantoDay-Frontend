"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  User, 
  MapPin, 
  Heart, 
  Package, 
  LogOut, 
  ChevronRight,
  Loader2,
  Sparkles,
  Settings,
  ShoppingBag
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { StoreFooter } from "@/components/store-footer"
import { useCustomer } from "@/contexts/customer-context"

export default function CustomerAccountPage() {
  const router = useRouter()
  const { customer, isAuthenticated, isLoading, logout, favoriteIds } = useCustomer()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/conta/login?redirect=/conta")
    }
  }, [isLoading, isAuthenticated, router])

  async function handleLogout() {
    setIsLoggingOut(true)
    await logout()
    router.push("/")
  }

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  const menuItems = [
    {
      href: "/conta/dados",
      icon: User,
      label: "Meus dados",
      description: "Editar informacoes pessoais",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      href: "/conta/enderecos",
      icon: MapPin,
      label: "Enderecos",
      description: "Gerenciar enderecos de entrega",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      href: "/conta/favoritos",
      icon: Heart,
      label: "Favoritos",
      description: `${favoriteIds.length} ${favoriteIds.length === 1 ? "produto salvo" : "produtos salvos"}`,
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
    },
    {
      href: "/conta/pedidos",
      icon: Package,
      label: "Meus pedidos",
      description: "Historico e acompanhamento",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-6 pb-16">
        <div className="mx-auto max-w-4xl px-4">
          {/* Header do perfil */}
          <div className="bg-gradient-to-r from-primary/10 via-pink-500/10 to-rose-400/10 rounded-2xl p-6 md:p-8 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg">
                <span className="text-2xl md:text-3xl font-bold">
                  {customer?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl md:text-2xl font-bold text-foreground truncate">
                  Ola, {customer?.name?.split(" ")[0]}!
                </h1>
                <p className="text-muted-foreground text-sm md:text-base truncate">
                  {customer?.email}
                </p>
              </div>
              <div className="hidden md:block">
                <Sparkles className="h-12 w-12 text-primary/30" />
              </div>
            </div>
          </div>

          {/* Menu */}
          <div className="grid gap-3">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-4 p-4 bg-card rounded-xl border hover:border-primary/30 hover:shadow-md transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl ${item.bgColor} flex items-center justify-center ${item.color}`}>
                  <item.icon className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {item.label}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            ))}
          </div>

          {/* Acoes rápidas */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            <Link href="/" className="flex flex-col items-center gap-2 p-4 bg-card rounded-xl border hover:border-primary/30 transition-all text-center">
              <ShoppingBag className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium">Continuar comprando</span>
            </Link>
            <Link href="/conta/dados" className="flex flex-col items-center gap-2 p-4 bg-card rounded-xl border hover:border-primary/30 transition-all text-center">
              <Settings className="h-6 w-6 text-muted-foreground" />
              <span className="text-sm font-medium">Configuracoes</span>
            </Link>
          </div>

          {/* Botão de logout */}
          <div className="mt-8">
            <Button
              variant="outline"
              className="w-full h-12 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Saindo...
                </>
              ) : (
                <>
                  <LogOut className="mr-2 h-5 w-5" />
                  Sair da conta
                </>
              )}
            </Button>
          </div>
        </div>
      </main>

      <StoreFooter />
    </div>
  )
}
