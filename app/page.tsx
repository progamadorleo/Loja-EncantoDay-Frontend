import { Header } from "@/components/header"
import { PromoBanner } from "@/components/promo-banner"
import { CategoryStrip } from "@/components/category-strip"
import { ProductGrid } from "@/components/product-grid"
import { FeaturedProduct } from "@/components/featured-product"
import { StoreFooter } from "@/components/store-footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <PromoBanner />
        <CategoryStrip />
        <ProductGrid title="queridinhos da Encanto Day" featured limit={4} />
        <FeaturedProduct />
        <ProductGrid title="todos os produtos" limit={8} />
      </main>
      <StoreFooter />
    </div>
  )
}
