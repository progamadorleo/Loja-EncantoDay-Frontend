"use client"

import { useState, useEffect } from "react"
import { Truck, MapPin, Loader2, Check, AlertCircle, X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCustomer } from "@/contexts/customer-context"
import { calculateShipping, getCustomerAddresses, createCustomerAddress, type ShippingResult, type CustomerAddress } from "@/lib/api"

interface ShippingCalculatorProps {
  productPrice?: number
  cartTotal?: number
  onShippingCalculated?: (result: ShippingResult | null) => void
}

export function ShippingCalculator({ productPrice, cartTotal, onShippingCalculated }: ShippingCalculatorProps) {
  const { customer, accessToken, isAuthenticated } = useCustomer()
  
  const [cep, setCep] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false)
  const [result, setResult] = useState<ShippingResult | null>(null)
  const [error, setError] = useState("")
  const [addresses, setAddresses] = useState<CustomerAddress[]>([])
  const [showSaveOption, setShowSaveOption] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [savedMessage, setSavedMessage] = useState("")

  // Carregar endereços do usuário logado
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      loadAddresses()
    }
  }, [isAuthenticated, accessToken])

  // Se tiver endereço padrão, calcular frete automaticamente
  useEffect(() => {
    if (addresses.length > 0) {
      const defaultAddress = addresses.find(a => a.is_default) || addresses[0]
      if (defaultAddress) {
        setCep(formatCep(defaultAddress.cep))
        handleCalculate(defaultAddress.cep)
      }
    }
  }, [addresses])

  async function loadAddresses() {
    if (!accessToken) return
    
    setIsLoadingAddresses(true)
    try {
      const response = await getCustomerAddresses(accessToken)
      if (response.data) {
        setAddresses(response.data)
      }
    } catch (err) {
      console.error("Erro ao carregar endereços:", err)
    } finally {
      setIsLoadingAddresses(false)
    }
  }

  function formatCep(value: string) {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 5) return numbers
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`
  }

  function handleCepChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = formatCep(e.target.value)
    setCep(formatted)
    setError("")
    setResult(null)
    setSavedMessage("")
    
    // Mostrar opção de salvar se usuário logado e não tem esse CEP salvo
    if (isAuthenticated && formatted.replace(/\D/g, "").length === 8) {
      const cepNumbers = formatted.replace(/\D/g, "")
      const hasThisCep = addresses.some(a => a.cep === cepNumbers)
      setShowSaveOption(!hasThisCep)
    } else {
      setShowSaveOption(false)
    }
  }

  async function handleCalculate(cepToCalculate?: string) {
    const cepValue = (cepToCalculate || cep).replace(/\D/g, "")
    
    if (cepValue.length !== 8) {
      setError("Digite um CEP válido com 8 dígitos")
      return
    }

    setIsLoading(true)
    setError("")
    setResult(null)

    try {
      const response = await calculateShipping(cepValue, cartTotal || productPrice)
      
      if (response.success && response.data) {
        setResult(response.data)
        onShippingCalculated?.(response.data)
        
        // Mostrar opção de salvar se logado e não tem esse CEP
        if (isAuthenticated && response.data.available) {
          const hasThisCep = addresses.some(a => a.cep === cepValue)
          setShowSaveOption(!hasThisCep)
        }
      } else {
        setError(response.message || "Erro ao calcular frete")
        setResult({ available: false })
        onShippingCalculated?.(null)
      }
    } catch (err) {
      setError("Erro ao calcular frete. Tente novamente.")
      onShippingCalculated?.(null)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSaveAddress() {
    if (!accessToken || !result?.address) return

    setIsSaving(true)
    try {
      // Extrair dados do endereço
      const addressParts = result.address.split(", ")
      const cepClean = cep.replace(/\D/g, "")
      
      await createCustomerAddress(accessToken, {
        label: addresses.length === 0 ? "Casa" : "Endereço " + (addresses.length + 1),
        cep: cepClean,
        street: addressParts[0] || "",
        number: "S/N",
        neighborhood: addressParts[1] || "",
        city: addressParts[2]?.split(" - ")[0] || "Goiânia",
        state: "GO",
        is_default: addresses.length === 0,
      })

      setSavedMessage("Endereço salvo com sucesso!")
      setShowSaveOption(false)
      loadAddresses() // Recarregar lista
    } catch (err) {
      setError("Erro ao salvar endereço")
    } finally {
      setIsSaving(false)
    }
  }

  function handleSelectAddress(address: CustomerAddress) {
    setCep(formatCep(address.cep))
    handleCalculate(address.cep)
    setShowSaveOption(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault()
      handleCalculate()
    }
  }

  return (
    <div className="border border-border rounded-xl p-4 bg-muted/30">
      <div className="flex items-center gap-2 mb-3">
        <Truck className="h-5 w-5 text-primary" />
        <span className="font-medium text-foreground">Calcular frete</span>
      </div>

      {/* Endereços salvos do usuário logado */}
      {isAuthenticated && addresses.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-muted-foreground mb-2">Seus endereços:</p>
          <div className="flex flex-wrap gap-2">
            {addresses.map((address) => (
              <button
                key={address.id}
                onClick={() => handleSelectAddress(address)}
                className={`
                  text-xs px-3 py-1.5 rounded-full border transition-colors
                  ${cep.replace(/\D/g, "") === address.cep 
                    ? "bg-primary text-primary-foreground border-primary" 
                    : "bg-background border-border hover:border-primary/50"
                  }
                `}
              >
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3 w-3" />
                  {address.label}
                  {address.is_default && <span className="text-[10px] opacity-70">(padrão)</span>}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading endereços */}
      {isAuthenticated && isLoadingAddresses && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando endereços...
        </div>
      )}

      {/* Campo de CEP */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            placeholder="Digite seu CEP"
            value={cep}
            onChange={handleCepChange}
            onKeyDown={handleKeyDown}
            maxLength={9}
            className="pr-20"
          />
          <a
            href="https://buscacepinter.correios.com.br/app/endereco/index.php"
            target="_blank"
            rel="noopener noreferrer"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-primary hover:underline"
          >
            Não sei
          </a>
        </div>
        <Button 
          onClick={() => handleCalculate()} 
          disabled={isLoading || cep.replace(/\D/g, "").length !== 8}
          className="shrink-0"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Calcular"
          )}
        </Button>
      </div>

      {/* Erro */}
      {error && (
        <div className="mt-3 flex items-start gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Resultado */}
      {result && result.available && (
        <div className="mt-3 p-3 bg-background rounded-lg border border-border">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <MapPin className="h-3.5 w-3.5" />
                <span className="line-clamp-1">{result.address}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{result.distance} km</span>
              </div>
            </div>
            <div className="text-right">
              <div>
                <span className="text-lg font-bold text-foreground">
                  R$ {result.price?.toFixed(2).replace(".", ",")}
                </span>
                <p className="text-xs text-muted-foreground">
                  Entrega em 6h~12h
                </p>
              </div>
            </div>
          </div>

          {/* Opção de salvar endereço */}
          {showSaveOption && isAuthenticated && (
            <div className="mt-3 pt-3 border-t border-border">
              <button
                onClick={handleSaveAddress}
                disabled={isSaving}
                className="flex items-center gap-2 text-sm text-primary hover:underline disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Salvar este endereço na minha conta
              </button>
            </div>
          )}

          {/* Mensagem de salvo */}
          {savedMessage && (
            <div className="mt-2 flex items-center gap-2 text-sm text-emerald-600">
              <Check className="h-4 w-4" />
              {savedMessage}
            </div>
          )}
        </div>
      )}

      {/* Fora da área de entrega */}
      {result && !result.available && (
        <div className="mt-3 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
          <div className="flex items-start gap-2 text-sm text-destructive">
            <X className="h-4 w-4 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Fora da área de entrega</p>
              <p className="text-xs mt-1 opacity-80">
                No momento, entregamos apenas em Goiânia (CEPs iniciados em 74)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Nota sobre entrega */}
      <p className="mt-3 text-xs text-muted-foreground">
        Entregamos apenas em Goiânia - GO
      </p>
    </div>
  )
}
