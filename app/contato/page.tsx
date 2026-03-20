import { Header } from "@/components/header"
import { StoreFooter } from "@/components/store-footer"
import { Instagram, MessageCircle, Mail, Clock } from "lucide-react"

export default function ContatoPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-12">
        <div className="mx-auto max-w-3xl px-4">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-foreground md:text-4xl">
              Fale Conosco
            </h1>
            <p className="mt-3 text-muted-foreground">
              Estamos aqui para ajudar! Escolha a melhor forma de entrar em contato.
            </p>
          </div>

          {/* Cards de contato */}
          <div className="space-y-4 max-w-lg mx-auto">
            {/* Instagram */}
            <a
              href="https://instagram.com/encanto_day_"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 p-5 rounded-xl border border-border bg-card hover:border-primary hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 via-rose-500 to-orange-400 flex items-center justify-center shrink-0">
                <Instagram className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  Instagram
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  @encanto_day_
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Resposta em ate 24 horas
                </p>
              </div>
            </a>

            {/* WhatsApp */}
            <a
              href="https://wa.me/5500000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 p-5 rounded-xl border border-border bg-card hover:border-primary hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shrink-0">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  WhatsApp
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  (00) 00000-0000
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Atendimento rapido e direto
                </p>
              </div>
            </a>

            {/* E-mail */}
            <a
              href="mailto:contato@encantoday.com.br"
              className="flex items-start gap-4 p-5 rounded-xl border border-border bg-card hover:border-primary hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-pink-600 flex items-center justify-center shrink-0">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  E-mail
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  contato@encantoday.com.br
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Resposta em ate 48 horas
                </p>
              </div>
            </a>

            {/* Horario */}
            <div className="flex items-start gap-4 p-5 rounded-xl bg-secondary/50">
              <div className="w-12 h-12 rounded-full bg-foreground/10 flex items-center justify-center shrink-0">
                <Clock className="h-6 w-6 text-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  Horario de Atendimento
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Segunda a Sexta: 9h as 18h
                </p>
                <p className="text-sm text-muted-foreground">
                  Sabado: 9h as 13h
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <StoreFooter />
    </div>
  )
}
