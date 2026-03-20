"use client"

import { useState, useEffect } from "react"
import { AdminShell } from "@/components/admin/admin-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Plus, Pencil, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getAdminCategories, createCategory, updateCategory, type Category } from "@/lib/api"

export default function CategoriesPage() {
  const { accessToken } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    is_active: true,
    sort_order: "0",
  })

  const fetchCategories = async () => {
    if (!accessToken) return
    try {
      const data = await getAdminCategories(accessToken)
      if (data.data) {
        setCategories(data.data)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
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

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        is_active: category.is_active,
        sort_order: category.sort_order.toString(),
      })
    } else {
      setEditingCategory(null)
      setFormData({
        name: "",
        slug: "",
        description: "",
        is_active: true,
        sort_order: "0",
      })
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!accessToken) return
    setIsSaving(true)

    try {
      const payload = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || undefined,
        is_active: formData.is_active,
        sort_order: parseInt(formData.sort_order) || 0,
      }

      if (editingCategory) {
        await updateCategory(accessToken, editingCategory.id, payload)
      } else {
        await createCategory(accessToken, payload)
      }
      
      fetchCategories()
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error saving category:", error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Categorias</h1>
            <p className="text-muted-foreground">
              Gerencie as categorias dos produtos
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Categoria
          </Button>
        </div>

        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Ordem</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                  </TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Nenhuma categoria encontrada
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                    <TableCell>{category.sort_order}</TableCell>
                    <TableCell>
                      <Badge variant={category.is_active ? "default" : "secondary"}>
                        {category.is_active ? "Ativa" : "Inativa"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(category)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Editar Categoria" : "Nova Categoria"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <FieldGroup className="py-4">
                <Field>
                  <FieldLabel htmlFor="name">Nome *</FieldLabel>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value
                      setFormData((prev) => ({
                        ...prev,
                        name,
                        slug: editingCategory ? prev.slug : generateSlug(name),
                      }))
                    }}
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="slug">Slug *</FieldLabel>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, slug: e.target.value }))
                    }
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="description">Descricao</FieldLabel>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="sort_order">Ordem de Exibicao</FieldLabel>
                  <Input
                    id="sort_order"
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, sort_order: e.target.value }))
                    }
                  />
                </Field>

                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="is_active">Categoria Ativa</FieldLabel>
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, is_active: checked }))
                    }
                  />
                </div>
              </FieldGroup>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminShell>
  )
}
