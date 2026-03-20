"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { StoreFooter } from "@/components/store-footer"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  ChevronLeft, 
  ShoppingCart, 
  Plus, 
  SlidersHorizontal,
  Grid3X3,
  LayoutList,
  Home
} from "lucide-react"
import { FavoriteButton } from "@/components/favorite-button"
import { 
  getProducts, 
  getCategoryBySlug, 
  type Product, 
  type Category 
} from "@/lib/api"

function ProductCard({ product }: { product: Product }) {
  const installments = 6
  const installmentPrice = product.price / installments

  return (
    <div className="group flex flex-col bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-border">
      <Link href={`/produto/${product.slug}`} className="relative aspect-square bg-white flex items-center justify-center p-4">
        {product.is_featured && (
          <span className="absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-medium text-white z-10 bg-primary">
            destaque
          </span>
        )}
        {/* Botao de favoritar */}
        <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <FavoriteButton productId={product.id} size="sm" />
        </div>
        {product.original_price && product.original_price > product.price && (
          <span className="absolute bottom-3 right-3 rounded-full px-2 py-1 text-xs font-medium text-white z-10 bg-emerald-500">
            -{Math.round((1 - product.price / product.original_price) * 100)}%
          </span>
        )}
        <img 
          src={product.images?.[0] || "/placeholder.svg"} 
          alt={product.name}
          className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
        />
      </Link>

      <div className="flex flex-col flex-1 p-4">
        <Link href={`/produto/${product.slug}`}>
          <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
          {product.short_description || product.description}
        </p>

        <div className="mt-auto pt-3">
          {product.original_price && product.original_price > product.price && (
            <p className="text-xs text-muted-foreground line-through">
              R$ {product.original_price.toFixed(2).replace(".", ",")}
            </p>
          )}
          <div className="flex items-baseline gap-1 flex-wrap">
            <span className="text-xl font-bold text-foreground">
              R$ {product.price.toFixed(2).replace(".", ",")}
            </span>
            <span className="text-xs text-muted-foreground">
              ou {installments}x R$ {installmentPrice.toFixed(2).replace(".", ",")}
            </span>
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg">
            Comprar
          </Button>
          <Button 
            variant="outline" 
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-lg shrink-0 px-3 flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function ProductCardSkeleton() {
  return (
    <div className="flex flex-col bg-card rounded-xl overflow-hidden shadow-sm border border-border">
      <Skeleton className="aspect-square" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  )
}

export default function CategoryPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = use(params)
  const [category, setCategory] = useState<Category | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState("recent")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        setError(null)

        // Busca categoria pelo slug
        const categoryResponse = await getCategoryBySlug(slug)
        if (!categoryResponse.data) {
          setError("Categoria não encontrada")
          return
        }
        setCategory(categoryResponse.data)

        // Busca produtos da categoria
        const productsResponse = await getProducts({ 
          category: categoryResponse.data.id,
          page,
          limit: 12
        })
        setProducts(productsResponse.data || [])
        setTotalPages(productsResponse.pagination?.totalPages || 1)
      } catch (err) {
        console.error("Error fetching category:", err)
        setError("Erro ao carregar categoria")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [slug, page])

  // Ordenar produtos
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.price - b.price
      case "price-desc":
        return b.price - a.price
      case "name":
        return a.name.localeCompare(b.name)
      case "recent":
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  })

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              {error}
            </h1>
            <p className="text-muted-foreground mb-8">
              A categoria que você procura não existe ou foi removida.
            </p>
            <Link href="/">
              <Button>
                <Home className="h-4 w-4 mr-2" />
                Voltar para a loja
              </Button>
            </Link>
          </div>
        </main>
        <StoreFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">
            Início
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">
            {isLoading ? <Skeleton className="h-4 w-24 inline-block" /> : category?.name}
          </span>
        </nav>

        {/* Header da Categoria */}
        <div className="mb-8">
          {isLoading ? (
            <>
              <Skeleton className="h-10 w-48 mb-2" />
              <Skeleton className="h-5 w-96" />
            </>
          ) : (
            <>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                {category?.name}
              </h1>
              {category?.description && (
                <p className="text-muted-foreground text-lg">
                  {category.description}
                </p>
              )}
            </>
          )}
        </div>

        {/* Filtros e Ordenação */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {isLoading ? (
              <Skeleton className="h-5 w-32" />
            ) : (
              <span>
                <strong className="text-foreground">{products.length}</strong> produto(s) encontrado(s)
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Ordenação */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Mais recentes</SelectItem>
                <SelectItem value="price-asc">Menor preço</SelectItem>
                <SelectItem value="price-desc">Maior preço</SelectItem>
                <SelectItem value="name">Nome A-Z</SelectItem>
              </SelectContent>
            </Select>

            {/* Toggle de visualização */}
            <div className="hidden md:flex items-center border border-border rounded-lg">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                className="rounded-r-none"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                className="rounded-l-none"
                onClick={() => setViewMode("list")}
              >
                <LayoutList className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Grid de Produtos */}
        <div className={
          viewMode === "grid" 
            ? "grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6"
            : "flex flex-col gap-4"
        }>
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))
          ) : sortedProducts.length > 0 ? (
            sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <p className="text-muted-foreground text-lg mb-4">
                Nenhum produto encontrado nesta categoria.
              </p>
              <Link href="/">
                <Button variant="outline">
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Voltar para a loja
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-10">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <span className="px-4 text-sm text-muted-foreground">
              Página {page} de {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Próxima
              <ChevronLeft className="h-4 w-4 rotate-180" />
            </Button>
          </div>
        )}
      </main>

      <StoreFooter />
    </div>
  )
}
