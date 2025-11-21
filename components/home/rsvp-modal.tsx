'use client'

import { useState } from 'react'
import { Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'

export default function RSVPModal() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    guests_count: '1',
    message: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
        const res = await fetch('/api/rsvp', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(formData)
        })

        if(!res.ok) throw new Error()
        
        setSuccess(true)
        setTimeout(() => {
            setOpen(false)
            setSuccess(false)
            setFormData({ name: '', email: '', phone: '', guests_count: '1', message: '' })
        }, 2000)

    } catch (error) {
        toast({ title: 'Erro', description: 'Tente novamente mais tarde.', variant: 'destructive' })
    } finally {
        setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {/* Removemos as classes fixas grandes para que ele herde o estilo do pai na navegação */}
        <Button className="gap-2 rounded-full font-bold">
          <Check className="w-4 h-4" />
          Confirmar Presença
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirmar Presença</DialogTitle>
          <DialogDescription>
            Estamos ansiosos para celebrar com você!
          </DialogDescription>
        </DialogHeader>

        {success ? (
            <div className="py-10 flex flex-col items-center justify-center text-green-600 animate-fade-in">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Check className="w-8 h-8" />
                </div>
                <p className="text-xl font-bold">Presença Confirmada!</p>
                <p className="text-sm text-muted-foreground">Obrigado.</p>
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                    <Label>Nome Completo *</Label>
                    <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>Telefone</Label>
                        <Input placeholder="(11) 99999-9999" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                    <div>
                        <Label>Total de Pessoas</Label>
                        <Input type="number" min="1" max="10" required value={formData.guests_count} onChange={e => setFormData({...formData, guests_count: e.target.value})} />
                    </div>
                </div>
                <div>
                    <Label>Email (Opcional)</Label>
                    <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div>
                    <Label>Mensagem aos Noivos</Label>
                    <Textarea placeholder="Deixe um recado..." value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Confirmar
                </Button>
            </form>
        )}
      </DialogContent>
    </Dialog>
  )
}