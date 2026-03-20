import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, Search, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        {/* Numero 404 estilizado */}
        <div className="relative mb-8">
          <h1 className="text-[150px] md:text-[200px] font-bold text-primary/10 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Search className="h-10 w-10 text-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Texto */}
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          Ops! Pagina nao encontrada
        </h2>
        <p className="text-muted-foreground mb-8">
          A pagina que voce esta procurando pode ter sido removida, teve seu nome alterado ou esta temporariamente indisponivel.
        </p>

        {/* Botoes */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="javascript:history.back()">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <Button asChild className="rounded-full">
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Ir para Home
            </Link>
          </Button>
        </div>

        {/* Links uteis */}
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground mb-4">Talvez voce esteja procurando:</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/produtos" className="text-sm text-primary hover:underline">
              Produtos
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/conta" className="text-sm text-primary hover:underline">
              Minha Conta
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/contato" className="text-sm text-primary hover:underline">
              Contato
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
