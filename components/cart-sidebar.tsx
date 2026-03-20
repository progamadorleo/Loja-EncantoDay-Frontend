"use client"

import { useState } from "react"
import Link from "next/link"
import { X, Minus, Plus, Trash2, ShoppingBag, Loader2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/cart-context"

export function CartSidebar() {
  const { 
    items, 
    itemCount, 
    subtotal, 
    isOpen, 
    closeCart, 
    updateQuantity, 
    removeItem,
    clearAll,
    isLoading 
  } = useCart()
  
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set())
  const [isClearing, setIsClearing] = useState(false)

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    
    setUpdatingItems(prev => new Set(prev).add(itemId))
    await updateQuantity(itemId, newQuantity)
    setUpdatingItems(prev => {
      const next = new Set(prev)
      next.delete(itemId)
      return next
    })
  }

  const handleRemoveItem = async (itemId: string) => {
    setUpdatingItems(prev => new Set(prev).add(itemId))
    await removeItem(itemId)
    setUpdatingItems(prev => {
      const next = new Set(prev)
      next.delete(itemId)
      return next
    })
  }

  const handleClearCart = async () => {
    setIsClearing(true)
    await clearAll()
    setIsClearing(false)
  }

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeCart}
      />

      {/* Sidebar */}
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-background shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Meu Carrinho</h2>
              {itemCount > 0 && (
                <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                  {itemCount}
                </span>
              )}
            </div>
            <button
              onClick={closeCart}
              className="p-2 hover:bg-secondary rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-4">
                <ShoppingBag className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">Seu carrinho esta vazio</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Adicione produtos para continuar comprando
              </p>
              <Button onClick={closeCart} className="rounded-full">
                Continuar Comprando
              </Button>
            </div>
          ) : (
            <>
              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {items.map((item, index) => (
                  <div 
                    key={item.id}
                    className="flex gap-3 p-3 bg-card rounded-xl border border-border animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Image */}
                    <Link 
                      href={`/produto/${item.product?.slug}`}
                      onClick={closeCart}
                      className="relative w-20 h-20 bg-secondary rounded-lg overflow-hidden flex-shrink-0"
                    >
                      <img
                        src={item.product?.images?.[0] || "/placeholder.svg"}
                        alt={item.product?.name}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      />
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link 
                        href={`/produto/${item.product?.slug}`}
                        onClick={closeCart}
                        className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors"
                      >
                        {item.product?.name}
                      </Link>
                      
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-primary font-bold">
                          R$ {item.unit_price.toFixed(2).replace(".", ",")}
                        </span>
                        {item.product?.original_price && item.product.original_price > item.unit_price && (
                          <span className="text-xs text-muted-foreground line-through">
                            R$ {item.product.original_price.toFixed(2).replace(".", ",")}
                          </span>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-1 bg-secondary rounded-full p-1">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || updatingItems.has(item.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-background transition-colors disabled:opacity-50"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">
                            {updatingItems.has(item.id) ? (
                              <Loader2 className="h-3 w-3 animate-spin mx-auto" />
                            ) : (
                              item.quantity
                            )}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= (item.product?.stock_quantity || 99) || updatingItems.has(item.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-background transition-colors disabled:opacity-50"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={updatingItems.has(item.id)}
                          className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="border-t border-border p-4 space-y-4 bg-card">
                {/* Clear Cart */}
                <button
                  onClick={handleClearCart}
                  disabled={isClearing}
                  className="w-full text-sm text-muted-foreground hover:text-red-500 transition-colors flex items-center justify-center gap-2"
                >
                  {isClearing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Limpar carrinho
                    </>
                  )}
                </button>

                {/* Subtotal */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-bold text-lg">
                    R$ {subtotal.toFixed(2).replace(".", ",")}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Frete calculado na finalização
                </p>

                {/* Checkout Button */}
                <Link href="/checkout" onClick={closeCart}>
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700 text-white rounded-full py-6 text-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Finalizar Compra
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>

                {/* Continue Shopping */}
                <Button 
                  variant="outline" 
                  className="w-full rounded-full"
                  onClick={closeCart}
                >
                  Continuar Comprando
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
