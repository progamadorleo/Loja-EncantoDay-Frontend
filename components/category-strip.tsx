"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { getCategories, type Category } from "@/lib/api"
import { 
  Sparkles, 
  Eye, 
  CircleUser, 
  Droplets, 
  Gift, 
  Star,
  Heart,
  Palette,
  Brush,
  type LucideIcon
} from "lucide-react"

// Mapeamento de ícones por slug/nome da categoria
const categoryIcons: Record<string, LucideIcon> = {
  "labios": Heart,
  "olhos": Eye,
  "rosto": CircleUser,
  "skincare": Droplets,
  "kits": Gift,
  "novidades": Star,
  "maquiagem": Palette,
  "acessorios": Brush,
}

// Função para obter o ícone baseado no slug ou nome
function getCategoryIcon(category: Category): LucideIcon {
  const slug = category.slug?.toLowerCase() || ""
  const name = category.name?.toLowerCase() || ""
  
  // Tenta encontrar pelo slug primeiro
  if (categoryIcons[slug]) return categoryIcons[slug]
  
  // Tenta encontrar pelo nome
  for (const [key, icon] of Object.entries(categoryIcons)) {
    if (name.includes(key) || slug.includes(key)) return icon
  }
  
  // Ícone padrão
  return Sparkles
}

// Cores para as categorias (alternadas)
const categoryStyles = [
  { 
    bgColor: "bg-rose-50 dark:bg-rose-950/30",
    textColor: "text-rose-600 dark:text-rose-400",
    borderColor: "border-rose-200 dark:border-rose-800/50",
    hoverBg: "group-hover:bg-rose-100 dark:group-hover:bg-rose-900/40",
  },
  { 
    bgColor: "bg-violet-50 dark:bg-violet-950/30",
    textColor: "text-violet-600 dark:text-violet-400",
    borderColor: "border-violet-200 dark:border-violet-800/50",
    hoverBg: "group-hover:bg-violet-100 dark:group-hover:bg-violet-900/40",
  },
  { 
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
    textColor: "text-orange-600 dark:text-orange-400",
    borderColor: "border-orange-200 dark:border-orange-800/50",
    hoverBg: "group-hover:bg-orange-100 dark:group-hover:bg-orange-900/40",
  },
  { 
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    textColor: "text-emerald-600 dark:text-emerald-400",
    borderColor: "border-emerald-200 dark:border-emerald-800/50",
    hoverBg: "group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40",
  },
  { 
    bgColor: "bg-pink-50 dark:bg-pink-950/30",
    textColor: "text-pink-600 dark:text-pink-400",
    borderColor: "border-pink-200 dark:border-pink-800/50",
    hoverBg: "group-hover:bg-pink-100 dark:group-hover:bg-pink-900/40",
  },
  { 
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    textColor: "text-amber-600 dark:text-amber-400",
    borderColor: "border-amber-200 dark:border-amber-800/50",
    hoverBg: "group-hover:bg-amber-100 dark:group-hover:bg-amber-900/40",
  },
]

function CategorySkeleton() {
  return (
    <div className="flex flex-col items-center gap-3 shrink-0">
      <Skeleton className="w-14 h-14 md:w-16 md:h-16 rounded-2xl" />
      <Skeleton className="h-4 w-16" />
    </div>
  )
}

export function CategoryStrip() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await getCategories()
        if (response.data) {
          setCategories(response.data)
        }
      } catch (err) {
        console.error("Error fetching categories:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchCategories()
  }, [])

  if (isLoading) {
    return (
      <section className="py-8 bg-background relative z-10">
        <div className="mx-auto max-w-7xl px-4">
          <div 
            className="flex gap-4 overflow-x-auto pb-2 md:justify-center md:gap-6 lg:gap-8"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <CategorySkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (categories.length === 0) {
    return null
  }

  return (
    <section className="py-8 bg-background relative z-10">
      <div className="mx-auto max-w-7xl px-4">
        <div 
            className="flex gap-4 overflow-x-auto pb-2 md:justify-center md:gap-6 lg:gap-8"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
          {categories.map((cat, index) => {
            const style = categoryStyles[index % categoryStyles.length]
            const Icon = getCategoryIcon(cat)
            return (
              <Link
                key={cat.id}
                href={`/categoria/${cat.slug}`}
                className="flex flex-col items-center gap-3 shrink-0 group"
              >
                <div className={`
                  relative w-14 h-14 md:w-16 md:h-16
                  rounded-2xl
                  ${style.bgColor}
                  ${style.hoverBg}
                  border ${style.borderColor}
                  flex items-center justify-center 
                  ${style.textColor}
                  transition-all duration-300 ease-out
                  group-hover:scale-105
                  group-hover:shadow-lg
                `}>
                  <div className="transition-transform duration-300 group-hover:scale-110">
                    <Icon className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                </div>
                <span className={`
                  text-xs font-medium text-muted-foreground 
                  group-hover:text-foreground 
                  transition-colors duration-300 
                  md:text-sm
                  whitespace-nowrap
                `}>
                  {cat.name}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
