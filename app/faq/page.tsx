import { Header } from "@/components/header"
import { StoreFooter } from "@/components/store-footer"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqItems = [
  {
    question: "Como faço para comprar?",
    answer: "Para comprar, basta navegar pelos nossos produtos, adicionar ao carrinho e finalizar a compra. Aceitamos PIX, cartão de crédito e débito. Após a confirmação do pagamento, você receberá um e-mail com todos os detalhes do pedido."
  },
  {
    question: "Qual o prazo de entrega?",
    answer: "O prazo de entrega varia de acordo com a sua região. Após a postagem, você receberá o código de rastreio para acompanhar sua encomenda. Em média, as entregas são realizadas entre 5 a 15 dias úteis."
  },
  {
    question: "Os produtos são originais?",
    answer: "Sim! Todos os nossos produtos são 100% originais e de alta qualidade. Trabalhamos apenas com marcas confiáveis para garantir a melhor experiência para você."
  },
  {
    question: "Posso cancelar meu pedido?",
    answer: "Sim, você pode solicitar o cancelamento do pedido antes do envio. Após o envio, não é possível cancelar, mas você pode recusar a entrega ou solicitar a devolução após receber o produto."
  },
  {
    question: "Como funciona a troca ou devolução?",
    answer: "Se você não ficou satisfeita com o produto, entre em contato conosco pelo Instagram em até 7 dias após o recebimento. Analisaremos cada caso individualmente para encontrar a melhor solução."
  },
  {
    question: "Vocês têm loja física?",
    answer: "No momento, trabalhamos apenas com vendas online através do nosso site e Instagram. Isso nos permite oferecer os melhores preços e atendimento personalizado para você."
  },
  {
    question: "Como sei qual tom é ideal para mim?",
    answer: "Temos descrições detalhadas de cada produto com informações sobre tons e subtons. Se ainda tiver dúvidas, entre em contato pelo nosso Instagram que teremos prazer em ajudar você a escolher o produto ideal!"
  },
  {
    question: "Os produtos são testados em animais?",
    answer: "Não! Trabalhamos apenas com marcas cruelty-free, que não realizam testes em animais. A beleza deve ser livre de crueldade."
  },
]

export default function FaqPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-12">
        <div className="mx-auto max-w-3xl px-4">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-foreground md:text-4xl">
              Perguntas Frequentes
            </h1>
            <p className="mt-3 text-muted-foreground">
              Tire suas dúvidas sobre nossos produtos e serviços
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-3">
            {faqItems.map((item, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border border-border rounded-xl px-6 data-[state=open]:bg-secondary/50"
              >
                <AccordionTrigger className="text-left font-semibold hover:text-primary hover:no-underline py-5">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-12 text-center p-8 bg-secondary/50 rounded-2xl">
            <h2 className="text-xl font-semibold text-foreground">
              Ainda tem dúvidas?
            </h2>
            <p className="mt-2 text-muted-foreground">
              Entre em contato conosco que teremos prazer em ajudar!
            </p>
            <a 
              href="/contato"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Fale Conosco
            </a>
          </div>
        </div>
      </main>

      <StoreFooter />
    </div>
  )
}
