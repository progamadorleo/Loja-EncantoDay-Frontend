"use client"

import { useState, useEffect } from "react"
import { Truck, Check, Loader2, MapPin, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { calculateShipping, type ShippingResult, type CustomerAddress } from "@/lib/api"

interface ShippingStepProps {
  selectedAddress: CustomerAddress | null
  cartTotal: number
  onShippingCalculated: (shipping: ShippingResult | null) => void
}

export function ShippingStep({ 
  selectedAddress, 
  cartTotal,
  onShippingCalculated 
}: ShippingStepProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [shippingResult, setShippingResult] = useState<ShippingResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  // Calcular frete quando o endereco estiver disponivel
  useEffect(() => {
    if (selectedAddress?.cep) {
      handleCalculateShipping()
    }
  }, [selectedAddress?.cep, cartTotal])

  async function handleCalculateShipping() {
    if (!selectedAddress?.cep) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await calculateShipping(selectedAddress.cep, cartTotal)
      
      if (response.success && response.data) {
        setShippingResult(response.data)
        onShippingCalculated(response.data)
      } else {
        setError(response.message || "Erro ao calcular frete")
        setShippingResult(null)
        onShippingCalculated(null)
      }
    } catch (err) {
      console.error("Erro ao calcular frete:", err)
      setError("Erro ao calcular frete. Tente novamente.")
      setShippingResult(null)
      onShippingCalculated(null)
    } finally {
      setIsLoading(false)
    }
  }

  if (!selectedAddress) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Forma de entrega</h2>
        <p className="text-muted-foreground mb-6">Selecione um endereco primeiro</p>
        
        <div className="p-6 bg-secondary/50 rounded-lg text-center">
          <AlertCircle className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            Volte a etapa anterior e selecione um endereco de entrega.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-2">Forma de entrega</h2>
      <p className="text-muted-foreground mb-6">Confira o frete para seu endereco</p>

      {/* Endereco selecionado */}
      <div className="mb-6 p-4 bg-secondary/30 rounded-lg border border-border">
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-foreground">{selectedAddress.label}</p>
            <p className="text-sm text-muted-foreground">
              {selectedAddress.street}, {selectedAddress.number}
              {selectedAddress.complement && ` - ${selectedAddress.complement}`}
            </p>
            <p className="text-sm text-muted-foreground">
              {selectedAddress.neighborhood} - {selectedAddress.city}/{selectedAddress.state}
            </p>
            <p className="text-sm text-muted-foreground">
              CEP: {selectedAddress.cep.replace(/(\d{5})(\d{3})/, "$1-$2")}
            </p>
          </div>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <Card className="border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-muted-foreground">Calculando frete...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Erro */}
      {error && !isLoading && (
        <Card className="border-destructive/50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-destructive shrink-0" />
              <div>
                <p className="font-medium text-destructive">Erro no calculo do frete</p>
                <p className="text-sm text-muted-foreground mt-1">{error}</p>
                <button 
                  onClick={handleCalculateShipping}
                  className="text-sm text-primary hover:underline mt-2"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultado do frete */}
      {shippingResult && !isLoading && (
        <div className="space-y-4">
          {shippingResult.available ? (
            <Card className="border-primary ring-2 ring-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full shrink-0 bg-primary text-primary-foreground">
                      <Check className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Entrega Encanto Day</h3>
                      <p className="text-sm text-muted-foreground">
                        {shippingResult.address}
                      </p>
                      <p className="text-sm text-primary font-medium mt-1">
                        Entrega em 6h a 12h
                      </p>
                      {shippingResult.distance && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Distancia: {shippingResult.distance.toFixed(1)} km
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {shippingResult.isFree ? (
                      <div>
                        <p className="text-lg font-bold text-green-600">Gratis</p>
                        <p className="text-xs text-muted-foreground">
                          {shippingResult.freeShippingReason}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-lg font-bold text-foreground">
                          {formatPrice(shippingResult.price || 0)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-destructive/50">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 text-destructive shrink-0" />
                  <div>
                    <p className="font-medium text-destructive">Fora da area de entrega</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      No momento, entregamos apenas em Goiania (CEPs iniciados em 74).
                      Por favor, selecione outro endereco.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Info adicional */}
      <div className="mt-6 p-4 bg-secondary/50 rounded-lg">
        <div className="flex items-start gap-3">
          <Truck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Entrega rapida em Goiania</p>
            <p className="text-sm text-muted-foreground mt-1">
              Os prazos de entrega comecam a contar apos a confirmacao do pagamento.
              Para pagamentos via PIX, a confirmacao e imediata.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
