"use client"

import { useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { CheckCircle2, Package, Truck, Mail, ArrowRight, Copy, CheckCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/contexts/cart-context"
import { useState } from "react"

export default function CheckoutSuccessPage() {
  const { clearAll } = useCart()
  const [copied, setCopied] = useState(false)

  // Mock order data
  const orderNumber = `PED-${Date.now().toString().slice(-8)}`
  const orderDate = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })

  // Limpar carrinho ao chegar na pagina de sucesso
  useEffect(() => {
    clearAll()
  }, [clearAll])

  const handleCopyOrder = () => {
    navigator.clipboard.writeText(orderNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header simplificado */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center justify-center">
            <Image
              src="/images/logo.png"
              alt="Logo"
              width={120}
              height={40}
              className="h-10 w-auto"
            />
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-2xl">
        {/* Icone de sucesso */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Pedido realizado com sucesso!
          </h1>
          <p className="text-muted-foreground">
            Obrigado por comprar conosco. Seu pedido foi confirmado.
          </p>
        </div>

        {/* Card do pedido */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Numero do pedido</p>
                <p className="text-xl font-bold text-foreground">{orderNumber}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleCopyOrder}>
                {copied ? (
                  <CheckCheck className="h-4 w-4 mr-1 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4 mr-1" />
                )}
                {copied ? "Copiado" : "Copiar"}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Realizado em {orderDate}
            </p>
          </CardContent>
        </Card>

        {/* Timeline do pedido */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="font-semibold text-foreground mb-4">Acompanhe seu pedido</h2>
            <div className="space-y-4">
              {/* Pedido confirmado */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="w-0.5 h-full bg-border mt-2"></div>
                </div>
                <div className="pb-6">
                  <p className="font-medium text-foreground">Pedido confirmado</p>
                  <p className="text-sm text-muted-foreground">
                    Seu pedido foi recebido e esta sendo processado
                  </p>
                </div>
              </div>

              {/* Preparando */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <Package className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="w-0.5 h-full bg-border mt-2"></div>
                </div>
                <div className="pb-6">
                  <p className="font-medium text-muted-foreground">Preparando pedido</p>
                  <p className="text-sm text-muted-foreground">
                    Em breve seu pedido sera separado e embalado
                  </p>
                </div>
              </div>

              {/* Enviado */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <Truck className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Enviado</p>
                  <p className="text-sm text-muted-foreground">
                    Seu pedido esta a caminho
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informacoes adicionais */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-1">
                  Enviamos um e-mail de confirmacao
                </h3>
                <p className="text-sm text-muted-foreground">
                  Voce recebera atualizacoes sobre o status do seu pedido por e-mail.
                  Verifique tambem sua caixa de spam.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botoes de acao */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild className="flex-1">
            <Link href="/conta">
              Meus pedidos
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href="/">
              Continuar comprando
            </Link>
          </Button>
        </div>

        {/* Duvidas */}
        <Separator className="my-8" />
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Alguma duvida sobre seu pedido?
          </p>
          <Link 
            href="/contato" 
            className="text-sm text-primary font-medium hover:underline"
          >
            Entre em contato conosco
          </Link>
        </div>
      </main>
    </div>
  )
}
