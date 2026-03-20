"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  ArrowLeft, 
  Loader2, 
  Plus, 
  MapPin, 
  Star, 
  Pencil, 
  Trash2,
  AlertCircle,
  Search
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Header } from "@/components/header"
import { StoreFooter } from "@/components/store-footer"
import { useCustomer } from "@/contexts/customer-context"
import { 
  getCustomerAddresses, 
  createCustomerAddress, 
  updateCustomerAddress,
  deleteCustomerAddress,
  setDefaultAddress,
  validateCep,
  type CustomerAddress 
} from "@/lib/api"

export default function CustomerAddressesPage() {
  const router = useRouter()
  const { accessToken, isAuthenticated, isLoading: authLoading } = useCustomer()

  const [addresses, setAddresses] = useState<CustomerAddress[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingCep, setIsLoadingCep] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cepError, setCepError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    label: "Casa",
    cep: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
  })

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/conta/login?redirect=/conta/enderecos")
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (accessToken) {
      loadAddresses()
    }
  }, [accessToken])

  async function loadAddresses() {
    if (!accessToken) return
    
    try {
      const response = await getCustomerAddresses(accessToken)
      if (response.success && response.data) {
        setAddresses(response.data)
      }
    } catch (err) {
      console.error("Error loading addresses:", err)
    } finally {
      setIsLoading(false)
    }
  }

  function resetForm() {
    setFormData({
      label: "Casa",
      cep: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
    })
    setCepError(null)
  }

  function formatCep(value: string) {
    const numbers = value.replace(/\D/g, "")
    return numbers.replace(/(\d{5})(\d)/, "$1-$2").slice(0, 9)
  }

  async function handleCepSearch() {
    if (!accessToken) return
    
    const cep = formData.cep.replace(/\D/g, "")
    if (cep.length !== 8) {
      setCepError("CEP deve ter 8 digitos")
      return
    }

    setIsLoadingCep(true)
    setCepError(null)

    try {
      const response = await validateCep(accessToken, cep)
      
      if (response.success && response.data) {
        setFormData(prev => ({
          ...prev,
          street: response.data!.street || prev.street,
          neighborhood: response.data!.neighborhood || prev.neighborhood,
          city: response.data!.city || prev.city,
          state: response.data!.state || prev.state,
        }))
      } else {
        setCepError(response.message || "CEP nao encontrado")
      }
    } catch (err) {
      setCepError(err instanceof Error ? err.message : "Erro ao buscar CEP")
    } finally {
      setIsLoadingCep(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!accessToken) return

    setIsSaving(true)
    setError(null)

    try {
      if (isEditing) {
        const response = await updateCustomerAddress(accessToken, isEditing, formData)
        if (response.success) {
          await loadAddresses()
          setIsEditing(null)
          resetForm()
        } else {
          setError(response.message || "Erro ao atualizar endereco")
        }
      } else {
        const response = await createCustomerAddress(accessToken, formData)
        if (response.success) {
          await loadAddresses()
          setIsAdding(false)
          resetForm()
        } else {
          setError(response.message || "Erro ao criar endereco")
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar endereco")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!accessToken) return
    if (!confirm("Tem certeza que deseja excluir este endereco?")) return

    try {
      const response = await deleteCustomerAddress(accessToken, id)
      if (response.success) {
        await loadAddresses()
      }
    } catch (err) {
      console.error("Error deleting address:", err)
    }
  }

  async function handleSetDefault(id: string) {
    if (!accessToken) return

    try {
      const response = await setDefaultAddress(accessToken, id)
      if (response.success) {
        await loadAddresses()
      }
    } catch (err) {
      console.error("Error setting default:", err)
    }
  }

  function startEdit(address: CustomerAddress) {
    setFormData({
      label: address.label,
      cep: formatCep(address.cep),
      street: address.street,
      number: address.number,
      complement: address.complement || "",
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state,
    })
    setIsEditing(address.id)
    setIsAdding(false)
    setCepError(null)
    setError(null)
  }

  function cancelEdit() {
    setIsEditing(null)
    setIsAdding(false)
    resetForm()
    setError(null)
  }

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const showForm = isAdding || isEditing

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-6 pb-16">
        <div className="mx-auto max-w-2xl px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link
                href="/conta"
                className="w-10 h-10 rounded-xl bg-card border flex items-center justify-center hover:border-primary/30 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Enderecos</h1>
                <p className="text-muted-foreground">Gerencie seus enderecos de entrega</p>
              </div>
            </div>
            {!showForm && addresses.length < 5 && (
              <Button 
                onClick={() => { setIsAdding(true); resetForm(); setError(null); }}
                className="rounded-xl"
              >
                <Plus className="h-5 w-5 mr-2" />
                Adicionar
              </Button>
            )}
          </div>

          {/* Aviso de Goiania */}
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-600">Entregamos apenas em Goiania</p>
              <p className="text-sm text-amber-600/80">
                No momento, realizamos entregas apenas na cidade de Goiania-GO (CEPs iniciados com 74).
              </p>
            </div>
          </div>

          {/* Formulário */}
          {showForm && (
            <form onSubmit={handleSubmit} className="bg-card rounded-xl border p-6 mb-6">
              <h2 className="text-lg font-semibold mb-6">
                {isEditing ? "Editar endereco" : "Novo endereco"}
              </h2>

              {error && (
                <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Identificacao
                  </label>
                  <div className="flex gap-2">
                    {["Casa", "Trabalho", "Outro"].map((label) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, label }))}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          formData.label === label
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted hover:bg-muted/80"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="cep" className="block text-sm font-medium text-foreground mb-2">
                    CEP
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="cep"
                      value={formData.cep}
                      onChange={(e) => setFormData(prev => ({ ...prev, cep: formatCep(e.target.value) }))}
                      placeholder="74000-000"
                      className="h-12 rounded-xl flex-1"
                      required
                      disabled={isSaving}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="h-12 px-4 rounded-xl"
                      onClick={handleCepSearch}
                      disabled={isLoadingCep || isSaving}
                    >
                      {isLoadingCep ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Search className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                  {cepError && (
                    <p className="mt-1 text-sm text-destructive">{cepError}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="street" className="block text-sm font-medium text-foreground mb-2">
                    Rua
                  </label>
                  <Input
                    id="street"
                    value={formData.street}
                    onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                    className="h-12 rounded-xl"
                    required
                    disabled={isSaving}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="number" className="block text-sm font-medium text-foreground mb-2">
                      Numero
                    </label>
                    <Input
                      id="number"
                      value={formData.number}
                      onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
                      className="h-12 rounded-xl"
                      required
                      disabled={isSaving}
                    />
                  </div>
                  <div>
                    <label htmlFor="complement" className="block text-sm font-medium text-foreground mb-2">
                      Complemento
                    </label>
                    <Input
                      id="complement"
                      value={formData.complement}
                      onChange={(e) => setFormData(prev => ({ ...prev, complement: e.target.value }))}
                      placeholder="Apto, Bloco..."
                      className="h-12 rounded-xl"
                      disabled={isSaving}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="neighborhood" className="block text-sm font-medium text-foreground mb-2">
                    Bairro
                  </label>
                  <Input
                    id="neighborhood"
                    value={formData.neighborhood}
                    onChange={(e) => setFormData(prev => ({ ...prev, neighborhood: e.target.value }))}
                    className="h-12 rounded-xl"
                    required
                    disabled={isSaving}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label htmlFor="city" className="block text-sm font-medium text-foreground mb-2">
                      Cidade
                    </label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      className="h-12 rounded-xl"
                      required
                      disabled={isSaving}
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-foreground mb-2">
                      UF
                    </label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value.toUpperCase().slice(0, 2) }))}
                      className="h-12 rounded-xl"
                      required
                      disabled={isSaving}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-12 rounded-xl"
                    onClick={cancelEdit}
                    disabled={isSaving}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-12 rounded-xl"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      "Salvar"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          )}

          {/* Lista de endereços */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : addresses.length === 0 && !showForm ? (
            <div className="text-center py-12 bg-card rounded-xl border">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Nenhum endereco cadastrado
              </h3>
              <p className="text-muted-foreground mb-6">
                Adicione um endereco para facilitar suas compras
              </p>
              <Button onClick={() => setIsAdding(true)} className="rounded-xl">
                <Plus className="h-5 w-5 mr-2" />
                Adicionar endereco
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className={`bg-card rounded-xl border p-4 ${
                    address.is_default ? "border-primary/50 bg-primary/5" : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{address.label}</span>
                      {address.is_default && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                          <Star className="h-3 w-3" />
                          Padrao
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {!address.is_default && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-muted-foreground hover:text-primary"
                          onClick={() => handleSetDefault(address.id)}
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-muted-foreground hover:text-primary"
                        onClick={() => startEdit(address)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(address.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-foreground">
                    {address.street}, {address.number}
                    {address.complement && ` - ${address.complement}`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {address.neighborhood} - {address.city}/{address.state}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    CEP: {address.cep}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <StoreFooter />
    </div>
  )
}
