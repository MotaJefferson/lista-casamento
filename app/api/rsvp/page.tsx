'use client'

import { useState } from 'react'
import { Loader2, Check, CalendarHeart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'

export default function RSVPPage() {
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
        // Não resetamos imediatamente aqui para mostrar a mensagem de sucesso com clareza

    } catch (error) {
        toast({ title: 'Erro', description: 'Tente novamente mais tarde.', variant: 'destructive' })
    } finally {
        setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <main className="flex-1 flex items-center justify-center p-4 pt-28 pb-12">
        <Card className="w-full max-w-lg p-8 shadow-xl border-none bg-white/80 backdrop-blur-md">
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarHeart className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold mb-2 text-primary">Confirmar Presença</h1>
            <p className="text-muted-foreground">
              Ficaremos muito felizes em celebrar este momento com você!
            </p>
          </div>

          {success ? (
            <div className="py-12 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
                    <Check className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Presença Confirmada!</h2>
                <p className="text-muted-foreground mb-8">
                    Obrigado por confirmar. Enviamos os detalhes para o seu e-mail.
                </p>
                <Button 
                    variant="outline" 
                    onClick={() => {
                        setSuccess(false)
                        setFormData({ name: '', email: '', phone: '', guests_count: '1', message: '' })
                    }}
                >
                    Confirmar outra pessoa
                </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo <span className="text-red-500">*</span></Label>
                    <Input 
                        id="name"
                        required 
                        placeholder="Ex: João Silva"
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})} 
                        className="h-11"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input 
                            id="phone"
                            placeholder="(11) 99999-9999" 
                            value={formData.phone} 
                            onChange={e => setFormData({...formData, phone: e.target.value})} 
                            className="h-11"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="guests">Total de Pessoas</Label>
                        <Input 
                            id="guests"
                            type="number" 
                            min="1" 
                            max="10" 
                            required 
                            value={formData.guests_count} 
                            onChange={e => setFormData({...formData, guests_count: e.target.value})} 
                            className="h-11"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">E-mail (Para receber confirmação)</Label>
                    <Input 
                        id="email"
                        type="email" 
                        placeholder="joao@email.com"
                        value={formData.email} 
                        onChange={e => setFormData({...formData, email: e.target.value})} 
                        className="h-11"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="message">Mensagem aos Noivos</Label>
                    <Textarea 
                        id="message"
                        placeholder="Deixe um recado especial..." 
                        value={formData.message} 
                        onChange={e => setFormData({...formData, message: e.target.value})} 
                        rows={4}
                        className="resize-none"
                    />
                </div>

                <Button type="submit" className="w-full h-12 text-lg font-bold rounded-full shadow-lg hover:shadow-xl transition-all mt-4" disabled={loading}>
                    {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : 'Confirmar Minha Presença'}
                </Button>
            </form>
          )}
        </Card>
      </main>
      
      <Footer />
    </div>
  )
}