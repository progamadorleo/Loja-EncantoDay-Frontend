import { Header } from "@/components/header"
import { StoreFooter } from "@/components/store-footer"
import { Heart, Sparkles, Truck, ShieldCheck } from "lucide-react"

export default function SobrePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative py-16 md:py-24 bg-gradient-to-b from-primary/5 to-background">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <h1 className="text-3xl font-bold text-foreground md:text-5xl">
              Sobre a <span className="text-primary">Encanto Day</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Somos apaixonados por realçar a beleza única de cada pessoa.
              Nossa missão é oferecer produtos de qualidade que fazem você se sentir incrível todos os dias.
            </p>
          </div>
        </section>

        {/* Nossa Historia */}
        <section className="py-16">
          <div className="mx-auto max-w-4xl px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  Nossa Historia
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    A Encanto Day nasceu do sonho de tornar a beleza acessível a todas as mulheres.
                    Acreditamos que cada pessoa merece se sentir confiante e radiante.
                  </p>
                  <p>
                    Selecionamos cuidadosamente cada produto do nosso catálogo,
                    priorizando qualidade, tendencias e o melhor custo-beneficio para nossas clientes.
                  </p>
                  <p>
                    Mais do que uma loja, somos uma comunidade de mulheres que celebram
                    a autoestima e o amor proprio atraves do autocuidado.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-pink-200/20 flex items-center justify-center">
                  <Heart className="h-32 w-32 text-primary/30" />
                </div>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-10 w-10 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Nossos Valores */}
        <section className="py-16 bg-secondary/30">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="text-2xl font-bold text-foreground text-center mb-12">
              Nossos Valores
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Amor ao Cliente</h3>
                <p className="text-sm text-muted-foreground">
                  Cada cliente é especial. Tratamos todas com carinho e atenção personalizada.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Qualidade Garantida</h3>
                <p className="text-sm text-muted-foreground">
                  Selecionamos apenas produtos de marcas confiáveis e com qualidade comprovada.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Truck className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Entrega Rápida</h3>
                <p className="text-sm text-muted-foreground">
                  Trabalhamos para que seus produtos cheguem o mais rápido possível.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Faça Parte da Nossa Comunidade
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Siga-nos nas redes sociais para ficar por dentro das novidades,
              dicas de beleza e promoções exclusivas.
            </p>
            <a
              href="https://instagram.com/encanto_day_"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 via-rose-500 to-orange-400 text-white px-8 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              @encanto_day_
            </a>
          </div>
        </section>
      </main>

      <StoreFooter />
    </div>
  )
}
