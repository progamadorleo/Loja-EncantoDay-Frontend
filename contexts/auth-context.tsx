"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

interface User {
  id: string
  email: string
  name: string
  role: "admin" | "super_admin"
  last_login?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  accessToken: string | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshAuth: () => Promise<boolean>
  getAuthHeaders: () => Record<string, string>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Armazena tokens em memória (mais seguro que localStorage para access token)
let accessTokenMemory: string | null = null
let refreshTokenMemory: string | null = null

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [accessToken, setAccessToken] = useState<string | null>(null)

  const setTokens = (access: string | null, refresh: string | null) => {
    accessTokenMemory = access
    refreshTokenMemory = refresh
    setAccessToken(access)
    
    // Refresh token pode ir no localStorage para persistir entre sessões
    if (refresh) {
      localStorage.setItem("refresh_token", refresh)
    } else {
      localStorage.removeItem("refresh_token")
    }
  }

  const getAuthHeaders = useCallback((): Record<string, string> => {
    if (accessTokenMemory) {
      return { Authorization: `Bearer ${accessTokenMemory}` }
    }
    return {}
  }, [])

  const refreshAuth = useCallback(async (): Promise<boolean> => {
    try {
      const storedRefresh = refreshTokenMemory || localStorage.getItem("refresh_token")
      if (!storedRefresh) return false

      const response = await fetch(`${API_URL}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: storedRefresh }),
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setTokens(data.tokens.accessToken, data.tokens.refreshToken)
        return true
      }
      
      // Refresh falhou, limpar tokens
      setTokens(null, null)
      return false
    } catch {
      return false
    }
  }, [])

  const checkAuth = useCallback(async () => {
    try {
      // Primeiro tenta fazer refresh se tiver refresh token salvo
      const storedRefresh = localStorage.getItem("refresh_token")
      if (storedRefresh && !accessTokenMemory) {
        const refreshed = await refreshAuth()
        if (!refreshed) {
          setUser(null)
          setIsLoading(false)
          return
        }
      }

      if (!accessTokenMemory) {
        setUser(null)
        setIsLoading(false)
        return
      }

      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${accessTokenMemory}` },
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else if (response.status === 401) {
        const refreshed = await refreshAuth()
        if (refreshed) {
          // Tenta novamente com novo token
          const retryResponse = await fetch(`${API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${accessTokenMemory}` },
            credentials: "include",
          })
          if (retryResponse.ok) {
            const data = await retryResponse.json()
            setUser(data.user)
          } else {
            setUser(null)
          }
        } else {
          setUser(null)
        }
      }
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [refreshAuth])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Refresh automático antes do token expirar (a cada 10 minutos)
  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      refreshAuth()
    }, 10 * 60 * 1000) // 10 minutos

    return () => clearInterval(interval)
  }, [user, refreshAuth])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setTokens(data.tokens.accessToken, data.tokens.refreshToken)
        setUser(data.user)
        return { success: true }
      }

      return { success: false, error: data.message || "Erro ao fazer login" }
    } catch {
      return { success: false, error: "Erro de conexão com o servidor" }
    }
  }

  const logout = async () => {
    try {
      if (accessTokenMemory) {
        await fetch(`${API_URL}/api/auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${accessTokenMemory}` },
          credentials: "include",
        })
      }
    } finally {
      setTokens(null, null)
      setUser(null)
      window.location.href = "/admin/login"
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        accessToken,
        login,
        logout,
        refreshAuth,
        getAuthHeaders,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
