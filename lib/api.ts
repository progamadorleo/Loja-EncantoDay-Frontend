const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  body?: unknown
  headers?: Record<string, string>
}

class ApiClient {
  private getAccessToken(): string | null {
    // Tenta pegar do localStorage (refresh token para re-auth)
    // O access token real está em memória no AuthContext
    return null
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = "GET", body, headers = {} } = options

    const config: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      credentials: "include",
    }

    if (body) {
      config.body = JSON.stringify(body)
    }

    const response = await fetch(`${API_URL}${endpoint}`, config)

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Erro desconhecido" }))
      throw new Error(error.message || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Helper com auth header
  async authRequest<T>(
    endpoint: string, 
    accessToken: string,
    options: RequestOptions = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
      },
    })
  }

  // Métodos de conveniência
  get<T>(endpoint: string, headers?: Record<string, string>) {
    return this.request<T>(endpoint, { method: "GET", headers })
  }

  post<T>(endpoint: string, body?: unknown, headers?: Record<string, string>) {
    return this.request<T>(endpoint, { method: "POST", body, headers })
  }

  put<T>(endpoint: string, body?: unknown, headers?: Record<string, string>) {
    return this.request<T>(endpoint, { method: "PUT", body, headers })
  }

  delete<T>(endpoint: string, headers?: Record<string, string>) {
    return this.request<T>(endpoint, { method: "DELETE", headers })
  }
}

export const api = new ApiClient()

// Types para as respostas da API
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image_url?: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description?: string
  short_description?: string
  price: number
  original_price?: number
  category_id: string
  category?: Category
  images: string[]
  stock_quantity: number
  sku?: string
  is_active: boolean
  is_featured: boolean
  tags: string[]
  metadata?: Record<string, unknown>
  created_at: string
  updated_at: string
}

// Funções específicas da API

// Produtos
export async function getProducts(params?: {
  page?: number
  limit?: number
  category?: string
  search?: string
  featured?: boolean
}) {
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set("page", String(params.page))
  if (params?.limit) searchParams.set("limit", String(params.limit))
  if (params?.category) searchParams.set("category", params.category)
  if (params?.search) searchParams.set("search", params.search)
  if (params?.featured) searchParams.set("featured", "true")

  const query = searchParams.toString()
  return api.get<PaginatedResponse<Product>>(`/api/products${query ? `?${query}` : ""}`)
}

export async function getProductBySlug(slug: string) {
  return api.get<ApiResponse<Product>>(`/api/products/slug/${slug}`)
}

// Categorias
export async function getCategories() {
  return api.get<ApiResponse<Category[]>>("/api/categories")
}

export async function getCategoryBySlug(slug: string) {
  return api.get<ApiResponse<Category>>(`/api/categories/slug/${slug}`)
}

// Admin Products
export async function getAdminProducts(accessToken: string, params?: {
  page?: number
  limit?: number
  category?: string
  search?: string
  status?: "active" | "inactive"
}) {
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set("page", String(params.page))
  if (params?.limit) searchParams.set("limit", String(params.limit))
  if (params?.category) searchParams.set("category", params.category)
  if (params?.search) searchParams.set("search", params.search)
  if (params?.status) searchParams.set("status", params.status)

  const query = searchParams.toString()
  return api.authRequest<PaginatedResponse<Product>>(
    `/api/products/admin/all${query ? `?${query}` : ""}`,
    accessToken
  )
}

export async function getAdminProduct(accessToken: string, id: string) {
  return api.authRequest<ApiResponse<Product>>(`/api/products/admin/${id}`, accessToken)
}

export async function createProduct(accessToken: string, data: Partial<Product>) {
  return api.authRequest<ApiResponse<Product>>("/api/products/admin", accessToken, {
    method: "POST",
    body: data,
  })
}

export async function updateProduct(accessToken: string, id: string, data: Partial<Product>) {
  return api.authRequest<ApiResponse<Product>>(`/api/products/admin/${id}`, accessToken, {
    method: "PUT",
    body: data,
  })
}

export async function deleteProduct(accessToken: string, id: string) {
  return api.authRequest<ApiResponse<null>>(`/api/products/admin/${id}`, accessToken, {
    method: "DELETE",
  })
}

// Admin Categories
export async function getAdminCategories(accessToken: string) {
  return api.authRequest<ApiResponse<Category[]>>("/api/categories/admin/all", accessToken)
}

export async function createCategory(accessToken: string, data: Partial<Category>) {
  return api.authRequest<ApiResponse<Category>>("/api/categories/admin", accessToken, {
    method: "POST",
    body: data,
  })
}

export async function updateCategory(accessToken: string, id: string, data: Partial<Category>) {
  return api.authRequest<ApiResponse<Category>>(`/api/categories/admin/${id}`, accessToken, {
    method: "PUT",
    body: data,
  })
}

export async function deleteCategory(accessToken: string, id: string) {
  return api.authRequest<ApiResponse<null>>(`/api/categories/admin/${id}`, accessToken, {
    method: "DELETE",
  })
}

// Dashboard Stats
export interface DashboardStats {
  overview: {
    totalProducts: number
    activeProducts: number
    totalCategories: number
    activeCategories: number
    totalStock: number
    totalValue: number
    lowStock: number
    outOfStock: number
    featuredProducts: number
  }
  orders: {
    total: number
    pending: number
    paid: number
    shipped: number
    delivered: number
    cancelled: number
  }
  sales: {
    todayRevenue: number
    todaySalesCount: number
    monthlyRevenue: number
    monthlySalesCount: number
    lastMonthRevenue: number
    avgTicket: number
    revenueGrowth: number
  }
  lowStockProducts: Array<{
    id: string
    name: string
    slug: string
    images: string[]
    stock_quantity: number
    price: number
  }>
  topProducts: Array<{
    id: string
    name: string
    image?: string
    quantity: number
  }>
  recentOrders: Array<{
    id: string
    status: string
    payment_status: string
    total: number
    created_at: string
    mp_external_reference: string
    customer: { id: string; name: string; email: string; phone: string } | null
  }>
  recentProducts: Array<{
    id: string
    name: string
    slug: string
    price: number
    stock_quantity: number
    images: string[]
    is_active: boolean
    is_featured: boolean
    created_at: string
    category: { id: string; name: string } | null
  }>
  categoriesWithCount: Array<{
    id: string
    name: string
    slug: string
    is_active: boolean
    productCount: number
  }>
}

export async function getDashboardStats(accessToken: string) {
  return api.authRequest<ApiResponse<DashboardStats>>("/api/stats", accessToken)
}

// Upload de imagens
export interface UploadResponse {
  path: string
  url: string
  filename: string
}

export async function uploadImage(
  accessToken: string, 
  image: string, // base64 data URI
  filename?: string,
  folder?: string
) {
  return api.authRequest<ApiResponse<UploadResponse>>("/api/upload/image", accessToken, {
    method: "POST",
    body: { image, filename, folder },
  })
}

export async function deleteImage(accessToken: string, path: string) {
  return api.authRequest<ApiResponse<null>>("/api/upload/image", accessToken, {
    method: "DELETE",
    body: { path },
  })
}

// ============================================
// API DE CLIENTES
// ============================================

export interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  cpf?: string
  birth_date?: string
  accepts_marketing: boolean
  created_at: string
  last_login_at?: string
}

export interface CustomerAddress {
  id: string
  customer_id: string
  label: string
  is_default: boolean
  cep: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  recipient_name?: string
  recipient_phone?: string
  created_at: string
  updated_at: string
}

export interface CustomerFavorite {
  id: string
  created_at: string
  product: Product
}

// Auth do Cliente
export async function customerRegister(data: {
  name: string
  email: string
  password: string
  phone: string
  cpf?: string
  birth_date?: string
  accepts_marketing?: boolean
}) {
  return api.post<{
    success: boolean
    message: string
    data?: {
      customer: Customer
      tokens: { accessToken: string; refreshToken: string }
    }
  }>("/api/customer/auth/register", data)
}

export async function customerLogin(email: string, password: string) {
  return api.post<{
    success: boolean
    message: string
    data?: {
      customer: Customer
      tokens: { accessToken: string; refreshToken: string }
    }
  }>("/api/customer/auth/login", { email, password })
}

export async function customerRefresh(refreshToken: string) {
  return api.post<{
    success: boolean
    data?: {
      tokens: { accessToken: string; refreshToken: string }
    }
  }>("/api/customer/auth/refresh", { refreshToken })
}

export async function customerLogout(accessToken: string, refreshToken?: string) {
  return api.authRequest<ApiResponse<null>>("/api/customer/auth/logout", accessToken, {
    method: "POST",
    body: { refreshToken },
  })
}

export async function getCustomerProfile(accessToken: string) {
  return api.authRequest<ApiResponse<Customer>>("/api/customer/auth/me", accessToken)
}

export async function updateCustomerProfile(accessToken: string, data: Partial<Customer>) {
  return api.authRequest<ApiResponse<Customer>>("/api/customer/auth/me", accessToken, {
    method: "PUT",
    body: data,
  })
}

export async function changeCustomerPassword(accessToken: string, current_password: string, new_password: string) {
  return api.authRequest<ApiResponse<null>>("/api/customer/auth/change-password", accessToken, {
    method: "PUT",
    body: { current_password, new_password },
  })
}

// Endereços do Cliente
export async function validateCep(accessToken: string, cep: string) {
  return api.authRequest<ApiResponse<{
    cep: string
    street: string
    neighborhood: string
    city: string
    state: string
  }>>(`/api/customer/addresses/validate-cep/${cep}`, accessToken)
}

export async function getCustomerAddresses(accessToken: string) {
  return api.authRequest<ApiResponse<CustomerAddress[]>>("/api/customer/addresses", accessToken)
}

export async function getCustomerAddress(accessToken: string, id: string) {
  return api.authRequest<ApiResponse<CustomerAddress>>(`/api/customer/addresses/${id}`, accessToken)
}

export async function createCustomerAddress(accessToken: string, data: Partial<CustomerAddress>) {
  return api.authRequest<ApiResponse<CustomerAddress>>("/api/customer/addresses", accessToken, {
    method: "POST",
    body: data,
  })
}

export async function updateCustomerAddress(accessToken: string, id: string, data: Partial<CustomerAddress>) {
  return api.authRequest<ApiResponse<CustomerAddress>>(`/api/customer/addresses/${id}`, accessToken, {
    method: "PUT",
    body: data,
  })
}

export async function setDefaultAddress(accessToken: string, id: string) {
  return api.authRequest<ApiResponse<CustomerAddress>>(`/api/customer/addresses/${id}/default`, accessToken, {
    method: "PATCH",
  })
}

export async function deleteCustomerAddress(accessToken: string, id: string) {
  return api.authRequest<ApiResponse<null>>(`/api/customer/addresses/${id}`, accessToken, {
    method: "DELETE",
  })
}

// Favoritos do Cliente
export async function getCustomerFavorites(accessToken: string) {
  return api.authRequest<ApiResponse<CustomerFavorite[]>>("/api/customer/favorites", accessToken)
}

export async function getCustomerFavoriteIds(accessToken: string) {
  return api.authRequest<ApiResponse<string[]>>("/api/customer/favorites/ids", accessToken)
}

export async function checkIsFavorite(accessToken: string, productId: string) {
  return api.authRequest<ApiResponse<{ isFavorite: boolean; favoriteId?: string }>>(`/api/customer/favorites/check/${productId}`, accessToken)
}

export async function toggleFavorite(accessToken: string, productId: string) {
  return api.authRequest<ApiResponse<{ isFavorite: boolean; favoriteId?: string }>>(`/api/customer/favorites/${productId}/toggle`, accessToken, {
    method: "POST",
  })
}

export async function addToFavorites(accessToken: string, productId: string) {
  return api.authRequest<ApiResponse<{ id: string }>>(`/api/customer/favorites/${productId}`, accessToken, {
    method: "POST",
  })
}

export async function removeFromFavorites(accessToken: string, productId: string) {
  return api.authRequest<ApiResponse<null>>(`/api/customer/favorites/${productId}`, accessToken, {
    method: "DELETE",
  })
}

export async function getFavoritesCount(accessToken: string) {
  return api.authRequest<ApiResponse<{ count: number }>>("/api/customer/favorites/count", accessToken)
}

// ============================================
// API DE FRETE
// ============================================

export interface ShippingResult {
  available: boolean
  cep?: string
  address?: string
  distance?: number
  duration?: number
  price?: number
  isFree?: boolean
  freeShippingReason?: string
  freeShippingMinimum?: number
}

export interface ShippingConfig {
  basePrice: number
  pricePerKm: number
  minimumPrice: number
  maximumDistance: number
  freeShippingMin: number
  deliveryArea: string
  cepPrefix: string
}

export async function calculateShipping(cep: string, cartTotal?: number) {
  return api.post<{
    success: boolean
    message?: string
    data?: ShippingResult
  }>("/api/shipping/calculate", { cep: cep.replace(/\D/g, ""), cartTotal })
}

export async function getShippingConfig() {
  return api.get<ApiResponse<ShippingConfig>>("/api/shipping/config")
}

// ============================================
// API DE BANNERS
// ============================================

export interface Banner {
  id: string
  title: string
  subtitle?: string
  description?: string
  highlight?: string
  disclaimer?: string
  price_label?: string
  price_value?: string
  price_cents?: string
  installments?: string
  full_price?: string
  bg_color?: string
  text_color?: string
  accent_color?: string
  image_url?: string
  images?: string[]
  link_url?: string
  link_text?: string
  is_active: boolean
  sort_order: number
  starts_at?: string
  ends_at?: string
  created_at: string
  updated_at: string
}

// Banners públicos
export async function getBanners() {
  return api.get<ApiResponse<Banner[]>>("/api/banners")
}

export async function getBanner(id: string) {
  return api.get<ApiResponse<Banner>>(`/api/banners/${id}`)
}

// Banners admin
export async function getAdminBanners(accessToken: string) {
  return api.authRequest<ApiResponse<Banner[]>>("/api/banners/admin/all", accessToken)
}

export async function createBanner(accessToken: string, data: Partial<Banner>) {
  return api.authRequest<ApiResponse<Banner>>("/api/banners/admin", accessToken, {
    method: "POST",
    body: data,
  })
}

export async function updateBanner(accessToken: string, id: string, data: Partial<Banner>) {
  return api.authRequest<ApiResponse<Banner>>(`/api/banners/admin/${id}`, accessToken, {
    method: "PUT",
    body: data,
  })
}

export async function toggleBanner(accessToken: string, id: string) {
  return api.authRequest<ApiResponse<Banner>>(`/api/banners/admin/${id}/toggle`, accessToken, {
    method: "PATCH",
  })
}

export async function reorderBanners(accessToken: string, orders: { id: string; sort_order: number }[]) {
  return api.authRequest<ApiResponse<null>>("/api/banners/admin/reorder", accessToken, {
    method: "PUT",
    body: { orders },
  })
}

export async function deleteBanner(accessToken: string, id: string) {
  return api.authRequest<ApiResponse<null>>(`/api/banners/admin/${id}`, accessToken, {
    method: "DELETE",
  })
}

// ============================================
// API DO CARRINHO
// ============================================

export interface CartItem {
  id: string
  cart_id: string
  product_id: string
  quantity: number
  unit_price: number
  created_at: string
  updated_at: string
  product?: {
    id: string
    name: string
    slug: string
    price: number
    original_price?: number
    images: string[]
    stock_quantity: number
    is_active: boolean
  }
}

export interface CartResponse {
  id: string | null
  sessionId?: string
  items: CartItem[]
  itemCount: number
  subtotal: number
}

export async function getCart(accessToken?: string, sessionId?: string) {
  const headers: Record<string, string> = {}
  if (sessionId) headers["x-cart-session"] = sessionId
  
  if (accessToken) {
    return api.authRequest<{ success: boolean; data: CartResponse }>("/api/cart", accessToken, {
      headers,
    })
  }
  return api.get<{ success: boolean; data: CartResponse }>("/api/cart", headers)
}

export async function addToCart(
  productId: string, 
  quantity: number = 1, 
  accessToken?: string, 
  sessionId?: string
) {
  const headers: Record<string, string> = {}
  if (sessionId) headers["x-cart-session"] = sessionId
  
  if (accessToken) {
    return api.authRequest<{ success: boolean; message: string; data: CartResponse }>(
      "/api/cart/add", 
      accessToken, 
      {
        method: "POST",
        body: { product_id: productId, quantity },
        headers,
      }
    )
  }
  return api.post<{ success: boolean; message: string; data: CartResponse }>(
    "/api/cart/add", 
    { product_id: productId, quantity },
    headers
  )
}

export async function updateCartItem(
  itemId: string, 
  quantity: number, 
  accessToken?: string, 
  sessionId?: string
) {
  const headers: Record<string, string> = {}
  if (sessionId) headers["x-cart-session"] = sessionId
  
  if (accessToken) {
    return api.authRequest<{ success: boolean; message: string; data: CartResponse }>(
      `/api/cart/item/${itemId}`, 
      accessToken, 
      {
        method: "PUT",
        body: { quantity },
        headers,
      }
    )
  }
  return api.put<{ success: boolean; message: string; data: CartResponse }>(
    `/api/cart/item/${itemId}`, 
    { quantity },
    headers
  )
}

export async function removeCartItem(
  itemId: string, 
  accessToken?: string, 
  sessionId?: string
) {
  const headers: Record<string, string> = {}
  if (sessionId) headers["x-cart-session"] = sessionId
  
  if (accessToken) {
    return api.authRequest<{ success: boolean; message: string; data: CartResponse }>(
      `/api/cart/item/${itemId}`, 
      accessToken, 
      {
        method: "DELETE",
        headers,
      }
    )
  }
  return api.request<{ success: boolean; message: string; data: CartResponse }>(
    `/api/cart/item/${itemId}`, 
    {
      method: "DELETE",
      headers,
    }
  )
}

export async function clearCart(accessToken?: string, sessionId?: string) {
  const headers: Record<string, string> = {}
  if (sessionId) headers["x-cart-session"] = sessionId
  
  if (accessToken) {
    return api.authRequest<{ success: boolean; message: string; data: CartResponse }>(
      "/api/cart", 
      accessToken, 
      {
        method: "DELETE",
        headers,
      }
    )
  }
  return api.request<{ success: boolean; message: string; data: CartResponse }>(
    "/api/cart", 
    {
      method: "DELETE",
      headers,
    }
  )
}

export async function mergeCart(accessToken: string, sessionId: string) {
  return api.authRequest<{ success: boolean; message: string; data?: CartResponse }>(
    "/api/cart/merge", 
    accessToken, 
    {
      method: "POST",
      headers: { "x-cart-session": sessionId },
    }
  )
}

// ============ ORDERS ============

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  product_slug?: string
  product_image?: string
  quantity: number
  unit_price: number
  total_price: number
}

export interface Order {
  id: string
  customer_id: string
  status: string
  shipping_address: {
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    zipcode: string
    recipient_name: string
  }
  shipping_method: string
  shipping_price: number
  shipping_deadline?: string
  subtotal: number
  discount: number
  total: number
  coupon_code?: string
  coupon_discount: number
  payment_method?: string
  payment_status: string
  mp_payment_id?: string
  mp_external_reference?: string
  payment_details?: {
    pix_qr_code?: string
    pix_qr_code_base64?: string
    pix_expiration?: string
    card_last_four?: string
    card_brand?: string
    installments?: number
  }
  paid_at?: string
  tracking_code?: string
  tracking_url?: string
  shipped_at?: string
  delivered_at?: string
  customer_notes?: string
  created_at: string
  updated_at: string
  items?: OrderItem[]
}

export interface CreateOrderData {
  items: Array<{
    product_id: string
    quantity: number
    unit_price: number
    product_name: string
    product_slug?: string
    product_image?: string
  }>
  shipping_address: {
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    zipcode: string
    recipient_name: string
  }
  shipping_method: string
  shipping_price: number
  shipping_deadline?: string
  subtotal: number
  discount?: number
  total: number
  coupon_code?: string
  coupon_discount?: number
  customer_notes?: string
}

export interface ProcessPaymentData {
  order_id: string
  payment_method: 'pix' | 'credit_card'
  token?: string
  installments?: number
  payment_method_id?: string
  issuer_id?: string
  payer_email?: string
}

export interface PaymentResponse {
  payment_id: string
  status: string
  status_detail?: string
  qr_code?: string
  qr_code_base64?: string
  expiration?: string
}

export async function createOrder(accessToken: string, data: CreateOrderData) {
  return api.authRequest<Order>("/api/orders", accessToken, {
    method: "POST",
    body: data,
  })
}

export async function processPayment(accessToken: string, data: ProcessPaymentData) {
  return api.authRequest<PaymentResponse>("/api/orders/payment", accessToken, {
    method: "POST",
    body: data,
  })
}

export async function getOrders(accessToken: string) {
  return api.authRequest<Order[]>("/api/orders", accessToken)
}

export async function getOrder(accessToken: string, orderId: string) {
  return api.authRequest<Order>(`/api/orders/${orderId}`, accessToken)
}

export async function getPaymentStatus(accessToken: string, orderId: string) {
  return api.authRequest<{ payment_status: string; order_status: string }>(
    `/api/orders/${orderId}/payment-status`, 
    accessToken
  )
}

// ===== CUPONS =====

export interface CouponValidationResult {
  valid: boolean
  coupon: {
    id: string
    code: string
    description: string
    discount_type: "percentage" | "fixed"
    discount_value: number
    max_discount_value: number | null
  }
  discount_amount: number
}

export async function validateCoupon(
  accessToken: string, 
  code: string, 
  orderTotal: number
): Promise<CouponValidationResult> {
  const response = await fetch(`${API_URL}/api/coupons/validate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ code, order_total: orderTotal }),
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error || "Erro ao validar cupom")
  }

  return result
}
