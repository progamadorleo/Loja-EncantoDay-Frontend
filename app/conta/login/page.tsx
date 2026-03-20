"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Eye, EyeOff, Loader2, ArrowLeft, Truck, Shield, Gift, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { useCustomer } from "@/contexts/customer-context"

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/"
  const defaultTab = searchParams.get("tab") || "login"
  const { login, register, isAuthenticated, isLoading: isAuthLoading } = useCustomer()
  
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Login form
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  // Register form
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    accepts_marketing: false,
  })

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      router.push(redirect)
    }
  }, [isAuthenticated, isAuthLoading, redirect, router])

  if (isAuthLoading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const result = await login(loginEmail, loginPassword)

    if (result.success) {
      router.push(redirect)
    } else {
      setError(result.message || "Erro ao fazer login")
      setIsLoading(false)
    }
  }

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

  function handleRegisterChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    if (name === "phone") {
      setRegisterData(prev => ({ ...prev, phone: formatPhone(value) }))
    } else {
      setRegisterData(prev => ({ ...prev, [name]: value }))
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (registerData.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres")
      return
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError("As senhas nao coincidem")
      return
    }

    const phoneNumbers = registerData.phone.replace(/\D/g, "")
    if (phoneNumbers.length < 10 || phoneNumbers.length > 11) {
      setError("Telefone invalido")
      return
    }

    setIsLoading(true)

    const result = await register({
      name: registerData.name,
      email: registerData.email,
      password: registerData.password,
      phone: phoneNumbers,
      accepts_marketing: registerData.accepts_marketing,
    })

    if (result.success) {
      router.push(redirect)
    } else {
      setError(result.message || "Erro ao criar conta")
      setIsLoading(false)
    }
  }

  const passwordStrength = () => {
    const pwd = registerData.password
    if (pwd.length === 0) return { level: 0, text: "", color: "" }
    if (pwd.length < 6) return { level: 1, text: "Fraca", color: "bg-red-500" }
    if (pwd.length < 8) return { level: 2, text: "Media", color: "bg-yellow-500" }
    if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(pwd)) return { level: 4, text: "Forte", color: "bg-green-500" }
    return { level: 3, text: "Boa", color: "bg-blue-500" }
  }

  const strength = passwordStrength()

  const benefits = [
    { icon: Star, title: "Lista de Desejos", desc: "Salve seus favoritos" },
    { icon: Truck, title: "Rastreio Facil", desc: "Acompanhe suas entregas" },
    { icon: Shield, title: "Compra Segura", desc: "Pagamento protegido" },
    { icon: Gift, title: "Ofertas Exclusivas", desc: "Descontos especiais" },
  ]

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* Lado esquerdo - Banner/Imagem */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-gradient-to-br from-rose-100 via-pink-50 to-rose-50">
        {/* Pattern decorativo */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-between w-full p-12">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt="Encanto Day"
              width={48}
              height={48}
              className="rounded-2xl"
            />
            <span className="text-2xl font-bold text-foreground font-serif">Encanto Day</span>
          </Link>
          
          {/* Conteudo central */}
          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight font-serif">
              Sua beleza,<br />
              <span className="text-primary">nosso encanto.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-md">
              Entre na sua conta e descubra os melhores produtos de beleza 
              com precos incriveis e entrega rapida.
            </p>

            {/* Beneficios */}
            <div className="mt-12 grid grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/80 shadow-sm"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <benefit.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{benefit.title}</p>
                    <p className="text-xs text-muted-foreground">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rodape */}
          <p className="text-sm text-muted-foreground">
            Encanto Day - Todos os direitos reservados
          </p>
        </div>
      </div>

      {/* Lado direito - Formulario */}
      <div className="flex-1 flex flex-col min-h-screen lg:min-h-0">
        {/* Header mobile */}
        <div className="p-4 lg:p-6 flex items-center justify-between">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Voltar para a loja</span>
          </Link>

          {/* Logo mobile */}
          <Link href="/" className="lg:hidden flex items-center gap-2">
            <Image
              src="/images/logo.png"
              alt="Encanto Day"
              width={32}
              height={32}
              className="rounded-xl"
            />
            <span className="font-bold text-foreground font-serif">Encanto Day</span>
          </Link>

          <div className="w-20" /> {/* Spacer para centralizar logo */}
        </div>

        {/* Formulario */}
        <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
          <div className="w-full max-w-md">
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-14 p-1.5 bg-muted/50 rounded-2xl mb-8">
                <TabsTrigger 
                  value="login" 
                  className="rounded-xl h-full text-base font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Entrar
                </TabsTrigger>
                <TabsTrigger 
                  value="register" 
                  className="rounded-xl h-full text-base font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  Criar conta
                </TabsTrigger>
              </TabsList>

              {error && (
                <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm animate-in fade-in slide-in-from-top-2">
                  {error}
                </div>
              )}

              {/* Login */}
              <TabsContent value="login" className="mt-0">
                <div className="text-center mb-8">
                  <h2 className="text-2xl lg:text-3xl font-bold text-foreground">Bem-vinda de volta!</h2>
                  <p className="mt-2 text-muted-foreground">
                    Entre na sua conta para continuar
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label htmlFor="login-email" className="block text-sm font-medium text-foreground mb-2">
                      Email
                    </label>
                    <Input
                      id="login-email"
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="h-12 rounded-xl bg-muted/30 border-muted focus:bg-background transition-colors"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label htmlFor="login-password" className="block text-sm font-medium text-foreground">
                        Senha
                      </label>
                      <Link 
                        href="/conta/recuperar-senha" 
                        className="text-sm text-primary hover:underline"
                      >
                        Esqueceu?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Sua senha"
                        className="h-12 rounded-xl bg-muted/30 border-muted focus:bg-background transition-colors pr-12"
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 rounded-xl text-base font-medium shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      "Entrar"
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Register */}
              <TabsContent value="register" className="mt-0">
                <div className="text-center mb-8">
                  <h2 className="text-2xl lg:text-3xl font-bold text-foreground">Crie sua conta</h2>
                  <p className="mt-2 text-muted-foreground">
                    E rapido e facil, vamos comecar!
                  </p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                      Nome completo
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={registerData.name}
                      onChange={handleRegisterChange}
                      placeholder="Seu nome"
                      className="h-12 rounded-xl bg-muted/30 border-muted focus:bg-background transition-colors"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="register-email" className="block text-sm font-medium text-foreground mb-2">
                        Email
                      </label>
                      <Input
                        id="register-email"
                        name="email"
                        type="email"
                        value={registerData.email}
                        onChange={handleRegisterChange}
                        placeholder="seu@email.com"
                        className="h-12 rounded-xl bg-muted/30 border-muted focus:bg-background transition-colors"
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                        WhatsApp
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={registerData.phone}
                        onChange={handleRegisterChange}
                        placeholder="(00) 00000-0000"
                        className="h-12 rounded-xl bg-muted/30 border-muted focus:bg-background transition-colors"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="register-password" className="block text-sm font-medium text-foreground mb-2">
                        Senha
                      </label>
                      <div className="relative">
                        <Input
                          id="register-password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={registerData.password}
                          onChange={handleRegisterChange}
                          placeholder="Min. 6 caracteres"
                          className="h-12 rounded-xl bg-muted/30 border-muted focus:bg-background transition-colors pr-12"
                          required
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {registerData.password && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${strength.color} transition-all`}
                              style={{ width: `${strength.level * 25}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{strength.text}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                        Confirmar senha
                      </label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        value={registerData.confirmPassword}
                        onChange={handleRegisterChange}
                        placeholder="Repita a senha"
                        className="h-12 rounded-xl bg-muted/30 border-muted focus:bg-background transition-colors"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-3 pt-2">
                    <Checkbox
                      id="accepts_marketing"
                      checked={registerData.accepts_marketing}
                      onCheckedChange={(checked) => 
                        setRegisterData(prev => ({ ...prev, accepts_marketing: checked as boolean }))
                      }
                      disabled={isLoading}
                      className="mt-0.5"
                    />
                    <label htmlFor="accepts_marketing" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                      Quero receber novidades e ofertas exclusivas
                    </label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 rounded-xl text-base font-medium shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Criando conta...
                      </>
                    ) : (
                      "Criar conta"
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground pt-2">
                    Ao criar uma conta, voce concorda com nossos{" "}
                    <Link href="/termos" className="text-primary hover:underline">
                      Termos
                    </Link>{" "}
                    e{" "}
                    <Link href="/privacidade" className="text-primary hover:underline">
                      Privacidade
                    </Link>
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
