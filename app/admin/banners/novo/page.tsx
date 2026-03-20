"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  ArrowLeft, 
  Save, 
  Loader2,
  Upload,
  X,
  Eye,
  Plus,
  GripVertical
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { AdminShell } from "@/components/admin/admin-shell"
import { useAuth } from "@/contexts/auth-context"
import { createBanner, uploadImage } from "@/lib/api"

const BG_PRESETS = [
  { name: "Rosa/Pink", value: "bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 dark:from-rose-950/40 dark:via-pink-950/30 dark:to-fuchsia-950/20" },
  { name: "Slate/Neutro", value: "bg-gradient-to-br from-slate-50 via-stone-50 to-neutral-100 dark:from-slate-950/40 dark:via-stone-950/30 dark:to-neutral-950/20" },
  { name: "Amber/Dourado", value: "bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/40 dark:via-yellow-950/30 dark:to-orange-950/20" },
  { name: "Emerald/Verde", value: "bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/40 dark:via-green-950/30 dark:to-teal-950/20" },
  { name: "Sky/Azul", value: "bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 dark:from-sky-950/40 dark:via-blue-950/30 dark:to-indigo-950/20" },
  { name: "Violet/Roxo", value: "bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950/40 dark:via-purple-950/30 dark:to-fuchsia-950/20" },
]

export default function NewBannerPage() {
  const router = useRouter()
  const { accessToken } = useAuth()
  
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    highlight: "",
    disclaimer: "",
    price_label: "a partir de:",
    price_value: "",
    price_cents: ",90",
    installments: "",
    full_price: "",
    bg_color: BG_PRESETS[0].value,
    images: [] as string[],
    link_url: "",
    link_text: "confira",
    is_active: true,
    sort_order: 0,
    starts_at: "",
    ends_at: "",
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState("")
  const [showPreview, setShowPreview] = useState(false)
  const [newImageUrl, setNewImageUrl] = useState("")

  function handleChange(field: string, value: string | boolean | number | string[]) {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  function addImageUrl() {
    if (!newImageUrl.trim()) return
    handleChange("images", [...formData.images, newImageUrl.trim()])
    setNewImageUrl("")
  }

  function removeImage(index: number) {
    const newImages = formData.images.filter((_, i) => i !== index)
    handleChange("images", newImages)
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !accessToken) return

    try {
      setIsUploading(true)
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64 = reader.result as string
        const response = await uploadImage(accessToken, base64, file.name, "banners")
        if (response.data) {
          handleChange("images", [...formData.images, response.data.url])
        }
        setIsUploading(false)
      }
      reader.readAsDataURL(file)
    } catch (err) {
      console.error("Error uploading image:", err)
      setIsUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!accessToken) return

    setIsLoading(true)
    setError("")

    try {
      const data = {
        ...formData,
        starts_at: formData.starts_at || null,
        ends_at: formData.ends_at || null,
      }

      await createBanner(accessToken, data)
      router.push("/admin/banners")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar banner")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AdminShell>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/banners">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Novo Banner</h1>
              <p className="text-sm text-muted-foreground">
                Crie um novo banner promocional
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              type="button" 
              variant="outline" 
              className="gap-2"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="h-4 w-4" />
              Preview
            </Button>
            <Button type="submit" disabled={isLoading} className="gap-2">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Salvar
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Preview */}
        {showPreview && (
          <div className={`rounded-2xl p-6 md:p-8 ${formData.bg_color}`}>
            <div className="flex flex-col items-center gap-8 lg:flex-row lg:justify-between">
              {/* Texto */}
              <div className="text-center lg:text-left lg:max-w-sm shrink-0">
                <h2 className="text-4xl font-black text-primary italic md:text-5xl">
                  {formData.title || "TITULO"}
                </h2>
                <p className="text-3xl font-black text-foreground md:text-4xl">
                  {formData.subtitle || "SUBTITULO"}
                </p>
                <p className="mt-4 text-sm text-muted-foreground">
                  {formData.description || "descricao"}
                </p>
                <p className="text-2xl font-black text-foreground md:text-3xl">
                  {formData.highlight || "destaque"}
                </p>
                <div className="mt-6">
                  <Button className="rounded-full px-8">{formData.link_text || "confira"}</Button>
                </div>
              </div>

              {/* Cards de produtos */}
              {formData.images.length > 0 && (
                <div className="flex items-center justify-center gap-3 md:gap-4">
                  {formData.images.map((imageUrl, index) => (
                    <div 
                      key={index}
                      className="shrink-0 bg-white rounded-2xl shadow-lg p-3 md:p-4"
                    >
                      <img 
                        src={imageUrl} 
                        alt={`Produto ${index + 1}`}
                        className="h-24 w-20 md:h-32 md:w-24 object-contain"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Badge de preco */}
              {formData.price_value && (
                <div className="shrink-0 bg-primary rounded-3xl p-4 text-center text-primary-foreground md:p-6 shadow-xl">
                  <p className="text-xs opacity-90">{formData.price_label}</p>
                  <div className="flex items-start justify-center">
                    <span className="text-lg font-bold md:text-2xl">{formData.price_value}</span>
                    <div className="text-left">
                      <span className="text-sm font-bold md:text-lg">{formData.price_cents}</span>
                      <p className="text-[10px] md:text-xs">cada</p>
                    </div>
                  </div>
                  {formData.installments && (
                    <p className="text-xs mt-1"><span className="font-bold">{formData.installments}</span></p>
                  )}
                  {formData.full_price && (
                    <p className="text-[10px] mt-1 opacity-80">{formData.full_price}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Coluna 1 - Conteúdo */}
          <div className="space-y-6">
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <h2 className="font-semibold text-foreground">Conteudo</h2>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Titulo *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="PROMO"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Subtitulo</label>
                  <Input
                    value={formData.subtitle}
                    onChange={(e) => handleChange("subtitle", e.target.value)}
                    placeholder="DA SEMANA"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Descricao</label>
                <Input
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="descontos exclusivos na categoria:"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Destaque</label>
                <Input
                  value={formData.highlight}
                  onChange={(e) => handleChange("highlight", e.target.value)}
                  placeholder="kits especiais"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Aviso legal</label>
                <Textarea
                  value={formData.disclaimer}
                  onChange={(e) => handleChange("disclaimer", e.target.value)}
                  placeholder="Promocao nao cumulativa..."
                  rows={2}
                />
              </div>
            </div>

            {/* Preço */}
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <h2 className="font-semibold text-foreground">Preco</h2>
              
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Label</label>
                  <Input
                    value={formData.price_label}
                    onChange={(e) => handleChange("price_label", e.target.value)}
                    placeholder="a partir de:"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Valor</label>
                  <Input
                    value={formData.price_value}
                    onChange={(e) => handleChange("price_value", e.target.value)}
                    placeholder="19"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Centavos</label>
                  <Input
                    value={formData.price_cents}
                    onChange={(e) => handleChange("price_cents", e.target.value)}
                    placeholder=",90"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Parcelas</label>
                  <Input
                    value={formData.installments}
                    onChange={(e) => handleChange("installments", e.target.value)}
                    placeholder="6x"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Preco a vista</label>
                  <Input
                    value={formData.full_price}
                    onChange={(e) => handleChange("full_price", e.target.value)}
                    placeholder="ou R$ 119,00 a vista"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Coluna 2 - Visual e Imagens */}
          <div className="space-y-6">
            {/* Imagens dos Produtos */}
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-foreground">Imagens dos Produtos</h2>
                <span className="text-xs text-muted-foreground">{formData.images.length} imagens</span>
              </div>
              
              {/* Lista de imagens */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-4 gap-3">
                  {formData.images.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <div className="bg-white rounded-xl p-2 border border-border shadow-sm">
                        <img 
                          src={imageUrl} 
                          alt={`Produto ${index + 1}`}
                          className="w-full h-20 object-contain"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload de imagem */}
              <div className="space-y-3">
                <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                  {isUploading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      <Upload className="h-5 w-5 text-muted-foreground mb-1" />
                      <span className="text-xs text-muted-foreground">Enviar imagem</span>
                    </>
                  )}
                </label>

                <div className="flex gap-2">
                  <Input
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Ou cole a URL da imagem"
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" size="icon" onClick={addImageUrl}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Visual */}
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <h2 className="font-semibold text-foreground">Cor de Fundo</h2>
              
              <div className="grid grid-cols-3 gap-2">
                {BG_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    className={`h-12 rounded-lg ${preset.value} border-2 transition-all ${
                      formData.bg_color === preset.value 
                        ? "border-primary ring-2 ring-primary/20" 
                        : "border-transparent hover:border-muted-foreground/30"
                    }`}
                    onClick={() => handleChange("bg_color", preset.value)}
                    title={preset.name}
                  />
                ))}
              </div>
            </div>

            {/* Link */}
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <h2 className="font-semibold text-foreground">Link</h2>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">URL destino</label>
                <Input
                  value={formData.link_url}
                  onChange={(e) => handleChange("link_url", e.target.value)}
                  placeholder="/categoria/kits"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Texto do botao</label>
                <Input
                  value={formData.link_text}
                  onChange={(e) => handleChange("link_text", e.target.value)}
                  placeholder="confira"
                />
              </div>
            </div>

            {/* Configurações */}
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <h2 className="font-semibold text-foreground">Configuracoes</h2>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Ativo</p>
                  <p className="text-sm text-muted-foreground">Exibir na pagina inicial</p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleChange("is_active", checked)}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Inicio</label>
                  <Input
                    type="datetime-local"
                    value={formData.starts_at}
                    onChange={(e) => handleChange("starts_at", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Fim</label>
                  <Input
                    type="datetime-local"
                    value={formData.ends_at}
                    onChange={(e) => handleChange("ends_at", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Ordem</label>
                <Input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => handleChange("sort_order", parseInt(e.target.value) || 0)}
                  min={0}
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </AdminShell>
  )
}
