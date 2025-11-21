'use client'

import { useState, useEffect } from 'react'
import { Loader2, Trash2, Edit, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client' // Importando cliente navegador
import type { Gift } from '@/lib/types/database'

export default function GiftManagement() {
  const [gifts, setGifts] = useState<Gift[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editingGift, setEditingGift] = useState<Gift | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
  })
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient() // Inicializa Supabase no cliente

  useEffect(() => {
    fetchGifts()
  }, [])

  const fetchGifts = async () => {
    try {
      const response = await fetch('/api/gifts')
      const data = await response.json()
      setGifts(data)
    } catch (error) {
      console.error('[v0] Error fetching gifts:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao buscar presentes',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.name || !formData.price) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive',
      })
      return
    }

    try {
      const method = editingGift ? 'PATCH' : 'POST'
      const url = editingGift
        ? `/api/gifts/${editingGift.id}`
        : '/api/gifts'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          image_url: formData.image_url,
        }),
      })

      if (!response.ok) throw new Error('Failed to save gift')

      toast({
        title: 'Sucesso',
        description: editingGift ? 'Presente atualizado' : 'Presente criado',
      })

      setShowDialog(false)
      setEditingGift(null)
      setFormData({ name: '', description: '', price: '', image_url: '' })
      fetchGifts()
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao salvar presente',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este presente?')) return

    try {
      const response = await fetch(`/api/gifts/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete gift')

      toast({
        title: 'Sucesso',
        description: 'Presente deletado',
      })

      setGifts(gifts.filter(g => g.id !== id))
      fetchGifts()
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao deletar presente',
        variant: 'destructive',
      })
    }
  }

  const openNewDialog = () => {
    setEditingGift(null)
    setFormData({ name: '', description: '', price: '', image_url: '' })
    setShowDialog(true)
  }

  const openEditDialog = (gift: Gift) => {
    setEditingGift(gift)
    setFormData({
      name: gift.name,
      description: gift.description || '',
      price: gift.price.toString(),
      image_url: gift.image_url || '',
    })
    setShowDialog(true)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price)
  }

  // Nova função de upload direto para o Supabase
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validação de Tamanho (Limite de 6MB para exemplo, Supabase aguenta até 50MB)
    const MAX_SIZE_MB = 6
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        toast({
            title: 'Arquivo muito grande',
            description: `A imagem deve ter no máximo ${MAX_SIZE_MB}MB.`,
            variant: 'destructive',
        })
        // Limpa o input
        e.target.value = ''
        return
    }

    setUploading(true)
    try {
        // Gera nome único
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        
        // Upload direto (Bypassing Vercel API limit)
        const { error: uploadError } = await supabase.storage
            .from('gifts')
            .upload(fileName, file)

        if (uploadError) throw uploadError

        // Pega URL pública
        const { data: urlData } = supabase.storage
            .from('gifts')
            .getPublicUrl(fileName)

        setFormData({ ...formData, image_url: urlData.publicUrl })
        
        toast({
            title: 'Sucesso',
            description: 'Imagem enviada com sucesso',
        })
    } catch (error: any) {
        console.error('[v0] Upload error:', error)
        toast({
            title: 'Erro no Upload',
            description: error.message || 'Falha ao enviar imagem',
            variant: 'destructive',
        })
    } finally {
        setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Presentes</h2>
          <p className="text-muted-foreground">Total: {gifts.length} presentes</p>
        </div>
        <Button onClick={openNewDialog} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Presente
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gifts.map((gift) => (
                <TableRow key={gift.id}>
                  <TableCell className="font-medium">{gift.name}</TableCell>
                  <TableCell>{formatPrice(gift.price)}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(gift)}
                      className="gap-1"
                    >
                      <Edit className="w-3 h-3" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(gift.id)}
                      className="gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Deletar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingGift ? 'Editar Presente' : 'Novo Presente'}
            </DialogTitle>
            <DialogDescription>
              {editingGift ? 'Atualize as informações do presente' : 'Preencha os dados do novo presente'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="price">Preço (R$)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="image_url">URL da Imagem</Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) =>
                  setFormData({ ...formData, image_url: e.target.value })
                }
                placeholder="URL da imagem ou faça upload abaixo"
              />
            </div>

            <div>
              <Label htmlFor="image_upload">Upload de Imagem (Máx 6MB)</Label>
              <Input
                id="image_upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
              />
              {uploading && (
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Enviando imagem para o servidor...
                </p>
              )}
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDialog(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleSave}>Salvar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}