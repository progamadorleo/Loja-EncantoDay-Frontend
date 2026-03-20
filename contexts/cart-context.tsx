"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react"
import { 
  getCart, 
  addToCart as apiAddToCart, 
  updateCartItem as apiUpdateCartItem,
  removeCartItem as apiRemoveCartItem,
  clearCart as apiClearCart,
  mergeCart as apiMergeCart,
  type CartItem,
  type CartResponse 
} from "@/lib/api"
import { useCustomer } from "./customer-context"

interface CartContextType {
  items: CartItem[]
  itemCount: number
  subtotal: number
  isLoading: boolean
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  addItem: (productId: string, quantity?: number) => Promise<boolean>
  updateQuantity: (itemId: string, quantity: number) => Promise<boolean>
  removeItem: (itemId: string) => Promise<boolean>
  clearAll: () => Promise<boolean>
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_SESSION_KEY = "cart_session_id"

export function CartProvider({ children }: { children: ReactNode }) {
  const { accessToken, isAuthenticated, isLoading: isAuthLoading } = useCustomer()
  const [items, setItems] = useState<CartItem[]>([])
  const [itemCount, setItemCount] = useState(0)
  const [subtotal, setSubtotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)

  // Carregar session ID do localStorage
  useEffect(() => {
    const storedSessionId = localStorage.getItem(CART_SESSION_KEY)
    if (storedSessionId) {
      setSessionId(storedSessionId)
    }
  }, [])

  // Buscar carrinho
  const refreshCart = useCallback(async () => {
    if (isAuthLoading) return

    try {
      setIsLoading(true)
      const response = await getCart(
        isAuthenticated ? accessToken! : undefined,
        !isAuthenticated ? sessionId || undefined : undefined
      )

      if (response.success && response.data) {
        setItems(response.data.items)
        setItemCount(response.data.itemCount)
        setSubtotal(response.data.subtotal)
      }
    } catch (error) {
      console.error("Erro ao buscar carrinho:", error)
    } finally {
      setIsLoading(false)
    }
  }, [accessToken, isAuthenticated, isAuthLoading, sessionId])

  // Carregar carrinho inicial
  useEffect(() => {
    if (!isAuthLoading) {
      refreshCart()
    }
  }, [isAuthLoading, refreshCart])

  // Mesclar carrinho quando usuário logar
  useEffect(() => {
    const mergeCartsOnLogin = async () => {
      if (isAuthenticated && accessToken && sessionId) {
        try {
          await apiMergeCart(accessToken, sessionId)
          localStorage.removeItem(CART_SESSION_KEY)
          setSessionId(null)
          await refreshCart()
        } catch (error) {
          console.error("Erro ao mesclar carrinhos:", error)
        }
      }
    }

    if (!isAuthLoading && isAuthenticated && sessionId) {
      mergeCartsOnLogin()
    }
  }, [isAuthenticated, accessToken, sessionId, isAuthLoading, refreshCart])

  // Funções do carrinho
  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])
  const toggleCart = useCallback(() => setIsOpen(prev => !prev), [])

  const addItem = useCallback(async (productId: string, quantity: number = 1): Promise<boolean> => {
    try {
      const response = await apiAddToCart(
        productId,
        quantity,
        isAuthenticated ? accessToken! : undefined,
        !isAuthenticated ? sessionId || undefined : undefined
      )

      if (response.success && response.data) {
        // Se não tinha session e veio uma nova, salvar
        if (!isAuthenticated && response.data.sessionId && !sessionId) {
          localStorage.setItem(CART_SESSION_KEY, response.data.sessionId)
          setSessionId(response.data.sessionId)
        }

        setItems(response.data.items)
        setItemCount(response.data.itemCount)
        setSubtotal(response.data.subtotal)
        return true
      }
      return false
    } catch (error) {
      console.error("Erro ao adicionar ao carrinho:", error)
      return false
    }
  }, [accessToken, isAuthenticated, sessionId])

  const updateQuantity = useCallback(async (itemId: string, quantity: number): Promise<boolean> => {
    try {
      const response = await apiUpdateCartItem(
        itemId,
        quantity,
        isAuthenticated ? accessToken! : undefined,
        !isAuthenticated ? sessionId || undefined : undefined
      )

      if (response.success && response.data) {
        setItems(response.data.items)
        setItemCount(response.data.itemCount)
        setSubtotal(response.data.subtotal)
        return true
      }
      return false
    } catch (error) {
      console.error("Erro ao atualizar quantidade:", error)
      return false
    }
  }, [accessToken, isAuthenticated, sessionId])

  const removeItem = useCallback(async (itemId: string): Promise<boolean> => {
    try {
      const response = await apiRemoveCartItem(
        itemId,
        isAuthenticated ? accessToken! : undefined,
        !isAuthenticated ? sessionId || undefined : undefined
      )

      if (response.success && response.data) {
        setItems(response.data.items)
        setItemCount(response.data.itemCount)
        setSubtotal(response.data.subtotal)
        return true
      }
      return false
    } catch (error) {
      console.error("Erro ao remover item:", error)
      return false
    }
  }, [accessToken, isAuthenticated, sessionId])

  const clearAll = useCallback(async (): Promise<boolean> => {
    try {
      const response = await apiClearCart(
        isAuthenticated ? accessToken! : undefined,
        !isAuthenticated ? sessionId || undefined : undefined
      )

      if (response.success) {
        setItems([])
        setItemCount(0)
        setSubtotal(0)
        return true
      }
      return false
    } catch (error) {
      console.error("Erro ao limpar carrinho:", error)
      return false
    }
  }, [accessToken, isAuthenticated, sessionId])

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        isLoading,
        isOpen,
        openCart,
        closeCart,
        toggleCart,
        addItem,
        updateQuantity,
        removeItem,
        clearAll,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart deve ser usado dentro de um CartProvider")
  }
  return context
}
