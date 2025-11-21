'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import type { SiteConfig } from '@/lib/types/database'

export default function Configuration() {
  const [config, setConfig] = useState<SiteConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const { toast } = useToast()

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

        {/* Main Page Photos */}
        <div>
          <h3 className="text-lg font-bold mb-4">Fotos da Página Principal</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="photo_upload">Adicionar Foto</Label>
              <Input
                id="photo_upload"
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return

                  setUploadingPhoto(true)
                  try {
                    const uploadFormData = new FormData()
                    uploadFormData.append('file', file)

                    const response = await fetch('/api/upload', {
                      method: 'POST',
                      body: uploadFormData,
                    })

                    if (!response.ok) {
                      const errorData = await response.json().catch(() => ({}))
                      throw new Error(errorData.message || errorData.error || 'Upload failed')
                    }

                    const data = await response.json()
                    const currentPhotos = config.main_page_photos || []
                    setConfig({
                      ...config,
                      main_page_photos: [...currentPhotos, data.url],
                    })
                    toast({
                      title: 'Sucesso',
                      description: 'Foto adicionada com sucesso',
                    })
                  } catch (error: any) {
                    console.error('[v0] Upload error:', error)
                    const errorMessage = error?.message || 'Erro ao fazer upload da foto'
                    toast({
                      title: 'Erro',
                      description: errorMessage,
                      variant: 'destructive',
                    })
                  } finally {
                    setUploadingPhoto(false)
                  }
                }}
                disabled={uploadingPhoto}
              />
              {uploadingPhoto && (
                <p className="text-sm text-muted-foreground mt-1">
                  Enviando foto...
                </p>
              )}
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
