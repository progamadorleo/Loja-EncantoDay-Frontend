"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getProducts, type Product } from "@/lib/api"

export function FeaturedProduct() {
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchFeaturedProduct() {
      try {
        const response = await getProducts({ featured: true, limit: 1 })
        if (response.data && response.data.length > 0) {
          setProduct(response.data[0])
        }
      } catch (err) {
        console.error("Error fetching featured product:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchFeaturedProduct()
  }, [])

  if (isLoading) {
    return (
      <section className="py-8 md:py-12 bg-background">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col overflow-hidden rounded-2xl md:flex-row">
            <Skeleton className="min-h-[300px] md:min-h-[400px] md:w-1/2" />
            <Skeleton className="min-h-[250px] md:w-1/2" />
          </div>
        </div>
      </section>
    )
  }

  if (!product) {
    return null
  }

  return (
    <section className="py-8 md:py-12 bg-background">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col overflow-hidden rounded-2xl md:flex-row">
          {/* Imagem do produto */}
          <div className="relative bg-gradient-to-br from-sky-100 via-cyan-50 to-teal-50 p-8 md:w-1/2 flex items-center justify-center min-h-[300px] md:min-h-[400px]">
            <img 
              src={product.images?.[0] || "/placeholder.svg"} 
              alt={product.name}
              className="h-64 md:h-80 object-contain drop-shadow-2xl"
            />
          </div>

          {/* Info do produto */}
          <div className="bg-primary p-8 md:w-1/2 flex flex-col justify-center">
            <span className="text-sm font-medium text-primary-foreground/80">
              #destaque do mês
            </span>
            <h3 className="mt-2 text-2xl font-bold text-primary-foreground md:text-3xl">
              {product.name}
            </h3>
            <p className="mt-3 text-primary-foreground/90">
              {product.short_description || product.description}
            </p>
            <p className="mt-6 text-3xl font-bold text-primary-foreground">
              R$ {product.price.toFixed(2).replace(".", ",")}
            </p>
            <Link href={`/produto/${product.slug}`}>
              <Button 
                variant="outline" 
                className="mt-6 w-fit border-primary-foreground bg-transparent text-primary-foreground hover:bg-primary-foreground hover:text-primary rounded-full px-8"
              >
                eu quero!
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
