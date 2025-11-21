'use client'

import { useState, useEffect } from 'react'
import { Loader2, Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import type { SiteConfig } from '@/lib/types/database'

export default function Configuration() {
  const [config, setConfig] = useState<SiteConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [newAttraction, setNewAttraction] = useState({ time: '', title: '', description: '' })
  
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/config')
      const data = await response.json()
      setConfig(data)
    } catch (error) {
      console.error('[v0] Error fetching config:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao buscar configurações',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!config) return

    setSaving(true)
    try {
      const response = await fetch('/api/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })

      if (!response.ok) throw new Error('Failed to save config')

      toast({
        title: 'Sucesso',
        description: 'Configurações salvas',
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao salvar configurações',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField: 'main_page_photos' | 'hero_images' = 'main_page_photos') => {
    const file = e.target.files?.[0]
    if (!file || !config) return

    // Validação de tamanho (6MB)
    const MAX_SIZE_MB = 6
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        toast({
            title: 'Arquivo muito grande',
            description: `A foto deve ter no máximo ${MAX_SIZE_MB}MB.`,
            variant: 'destructive',
        })
        e.target.value = ''
        return
    }

    setUploadingPhoto(true)
    try {
        const fileExt = file.name.split('.').pop()
        const prefix = targetField === 'hero_images' ? 'hero-' : ''
        const fileName = `${prefix}${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
            .from('gifts')
            .upload(fileName, file)

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
            .from('gifts')
            .getPublicUrl(fileName)

        const currentPhotos = config[targetField] || []
        
        // Atualiza o estado correto dependendo do campo alvo
        if (targetField === 'hero_images') {
            setConfig({
                ...config,
                hero_images: [...(currentPhotos as string[]), urlData.publicUrl],
            })
        } else {
            setConfig({
                ...config,
                main_page_photos: [...(currentPhotos as string[]), urlData.publicUrl],
            })
        }
        
        toast({
            title: 'Sucesso',
            description: 'Foto adicionada com sucesso',
        })
    } catch (error: any) {
        console.error('[v0] Upload error:', error)
        toast({
            title: 'Erro',
            description: error.message || 'Erro ao fazer upload da foto',
            variant: 'destructive',
        })
    } finally {
        setUploadingPhoto(false)
        e.target.value = ''
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!config) return null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Configurações do Site</h2>
        <p className="text-muted-foreground">Gerenciar informações gerais e de pagamento</p>
      </div>

      <Card className="p-6 space-y-6">
        {/* Couple Info */}
        <div>
          <h3 className="text-lg font-bold mb-4">Informações dos Noivos</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="couple_name">Nome do Casal</Label>
              <Input
                id="couple_name"
                value={config.couple_name || ''}
                onChange={(e) =>
                  setConfig({ ...config, couple_name: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="wedding_date">Data do Casamento</Label>
              <Input
                id="wedding_date"
                type="date"
                value={config.wedding_date || ''}
                onChange={(e) =>
                  setConfig({ ...config, wedding_date: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="ceremony_time">Horário da Cerimônia</Label>
              <Input
                id="ceremony_time"
                type="text"
                placeholder="Ex: 17:00 - Entrada dos noivos"
                value={config.ceremony_time || ''}
                onChange={(e) =>
                  setConfig({ ...config, ceremony_time: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="reception_time">Horário da Recepção</Label>
              <Input
                id="reception_time"
                type="text"
                placeholder="Ex: 19:00 - Início"
                value={config.reception_time || ''}
                onChange={(e) =>
                  setConfig({ ...config, reception_time: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="dress_code">Traje Sugerido</Label>
              <Input
                id="dress_code"
                type="text"
                placeholder="Ex: Social - Convidamos você a usar suas melhores roupas..."
                value={config.dress_code || ''}
                onChange={(e) =>
                  setConfig({ ...config, dress_code: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* Venue Info */}
        <div>
          <h3 className="text-lg font-bold mb-4">Informações do Local</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="venue_name">Nome do Local</Label>
              <Input
                id="venue_name"
                value={config.venue_name || ''}
                onChange={(e) =>
                  setConfig({ ...config, venue_name: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="venue_address">Endereço</Label>
              <Input
                id="venue_address"
                value={config.venue_address || ''}
                onChange={(e) =>
                  setConfig({ ...config, venue_address: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="venue_latitude">Latitude</Label>
                <Input
                  id="venue_latitude"
                  type="number"
                  step="0.00000001"
                  value={config.venue_latitude || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      venue_latitude: e.target.value
                        ? parseFloat(e.target.value)
                        : null,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="venue_longitude">Longitude</Label>
                <Input
                  id="venue_longitude"
                  type="number"
                  step="0.00000001"
                  value={config.venue_longitude || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      venue_longitude: e.target.value
                        ? parseFloat(e.target.value)
                        : null,
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Hero Images (Carrossel de Fundo) */}
        <div>
          <h3 className="text-lg font-bold mb-4">Imagens de Fundo (Topo do Site)</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="hero_upload">Adicionar Imagem de Fundo</Label>
              <Input
                id="hero_upload"
                type="file"
                accept="image/*"
                onChange={(e) => handlePhotoUpload(e, 'hero_images')}
                disabled={uploadingPhoto}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {config.hero_images?.map((photo, index) => (
                <div key={index} className="relative group">
                  <img src={photo} alt="Hero" className="w-full h-24 object-cover rounded" />
                  <button
                    type="button"
                    onClick={() => {
                      const newImages = config.hero_images?.filter((_, i) => i !== index) || []
                      setConfig({ ...config, hero_images: newImages })
                    }}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Atrações */}
        <div>
          <h3 className="text-lg font-bold mb-4">Atrações e Cronograma</h3>
          <div className="space-y-4 mb-4 p-4 border rounded-lg">
            <h4 className="font-medium text-sm">Adicionar Nova Atração</h4>
            <div className="grid grid-cols-2 gap-2">
                <Input 
                    placeholder="Horário (ex: 22:00)" 
                    value={newAttraction.time} 
                    onChange={e => setNewAttraction({...newAttraction, time: e.target.value})}
                />
                <Input 
                    placeholder="Título (ex: Banda X)" 
                    value={newAttraction.title} 
                    onChange={e => setNewAttraction({...newAttraction, title: e.target.value})}
                />
                <Input 
                    className="col-span-2"
                    placeholder="Descrição (opcional)" 
                    value={newAttraction.description} 
                    onChange={e => setNewAttraction({...newAttraction, description: e.target.value})}
                />
            </div>
            <Button 
                type="button" 
                size="sm" 
                onClick={() => {
                    if(!newAttraction.title) return;
                    const attraction = { ...newAttraction, id: Date.now().toString() }
                    setConfig({
                        ...config,
                        attractions: [...(config.attractions || []), attraction]
                    })
                    setNewAttraction({ time: '', title: '', description: '' })
                }}
            >
                <Plus className="w-4 h-4 mr-2" /> Adicionar
            </Button>
          </div>

          <div className="space-y-2">
            {config.attractions?.map((attr, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-md">
                    <div>
                        <span className="font-bold text-primary mr-2">{attr.time}</span>
                        <span className="font-semibold">{attr.title}</span>
                        {attr.description && <p className="text-xs text-muted-foreground">{attr.description}</p>}
                    </div>
                    <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 text-destructive"
                        onClick={() => {
                            const newAttrs = config.attractions?.filter((_, i) => i !== index) || []
                            setConfig({ ...config, attractions: newAttrs })
                        }}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            ))}
          </div>
        </div>

        {/* Payment Info */}
        <div>
          <h3 className="text-lg font-bold mb-4">Informações de Pagamento</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="mercadopago_token">
                Token de Acesso MercadoPago
              </Label>
              <Input
                id="mercadopago_token"
                type="password"
                value={config.mercadopago_access_token || ''}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    mercadopago_access_token: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </div>

        {/* Email Info */}
        <div>
          <h3 className="text-lg font-bold mb-4">Informações de Email</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="notification_email">Email de Notificações</Label>
              <Input
                id="notification_email"
                type="email"
                value={config.notification_email || ''}
                onChange={(e) =>
                  setConfig({ ...config, notification_email: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div>
          <h3 className="text-lg font-bold mb-4">Informações do Rodapé</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="footer_text">Texto do Rodapé</Label>
              <Input
                id="footer_text"
                type="text"
                placeholder="Ex: Obrigado por fazer parte do nosso dia especial!"
                value={config.footer_text || ''}
                onChange={(e) =>
                  setConfig({ ...config, footer_text: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="footer_email">Email de Contato (Rodapé)</Label>
              <Input
                id="footer_email"
                type="email"
                placeholder="contato@casamento.com"
                value={config.footer_email || ''}
                onChange={(e) =>
                  setConfig({ ...config, footer_email: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="footer_phone">Telefone de Contato (Rodapé)</Label>
              <Input
                id="footer_phone"
                type="text"
                placeholder="(11) 99999-9999"
                value={config.footer_phone || ''}
                onChange={(e) =>
                  setConfig({ ...config, footer_phone: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* Main Page Photos (Galeria Inferior) */}
        <div>
          <h3 className="text-lg font-bold mb-4">Fotos da Galeria (Fim da Página)</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="photo_upload">Adicionar Foto</Label>
              <Input
                id="photo_upload"
                type="file"
                accept="image/*"
                onChange={(e) => handlePhotoUpload(e, 'main_page_photos')}
                disabled={uploadingPhoto}
              />
            </div>

            {config.main_page_photos && config.main_page_photos.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {config.main_page_photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo}
                      alt={`Foto ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newPhotos = config.main_page_photos?.filter(
                          (_, i) => i !== index
                        ) || []
                        setConfig({ ...config, main_page_photos: newPhotos })
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Salvar Configurações
        </Button>
      </Card>
    </div>
  )
}