'use client'

import { useState, useEffect } from 'react'
import { Loader2, Trash2, Plus, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField: 'main_page_photos' | 'hero_images') => {
    const file = e.target.files?.[0]
    if (!file || !config) return

    // Validação de tamanho (6MB)
    if (file.size > 6 * 1024 * 1024) {
        toast({
            title: 'Arquivo muito grande',
            description: `A foto deve ter no máximo 6MB.`,
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
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Configurações</h2>
        <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Salvar Tudo
        </Button>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="general">Geral & Hero</TabsTrigger>
            <TabsTrigger value="event">Evento & Atrações</TabsTrigger>
            <TabsTrigger value="emails">E-mails</TabsTrigger>
            <TabsTrigger value="payment">Pagamento</TabsTrigger>
        </TabsList>

        {/* GERAL & HERO */}
        <TabsContent value="general" className="space-y-6">
            <Card className="p-6 space-y-4">
                <h3 className="font-bold">Identidade do Site</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label>Nome do Site (Cabeçalho)</Label>
                        <Input value={config.site_name || ''} onChange={e => setConfig({...config, site_name: e.target.value})} />
                    </div>
                    <div>
                        <Label>Nome do Casal</Label>
                        <Input value={config.couple_name || ''} onChange={e => setConfig({...config, couple_name: e.target.value})} />
                    </div>
                </div>
                
                <h3 className="font-bold pt-4">Chamada Principal (Home)</h3>
                <div>
                    <Label>Título da Mensagem</Label>
                    <Input value={config.cta_title || ''} onChange={e => setConfig({...config, cta_title: e.target.value})} />
                </div>
                <div>
                    <Label>Texto da Mensagem</Label>
                    <Textarea value={config.cta_text || ''} onChange={e => setConfig({...config, cta_text: e.target.value})} />
                </div>

                <h3 className="font-bold pt-4">Imagens de Fundo (Carrossel Principal)</h3>
                <div>
                    <Label>Adicionar Imagem</Label>
                    <Input type="file" accept="image/*" onChange={e => handlePhotoUpload(e, 'hero_images')} disabled={uploadingPhoto} />
                </div>
                <div>
                    <Label>Tempo de Transição do Carrossel (ms)</Label>
                    <Input 
                        type="number" 
                        placeholder="5000" 
                        value={config.hero_interval || ''} 
                        onChange={e => setConfig({...config, hero_interval: parseInt(e.target.value)})} 
                    />
                    <p className="text-xs text-muted-foreground">5000ms = 5 segundos. Padrão é 5000.</p>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                    {config.hero_images?.map((photo, i) => (
                        <div key={i} className="relative group aspect-video">
                            <img src={photo} className="w-full h-full object-cover rounded bg-muted" alt={`Hero ${i}`} />
                            <button 
                                onClick={() => setConfig({...config, hero_images: config.hero_images!.filter((_, idx) => idx !== i)})} 
                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            </Card>
        </TabsContent>

        {/* EVENTO & ATRAÇÕES */}
        <TabsContent value="event" className="space-y-6">
            <Card className="p-6 space-y-4">
                <h3 className="font-bold">Dados do Evento</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><Label>Data</Label><Input type="date" value={config.wedding_date || ''} onChange={e => setConfig({...config, wedding_date: e.target.value})} /></div>
                    
                    {/* Novos Horários */}
                    <div>
                        <Label>Horário: Chegada dos Convidados</Label>
                        <Input 
                            placeholder="Ex: 16:30" 
                            value={config.guests_arrival_time || ''} 
                            onChange={e => setConfig({...config, guests_arrival_time: e.target.value})} 
                        />
                    </div>
                    <div>
                        <Label>Horário: Chegada dos Noivos</Label>
                        <Input 
                            placeholder="Ex: 17:00" 
                            value={config.couple_arrival_time || ''} 
                            onChange={e => setConfig({...config, couple_arrival_time: e.target.value})} 
                        />
                    </div>
                    
                    <div><Label>Traje</Label><Input value={config.dress_code || ''} onChange={e => setConfig({...config, dress_code: e.target.value})} /></div>
                </div>
                <div><Label>Nome do Local</Label><Input value={config.venue_name || ''} onChange={e => setConfig({...config, venue_name: e.target.value})} /></div>
                <div><Label>Endereço</Label><Input value={config.venue_address || ''} onChange={e => setConfig({...config, venue_address: e.target.value})} /></div>
                <div className="grid grid-cols-2 gap-4">
                    <div><Label>Latitude</Label><Input type="number" step="any" value={config.venue_latitude || ''} onChange={e => setConfig({...config, venue_latitude: parseFloat(e.target.value)})} /></div>
                    <div><Label>Longitude</Label><Input type="number" step="any" value={config.venue_longitude || ''} onChange={e => setConfig({...config, venue_longitude: parseFloat(e.target.value)})} /></div>
                </div>

                <h3 className="font-bold pt-4">Atrações</h3>
                <div className="p-4 border rounded space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                        <Input placeholder="Horário" value={newAttraction.time} onChange={e => setNewAttraction({...newAttraction, time: e.target.value})} />
                        <Input placeholder="Título" value={newAttraction.title} onChange={e => setNewAttraction({...newAttraction, title: e.target.value})} />
                        <Input className="col-span-2" placeholder="Descrição" value={newAttraction.description} onChange={e => setNewAttraction({...newAttraction, description: e.target.value})} />
                    </div>
                    <Button size="sm" variant="outline" onClick={() => {
                        if(!newAttraction.title) return;
                        setConfig({ ...config, attractions: [...(config.attractions || []), { ...newAttraction, id: Date.now().toString() }] })
                        setNewAttraction({ time: '', title: '', description: '' })
                    }}><Plus className="w-4 h-4 mr-2" /> Adicionar Atração</Button>
                </div>
                <div className="space-y-2">
                    {config.attractions?.map((attr, i) => (
                        <div key={i} className="flex justify-between items-center p-2 bg-muted rounded">
                            <div className="text-sm"><span className="font-bold">{attr.time}</span> - {attr.title}</div>
                            <button onClick={() => setConfig({...config, attractions: config.attractions!.filter((_, idx) => idx !== i)})} className="text-red-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    ))}
                </div>
            </Card>
        </TabsContent>

        {/* EMAILS */}
        <TabsContent value="emails" className="space-y-6">
            <Card className="p-6 space-y-6">
                <div>
                    <h3 className="font-bold mb-2">E-mail de Código de Acesso (OTP)</h3>
                    <div className="space-y-2">
                        <Label>Assunto</Label>
                        <Input value={config.email_otp_subject || ''} onChange={e => setConfig({...config, email_otp_subject: e.target.value})} />
                        <Label>Mensagem</Label>
                        <Textarea rows={4} value={config.email_otp_content || ''} onChange={e => setConfig({...config, email_otp_content: e.target.value})} />
                        <p className="text-xs text-muted-foreground">Use <strong>{'{code}'}</strong> onde quiser que o código apareça.</p>
                    </div>
                </div>
                <div>
                    <h3 className="font-bold mb-2">E-mail de Confirmação de Presente</h3>
                    <div className="space-y-2">
                        <Label>Assunto</Label>
                        <Input value={config.email_confirmation_subject || ''} onChange={e => setConfig({...config, email_confirmation_subject: e.target.value})} />
                        <Label>Mensagem</Label>
                        <Textarea rows={4} value={config.email_confirmation_content || ''} onChange={e => setConfig({...config, email_confirmation_content: e.target.value})} />
                        <p className="text-xs text-muted-foreground">Use <strong>{'{guest_name}'}</strong>, <strong>{'{gift_name}'}</strong> e <strong>{'{amount}'}</strong> para personalizar.</p>
                    </div>
                </div>
            </Card>
        </TabsContent>

        {/* PAGAMENTO */}
        <TabsContent value="payment" className="space-y-6">
            <Card className="p-6 space-y-4">
                <div>
                    <Label>Token MercadoPago (Produção)</Label>
                    <Input type="password" value={config.mercadopago_access_token || ''} onChange={e => setConfig({...config, mercadopago_access_token: e.target.value})} />
                </div>
                <div>
                    <Label>Email para Notificações (Admin)</Label>
                    <Input value={config.notification_email || ''} onChange={e => setConfig({...config, notification_email: e.target.value})} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    <div><Label>SMTP Host</Label><Input value={config.smtp_host || ''} onChange={e => setConfig({...config, smtp_host: e.target.value})} /></div>
                    <div><Label>SMTP Port</Label><Input type="number" value={config.smtp_port || ''} onChange={e => setConfig({...config, smtp_port: parseInt(e.target.value)})} /></div>
                    <div><Label>SMTP User</Label><Input value={config.smtp_user || ''} onChange={e => setConfig({...config, smtp_user: e.target.value})} /></div>
                    <div><Label>SMTP Password</Label><Input type="password" value={config.smtp_password || ''} onChange={e => setConfig({...config, smtp_password: e.target.value})} /></div>
                </div>
            </Card>
        </TabsContent>

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
      </Tabs>
    </div>
  )
}