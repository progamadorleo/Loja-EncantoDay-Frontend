"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { 
  MapPin, 
  Truck, 
  CreditCard, 
  CheckCircle2, 
  ChevronLeft,
  ShieldCheck,
  Loader2,
  QrCode,
  Copy,
  Clock,
  Ticket,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useCustomer } from "@/contexts/customer-context"
import { useCart } from "@/contexts/cart-context"
import { toast } from "sonner"

// Components
import { CheckoutStepper } from "@/components/checkout/checkout-stepper"
import { AddressStep } from "@/components/checkout/address-step"
import { ShippingStep } from "@/components/checkout/shipping-step"
import { PaymentStep, type PaymentData, type PaymentStepRef } from "@/components/checkout/payment-step"
import { ConfirmationStep } from "@/components/checkout/confirmation-step"
import { OrderSummary } from "@/components/checkout/order-summary"

// API
import { 
  createOrder, 
  processPayment, 
  getPaymentStatus,
  validateCoupon,
  type CreateOrderData,
  type Order,
  type CustomerAddress,
  type ShippingResult
} from "@/lib/api"

export default function CheckoutPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading, accessToken } = useCustomer()
  const { items, subtotal, clearAll } = useCart()
  const [currentStep, setCurrentStep] = useState(1)
  
  // Estados do checkout
  const [selectedAddress, setSelectedAddress] = useState<CustomerAddress | null>(null)
  const [shippingResult, setShippingResult] = useState<ShippingResult | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null)
  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string; discount: number} | null>(null)
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false)
  const discount = appliedCoupon?.discount || 0
  
  // Estados de processamento
  const [isProcessing, setIsProcessing] = useState(false)
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null)
  const [pixData, setPixData] = useState<{
    qr_code?: string
    qr_code_base64?: string
    expiration?: string
  } | null>(null)
  const [pixGenerated, setPixGenerated] = useState(false)
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
  const [isCheckingPayment, setIsCheckingPayment] = useState(false)
  const paymentStepRef = useRef<PaymentStepRef>(null)

  // Formatar preco
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  // Verificar status do pagamento
  const checkPaymentStatus = async (): Promise<boolean> => {
    if (!accessToken || !createdOrder) return false

    try {
      const response = await getPaymentStatus(accessToken, createdOrder.id)
      const status = (response as any).payment_status || (response as any).data?.payment_status
      
      if (status === 'approved' || status === 'paid') {
        return true
      }
      return false
    } catch (error) {
      console.error("Erro ao verificar pagamento:", error)
      return false
    }
  }

  // Handler para quando usuario clica em "Ja fiz o pagamento"
  const handleCheckPayment = async () => {
    setIsCheckingPayment(true)
    
    const isPaid = await checkPaymentStatus()
    
    if (isPaid) {
      clearAll()
      toast.success("Pagamento confirmado!")
      router.push(`/checkout/sucesso?order_id=${createdOrder?.id}`)
    } else {
      toast.error("Pagamento ainda nao confirmado. Aguarde alguns instantes e tente novamente.")
    }
    
    setIsCheckingPayment(false)
  }

  // Polling automatico para verificar pagamento a cada 5 segundos
  useEffect(() => {
    if (!pixGenerated || !createdOrder || !accessToken) return

    const interval = setInterval(async () => {
      const isPaid = await checkPaymentStatus()
      
      if (isPaid) {
        clearInterval(interval)
        clearAll()
        toast.success("Pagamento confirmado automaticamente!")
        router.push(`/checkout/sucesso?order_id=${createdOrder.id}`)
      }
    }, 5000) // Verifica a cada 5 segundos

    // Limpar intervalo ao desmontar ou quando PIX nao estiver mais ativo
    return () => clearInterval(interval)
  }, [pixGenerated, createdOrder, accessToken])

  // Aplicar cupom
  const handleApplyCoupon = async () => {
    if (!accessToken || !couponCode.trim()) {
      toast.error("Digite um codigo de cupom")
      return
    }

    setIsValidatingCoupon(true)
    try {
      const result = await validateCoupon(accessToken, couponCode.trim(), subtotal)
      
      if (result.valid) {
        setAppliedCoupon({
          code: result.coupon.code,
          discount: result.discount_amount,
        })
        toast.success(`Cupom aplicado! Desconto de ${formatPrice(result.discount_amount)}`)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Cupom invalido"
      toast.error(errorMessage)
    } finally {
      setIsValidatingCoupon(false)
    }
  }

  // Remover cupom
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode("")
    toast.success("Cupom removido")
  }

  // Calculos
  const shippingCost = shippingResult?.isFree ? 0 : (shippingResult?.price || 0)
  const total = subtotal - discount + shippingCost

  // Verificar autenticacao
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/conta/login?redirect=/checkout")
    }
  }, [isAuthenticated, isLoading, router])

  // Verificar se tem itens no carrinho
  useEffect(() => {
    if (!isLoading && items.length === 0 && !createdOrder) {
      router.push("/")
    }
  }, [items, isLoading, router, createdOrder])

  const steps = [
    { id: 1, title: "Endereco", icon: MapPin },
    { id: 2, title: "Entrega", icon: Truck },
    { id: 3, title: "Pagamento", icon: CreditCard },
    { id: 4, title: "Confirmacao", icon: CheckCircle2 },
  ]

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedAddress !== null
      case 2:
        return shippingResult !== null && shippingResult.available
      case 3:
        return selectedPayment !== null
      default:
        return true
    }
  }

  const handleNext = async () => {
    if (currentStep < 4 && canProceed()) {
      // Se estiver no step de pagamento (3), preparar dados antes de avancar
      if (currentStep === 3 && paymentStepRef.current) {
        const data = await paymentStepRef.current.preparePayment()
        if (!data) {
          // Validacao falhou ou erro ao gerar token
          if (selectedPayment === "credit") {
            toast.error("Verifique os dados do cartao")
          }
          return
        }
        // paymentData sera atualizado via onPaymentReady
      }
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Criar pedido no backend
  const handleCreateOrder = async (): Promise<Order | null> => {
    if (!accessToken || !selectedAddress) {
      toast.error("Dados incompletos para criar pedido")
      return null
    }

    try {
      const orderData: CreateOrderData = {
        items: items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.product?.original_price && item.product.original_price > item.product.price 
            ? item.product.price 
            : item.unit_price,
          product_name: item.product?.name || "Produto",
          product_slug: item.product?.slug,
          product_image: item.product?.images?.[0],
        })),
        shipping_address: {
          street: selectedAddress.street,
          number: selectedAddress.number,
          complement: selectedAddress.complement,
          neighborhood: selectedAddress.neighborhood,
          city: selectedAddress.city,
          state: selectedAddress.state,
          zipcode: selectedAddress.cep,
          recipient_name: selectedAddress.recipient_name || selectedAddress.label,
        },
        shipping_method: "Entrega Encanto Day",
        shipping_price: shippingCost,
        shipping_deadline: "6h a 12h",
        subtotal: subtotal,
        discount: discount,
        total: total,
        coupon_code: appliedCoupon?.code || undefined,
        coupon_discount: discount,
      }

      const order = await createOrder(accessToken, orderData)
      setCreatedOrder(order)
      return order
    } catch (error) {
      console.error("Erro ao criar pedido:", error)
      toast.error("Erro ao criar pedido. Tente novamente.")
      return null
    }
  }

  // Processar pagamento
  const handleProcessPayment = async (order: Order, payment?: PaymentData | null) => {
    if (!accessToken || !selectedPayment) return

    const paymentInfo = payment || paymentData

    try {
      const paymentResult = await processPayment(accessToken, {
        order_id: order.id,
        payment_method: selectedPayment === "pix" ? "pix" : "credit_card",
        token: paymentInfo?.token,
        installments: paymentInfo?.installments,
        payer_email: paymentInfo?.payer_email,
      })

      if (selectedPayment === "pix") {
        // No modo teste, o MP pode nao retornar qr_code, mas ainda assim o pedido foi criado
        setPixData({
          qr_code: paymentResult.qr_code || `PIX-TESTE-${order.id}`,
          qr_code_base64: paymentResult.qr_code_base64,
          expiration: paymentResult.expiration,
        })
        setPixGenerated(true)
        toast.success(paymentResult.qr_code 
          ? "PIX gerado com sucesso! Escaneie o QR Code." 
          : "Pedido criado! Em modo teste, o QR Code pode nao aparecer."
        )
      } else if (paymentResult.status === "approved") {
        // Pagamento aprovado - limpar carrinho e ir para sucesso
        clearAll()
        router.push(`/checkout/sucesso?order_id=${order.id}`)
      } else if (paymentResult.status === "rejected") {
        toast.error("Pagamento recusado. Verifique os dados do cartao.")
      } else {
        toast.info("Pagamento em processamento...")
      }

      return paymentResult
    } catch (error) {
      console.error("Erro ao processar pagamento:", error)
      toast.error("Erro ao processar pagamento. Tente novamente.")
      return null
    }
  }

  // Finalizar pedido
  const handleFinish = async () => {
    setIsProcessing(true)

    try {
      // 1. Verificar se temos dados de pagamento
      if (!paymentData) {
        toast.error("Dados de pagamento nao encontrados. Volte e selecione o pagamento novamente.")
        setIsProcessing(false)
        return
      }

      // Para cartao de credito, verificar se temos o token
      if (selectedPayment === "credit" && !paymentData.token) {
        toast.error("Token do cartao nao gerado. Volte e preencha os dados do cartao novamente.")
        setIsProcessing(false)
        return
      }

      let currentPaymentData = paymentData

      // 2. Criar pedido se ainda nao foi criado
      let order = createdOrder
      if (!order) {
        order = await handleCreateOrder()
        if (!order) {
          setIsProcessing(false)
          return
        }
      }

      // 3. Processar pagamento com os dados preparados
      const paymentResult = await handleProcessPayment(order, currentPaymentData)
      
      if (paymentResult?.status === "approved") {
        // Sucesso total
        clearAll()
        router.push(`/checkout/sucesso?order_id=${order.id}`)
      } else if (selectedPayment === "pix" && paymentResult?.qr_code) {
        // PIX gerado - usuario precisa pagar
        toast.success("Escaneie o QR Code para pagar!")
      }
    } catch (error) {
      console.error("Erro ao finalizar pedido:", error)
      toast.error("Erro ao finalizar pedido")
    } finally {
      setIsProcessing(false)
    }
  }

  const applyCoupon = () => {
    // Mock: cupom DESCONTO10 da 10% off
    if (couponCode.toUpperCase() === "DESCONTO10") {
      setDiscount(subtotal * 0.1)
      toast.success("Cupom aplicado com sucesso!")
    } else if (couponCode.toUpperCase() === "FRETEGRATIS") {
      // Outro cupom de exemplo
      toast.success("Frete gratis aplicado!")
    } else if (couponCode) {
      toast.error("Cupom invalido")
    }
  }

  // Handler para dados de pagamento
  const handlePaymentReady = (data: PaymentData) => {
    setPaymentData(data)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated || (items.length === 0 && !createdOrder)) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header simplificado */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/images/logo.png"
                alt="Logo"
                width={120}
                height={40}
                className="h-10 w-auto"
              />
            </Link>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="h-5 w-5 text-green-600" />
              <span>Compra Segura</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 lg:py-10">
        {/* Tela de PIX gerado */}
        {pixGenerated && pixData && (
          <div className="max-w-2xl mx-auto">
            <Card className="p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <QrCode className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">PIX Gerado com Sucesso!</h2>
                <p className="text-muted-foreground mb-6">
                  Escaneie o QR Code abaixo ou copie o codigo para pagar
                </p>

                {/* QR Code */}
                <div className="bg-white p-6 rounded-xl shadow-sm border inline-block mb-6">
                  {pixData.qr_code_base64 ? (
                    <img
                      src={`data:image/png;base64,${pixData.qr_code_base64}`}
                      alt="QR Code PIX"
                      className="w-56 h-56"
                    />
                  ) : (
                    <div className="w-56 h-56 bg-gray-100 rounded-lg flex items-center justify-center">
                      <p className="text-sm text-gray-500">QR Code</p>
                    </div>
                  )}
                </div>

                {/* Valor */}
                <p className="text-lg mb-4">
                  Valor: <span className="font-bold text-primary text-2xl">{formatPrice(total)}</span>
                </p>

                {/* Codigo PIX */}
                {pixData.qr_code && (
                  <div className="mb-6">
                    <p className="text-sm text-muted-foreground mb-2">Codigo PIX Copia e Cola:</p>
                    <div className="flex gap-2 max-w-md mx-auto">
                      <Input
                        value={pixData.qr_code}
                        readOnly
                        className="text-xs font-mono"
                      />
                      <Button
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(pixData.qr_code || "")
                          toast.success("Codigo copiado!")
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Expiracao */}
                {pixData.expiration && (
                  <p className="text-sm text-orange-600 mb-6" suppressHydrationWarning>
                    <Clock className="h-4 w-4 inline mr-1" />
                    Expira em: {new Date(pixData.expiration).toLocaleString("pt-BR")}
                  </p>
                )}

                {/* Instrucoes */}
                <div className="bg-secondary/50 rounded-lg p-4 text-left mb-6">
                  <h4 className="font-semibold mb-2">Como pagar:</h4>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Abra o app do seu banco</li>
                    <li>Acesse a area PIX e escolha pagar com QR Code</li>
                    <li>Escaneie o codigo ou cole o codigo copiado</li>
                    <li>Confirme o pagamento</li>
                  </ol>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="outline" onClick={() => router.push("/")}>
                    Voltar para Loja
                  </Button>
                  <Button onClick={handleCheckPayment} disabled={isCheckingPayment}>
                    {isCheckingPayment ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Verificando...
                      </>
                    ) : (
                      "Ja fiz o pagamento"
                    )}
                  </Button>
                </div>

                {/* Indicador de verificacao automatica */}
                <p className="text-xs text-muted-foreground mt-4">
                  <Loader2 className="h-3 w-3 inline mr-1 animate-spin" />
                  Verificando pagamento automaticamente...
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* Checkout normal */}
        {!pixGenerated && (
          <>
        {/* Botao voltar */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => currentStep > 1 ? handleBack() : router.back()}
          className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
          disabled={isProcessing}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          {currentStep > 1 ? "Voltar" : "Continuar comprando"}
        </Button>

        {/* Stepper */}
        <CheckoutStepper steps={steps} currentStep={currentStep} />

        {/* Content */}
        <div className="mt-8 lg:mt-10 grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            {currentStep === 1 && (
              <AddressStep 
                selectedAddress={selectedAddress}
                onSelectAddress={setSelectedAddress}
              />
            )}
            {currentStep === 2 && (
              <ShippingStep
                selectedAddress={selectedAddress}
                cartTotal={subtotal}
                onShippingCalculated={setShippingResult}
              />
            )}
            {currentStep === 3 && (
              <PaymentStep
                ref={paymentStepRef}
                selectedPayment={selectedPayment}
                onSelectPayment={setSelectedPayment}
                total={total}
                orderId={createdOrder?.id}
                onPaymentReady={handlePaymentReady}
                pixData={pixData}
              />
            )}
            {currentStep === 4 && (
              <ConfirmationStep
                selectedAddress={selectedAddress}
                shippingResult={shippingResult}
                selectedPayment={selectedPayment}
                onEditAddress={() => setCurrentStep(1)}
                onEditShipping={() => setCurrentStep(2)}
                onEditPayment={() => setCurrentStep(3)}
              />
            )}

            {/* Botoes de navegacao */}
            <div className="mt-8 flex justify-between">
              {currentStep > 1 && (
                <Button 
                  variant="outline" 
                  onClick={handleBack}
                  disabled={isProcessing}
                >
                  Voltar
                </Button>
              )}
              <div className="ml-auto">
                {currentStep < 4 ? (
                  <Button 
                    onClick={handleNext}
                    disabled={!canProceed() || isProcessing}
                    className="min-w-[150px]"
                  >
                    Continuar
                  </Button>
                ) : (
                  <Button 
                    onClick={handleFinish}
                    disabled={isProcessing}
                    className="min-w-[150px] bg-green-600 hover:bg-green-700"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      "Finalizar Pedido"
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Resumo do pedido */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <OrderSummary
                items={items}
                subtotal={subtotal}
                shippingCost={shippingCost}
                discount={discount}
                total={total}
              />

              {/* Campo de Cupom */}
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Ticket className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">Cupom de Desconto</span>
                </div>
                
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div>
                      <p className="font-mono font-bold text-green-700">{appliedCoupon.code}</p>
                      <p className="text-sm text-green-600">-{formatPrice(appliedCoupon.discount)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-green-700 hover:text-red-600 hover:bg-red-50"
                      onClick={handleRemoveCoupon}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Digite o cupom"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="font-mono uppercase"
                      onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                    />
                    <Button 
                      variant="outline" 
                      onClick={handleApplyCoupon}
                      disabled={isValidatingCoupon || !couponCode.trim()}
                    >
                      {isValidatingCoupon ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Aplicar"
                      )}
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
          </>
        )}
      </main>
    </div>
  )
}
