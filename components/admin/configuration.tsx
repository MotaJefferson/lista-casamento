'use client'

import { useState, useEffect } from 'react'
import { Loader2, Trash2, Plus, Save, LayoutDashboard, CalendarHeart, Mail, CreditCard, Camera } from 'lucide-react'
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
      console.error('Error:', error)
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
      if (!response.ok) throw new Error('Failed')
      
      toast({
        title: 'Configurações Salvas!',
        description: 'Todas as alterações foram aplicadas com sucesso.',
        className: "bg-green-600 text-white border-none"
      })
    } catch (error) {
      toast({ title: 'Erro', description: 'Erro ao salvar', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  // ... (Mantenha a função handlePhotoUpload igual ao anterior) ...
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField: 'main_page_photos' | 'hero_images') => {
    const file = e.target.files?.[0]
    if (!file || !config) return
    if (file.size > 6 * 1024 * 1024) {
        toast({ title: 'Arquivo muito grande', description: 'Máximo 6MB', variant: 'destructive' })
        e.target.value = ''
        return
    }
    setUploadingPhoto(true)
    try {
        const fileExt = file.name.split('.').pop()
        const prefix = targetField === 'hero_images' ? 'hero-' : ''
        const fileName = `${prefix}${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage.from('gifts').upload(fileName, file)
        if (uploadError) throw uploadError
        const { data: urlData } = supabase.storage.from('gifts').getPublicUrl(fileName)
        const currentList = config[targetField] || []
        setConfig({ ...config, [targetField]: [...currentList, urlData.publicUrl] })
        toast({ title: 'Foto Adicionada!', className: "bg-green-600 text-white border-none" })
    } catch (error: any) {
        toast({ title: 'Erro', description: 'Falha no upload', variant: 'destructive' })
    } finally {
        setUploadingPhoto(false)
        e.target.value = ''
    }
  }

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
  if (!config) return null

  return (
    <div className="flex flex-col md:flex-row gap-6 pb-20">
      <Tabs defaultValue="general" orientation="vertical" className="w-full flex flex-col md:flex-row gap-6">
        
        {/* Menu Lateral Mais Organizado */}
        <TabsList className="flex flex-row md:flex-col h-auto md:w-64 justify-start bg-transparent p-0 gap-2">
            <div className="w-full text-left px-4 py-2 text-sm font-bold text-muted-foreground uppercase tracking-wider hidden md:block">Menu</div>
            <TabsTrigger value="general" className="w-full justify-start gap-2 px-4 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                <LayoutDashboard className="w-4 h-4" /> Geral
            </TabsTrigger>
            <TabsTrigger value="event" className="w-full justify-start gap-2 px-4 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                <CalendarHeart className="w-4 h-4" /> Evento
            </TabsTrigger>
            <TabsTrigger value="gallery" className="w-full justify-start gap-2 px-4 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                <Camera className="w-4 h-4" /> Galeria
            </TabsTrigger>
            <TabsTrigger value="emails" className="w-full justify-start gap-2 px-4 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                <Mail className="w-4 h-4" /> E-mails
            </TabsTrigger>
            <TabsTrigger value="payment" className="w-full justify-start gap-2 px-4 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
                <CreditCard className="w-4 h-4" /> Pagamento
            </TabsTrigger>
            
            <Button onClick={handleSave} disabled={saving} className="mt-4 w-full gap-2 bg-green-600 hover:bg-green-700 text-white">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Salvar Tudo
            </Button>
        </TabsList>

        <div className="flex-1 space-y-6">
            
            {/* ABA GERAL */}
            <TabsContent value="general" className="m-0">
                <Card className="p-6 space-y-6">
                    <div>
                        <h3 className="text-lg font-bold mb-4 border-b pb-2">Identidade</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><Label>Nome do Site</Label><Input value={config.site_name || ''} onChange={e => setConfig({...config, site_name: e.target.value})} /></div>
                            <div><Label>Nome do Casal</Label><Input value={config.couple_name || ''} onChange={e => setConfig({...config, couple_name: e.target.value})} /></div>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold mb-4 border-b pb-2">Banner Principal</h3>
                        <Label>Título</Label><Input className="mb-2" value={config.cta_title || ''} onChange={e => setConfig({...config, cta_title: e.target.value})} />
                        <Label>Texto</Label><Textarea value={config.cta_text || ''} onChange={e => setConfig({...config, cta_text: e.target.value})} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold mb-4 border-b pb-2">Rodapé</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><Label>Texto</Label><Input value={config.footer_text || ''} onChange={e => setConfig({...config, footer_text: e.target.value})} /></div>
                            <div><Label>Email Contato</Label><Input value={config.footer_email || ''} onChange={e => setConfig({...config, footer_email: e.target.value})} /></div>
                            <div><Label>Telefone</Label><Input value={config.footer_phone || ''} onChange={e => setConfig({...config, footer_phone: e.target.value})} /></div>
                        </div>
                    </div>
                </Card>
            </TabsContent>

            {/* ABA EVENTO */}
            <TabsContent value="event" className="m-0">
                <Card className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><Label>Data</Label><Input type="date" value={config.wedding_date || ''} onChange={e => setConfig({...config, wedding_date: e.target.value})} /></div>
                        <div><Label>Traje</Label><Input value={config.dress_code || ''} onChange={e => setConfig({...config, dress_code: e.target.value})} /></div>
                        <div><Label>Chegada Convidados</Label><Input value={config.guests_arrival_time || ''} onChange={e => setConfig({...config, guests_arrival_time: e.target.value})} /></div>
                        <div><Label>Entrada Noivos</Label><Input value={config.couple_arrival_time || ''} onChange={e => setConfig({...config, couple_arrival_time: e.target.value})} /></div>
                    </div>
                    
                    <div className="pt-4 border-t">
                        <h4 className="font-bold mb-2">Local</h4>
                        <div className="grid grid-cols-1 gap-2">
                            <Input placeholder="Nome do Local" value={config.venue_name || ''} onChange={e => setConfig({...config, venue_name: e.target.value})} />
                            <Input placeholder="Endereço" value={config.venue_address || ''} onChange={e => setConfig({...config, venue_address: e.target.value})} />
                            <div className="grid grid-cols-2 gap-2">
                                <Input placeholder="Latitude" type="number" step="any" value={config.venue_latitude || ''} onChange={e => setConfig({...config, venue_latitude: parseFloat(e.target.value)})} />
                                <Input placeholder="Longitude" type="number" step="any" value={config.venue_longitude || ''} onChange={e => setConfig({...config, venue_longitude: parseFloat(e.target.value)})} />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t">
                        <h4 className="font-bold mb-2">Card de Bebidas (Novo)</h4>
                        <div className="space-y-2">
                            <Label>Título</Label>
                            <Input value={config.drinks_title || ''} onChange={e => setConfig({...config, drinks_title: e.target.value})} />
                            <Label>Descrição</Label>
                            <Textarea value={config.drinks_description || ''} onChange={e => setConfig({...config, drinks_description: e.target.value})} />
                        </div>
                    </div>

                    <div className="pt-4 border-t">
                        <h4 className="font-bold mb-2">Atrações</h4>
                        <div className="flex gap-2 mb-2">
                            <Input placeholder="Horário" className="w-24" value={newAttraction.time} onChange={e => setNewAttraction({...newAttraction, time: e.target.value})} />
                            <Input placeholder="Título" className="flex-1" value={newAttraction.title} onChange={e => setNewAttraction({...newAttraction, title: e.target.value})} />
                            <Input placeholder="Desc." className="flex-1" value={newAttraction.description} onChange={e => setNewAttraction({...newAttraction, description: e.target.value})} />
                            <Button size="icon" onClick={() => {
                                if(!newAttraction.title) return;
                                setConfig({ ...config, attractions: [...(config.attractions || []), { ...newAttraction, id: Date.now().toString() }] })
                                setNewAttraction({ time: '', title: '', description: '' })
                            }}><Plus className="w-4 h-4" /></Button>
                        </div>
                        <div className="space-y-1">
                            {config.attractions?.map((attr, i) => (
                                <div key={i} className="flex justify-between items-center p-2 bg-muted rounded text-sm">
                                    <span><strong>{attr.time}</strong> - {attr.title}</span>
                                    <button onClick={() => setConfig({...config, attractions: config.attractions!.filter((_, idx) => idx !== i)})} className="text-red-500"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </TabsContent>

            {/* ABA GALERIA (Corrigido: Fotos agora ficam separadas) */}
            <TabsContent value="gallery" className="m-0">
                <Card className="p-6 space-y-8">
                    <div>
                        <h3 className="text-lg font-bold mb-4">Topo do Site (Hero)</h3>
                        <div className="flex gap-4 items-end mb-4">
                            <div className="flex-1">
                                <Label>Tempo de Transição (ms)</Label>
                                <Input type="number" value={config.hero_interval || 5000} onChange={e => setConfig({...config, hero_interval: parseInt(e.target.value)})} />
                            </div>
                            <div className="flex-1">
                                <Label>Adicionar Imagem</Label>
                                <Input type="file" accept="image/*" onChange={e => handlePhotoUpload(e, 'hero_images')} disabled={uploadingPhoto} />
                            </div>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {config.hero_images?.map((photo, i) => (
                                <div key={i} className="relative group aspect-video bg-muted rounded overflow-hidden">
                                    <img src={photo} className="w-full h-full object-cover" />
                                    <button onClick={() => setConfig({...config, hero_images: config.hero_images!.filter((_, idx) => idx !== i)})} className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3 h-3" /></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-t pt-6">
                        <h3 className="text-lg font-bold mb-4">Galeria Inferior</h3>
                        <div className="mb-4">
                            <Label>Adicionar Foto</Label>
                            <Input type="file" accept="image/*" onChange={e => handlePhotoUpload(e, 'main_page_photos')} disabled={uploadingPhoto} />
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {config.main_page_photos?.map((photo, i) => (
                                <div key={i} className="relative group aspect-square bg-muted rounded overflow-hidden">
                                    <img src={photo} className="w-full h-full object-cover" />
                                    <button onClick={() => setConfig({...config, main_page_photos: config.main_page_photos!.filter((_, idx) => idx !== i)})} className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3 h-3" /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </TabsContent>

            {/* ABA EMAILS */}
            <TabsContent value="emails" className="m-0">
                <Card className="p-6 space-y-6">
                    <div className="bg-blue-50 p-4 rounded text-sm text-blue-800 mb-4">
                        <strong>Dica:</strong> Você pode usar HTML básico para formatar os e-mails (negrito, cores, quebras de linha).
                    </div>

                    <div>
                        <h3 className="font-bold mb-2 flex items-center gap-2"><Mail className="w-4 h-4" /> Confirmação de Presença (RSVP)</h3>
                        <div className="space-y-2">
                            <Label>Assunto</Label>
                            <Input value={config.email_rsvp_subject || ''} onChange={e => setConfig({...config, email_rsvp_subject: e.target.value})} />
                            <Label>Conteúdo (HTML)</Label>
                            <Textarea rows={5} value={config.email_rsvp_content || ''} onChange={e => setConfig({...config, email_rsvp_content: e.target.value})} />
                            <p className="text-xs text-muted-foreground">Variáveis: {'{name}'}, {'{guests}'}</p>
                        </div>
                    </div>

                    <div className="border-t pt-6">
                        <h3 className="font-bold mb-2 flex items-center gap-2"><Gift className="w-4 h-4" /> Agradecimento de Presente</h3>
                        <div className="space-y-2">
                            <Label>Assunto</Label>
                            <Input value={config.email_confirmation_subject || ''} onChange={e => setConfig({...config, email_confirmation_subject: e.target.value})} />
                            <Label>Conteúdo (HTML)</Label>
                            <Textarea rows={5} value={config.email_confirmation_content || ''} onChange={e => setConfig({...config, email_confirmation_content: e.target.value})} />
                            <p className="text-xs text-muted-foreground">Variáveis: {'{guest_name}'}, {'{gift_name}'}, {'{amount}'}</p>
                        </div>
                    </div>
                </Card>
            </TabsContent>

            {/* ABA PAGAMENTO */}
            <TabsContent value="payment" className="m-0">
                <Card className="p-6 space-y-4">
                    <Label>Token MercadoPago</Label>
                    <Input type="password" value={config.mercadopago_access_token || ''} onChange={e => setConfig({...config, mercadopago_access_token: e.target.value})} />
                    
                    <Label>Email Admin</Label>
                    <Input value={config.notification_email || ''} onChange={e => setConfig({...config, notification_email: e.target.value})} />
                    
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div><Label>SMTP Host</Label><Input value={config.smtp_host || ''} onChange={e => setConfig({...config, smtp_host: e.target.value})} /></div>
                        <div><Label>SMTP Port</Label><Input type="number" value={config.smtp_port || ''} onChange={e => setConfig({...config, smtp_port: parseInt(e.target.value)})} /></div>
                        <div><Label>SMTP User</Label><Input value={config.smtp_user || ''} onChange={e => setConfig({...config, smtp_user: e.target.value})} /></div>
                        <div><Label>SMTP Pass</Label><Input type="password" value={config.smtp_password || ''} onChange={e => setConfig({...config, smtp_password: e.target.value})} /></div>
                    </div>
                </Card>
            </TabsContent>

        </div>
      </Tabs>
    </div>
  )
}