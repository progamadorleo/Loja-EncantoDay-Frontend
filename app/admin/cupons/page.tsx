"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import {
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  Ticket,
  Percent,
  DollarSign,
  Calendar,
  Users,
  Copy,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

interface Coupon {
  id: string
  code: string
  description: string
  discount_type: "percentage" | "fixed"
  discount_value: number
  min_order_value: number
  max_discount_value: number | null
  usage_limit: number | null
  usage_count: number
  usage_per_customer: number
  starts_at: string
  expires_at: string | null
  is_active: boolean
  created_at: string
}

interface CouponStats {
  totalCoupons: number
  activeCoupons: number
  totalUsages: number
  totalDiscountGiven: number
}

export default function AdminCuponsPage() {
  const { accessToken } = useAuth()
  
  // Estados
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [stats, setStats] = useState<CouponStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  
  // Modal de criacao/edicao
  const [showModal, setShowModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  
  // Modal de exclusao
  const [deletingCoupon, setDeletingCoupon] = useState<Coupon | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Form
  const [form, setForm] = useState({
    code: "",
    description: "",
    discount_type: "percentage" as "percentage" | "fixed",
    discount_value: "",
    min_order_value: "",
    max_discount_value: "",
    usage_limit: "",
    usage_per_customer: "1",
    starts_at: "",
    expires_at: "",
    is_active: true,
  })

  // Buscar cupons
  async function fetchCoupons(page = 1) {
    if (!accessToken) return

    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      })

      if (statusFilter !== "all") {
        params.append("status", statusFilter)
      }

      if (searchTerm) {
        params.append("search", searchTerm)
      }

      const response = await fetch(`${API_URL}/api/coupons/admin/all?${params}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      const result = await response.json()

      if (result.data) {
        setCoupons(result.data)
        setPagination(result.pagination)
      }
    } catch (error) {
      console.error("Erro ao buscar cupons:", error)
      toast.error("Erro ao carregar cupons")
    } finally {
      setIsLoading(false)
    }
  }

  // Buscar estatisticas
  async function fetchStats() {
    if (!accessToken) return

    try {
      const response = await fetch(`${API_URL}/api/coupons/admin/stats/overview`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      const result = await response.json()
      setStats(result)
    } catch (error) {
      console.error("Erro ao buscar estatisticas:", error)
    }
  }

  useEffect(() => {
    if (accessToken) {
      fetchCoupons()
      fetchStats()
    }
  }, [accessToken, statusFilter])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (accessToken) {
        fetchCoupons()
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Abrir modal de criacao
  function handleCreate() {
    setEditingCoupon(null)
    setForm({
      code: "",
      description: "",
      discount_type: "percentage",
      discount_value: "",
      min_order_value: "",
      max_discount_value: "",
      usage_limit: "",
      usage_per_customer: "1",
      starts_at: new Date().toISOString().slice(0, 16),
      expires_at: "",
      is_active: true,
    })
    setShowModal(true)
  }

  // Abrir modal de edicao
  function handleEdit(coupon: Coupon) {
    setEditingCoupon(coupon)
    setForm({
      code: coupon.code,
      description: coupon.description || "",
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value.toString(),
      min_order_value: coupon.min_order_value?.toString() || "",
      max_discount_value: coupon.max_discount_value?.toString() || "",
      usage_limit: coupon.usage_limit?.toString() || "",
      usage_per_customer: coupon.usage_per_customer?.toString() || "1",
      starts_at: coupon.starts_at ? new Date(coupon.starts_at).toISOString().slice(0, 16) : "",
      expires_at: coupon.expires_at ? new Date(coupon.expires_at).toISOString().slice(0, 16) : "",
      is_active: coupon.is_active,
    })
    setShowModal(true)
  }

  // Salvar cupom
  async function handleSave() {
    if (!accessToken) return

    if (!form.code || !form.discount_value) {
      toast.error("Codigo e valor do desconto sao obrigatorios")
      return
    }

    setIsSaving(true)
    try {
      const data = {
        code: form.code,
        description: form.description || null,
        discount_type: form.discount_type,
        discount_value: parseFloat(form.discount_value),
        min_order_value: form.min_order_value ? parseFloat(form.min_order_value) : 0,
        max_discount_value: form.max_discount_value ? parseFloat(form.max_discount_value) : null,
        usage_limit: form.usage_limit ? parseInt(form.usage_limit) : null,
        usage_per_customer: parseInt(form.usage_per_customer) || 1,
        starts_at: form.starts_at || null,
        expires_at: form.expires_at || null,
        is_active: form.is_active,
      }

      const url = editingCoupon
        ? `${API_URL}/api/coupons/admin/${editingCoupon.id}`
        : `${API_URL}/api/coupons/admin`

      const response = await fetch(url, {
        method: editingCoupon ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success(editingCoupon ? "Cupom atualizado!" : "Cupom criado!")
        setShowModal(false)
        fetchCoupons()
        fetchStats()
      } else {
        const error = await response.json()
        toast.error(error.error || "Erro ao salvar cupom")
      }
    } catch (error) {
      console.error("Erro ao salvar cupom:", error)
      toast.error("Erro ao salvar cupom")
    } finally {
      setIsSaving(false)
    }
  }

  // Deletar cupom
  async function handleDelete() {
    if (!accessToken || !deletingCoupon) return

    setIsDeleting(true)
    try {
      const response = await fetch(`${API_URL}/api/coupons/admin/${deletingCoupon.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      if (response.ok) {
        toast.success("Cupom excluido!")
        setDeletingCoupon(null)
        fetchCoupons()
        fetchStats()
      } else {
        toast.error("Erro ao excluir cupom")
      }
    } catch (error) {
      console.error("Erro ao excluir cupom:", error)
      toast.error("Erro ao excluir cupom")
    } finally {
      setIsDeleting(false)
    }
  }

  // Toggle ativo
  async function handleToggleActive(coupon: Coupon) {
    if (!accessToken) return

    try {
      const response = await fetch(`${API_URL}/api/coupons/admin/${coupon.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ is_active: !coupon.is_active }),
      })

      if (response.ok) {
        toast.success(coupon.is_active ? "Cupom desativado" : "Cupom ativado")
        fetchCoupons()
      }
    } catch (error) {
      console.error("Erro ao alterar status:", error)
    }
  }

  // Copiar codigo
  function copyCode(code: string) {
    navigator.clipboard.writeText(code)
    toast.success("Codigo copiado!")
  }

  // Formatar valor
  function formatDiscount(coupon: Coupon) {
    if (coupon.discount_type === "percentage") {
      return `${coupon.discount_value}%`
    }
    return `R$ ${coupon.discount_value.toFixed(2)}`
  }

  // Verificar se expirou
  function isExpired(coupon: Coupon) {
    if (!coupon.expires_at) return false
    return new Date(coupon.expires_at) < new Date()
  }

  // Verificar se atingiu limite
  function isLimitReached(coupon: Coupon) {
    if (!coupon.usage_limit) return false
    return coupon.usage_count >= coupon.usage_limit
  }

  return (
    <div className="flex min-h-screen bg-secondary/30">
      <AdminSidebar />
      
      <main className="flex-1 lg:ml-72 p-6 lg:p-8 pt-20 lg:pt-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Cupons de Desconto</h1>
              <p className="text-muted-foreground mt-1">Gerencie cupons promocionais</p>
            </div>
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Cupom
            </Button>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Ticket className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-xl font-bold">{stats.totalCoupons}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Ativos</p>
                      <p className="text-xl font-bold">{stats.activeCoupons}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <Users className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Usos</p>
                      <p className="text-xl font-bold">{stats.totalUsages}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-500/10">
                      <TrendingUp className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Desconto Dado</p>
                      <p className="text-xl font-bold">R$ {stats.totalDiscountGiven.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filtros */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por codigo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Ativos</SelectItem>
                    <SelectItem value="inactive">Inativos</SelectItem>
                    <SelectItem value="expired">Expirados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tabela */}
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : coupons.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center p-4">
                  <Ticket className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-lg font-medium">Nenhum cupom encontrado</p>
                  <p className="text-sm text-muted-foreground">Crie seu primeiro cupom de desconto</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Codigo</TableHead>
                      <TableHead>Desconto</TableHead>
                      <TableHead className="hidden md:table-cell">Uso</TableHead>
                      <TableHead className="hidden lg:table-cell">Validade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coupons.map((coupon) => (
                      <TableRow key={coupon.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => copyCode(coupon.code)}
                              className="font-mono font-bold text-primary hover:underline"
                            >
                              {coupon.code}
                            </button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => copyCode(coupon.code)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          {coupon.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                              {coupon.description}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {coupon.discount_type === "percentage" ? (
                              <Percent className="h-4 w-4 text-primary" />
                            ) : (
                              <DollarSign className="h-4 w-4 text-green-500" />
                            )}
                            <span className="font-semibold">{formatDiscount(coupon)}</span>
                          </div>
                          {coupon.min_order_value > 0 && (
                            <p className="text-xs text-muted-foreground">
                              Min: R$ {coupon.min_order_value.toFixed(2)}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{coupon.usage_count}</span>
                            {coupon.usage_limit && (
                              <span className="text-muted-foreground">/ {coupon.usage_limit}</span>
                            )}
                          </div>
                          {coupon.usage_limit && (
                            <div className="w-20 h-1.5 bg-secondary rounded-full mt-1">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{
                                  width: `${Math.min((coupon.usage_count / coupon.usage_limit) * 100, 100)}%`,
                                }}
                              />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {coupon.expires_at ? (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className={isExpired(coupon) ? "text-destructive" : ""}>
                                {new Date(coupon.expires_at).toLocaleDateString("pt-BR")}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Sem expiracao</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {isExpired(coupon) ? (
                            <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                              <Clock className="h-3 w-3 mr-1" />
                              Expirado
                            </Badge>
                          ) : isLimitReached(coupon) ? (
                            <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                              <XCircle className="h-3 w-3 mr-1" />
                              Esgotado
                            </Badge>
                          ) : coupon.is_active ? (
                            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Ativo
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500/20">
                              <XCircle className="h-3 w-3 mr-1" />
                              Inativo
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(coupon)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleActive(coupon)}>
                                {coupon.is_active ? (
                                  <>
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Desativar
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Ativar
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setDeletingCoupon(coupon)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Paginacao */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchCoupons(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Anterior
              </Button>
              <span className="flex items-center px-4 text-sm text-muted-foreground">
                {pagination.page} de {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchCoupons(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
              >
                Proximo
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Modal de Criar/Editar */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCoupon ? "Editar Cupom" : "Novo Cupom"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Codigo */}
            <div className="space-y-2">
              <Label htmlFor="code">Codigo do Cupom *</Label>
              <Input
                id="code"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="Ex: PRIMEIRACOMPRA"
                className="font-mono uppercase"
              />
            </div>

            {/* Descricao */}
            <div className="space-y-2">
              <Label htmlFor="description">Descricao</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Descricao do cupom..."
                rows={2}
              />
            </div>

            {/* Tipo e Valor */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Desconto *</Label>
                <Select
                  value={form.discount_type}
                  onValueChange={(value: "percentage" | "fixed") =>
                    setForm({ ...form, discount_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">
                      <div className="flex items-center gap-2">
                        <Percent className="h-4 w-4" />
                        Porcentagem
                      </div>
                    </SelectItem>
                    <SelectItem value="fixed">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Valor Fixo
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount_value">
                  Valor {form.discount_type === "percentage" ? "(%)" : "(R$)"} *
                </Label>
                <Input
                  id="discount_value"
                  type="number"
                  value={form.discount_value}
                  onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                  placeholder={form.discount_type === "percentage" ? "10" : "50.00"}
                  min="0"
                  max={form.discount_type === "percentage" ? "100" : undefined}
                  step={form.discount_type === "percentage" ? "1" : "0.01"}
                />
              </div>
            </div>

            {/* Limites de valor */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min_order_value">Valor Minimo do Pedido</Label>
                <Input
                  id="min_order_value"
                  type="number"
                  value={form.min_order_value}
                  onChange={(e) => setForm({ ...form, min_order_value: e.target.value })}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              {form.discount_type === "percentage" && (
                <div className="space-y-2">
                  <Label htmlFor="max_discount_value">Desconto Maximo (R$)</Label>
                  <Input
                    id="max_discount_value"
                    type="number"
                    value={form.max_discount_value}
                    onChange={(e) => setForm({ ...form, max_discount_value: e.target.value })}
                    placeholder="Sem limite"
                    min="0"
                    step="0.01"
                  />
                </div>
              )}
            </div>

            {/* Limites de uso */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="usage_limit">Limite Total de Usos</Label>
                <Input
                  id="usage_limit"
                  type="number"
                  value={form.usage_limit}
                  onChange={(e) => setForm({ ...form, usage_limit: e.target.value })}
                  placeholder="Ilimitado"
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="usage_per_customer">Usos por Cliente</Label>
                <Input
                  id="usage_per_customer"
                  type="number"
                  value={form.usage_per_customer}
                  onChange={(e) => setForm({ ...form, usage_per_customer: e.target.value })}
                  placeholder="1"
                  min="1"
                />
              </div>
            </div>

            {/* Datas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="starts_at">Inicio</Label>
                <Input
                  id="starts_at"
                  type="datetime-local"
                  value={form.starts_at}
                  onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expires_at">Expiracao</Label>
                <Input
                  id="expires_at"
                  type="datetime-local"
                  value={form.expires_at}
                  onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                />
              </div>
            </div>

            {/* Ativo */}
            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
              <div>
                <p className="font-medium">Cupom Ativo</p>
                <p className="text-sm text-muted-foreground">
                  Clientes podem usar este cupom
                </p>
              </div>
              <Switch
                checked={form.is_active}
                onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingCoupon ? "Salvar" : "Criar Cupom"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Exclusao */}
      <AlertDialog open={!!deletingCoupon} onOpenChange={() => setDeletingCoupon(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cupom?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o cupom <strong>{deletingCoupon?.code}</strong>?
              Esta acao nao pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
