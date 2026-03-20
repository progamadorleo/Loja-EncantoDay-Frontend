"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, User, ShoppingCart, Menu, X, Heart, LogIn, UserPlus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCustomer } from "@/contexts/customer-context"
import { useCart } from "@/contexts/cart-context"
import { getProducts, type Product } from "@/lib/api"

const categories = [
  "kits",
  "labios",
  "olhos",
  "rosto",
  "skincare",
  "acessorios",
  "perfumaria",
  "cabelo",
  "corpo",
  "novidades",
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const { customer, isAuthenticated, isLoading, favoriteIds } = useCustomer()
  const { itemCount, openCart } = useCart()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const mobileSearchRef = useRef<HTMLDivElement>(null)
  const mobileSearchInputRef = useRef<HTMLInputElement>(null)

  // Detectar scroll para efeito de sombra
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAccountDropdownOpen(false)
      }
      if (
        searchRef.current && !searchRef.current.contains(event.target as Node) &&
        mobileSearchRef.current && !mobileSearchRef.current.contains(event.target as Node)
      ) {
        setShowSearchResults(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Debounce da pesquisa
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true)
        try {
          const response = await getProducts({ search: searchQuery, limit: 6 })
          if (response.data) {
            setSearchResults(response.data)
            setShowSearchResults(true)
          }
        } catch (error) {
          console.error("Erro ao pesquisar:", error)
          setSearchResults([])
        } finally {
          setIsSearching(false)
        }
      } else {
        setSearchResults([])
        setShowSearchResults(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const clearSearch = () => {
    setSearchQuery("")
    setSearchResults([])
    setShowSearchResults(false)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  return (
    <header className={`sticky top-0 z-50 bg-card transition-shadow duration-300 ${isScrolled ? 'shadow-md' : ''}`}>
      {/* Barra de promocao */}
      <div className="bg-primary py-2 text-center overflow-hidden">
        <p className="text-sm text-primary-foreground animate-fade-in">
          <span className="font-semibold underline cursor-pointer hover:opacity-80 transition-opacity">Garanta agora</span>
          {" "}o seu kit <span className="font-bold">favorito!</span>
        </p>
      </div>

      {/* Header principal */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="shrink-0 transition-transform duration-200 hover:scale-105">
              <img 
                src="/images/logo.png" 
                alt="Encanto Day" 
                className="h-12 md:h-16 w-auto"
              />
            </Link>

            {/* Barra de busca - desktop */}
            <div className="hidden flex-1 max-w-xl md:block" ref={searchRef}>
              <div className="relative group">
                {isSearching ? (
                  <Loader2 className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary animate-spin" />
                ) : (
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors duration-200 group-focus-within:text-primary" />
                )}
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
                  placeholder="digite aqui o que procura..."
                  className="w-full rounded-full border border-border bg-background py-3 pl-12 pr-10 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}

                {/* Dropdown de resultados */}
                {showSearchResults && searchQuery.length >= 2 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-xl shadow-xl border border-border overflow-hidden z-50 animate-scale-in origin-top">
                    {searchResults.length > 0 ? (
                      <div className="max-h-[400px] overflow-y-auto">
                        <div className="p-2 border-b border-border bg-muted/30">
                          <span className="text-xs text-muted-foreground px-2">
                            {searchResults.length} resultado{searchResults.length !== 1 ? "s" : ""} encontrado{searchResults.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                        {searchResults.map((product) => (
                          <Link
                            key={product.id}
                            href={`/produto/${product.slug}`}
                            onClick={clearSearch}
                            className="flex items-center gap-3 p-3 hover:bg-secondary transition-colors border-b border-border/50 last:border-0"
                          >
                            <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-muted shrink-0">
                              <Image
                                src={product.images?.[0] || "/placeholder.svg"}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{product.category?.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                {product.sale_price ? (
                                  <>
                                    <span className="text-sm font-bold text-primary">{formatPrice(product.sale_price)}</span>
                                    <span className="text-xs text-muted-foreground line-through">{formatPrice(product.price)}</span>
                                  </>
                                ) : (
                                  <span className="text-sm font-bold text-foreground">{formatPrice(product.price)}</span>
                                )}
                              </div>
                            </div>
                          </Link>
                        ))}
                        <Link
                          href={`/categoria/todos?search=${encodeURIComponent(searchQuery)}`}
                          onClick={clearSearch}
                          className="flex items-center justify-center gap-2 p-3 bg-muted/30 hover:bg-muted transition-colors text-sm text-primary font-medium"
                        >
                          <Search className="h-4 w-4" />
                          Ver todos os resultados
                        </Link>
                      </div>
                    ) : !isSearching ? (
                      <div className="p-6 text-center">
                        <Search className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
                        <p className="text-sm text-muted-foreground">Nenhum produto encontrado</p>
                        <p className="text-xs text-muted-foreground mt-1">Tente buscar por outro termo</p>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>

            {/* Icones de acao */}
            <div className="flex items-center gap-1">
              {/* Favoritos */}
              <Link href={isAuthenticated ? "/conta/favoritos" : "/conta/login?redirect=/conta/favoritos"}>
                <Button variant="ghost" size="icon" className="hidden sm:flex hover:bg-secondary hover:text-primary relative group transition-all duration-200">
                  <Heart className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                  {isAuthenticated && favoriteIds.length > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-pink-500 text-xs text-white animate-scale-in">
                      {favoriteIds.length > 9 ? "9+" : favoriteIds.length}
                    </span>
                  )}
                </Button>
              </Link>

              {/* Usuario */}
              {isLoading ? (
                <Button variant="ghost" size="icon" className="hover:bg-secondary" disabled>
                  <User className="h-5 w-5 animate-pulse" />
                </Button>
              ) : isAuthenticated ? (
                <Link href="/conta">
                  <Button variant="ghost" size="icon" className="hover:bg-secondary hover:text-primary relative group transition-all duration-200">
                    <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white transition-transform duration-200 group-hover:scale-110">
                      {customer?.name?.charAt(0).toUpperCase()}
                    </div>
                  </Button>
                </Link>
              ) : (
                <div className="relative" ref={dropdownRef}>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="hover:bg-secondary hover:text-primary transition-all duration-200"
                    onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                  >
                    <User className={`h-5 w-5 transition-transform duration-200 ${accountDropdownOpen ? 'scale-110' : ''}`} />
                  </Button>
                  
                  {/* Dropdown */}
                  {accountDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-card rounded-xl shadow-xl border border-border overflow-hidden z-50 animate-scale-in origin-top-right">
                      <div className="p-2">
                        <Link 
                          href="/conta/login" 
                          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition-all duration-200 group"
                          onClick={() => setAccountDropdownOpen(false)}
                        >
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
                            <LogIn className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">Ja tenho conta</p>
                            <p className="text-xs text-muted-foreground">Fazer login</p>
                          </div>
                        </Link>
                        
                        <div className="my-1 border-t border-border" />
                        
                        <Link 
                          href="/conta/cadastro" 
                          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition-all duration-200 group"
                          onClick={() => setAccountDropdownOpen(false)}
                        >
                          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
                            <UserPlus className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">Criar conta</p>
                            <p className="text-xs text-muted-foreground">Novo por aqui? Cadastre-se</p>
                          </div>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Carrinho */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative hover:bg-secondary hover:text-primary group transition-all duration-200"
                onClick={openCart}
              >
                <ShoppingCart className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                {itemCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground animate-scale-in">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </Button>

              {/* Menu mobile */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden hover:bg-secondary transition-all duration-200"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <div className="relative w-5 h-5">
                  <X className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${mobileMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'}`} />
                  <Menu className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${mobileMenuOpen ? 'opacity-0 -rotate-90' : 'opacity-100 rotate-0'}`} />
                </div>
              </Button>
            </div>
          </div>

          {/* Barra de busca - mobile */}
          <div className="mt-3 md:hidden" ref={mobileSearchRef}>
            <div className="relative">
              {isSearching ? (
                <Loader2 className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary animate-spin" />
              ) : (
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              )}
              <input
                ref={mobileSearchInputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
                placeholder="digite aqui o que procura..."
                className="w-full rounded-full border border-border bg-background py-2.5 pl-12 pr-10 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-all duration-200"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              {/* Dropdown de resultados - mobile */}
              {showSearchResults && searchQuery.length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-xl shadow-xl border border-border overflow-hidden z-50 animate-scale-in origin-top">
                  {searchResults.length > 0 ? (
                    <div className="max-h-[350px] overflow-y-auto">
                      <div className="p-2 border-b border-border bg-muted/30">
                        <span className="text-xs text-muted-foreground px-2">
                          {searchResults.length} resultado{searchResults.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      {searchResults.map((product) => (
                        <Link
                          key={product.id}
                          href={`/produto/${product.slug}`}
                          onClick={clearSearch}
                          className="flex items-center gap-3 p-3 hover:bg-secondary transition-colors border-b border-border/50 last:border-0"
                        >
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                            <Image
                              src={product.images?.[0] || "/placeholder.svg"}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                            <div className="flex items-center gap-2">
                              {product.sale_price ? (
                                <span className="text-sm font-bold text-primary">{formatPrice(product.sale_price)}</span>
                              ) : (
                                <span className="text-sm font-bold text-foreground">{formatPrice(product.price)}</span>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                      <Link
                        href={`/categoria/todos?search=${encodeURIComponent(searchQuery)}`}
                        onClick={clearSearch}
                        className="flex items-center justify-center gap-2 p-3 bg-muted/30 hover:bg-muted transition-colors text-sm text-primary font-medium"
                      >
                        Ver todos
                      </Link>
                    </div>
                  ) : !isSearching ? (
                    <div className="p-4 text-center">
                      <p className="text-sm text-muted-foreground">Nenhum produto encontrado</p>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Menu de categorias - desktop */}
        <nav className="hidden border-t border-border md:block">
          <div className="mx-auto max-w-7xl px-4">
            <ul className="flex items-center justify-center gap-1">
              {categories.map((category, index) => (
                <li key={category} className="animate-fade-in-down" style={{ animationDelay: `${index * 50}ms` }}>
                  <Link
                    href={`/categoria/${category}`}
                    className="block px-4 py-3 text-sm font-medium text-foreground transition-all duration-200 hover:text-primary capitalize relative group"
                  >
                    {category}
                    <span className="absolute bottom-2 left-1/2 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-3/4 -translate-x-1/2" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>

      {/* Menu mobile */}
      <div 
        className={`border-b border-border bg-card md:hidden overflow-hidden transition-all duration-300 ease-out ${
          mobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="mx-auto max-w-7xl px-4 py-4">
          {/* Links de conta no mobile */}
          <div className="mb-4 pb-4 border-b border-border">
            {isAuthenticated ? (
              <Link
                href="/conta"
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-secondary transition-all duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-white">
                  {customer?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-foreground">{customer?.name?.split(" ")[0]}</p>
                  <p className="text-xs text-muted-foreground">Ver minha conta</p>
                </div>
              </Link>
            ) : (
              <Link
                href="/conta/login"
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-secondary transition-all duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                <LogIn className="h-5 w-5 text-primary" />
                <span className="font-medium text-foreground">Entrar ou criar conta</span>
              </Link>
            )}
            
            <Link
              href={isAuthenticated ? "/conta/favoritos" : "/conta/login?redirect=/conta/favoritos"}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-secondary mt-1 transition-all duration-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Heart className="h-5 w-5 text-pink-500" />
              <span className="font-medium text-foreground">
                Favoritos
                {isAuthenticated && favoriteIds.length > 0 && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({favoriteIds.length})
                  </span>
                )}
              </span>
            </Link>
          </div>

          {/* Categorias */}
          <ul className="space-y-1">
            {categories.map((category, index) => (
              <li 
                key={category}
                className="animate-fade-in-left"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Link
                  href={`/categoria/${category}`}
                  className="block rounded-lg px-4 py-2.5 text-sm font-medium text-foreground transition-all duration-200 hover:bg-secondary hover:text-primary hover:pl-6 capitalize"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {category}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
