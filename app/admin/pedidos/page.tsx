"use client"

import { useState, useEffect } from "react"
import { AdminShell } from "@/components/admin/admin-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import {
  Search,
  Filter,
  MoreVertical,
  Eye,
  MessageCircle,
  Truck,
  Package,
  Clock,
  CheckCircle2,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MapPin,
  CreditCard,
  User,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  ShoppingBag,
  ArrowUpRight,
  Copy,
} from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

// Tipos
interface OrderItem {
  id: string
  product_id: string
  product_name: string
  product_slug?: string
  product_image?: string
  quantity: number
  unit_price: number
  total_price: number
}

interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  cpf?: string
}

interface Order {
  id: string
  customer_id: string
  customer?: Customer
  status: string
  shipping_address: {
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    zipcode: string
    recipient_name: string
  }
  shipping_method: string
  shipping_price: number
  shipping_deadline?: string
  subtotal: number
  discount: number
  total: number
  coupon_code?: string
  coupon_discount?: number
  payment_method?: string
  payment_status: string
  mp_payment_id?: string
  mp_external_reference?: string
  payment_details?: any
  paid_at?: string
  tracking_code?: string
  tracking_url?: string
  shipped_at?: string
  delivered_at?: string
  customer_notes?: string
  admin_notes?: string
  created_at: string
  updated_at: string
  items: OrderItem[]
}

interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

// Configuracao de status
const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Pendente", color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock },
  paid: { label: "Pago", color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle2 },
  processing: { label: "Processando", color: "bg-blue-100 text-blue-800 border-blue-200", icon: Package },
  shipped: { label: "Enviado", color: "bg-purple-100 text-purple-800 border-purple-200", icon: Truck },
  delivered: { label: "Entregue", color: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: CheckCircle2 },
  cancelled: { label: "Cancelado", color: "bg-red-100 text-red-800 border-red-200", icon: XCircle },
  refunded: { label: "Reembolsado", color: "bg-gray-100 text-gray-800 border-gray-200", icon: RefreshCw },
}

const paymentStatusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Aguardando", color: "bg-yellow-100 text-yellow-800" },
  approved: { label: "Aprovado", color: "bg-green-100 text-green-800" },
  authorized: { label: "Autorizado", color: "bg-blue-100 text-blue-800" },
  in_process: { label: "Em Processo", color: "bg-orange-100 text-orange-800" },
  rejected: { label: "Rejeitado", color: "bg-red-100 text-red-800" },
  cancelled: { label: "Cancelado", color: "bg-gray-100 text-gray-800" },
  refunded: { label: "Reembolsado", color: "bg-gray-100 text-gray-800" },
}

// Helpers
function formatPrice(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString))
}

function formatDateShort(dateString: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString))
}

function formatPhone(phone: string): string {
  // Remove tudo que nao e numero
  const numbers = phone.replace(/\D/g, "")
  // Adiciona o 55 se nao tiver
  if (numbers.startsWith("55")) {
    return numbers
  }
  return `55${numbers}`
}

export default function AdminOrdersPage() {
  const { accessToken } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 20, totalPages: 0 })
  const [isLoading, setIsLoading] = useState(true)
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState("all")
  
  // Modais
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showTrackingModal, setShowTrackingModal] = useState(false)
  
  // Formularios
  const [newStatus, setNewStatus] = useState("")
  const [adminNotes, setAdminNotes] = useState("")
  const [trackingCode, setTrackingCode] = useState("")
  const [trackingUrl, setTrackingUrl] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  // Buscar pedidos
  async function fetchOrders(page = 1) {
    if (!accessToken) return
    setIsLoading(true)

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      })

      if (statusFilter !== "all") params.append("status", statusFilter)
      if (paymentFilter !== "all") params.append("payment_status", paymentFilter)
      if (searchTerm) params.append("search", searchTerm)

      const response = await fetch(`${API_URL}/api/orders/admin/all?${params}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      const result = await response.json()
      
      if (result.data) {
        setOrders(result.data)
        setPagination(result.pagination)
      }
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error)
      toast.error("Erro ao carregar pedidos")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [accessToken, statusFilter, paymentFilter])

  // Buscar ao digitar (debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm || searchTerm === "") {
        fetchOrders()
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Atualizar status rapido (entregue/cancelado)
  async function handleQuickStatusChange(orderId: string, status: string) {
    if (!accessToken) return

    try {
      const response = await fetch(`${API_URL}/api/orders/admin/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        toast.success(status === 'delivered' ? "Pedido marcado como entregue!" : "Pedido cancelado!")
        fetchOrders(pagination.page)
      } else {
        toast.error("Erro ao atualizar status")
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error)
      toast.error("Erro ao atualizar status")
    }
  }

  // Atualizar status
  async function handleUpdateStatus() {
    if (!selectedOrder || !newStatus || !accessToken) return
    setIsUpdating(true)

    try {
      const response = await fetch(`${API_URL}/api/orders/admin/${selectedOrder.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ status: newStatus, admin_notes: adminNotes }),
      })

      if (response.ok) {
        toast.success("Status atualizado com sucesso!")
        setShowStatusModal(false)
        fetchOrders(pagination.page)
      } else {
        toast.error("Erro ao atualizar status")
      }
    } catch (error) {
      toast.error("Erro ao atualizar status")
    } finally {
      setIsUpdating(false)
    }
  }

  // Adicionar rastreamento
  async function handleAddTracking() {
    if (!selectedOrder || !trackingCode || !accessToken) return
    setIsUpdating(true)

    try {
      const response = await fetch(`${API_URL}/api/orders/admin/${selectedOrder.id}/tracking`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ tracking_code: trackingCode, tracking_url: trackingUrl }),
      })

      if (response.ok) {
        toast.success("Rastreamento adicionado!")
        setShowTrackingModal(false)
        fetchOrders(pagination.page)
      } else {
        toast.error("Erro ao adicionar rastreamento")
      }
    } catch (error) {
      toast.error("Erro ao adicionar rastreamento")
    } finally {
      setIsUpdating(false)
    }
  }

  // Abrir WhatsApp
  function openWhatsApp(order: Order) {
    if (!order.customer?.phone) {
      toast.error("Cliente nao possui telefone cadastrado")
      return
    }

    const phone = formatPhone(order.customer.phone)
    const message = encodeURIComponent(
      `Ola ${order.customer.name}! Referente ao seu pedido #${order.mp_external_reference || order.id.slice(0, 8).toUpperCase()}`
    )
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank")
  }

  // Copiar ID do pedido
  function copyOrderId(order: Order) {
    const id = order.mp_external_reference || order.id
    navigator.clipboard.writeText(id)
    toast.success("ID copiado!")
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie todos os pedidos da loja
            </p>
          </div>
          <Button onClick={() => fetchOrders()} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {/* Busca */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por numero do pedido ou cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Filtro Status */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                  <SelectItem value="processing">Processando</SelectItem>
                  <SelectItem value="shipped">Enviado</SelectItem>
                  <SelectItem value="delivered">Entregue</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>

              {/* Filtro Pagamento */}
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Pagamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Aguardando</SelectItem>
                  <SelectItem value="approved">Aprovado</SelectItem>
                  <SelectItem value="rejected">Rejeitado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Pedidos */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="p-12 text-center">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg">Nenhum pedido encontrado</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== "all" || paymentFilter !== "all"
                    ? "Tente ajustar os filtros"
                    : "Os pedidos aparecerão aqui"}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {orders.map((order) => {
                  const status = statusConfig[order.status] || statusConfig.pending
                  const StatusIcon = status.icon

                  return (
                    <div
                      key={order.id}
                      className="p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        {/* Info Principal */}
                        <div className="flex items-start gap-4">
                          <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${status.color}`}>
                            <StatusIcon className="h-6 w-6" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">
                                #{order.mp_external_reference || order.id.slice(0, 8).toUpperCase()}
                              </span>
                              <button
                                onClick={() => copyOrderId(order)}
                                className="text-muted-foreground hover:text-foreground"
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <User className="h-3.5 w-3.5" />
                              <span>{order.customer?.name || "Cliente"}</span>
                              {order.customer?.phone && (
                                <>
                                  <span>•</span>
                                  <Phone className="h-3.5 w-3.5" />
                                  <span>{order.customer.phone}</span>
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" />
                              <span suppressHydrationWarning>{formatDateShort(order.created_at)}</span>
                              <span>•</span>
                              <span>{order.items?.length || 0} {order.items?.length === 1 ? "item" : "itens"}</span>
                            </div>
                          </div>
                        </div>

                        {/* Badges e Valor */}
                        <div className="flex flex-wrap items-center gap-3 lg:flex-nowrap">
                          <Badge variant="outline" className={status.color}>
                            {status.label}
                          </Badge>
                          {order.payment_status && (
                            <Badge variant="outline" className={paymentStatusConfig[order.payment_status]?.color || ""}>
                              {paymentStatusConfig[order.payment_status]?.label || order.payment_status}
                            </Badge>
                          )}
                          <span className="font-bold text-lg">
                            {formatPrice(order.total)}
                          </span>
                        </div>

                        {/* Acoes */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order)
                              setShowDetails(true)
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Detalhes
                          </Button>
                          
                          {order.customer?.phone && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => openWhatsApp(order)}
                            >
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                          )}

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedOrder(order)
                                  setNewStatus(order.status)
                                  setAdminNotes(order.admin_notes || "")
                                  setShowStatusModal(true)
                                }}
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Alterar Status
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedOrder(order)
                                  setTrackingCode(order.tracking_code || "")
                                  setTrackingUrl(order.tracking_url || "")
                                  setShowTrackingModal(true)
                                }}
                              >
                                <Truck className="h-4 w-4 mr-2" />
                                Adicionar Rastreio
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {order.customer?.phone && (
                                <DropdownMenuItem onClick={() => openWhatsApp(order)}>
                                  <MessageCircle className="h-4 w-4 mr-2" />
                                  WhatsApp
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              {order.status !== 'delivered' && order.status !== 'cancelled' && (
                                <DropdownMenuItem 
                                  onClick={() => handleQuickStatusChange(order.id, 'delivered')}
                                  className="text-green-600"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Marcar como Entregue
                                </DropdownMenuItem>
                              )}
                              {order.status !== 'cancelled' && (
                                <DropdownMenuItem 
                                  onClick={() => handleQuickStatusChange(order.id, 'cancelled')}
                                  className="text-destructive"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Cancelar Pedido
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Paginacao */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Mostrando {orders.length} de {pagination.total} pedidos
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === 1}
                    onClick={() => fetchOrders(pagination.page - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    Pagina {pagination.page} de {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === pagination.totalPages}
                    onClick={() => fetchOrders(pagination.page + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal Detalhes */}
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                Pedido #{selectedOrder?.mp_external_reference || selectedOrder?.id.slice(0, 8).toUpperCase()}
              </DialogTitle>
              <DialogDescription suppressHydrationWarning>
                Criado em {selectedOrder && formatDate(selectedOrder.created_at)}
              </DialogDescription>
            </DialogHeader>

            {selectedOrder && (
              <div className="space-y-6">
                {/* Status */}
                <div className="flex flex-wrap gap-2">
                  <Badge className={statusConfig[selectedOrder.status]?.color || ""}>
                    {statusConfig[selectedOrder.status]?.label || selectedOrder.status}
                  </Badge>
                  {selectedOrder.payment_status && (
                    <Badge className={paymentStatusConfig[selectedOrder.payment_status]?.color || ""}>
                      Pagamento: {paymentStatusConfig[selectedOrder.payment_status]?.label || selectedOrder.payment_status}
                    </Badge>
                  )}
                  {selectedOrder.payment_method && (
                    <Badge variant="outline">
                      {selectedOrder.payment_method === "pix" ? "PIX" : "Cartao de Credito"}
                    </Badge>
                  )}
                </div>

                <Separator />

                {/* Cliente */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Dados do Cliente
                  </h4>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <p className="font-medium">{selectedOrder.customer?.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      {selectedOrder.customer?.email}
                    </div>
                    {selectedOrder.customer?.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        {selectedOrder.customer.phone}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-green-600"
                          onClick={() => openWhatsApp(selectedOrder)}
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          WhatsApp
                        </Button>
                      </div>
                    )}
                    {selectedOrder.customer?.cpf && (
                      <p className="text-sm text-muted-foreground">
                        CPF: {selectedOrder.customer.cpf}
                      </p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Endereco */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Endereco de Entrega
                  </h4>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p>{selectedOrder.shipping_address.street}, {selectedOrder.shipping_address.number}</p>
                    {selectedOrder.shipping_address.complement && (
                      <p>{selectedOrder.shipping_address.complement}</p>
                    )}
                    <p>{selectedOrder.shipping_address.neighborhood}</p>
                    <p>{selectedOrder.shipping_address.city} - {selectedOrder.shipping_address.state}</p>
                    <p>CEP: {selectedOrder.shipping_address.zipcode}</p>
                    {selectedOrder.shipping_address.recipient_name && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        Destinatario: {selectedOrder.shipping_address.recipient_name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Rastreamento */}
                {selectedOrder.tracking_code && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        Rastreamento
                      </h4>
                      <div className="bg-muted/50 rounded-lg p-4 flex items-center justify-between">
                        <div>
                          <p className="font-mono font-medium">{selectedOrder.tracking_code}</p>
                          {selectedOrder.shipped_at && (
                            <p className="text-sm text-muted-foreground" suppressHydrationWarning>
                              Enviado em {formatDate(selectedOrder.shipped_at)}
                            </p>
                          )}
                        </div>
                        {selectedOrder.tracking_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={selectedOrder.tracking_url} target="_blank" rel="noopener noreferrer">
                              <ArrowUpRight className="h-4 w-4 mr-1" />
                              Rastrear
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                {/* Itens */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Itens do Pedido
                  </h4>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                        {item.product_image ? (
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="h-14 w-14 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-14 w-14 rounded-lg bg-muted flex items-center justify-center">
                            <Package className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.product_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity}x {formatPrice(item.unit_price)}
                          </p>
                        </div>
                        <p className="font-semibold">{formatPrice(item.total_price)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Totais */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Resumo
                  </h4>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>{formatPrice(selectedOrder.subtotal)}</span>
                    </div>
                    {selectedOrder.discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Desconto</span>
                        <span>-{formatPrice(selectedOrder.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span>Frete ({selectedOrder.shipping_method})</span>
                      <span>{selectedOrder.shipping_price === 0 ? "Gratis" : formatPrice(selectedOrder.shipping_price)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>{formatPrice(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Notas */}
                {(selectedOrder.customer_notes || selectedOrder.admin_notes) && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      {selectedOrder.customer_notes && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Observacoes do cliente:</p>
                          <p className="text-sm bg-muted/50 rounded p-3 mt-1">{selectedOrder.customer_notes}</p>
                        </div>
                      )}
                      {selectedOrder.admin_notes && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Notas internas:</p>
                          <p className="text-sm bg-yellow-50 rounded p-3 mt-1">{selectedOrder.admin_notes}</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowDetails(false)}>
                Fechar
              </Button>
              <Button
                onClick={() => {
                  setShowDetails(false)
                  setNewStatus(selectedOrder?.status || "")
                  setAdminNotes(selectedOrder?.admin_notes || "")
                  setShowStatusModal(true)
                }}
              >
                Alterar Status
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Alterar Status */}
        <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Alterar Status do Pedido</DialogTitle>
              <DialogDescription>
                Pedido #{selectedOrder?.mp_external_reference || selectedOrder?.id.slice(0, 8).toUpperCase()}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Novo Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="paid">Pago</SelectItem>
                    <SelectItem value="processing">Processando</SelectItem>
                    <SelectItem value="shipped">Enviado</SelectItem>
                    <SelectItem value="delivered">Entregue</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                    <SelectItem value="refunded">Reembolsado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Notas Internas (opcional)</Label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Adicione observacoes sobre este pedido..."
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowStatusModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateStatus} disabled={isUpdating}>
                {isUpdating ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Rastreamento */}
        <Dialog open={showTrackingModal} onOpenChange={setShowTrackingModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Rastreamento</DialogTitle>
              <DialogDescription>
                Pedido #{selectedOrder?.mp_external_reference || selectedOrder?.id.slice(0, 8).toUpperCase()}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Codigo de Rastreio</Label>
                <Input
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  placeholder="Ex: BR123456789BR"
                />
              </div>

              <div className="space-y-2">
                <Label>URL de Rastreio (opcional)</Label>
                <Input
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTrackingModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddTracking} disabled={isUpdating || !trackingCode}>
                {isUpdating ? "Salvando..." : "Adicionar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminShell>
  )
}
