"use client"

import { useState, useEffect } from "react"
import { MapPin, Plus, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useCustomer } from "@/contexts/customer-context"
import { 
  getCustomerAddresses, 
  createCustomerAddress, 
  type CustomerAddress 
} from "@/lib/api"
import { toast } from "sonner"

interface AddressStepProps {
  selectedAddress: CustomerAddress | null
  onSelectAddress: (address: CustomerAddress) => void
}

export function AddressStep({ selectedAddress, onSelectAddress }: AddressStepProps) {
  const { accessToken } = useCustomer()
  const [addresses, setAddresses] = useState<CustomerAddress[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSearchingCep, setIsSearchingCep] = useState(false)

  // Form state para novo endereco
  const [newAddress, setNewAddress] = useState({
    label: "",
    recipient_name: "",
    cep: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
  })

  // Carregar enderecos do usuario
  useEffect(() => {
    async function loadAddresses() {
      if (!accessToken) return

      setIsLoading(true)
      try {
        const response = await getCustomerAddresses(accessToken)
        if (response.data) {
          setAddresses(response.data)
          // Se nenhum endereco selecionado, selecionar o padrao ou o primeiro
          if (!selectedAddress && response.data.length > 0) {
            const defaultAddr = response.data.find(a => a.is_default) || response.data[0]
            onSelectAddress(defaultAddr)
          }
        }
      } catch (error) {
        console.error("Erro ao carregar enderecos:", error)
        toast.error("Erro ao carregar enderecos")
      } finally {
        setIsLoading(false)
      }
    }

    loadAddresses()
  }, [accessToken])

  // Buscar endereco pelo CEP
  async function searchCep(cep: string) {
    const cleanCep = cep.replace(/\D/g, "")
    if (cleanCep.length !== 8) return

    setIsSearchingCep(true)
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
      const data = await response.json()

      if (!data.erro) {
        setNewAddress(prev => ({
          ...prev,
          street: data.logradouro || "",
          neighborhood: data.bairro || "",
          city: data.localidade || "",
          state: data.uf || "",
        }))
      } else {
        toast.error("CEP nao encontrado")
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error)
    } finally {
      setIsSearchingCep(false)
    }
  }

  // Formatar CEP enquanto digita
  function formatCep(value: string) {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 5) return numbers
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`
  }

  // Salvar novo endereco
  async function handleSaveAddress(e: React.FormEvent) {
    e.preventDefault()
    if (!accessToken) return

    // Validacoes
    if (!newAddress.label || !newAddress.cep || !newAddress.street || 
        !newAddress.number || !newAddress.neighborhood || !newAddress.city || !newAddress.state) {
      toast.error("Preencha todos os campos obrigatorios")
      return
    }

    setIsSaving(true)
    try {
      const response = await createCustomerAddress(accessToken, {
        label: newAddress.label,
        recipient_name: newAddress.recipient_name,
        cep: newAddress.cep.replace(/\D/g, ""),
        street: newAddress.street,
        number: newAddress.number,
        complement: newAddress.complement || undefined,
        neighborhood: newAddress.neighborhood,
        city: newAddress.city,
        state: newAddress.state,
      })

      if (response.data) {
        setAddresses(prev => [...prev, response.data!])
        onSelectAddress(response.data)
        setIsDialogOpen(false)
        setNewAddress({
          label: "",
          recipient_name: "",
          cep: "",
          street: "",
          number: "",
          complement: "",
          neighborhood: "",
          city: "",
          state: "",
        })
        toast.success("Endereco adicionado com sucesso!")
      }
    } catch (error) {
      console.error("Erro ao salvar endereco:", error)
      toast.error("Erro ao salvar endereco")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Carregando enderecos...</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-2">Endereco de entrega</h2>
      <p className="text-muted-foreground mb-6">Selecione onde deseja receber seu pedido</p>

      <div className="grid gap-4">
        {addresses.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="p-6 text-center">
              <MapPin className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground mb-2">Voce ainda nao tem enderecos cadastrados</p>
              <p className="text-sm text-muted-foreground">Adicione um endereco para continuar</p>
            </CardContent>
          </Card>
        )}

        {addresses.map((address) => (
          <Card
            key={address.id}
            className={cn(
              "cursor-pointer transition-all duration-200 hover:border-primary/50",
              selectedAddress?.id === address.id && "border-primary ring-2 ring-primary/20"
            )}
            onClick={() => onSelectAddress(address)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full shrink-0",
                    selectedAddress?.id === address.id 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-secondary text-muted-foreground"
                  )}
                >
                  {selectedAddress?.id === address.id ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <MapPin className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{address.label}</h3>
                    {address.is_default && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        Padrao
                      </span>
                    )}
                  </div>
                  {address.recipient_name && (
                    <p className="text-sm text-foreground">{address.recipient_name}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {address.street}, {address.number}
                    {address.complement && ` - ${address.complement}`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {address.neighborhood} - {address.city}/{address.state}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    CEP: {address.cep.replace(/(\d{5})(\d{3})/, "$1-$2")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Adicionar novo endereco */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Card className="cursor-pointer border-dashed hover:border-primary/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary">
                    <Plus className="h-5 w-5" />
                  </div>
                  <span className="font-medium">Adicionar novo endereco</span>
                </div>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Novo endereco</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveAddress} className="grid gap-4 mt-4">
              <div className="grid gap-2">
                <Label htmlFor="label">Nome do endereco *</Label>
                <Input 
                  id="label" 
                  placeholder="Ex: Casa, Trabalho..." 
                  value={newAddress.label}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, label: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="recipient_name">Destinatario</Label>
                <Input 
                  id="recipient_name" 
                  placeholder="Nome de quem vai receber" 
                  value={newAddress.recipient_name}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, recipient_name: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 grid gap-2">
                  <Label htmlFor="cep">CEP *</Label>
                  <div className="relative">
                    <Input 
                      id="cep" 
                      placeholder="00000-000" 
                      value={newAddress.cep}
                      onChange={(e) => {
                        const formatted = formatCep(e.target.value)
                        setNewAddress(prev => ({ ...prev, cep: formatted }))
                        if (formatted.replace(/\D/g, "").length === 8) {
                          searchCep(formatted)
                        }
                      }}
                      maxLength={9}
                    />
                    {isSearchingCep && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="number">Numero *</Label>
                  <Input 
                    id="number" 
                    placeholder="123" 
                    value={newAddress.number}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, number: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="street">Rua *</Label>
                <Input 
                  id="street" 
                  placeholder="Nome da rua" 
                  value={newAddress.street}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, street: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="complement">Complemento</Label>
                  <Input 
                    id="complement" 
                    placeholder="Apto, sala..." 
                    value={newAddress.complement}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, complement: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="neighborhood">Bairro *</Label>
                  <Input 
                    id="neighborhood" 
                    placeholder="Bairro" 
                    value={newAddress.neighborhood}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, neighborhood: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="city">Cidade *</Label>
                  <Input 
                    id="city" 
                    placeholder="Cidade" 
                    value={newAddress.city}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="state">Estado *</Label>
                  <Input 
                    id="state" 
                    placeholder="UF" 
                    value={newAddress.state}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, state: e.target.value.toUpperCase() }))}
                    maxLength={2}
                  />
                </div>
              </div>
              <Button type="submit" className="mt-2" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar endereco"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
