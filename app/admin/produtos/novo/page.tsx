"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { AdminShell } from "@/components/admin/admin-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Loader2, Save, Upload, Link as LinkIcon, X, ImagePlus } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getAdminCategories, createProduct, uploadImage, type Category } from "@/lib/api"

export default function NewProductPage() {
  const router = useRouter()
  const { accessToken } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState("")
  const [imageTab, setImageTab] = useState<"upload" | "url">("upload")

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    short_description: "",
    price: "",
    original_price: "",
    sku: "",
    stock_quantity: "0",
    category_id: "",
    images: [] as string[],
    is_active: true,
    is_featured: false,
    tags: "",
  })

  const [imageUrl, setImageUrl] = useState("")

  useEffect(() => {
    const fetchCategories = async () => {
      if (!accessToken) return
      try {
        const data = await getAdminCategories(accessToken)
        if (data.data) {
          setCategories(data.data)
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }
    fetchCategories()
  }, [accessToken])

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
  }

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }))
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !accessToken) return

    // Validar tipo
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      setError("Tipo de arquivo nao permitido. Use: JPG, PNG, WebP ou GIF")
      return
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Arquivo muito grande. Maximo: 5MB")
      return
    }

    setIsUploading(true)
    setError("")

    try {
      // Converter para base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      // Fazer upload
      const response = await uploadImage(accessToken, base64, file.name)
      
      if (response.success && response.data) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, response.data!.url],
        }))
      } else {
        setError(response.message || "Erro ao fazer upload")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer upload")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleAddImageUrl = () => {
    if (!imageUrl.trim()) return
    
    // Validar URL basica
    try {
      new URL(imageUrl)
    } catch {
      setError("URL invalida")
      return
    }

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, imageUrl.trim()],
    }))
    setImageUrl("")
  }

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!accessToken) return
    setError("")
    setIsLoading(true)

    try {
      const payload = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || undefined,
        short_description: formData.short_description || undefined,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : undefined,
        sku: formData.sku || undefined,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        category_id: formData.category_id,
        images: formData.images,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()) : [],
      }

      await createProduct(accessToken, payload)
      router.push("/admin/produtos")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar produto")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Novo Produto</h1>
            <p className="text-muted-foreground">
              Adicione um novo produto ao catalogo
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informacoes Basicas</CardTitle>
                </CardHeader>
                <CardContent>
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="name">Nome do Produto *</FieldLabel>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="Ex: Batom Matte Veludo"
                        required
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="slug">Slug (URL)</FieldLabel>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, slug: e.target.value }))
                        }
                        placeholder="batom-matte-veludo"
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="short_description">Descricao Curta</FieldLabel>
                      <Input
                        id="short_description"
                        value={formData.short_description}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            short_description: e.target.value,
                          }))
                        }
                        placeholder="Uma breve descricao do produto"
                        maxLength={500}
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="description">Descricao Completa</FieldLabel>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Descricao detalhada do produto..."
                        rows={4}
                      />
                    </Field>
                  </FieldGroup>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Precos e Estoque</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor="price">Preco (R$) *</FieldLabel>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, price: e.target.value }))
                        }
                        placeholder="0.00"
                        required
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="original_price">Preco Original (R$)</FieldLabel>
                      <Input
                        id="original_price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.original_price}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            original_price: e.target.value,
                          }))
                        }
                        placeholder="0.00"
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="sku">SKU</FieldLabel>
                      <Input
                        id="sku"
                        value={formData.sku}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, sku: e.target.value }))
                        }
                        placeholder="BAT-001"
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="stock_quantity">Quantidade em Estoque</FieldLabel>
                      <Input
                        id="stock_quantity"
                        type="number"
                        min="0"
                        value={formData.stock_quantity}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            stock_quantity: e.target.value,
                          }))
                        }
                      />
                    </Field>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Imagens</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Tabs value={imageTab} onValueChange={(v) => setImageTab(v as "upload" | "url")}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="upload" className="gap-2">
                        <Upload className="h-4 w-4" />
                        Enviar Arquivo
                      </TabsTrigger>
                      <TabsTrigger value="url" className="gap-2">
                        <LinkIcon className="h-4 w-4" />
                        URL da Imagem
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="upload" className="mt-4">
                      <div className="space-y-4">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <div 
                          onClick={() => !isUploading && fileInputRef.current?.click()}
                          className={`
                            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                            transition-colors duration-200
                            ${isUploading 
                              ? "border-muted bg-muted/50 cursor-not-allowed" 
                              : "border-muted-foreground/25 hover:border-primary hover:bg-primary/5"
                            }
                          `}
                        >
                          {isUploading ? (
                            <div className="flex flex-col items-center gap-2">
                              <Loader2 className="h-8 w-8 animate-spin text-primary" />
                              <p className="text-sm text-muted-foreground">Enviando imagem...</p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              <ImagePlus className="h-8 w-8 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">
                                Clique para selecionar ou arraste uma imagem
                              </p>
                              <p className="text-xs text-muted-foreground">
                                JPG, PNG, WebP ou GIF (max 5MB)
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="url" className="mt-4">
                      <div className="flex gap-2">
                        <Input
                          type="url"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          placeholder="https://exemplo.com/imagem.jpg"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              handleAddImageUrl()
                            }
                          }}
                        />
                        <Button type="button" onClick={handleAddImageUrl} variant="secondary">
                          Adicionar
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Preview das imagens */}
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                      {formData.images.map((img, index) => (
                        <div key={index} className="relative group aspect-square">
                          <img
                            src={img}
                            alt={`Imagem ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg border"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg"
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          {index === 0 && (
                            <span className="absolute bottom-2 left-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                              Principal
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Organizacao</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Field>
                    <FieldLabel>Categoria</FieldLabel>
                    <Select
                      value={formData.category_id}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          category_id: value === "none" ? "" : value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sem categoria</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="tags">Tags</FieldLabel>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, tags: e.target.value }))
                      }
                      placeholder="batom, matte, vermelho"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Separe as tags por virgula
                    </p>
                  </Field>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="is_active">Produto Ativo</FieldLabel>
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, is_active: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="is_featured">Destaque</FieldLabel>
                    <Switch
                      id="is_featured"
                      checked={formData.is_featured}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, is_featured: checked }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {error && (
                <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Salvar Produto
              </Button>
            </div>
          </div>
        </form>
      </div>
    </AdminShell>
  )
}
