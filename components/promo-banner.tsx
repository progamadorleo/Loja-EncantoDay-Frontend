"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getBanners, type Banner } from "@/lib/api"

export function PromoBanner() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [currentBanner, setCurrentBanner] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    async function fetchBanners() {
      try {
        const response = await getBanners()
        if (response.data && response.data.length > 0) {
          setBanners(response.data)
        }
      } catch (error) {
        console.error("Error fetching banners:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchBanners()
  }, [])

  // Auto-rotate banners
  useEffect(() => {
    if (banners.length <= 1) return
    const interval = setInterval(() => {
      changeBanner((currentBanner + 1) % banners.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [banners.length, currentBanner])

  const changeBanner = (index: number) => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentBanner(index)
      setIsTransitioning(false)
    }, 300)
  }

  const nextBanner = () => {
    changeBanner((currentBanner + 1) % banners.length)
  }

  const prevBanner = () => {
    changeBanner((currentBanner - 1 + banners.length) % banners.length)
  }

  if (isLoading) {
    return (
      <section className="bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 dark:from-rose-950/40 dark:via-pink-950/30 dark:to-fuchsia-950/20">
        <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
          <div className="flex flex-col items-center gap-6 lg:flex-row lg:justify-between">
            {/* Texto skeleton */}
            <div className="text-center lg:text-left space-y-3 w-full lg:w-auto">
              <Skeleton className="h-10 w-40 mx-auto lg:mx-0" />
              <Skeleton className="h-8 w-32 mx-auto lg:mx-0" />
              <Skeleton className="h-4 w-48 mx-auto lg:mx-0" />
              <Skeleton className="h-10 w-28 mx-auto lg:mx-0 rounded-full mt-4" />
            </div>
            {/* Cards skeleton - escondido no mobile pequeno */}
            <div className="hidden sm:flex items-center gap-3 md:gap-4">
              <Skeleton className="h-24 w-20 md:h-32 md:w-24 rounded-xl" />
              <Skeleton className="h-24 w-20 md:h-32 md:w-24 rounded-xl" />
              <Skeleton className="h-24 w-20 md:h-32 md:w-24 rounded-xl hidden md:block" />
            </div>
            {/* Badge preco skeleton */}
            <Skeleton className="h-28 w-28 md:h-32 md:w-32 rounded-2xl" />
          </div>
        </div>
      </section>
    )
  }

  if (banners.length === 0) {
    return null
  }

  const banner = banners[currentBanner]
  const images = banner.images || []

  return (
    <section className={`relative overflow-hidden ${banner.bg_color || 'bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50'}`}>
      <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
        <div 
          className={`flex flex-col items-center gap-8 lg:flex-row lg:justify-between transition-all duration-500 ease-out ${
            isTransitioning ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'
          }`}
        >
          {/* Conteudo do texto */}
          <div className="text-center lg:text-left lg:max-w-md shrink-0">
            <h2 className="text-5xl font-black text-primary italic md:text-6xl lg:text-7xl">
              {banner.title}
            </h2>
            {banner.subtitle && (
              <p className="text-4xl font-black text-foreground md:text-5xl lg:text-6xl mt-1">
                {banner.subtitle}
              </p>
            )}
            {banner.description && (
              <p className="mt-5 text-base text-muted-foreground md:text-lg">
                {banner.description}
              </p>
            )}
            {banner.highlight && (
              <p className="text-3xl font-black text-foreground md:text-4xl lg:text-5xl mt-2">
                {banner.highlight}
              </p>
            )}
            {banner.disclaimer && (
              <p className="mt-5 text-xs text-muted-foreground/70 max-w-sm mx-auto lg:mx-0 leading-relaxed">
                {banner.disclaimer}
              </p>
            )}
            
            {/* Botao CTA */}
            {banner.link_url && (
              <div className="mt-8">
                <Link href={banner.link_url}>
                  <Button size="lg" className="rounded-full px-10 py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                    {banner.link_text || "confira"}
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Cards de produtos */}
          {images.length > 0 && (
            <div className="flex items-center justify-center gap-4 md:gap-5 overflow-x-auto pb-2">
              {images.map((imageUrl, index) => (
                <div 
                  key={index}
                  className="shrink-0 bg-white rounded-2xl shadow-lg p-4 md:p-5 cursor-pointer transition-transform duration-300 hover:scale-105"
                >
                  <img 
                    src={imageUrl} 
                    alt={`Produto ${index + 1}`}
                    className="h-28 w-24 md:h-40 md:w-32 object-contain"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Badge de preco */}
          {banner.price_value && (
            <div 
              className={`shrink-0 ${banner.accent_color || 'bg-primary'} rounded-3xl p-5 text-center text-primary-foreground md:p-8 shadow-xl transition-transform duration-300 hover:scale-105`}
            >
              {banner.price_label && (
                <p className="text-sm opacity-90 md:text-base">{banner.price_label}</p>
              )}
              <div className="flex items-start justify-center">
                <span className="text-2xl font-bold md:text-4xl">{banner.price_value}</span>
                <div className="text-left">
                  <span className="text-lg font-bold md:text-2xl">{banner.price_cents}</span>
                  <p className="text-xs md:text-sm">cada</p>
                </div>
              </div>
              {banner.installments && (
                <p className="text-sm mt-2 md:text-base">
                  <span className="font-bold">{banner.installments}</span>
                </p>
              )}
              {banner.full_price && (
                <p className="text-xs mt-1 opacity-80 md:text-sm">{banner.full_price}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Controles do carousel (so mostra se tiver mais de 1 banner) */}
      {banners.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-card/80 shadow-md hover:bg-card hover:scale-110 transition-all duration-200 md:left-6 h-12 w-12 md:h-14 md:w-14"
            onClick={prevBanner}
          >
            <ChevronLeft className="h-7 w-7 md:h-8 md:w-8 text-primary" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-card/80 shadow-md hover:bg-card hover:scale-110 transition-all duration-200 md:right-6 h-12 w-12 md:h-14 md:w-14"
            onClick={nextBanner}
          >
            <ChevronRight className="h-7 w-7 md:h-8 md:w-8 text-primary" />
          </Button>

          {/* Indicadores */}
          <div className="relative mt-6 flex justify-center gap-3 md:absolute md:bottom-6 md:left-1/2 md:-translate-x-1/2 md:mt-0">
            {banners.map((_, index) => (
              <button
                key={index}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  index === currentBanner 
                    ? "bg-primary w-10" 
                    : "bg-primary/30 w-2.5 hover:bg-primary/50"
                }`}
                onClick={() => changeBanner(index)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
