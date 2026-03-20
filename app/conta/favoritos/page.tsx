"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  ArrowLeft, 
  Loader2, 
  Heart, 
  ShoppingCart,
  Trash2,
  ShoppingBag
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { StoreFooter } from "@/components/store-footer"
import { useCustomer } from "@/contexts/customer-context"
import { getCustomerFavorites, removeFromFavorites, type CustomerFavorite } from "@/lib/api"

export default function CustomerFavoritesPage() {
  const router = useRouter()
  const { accessToken, isAuthenticated, isLoading: authLoading, refreshFavorites } = useCustomer()

  const [favorites, setFavorites] = useState<CustomerFavorite[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [removingId, setRemovingId] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/conta/login?redirect=/conta/favoritos")
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (accessToken) {
      loadFavorites()
    }
  }, [accessToken])

  async function loadFavorites() {
    if (!accessToken) return

    try {
      const response = await getCustomerFavorites(accessToken)
      if (response.success && response.data) {
        setFavorites(response.data)
      }
    } catch (err) {
      console.error("Error loading favorites:", err)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleRemove(productId: string) {
    if (!accessToken) return

    setRemovingId(productId)

    try {
      await removeFromFavorites(accessToken, productId)
      setFavorites((prev) => prev.filter((f) => f.product.id !== productId))
      await refreshFavorites()
    } catch (err) {
      console.error("Error removing favorite:", err)
    } finally {
      setRemovingId(null)
    }
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
              <h1 className="text-2xl font-bold text-foreground">Favoritos</h1>
              <p className="text-muted-foreground">
                {favorites.length} {favorites.length === 1 ? "produto salvo" : "produtos salvos"}
              </p>
            </div>
          </div>

          {/* Lista de favoritos */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Nenhum favorito ainda
              </h3>
              <p className="text-muted-foreground mb-6">
                Explore nossos produtos e salve seus preferidos
              </p>
              <Link href="/">
                <Button className="rounded-xl">
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Ver produtos
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {favorites.map((favorite) => {
                const product = favorite.product
                const isRemoving = removingId === product.id

                return (
                  <div
                    key={favorite.id}
                    className="bg-card rounded-xl border overflow-hidden flex"
                  >
                    {/* Imagem */}
                    <Link 
                      href={`/produto/${product.slug}`}
                      className="w-28 h-28 sm:w-32 sm:h-32 bg-muted flex-shrink-0"
                    >
                      <img
                        src={product.images?.[0] || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </Link>

                    {/* Info */}
                    <div className="flex-1 p-4 flex flex-col">
                      <div className="flex-1">
                        <Link 
                          href={`/produto/${product.slug}`}
                          className="font-medium text-foreground hover:text-primary transition-colors line-clamp-2"
                        >
                          {product.name}
                        </Link>
                        
                        <div className="mt-2">
                          {product.original_price && product.original_price > product.price && (
                            <span className="text-xs text-muted-foreground line-through mr-2">
                              R$ {product.original_price.toFixed(2).replace(".", ",")}
                            </span>
                          )}
                          <span className="text-lg font-bold text-foreground">
                            R$ {product.price.toFixed(2).replace(".", ",")}
                          </span>
                        </div>

                        {product.stock_quantity === 0 && (
                          <span className="inline-block mt-1 text-xs text-destructive">
                            Esgotado
                          </span>
                        )}
                      </div>

                      {/* Acoes */}
                      <div className="flex items-center gap-2 mt-3">
                        <Link href={`/produto/${product.slug}`} className="flex-1">
                          <Button 
                            size="sm" 
                            className="w-full rounded-lg text-xs h-8"
                            disabled={product.stock_quantity === 0}
                          >
                            <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                            Comprar
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-lg border-destructive/30 text-destructive hover:bg-destructive/10"
                          onClick={() => handleRemove(product.id)}
                          disabled={isRemoving}
                        >
                          {isRemoving ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      <StoreFooter />
    </div>
  )
}
