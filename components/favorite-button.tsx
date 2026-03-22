"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Heart, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCustomer } from "@/contexts/customer-context"
import { toggleFavorite } from "@/lib/api"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface FavoriteButtonProps {
  productId: string
  variant?: "icon" | "full"
  size?: "sm" | "default" | "lg"
  className?: string
}

export function FavoriteButton({ 
  productId, 
  variant = "icon", 
  size = "default",
  className 
}: FavoriteButtonProps) {
  const router = useRouter()
  const { isAuthenticated, accessToken, favoriteIds, refreshFavorites } = useCustomer()
  const [isLoading, setIsLoading] = useState(false)
  
  const isFavorite = favoriteIds.includes(productId)

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!isAuthenticated) {
      toast("Faca login para favoritar", {
        description: "Crie uma conta ou entre para salvar seus produtos favoritos.",
        action: {
          label: "Entrar",
          onClick: () => router.push(`/conta/login?redirect=${encodeURIComponent(window.location.pathname)}`),
        },
        duration: 5000,
      })
      return
    }
    
    if (!accessToken || isLoading) return
    
    setIsLoading(true)
    try {
      await toggleFavorite(accessToken, productId)
      await refreshFavorites()
    } catch (error) {
      console.error("Error toggling favorite:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const sizeClasses = {
    sm: "h-8 w-8",
    default: "h-10 w-10",
    lg: "h-12 w-12",
  }

  const iconSizes = {
    sm: "h-4 w-4",
    default: "h-5 w-5",
    lg: "h-6 w-6",
  }

  if (variant === "full") {
    return (
      <Button
        variant="outline"
        size={size}
        onClick={handleToggleFavorite}
        disabled={isLoading}
        className={cn(
          "rounded-full transition-all duration-300 hover:scale-105 active:scale-95",
          isFavorite && "text-red-500 border-red-500 hover:bg-red-50 hover:text-red-600",
          className
        )}
      >
        {isLoading ? (
          <Loader2 className={cn(iconSizes[size], "animate-spin")} />
        ) : (
          <Heart className={cn(
            iconSizes[size], 
            "transition-all duration-300",
            isFavorite && "fill-current scale-110"
          )} />
        )}
      </Button>
    )
  }

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={isLoading}
      className={cn(
        sizeClasses[size],
        "flex items-center justify-center rounded-full transition-all duration-300",
        "bg-white/90 hover:bg-white shadow-sm hover:shadow-md",
        "hover:scale-110 active:scale-95",
        isFavorite && "text-red-500",
        !isFavorite && "text-muted-foreground hover:text-red-500",
        isLoading && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {isLoading ? (
        <Loader2 className={cn(iconSizes[size], "animate-spin")} />
      ) : (
        <Heart className={cn(
          iconSizes[size], 
          "transition-all duration-300",
          isFavorite && "fill-current animate-scale-in"
        )} />
      )}
    </button>
  )
}
