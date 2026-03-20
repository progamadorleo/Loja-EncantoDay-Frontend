"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2, Save, Eye, EyeOff, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Header } from "@/components/header"
import { StoreFooter } from "@/components/store-footer"
import { useCustomer } from "@/contexts/customer-context"
import { updateCustomerProfile, changeCustomerPassword } from "@/lib/api"

export default function CustomerDataPage() {
  const router = useRouter()
  const { customer, accessToken, isAuthenticated, isLoading, refreshProfile } = useCustomer()

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    cpf: "",
    birth_date: "",
    accepts_marketing: false,
  })
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  })
  const [showPasswords, setShowPasswords] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/conta/login?redirect=/conta/dados")
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || "",
        phone: formatPhone(customer.phone || ""),
        cpf: formatCpf(customer.cpf || ""),
        birth_date: customer.birth_date || "",
        accepts_marketing: customer.accepts_marketing || false,
      })
    }
  }, [customer])

  function formatPhone(value: string) {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2")
        .replace(/(-\d{4})\d+?$/, "$1")
    }
    return value.slice(0, 15)
  }

  function formatCpf(value: string) {
    const numbers = value.replace(/\D/g, "")
    return numbers
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1")
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target

    if (name === "phone") {
      setFormData((prev) => ({ ...prev, phone: formatPhone(value) }))
    } else if (name === "cpf") {
      setFormData((prev) => ({ ...prev, cpf: formatCpf(value) }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!accessToken) return

    setIsSaving(true)
    setMessage(null)

    try {
      const response = await updateCustomerProfile(accessToken, {
        name: formData.name,
        phone: formData.phone.replace(/\D/g, ""),
        cpf: formData.cpf.replace(/\D/g, "") || undefined,
        birth_date: formData.birth_date || undefined,
        accepts_marketing: formData.accepts_marketing,
      })

      if (response.success) {
        await refreshProfile()
        setMessage({ type: "success", text: "Dados atualizados com sucesso!" })
      } else {
        setMessage({ type: "error", text: response.message || "Erro ao atualizar dados" })
      }
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Erro ao atualizar dados" })
    } finally {
      setIsSaving(false)
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (!accessToken) return

    setPasswordMessage(null)

    if (passwords.new.length < 6) {
      setPasswordMessage({ type: "error", text: "A nova senha deve ter pelo menos 6 caracteres" })
      return
    }

    if (passwords.new !== passwords.confirm) {
      setPasswordMessage({ type: "error", text: "As senhas nao coincidem" })
      return
    }

    setIsChangingPassword(true)

    try {
      const response = await changeCustomerPassword(accessToken, passwords.current, passwords.new)

      if (response.success) {
        setPasswordMessage({ type: "success", text: "Senha alterada com sucesso!" })
        setPasswords({ current: "", new: "", confirm: "" })
      } else {
        setPasswordMessage({ type: "error", text: response.message || "Erro ao alterar senha" })
      }
    } catch (error) {
      setPasswordMessage({ type: "error", text: error instanceof Error ? error.message : "Erro ao alterar senha" })
    } finally {
      setIsChangingPassword(false)
    }
  }

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-6 pb-16">
        <div className="mx-auto max-w-2xl px-4">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link
              href="/conta"
              className="w-10 h-10 rounded-xl bg-card border flex items-center justify-center hover:border-primary/30 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Meus dados</h1>
              <p className="text-muted-foreground">Gerencie suas informacoes pessoais</p>
            </div>
          </div>

          {/* Formulário de dados */}
          <form onSubmit={handleSubmit} className="bg-card rounded-xl border p-6 mb-6">
            <h2 className="text-lg font-semibold mb-6">Informacoes pessoais</h2>

            {message && (
              <div
                className={`mb-6 p-4 rounded-xl text-sm ${
                  message.type === "success"
                    ? "bg-green-500/10 border border-green-500/20 text-green-600"
                    : "bg-destructive/10 border border-destructive/20 text-destructive"
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                  Nome completo
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="h-12 rounded-xl"
                  required
                  disabled={isSaving}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email
                </label>
                <Input
                  id="email"
                  value={customer?.email || ""}
                  className="h-12 rounded-xl bg-muted"
                  disabled
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  O email nao pode ser alterado
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                    Telefone / WhatsApp
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(62) 99999-9999"
                    className="h-12 rounded-xl"
                    disabled={isSaving}
                  />
                </div>

                <div>
                  <label htmlFor="cpf" className="block text-sm font-medium text-foreground mb-2">
                    CPF (opcional)
                  </label>
                  <Input
                    id="cpf"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleChange}
                    placeholder="000.000.000-00"
                    className="h-12 rounded-xl"
                    disabled={isSaving}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="birth_date" className="block text-sm font-medium text-foreground mb-2">
                  Data de nascimento (opcional)
                </label>
                <Input
                  id="birth_date"
                  name="birth_date"
                  type="date"
                  value={formData.birth_date}
                  onChange={handleChange}
                  className="h-12 rounded-xl"
                  disabled={isSaving}
                />
              </div>

              <div className="flex items-start gap-3 pt-2">
                <Checkbox
                  id="accepts_marketing"
                  checked={formData.accepts_marketing}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, accepts_marketing: checked as boolean }))
                  }
                  disabled={isSaving}
                />
                <label htmlFor="accepts_marketing" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                  Quero receber novidades e ofertas exclusivas por email
                </label>
              </div>

              <Button type="submit" className="w-full h-12 rounded-xl" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" />
                    Salvar alteracoes
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Formulário de senha */}
          <form onSubmit={handleChangePassword} className="bg-card rounded-xl border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold">Alterar senha</h2>
            </div>

            {passwordMessage && (
              <div
                className={`mb-6 p-4 rounded-xl text-sm ${
                  passwordMessage.type === "success"
                    ? "bg-green-500/10 border border-green-500/20 text-green-600"
                    : "bg-destructive/10 border border-destructive/20 text-destructive"
                }`}
              >
                {passwordMessage.text}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label htmlFor="current_password" className="block text-sm font-medium text-foreground mb-2">
                  Senha atual
                </label>
                <div className="relative">
                  <Input
                    id="current_password"
                    type={showPasswords ? "text" : "password"}
                    value={passwords.current}
                    onChange={(e) => setPasswords((prev) => ({ ...prev, current: e.target.value }))}
                    className="h-12 rounded-xl pr-12"
                    required
                    disabled={isChangingPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPasswords ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="new_password" className="block text-sm font-medium text-foreground mb-2">
                  Nova senha
                </label>
                <Input
                  id="new_password"
                  type={showPasswords ? "text" : "password"}
                  value={passwords.new}
                  onChange={(e) => setPasswords((prev) => ({ ...prev, new: e.target.value }))}
                  placeholder="Minimo 6 caracteres"
                  className="h-12 rounded-xl"
                  required
                  disabled={isChangingPassword}
                />
              </div>

              <div>
                <label htmlFor="confirm_password" className="block text-sm font-medium text-foreground mb-2">
                  Confirmar nova senha
                </label>
                <Input
                  id="confirm_password"
                  type={showPasswords ? "text" : "password"}
                  value={passwords.confirm}
                  onChange={(e) => setPasswords((prev) => ({ ...prev, confirm: e.target.value }))}
                  className="h-12 rounded-xl"
                  required
                  disabled={isChangingPassword}
                />
              </div>

              <Button
                type="submit"
                variant="outline"
                className="w-full h-12 rounded-xl"
                disabled={isChangingPassword}
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Alterando...
                  </>
                ) : (
                  "Alterar senha"
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>

      <StoreFooter />
    </div>
  )
}
