"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { AdminShell } from "@/components/admin/admin-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Plus, Search, Pencil, Trash2, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { 
  getAdminProducts, 
  getAdminCategories, 
  deleteProduct,
  type Product, 
  type Category 
} from "@/lib/api"

export default function ProductsPage() {
  const { accessToken } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState<"active" | "inactive" | "">("")
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 })
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchProducts = useCallback(async () => {
    if (!accessToken) return
    setIsLoading(true)
    try {
      const data = await getAdminProducts(accessToken, {
        page,
        limit: 10,
        search: search || undefined,
        category: categoryFilter || undefined,
        status: statusFilter || undefined,
      })
      setProducts(data.data)
      setPagination({
        total: data.pagination.total,
        totalPages: data.pagination.totalPages,
      })
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setIsLoading(false)
    }
  }, [accessToken, page, search, categoryFilter, statusFilter])

  const fetchCategories = useCallback(async () => {
    if (!accessToken) return
    try {
      const data = await getAdminCategories(accessToken)
      if (data.data) {
        setCategories(data.data)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }, [accessToken])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleDelete = async () => {
    if (!deleteId || !accessToken) return
    setIsDeleting(true)
    try {
      await deleteProduct(accessToken, deleteId)
      fetchProducts()
    } catch (error) {
      console.error("Error deleting product:", error)
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Produtos</h1>
            <p className="text-muted-foreground">
              Gerencie os produtos da sua loja
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/produtos/novo">
              <Plus className="mr-2 h-4 w-4" />
              Novo Produto
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou SKU..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="pl-9"
            />
          </div>
          <Select
            value={categoryFilter}
            onValueChange={(value) => {
              setCategoryFilter(value === "all" ? "" : value)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value === "all" ? "" : value as "active" | "inactive" | "")
              setPage(1)
            }}
          >
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="inactive">Inativos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Preco</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    Nenhum produto encontrado
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {product.images && product.images[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="h-10 w-10 rounded-md object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-muted" />
                        )}
                        <div>
                          <p className="font-medium">{product.name}</p>
                          {product.is_featured && (
                            <Badge variant="secondary" className="text-xs">
                              Destaque
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {product.sku || "-"}
                    </TableCell>
                    <TableCell>{product.category?.name || "-"}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{formatPrice(product.price)}</p>
                        {product.original_price && (
                          <p className="text-xs text-muted-foreground line-through">
                            {formatPrice(product.original_price)}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{product.stock_quantity}</TableCell>
                    <TableCell>
                      <Badge variant={product.is_active ? "default" : "secondary"}>
                        {product.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/produtos/${product.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Total: {pagination.total} produtos
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === pagination.totalPages}
              >
                Proximo
              </Button>
            </div>
          </div>
        )}

        {/* Delete Dialog */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir produto</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este produto? Esta acao nao pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Excluir"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminShell>
  )
}
