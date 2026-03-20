"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Minus, Plus, ShoppingCart, Share2, Shield, RotateCcw, Loader2, Zap, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { FavoriteButton } from "@/components/favorite-button"
import { ShippingCalculator } from "@/components/shipping-calculator"
import { getProductBySlug, getProducts, type Product } from "@/lib/api"
import { useCart } from "@/contexts/cart-context"
import { useToast } from "@/hooks/use-toast"
import { Header } from "@/components/header"
import { StoreFooter } from "@/components/store-footer"

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  
  const [product, setProduct] = useState<Product | null>(null)
  const [isBuyingNow, setIsBuyingNow] = useState(false)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [showCartSuccess, setShowCartSuccess] = useState(false)
  const { addItem } = useCart()
  const { toast } = useToast()

  useEffect(() => {
    async function fetchProduct() {
      try {
        setIsLoading(true)
        const response = await getProductBySlug(slug)
        if (response.data) {
          setProduct(response.data)
          
          // Buscar produtos relacionados (mesma categoria)
          if (response.data.category_id) {
            const relatedResponse = await getProducts({ 
              category: response.data.category_id,
              limit: 4 
            })
            // Filtrar o produto atual
            setRelatedProducts(
              (relatedResponse.data || []).filter(p => p.id !== response.data!.id).slice(0, 4)
            )
          }
        }
      } catch (err) {
        console.error("Error fetching product:", err)
      } finally {
        setIsLoading(false)
      }
    }
    
    if (slug) {
      fetchProduct()
    }
  }, [slug])

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background">
          <div className="mx-auto max-w-7xl px-4 py-8">
            <div className="grid gap-8 lg:grid-cols-2">
              <Skeleton className="aspect-square rounded-2xl" />
              <div className="space-y-4">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </div>
        </main>
        <StoreFooter />
      </>
    )
  }

  if (!product) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Produto nao encontrado</h1>
            <Link href="/" className="mt-4 inline-block text-primary hover:underline">
              Voltar para a loja
            </Link>
          </div>
        </main>
        <StoreFooter />
      </>
    )
  }

  const discount = product.original_price 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0
  const installments = 6
  const installmentPrice = product.price / installments

  const handleAddToCart = async () => {
    if (!product) return
    setIsAddingToCart(true)
    const success = await addItem(product.id, quantity)
    setIsAddingToCart(false)
    
    if (success) {
      setShowCartSuccess(true)
      toast({
        title: "Adicionado ao carrinho",
        description: `${quantity}x ${product.name}`,
      })
      setTimeout(() => setShowCartSuccess(false), 2000)
    }
  }

  const handleBuyNow = async () => {
    if (!product) return
    setIsBuyingNow(true)
    const success = await addItem(product.id, quantity)
    
    if (success) {
      router.push("/checkout")
    } else {
      setIsBuyingNow(false)
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Breadcrumb */}
        <div className="bg-card border-b border-border">
          <div className="mx-auto max-w-7xl px-4 py-3">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-primary transition-colors">
                Inicio
              </Link>
              <span>/</span>
              {product.category && (
                <>
                  <Link href={`/categoria/${product.category.slug}`} className="hover:text-primary transition-colors">
                    {product.category.name}
                  </Link>
                  <span>/</span>
                </>
              )}
              <span className="text-foreground truncate max-w-[200px]">{product.name}</span>
            </nav>
          </div>
        </div>

        {/* Produto */}
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Galeria de imagens */}
            <div className="space-y-4">
              <div className="relative aspect-square bg-white rounded-2xl overflow-hidden flex items-center justify-center p-8">
                {product.is_featured && (
                  <span className="absolute top-4 left-4 rounded-full px-4 py-1.5 text-sm font-medium text-white z-10 bg-primary">
                    destaque
                  </span>
                )}
                {discount > 0 && (
                  <span className="absolute top-4 right-4 rounded-full bg-green-500 px-3 py-1.5 text-sm font-bold text-white z-10">
                    -{discount}%
                  </span>
                )}
                <img 
                  src={product.images?.[selectedImage] || "/placeholder.svg"} 
                  alt={product.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              
              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-3 justify-center">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors bg-white p-2 ${
                        selectedImage === idx ? 'border-primary' : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Informacoes do produto */}
            <div className="flex flex-col">
              {product.category && (
                <div className="mb-2">
                  <span className="text-sm text-primary font-medium">{product.category.name}</span>
                </div>
              )}
              
              <h1 className="text-2xl font-bold text-foreground md:text-3xl lg:text-4xl">
                {product.name}
              </h1>
              
              <p className="mt-3 text-muted-foreground">
                {product.short_description}
              </p>

              {/* Precos */}
              <div className="mt-6 p-4 bg-secondary/50 rounded-xl">
                {product.original_price && product.original_price > product.price && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground line-through">
                      R$ {product.original_price.toFixed(2).replace(".", ",")}
                    </span>
                    {discount > 0 && (
                      <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded">
                        {discount}% OFF
                      </span>
                    )}
                  </div>
                )}
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-bold text-foreground">
                    R$ {product.price.toFixed(2).replace(".", ",")}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  ou <strong>{installments}x</strong> de <strong>R$ {installmentPrice.toFixed(2).replace(".", ",")}</strong> sem juros
                </p>
              </div>

              {/* Estoque */}
              <div className="mt-6 flex items-center gap-3">
                {product.stock_quantity === 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-red-100 text-red-700">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    Esgotado
                  </span>
                ) : product.stock_quantity <= 5 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-amber-100 text-amber-700 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    Ultimas {product.stock_quantity} unidades!
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-700">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    {product.stock_quantity} em estoque
                  </span>
                )}
              </div>

              {/* Quantidade */}
              <div className="mt-4">
                <label className="text-sm font-medium text-foreground">Quantidade</label>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex items-center border border-border rounded-lg">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 hover:bg-secondary transition-colors rounded-l-lg"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                      className="p-3 hover:bg-secondary transition-colors rounded-r-lg"
                      disabled={quantity >= product.stock_quantity}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Botoes de acao */}
              <div className="mt-6 flex flex-col gap-3">
                {/* Botao Comprar Agora */}
                <Button 
                  size="lg" 
                  className="w-full bg-green-600 hover:bg-green-700 text-white rounded-full text-lg py-6 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                  disabled={product.stock_quantity === 0 || isBuyingNow}
                  onClick={handleBuyNow}
                >
                  {isBuyingNow ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Zap className="mr-2 h-5 w-5" />
                  )}
                  {product.stock_quantity === 0 ? "Esgotado" : isBuyingNow ? "Redirecionando..." : "Comprar Agora"}
                </Button>
                
                {/* Botao Adicionar ao Carrinho + Favoritos + Compartilhar */}
                <div className="flex gap-3">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className={`flex-1 rounded-full text-lg py-6 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
                      showCartSuccess 
                        ? "bg-green-500 border-green-500 text-white hover:bg-green-600" 
                        : "border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    }`}
                    disabled={product.stock_quantity === 0 || isAddingToCart}
                    onClick={handleAddToCart}
                  >
                    {isAddingToCart ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : showCartSuccess ? (
                      <Check className="mr-2 h-5 w-5" />
                    ) : (
                      <ShoppingCart className="mr-2 h-5 w-5" />
                    )}
                    {isAddingToCart ? "Adicionando..." : showCartSuccess ? "Adicionado!" : "Adicionar ao Carrinho"}
                  </Button>
                  <FavoriteButton productId={product.id} variant="full" size="lg" className="py-6" />
                  <Button size="lg" variant="outline" className="rounded-full py-6 transition-all duration-300 hover:scale-105">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Calculo de frete */}
              <div className="mt-6">
                <ShippingCalculator productPrice={product.price * quantity} />
              </div>

              {/* Beneficios */}
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border">
                  <Shield className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-xs text-muted-foreground">Compra segura</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border">
                  <RotateCcw className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-xs text-muted-foreground">Troca garantida</span>
                </div>
              </div>

              {/* Descricao completa */}
              {product.description && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Descricao</h3>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, idx) => (
                      <span 
                        key={idx} 
                        className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Produtos relacionados */}
          {relatedProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-primary text-center mb-8 font-serif">
                Voce tambem pode gostar
              </h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {relatedProducts.map((related) => (
                  <Link 
                    key={related.id} 
                    href={`/produto/${related.slug}`}
                    className="group bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-square bg-white flex items-center justify-center p-4">
                      <img 
                        src={related.images?.[0] || "/placeholder.svg"} 
                        alt={related.name}
                        className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-foreground text-sm line-clamp-2">{related.name}</h3>
                      <p className="mt-2 text-lg font-bold text-foreground">
                        R$ {related.price.toFixed(2).replace(".", ",")}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <StoreFooter />
    </>
  )
}
