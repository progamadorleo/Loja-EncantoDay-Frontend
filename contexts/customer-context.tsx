"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { 
  customerLogin, 
  customerRegister, 
  customerLogout, 
  customerRefresh, 
  getCustomerProfile,
  getCustomerFavoriteIds,
  type Customer 
} from "@/lib/api"

interface CustomerContextType {
  customer: Customer | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  favoriteIds: string[]
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>
  register: (data: {
    name: string
    email: string
    password: string
    phone: string
    cpf?: string
    birth_date?: string
    accepts_marketing?: boolean
  }) => Promise<{ success: boolean; message?: string }>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
  refreshFavorites: () => Promise<void>
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined)

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])

  // Carregar sessão do localStorage
  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedRefreshToken = localStorage.getItem("customer_refresh_token")
        
        if (storedRefreshToken) {
          // Tentar renovar o token
          const response = await customerRefresh(storedRefreshToken)
          
          if (response.success && response.data) {
            setAccessToken(response.data.tokens.accessToken)
            localStorage.setItem("customer_refresh_token", response.data.tokens.refreshToken)
            
            // Carregar perfil
            const profileResponse = await getCustomerProfile(response.data.tokens.accessToken)
            if (profileResponse.success && profileResponse.data) {
              setCustomer(profileResponse.data)
            }
            
            // Carregar favoritos
            try {
              const favResponse = await getCustomerFavoriteIds(response.data.tokens.accessToken)
              if (favResponse.success && favResponse.data) {
                setFavoriteIds(favResponse.data)
              }
            } catch {
              // Ignorar erro de favoritos
            }
          } else {
            // Token inválido, limpar
            localStorage.removeItem("customer_refresh_token")
          }
        }
      } catch (error) {
        console.error("Error loading session:", error)
        localStorage.removeItem("customer_refresh_token")
      } finally {
        setIsLoading(false)
      }
    }

    loadSession()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await customerLogin(email, password)
      
      if (response.success && response.data) {
        setCustomer(response.data.customer)
        setAccessToken(response.data.tokens.accessToken)
        localStorage.setItem("customer_refresh_token", response.data.tokens.refreshToken)
        
        // Carregar favoritos
        try {
          const favResponse = await getCustomerFavoriteIds(response.data.tokens.accessToken)
          if (favResponse.success && favResponse.data) {
            setFavoriteIds(favResponse.data)
          }
        } catch {
          // Ignorar erro de favoritos
        }
        
        return { success: true }
      }
      
      return { success: false, message: response.message || "Erro ao fazer login" }
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : "Erro ao fazer login" }
    }
  }

  const register = async (data: {
    name: string
    email: string
    password: string
    phone: string
    cpf?: string
    birth_date?: string
    accepts_marketing?: boolean
  }) => {
    try {
      const response = await customerRegister(data)
      
      if (response.success && response.data) {
        setCustomer(response.data.customer)
        setAccessToken(response.data.tokens.accessToken)
        localStorage.setItem("customer_refresh_token", response.data.tokens.refreshToken)
        
        return { success: true }
      }
      
      return { success: false, message: response.message || "Erro ao criar conta" }
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : "Erro ao criar conta" }
    }
  }

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("customer_refresh_token")
      if (accessToken) {
        await customerLogout(accessToken, refreshToken || undefined)
      }
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setCustomer(null)
      setAccessToken(null)
      setFavoriteIds([])
      localStorage.removeItem("customer_refresh_token")
    }
  }

  const refreshProfile = useCallback(async () => {
    if (!accessToken) return
    
    try {
      const response = await getCustomerProfile(accessToken)
      if (response.success && response.data) {
        setCustomer(response.data)
      }
    } catch (error) {
      console.error("Error refreshing profile:", error)
    }
  }, [accessToken])

  const refreshFavorites = useCallback(async () => {
    if (!accessToken) return
    
    try {
      const response = await getCustomerFavoriteIds(accessToken)
      if (response.success && response.data) {
        setFavoriteIds(response.data)
      }
    } catch (error) {
      console.error("Error refreshing favorites:", error)
    }
  }, [accessToken])

  return (
    <CustomerContext.Provider
      value={{
        customer,
        accessToken,
        isAuthenticated: !!customer,
        isLoading,
        favoriteIds,
        login,
        register,
        logout,
        refreshProfile,
        refreshFavorites,
      }}
    >
      {children}
    </CustomerContext.Provider>
  )
}

export function useCustomer() {
  const context = useContext(CustomerContext)
  if (context === undefined) {
    throw new Error("useCustomer must be used within a CustomerProvider")
  }
  return context
}
