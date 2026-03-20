"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { AdminShell } from "@/components/admin/admin-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { 
  Package, 
  Tags, 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  AlertTriangle,
  PackageX,
  Star,
  ArrowRight,
  Plus,
  ArrowUpRight,
  ShoppingBag,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  CreditCard,
  Users,
  BarChart3,
  Eye,
  MessageCircle
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getDashboardStats, type DashboardStats } from "@/lib/api"

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString))
}

function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "")
  return cleaned.startsWith("55") ? cleaned : `55${cleaned}`
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Pendente", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  paid: { label: "Pago", color: "bg-blue-100 text-blue-800", icon: CreditCard },
  shipped: { label: "Enviado", color: "bg-purple-100 text-purple-800", icon: Truck },
  delivered: { label: "Entregue", color: "bg-green-100 text-green-800", icon: CheckCircle },
  cancelled: { label: "Cancelado", color: "bg-red-100 text-red-800", icon: XCircle },
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-12 w-12 rounded-2xl" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function AdminDashboardPage() {
  const { accessToken, user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      if (!accessToken) return
      try {
        const response = await getDashboardStats(accessToken)
        if (response.data) {
          setStats(response.data)
        }
      } catch (err) {
        setError("Erro ao carregar estatisticas")
        console.error("Error fetching stats:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchStats()
  }, [accessToken])

  const openWhatsApp = (phone: string, name: string) => {
    const formattedPhone = formatPhone(phone)
    const message = encodeURIComponent(`Ola ${name}! Aqui e a Loja da Day.`)
    window.open(`https://wa.me/${formattedPhone}?text=${message}`, "_blank")
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Ola, {user?.name?.split(" ")[0] || "Admin"}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Aqui esta o resumo da sua loja hoje.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" target="_blank">
              <Button variant="outline" className="gap-2">
                <ShoppingBag className="h-4 w-4" />
                Ver Loja
                <ArrowUpRight className="h-3 w-3" />
              </Button>
            </Link>
            <Link href="/admin/produtos/novo">
              <Button className="gap-2 shadow-lg shadow-primary/25">
                <Plus className="h-4 w-4" />
                Novo Produto
              </Button>
            </Link>
          </div>
        </div>

        {error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="font-medium text-destructive">Erro ao carregar dados</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cards principais de vendas */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          ) : (
            <>
              {/* Vendas Hoje */}
              <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
                <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-6 relative">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Vendas Hoje</p>
                      <p className="text-3xl font-bold tracking-tight text-green-600">
                        {formatCurrency(stats?.sales.todayRevenue || 0)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {stats?.sales.todaySalesCount || 0} pedidos hoje
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Vendas do Mes */}
              <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
                <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-6 relative">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Vendas do Mes</p>
                      <p className="text-3xl font-bold tracking-tight">
                        {formatCurrency(stats?.sales.monthlyRevenue || 0)}
                      </p>
                      <div className="flex items-center gap-1 text-xs">
                        {(stats?.sales.revenueGrowth || 0) >= 0 ? (
                          <>
                            <TrendingUp className="h-3 w-3 text-green-600" />
                            <span className="text-green-600">+{stats?.sales.revenueGrowth.toFixed(1)}%</span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="h-3 w-3 text-red-600" />
                            <span className="text-red-600">{stats?.sales.revenueGrowth.toFixed(1)}%</span>
                          </>
                        )}
                        <span className="text-muted-foreground">vs mes anterior</span>
                      </div>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                      <BarChart3 className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ticket Medio */}
              <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
                <div className="absolute inset-0 bg-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-6 relative">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Ticket Medio</p>
                      <p className="text-3xl font-bold tracking-tight">
                        {formatCurrency(stats?.sales.avgTicket || 0)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {stats?.sales.monthlySalesCount || 0} vendas no mes
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg">
                      <CreditCard className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Pedidos */}
              <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
                <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-6 relative">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Total Pedidos</p>
                      <p className="text-3xl font-bold tracking-tight">
                        {stats?.orders.total || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {stats?.orders.delivered || 0} entregues
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                      <ShoppingBag className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Status dos Pedidos */}
        {!isLoading && stats && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Status dos Pedidos</CardTitle>
                <Link href="/admin/pedidos">
                  <Button variant="ghost" size="sm" className="gap-1">
                    Ver todos
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-yellow-50 dark:bg-yellow-950/20">
                  <div className="h-10 w-10 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-600">{stats.orders.pending}</p>
                    <p className="text-xs text-muted-foreground">Pendentes</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20">
                  <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{stats.orders.paid}</p>
                    <p className="text-xs text-muted-foreground">Pagos</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-50 dark:bg-purple-950/20">
                  <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Truck className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-600">{stats.orders.shipped}</p>
                    <p className="text-xs text-muted-foreground">Enviados</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-950/20">
                  <div className="h-10 w-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{stats.orders.delivered}</p>
                    <p className="text-xs text-muted-foreground">Entregues</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/20">
                  <div className="h-10 w-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <XCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">{stats.orders.cancelled}</p>
                    <p className="text-xs text-muted-foreground">Cancelados</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Grid de conteudo */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Pedidos Recentes */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Pedidos Recentes</CardTitle>
                  <p className="text-sm text-muted-foreground">Ultimos pedidos da loja</p>
                </div>
              </div>
              <Link href="/admin/pedidos">
                <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground">
                  Ver todos
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : stats?.recentOrders && stats.recentOrders.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentOrders.map((order) => {
                    const config = statusConfig[order.status] || statusConfig.pending
                    const StatusIcon = config.icon
                    return (
                      <div
                        key={order.id}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors"
                      >
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${config.color}`}>
                          <StatusIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold truncate">
                              {order.customer?.name || "Cliente"}
                            </p>
                            {order.customer?.phone && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-green-600 hover:text-green-700 hover:bg-green-100"
                                onClick={() => openWhatsApp(order.customer!.phone, order.customer!.name)}
                              >
                                <MessageCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(order.total)} - {formatDate(order.created_at)}
                          </p>
                        </div>
                        <Badge variant="outline" className={config.color}>
                          {config.label}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="font-medium text-muted-foreground mb-1">Nenhum pedido ainda</p>
                  <p className="text-sm text-muted-foreground">Os pedidos aparecerao aqui</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Produtos com Baixo Estoque */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Baixo Estoque</CardTitle>
                  <p className="text-sm text-muted-foreground">Produtos que precisam de reposicao</p>
                </div>
              </div>
              <Link href="/admin/produtos">
                <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground">
                  Ver todos
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-2 w-full" />
                      </div>
                      <Skeleton className="h-6 w-12 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : stats?.lowStockProducts && stats.lowStockProducts.length > 0 ? (
                <div className="space-y-3">
                  {stats.lowStockProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={`/admin/produtos/${product.id}`}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors group"
                    >
                      <div className="relative">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="h-12 w-12 rounded-xl object-cover ring-1 ring-border"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center ring-1 ring-border">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate group-hover:text-primary transition-colors">
                          {product.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress 
                            value={(product.stock_quantity / 10) * 100} 
                            className="h-1.5 flex-1"
                          />
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {product.stock_quantity} un
                          </span>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={product.stock_quantity <= 3 ? "bg-red-100 text-red-700 border-red-200" : "bg-amber-100 text-amber-700 border-amber-200"}
                      >
                        {product.stock_quantity <= 3 ? "Critico" : "Baixo"}
                      </Badge>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="h-16 w-16 rounded-2xl bg-green-50 dark:bg-green-950/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="font-medium text-green-600 mb-1">Estoque saudavel!</p>
                  <p className="text-sm text-muted-foreground">Todos os produtos com estoque adequado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Grid secundario */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Produtos mais vendidos */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Mais Vendidos</CardTitle>
                  <p className="text-sm text-muted-foreground">Top produtos</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-lg" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-5 w-12 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : stats?.topProducts && stats.topProducts.length > 0 ? (
                <div className="space-y-3">
                  {stats.topProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">
                        {index + 1}
                      </div>
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="h-8 w-8 rounded-lg object-cover" />
                      ) : (
                        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                          <Package className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <span className="flex-1 text-sm font-medium truncate">{product.name}</span>
                      <Badge variant="secondary">{product.quantity} vendas</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">Sem dados de vendas</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resumo de Estoque */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Estoque</CardTitle>
                  <p className="text-sm text-muted-foreground">Resumo geral</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isLoading && stats && (
                <>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                    <span className="text-sm text-muted-foreground">Total de Produtos</span>
                    <span className="font-bold">{stats.overview.totalProducts}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                    <span className="text-sm text-muted-foreground">Produtos Ativos</span>
                    <span className="font-bold text-green-600">{stats.overview.activeProducts}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                    <span className="text-sm text-muted-foreground">Unidades em Estoque</span>
                    <span className="font-bold">{stats.overview.totalStock.toLocaleString("pt-BR")}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                    <span className="text-sm text-muted-foreground">Valor em Estoque</span>
                    <span className="font-bold text-blue-600">{formatCurrency(stats.overview.totalValue)}</span>
                  </div>
                  {stats.overview.outOfStock > 0 && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 dark:bg-red-950/20">
                      <span className="text-sm text-red-600">Sem Estoque</span>
                      <span className="font-bold text-red-600">{stats.overview.outOfStock}</span>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Categorias */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                  <Tags className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Categorias</CardTitle>
                  <p className="text-sm text-muted-foreground">Por produtos</p>
                </div>
              </div>
              <Link href="/admin/categorias">
                <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground">
                  Gerenciar
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-6 w-12 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : stats?.categoriesWithCount && stats.categoriesWithCount.length > 0 ? (
                <div className="space-y-3">
                  {stats.categoriesWithCount.map((category, index) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-7 w-7 rounded-md bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                          {index + 1}
                        </div>
                        <span className="font-medium text-sm">{category.name}</span>
                      </div>
                      <Badge variant="outline" className="font-mono text-xs">
                        {category.productCount}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground mb-2">Nenhuma categoria</p>
                  <Link href="/admin/categorias">
                    <Button size="sm" variant="outline" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Criar
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminShell>
  )
}
