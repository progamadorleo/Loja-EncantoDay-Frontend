"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function CadastroRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/"

  useEffect(() => {
    // Redireciona para a pagina de login com a tab de cadastro ativa
    router.replace(`/conta/login?tab=register${redirect !== "/" ? `&redirect=${encodeURIComponent(redirect)}` : ""}`)
  }, [redirect, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}
