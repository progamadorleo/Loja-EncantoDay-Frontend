"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { ShoppingCart, Plus, Loader2, Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { FavoriteButton } from "@/components/favorite-button"
import { useCart } from "@/contexts/cart-context"
import { useToast } from "@/hooks/use-toast"
import { getProducts, type Product } from "@/lib/api"

function ProductCard({ product, index }: { product: Product; index: number }) {
  const [isAdding, setIsAdding] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const { addItem } = useCart()
  const { toast } = useToast()
  const installments = 6
  const installmentPrice = product.price / installments

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsAdding(true)
    const success = await addItem(product.id, 1)
    setIsAdding(false)
    
    if (success) {
      setShowSuccess(true)
      toast({
        title: "Adicionado ao carrinho",
        description: product.name,
      })
      setTimeout(() => setShowSuccess(false), 2000)
    }
  }

  return (
    <div 
      className="group flex flex-col bg-card rounded-xl overflow-hidden shadow-sm hover-lift animate-fade-in-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Imagem do produto */}
      <Link href={`/produto/${product.slug}`} className="relative aspect-square bg-white flex items-center justify-center p-4 overflow-hidden">
        {product.is_featured && (
          <span className="absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-medium text-white z-10 bg-primary animate-fade-in">
            destaque
          </span>
        )}
        {/* Badge de estoque baixo */}
        {product.stock_quantity > 0 && product.stock_quantity <= 5 && (
          <span className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
            {product.stock_quantity === 1 ? "ULTIMA UNIDADE!" : `ULTIMAS ${product.stock_quantity} UNIDADES!`}
          </span>
        )}
        {/* Botao de favoritar */}
        <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-100 scale-90">
          <FavoriteButton productId={product.id} size="sm" />
        </div>
        <img 
          src={product.images?.[0] || "/placeholder.svg"} 
          alt={product.name}
          className="h-full w-full object-contain transition-transform duration-500 ease-out group-hover:scale-110"
        />
      </Link>

      {/* Info do produto */}
      <div className="flex flex-col flex-1 p-4">
        <Link href={`/produto/${product.slug}`}>
          <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-2 hover:text-primary transition-colors duration-200">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
          {product.short_description || product.description}
        </p>

        {/* Preços */}
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

        {/* Botões */}
        <div className="mt-3 flex gap-2">
          <Link href={`/produto/${product.slug}`} className="flex-1">
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg btn-hover">
              Comprar
            </Button>
          </Link>
          <Button 
            variant="outline" 
            className={`border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-lg shrink-0 px-3 flex items-center gap-1 btn-hover transition-all duration-300 ${showSuccess ? "bg-green-500 border-green-500 text-white hover:bg-green-600" : ""}`}
            onClick={handleAddToCart}
            disabled={isAdding || product.stock_quantity === 0}
          >
            {isAdding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : showSuccess ? (
              <Check className="h-4 w-4" />
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <ShoppingCart className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

function ProductCardSkeleton() {
  return (
    <div className="flex flex-col bg-card rounded-xl overflow-hidden shadow-sm animate-pulse">
      <Skeleton className="aspect-square" />
      <div className="p-3 md:p-4 space-y-2 md:space-y-3">
        <Skeleton className="h-3 md:h-4 w-full" />
        <Skeleton className="h-2.5 md:h-3 w-2/3" />
        <Skeleton className="h-5 md:h-6 w-1/2" />
        <Skeleton className="h-8 md:h-10 w-full rounded-lg" />
      </div>
    </div>
  )
}

interface ProductGridProps {
  title: string
  featured?: boolean
  category?: string
  limit?: number
  paginated?: boolean
  initialLimit?: number
}

export function ProductGrid({ 
  title, 
  featured, 
  category, 
  limit = 8,
  paginated = false,
  initialLimit = 8
}: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [displayCount, setDisplayCount] = useState(initialLimit)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    async function fetchProducts() {
      try {
        setIsLoading(true)
        // Se paginado, busca mais produtos para ter estoque
        const fetchLimit = paginated ? 100 : limit
        const response = await getProducts({ 
          featured, 
          category,
          limit: fetchLimit
        })
        const fetchedProducts = response.data || []
        setAllProducts(fetchedProducts)
        setTotalCount(fetchedProducts.length)
        
        // Se paginado, mostra apenas o initialLimit primeiro
        if (paginated) {
          setProducts(fetchedProducts.slice(0, initialLimit))
        } else {
          setProducts(fetchedProducts)
        }
      } catch (err) {
        setError("Erro ao carregar produtos")
        console.error("Error fetching products:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProducts()
  }, [featured, category, limit, paginated, initialLimit])

  const loadMore = useCallback(() => {
    if (isLoadingMore) return
    
    setIsLoadingMore(true)
    
    // Simula um pequeno delay para feedback visual
    setTimeout(() => {
      const newCount = Math.min(displayCount + 8, allProducts.length)
      setDisplayCount(newCount)
      setProducts(allProducts.slice(0, newCount))
      setIsLoadingMore(false)
    }, 300)
  }, [displayCount, allProducts, isLoadingMore])

  const hasMore = paginated && products.length < allProducts.length
  const progress = totalCount > 0 ? (products.length / totalCount) * 100 : 0

  if (error) {
    return (
      <section className="py-8 md:py-12 bg-background">
        <div className="mx-auto max-w-7xl px-4 text-center text-muted-foreground">
          {error}
        </div>
      </section>
    )
  }

  return (
    <section className="py-8 md:py-12 bg-background overflow-hidden">
      <div className="mx-auto max-w-7xl px-4">
        {/* Título */}
        <h2 className="text-center text-2xl font-bold text-primary md:text-3xl lg:text-4xl font-serif mb-8 animate-fade-in-up">
          {title}
        </h2>

        {/* Grid de produtos */}
        <div className="relative">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 lg:gap-6">
            {isLoading ? (
              Array.from({ length: limit }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            ) : products.length > 0 ? (
              products.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))
            ) : (
              <div className="col-span-full text-center text-muted-foreground py-8 animate-fade-in">
                Nenhum produto encontrado
              </div>
            )}
          </div>

          {/* Paginacao */}
          {paginated && !isLoading && products.length > 0 && (
            <div className="mt-10 flex flex-col items-center gap-4">
              {/* Barra de progresso */}
              <div className="w-full max-w-md">
                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                  <span>Mostrando {products.length} de {totalCount} produtos</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Botao carregar mais */}
              {hasMore && (
                <Button
                  onClick={loadMore}
                  disabled={isLoadingMore}
                  variant="outline"
                  size="lg"
                  className="group relative overflow-hidden rounded-full px-8 py-6 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Carregando...
                    </>
                  ) : (
                    <>
                      <span>Ver mais produtos</span>
                      <ChevronDown className="ml-2 h-5 w-5 group-hover:translate-y-0.5 transition-transform" />
                    </>
                  )}
                </Button>
              )}

              {/* Mensagem quando todos foram carregados */}
              {!hasMore && totalCount > initialLimit && (
                <p className="text-sm text-muted-foreground animate-fade-in">
                  Voce viu todos os {totalCount} produtos
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
