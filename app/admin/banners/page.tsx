"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  Plus, 
  Pencil, 
  Trash2, 
  GripVertical,
  Eye,
  EyeOff,
  Loader2,
  Image as ImageIcon,
  ExternalLink,
  Calendar
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AdminShell } from "@/components/admin/admin-shell"
import { useAuth } from "@/contexts/auth-context"
import { 
  getAdminBanners, 
  toggleBanner, 
  deleteBanner,
  reorderBanners,
  type Banner 
} from "@/lib/api"

export default function AdminBannersPage() {
  const { accessToken } = useAuth()
  const [banners, setBanners] = useState<Banner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (accessToken) {
      loadBanners()
    }
  }, [accessToken])

  async function loadBanners() {
    if (!accessToken) return
    try {
      setIsLoading(true)
      const response = await getAdminBanners(accessToken)
      if (response.data) {
        setBanners(response.data)
      }
    } catch (error) {
      console.error("Error loading banners:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleToggle(id: string) {
    if (!accessToken) return
    try {
      const response = await toggleBanner(accessToken, id)
      if (response.data) {
        setBanners(prev => prev.map(b => b.id === id ? response.data! : b))
      }
    } catch (error) {
      console.error("Error toggling banner:", error)
    }
  }

  async function handleDelete() {
    if (!accessToken || !deleteId) return
    try {
      setIsDeleting(true)
      await deleteBanner(accessToken, deleteId)
      setBanners(prev => prev.filter(b => b.id !== deleteId))
      setDeleteId(null)
    } catch (error) {
      console.error("Error deleting banner:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  function formatDate(date?: string) {
    if (!date) return "-"
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  function getBannerStatus(banner: Banner) {
    if (!banner.is_active) return { label: "Inativo", color: "bg-muted text-muted-foreground" }
    
    const now = new Date()
    if (banner.starts_at && new Date(banner.starts_at) > now) {
      return { label: "Agendado", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" }
    }
    if (banner.ends_at && new Date(banner.ends_at) < now) {
      return { label: "Expirado", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" }
    }
    return { label: "Ativo", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" }
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Banners</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie os banners promocionais da página inicial
            </p>
          </div>
          <Link href="/admin/banners/novo">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Banner
            </Button>
          </Link>
        </div>

        {/* Lista */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : banners.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-8">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">Nenhum banner</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Crie seu primeiro banner promocional
              </p>
              <Link href="/admin/banners/novo">
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Criar Banner
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {banners.map((banner, index) => {
                const status = getBannerStatus(banner)
                return (
                  <div 
                    key={banner.id} 
                    className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
                  >
                    {/* Drag handle */}
                    <div className="text-muted-foreground cursor-grab">
                      <GripVertical className="h-5 w-5" />
                    </div>

                    {/* Preview */}
                    <div 
                      className={`w-24 h-14 rounded-lg flex items-center justify-center shrink-0 ${banner.bg_color || 'bg-muted'}`}
                    >
                      {banner.image_url ? (
                        <img 
                          src={banner.image_url} 
                          alt="" 
                          className="h-full w-full object-cover rounded-lg"
                        />
                      ) : (
                        <span className="text-[8px] font-bold text-foreground/70 text-center leading-tight px-1">
                          {banner.title}<br/>{banner.subtitle}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-foreground truncate">
                          {banner.title} {banner.subtitle}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {banner.description} <span className="text-primary font-medium">{banner.highlight}</span>
                      </p>
                      {(banner.starts_at || banner.ends_at) && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {formatDate(banner.starts_at)} - {formatDate(banner.ends_at)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Preço */}
                    {banner.price_value && (
                      <div className="text-right hidden sm:block">
                        <span className="text-xs text-muted-foreground">{banner.price_label}</span>
                        <p className="text-lg font-bold text-foreground">
                          R$ {banner.price_value}<span className="text-sm">{banner.price_cents}</span>
                        </p>
                      </div>
                    )}

                    {/* Ações */}
                    <div className="flex items-center gap-2">
                      {banner.link_url && (
                        <Link href={banner.link_url} target="_blank">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                      
                      <Switch
                        checked={banner.is_active}
                        onCheckedChange={() => handleToggle(banner.id)}
                      />

                      <Link href={`/admin/banners/${banner.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>

                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(banner.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Dialog de confirmação */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir banner?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O banner será permanentemente removido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminShell>
  )
}
