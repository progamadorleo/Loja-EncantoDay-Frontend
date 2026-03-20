import Link from "next/link"
import { Instagram, CreditCard, Smartphone } from "lucide-react"

export function StoreFooter() {
  return (
    <footer className="bg-foreground text-background">
      {/* Instagram CTA */}
      <div className="bg-primary py-8 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h3 className="text-xl font-bold text-primary-foreground md:text-2xl animate-fade-in-up">
            Receba ofertas exclusivas!
          </h3>
          <p className="mt-2 text-sm text-primary-foreground/80 animate-fade-in-up animation-delay-100">
            Siga nosso Instagram e fique por dentro das novidades
          </p>
          <a
            href="https://instagram.com/encanto_day_"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-foreground px-8 py-3 text-sm font-semibold text-background transition-all duration-300 hover:bg-foreground/90 hover:scale-105 hover:shadow-lg animate-fade-in-up animation-delay-200"
          >
            <Instagram className="h-5 w-5" />
            @encanto_day_
          </a>
        </div>
      </div>

      {/* Links */}
      <div className="py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="animate-fade-in-up animation-delay-100">
              <h4 className="font-bold text-background mb-4">Institucional</h4>
              <ul className="space-y-2 text-sm text-background/70">
                <li><Link href="/sobre" className="hover:text-background hover:translate-x-1 inline-block transition-all duration-200">Sobre Nos</Link></li>
              </ul>
            </div>
            <div className="animate-fade-in-up animation-delay-200">
              <h4 className="font-bold text-background mb-4">Ajuda</h4>
              <ul className="space-y-2 text-sm text-background/70">
                <li><Link href="/faq" className="hover:text-background hover:translate-x-1 inline-block transition-all duration-200">Perguntas Frequentes</Link></li>
                <li><Link href="/contato" className="hover:text-background hover:translate-x-1 inline-block transition-all duration-200">Fale Conosco</Link></li>
              </ul>
            </div>
            <div className="animate-fade-in-up animation-delay-300">
              <h4 className="font-bold text-background mb-4">Minha Conta</h4>
              <ul className="space-y-2 text-sm text-background/70">
                <li><Link href="/conta/login" className="hover:text-background hover:translate-x-1 inline-block transition-all duration-200">Entrar</Link></li>
                <li><Link href="/conta/cadastro" className="hover:text-background hover:translate-x-1 inline-block transition-all duration-200">Cadastrar</Link></li>
                <li><Link href="/conta" className="hover:text-background hover:translate-x-1 inline-block transition-all duration-200">Meus Pedidos</Link></li>
                <li><Link href="/conta/favoritos" className="hover:text-background hover:translate-x-1 inline-block transition-all duration-200">Favoritos</Link></li>
              </ul>
            </div>
            <div className="animate-fade-in-up animation-delay-400">
              <h4 className="font-bold text-background mb-4">Redes Sociais</h4>
              <div className="flex gap-3">
                <a
                  href="https://instagram.com/encanto_day_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center transition-all duration-300 hover:bg-primary hover:scale-110 hover:rotate-6"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
              <h4 className="font-bold text-background mt-6 mb-3">Formas de Pagamento</h4>
              <div className="flex flex-wrap gap-2">
                <div className="h-8 w-12 rounded bg-background/10 flex items-center justify-center transition-all duration-200 hover:bg-background/20 hover:scale-105">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div className="h-8 w-12 rounded bg-background/10 flex items-center justify-center text-[10px] font-bold transition-all duration-200 hover:bg-background/20 hover:scale-105">
                  PIX
                </div>
                <div className="h-8 w-12 rounded bg-background/10 flex items-center justify-center transition-all duration-200 hover:bg-background/20 hover:scale-105">
                  <Smartphone className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-background/10 py-6">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-background/50">
          <p className="animate-fade-in">Encanto Day. Todos os direitos reservados.</p>
          <p className="mt-3 text-xs text-background/30 animate-fade-in animation-delay-200">
            Desenvolvido por{" "}
            <a
              href="https://instagram.com/ls_dev"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-background/50 transition-all duration-200 hover:underline"
            >
              LS STUDIO
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
