"use client"

import Image from "next/image"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface CartItem {
  id: string
  product_id: string
  quantity: number
  product?: {
    id: string
    name: string
    price: number
    original_price?: number
    images?: string[]
    slug: string
  }
}

interface OrderSummaryProps {
  items: CartItem[]
  subtotal: number
  shippingCost: number
  discount: number
  total: number
}

export function OrderSummary({
  items,
  subtotal,
  shippingCost,
  discount,
  total,
}: OrderSummaryProps) {
  const [showItems, setShowItems] = useState(false)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Resumo do pedido</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {/* Itens do carrinho - colapsavel */}
        <div>
          <button
            onClick={() => setShowItems(!showItems)}
            className="flex items-center justify-between w-full text-sm font-medium text-foreground"
          >
            <span>{items.length} {items.length === 1 ? "item" : "itens"}</span>
            {showItems ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          <div
            className={cn(
              "overflow-hidden transition-all duration-300",
              showItems ? "max-h-[300px] mt-3" : "max-h-0"
            )}
          >
            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2">
              {items.map((item) => {
                const price = item.product?.price || 0
                return (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-muted shrink-0">
                      <Image
                        src={item.product?.images?.[0] || "/placeholder.svg"}
                        alt={item.product?.name || "Produto"}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {item.product?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Qtd: {item.quantity}
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {formatPrice(price * item.quantity)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <Separator />

        {/* Totais */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="text-foreground">{formatPrice(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-green-600">Desconto</span>
              <span className="text-green-600">-{formatPrice(discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Frete</span>
            <span className="text-foreground">
              {shippingCost > 0 ? formatPrice(shippingCost) : "A calcular"}
            </span>
          </div>
        </div>

        <Separator />

        {/* Total */}
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-foreground">Total</span>
          <span className="text-xl font-bold text-primary">{formatPrice(total)}</span>
        </div>

        {/* Parcelas */}
        <p className="text-xs text-center text-muted-foreground">
          ou ate 6x de {formatPrice(total / 6)} sem juros
        </p>
      </CardContent>
    </Card>
  )
}
