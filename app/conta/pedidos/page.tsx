"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { 
  ArrowLeft, 
  Loader2, 
  Package, 
  ChevronRight,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  CreditCard,
  QrCode,
  MapPin,
  Eye,
  Copy,
  ExternalLink,
  ShoppingBag
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Header } from "@/components/header"
import { StoreFooter } from "@/components/store-footer"
import { useCustomer } from "@/contexts/customer-context"
import { getOrders, getOrder, type Order } from "@/lib/api"
import { toast } from "sonner"

// Status config
const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType; bgColor: string }> = {
  pending: {
    label: "Aguardando pagamento",
    color: "text-yellow-600",
    icon: Clock,
    bgColor: "bg-yellow-500/10",
  },
  processing: {
    label: "Processando",
    color: "text-blue-600",
    icon: Package,
    bgColor: "bg-blue-500/10",
  },
  paid: {
    label: "Pago",
    color: "text-green-600",
    icon: CheckCircle2,
    bgColor: "bg-green-500/10",
  },
  shipped: {
    label: "Enviado",
    color: "text-purple-600",
    icon: Truck,
    bgColor: "bg-purple-500/10",
  },
  delivered: {
    label: "Entregue",
    color: "text-green-600",
    icon: CheckCircle2,
    bgColor: "bg-green-500/10",
  },
  cancelled: {
    label: "Cancelado",
    color: "text-red-600",
    icon: XCircle,
    bgColor: "bg-red-500/10",
  },
  refunded: {
    label: "Reembolsado",
    color: "text-gray-600",
    icon: XCircle,
    bgColor: "bg-gray-500/10",
  },
}

const paymentStatusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendente", color: "text-yellow-600" },
  approved: { label: "Aprovado", color: "text-green-600" },
  rejected: { label: "Recusado", color: "text-red-600" },
  refunded: { label: "Reembolsado", color: "text-gray-600" },
}

export default function CustomerOrdersPage() {
  const router = useRouter()
  const { accessToken, isAuthenticated, isLoading: authLoading } = useCustomer()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/conta/login?redirect=/conta/pedidos")
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    async function fetchOrders() {
      if (!accessToken) return
      
      try {
        const response = await getOrders(accessToken)
        // Backend retorna array direto ou objeto com data
        const ordersData = Array.isArray(response) ? response : (response as any).data || []
        setOrders(ordersData)
      } catch (error) {
        console.error("Erro ao carregar pedidos:", error)
        toast.error("Erro ao carregar pedidos")
      } finally {
        setIsLoading(false)
      }
    }

    if (accessToken) {
      fetchOrders()
    }
  }, [accessToken])

  async function handleViewDetails(orderId: string) {
    if (!accessToken) return

    setIsLoadingDetails(true)
    setShowDetails(true)

    try {
      const response = await getOrder(accessToken, orderId)
      // Backend retorna objeto direto ou com data
      const orderData = (response as any).id ? response : (response as any).data
      if (orderData) {
        setSelectedOrder(orderData as Order)
      }
    } catch (error) {
      console.error("Erro ao carregar detalhes:", error)
      toast.error("Erro ao carregar detalhes do pedido")
      setShowDetails(false)
    } finally {
      setIsLoadingDetails(false)
    }
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  function formatDateTime(date: string) {
    return new Date(date).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
    toast.success("Copiado!")
  }

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-6 pb-16">
        <div className="mx-auto max-w-4xl px-4">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link
              href="/conta"
              className="w-10 h-10 rounded-xl bg-card border flex items-center justify-center hover:border-primary/30 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Meus pedidos</h1>
              <p className="text-muted-foreground">Acompanhe suas compras</p>
            </div>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Carregando pedidos...</p>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && orders.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Nenhum pedido ainda</h2>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                Voce ainda nao fez nenhum pedido. Que tal explorar nossos produtos?
              </p>
              <Button asChild className="rounded-full px-8">
                <Link href="/">Explorar produtos</Link>
              </Button>
            </div>
          )}

          {/* Orders list */}
          {!isLoading && orders.length > 0 && (
            <div className="space-y-4">
              {orders.map((order) => {
                const status = statusConfig[order.status] || statusConfig.pending
                const StatusIcon = status.icon

                return (
                  <div
                    key={order.id}
                    className="bg-card rounded-xl border overflow-hidden hover:border-primary/30 hover:shadow-md transition-all"
                  >
                    {/* Header do pedido */}
                    <div className="p-4 md:p-6 border-b border-border/50">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl ${status.bgColor} flex items-center justify-center shrink-0`}>
                            <StatusIcon className={`h-6 w-6 ${status.color}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-foreground">
                                Pedido #{order.mp_external_reference?.split("-")[1] || order.id.slice(0, 8)}
                              </span>
                              <Badge variant="secondary" className={`${status.bgColor} ${status.color} border-0`}>
                                {status.label}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1" suppressHydrationWarning>
                              {formatDate(order.created_at)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-lg font-bold text-foreground">{formatPrice(order.total)}</p>
                            <p className="text-xs text-muted-foreground">
                              {order.items?.length || 0} {(order.items?.length || 0) === 1 ? "item" : "itens"}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                            onClick={() => handleViewDetails(order.id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Detalhes
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Preview dos itens */}
                    <div className="p-4 md:p-6 bg-secondary/20">
                      <div className="flex items-center gap-3 overflow-x-auto pb-1">
                        {order.items?.slice(0, 4).map((item, index) => (
                          <div
                            key={item.id}
                            className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0 border"
                          >
                            <Image
                              src={item.product_image || "/placeholder.svg"}
                              alt={item.product_name}
                              fill
                              className="object-cover"
                            />
                            {item.quantity > 1 && (
                              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                                {item.quantity}
                              </span>
                            )}
                          </div>
                        ))}
                        {(order.items?.length || 0) > 4 && (
                          <div className="w-16 h-16 rounded-lg bg-muted shrink-0 border flex items-center justify-center">
                            <span className="text-sm font-medium text-muted-foreground">
                              +{(order.items?.length || 0) - 4}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tracking info */}
                    {order.tracking_code && (
                      <div className="px-4 py-3 md:px-6 bg-purple-500/5 border-t flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-purple-600" />
                          <span className="text-sm text-purple-600 font-medium">
                            Rastreio: {order.tracking_code}
                          </span>
                        </div>
                        {order.tracking_url && (
                          <Button variant="ghost" size="sm" asChild className="text-purple-600 hover:text-purple-700">
                            <a href={order.tracking_url} target="_blank" rel="noopener noreferrer">
                              Rastrear
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      <StoreFooter />

      {/* Modal de detalhes */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Detalhes do Pedido
            </DialogTitle>
          </DialogHeader>

          {isLoadingDetails && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {!isLoadingDetails && selectedOrder && (
            <div className="space-y-6">
              {/* Info do pedido */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 bg-secondary/30 rounded-xl">
                <div>
                  <p className="text-sm text-muted-foreground">Numero do pedido</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono font-medium">
                      {selectedOrder.mp_external_reference || selectedOrder.id.slice(0, 8)}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => copyToClipboard(selectedOrder.mp_external_reference || selectedOrder.id)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Data do pedido</p>
                  <p className="font-medium" suppressHydrationWarning>
                    {formatDateTime(selectedOrder.created_at)}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Status</h3>
                <div className="flex flex-wrap gap-3">
                  {(() => {
                    const status = statusConfig[selectedOrder.status] || statusConfig.pending
                    const StatusIcon = status.icon
                    return (
                      <Badge variant="secondary" className={`${status.bgColor} ${status.color} border-0 px-3 py-1`}>
                        <StatusIcon className="h-4 w-4 mr-1" />
                        {status.label}
                      </Badge>
                    )
                  })()}
                  {selectedOrder.payment_status && (
                    <Badge
                      variant="secondary"
                      className={`${paymentStatusConfig[selectedOrder.payment_status]?.color || "text-gray-600"} bg-muted border-0 px-3 py-1`}
                    >
                      <CreditCard className="h-4 w-4 mr-1" />
                      Pagamento: {paymentStatusConfig[selectedOrder.payment_status]?.label || selectedOrder.payment_status}
                    </Badge>
                  )}
                </div>
              </div>

              <Separator />

              {/* Itens */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Itens do pedido</h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0 border">
                        <Image
                          src={item.product_image || "/placeholder.svg"}
                          alt={item.product_name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{item.product_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Qtd: {item.quantity} x {formatPrice(item.unit_price)}
                        </p>
                      </div>
                      <p className="font-medium">{formatPrice(item.total_price)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Endereco e pagamento */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Endereco */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Endereco de entrega
                  </h3>
                  <div className="text-sm">
                    <p className="font-medium">{selectedOrder.shipping_address?.recipient_name}</p>
                    <p className="text-muted-foreground">
                      {selectedOrder.shipping_address?.street}, {selectedOrder.shipping_address?.number}
                      {selectedOrder.shipping_address?.complement && ` - ${selectedOrder.shipping_address.complement}`}
                    </p>
                    <p className="text-muted-foreground">
                      {selectedOrder.shipping_address?.neighborhood}
                    </p>
                    <p className="text-muted-foreground">
                      {selectedOrder.shipping_address?.city} - {selectedOrder.shipping_address?.state}
                    </p>
                    <p className="text-muted-foreground">
                      CEP: {selectedOrder.shipping_address?.zipcode}
                    </p>
                  </div>
                </div>

                {/* Pagamento */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    {selectedOrder.payment_method === "pix" ? (
                      <QrCode className="h-4 w-4" />
                    ) : (
                      <CreditCard className="h-4 w-4" />
                    )}
                    Forma de pagamento
                  </h3>
                  <div className="text-sm">
                    <p className="font-medium capitalize">
                      {selectedOrder.payment_method === "pix" ? "PIX" : "Cartao de Credito"}
                    </p>
                    {selectedOrder.payment_details?.card_last_four && (
                      <p className="text-muted-foreground">
                        {selectedOrder.payment_details.card_brand} **** {selectedOrder.payment_details.card_last_four}
                      </p>
                    )}
                    {selectedOrder.payment_details?.installments && selectedOrder.payment_details.installments > 1 && (
                      <p className="text-muted-foreground">
                        {selectedOrder.payment_details.installments}x
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Totais */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Resumo</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(selectedOrder.subtotal)}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Desconto</span>
                      <span>-{formatPrice(selectedOrder.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Frete ({selectedOrder.shipping_method})</span>
                    <span>
                      {selectedOrder.shipping_price > 0 ? formatPrice(selectedOrder.shipping_price) : "Gratis"}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
