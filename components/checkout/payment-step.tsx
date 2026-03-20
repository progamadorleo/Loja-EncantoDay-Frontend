"use client"

import { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from "react"
import { CreditCard, QrCode, Check, Copy, CheckCheck, Loader2, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

// Tipos do Mercado Pago
declare global {
  interface Window {
    MercadoPago: any
  }
}

interface PaymentStepProps {
  selectedPayment: string | null
  onSelectPayment: (id: string) => void
  total: number
  orderId?: string
  onPaymentReady?: (paymentData: PaymentData) => void
  pixData?: {
    qr_code?: string
    qr_code_base64?: string
    expiration?: string
  } | null
}

export interface PaymentData {
  payment_method: 'pix' | 'credit_card'
  token?: string
  installments?: number
  payment_method_id?: string
  issuer_id?: string
  payer_email?: string
}

export interface PaymentStepRef {
  preparePayment: () => Promise<PaymentData | null>
}

interface CardFormData {
  cardNumber: string
  cardName: string
  expiry: string
  cvv: string
  installments: string
  email: string
}

export const PaymentStep = forwardRef<PaymentStepRef, PaymentStepProps>(function PaymentStep({ 
  selectedPayment, 
  onSelectPayment, 
  total,
  orderId,
  onPaymentReady,
  pixData
}, ref) {
  const [copied, setCopied] = useState(false)
  const [isLoadingMP, setIsLoadingMP] = useState(false)
  const [mpInstance, setMpInstance] = useState<any>(null)
  const [cardForm, setCardForm] = useState<CardFormData>({
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
    installments: "1",
    email: ""
  })
  const [cardErrors, setCardErrors] = useState<Partial<CardFormData>>({})
  const [isProcessing, setIsProcessing] = useState(false)

  const MP_PUBLIC_KEY = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY || ""

  // Carregar SDK do Mercado Pago
  useEffect(() => {
    if (typeof window !== "undefined" && MP_PUBLIC_KEY) {
      const script = document.createElement("script")
      script.src = "https://sdk.mercadopago.com/js/v2"
      script.async = true
      script.onload = () => {
        if (window.MercadoPago) {
          const mp = new window.MercadoPago(MP_PUBLIC_KEY, {
            locale: "pt-BR"
          })
          setMpInstance(mp)
        }
      }
      document.head.appendChild(script)

      return () => {
        const existingScript = document.querySelector(`script[src="${script.src}"]`)
        if (existingScript) {
          existingScript.remove()
        }
      }
    }
  }, [MP_PUBLIC_KEY])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  const handleCopyPix = () => {
    if (pixData?.qr_code) {
      navigator.clipboard.writeText(pixData.qr_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Formatar numero do cartao
  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    const groups = numbers.match(/.{1,4}/g) || []
    return groups.join(" ").substring(0, 19)
  }

  // Formatar validade
  const formatExpiry = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length >= 2) {
      return numbers.substring(0, 2) + "/" + numbers.substring(2, 4)
    }
    return numbers
  }

  const handleCardInputChange = (field: keyof CardFormData, value: string) => {
    let formattedValue = value

    if (field === "cardNumber") {
      formattedValue = formatCardNumber(value)
    } else if (field === "expiry") {
      formattedValue = formatExpiry(value)
    } else if (field === "cvv") {
      formattedValue = value.replace(/\D/g, "").substring(0, 4)
    }

    setCardForm(prev => ({ ...prev, [field]: formattedValue }))
    setCardErrors(prev => ({ ...prev, [field]: undefined }))
  }

  // Validar formulario do cartao
  const validateCardForm = (): boolean => {
    const errors: Partial<CardFormData> = {}

    if (!cardForm.cardNumber || cardForm.cardNumber.replace(/\s/g, "").length < 16) {
      errors.cardNumber = "Numero do cartao invalido"
    }
    if (!cardForm.cardName || cardForm.cardName.length < 3) {
      errors.cardName = "Nome obrigatorio"
    }
    if (!cardForm.expiry || cardForm.expiry.length < 5) {
      errors.expiry = "Validade invalida"
    }
    if (!cardForm.cvv || cardForm.cvv.length < 3) {
      errors.cvv = "CVV invalido"
    }
    if (!cardForm.email || !cardForm.email.includes("@")) {
      errors.email = "Email invalido"
    }

    setCardErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Gerar token do cartao com Mercado Pago
  const generateCardToken = async (): Promise<string | null> => {
    if (!mpInstance) {
      console.error("MercadoPago SDK nao carregado")
      return null
    }

    try {
      const [expiryMonth, expiryYear] = cardForm.expiry.split("/")
      
      const cardData = {
        cardNumber: cardForm.cardNumber.replace(/\s/g, ""),
        cardholderName: cardForm.cardName,
        cardExpirationMonth: expiryMonth,
        cardExpirationYear: `20${expiryYear}`,
        securityCode: cardForm.cvv,
        identificationType: "CPF",
        identificationNumber: "12345678909", // Em producao, pegar do cliente
      }

      const token = await mpInstance.createCardToken(cardData)
      return token.id
    } catch (error) {
      console.error("Erro ao gerar token:", error)
      return null
    }
  }

  // Preparar dados de pagamento - retorna os dados para uso externo
  const preparePaymentData = useCallback(async (): Promise<PaymentData | null> => {
    if (selectedPayment === "pix") {
      const data: PaymentData = { payment_method: "pix" }
      onPaymentReady?.(data)
      return data
    } else if (selectedPayment === "credit") {
      if (!validateCardForm()) {
        return null
      }

      setIsProcessing(true)
      const token = await generateCardToken()
      setIsProcessing(false)

      if (token) {
        const data: PaymentData = {
          payment_method: "credit_card",
          token,
          installments: parseInt(cardForm.installments),
          payer_email: cardForm.email
        }
        onPaymentReady?.(data)
        return data
      }
      return null
    }
    return null
  }, [selectedPayment, cardForm, onPaymentReady])

  // Expor função preparePayment via ref
  useImperativeHandle(ref, () => ({
    preparePayment: preparePaymentData
  }), [preparePaymentData])

  // Calcular parcelas
  const getInstallmentOptions = () => {
    const options = []
    for (let i = 1; i <= 6; i++) {
      const value = total / i
      const label = i === 1 
        ? `1x de ${formatPrice(value)} (sem juros)`
        : `${i}x de ${formatPrice(value)} (sem juros)`
      options.push({ value: String(i), label })
    }
    return options
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-2">Forma de pagamento</h2>
      <p className="text-muted-foreground mb-6">Escolha como deseja pagar</p>

      <div className="grid gap-4">
        {/* PIX */}
        <Card
          className={cn(
            "cursor-pointer transition-all duration-200 hover:border-primary/50",
            selectedPayment === "pix" && "border-primary ring-2 ring-primary/20"
          )}
          onClick={() => onSelectPayment("pix")}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "flex items-center justify-center w-12 h-12 rounded-full shrink-0",
                  selectedPayment === "pix" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-secondary text-muted-foreground"
                )}
              >
                {selectedPayment === "pix" ? (
                  <Check className="h-6 w-6" />
                ) : (
                  <QrCode className="h-6 w-6" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">PIX</h3>
                <p className="text-sm text-muted-foreground">
                  Pagamento instantaneo - Aprovacao imediata
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-foreground">
                  {formatPrice(total)}
                </p>
              </div>
            </div>

            {/* QR Code area - mostra quando selecionado */}
            {selectedPayment === "pix" && (
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  {/* QR Code */}
                  <div className="bg-white p-4 rounded-xl shadow-sm border">
                    {pixData?.qr_code_base64 ? (
                      <img 
                        src={`data:image/png;base64,${pixData.qr_code_base64}`}
                        alt="QR Code PIX"
                        className="w-40 h-40"
                      />
                    ) : (
                      <div className="w-40 h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                        <QrCode className="h-24 w-24 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h4 className="font-semibold text-foreground mb-2">
                      {pixData?.qr_code ? "Escaneie o QR Code" : "QR Code sera gerado ao confirmar"}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Abra o app do seu banco, escaneie o codigo e confirme o pagamento.
                      A aprovacao e instantanea!
                    </p>
                    
                    {pixData?.qr_code && (
                      <div className="flex flex-col gap-2">
                        <p className="text-xs text-muted-foreground">Ou copie o codigo PIX:</p>
                        <div className="flex gap-2">
                          <Input 
                            value={pixData.qr_code.substring(0, 40) + "..."} 
                            readOnly 
                            className="text-xs"
                          />
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={handleCopyPix}
                          >
                            {copied ? (
                              <CheckCheck className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        {pixData.expiration && (
                          <p className="text-xs text-orange-600">
                            Expira em: {new Date(pixData.expiration).toLocaleString("pt-BR")}
                          </p>
                        )}
                      </div>
                    )}

                    {!pixData?.qr_code && (
                      <p className="text-sm text-muted-foreground mt-4">
                        O QR Code sera gerado ao clicar em "Finalizar Pedido"
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cartao de Credito */}
        <Card
          className={cn(
            "cursor-pointer transition-all duration-200 hover:border-primary/50",
            selectedPayment === "credit" && "border-primary ring-2 ring-primary/20"
          )}
          onClick={() => onSelectPayment("credit")}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "flex items-center justify-center w-12 h-12 rounded-full shrink-0",
                  selectedPayment === "credit" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-secondary text-muted-foreground"
                )}
              >
                {selectedPayment === "credit" ? (
                  <Check className="h-6 w-6" />
                ) : (
                  <CreditCard className="h-6 w-6" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Cartao de Credito</h3>
                <p className="text-sm text-muted-foreground">
                  Parcele em ate 6x sem juros
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-foreground">
                  {formatPrice(total)}
                </p>
              </div>
            </div>

            {/* Formulario do cartao - mostra quando selecionado */}
            {selectedPayment === "credit" && (
              <div className="mt-6 pt-6 border-t border-border">
                <form className="grid gap-4" onClick={(e) => e.stopPropagation()}>
                  <div className="grid gap-2">
                    <Label htmlFor="cardNumber">Numero do cartao</Label>
                    <Input 
                      id="cardNumber" 
                      placeholder="0000 0000 0000 0000"
                      value={cardForm.cardNumber}
                      onChange={(e) => handleCardInputChange("cardNumber", e.target.value)}
                      maxLength={19}
                      className={cardErrors.cardNumber ? "border-destructive" : ""}
                    />
                    {cardErrors.cardNumber && (
                      <p className="text-xs text-destructive">{cardErrors.cardNumber}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="cardName">Nome no cartao</Label>
                    <Input 
                      id="cardName" 
                      placeholder="Como esta no cartao"
                      value={cardForm.cardName}
                      onChange={(e) => handleCardInputChange("cardName", e.target.value.toUpperCase())}
                      className={cardErrors.cardName ? "border-destructive" : ""}
                    />
                    {cardErrors.cardName && (
                      <p className="text-xs text-destructive">{cardErrors.cardName}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="expiry">Validade</Label>
                      <Input 
                        id="expiry" 
                        placeholder="MM/AA" 
                        value={cardForm.expiry}
                        onChange={(e) => handleCardInputChange("expiry", e.target.value)}
                        maxLength={5}
                        className={cardErrors.expiry ? "border-destructive" : ""}
                      />
                      {cardErrors.expiry && (
                        <p className="text-xs text-destructive">{cardErrors.expiry}</p>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input 
                        id="cvv" 
                        placeholder="123" 
                        value={cardForm.cvv}
                        onChange={(e) => handleCardInputChange("cvv", e.target.value)}
                        maxLength={4}
                        className={cardErrors.cvv ? "border-destructive" : ""}
                      />
                      {cardErrors.cvv && (
                        <p className="text-xs text-destructive">{cardErrors.cvv}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email para recibo</Label>
                    <Input 
                      id="email" 
                      type="email"
                      placeholder="seu@email.com"
                      value={cardForm.email}
                      onChange={(e) => handleCardInputChange("email", e.target.value)}
                      className={cardErrors.email ? "border-destructive" : ""}
                    />
                    {cardErrors.email && (
                      <p className="text-xs text-destructive">{cardErrors.email}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label>Parcelas</Label>
                    <Select 
                      value={cardForm.installments} 
                      onValueChange={(v) => handleCardInputChange("installments", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione as parcelas" />
                      </SelectTrigger>
                      <SelectContent>
                        {getInstallmentOptions().map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </form>

                {!MP_PUBLIC_KEY && (
                  <Alert className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Chave publica do Mercado Pago nao configurada. Configure NEXT_PUBLIC_MP_PUBLIC_KEY.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Informacao de seguranca */}
      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <p className="text-xs text-muted-foreground text-center">
          Pagamento processado com seguranca pelo Mercado Pago. Seus dados estao protegidos.
        </p>
      </div>
    </div>
  )
})

// Exportar funcao para validar e obter dados do pagamento
export function usePaymentData() {
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
  
  const handlePaymentReady = useCallback((data: PaymentData) => {
    setPaymentData(data)
  }, [])

  return { paymentData, handlePaymentReady, setPaymentData }
}
