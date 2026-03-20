"use client"

import { MapPin, Truck, CreditCard, Pencil } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { type CustomerAddress, type ShippingResult } from "@/lib/api"

interface ConfirmationStepProps {
  selectedAddress: CustomerAddress | null
  shippingResult: ShippingResult | null
  selectedPayment: string | null
  onEditAddress: () => void
  onEditShipping: () => void
  onEditPayment: () => void
}

const paymentInfo: Record<string, { name: string; detail: string }> = {
  "pix": {
    name: "PIX",
    detail: "Pagamento instantaneo",
  },
  "credit": {
    name: "Cartao de Credito",
    detail: "Parcele em ate 12x",
  },
}

export function ConfirmationStep({
  selectedAddress,
  shippingResult,
  selectedPayment,
  onEditAddress,
  onEditShipping,
  onEditPayment,
}: ConfirmationStepProps) {
  const payment = selectedPayment ? paymentInfo[selectedPayment] : null

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-2">Confirme seu pedido</h2>
      <p className="text-muted-foreground mb-6">Revise as informacoes antes de finalizar</p>

      <div className="grid gap-4">
        {/* Endereco */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Endereco de entrega</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={onEditAddress}>
                <Pencil className="h-4 w-4 mr-1" />
                Editar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {selectedAddress ? (
              <div>
                <p className="font-medium text-foreground">{selectedAddress.label}</p>
                {selectedAddress.recipient_name && (
                  <p className="text-sm text-foreground">{selectedAddress.recipient_name}</p>
                )}
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
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum endereco selecionado</p>
            )}
          </CardContent>
        </Card>

        {/* Entrega */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Forma de entrega</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={onEditShipping}>
                <Pencil className="h-4 w-4 mr-1" />
                Editar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {shippingResult && shippingResult.available ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Entrega Encanto Day</p>
                  <p className="text-sm text-muted-foreground">Entrega em 6h a 12h</p>
                  {shippingResult.distance && (
                    <p className="text-xs text-muted-foreground">
                      Distancia: {shippingResult.distance.toFixed(1)} km
                    </p>
                  )}
                </div>
                {shippingResult.isFree ? (
                  <p className="font-medium text-green-600">Gratis</p>
                ) : (
                  <p className="font-medium text-foreground">
                    {formatPrice(shippingResult.price || 0)}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Frete nao calculado</p>
            )}
          </CardContent>
        </Card>

        {/* Pagamento */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Forma de pagamento</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={onEditPayment}>
                <Pencil className="h-4 w-4 mr-1" />
                Editar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {payment ? (
              <div>
                <p className="font-medium text-foreground">{payment.name}</p>
                <p className="text-sm text-muted-foreground">{payment.detail}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum pagamento selecionado</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Aviso */}
      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-sm text-green-800">
          Ao finalizar, voce concorda com nossos termos de uso e politica de privacidade.
          O pedido sera processado apos a confirmacao do pagamento.
        </p>
      </div>
    </div>
  )
}
